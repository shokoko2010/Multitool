import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, operation = 'encode', encodeType = 'named', preserveWhitespace = false } = body;

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

    if (!['named', 'numeric', 'hex'].includes(encodeType)) {
      return NextResponse.json(
        { error: 'Encode type must be either "named", "numeric", or "hex"' },
        { status: 400 }
      );
    }

    // HTML entity mappings
    const htmlEntities: Record<string, string> = {
      '"': '&quot;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      ' ': preserveWhitespace ? ' ' : '&nbsp;',
      '©': '&copy;',
      '®': '&reg;',
      '€': '&euro;',
      '£': '&pound;',
      '¥': '&yen;',
      '¢': '&cent;',
      '§': '&sect;',
      '¶': '&para;',
      '°': '&deg;',
      '±': '&plusmn;',
      '×': '&times;',
      '÷': '&divide;',
      'α': '&alpha;',
      'β': '&beta;',
      'γ': '&gamma;',
      'δ': '&delta;',
      'ε': '&epsilon;',
      'ζ': '&zeta;',
      'η': '&eta;',
      'θ': '&theta;',
      'ι': '&iota;',
      'κ': '&kappa;',
      'λ': '&lambda;',
      'μ': '&mu;',
      'ν': '&nu;',
      'ξ': '&xi;',
      'ο': '&omicron;',
      'π': '&pi;',
      'ρ': '&rho;',
      'σ': '&sigma;',
      'τ': '&tau;',
      'υ': '&upsilon;',
      'φ': '&phi;',
      'χ': '&chi;',
      'ψ': '&psi;',
      'ω': '&omega;'
    };

    // Reverse mapping for decoding
    const reverseEntities: Record<string, string> = {};
    for (const [char, entity] of Object.entries(htmlEntities)) {
      reverseEntities[entity] = char;
    }

    let result: string;
    let stats: any = {};

    if (operation === 'encode') {
      // HTML entity encoding
      let encodedText = text;
      let entityCount = 0;

      // Encode based on type
      switch (encodeType) {
        case 'named':
          for (const [char, entity] of Object.entries(htmlEntities)) {
            const regex = new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = encodedText.match(regex);
            if (matches) {
              entityCount += matches.length;
              encodedText = encodedText.replace(regex, entity);
            }
          }
          break;

        case 'numeric':
          encodedText = encodedText.replace(/[^a-zA-Z0-9\s]/g, (char) => {
            entityCount++;
            return `&#${char.charCodeAt(0)};`;
          });
          break;

        case 'hex':
          encodedText = encodedText.replace(/[^a-zA-Z0-9\s]/g, (char) => {
            entityCount++;
            return `&#x${char.charCodeAt(0).toString(16).toUpperCase()};`;
          });
          break;
      }

      result = encodedText;
      stats = {
        encodeType,
        entitiesGenerated: entityCount,
        originalLength: text.length,
        encodedLength: result.length,
        expansionRatio: ((result.length / text.length) * 100).toFixed(2) + '%'
      };

    } else {
      // HTML entity decoding
      let decodedText = text;
      let entityCount = 0;

      // Decode all entity types
      const entityRegex = /&(?:#(\d+)|#x([0-9A-Fa-f]+)|([a-zA-Z]+));/g;
      
      decodedText = decodedText.replace(entityRegex, (match, numeric, hex, named) => {
        entityCount++;
        
        if (numeric) {
          // Numeric entity
          return String.fromCharCode(parseInt(numeric, 10));
        } else if (hex) {
          // Hexadecimal entity
          return String.fromCharCode(parseInt(hex, 16));
        } else if (named) {
          // Named entity
          return reverseEntities[`&${named};`] || match;
        }
        
        return match;
      });

      result = decodedText;
      stats = {
        entitiesDecoded: entityCount,
        originalLength: text.length,
        decodedLength: result.length,
        compressionRatio: text.length > result.length ? 
          ((text.length - result.length) / text.length * 100).toFixed(2) + '%' : 
          '0%'
      };
    }

    // Analyze content for HTML safety
    const htmlSafety = {
      containsHtmlTags: /<[a-zA-Z][^>]*>.*?<\/[a-zA-Z][^>]*>|<[a-zA-Z][^>]*\/>/.test(result),
      containsScripts: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i.test(result),
      containsStyles: /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/i.test(result),
      containsEvents: /on\w+\s*=/i.test(result),
      isSafeForDisplay: !/<[a-zA-Z][^>]*>.*?<\/[a-zA-Z][^>]*>|<[a-zA-Z][^>]*\/>/.test(result)
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a web security and HTML expert. Analyze the HTML entity encoding/decoding operation and provide security recommendations.'
          },
          {
            role: 'user',
            content: `Performed HTML entity ${operation}ation on text (${text.length} characters) using ${encodeType} encoding. ${operation === 'encode' ? 'Generated ' + stats.entitiesGenerated + ' entities' : 'Decoded ' + stats.entitiesDecoded + ' entities'}. HTML safety analysis: ${JSON.stringify(htmlSafety)}. Provide security analysis and best practices.`
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
      stats,
      htmlSafety,
      aiInsights
    });

  } catch (error) {
    console.error('HTML entity encoding/decoding error:', error);
    return NextResponse.json(
      { error: 'Failed to perform HTML entity encoding/decoding' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'HTML Entity Encoder/Decoder API',
    usage: 'POST /api/web-tools/html-entity-encoder',
    parameters: {
      text: 'Text to encode or decode (required)',
      operation: 'Operation: "encode" or "decode" (default: "encode") - optional',
      encodeType: 'Encoding type: "named", "numeric", or "hex" (default: "named") - optional',
      preserveWhitespace: 'Preserve whitespace characters (default: false) - optional'
    },
    encodingTypes: {
      named: 'Use named entities like &amp;, &lt;, &gt;',
      numeric: 'Use numeric entities like &#38;, &#60;, &#62;',
      hex: 'Use hexadecimal entities like &#x26;, &#x3C;, &#x3E;'
    },
    commonEntities: {
      '&quot;': '"',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&apos;': "'",
      '&nbsp;': ' ',
      '&copy;': '©',
      '&reg;': '®'
    },
    examples: [
      {
        text: '<script>alert("Hello");</script>',
        operation: 'encode',
        encodeType: 'named',
        result: '&lt;script&gt;alert(&quot;Hello&quot;);&lt;/script&gt;'
      },
      {
        text: '&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;',
        operation: 'decode',
        encodeType: 'named',
        result: '<div>Hello & Welcome</div>'
      },
      {
        text: 'Hello © 2024',
        operation: 'encode',
        encodeType: 'numeric',
        result: 'Hello &#169; 2024'
      }
    ]
  });
}