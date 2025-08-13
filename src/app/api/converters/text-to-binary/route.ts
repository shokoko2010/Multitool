import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ConversionOptions {
  encoding: 'utf8' | 'ascii' | 'utf16' | 'base64';
  format: 'binary' | 'hex' | 'octal' | 'decimal';
  separator: string;
  includeSpaces: boolean;
  padToBytes: boolean;
  uppercase: boolean;
  groupSize: number;
  lineLength: number;
  includeHeader: boolean;
  includeStats: boolean;
}

interface ConversionResult {
  success: boolean;
  originalText: string;
  convertedData: string;
  encoding: string;
  format: string;
  statistics: {
    originalLength: number;
    convertedLength: number;
    compressionRatio: number;
    bytesUsed: number;
    bitsUsed: number;
    uniqueCharacters: number;
    conversionTime: number;
  };
  options: ConversionOptions;
  characterMap: Array<{
    character: string;
    codePoint: number;
    binary: string;
    hex: string;
    decimal: number;
    octal: string;
  }>;
  analysis: {
    encodingInfo: string;
    formatInfo: string;
    recommendations: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options = {} } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 100000) { // 100KB limit
      return NextResponse.json(
        { error: 'Text size exceeds 100KB limit' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: ConversionOptions = {
      encoding: 'utf8',
      format: 'binary',
      separator: ' ',
      includeSpaces: true,
      padToBytes: true,
      uppercase: false,
      groupSize: 8,
      lineLength: 80,
      includeHeader: false,
      includeStats: true,
    };

    const finalOptions: ConversionOptions = { ...defaultOptions, ...options };

    // Validate options
    if (finalOptions.groupSize < 1 || finalOptions.groupSize > 32) {
      return NextResponse.json(
        { error: 'Group size must be between 1 and 32' },
        { status: 400 }
      );
    }

    if (finalOptions.lineLength < 20 || finalOptions.lineLength > 200) {
      return NextResponse.json(
        { error: 'Line length must be between 20 and 200' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Convert text to binary
    const result = convertTextToBinary(text, finalOptions);
    
    const endTime = Date.now();
    result.statistics.conversionTime = endTime - startTime;

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a text encoding expert. Provide insights about text-to-binary conversion and encoding systems.'
          },
          {
            role: 'user',
            content: `Analyze this text-to-binary conversion:
            - Original text length: ${result.statistics.originalLength} characters
            - Converted data length: ${result.statistics.convertedLength} characters
            - Encoding: ${result.encoding}
            - Format: ${result.format}
            - Bytes used: ${result.statistics.bytesUsed}
            
            Provide insights about:
            1. Encoding efficiency and use cases
            2. Binary representation advantages
            3. Best practices for data encoding
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
    console.error('Text to binary conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error during text to binary conversion' },
      { status: 500 }
    );
  }
}

function convertTextToBinary(text: string, options: ConversionOptions): ConversionResult {
  const startTime = Date.now();
  const characterMap: Array<{
    character: string;
    codePoint: number;
    binary: string;
    hex: string;
    decimal: number;
    octal: string;
  }> = [];

  let convertedData = '';
  let totalBits = 0;

  // Process each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    let codePoint: number;

    // Get code point based on encoding
    switch (options.encoding) {
      case 'utf8':
        codePoint = char.charCodeAt(0);
        break;
      case 'ascii':
        codePoint = char.charCodeAt(0);
        if (codePoint > 127) {
          codePoint = 63; // Replace with '?' for non-ASCII
        }
        break;
      case 'utf16':
        codePoint = char.charCodeAt(0);
        break;
      case 'base64':
        // For base64, we'll encode the entire string at once
        continue;
      default:
        codePoint = char.charCodeAt(0);
    }

    // Convert to different formats
    const binary = codePoint.toString(2).padStart(8, '0');
    const hex = codePoint.toString(16).padStart(2, '0');
    const decimal = codePoint;
    const octal = codePoint.toString(8).padStart(3, '0');

    characterMap.push({
      character: char,
      codePoint,
      binary,
      hex,
      decimal,
      octal,
    });

    // Add to converted data based on format
    let formattedValue = '';
    switch (options.format) {
      case 'binary':
        formattedValue = options.uppercase ? binary.toUpperCase() : binary;
        break;
      case 'hex':
        formattedValue = options.uppercase ? hex.toUpperCase() : hex;
        break;
      case 'octal':
        formattedValue = octal;
        break;
      case 'decimal':
        formattedValue = decimal.toString();
        break;
    }

    // Apply grouping
    if (options.groupSize > 0 && formattedValue.length > options.groupSize) {
      const groups = [];
      for (let j = 0; j < formattedValue.length; j += options.groupSize) {
        groups.push(formattedValue.slice(j, j + options.groupSize));
      }
      formattedValue = groups.join(options.separator);
    }

    convertedData += formattedValue;
    
    // Add separator (except for last character)
    if (i < text.length - 1 && options.separator) {
      convertedData += options.separator;
    }

    totalBits += 8;
  }

  // Handle base64 encoding separately
  if (options.encoding === 'base64') {
    convertedData = Buffer.from(text).toString('base64');
    totalBits = text.length * 8;
  }

  // Apply line breaks
  if (options.lineLength > 0 && convertedData.length > options.lineLength) {
    const lines = [];
    for (let i = 0; i < convertedData.length; i += options.lineLength) {
      lines.push(convertedData.slice(i, i + options.lineLength));
    }
    convertedData = lines.join('\n');
  }

  // Add header if requested
  if (options.includeHeader) {
    const header = `Text to ${options.format.toUpperCase()} Conversion\n` +
                  `Encoding: ${options.encoding.toUpperCase()}\n` +
                  `Original Length: ${text.length} characters\n` +
                  `Generated: ${new Date().toISOString()}\n\n`;
    convertedData = header + convertedData;
  }

  // Calculate statistics
  const originalLength = text.length;
  const convertedLength = convertedData.length;
  const compressionRatio = ((convertedLength - originalLength) / originalLength * 100).toFixed(2);
  const bytesUsed = Math.ceil(totalBits / 8);
  const uniqueCharacters = new Set(text.split('')).size;

  const endTime = Date.now();
  const conversionTime = endTime - startTime;

  // Generate analysis
  const analysis = {
    encodingInfo: getEncodingInfo(options.encoding),
    formatInfo: getFormatInfo(options.format),
    recommendations: getRecommendations(text, options),
  };

  return {
    success: true,
    originalText: text,
    convertedData,
    encoding: options.encoding,
    format: options.format,
    statistics: {
      originalLength,
      convertedLength,
      compressionRatio: parseFloat(compressionRatio),
      bytesUsed,
      bitsUsed: totalBits,
      uniqueCharacters,
      conversionTime,
    },
    options,
    characterMap,
    analysis,
  };
}

function getEncodingInfo(encoding: string): string {
  switch (encoding) {
    case 'utf8':
      return 'UTF-8 is a variable-width character encoding that can represent every character in the Unicode standard. It uses 1-4 bytes per character.';
    case 'ascii':
      return 'ASCII is a 7-bit character encoding that represents English characters, digits, and symbols. Limited to 128 characters.';
    case 'utf16':
      return 'UTF-16 is a variable-width character encoding that uses 2 or 4 bytes per character. Commonly used in Windows and Java.';
    case 'base64':
      return 'Base64 is a binary-to-text encoding that represents binary data in ASCII format. Increases size by ~33%.';
    default:
      return 'Unknown encoding';
  }
}

function getFormatInfo(format: string): string {
  switch (format) {
    case 'binary':
      return 'Binary format represents data as base-2 numbers (0s and 1s). Each character is typically represented by 8 bits.';
    case 'hex':
      return 'Hexadecimal format represents data as base-16 numbers (0-9, A-F). Each byte is represented by 2 hex digits.';
    case 'octal':
      return 'Octal format represents data as base-8 numbers (0-7). Each byte is represented by 3 octal digits.';
    case 'decimal':
      return 'Decimal format represents data as base-10 numbers (0-9). Each character is represented by its decimal code point.';
    default:
      return 'Unknown format';
  }
}

function getRecommendations(text: string, options: ConversionOptions): string[] {
  const recommendations: string[] = [];

  // Encoding recommendations
  if (options.encoding === 'ascii' && /[^\x00-\x7F]/.test(text)) {
    recommendations.push('Text contains non-ASCII characters. Consider using UTF-8 encoding for better compatibility.');
  }

  if (options.encoding === 'base64') {
    recommendations.push('Base64 encoding increases file size by ~33%. Use it only when binary-safe transmission is required.');
  }

  // Format recommendations
  if (options.format === 'binary' && text.length > 1000) {
    recommendations.push('Binary format creates very long strings. Consider hexadecimal format for better readability.');
  }

  if (options.format === 'decimal') {
    recommendations.push('Decimal format is less common for binary representation. Consider hexadecimal or binary format.');
  }

  // Performance recommendations
  if (text.length > 10000) {
    recommendations.push('Large text detected. Consider processing in chunks for better performance.');
  }

  // Security recommendations
  if (text.includes('password') || text.includes('secret') || text.includes('key')) {
    recommendations.push('Text appears to contain sensitive information. Ensure secure handling of converted data.');
  }

  // General recommendations
  recommendations.push('Consider the target system when choosing encoding and format.');
  recommendations.push('Test converted data with the intended decoder to ensure compatibility.');
  recommendations.push('Document the encoding and format used for future reference.');

  return recommendations;
}