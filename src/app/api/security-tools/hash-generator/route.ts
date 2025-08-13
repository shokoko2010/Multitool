import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, algorithms = ['md5', 'sha1', 'sha256', 'sha512'], outputFormat = 'hex' } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text to hash is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(algorithms) || algorithms.length === 0) {
      return NextResponse.json(
        { error: 'At least one algorithm must be specified' },
        { status: 400 }
      );
    }

    const validAlgorithms = ['md5', 'sha1', 'sha256', 'sha512', 'sha3-256', 'sha3-512'];
    const invalidAlgorithms = algorithms.filter(alg => !validAlgorithms.includes(alg));
    if (invalidAlgorithms.length > 0) {
      return NextResponse.json(
        { error: `Invalid algorithms: ${invalidAlgorithms.join(', ')}. Valid algorithms: ${validAlgorithms.join(', ')}` },
        { status: 400 }
      );
    }

    if (!['hex', 'base64', 'binary'].includes(outputFormat)) {
      return NextResponse.json(
        { error: 'Invalid output format. Must be hex, base64, or binary' },
        { status: 400 }
      );
    }

    // Generate hashes
    const hashes: Record<string, string> = {};
    
    for (const algorithm of algorithms) {
      try {
        let hash: string;
        
        switch (algorithm) {
          case 'md5':
            hash = crypto.createHash('md5').update(text).digest(outputFormat as crypto.BinaryToTextEncoding);
            break;
          case 'sha1':
            hash = crypto.createHash('sha1').update(text).digest(outputFormat as crypto.BinaryToTextEncoding);
            break;
          case 'sha256':
            hash = crypto.createHash('sha256').update(text).digest(outputFormat as crypto.BinaryToTextEncoding);
            break;
          case 'sha512':
            hash = crypto.createHash('sha512').update(text).digest(outputFormat as crypto.BinaryToTextEncoding);
            break;
          case 'sha3-256':
            hash = crypto.createHash('sha3-256').update(text).digest(outputFormat as crypto.BinaryToTextEncoding);
            break;
          case 'sha3-512':
            hash = crypto.createHash('sha3-512').update(text).digest(outputFormat as crypto.BinaryToTextEncoding);
            break;
          default:
            continue;
        }
        
        hashes[algorithm] = hash;
      } catch (error) {
        console.warn(`Failed to generate ${algorithm} hash:`, error);
      }
    }

    // Calculate hash metadata
    const metadata = {
      inputLength: text.length,
      algorithms: Object.keys(hashes),
      outputFormat,
      timestamp: new Date().toISOString()
    };

    // Analyze hash strength and security
    const securityAnalysis = {
      md5: {
        strength: 'Weak',
        description: 'MD5 is cryptographically broken and unsuitable for security purposes',
        recommended: false
      },
      sha1: {
        strength: 'Weak',
        description: 'SHA-1 is cryptographically broken and unsuitable for security purposes',
        recommended: false
      },
      sha256: {
        strength: 'Strong',
        description: 'SHA-256 is currently secure and widely recommended',
        recommended: true
      },
      sha512: {
        strength: 'Strong',
        description: 'SHA-512 provides higher security than SHA-256',
        recommended: true
      },
      'sha3-256': {
        strength: 'Very Strong',
        description: 'SHA3-256 is the latest standard with improved security',
        recommended: true
      },
      'sha3-512': {
        strength: 'Very Strong',
        description: 'SHA3-512 provides the highest security level',
        recommended: true
      }
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a cryptography and security expert. Analyze the hash generation and provide security recommendations.'
          },
          {
            role: 'user',
            content: `Generated hashes for text input (${text.length} characters) using algorithms: ${algorithms.join(', ')} in ${outputFormat} format. Provide security analysis and recommendations for proper hash usage.`
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
      hashes,
      metadata,
      securityAnalysis,
      aiInsights
    });

  } catch (error) {
    console.error('Hash generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hashes' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Hash Generator API',
    usage: 'POST /api/security-tools/hash-generator',
    parameters: {
      text: 'Text to hash (required)',
      algorithms: 'Array of hash algorithms (default: ["md5", "sha1", "sha256", "sha512"]) - optional',
      outputFormat: 'Output format: hex, base64, or binary (default: "hex") - optional'
    },
    availableAlgorithms: ['md5', 'sha1', 'sha256', 'sha512', 'sha3-256', 'sha3-512'],
    example: {
      text: 'Hello World',
      algorithms: ['sha256', 'sha512'],
      outputFormat: 'hex'
    }
  });
}