import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, operation = 'decode', encoding = 'utf8', lineBreaks = false } = body;

    // Input validation
    if (!data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      );
    }

    if (!['encode', 'decode'].includes(operation)) {
      return NextResponse.json(
        { error: 'Operation must be either "encode" or "decode"' },
        { status: 400 }
      );
    }

    if (!['utf8', 'ascii', 'latin1', 'base64url', 'hex'].includes(encoding)) {
      return NextResponse.json(
        { error: 'Invalid encoding. Must be utf8, ascii, latin1, base64url, or hex' },
        { status: 400 }
      );
    }

    let result: string;
    let metadata: any = {};

    if (operation === 'encode') {
      // Base64 encoding
      try {
        let buffer: Buffer;
        
        // Convert input to buffer based on encoding
        switch (encoding) {
          case 'utf8':
            buffer = Buffer.from(data, 'utf8');
            break;
          case 'ascii':
            buffer = Buffer.from(data, 'ascii');
            break;
          case 'latin1':
            buffer = Buffer.from(data, 'latin1');
            break;
          case 'base64url':
            // First decode from base64url, then we'll re-encode as standard base64
            const base64urlCleaned = data.replace(/[-_]/g, (match) => match === '-' ? '+' : '/');
            buffer = Buffer.from(base64urlCleaned + '='.repeat((4 - base64urlCleaned.length % 4) % 4), 'base64');
            break;
          case 'hex':
            buffer = Buffer.from(data, 'hex');
            break;
          default:
            buffer = Buffer.from(data, 'utf8');
        }

        // Encode to base64
        result = buffer.toString('base64');

        // Add line breaks if requested (MIME format)
        if (lineBreaks) {
          result = result.match(/.{1,76}/g)?.join('\n') || result;
        }

        metadata = {
          originalEncoding: encoding,
          originalLength: data.length,
          encodedLength: result.length,
          encodingRatio: ((result.length / data.length) * 100).toFixed(2) + '%',
          lineBreaks,
          isBase64Url: false
        };

      } catch (error) {
        return NextResponse.json(
          { error: `Failed to encode data with ${encoding} encoding` },
          { status: 400 }
        );
      }

    } else {
      // Base64 decoding
      try {
        let base64Data = data;

        // Handle base64url format
        const isBase64Url = /^[A-Za-z0-9_-]*$/.test(data);
        if (isBase64Url) {
          base64Data = data.replace(/[-_]/g, (match) => match === '-' ? '+' : '/');
          // Add padding if needed
          base64Data += '='.repeat((4 - base64Data.length % 4) % 4);
        }

        // Remove line breaks if present
        base64Data = base64Data.replace(/\s/g, '');

        // Validate base64 format
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
          return NextResponse.json(
            { error: 'Invalid Base64 format' },
            { status: 400 }
          );
        }

        // Decode from base64
        const buffer = Buffer.from(base64Data, 'base64');

        // Convert to requested encoding
        switch (encoding) {
          case 'utf8':
            result = buffer.toString('utf8');
            break;
          case 'ascii':
            result = buffer.toString('ascii');
            break;
          case 'latin1':
            result = buffer.toString('latin1');
            break;
          case 'base64url':
            result = buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            break;
          case 'hex':
            result = buffer.toString('hex');
            break;
          default:
            result = buffer.toString('utf8');
        }

        metadata = {
          targetEncoding: encoding,
          originalLength: data.length,
          decodedLength: result.length,
          sizeReduction: data.length > result.length ? 
            ((data.length - result.length) / data.length * 100).toFixed(2) + '%' : 
            '0%',
          wasBase64Url: isBase64Url,
          hasPadding: /={1,2}$/.test(data)
        };

        // Try to detect if decoded result is JSON
        try {
          const parsed = JSON.parse(result);
          metadata.detectedFormat = 'JSON';
          metadata.jsonStructure = {
            type: Array.isArray(parsed) ? 'array' : typeof parsed,
            size: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length
          };
        } catch {
          // Not JSON
          if (result.includes('<') && result.includes('>')) {
            metadata.detectedFormat = 'HTML/XML';
          } else if (result.includes('{') && result.includes('}')) {
            metadata.detectedFormat = 'Possible JSON/Object';
          } else if (/^[\w-]+:\/\//.test(result)) {
            metadata.detectedFormat = 'URL';
          } else {
            metadata.detectedFormat = 'Text';
          }
        }

      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to decode Base64 data. Invalid format or encoding.' },
          { status: 400 }
        );
      }
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a data encoding expert. Analyze the Base64 encoding/decoding operation and provide insights about the data and best practices.'
          },
          {
            role: 'user',
            content: `Performed Base64 ${operation}ation on data (${data.length} characters) with ${encoding} encoding. ${operation === 'encode' ? 'Encoded length: ' + result.length + ' characters' : 'Decoded from ' + data.length + ' to ' + result.length + ' characters'}. Detected format: ${metadata.detectedFormat || 'Unknown'}. Provide analysis and recommendations.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    return NextResponse.json({
      success: true,
      result,
      operation,
      metadata,
      aiInsights
    });

  } catch (error) {
    console.error('Base64 encoding/decoding error:', error);
    return NextResponse.json(
      { error: 'Failed to perform Base64 encoding/decoding' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Base64 Encoder/Decoder API',
    usage: 'POST /api/developer-tools/base64-decoder',
    parameters: {
      data: 'Data to encode or decode (required)',
      operation: 'Operation: "encode" or "decode" (default: "decode") - optional',
      encoding: 'Output encoding: "utf8", "ascii", "latin1", "base64url", or "hex" (default: "utf8") - optional',
      lineBreaks: 'Add line breaks every 76 characters for MIME format (default: false) - optional'
    },
    supportedEncodings: {
      utf8: 'UTF-8 text encoding',
      ascii: 'ASCII text encoding',
      latin1: 'Latin-1 (ISO-8859-1) encoding',
      base64url: 'URL-safe Base64 variant',
      hex: 'Hexadecimal encoding'
    },
    examples: [
      {
        data: 'Hello World!',
        operation: 'encode',
        encoding: 'utf8',
        result: 'SGVsbG8gV29ybGQh'
      },
      {
        data: 'SGVsbG8gV29ybGQh',
        operation: 'decode',
        encoding: 'utf8',
        result: 'Hello World!'
      },
      {
        data: 'SGVsbG8gV29ybGQh',
        operation: 'decode',
        encoding: 'base64url',
        result: 'SGVsbG8gV29ybGQh'
      }
    ]
  });
}