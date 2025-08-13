import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ConversionOptions {
  inputFormat: 'binary' | 'hex' | 'octal' | 'decimal' | 'base64';
  outputEncoding: 'utf8' | 'ascii' | 'utf16' | 'latin1';
  separator: string;
  ignoreInvalid: boolean;
  strictMode: boolean;
  autoDetect: boolean;
  groupSize: number;
  includeStats: boolean;
  includeHeader: boolean;
  preserveWhitespace: boolean;
}

interface ConversionResult {
  success: boolean;
  inputData: string;
  convertedText: string;
  inputFormat: string;
  outputEncoding: string;
  statistics: {
    inputLength: number;
    outputLength: number;
    compressionRatio: number;
    bytesDecoded: number;
    validGroups: number;
    invalidGroups: number;
    conversionTime: number;
  };
  options: ConversionOptions;
  analysis: {
    formatInfo: string;
    encodingInfo: string;
    detectedFormat?: string;
    recommendations: string[];
  };
  errors: string[];
  warnings: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, options = {} } = body;

    if (!data || typeof data !== 'string') {
      return NextResponse.json(
        { error: 'Binary data is required and must be a string' },
        { status: 400 }
      );
    }

    if (data.length > 1000000) { // 1MB limit
      return NextResponse.json(
        { error: 'Data size exceeds 1MB limit' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: ConversionOptions = {
      inputFormat: 'binary',
      outputEncoding: 'utf8',
      separator: ' ',
      ignoreInvalid: true,
      strictMode: false,
      autoDetect: true,
      groupSize: 8,
      includeStats: true,
      includeHeader: false,
      preserveWhitespace: false,
    };

    const finalOptions: ConversionOptions = { ...defaultOptions, ...options };

    // Validate options
    if (finalOptions.groupSize < 1 || finalOptions.groupSize > 32) {
      return NextResponse.json(
        { error: 'Group size must be between 1 and 32' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Convert binary to text
    const result = convertBinaryToText(data, finalOptions);
    
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
            content: 'You are a binary decoding expert. Provide insights about binary-to-text conversion and data encoding systems.'
          },
          {
            role: 'user',
            content: `Analyze this binary-to-text conversion:
            - Input format: ${result.inputFormat}
            - Output encoding: ${result.outputEncoding}
            - Input length: ${result.statistics.inputLength} characters
            - Output length: ${result.statistics.outputLength} characters
            - Valid groups: ${result.statistics.validGroups}
            - Invalid groups: ${result.statistics.invalidGroups}
            
            Provide insights about:
            1. Data integrity and validation
            2. Encoding efficiency
            3. Best practices for binary data handling
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
    console.error('Binary to text conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error during binary to text conversion' },
      { status: 500 }
    );
  }
}

function convertBinaryToText(data: string, options: ConversionOptions): ConversionResult {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  let detectedFormat: string | undefined;

  // Clean input data
  let cleanData = data;
  if (!options.preserveWhitespace) {
    cleanData = data.replace(/\s+/g, ' ').trim();
  }

  // Auto-detect format if enabled
  if (options.autoDetect) {
    detectedFormat = detectFormat(cleanData);
    if (detectedFormat && detectedFormat !== options.inputFormat) {
      warnings.push(`Auto-detected format as ${detectedFormat}, but using specified format ${options.inputFormat}`);
    }
  }

  // Parse input based on format
  let bytes: number[] = [];
  let validGroups = 0;
  let invalidGroups = 0;

  switch (options.inputFormat) {
    case 'binary':
      ({ bytes, validGroups, invalidGroups } = parseBinary(cleanData, options));
      break;
    case 'hex':
      ({ bytes, validGroups, invalidGroups } = parseHex(cleanData, options));
      break;
    case 'octal':
      ({ bytes, validGroups, invalidGroups } = parseOctal(cleanData, options));
      break;
    case 'decimal':
      ({ bytes, validGroups, invalidGroups } = parseDecimal(cleanData, options));
      break;
    case 'base64':
      ({ bytes, validGroups, invalidGroups } = parseBase64(cleanData, options));
      break;
  }

  // Handle invalid data
  if (invalidGroups > 0 && !options.ignoreInvalid && options.strictMode) {
    errors.push(`${invalidGroups} invalid groups found in strict mode`);
    return {
      success: false,
      inputData: data,
      convertedText: '',
      inputFormat: options.inputFormat,
      outputEncoding: options.outputEncoding,
      statistics: {
        inputLength: data.length,
        outputLength: 0,
        compressionRatio: 0,
        bytesDecoded: 0,
        validGroups,
        invalidGroups,
        conversionTime: Date.now() - startTime,
      },
      options,
      analysis: {
        formatInfo: getFormatInfo(options.inputFormat),
        encodingInfo: getEncodingInfo(options.outputEncoding),
        detectedFormat,
        recommendations: [],
      },
      errors,
      warnings,
    };
  }

  // Convert bytes to text
  let convertedText = '';
  try {
    const buffer = Buffer.from(bytes);
    
    switch (options.outputEncoding) {
      case 'utf8':
        convertedText = buffer.toString('utf8');
        break;
      case 'ascii':
        convertedText = buffer.toString('ascii');
        break;
      case 'utf16':
        convertedText = buffer.toString('utf16');
        break;
      case 'latin1':
        convertedText = buffer.toString('latin1');
        break;
    }
  } catch (error) {
    errors.push(`Failed to decode bytes: ${error}`);
    convertedText = '';
  }

  // Calculate statistics
  const inputLength = data.length;
  const outputLength = convertedText.length;
  const compressionRatio = inputLength > 0 ? ((outputLength - inputLength) / inputLength * 100).toFixed(2) : 0;
  const bytesDecoded = bytes.length;

  const endTime = Date.now();
  const conversionTime = endTime - startTime;

  // Generate analysis
  const analysis = {
    formatInfo: getFormatInfo(options.inputFormat),
    encodingInfo: getEncodingInfo(options.outputEncoding),
    detectedFormat,
    recommendations: getRecommendations(data, options, validGroups, invalidGroups),
  };

  return {
    success: errors.length === 0,
    inputData: data,
    convertedText,
    inputFormat: options.inputFormat,
    outputEncoding: options.outputEncoding,
    statistics: {
      inputLength,
      outputLength,
      compressionRatio: parseFloat(compressionRatio),
      bytesDecoded,
      validGroups,
      invalidGroups,
      conversionTime,
    },
    options,
    analysis,
    errors,
    warnings,
  };
}

function detectFormat(data: string): string | undefined {
  // Remove whitespace and separators
  const cleanData = data.replace(/[\s\-\._]/g, '').toLowerCase();

  // Check for binary (only 0s and 1s)
  if (/^[01]+$/.test(cleanData)) {
    return 'binary';
  }

  // Check for hexadecimal (0-9, a-f)
  if (/^[0-9a-f]+$/.test(cleanData)) {
    return 'hex';
  }

  // Check for octal (0-7)
  if (/^[0-7]+$/.test(cleanData)) {
    return 'octal';
  }

  // Check for decimal (0-9)
  if (/^[0-9]+$/.test(cleanData)) {
    return 'decimal';
  }

  // Check for base64 (A-Z, a-z, 0-9, +, /, =)
  if (/^[A-Za-z0-9+/=]+$/.test(cleanData)) {
    return 'base64';
  }

  return undefined;
}

function parseBinary(data: string, options: ConversionOptions): { bytes: number[]; validGroups: number; invalidGroups: number } {
  const bytes: number[] = [];
  let validGroups = 0;
  let invalidGroups = 0;

  // Split by separator or use fixed group size
  let groups: string[];
  if (options.separator) {
    groups = data.split(options.separator).filter(g => g.trim());
  } else {
    groups = [];
    for (let i = 0; i < data.length; i += options.groupSize) {
      groups.push(data.slice(i, i + options.groupSize));
    }
  }

  for (const group of groups) {
    const cleanGroup = group.trim();
    
    // Validate binary format
    if (!/^[01]+$/.test(cleanGroup)) {
      invalidGroups++;
      if (!options.ignoreInvalid) {
        continue;
      }
      // Try to clean up the group
      const cleaned = cleanGroup.replace(/[^01]/g, '');
      if (cleaned.length === 0) continue;
    }

    // Pad to byte boundary if needed
    let binaryStr = cleanGroup.replace(/[^01]/g, '');
    if (options.groupSize === 8 && binaryStr.length < 8) {
      binaryStr = binaryStr.padStart(8, '0');
    }

    // Convert to byte
    try {
      const byte = parseInt(binaryStr, 2);
      if (byte >= 0 && byte <= 255) {
        bytes.push(byte);
        validGroups++;
      } else {
        invalidGroups++;
      }
    } catch {
      invalidGroups++;
    }
  }

  return { bytes, validGroups, invalidGroups };
}

function parseHex(data: string, options: ConversionOptions): { bytes: number[]; validGroups: number; invalidGroups: number } {
  const bytes: number[] = [];
  let validGroups = 0;
  let invalidGroups = 0;

  let groups: string[];
  if (options.separator) {
    groups = data.split(options.separator).filter(g => g.trim());
  } else {
    groups = [];
    for (let i = 0; i < data.length; i += 2) {
      groups.push(data.slice(i, i + 2));
    }
  }

  for (const group of groups) {
    const cleanGroup = group.trim();
    
    if (!/^[0-9a-fA-F]+$/.test(cleanGroup)) {
      invalidGroups++;
      if (!options.ignoreInvalid) {
        continue;
      }
      const cleaned = cleanGroup.replace(/[^0-9a-fA-F]/g, '');
      if (cleaned.length === 0) continue;
    }

    try {
      const byte = parseInt(cleanGroup, 16);
      if (byte >= 0 && byte <= 255) {
        bytes.push(byte);
        validGroups++;
      } else {
        invalidGroups++;
      }
    } catch {
      invalidGroups++;
    }
  }

  return { bytes, validGroups, invalidGroups };
}

function parseOctal(data: string, options: ConversionOptions): { bytes: number[]; validGroups: number; invalidGroups: number } {
  const bytes: number[] = [];
  let validGroups = 0;
  let invalidGroups = 0;

  let groups: string[];
  if (options.separator) {
    groups = data.split(options.separator).filter(g => g.trim());
  } else {
    groups = [];
    for (let i = 0; i < data.length; i += 3) {
      groups.push(data.slice(i, i + 3));
    }
  }

  for (const group of groups) {
    const cleanGroup = group.trim();
    
    if (!/^[0-7]+$/.test(cleanGroup)) {
      invalidGroups++;
      if (!options.ignoreInvalid) {
        continue;
      }
      const cleaned = cleanGroup.replace(/[^0-7]/g, '');
      if (cleaned.length === 0) continue;
    }

    try {
      const byte = parseInt(cleanGroup, 8);
      if (byte >= 0 && byte <= 255) {
        bytes.push(byte);
        validGroups++;
      } else {
        invalidGroups++;
      }
    } catch {
      invalidGroups++;
    }
  }

  return { bytes, validGroups, invalidGroups };
}

function parseDecimal(data: string, options: ConversionOptions): { bytes: number[]; validGroups: number; invalidGroups: number } {
  const bytes: number[] = [];
  let validGroups = 0;
  let invalidGroups = 0;

  let groups: string[];
  if (options.separator) {
    groups = data.split(options.separator).filter(g => g.trim());
  } else {
    // Try to split by variable length numbers
    groups = data.match(/\d+/g) || [];
  }

  for (const group of groups) {
    const cleanGroup = group.trim();
    
    if (!/^\d+$/.test(cleanGroup)) {
      invalidGroups++;
      if (!options.ignoreInvalid) {
        continue;
      }
      continue;
    }

    try {
      const byte = parseInt(cleanGroup, 10);
      if (byte >= 0 && byte <= 255) {
        bytes.push(byte);
        validGroups++;
      } else {
        invalidGroups++;
      }
    } catch {
      invalidGroups++;
    }
  }

  return { bytes, validGroups, invalidGroups };
}

function parseBase64(data: string, options: ConversionOptions): { bytes: number[]; validGroups: number; invalidGroups: number } {
  const bytes: number[] = [];
  let validGroups = 0;
  let invalidGroups = 0;

  try {
    const buffer = Buffer.from(data, 'base64');
    for (const byte of buffer) {
      bytes.push(byte);
    }
    validGroups = 1;
  } catch (error) {
    invalidGroups = 1;
    if (!options.ignoreInvalid) {
      return { bytes: [], validGroups: 0, invalidGroups: 1 };
    }
    
    // Try to clean and parse
    const cleanData = data.replace(/[^A-Za-z0-9+/=]/g, '');
    try {
      const buffer = Buffer.from(cleanData, 'base64');
      for (const byte of buffer) {
        bytes.push(byte);
      }
      validGroups = 1;
    } catch {
      invalidGroups = 1;
    }
  }

  return { bytes, validGroups, invalidGroups };
}

function getFormatInfo(format: string): string {
  switch (format) {
    case 'binary':
      return 'Binary format uses base-2 representation (0s and 1s). Each group typically represents one byte (8 bits).';
    case 'hex':
      return 'Hexadecimal format uses base-16 representation (0-9, A-F). Each pair of hex digits represents one byte.';
    case 'octal':
      return 'Octal format uses base-8 representation (0-7). Each group of 3 octal digits represents one byte.';
    case 'decimal':
      return 'Decimal format uses base-10 representation (0-9). Each number represents the decimal value of a byte (0-255).';
    case 'base64':
      return 'Base64 format encodes binary data using 64 ASCII characters. Each group of 4 characters represents 3 bytes.';
    default:
      return 'Unknown format';
  }
}

function getEncodingInfo(encoding: string): string {
  switch (encoding) {
    case 'utf8':
      return 'UTF-8 is a variable-width character encoding that can represent every character in Unicode. Uses 1-4 bytes per character.';
    case 'ascii':
      return 'ASCII is a 7-bit character encoding limited to 128 characters. Non-ASCII characters will be replaced or cause errors.';
    case 'utf16':
      return 'UTF-16 is a variable-width character encoding using 2 or 4 bytes per character. Common in Windows and Java.';
    case 'latin1':
      return 'Latin-1 (ISO-8859-1) is an 8-bit character encoding covering Western European languages.';
    default:
      return 'Unknown encoding';
  }
}

function getRecommendations(data: string, options: ConversionOptions, validGroups: number, invalidGroups: number): string[] {
  const recommendations: string[] = [];

  // Data quality recommendations
  if (invalidGroups > 0) {
    if (options.ignoreInvalid) {
      recommendations.push(`${invalidGroups} invalid groups were ignored. Consider validating input data.`);
    } else {
      recommendations.push(`${invalidGroups} invalid groups found. Check input format and data integrity.`);
    }
  }

  // Format-specific recommendations
  switch (options.inputFormat) {
    case 'binary':
      if (data.length % 8 !== 0) {
        recommendations.push('Binary data length should be a multiple of 8 for proper byte alignment.');
      }
      break;
    case 'hex':
      if (data.length % 2 !== 0) {
        recommendations.push('Hex data length should be even for proper byte representation.');
      }
      break;
    case 'base64':
      if (data.length % 4 !== 0) {
        recommendations.push('Base64 data length should be a multiple of 4 for proper padding.');
      }
      break;
  }

  // Encoding recommendations
  if (options.outputEncoding === 'ascii' && validGroups > 0) {
    recommendations.push('ASCII encoding may lose non-ASCII characters. Consider UTF-8 for better compatibility.');
  }

  // Performance recommendations
  if (data.length > 100000) {
    recommendations.push('Large dataset detected. Consider processing in chunks for better performance.');
  }

  // Security recommendations
  if (data.includes('password') || data.includes('secret') || data.includes('key')) {
    recommendations.push('Data appears to contain sensitive information. Ensure secure handling of decoded text.');
  }

  // General recommendations
  recommendations.push('Verify the decoded text matches the original intended content.');
  recommendations.push('Consider the character set limitations of the chosen encoding.');
  recommendations.push('Test with sample data to ensure correct conversion behavior.');

  return recommendations;
}