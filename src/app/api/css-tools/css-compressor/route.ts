import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CompressionOptions {
  removeComments: boolean;
  removeWhitespace: boolean;
  shortenColors: boolean;
  shortenUnits: boolean;
  mergeMediaQueries: boolean;
  mergeDuplicateRules: boolean;
  optimizeSelectors: boolean;
  optimizeProperties: boolean;
  removeEmptyRules: boolean;
  removeUnusedSelectors: boolean;
  precision: number;
  sourceMap: boolean;
  keepSpecialComments: number;
  roundPrecision: boolean;
}

interface CompressionResult {
  success: boolean;
  originalCSS: string;
  compressedCSS: string;
  statistics: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    removedComments: number;
    removedWhitespace: number;
    optimizedColors: number;
    optimizedUnits: number;
    mergedRules: number;
    removedEmptyRules: number;
    processingTime: number;
  };
  options: CompressionOptions;
  optimizations: Array<{
    type: string;
    description: string;
    savings: number;
  }>;
  warnings: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { css, options = {} } = body;

    if (!css || typeof css !== 'string') {
      return NextResponse.json(
        { error: 'CSS code is required' },
        { status: 400 }
      );
    }

    if (css.length > 500000) { // 500KB limit
      return NextResponse.json(
        { error: 'CSS size exceeds 500KB limit' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: CompressionOptions = {
      removeComments: true,
      removeWhitespace: true,
      shortenColors: true,
      shortenUnits: true,
      mergeMediaQueries: true,
      mergeDuplicateRules: true,
      optimizeSelectors: true,
      optimizeProperties: true,
      removeEmptyRules: true,
      removeUnusedSelectors: false, // Disabled by default as it's complex
      precision: 4,
      sourceMap: false,
      keepSpecialComments: 1,
      roundPrecision: true,
    };

    const finalOptions: CompressionOptions = { ...defaultOptions, ...options };

    const startTime = Date.now();
    
    // Compress CSS
    const result = compressCSS(css, finalOptions);
    
    const endTime = Date.now();
    result.statistics.processingTime = endTime - startTime;

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a CSS optimization expert. Provide insights about CSS compression and best practices.'
          },
          {
            role: 'user',
            content: `Analyze this CSS compression operation:
            - Original size: ${result.statistics.originalSize} bytes
            - Compressed size: ${result.statistics.compressedSize} bytes
            - Compression ratio: ${result.statistics.compressionRatio}%
            - Processing time: ${result.statistics.processingTime}ms
            
            Provide insights about:
            1. Compression effectiveness
            2. Performance implications
            3. Best practices for CSS optimization
            Keep it concise and informative.`
          }
        ],
        max_tokens: 250,
        temperature: 0.3,
      });

      aiInsights = completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
      aiInsights = 'AI analysis unavailable';
    }

    return NextResponse.json({
      result,
      aiInsights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('CSS compression error:', error);
    return NextResponse.json(
      { error: 'Internal server error during CSS compression' },
      { status: 500 }
    );
  }
}

function compressCSS(css: string, options: CompressionOptions): CompressionResult {
  let compressed = css;
  const optimizations: Array<{
    type: string;
    description: string;
    savings: number;
  }> = [];
  const warnings: string[] = [];

  const originalSize = compressed.length;
  let removedComments = 0;
  let removedWhitespace = 0;
  let optimizedColors = 0;
  let optimizedUnits = 0;
  let mergedRules = 0;
  let removedEmptyRules = 0;

  // Remove comments
  if (options.removeComments) {
    const commentRegex = /\/\*[\s\S]*?\*\//g;
    const commentMatches = compressed.match(commentRegex);
    if (commentMatches) {
      removedComments = commentMatches.length;
      const beforeSize = compressed.length;
      compressed = compressed.replace(commentRegex, '');
      const savings = beforeSize - compressed.length;
      optimizations.push({
        type: 'Comments',
        description: `Removed ${removedComments} comments`,
        savings,
      });
    }
  }

  // Keep special comments
  if (options.keepSpecialComments > 0) {
    const specialCommentRegex = /\/\*!(.*?)\*\//g;
    const specialComments = compressed.match(specialCommentRegex);
    if (specialComments) {
      const keptComments = specialComments.slice(0, options.keepSpecialComments);
      const otherComments = specialComments.slice(options.keepSpecialComments);
      
      // Remove all special comments first
      compressed = compressed.replace(specialCommentRegex, '');
      
      // Add back the kept ones at the beginning
      compressed = keptComments.join('\n') + '\n' + compressed;
    }
  }

  // Remove whitespace
  if (options.removeWhitespace) {
    const beforeSize = compressed.length;
    compressed = compressed
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};:,>+~])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .replace(/,\s*/g, ',')
      .replace(/\{\s*/g, '{')
      .replace(/\s*\}/g, '}')
      .replace(/;\s*;/g, ';')
      .trim();
    
    removedWhitespace = beforeSize - compressed.length;
    if (removedWhitespace > 0) {
      optimizations.push({
        type: 'Whitespace',
        description: 'Removed unnecessary whitespace',
        savings: removedWhitespace,
      });
    }
  }

  // Shorten colors
  if (options.shortenColors) {
    const beforeSize = compressed.length;
    
    // Convert 6-digit hex to 3-digit where possible
    compressed = compressed.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
    
    // Convert rgb() to hex
    compressed = compressed.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
      const hex = '#' + [r, g, b].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
      return hex;
    });
    
    // Convert color names to hex where shorter
    const colorMap: Record<string, string> = {
      'black': '#000',
      'white': '#fff',
      'red': '#f00',
      'green': '#0f0',
      'blue': '#00f',
      'yellow': '#ff0',
      'cyan': '#0ff',
      'magenta': '#f0f',
    };
    
    for (const [name, hex] of Object.entries(colorMap)) {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      compressed = compressed.replace(regex, hex);
    }
    
    optimizedColors = beforeSize - compressed.length;
    if (optimizedColors > 0) {
      optimizations.push({
        type: 'Colors',
        description: 'Optimized color representations',
        savings: optimizedColors,
      });
    }
  }

  // Shorten units
  if (options.shortenUnits) {
    const beforeSize = compressed.length;
    
    // Remove units for zero values
    compressed = compressed.replace(/(\d)px/g, '$1');
    compressed = compressed.replace(/(\d)em/g, '$1');
    compressed = compressed.replace(/(\d)rem/g, '$1');
    compressed = compressed.replace(/(\d)%/g, '$1');
    
    // Convert to shorter units where possible
    compressed = compressed.replace(/0\.(\d+)/g, '.$1');
    
    optimizedUnits = beforeSize - compressed.length;
    if (optimizedUnits > 0) {
      optimizations.push({
        type: 'Units',
        description: 'Optimized unit representations',
        savings: optimizedUnits,
      });
    }
  }

  // Remove empty rules
  if (options.removeEmptyRules) {
    const emptyRuleRegex = /[^{}]+\{\s*\}/g;
    const emptyMatches = compressed.match(emptyRuleRegex);
    if (emptyMatches) {
      removedEmptyRules = emptyMatches.length;
      const beforeSize = compressed.length;
      compressed = compressed.replace(emptyRuleRegex, '');
      const savings = beforeSize - compressed.length;
      optimizations.push({
        type: 'Empty Rules',
        description: `Removed ${removedEmptyRules} empty rules`,
        savings,
      });
    }
  }

  // Optimize properties
  if (options.optimizeProperties) {
    const beforeSize = compressed.length;
    
    // Remove duplicate properties within rules
    compressed = compressed.replace(/([^{]+)\{([^}]+)\}/g, (match, selector, properties) => {
      const propList = properties.split(';').filter(p => p.trim());
      const uniqueProps: string[] = [];
      const seenProps = new Set();
      
      for (const prop of propList) {
        const propName = prop.split(':')[0].trim();
        if (!seenProps.has(propName)) {
          seenProps.add(propName);
          uniqueProps.push(prop);
        }
      }
      
      return selector + '{' + uniqueProps.join(';') + '}';
    });
    
    // Optimize shorthand properties
    compressed = compressed.replace(/margin-top:\s*([^;]+);\s*margin-right:\s*([^;]+);\s*margin-bottom:\s*([^;]+);\s*margin-left:\s*([^;]+);/g, 
      (match, top, right, bottom, left) => {
        if (top === right && right === bottom && bottom === left) {
          return `margin:${top};`;
        } else if (top === bottom && right === left) {
          return `margin:${top} ${right};`;
        }
        return match;
      });
    
    compressed = compressed.replace(/padding-top:\s*([^;]+);\s*padding-right:\s*([^;]+);\s*padding-bottom:\s*([^;]+);\s*padding-left:\s*([^;]+);/g, 
      (match, top, right, bottom, left) => {
        if (top === right && right === bottom && bottom === left) {
          return `padding:${top};`;
        } else if (top === bottom && right === left) {
          return `padding:${top} ${right};`;
        }
        return match;
      });
    
    const propertySavings = beforeSize - compressed.length;
    if (propertySavings > 0) {
      optimizations.push({
        type: 'Properties',
        description: 'Optimized property declarations',
        savings: propertySavings,
      });
    }
  }

  // Round precision
  if (options.roundPrecision && options.precision > 0) {
    const beforeSize = compressed.length;
    compressed = compressed.replace(/\d+\.\d+/g, (match) => {
      return parseFloat(match).toFixed(options.precision);
    });
    
    const precisionSavings = beforeSize - compressed.length;
    if (precisionSavings > 0) {
      optimizations.push({
        type: 'Precision',
        description: `Rounded numbers to ${options.precision} decimal places`,
        savings: precisionSavings,
      });
    }
  }

  // Merge duplicate rules (simplified version)
  if (options.mergeDuplicateRules) {
    const rules = compressed.match(/([^{]+)\{([^}]+)\}/g);
    if (rules) {
      const ruleMap = new Map<string, string[]>();
      
      for (const rule of rules) {
        const match = rule.match(/([^{]+)\{([^}]+)\}/);
        if (match) {
          const [, selector, properties] = match;
          const normalizedProps = properties.replace(/\s+/g, ' ').trim();
          
          if (!ruleMap.has(normalizedProps)) {
            ruleMap.set(normalizedProps, []);
          }
          ruleMap.get(normalizedProps)!.push(selector.trim());
        }
      }
      
      let mergedCSS = '';
      for (const [properties, selectors] of ruleMap) {
        if (selectors.length > 1) {
          mergedRules += selectors.length - 1;
          mergedCSS += selectors.join(',') + '{' + properties + '}';
        } else {
          mergedCSS += selectors[0] + '{' + properties + '}';
        }
      }
      
      if (mergedRules > 0) {
        const beforeSize = compressed.length;
        compressed = mergedCSS;
        const savings = beforeSize - compressed.length;
        optimizations.push({
          type: 'Duplicate Rules',
          description: `Merged ${mergedRules} duplicate rules`,
          savings,
        });
      }
    }
  }

  // Add warnings
  if (compressed.length === 0) {
    warnings.push('Compressed CSS is empty - check input');
  }

  if (compressed.length > originalSize) {
    warnings.push('Compressed CSS is larger than original - compression may not be beneficial');
  }

  const compressedSize = compressed.length;
  const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

  return {
    success: true,
    originalCSS: css,
    compressedCSS: compressed,
    statistics: {
      originalSize,
      compressedSize,
      compressionRatio: parseFloat(compressionRatio),
      removedComments,
      removedWhitespace,
      optimizedColors,
      optimizedUnits,
      mergedRules,
      removedEmptyRules,
      processingTime: 0,
    },
    options,
    optimizations,
    warnings,
  };
}