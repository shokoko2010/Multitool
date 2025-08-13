import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CSSMinifierOptions {
  removeComments?: boolean;
  removeWhitespace?: boolean;
  collapseWhitespace?: boolean;
  removeEmptyRulesets?: boolean;
  removeUnusedRules?: boolean;
  mergeMediaQueries?: boolean;
  mergeAdjacentRules?: boolean;
  removeDuplicateRules?: boolean;
  removeDuplicateProperties?: boolean;
  removeEmptyProperties?: boolean;
  shortenColors?: boolean;
  shortenZeroValues?: boolean;
  shortenUnits?: boolean;
  optimizeSelectors?: boolean;
  preserveComments?: boolean;
  preserveLines?: boolean;
  level?: 1 | 2 | 3;
}

interface CSSMinifierResult {
  success: boolean;
  data?: {
    originalCSS: string;
    minifiedCSS: string;
    options: CSSMinifierOptions;
    stats: {
      originalSize: number;
      minifiedSize: number;
      compressionRatio: number;
      savedBytes: number;
      savedPercentage: number;
      rulesCount: number;
      selectorsCount: number;
      propertiesCount: number;
      mediaQueriesCount: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { css, options = {} } = await request.json();

    if (!css) {
      return NextResponse.json<CSSMinifierResult>({
        success: false,
        error: 'CSS content is required'
      }, { status: 400 });
    }

    // Set default options
    const minifierOptions: CSSMinifierOptions = {
      removeComments: options.removeComments !== false,
      removeWhitespace: options.removeWhitespace !== false,
      collapseWhitespace: options.collapseWhitespace !== false,
      removeEmptyRulesets: options.removeEmptyRulesets !== false,
      removeUnusedRules: options.removeUnusedRules || false,
      mergeMediaQueries: options.mergeMediaQueries || false,
      mergeAdjacentRules: options.mergeAdjacentRules || false,
      removeDuplicateRules: options.removeDuplicateRules !== false,
      removeDuplicateProperties: options.removeDuplicateProperties !== false,
      removeEmptyProperties: options.removeEmptyProperties !== false,
      shortenColors: options.shortenColors !== false,
      shortenZeroValues: options.shortenZeroValues !== false,
      shortenUnits: options.shortenUnits !== false,
      optimizeSelectors: options.optimizeSelectors || false,
      preserveComments: options.preserveComments || false,
      preserveLines: options.preserveLines || false,
      level: options.level || 2
    };

    // Minify CSS
    const minifiedCSS = minifyCSS(css, minifierOptions);

    // Calculate statistics
    const stats = calculateCSSStats(css, minifiedCSS);

    const result = {
      originalCSS: css,
      minifiedCSS,
      options: minifierOptions,
      stats
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a CSS optimization expert. Analyze the CSS minification results and provide insights about the optimization effectiveness, potential improvements, and best practices for CSS performance.'
          },
          {
            role: 'user',
            content: `Analyze this CSS minification result:\n\nOriginal Size: ${stats.originalSize} bytes\nMinified Size: ${stats.minifiedSize} bytes\nSaved: ${stats.savedBytes} bytes (${stats.savedPercentage.toFixed(2)}%)\nCompression Ratio: ${stats.compressionRatio.toFixed(3)}\n\nElements:\n- Rules: ${stats.rulesCount}\n- Selectors: ${stats.selectorsCount}\n- Properties: ${stats.propertiesCount}\n- Media Queries: ${stats.mediaQueriesCount}\n\nOptimization Level: ${minifierOptions.level}\nOptions Used: ${JSON.stringify({
              removeComments: minifierOptions.removeComments,
              removeWhitespace: minifierOptions.removeWhitespace,
              shortenColors: minifierOptions.shortenColors,
              mergeMediaQueries: minifierOptions.mergeMediaQueries,
              optimizeSelectors: minifierOptions.optimizeSelectors
            }, null, 2)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<CSSMinifierResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('CSS minification error:', error);
    return NextResponse.json<CSSMinifierResult>({
      success: false,
      error: 'Internal server error during CSS minification'
    }, { status: 500 });
  }
}

function minifyCSS(css: string, options: CSSMinifierOptions): string {
  let minified = css;

  // Remove comments
  if (options.removeComments && !options.preserveComments) {
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Remove whitespace
  if (options.removeWhitespace) {
    minified = minified.replace(/\s+/g, ' ');
  }

  // Collapse whitespace
  if (options.collapseWhitespace) {
    minified = minified.replace(/\s*([{};:,])\s*/g, '$1');
    minified = minified.replace(/;\s*}/g, '}');
  }

  // Remove empty rulesets
  if (options.removeEmptyRulesets) {
    minified = minified.replace(/[^{}]+\{\s*\}/g, '');
  }

  // Remove duplicate rules
  if (options.removeDuplicateRules) {
    minified = removeDuplicateRules(minified);
  }

  // Remove duplicate properties
  if (options.removeDuplicateProperties) {
    minified = removeDuplicateProperties(minified);
  }

  // Remove empty properties
  if (options.removeEmptyProperties) {
    minified = minified.replace(/[^{}]+\{\s*[^}]*;\s*\}/g, (match) => {
      const content = match.match(/\{([^}]*)\}/)?.[1] || '';
      if (content.trim() === '') {
        return '';
      }
      return match;
    });
  }

  // Shorten colors
  if (options.shortenColors) {
    minified = shortenColorValues(minified);
  }

  // Shorten zero values
  if (options.shortenZeroValues) {
    minified = shortenZeroValues(minified);
  }

  // Shorten units
  if (options.shortenUnits) {
    minified = shortenUnits(minified);
  }

  // Optimize selectors
  if (options.optimizeSelectors) {
    minified = optimizeSelectors(minified);
  }

  // Merge media queries
  if (options.mergeMediaQueries) {
    minified = mergeMediaQueries(minified);
  }

  // Merge adjacent rules
  if (options.mergeAdjacentRules) {
    minified = mergeAdjacentRules(minified);
  }

  // Clean up
  if (!options.preserveLines) {
    minified = minified.replace(/\n/g, '');
  }

  // Remove final semicolon
  minified = minified.replace(/;}/g, '}');

  return minified.trim();
}

function removeDuplicateRules(css: string): string {
  const rules = css.match(/[^{}]+\{[^}]*\}/g) || [];
  const uniqueRules = Array.from(new Set(rules));
  return uniqueRules.join('');
}

function removeDuplicateProperties(css: string): string {
  return css.replace(/[^{}]+\{[^}]*\}/g, (rule) => {
    const selector = rule.match(/([^{}]+)\{/)?.[1] || '';
    const properties = rule.match(/\{([^}]*)\}/)?.[1] || '';
    
    const propList = properties.split(';').filter(p => p.trim());
    const uniqueProps = Array.from(new Set(propList.map(p => p.trim().split(':')[0].trim())));
    
    const uniquePropList = uniqueProps.map(prop => {
      const propValue = propList.find(p => p.trim().startsWith(prop + ':'));
      return propValue || '';
    }).filter(p => p);
    
    return selector + '{' + uniquePropList.join(';') + '}';
  });
}

function shortenColorValues(css: string): string {
  // Convert RGB to hex when shorter
  css = css.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
    const hex = '#' + [r, g, b].map(x => {
      const hex = parseInt(x, 10).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    return hex.length < match.length ? hex : match;
  });

  // Shorten hex colors
  css = css.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');

  // Convert color names to hex when shorter
  const colorMap: Record<string, string> = {
    'black': '#000',
    'white': '#fff',
    'red': '#f00',
    'green': '#0f0',
    'blue': '#00f',
    'yellow': '#ff0',
    'cyan': '#0ff',
    'magenta': '#f0f'
  };

  for (const [name, hex] of Object.entries(colorMap)) {
    css = css.replace(new RegExp(`\\b${name}\\b`, 'gi'), hex);
  }

  return css;
}

function shortenZeroValues(css: string): string {
  // Remove units from zero values
  css = css.replace(/(^|[^0-9.])0+(\.\d+)?(px|em|rem|%|in|cm|mm|pt|pc|ex|ch|vw|vh|vmin|vmax)/gi, '$10$2');
  
  // Remove leading zeros
  css = css.replace(/(^|[^0-9.])0+(\d+)/gi, '$1$2');
  
  // Remove trailing zeros in decimals
  css = css.replace(/(\.\d+)0+/gi, '$1');
  
  // Remove decimal point if no fractional part
  css = css.replace(/\.0+\b/g, '');
  
  return css;
}

function shortenUnits(css: string): string {
  // Use shorter units when possible
  css = css.replace(/0\.em/g, '0');
  css = css.replace(/0\.rem/g, '0');
  css = css.replace(/0\.px/g, '0');
  
  return css;
}

function optimizeSelectors(css: string): string {
  // Remove unnecessary universal selectors
  css = css.replace(/\*([.#])/g, '$1');
  
  // Optimize class and ID combinations
  css = css.replace(/\.(\w+)\.(\w+)/g, '.$1$2');
  css = css.replace(/#(\w+)#(\w+)/g, '#$1#$2');
  
  return css;
}

function mergeMediaQueries(css: string): string {
  const mediaQueryRegex = /@media[^{]+\{([\s\S]*?)\}\s*\}/g;
  const mediaQueries: Array<{query: string, rules: string[]}> = [];
  
  // Extract media queries
  css = css.replace(mediaQueryRegex, (match, content) => {
    const query = match.match(/@media[^{]+/)?.[0] || '';
    mediaQueries.push({query, rules: content.match(/[^{}]+\{[^}]*\}/g) || []});
    return '';
  });
  
  // Merge similar media queries
  const mergedQueries: Record<string, string[]> = {};
  mediaQueries.forEach(({query, rules}) => {
    if (!mergedQueries[query]) {
      mergedQueries[query] = [];
    }
    mergedQueries[query].push(...rules);
  });
  
  // Rebuild CSS with merged media queries
  let result = css;
  for (const [query, rules] of Object.entries(mergedQueries)) {
    result += query + '{' + rules.join('') + '}}';
  }
  
  return result;
}

function mergeAdjacentRules(css: string): string {
  const rules = css.match(/([^{}]+)\{([^}]*)\}/g) || [];
  const mergedRules: Record<string, string[]> = {};
  
  rules.forEach(rule => {
    const match = rule.match(/([^{}]+)\{([^}]*)\}/);
    if (match) {
      const [, selector, properties] = match;
      const cleanSelector = selector.trim();
      const cleanProps = properties.trim();
      
      if (!mergedRules[cleanSelector]) {
        mergedRules[cleanSelector] = [];
      }
      mergedRules[cleanSelector].push(cleanProps);
    }
  });
  
  let result = '';
  for (const [selector, propertiesList] of Object.entries(mergedRules)) {
    const allProperties = propertiesList.join(';');
    result += selector + '{' + allProperties + '}';
  }
  
  return result;
}

function calculateCSSStats(originalCSS: string, minifiedCSS: string) {
  const originalSize = originalCSS.length;
  const minifiedSize = minifiedCSS.length;
  const savedBytes = originalSize - minifiedSize;
  const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
  const compressionRatio = originalSize > 0 ? minifiedSize / originalSize : 1;

  // Count elements in original CSS
  const rulesCount = (originalCSS.match(/[^{}]+\{[^}]*\}/g) || []).length;
  const selectorsCount = (originalCSS.match(/[^{}]+(?=\{)/g) || []).length;
  const propertiesCount = (originalCSS.match(/[^:]+:[^;]+;/g) || []).length;
  const mediaQueriesCount = (originalCSS.match(/@media[^{]+\{/g) || []).length;

  return {
    originalSize,
    minifiedSize,
    compressionRatio,
    savedBytes,
    savedPercentage,
    rulesCount,
    selectorsCount,
    propertiesCount,
    mediaQueriesCount
  };
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with CSS content'
  }, { status: 405 });
}