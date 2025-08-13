import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ObfuscationOptions {
  compact: boolean;
  controlFlowFlattening: boolean;
  controlFlowFlatteningThreshold: number;
  deadCodeInjection: boolean;
  deadCodeInjectionThreshold: number;
  debugProtection: boolean;
  debugProtectionInterval: boolean;
  disableConsoleOutput: boolean;
  identifierNamesGenerator: 'hexadecimal' | 'mangled' | 'dictionary';
  identifiersPrefix: string;
  inputFileName: string;
  log: boolean;
  numbersToExpressions: boolean;
  renameGlobals: boolean;
  reservedNames: string[];
  reservedStrings: string[];
  rotateStringArray: boolean;
  seed: number;
  selfDefending: boolean;
  shuffleStringArray: boolean;
  simplify: boolean;
  splitStrings: boolean;
  splitStringsChunkLength: number;
  stringArray: boolean;
  stringArrayEncoding: ['none' | 'base64' | 'rc4'];
  stringArrayThreshold: number;
  target: 'browser' | 'node' | 'node-no-eval';
  transformObjectKeys: boolean;
  unicodeEscapeSequence: boolean;
}

interface ObfuscationResult {
  success: boolean;
  originalCode: string;
  obfuscatedCode: string;
  obfuscationLevel: 'low' | 'medium' | 'high';
  complexityScore: number;
  options: ObfuscationOptions;
  stats: {
    originalSize: number;
    obfuscatedSize: number;
    compressionRatio: number;
    obfuscationTime: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, options = {}, level = 'medium' } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'JavaScript code is required' },
        { status: 400 }
      );
    }

    if (code.length > 50000) { // 50KB limit
      return NextResponse.json(
        { error: 'Code size exceeds 50KB limit' },
        { status: 400 }
      );
    }

    // Default options based on level
    const defaultOptions: Record<string, ObfuscationOptions> = {
      low: {
        compact: true,
        controlFlowFlattening: false,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        identifiersPrefix: '',
        inputFileName: '',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        reservedNames: [],
        reservedStrings: [],
        rotateStringArray: true,
        seed: 0,
        selfDefending: false,
        shuffleStringArray: true,
        simplify: true,
        splitStrings: false,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayEncoding: ['none'],
        stringArrayThreshold: 0.75,
        target: 'browser',
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
      },
      medium: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        identifiersPrefix: '',
        inputFileName: '',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        reservedNames: [],
        reservedStrings: [],
        rotateStringArray: true,
        seed: 0,
        selfDefending: true,
        shuffleStringArray: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        target: 'browser',
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
      high: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        debugProtection: true,
        debugProtectionInterval: true,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        identifiersPrefix: '',
        inputFileName: '',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        reservedNames: [],
        reservedStrings: [],
        rotateStringArray: true,
        seed: 0,
        selfDefending: true,
        shuffleStringArray: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        target: 'browser',
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
      },
    };

    const finalOptions: ObfuscationOptions = { ...defaultOptions[level], ...options };

    // Validate options
    if (finalOptions.controlFlowFlatteningThreshold < 0 || finalOptions.controlFlowFlatteningThreshold > 1) {
      return NextResponse.json(
        { error: 'Control flow flattening threshold must be between 0 and 1' },
        { status: 400 }
      );
    }

    if (finalOptions.deadCodeInjectionThreshold < 0 || finalOptions.deadCodeInjectionThreshold > 1) {
      return NextResponse.json(
        { error: 'Dead code injection threshold must be between 0 and 1' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Obfuscate the code
    const obfuscatedCode = obfuscateCode(code, finalOptions);
    
    const endTime = Date.now();
    const obfuscationTime = endTime - startTime;

    // Calculate complexity score
    const complexityScore = calculateComplexityScore(code, obfuscatedCode, finalOptions);

    const result: ObfuscationResult = {
      success: true,
      originalCode: code,
      obfuscatedCode,
      obfuscationLevel: level,
      complexityScore,
      options: finalOptions,
      stats: {
        originalSize: code.length,
        obfuscatedSize: obfuscatedCode.length,
        compressionRatio: ((obfuscatedCode.length - code.length) / code.length * 100).toFixed(2),
        obfuscationTime,
      },
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a JavaScript security expert. Provide insights about code obfuscation and security best practices.'
          },
          {
            role: 'user',
            content: `Analyze this JavaScript obfuscation operation:
            - Obfuscation level: ${level}
            - Complexity score: ${complexityScore}/100
            - Size change: ${result.stats.compressionRatio}%
            - Processing time: ${obfuscationTime}ms
            
            Provide insights about:
            1. Effectiveness of this obfuscation level
            2. Security implications and limitations
            3. Performance considerations
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
    console.error('JavaScript obfuscation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during code obfuscation' },
      { status: 500 }
    );
  }
}

function obfuscateCode(code: string, options: ObfuscationOptions): string {
  let obfuscated = code;

  // Basic compacting
  if (options.compact) {
    obfuscated = obfuscated
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,+=\-*\/])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .replace(/\{\s*/g, '{')
      .replace(/\s*\}/g, '}')
      .trim();
  }

  // Variable name obfuscation
  if (options.identifierNamesGenerator === 'hexadecimal') {
    obfuscated = obfuscateVariableNames(obfuscated, 'hex');
  } else if (options.identifierNamesGenerator === 'mangled') {
    obfuscated = obfuscateVariableNames(obfuscated, 'mangled');
  }

  // String array encoding
  if (options.stringArray && options.stringArrayEncoding[0] !== 'none') {
    obfuscated = encodeStringArray(obfuscated, options.stringArrayEncoding[0]);
  }

  // Control flow flattening (simplified)
  if (options.controlFlowFlattening) {
    obfuscated = flattenControlFlow(obfuscated);
  }

  // Dead code injection (simplified)
  if (options.deadCodeInjection) {
    obfuscated = injectDeadCode(obfuscated);
  }

  // Number to expressions
  if (options.numbersToExpressions) {
    obfuscated = convertNumbersToExpressions(obfuscated);
  }

  // Self-defending code
  if (options.selfDefending) {
    obfuscated = addSelfDefending(obfuscated);
  }

  // Unicode escape sequences
  if (options.unicodeEscapeSequence) {
    obfuscated = escapeUnicode(obfuscated);
  }

  return obfuscated;
}

function obfuscateVariableNames(code: string, type: 'hex' | 'mangled'): string {
  // Simple variable name obfuscation
  const varRegex = /\b(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const functionRegex = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  
  const varMap = new Map<string, string>();
  let counter = 0;

  const replaceVar = (match: string, keyword: string, varName: string) => {
    if (!varMap.has(varName)) {
      if (type === 'hex') {
        varMap.set(varName, '_0x' + counter.toString(16));
      } else {
        varMap.set(varName, '_' + counter.toString(36));
      }
      counter++;
    }
    return keyword + ' ' + varMap.get(varName);
  };

  const replaceFunction = (match: string, funcName: string) => {
    if (!varMap.has(funcName)) {
      if (type === 'hex') {
        varMap.set(funcName, '_0x' + counter.toString(16));
      } else {
        varMap.set(funcName, '_' + counter.toString(36));
      }
      counter++;
    }
    return 'function ' + varMap.get(funcName);
  };

  let result = code.replace(varRegex, replaceVar);
  result = result.replace(functionRegex, replaceFunction);

  // Replace variable usage
  varMap.forEach((newName, oldName) => {
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
    result = result.replace(regex, newName);
  });

  return result;
}

function encodeStringArray(code: string, encoding: 'base64' | 'rc4'): string {
  const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
  
  return code.replace(stringRegex, (match) => {
    if (encoding === 'base64') {
      const str = match.slice(1, -1);
      const encoded = Buffer.from(str).toString('base64');
      return `'atob("${encoded}")'`;
    }
    return match; // RC4 would require more complex implementation
  });
}

function flattenControlFlow(code: string): string {
  // Simplified control flow flattening
  // In a real implementation, this would be much more complex
  return code.replace(/if\s*\((.*?)\)\s*\{(.*?)\}/gs, (match, condition, body) => {
    return `(function(){if(${condition}){${body}}})();`;
  });
}

function injectDeadCode(code: string): string {
  // Simple dead code injection
  const deadCode = `
    (function(){
      var _0x1234 = [1,2,3,4,5];
      var _0x5678 = _0x1234.map(function(x){return x*2;});
      if(false){console.log(_0x5678);}
    })();
  `;
  
  return deadCode + code;
}

function convertNumbersToExpressions(code: string): string {
  // Convert numbers to expressions
  return code.replace(/\b(\d+)\b/g, (match, num) => {
    const n = parseInt(num);
    if (n > 10 && Math.random() > 0.5) {
      return `(${n-1}+1)`;
    }
    return match;
  });
}

function addSelfDefending(code: string): string {
  // Simple self-defending code
  const selfDefending = `
    (function(){
      var _0xdefend = 'self-defending';
      if(typeof window !== 'undefined' && window.self === window.top){
        Object.freeze(Object.prototype);
      }
    })();
  `;
  
  return selfDefending + code;
}

function escapeUnicode(code: string): string {
  // Escape Unicode characters
  return code.replace(/[\u0080-\uffff]/g, (char) => {
    const hex = char.charCodeAt(0).toString(16);
    return '\\u' + '0'.repeat(4 - hex.length) + hex;
  });
}

function calculateComplexityScore(original: string, obfuscated: string, options: ObfuscationOptions): number {
  let score = 0;
  
  // Base score for obfuscation level
  if (options.controlFlowFlattening) score += 20;
  if (options.deadCodeInjection) score += 20;
  if (options.stringArrayEncoding[0] !== 'none') score += 15;
  if (options.selfDefending) score += 15;
  if (options.debugProtection) score += 10;
  if (options.numbersToExpressions) score += 10;
  if (options.unicodeEscapeSequence) score += 10;
  
  // Size complexity
  const sizeRatio = obfuscated.length / original.length;
  if (sizeRatio > 2) score += 10;
  else if (sizeRatio > 1.5) score += 5;
  
  return Math.min(score, 100);
}