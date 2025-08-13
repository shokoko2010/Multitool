import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, operation = 'encode', encoding = 'standard' } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!['encode', 'decode'].includes(operation)) {
      return NextResponse.json(
        { error: 'Operation must be either "encode" or "decode"' },
        { status: 400 }
      );
    }

    if (!['standard', 'plus', 'strict'].includes(encoding)) {
      return NextResponse.json(
        { error: 'Encoding must be either "standard", "plus", or "strict"' },
        { status: 400 }
      );
    }

    let result: string;
    let details: any = {};

    if (operation === 'encode') {
      // URL encoding
      switch (encoding) {
        case 'standard':
          result = encodeURIComponent(text);
          details.method = 'Standard encodeURIComponent';
          break;
        case 'plus':
          // Replace spaces with + instead of %20
          result = encodeURIComponent(text).replace(/%20/g, '+');
          details.method = 'Space as + (+ encoding)';
          break;
        case 'strict':
          // More strict encoding for form data
          result = text
            .replace(/[^a-zA-Z0-9\-_.~]/g, (char) => {
              const hex = char.charCodeAt(0).toString(16).toUpperCase();
              return '%' + (hex.length === 1 ? '0' + hex : hex);
            });
          details.method = 'Strict RFC 3986 encoding';
          break;
      }

      // Analyze encoded components
      const encodedComponents = {
        spaces: (text.match(/ /g) || []).length,
        specialChars: (text.match(/[^a-zA-Z0-9\-_.~]/g) || []).length,
        encodedChars: (result.match(/%/g) || []).length,
        encodingRatio: ((result.length / text.length) * 100).toFixed(2) + '%'
      };

      details.components = encodedComponents;

    } else {
      // URL decoding
      try {
        switch (encoding) {
          case 'standard':
            result = decodeURIComponent(text);
            details.method = 'Standard decodeURIComponent';
            break;
          case 'plus':
            // Handle + as spaces
            result = decodeURIComponent(text.replace(/\+/g, ' '));
            details.method = 'Plus to space decoding';
            break;
          case 'strict':
            // More strict decoding
            result = text.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
              return String.fromCharCode(parseInt(hex, 16));
            });
            details.method = 'Strict RFC 3986 decoding';
            break;
        }

        // Analyze decoded components
        const decodedComponents = {
          encodedSequences: (text.match(/%[0-9A-F]{2}/gi) || []).length,
          plusSigns: (text.match(/\+/g) || []).length,
          originalLength: text.length,
          decodedLength: result.length,
          sizeReduction: text.length > result.length ? 
            ((text.length - result.length) / text.length * 100).toFixed(2) + '%' : 
            '0%'
        };

        details.components = decodedComponents;

      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid URL encoding. Malformed percent-encoded sequence.' },
          { status: 400 }
        );
      }
    }

    // Validate URL structure if it appears to be a URL
    const urlValidation = {
      isValidUrl: false,
      protocol: null,
      domain: null,
      path: null,
      query: null,
      fragment: null
    };

    try {
      const testUrl = operation === 'encode' ? result : text;
      if (testUrl.match(/^https?:\/\//)) {
        const url = new URL(testUrl);
        urlValidation.isValidUrl = true;
        urlValidation.protocol = url.protocol;
        urlValidation.domain = url.hostname;
        urlValidation.path = url.pathname;
        urlValidation.query = url.search;
        urlValidation.fragment = url.hash;
      }
    } catch (error) {
      // Not a valid URL, which is fine
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a web development expert. Analyze the URL encoding/decoding operation and provide best practices for URL handling.'
          },
          {
            role: 'user',
            content: `Performed URL ${operation}ation on text (${text.length} characters) using ${encoding} encoding. ${operation === 'encode' ? 'Encoded length: ' + result.length + ' characters' : 'Decoded from ' + text.length + ' to ' + result.length + ' characters'}. Provide analysis and recommendations for proper URL handling.`
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
      encoding,
      details,
      urlValidation,
      aiInsights
    });

  } catch (error) {
    console.error('URL encoding/decoding error:', error);
    return NextResponse.json(
      { error: 'Failed to perform URL encoding/decoding' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'URL Encoder/Decoder API',
    usage: 'POST /api/web-tools/url-encoder',
    parameters: {
      text: 'Text to encode or decode (required)',
      operation: 'Operation: "encode" or "decode" (default: "encode") - optional',
      encoding: 'Encoding type: "standard", "plus", or "strict" (default: "standard") - optional'
    },
    encodingTypes: {
      standard: 'Standard encodeURIComponent/decodeURIComponent',
      plus: 'Spaces encoded as + instead of %20',
      strict: 'Strict RFC 3986 compliance for form data'
    },
    examples: [
      {
        text: 'Hello World!',
        operation: 'encode',
        encoding: 'standard',
        result: 'Hello%20World%21'
      },
      {
        text: 'Hello%20World%21',
        operation: 'decode',
        encoding: 'standard',
        result: 'Hello World!'
      },
      {
        text: 'search query here',
        operation: 'encode',
        encoding: 'plus',
        result: 'search+query+here'
      }
    ]
  });
}