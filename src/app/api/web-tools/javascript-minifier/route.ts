import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface JavaScriptMinifierOptions {
  removeComments?: boolean;
  removeWhitespace?: boolean;
  shortenVariableNames?: boolean;
  shortenFunctionNames?: boolean;
  removeUnusedVariables?: boolean;
  removeUnusedFunctions?: boolean;
  removeConsole?: boolean;
  removeDebugger?: boolean;
  collapseVars?: boolean;
  reduceVars?: boolean;
  convertToArrow?: boolean;
  compress?: boolean;
  mangle?: boolean;
  ecma?: 5 | 6 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022;
  preserveComments?: boolean;
  preserveLines?: boolean;
  level?: 1 | 2 | 3;
}

interface JavaScriptMinifierResult {
  success: boolean;
  data?: {
    originalJavaScript: string;
    minifiedJavaScript: string;
    options: JavaScriptMinifierOptions;
    stats: {
      originalSize: number;
      minifiedSize: number;
      compressionRatio: number;
      savedBytes: number;
      savedPercentage: number;
      linesCount: number;
      functionsCount: number;
      variablesCount: number;
      commentsCount: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { javascript, options = {} } = await request.json();

    if (!javascript) {
      return NextResponse.json<JavaScriptMinifierResult>({
        success: false,
        error: 'JavaScript content is required'
      }, { status: 400 });
    }

    // Set default options
    const minifierOptions: JavaScriptMinifierOptions = {
      removeComments: options.removeComments !== false,
      removeWhitespace: options.removeWhitespace !== false,
      shortenVariableNames: options.shortenVariableNames || false,
      shortenFunctionNames: options.shortenFunctionNames || false,
      removeUnusedVariables: options.removeUnusedVariables || false,
      removeUnusedFunctions: options.removeUnusedFunctions || false,
      removeConsole: options.removeConsole || false,
      removeDebugger: options.removeDebugger !== false,
      collapseVars: options.collapseVars || false,
      reduceVars: options.reduceVars || false,
      convertToArrow: options.convertToArrow || false,
      compress: options.compress !== false,
      mangle: options.mangle || false,
      ecma: options.ecma || 2020,
      preserveComments: options.preserveComments || false,
      preserveLines: options.preserveLines || false,
      level: options.level || 2
    };

    // Minify JavaScript
    const minifiedJavaScript = minifyJavaScript(javascript, minifierOptions);

    // Calculate statistics
    const stats = calculateJavaScriptStats(javascript, minifiedJavaScript);

    const result = {
      originalJavaScript: javascript,
      minifiedJavaScript,
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
            content: 'You are a JavaScript optimization expert. Analyze the JavaScript minification results and provide insights about the optimization effectiveness, potential improvements, and best practices for JavaScript performance.'
          },
          {
            role: 'user',
            content: `Analyze this JavaScript minification result:\n\nOriginal Size: ${stats.originalSize} bytes\nMinified Size: ${stats.minifiedSize} bytes\nSaved: ${stats.savedBytes} bytes (${stats.savedPercentage.toFixed(2)}%)\nCompression Ratio: ${stats.compressionRatio.toFixed(3)}\n\nElements:\n- Lines: ${stats.linesCount}\n- Functions: ${stats.functionsCount}\n- Variables: ${stats.variablesCount}\n- Comments: ${stats.commentsCount}\n\nOptimization Level: ${minifierOptions.level}\nECMA Version: ${minifierOptions.ecma}\nOptions Used: ${JSON.stringify({
              removeComments: minifierOptions.removeComments,
              removeWhitespace: minifierOptions.removeWhitespace,
              shortenVariableNames: minifierOptions.shortenVariableNames,
              removeConsole: minifierOptions.removeConsole,
              compress: minifierOptions.compress,
              mangle: minifierOptions.mangle
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

    return NextResponse.json<JavaScriptMinifierResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('JavaScript minification error:', error);
    return NextResponse.json<JavaScriptMinifierResult>({
      success: false,
      error: 'Internal server error during JavaScript minification'
    }, { status: 500 });
  }
}

function minifyJavaScript(javascript: string, options: JavaScriptMinifierOptions): string {
  let minified = javascript;

  // Remove comments
  if (options.removeComments && !options.preserveComments) {
    // Remove single-line comments
    minified = minified.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Remove debugger statements
  if (options.removeDebugger) {
    minified = minified.replace(/debugger;/g, '');
  }

  // Remove console statements
  if (options.removeConsole) {
    minified = minified.replace(/console\.(log|warn|error|info|debug|time|timeEnd|assert|clear|count|countReset|group|groupCollapsed|groupEnd|table|trace)\([^)]*\);?/g, '');
  }

  // Remove whitespace
  if (options.removeWhitespace) {
    minified = minified.replace(/\s+/g, ' ');
  }

  // Remove unnecessary whitespace around operators and punctuation
  minified = minified.replace(/\s*([{}();,=+\-*\/%&|^~!<>?:])\s*/g, '$1');
  minified = minified.replace(/;\s*}/g, '}');
  minified = minified.replace(/{\s*/g, '{');
  minified = minified.replace(/\s*}/g, '}');
  minified = minified.replace(/\(\s*/g, '(');
  minified = minified.replace(/\s*\)/g, ')');

  // Convert functions to arrow functions if enabled
  if (options.convertToArrow && options.ecma! >= 2015) {
    minified = convertToArrowFunctions(minified);
  }

  // Shorten variable names if enabled
  if (options.shortenVariableNames && options.mangle) {
    minified = shortenVariableNames(minified);
  }

  // Shorten function names if enabled
  if (options.shortenFunctionNames && options.mangle) {
    minified = shortenFunctionNames(minified);
  }

  // Remove unused variables if enabled
  if (options.removeUnusedVariables) {
    minified = removeUnusedVariables(minified);
  }

  // Remove unused functions if enabled
  if (options.removeUnusedFunctions) {
    minified = removeUnusedFunctions(minified);
  }

  // Collapse variables if enabled
  if (options.collapseVars) {
    minified = collapseVariables(minified);
  }

  // Reduce variables if enabled
  if (options.reduceVars) {
    minified = reduceVariables(minified);
  }

  // Additional optimizations
  if (options.compress) {
    minified = applyCompressions(minified, options.ecma!);
  }

  // Clean up
  if (!options.preserveLines) {
    minified = minified.replace(/\n/g, '');
  }

  // Remove final semicolons
  minified = minified.replace(/;}/g, '}');

  return minified.trim();
}

function convertToArrowFunctions(javascript: string): string {
  // Convert simple function expressions to arrow functions
  javascript = javascript.replace(/function\s*\(([^)]*)\)\s*\{[\s]*return\s+([^;]+);[\s]*\}/g, '($1) => $2');
  javascript = javascript.replace(/function\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g, '($1) => {$2}');
  
  // Convert methods to arrow functions
  javascript = javascript.replace(/(\w+)\s*:\s*function\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g, '$1: ($2) => {$3}');
  
  return javascript;
}

function shortenVariableNames(javascript: string): string {
  // Simple variable name shortening (in real implementation, use proper scope analysis)
  const varMap: Record<string, string> = [];
  let varIndex = 0;
  
  // Find variable declarations
  javascript = javascript.replace(/(?:var|let|const)\s+(\w+)/g, (match, varName) => {
    if (!varMap[varName]) {
      varMap[varName] = String.fromCharCode(97 + (varIndex % 26)) + (varIndex >= 26 ? Math.floor(varIndex / 26) : '');
      varIndex++;
    }
    return match.replace(varName, varMap[varName]);
  });
  
  // Replace variable usage
  for (const [original, shortened] of Object.entries(varMap)) {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    javascript = javascript.replace(regex, shortened);
  }
  
  return javascript;
}

function shortenFunctionNames(javascript: string): string {
  // Simple function name shortening
  const funcMap: Record<string, string> = [];
  let funcIndex = 0;
  
  // Find function declarations
  javascript = javascript.replace(/function\s+(\w+)\s*\(/g, (match, funcName) => {
    if (!funcMap[funcName]) {
      funcMap[funcName] = 'f' + funcIndex++;
    }
    return match.replace(funcName, funcMap[funcName]);
  });
  
  // Replace function calls
  for (const [original, shortened] of Object.entries(funcMap)) {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    javascript = javascript.replace(regex, shortened);
  }
  
  return javascript;
}

function removeUnusedVariables(javascript: string): string {
  // Simplified unused variable removal (in real implementation, use proper scope analysis)
  const usedVars = new Set<string>();
  
  // Find used variables in expressions
  javascript.replace(/(?:=|\(|\[|\+|\-|\*|\/|%|\||&|\^|~|!|<|>|,|\?|\:)\s*(\w+)/g, (match, varName) => {
    usedVars.add(varName);
    return match;
  });
  
  // Remove unused variable declarations
  javascript = javascript.replace(/(?:var|let|const)\s+(\w+)(?:\s*=\s*[^;]+)?;/g, (match, varName) => {
    if (!usedVars.has(varName)) {
      return '';
    }
    return match;
  });
  
  return javascript;
}

function removeUnusedFunctions(javascript: string): string {
  // Simplified unused function removal
  const usedFuncs = new Set<string>();
  
  // Find function calls
  javascript.replace(/(\w+)\s*\(/g, (match, funcName) => {
    usedFuncs.add(funcName);
    return match;
  });
  
  // Remove unused function declarations
  javascript = javascript.replace(/function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\}/g, (match, funcName) => {
    if (!usedFuncs.has(funcName)) {
      return '';
    }
    return match;
  });
  
  return javascript;
}

function collapseVariables(javascript: string): string {
  // Simple variable collapsing
  javascript = javascript.replace(/var\s+(\w+)\s*=\s*([^;]+);\s*var\s+(\w+)\s*=\s*\1;/g, 'var $3=$2;');
  javascript = javascript.replace(/let\s+(\w+)\s*=\s*([^;]+);\s*let\s+(\w+)\s*=\s*\1;/g, 'let $3=$2;');
  javascript = javascript.replace(/const\s+(\w+)\s*=\s*([^;]+);\s*const\s+(\w+)\s*=\s*\1;/g, 'const $3=$2;');
  
  return javascript;
}

function reduceVariables(javascript: string): string {
  // Simple variable reduction
  javascript = javascript.replace(/var\s+(\w+)\s*=\s*([^;]+);\s*\1\s*=\s*([^;]+);/g, 'var $1=$3;');
  javascript = javascript.replace(/let\s+(\w+)\s*=\s*([^;]+);\s*\1\s*=\s*([^;]+);/g, 'let $1=$3;');
  javascript = javascript.replace(/const\s+(\w+)\s*=\s*([^;]+);\s*\1\s*=\s*([^;]+);/g, 'const $1=$3;');
  
  return javascript;
}

function applyCompressions(javascript: string, ecma: number): string {
  // Apply various compressions based on ECMA version
  
  // Convert true/false to !0/!1
  javascript = javascript.replace(/\btrue\b/g, '!0');
  javascript = javascript.replace(/\bfalse\b/g, '!1');
  
  // Convert undefined to void 0
  javascript = javascript.replace(/\bundefined\b/g, 'void 0');
  
  // Convert Infinity to 1/0
  javascript = javascript.replace(/\bInfinity\b/g, '1/0');
  
  // Convert -Infinity to -1/0
  javascript = javascript.replace(/\b-Infinity\b/g, '-1/0');
  
  // Convert NaN to 0/0
  javascript = javascript.replace(/\bNaN\b/g, '0/0');
  
  // Optimize array methods if ECMA 5+
  if (ecma >= 5) {
    javascript = javascript.replace(/Array\.prototype\.slice\.call\(([^)]+)\)/g, '[].slice.call($1)');
    javascript = javascript.replace(/Array\.prototype\.join\.call\(([^,]+),\s*([^)]+)\)/g, '$1.join($2)');
  }
  
  // Optimize object methods if ECMA 5+
  if (ecma >= 5) {
    javascript = javascript.replace(/Object\.prototype\.hasOwnProperty\.call\(([^,]+),\s*"([^"]+)"\)/g, '$1.hasOwnProperty("$2")');
  }
  
  // Optimize Math operations
  javascript = javascript.replace(/Math\.floor\(([^)]+)\)/g, '~~$1');
  javascript = javascript.replace(/Math\.ceil\(([^)]+)\)/g, '-~~-$1');
  
  return javascript;
}

function calculateJavaScriptStats(originalJavaScript: string, minifiedJavaScript: string) {
  const originalSize = originalJavaScript.length;
  const minifiedSize = minifiedJavaScript.length;
  const savedBytes = originalSize - minifiedSize;
  const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
  const compressionRatio = originalSize > 0 ? minifiedSize / originalSize : 1;

  // Count elements in original JavaScript
  const linesCount = (originalJavaScript.match(/\n/g) || []).length + 1;
  const functionsCount = (originalJavaScript.match(/function\s+\w+\s*\(/g) || []).length;
  const variablesCount = (originalJavaScript.match(/(?:var|let|const)\s+\w+/g) || []).length;
  const commentsCount = (originalJavaScript.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) || []).length;

  return {
    originalSize,
    minifiedSize,
    compressionRatio,
    savedBytes,
    savedPercentage,
    linesCount,
    functionsCount,
    variablesCount,
    commentsCount
  };
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with JavaScript content'
  }, { status: 405 });
}