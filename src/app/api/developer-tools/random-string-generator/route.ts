import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface RandomStringOptions {
  length?: number;
  type?: 'alphanumeric' | 'alphabetic' | 'numeric' | 'hex' | 'binary' | 'custom';
  uppercase?: boolean;
  lowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean;
  excludeAmbiguous?: boolean;
  customCharset?: string;
  count?: number;
  unique?: boolean;
}

interface RandomStringResult {
  success: boolean;
  data?: {
    strings: string[];
    options: RandomStringOptions;
    metadata: {
      totalGenerated: number;
      charset: string;
      charsetSize: number;
      entropy: number;
      generationTime: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { options = {} } = await request.json();

    // Set default options
    const stringOptions: RandomStringOptions = {
      length: Math.min(Math.max(options.length || 12, 1), 1000),
      type: options.type || 'alphanumeric',
      uppercase: options.uppercase !== false,
      lowercase: options.lowercase !== false,
      includeNumbers: options.includeNumbers !== false,
      includeSymbols: options.includeSymbols || false,
      excludeSimilar: options.excludeSimilar || false,
      excludeAmbiguous: options.excludeAmbiguous || false,
      customCharset: options.customCharset || undefined,
      count: Math.min(Math.max(options.count || 1, 1), 100),
      unique: options.unique || false
    };

    // Validate options
    if (stringOptions.length < 1 || stringOptions.length > 1000) {
      return NextResponse.json<RandomStringResult>({
        success: false,
        error: 'Length must be between 1 and 1000'
      }, { status: 400 });
    }

    if (stringOptions.count < 1 || stringOptions.count > 100) {
      return NextResponse.json<RandomStringResult>({
        success: false,
        error: 'Count must be between 1 and 100'
      }, { status: 400 });
    }

    // Generate charset based on options
    const charset = generateCharset(stringOptions);
    
    if (charset.length === 0) {
      return NextResponse.json<RandomStringResult>({
        success: false,
        error: 'No valid characters available for generation'
      }, { status: 400 });
    }

    // Check if unique strings are possible
    if (stringOptions.unique) {
      const possibleCombinations = Math.pow(charset.length, stringOptions.length);
      if (possibleCombinations < stringOptions.count) {
        return NextResponse.json<RandomStringResult>({
          success: false,
          error: `Cannot generate ${stringOptions.count} unique strings with current charset. Maximum possible: ${possibleCombinations}`
        }, { status: 400 });
      }
    }

    const startTime = Date.now();
    
    // Generate random strings
    const strings: string[] = [];
    const usedStrings = new Set<string>();
    
    while (strings.length < stringOptions.count) {
      const randomString = generateRandomString(stringOptions.length, charset);
      
      if (!stringOptions.unique || !usedStrings.has(randomString)) {
        strings.push(randomString);
        if (stringOptions.unique) {
          usedStrings.add(randomString);
        }
      }
    }

    const generationTime = Date.now() - startTime;

    // Calculate entropy
    const entropy = Math.log2(charset.length) * stringOptions.length;

    const metadata = {
      totalGenerated: strings.length,
      charset,
      charsetSize: charset.length,
      entropy,
      generationTime
    };

    const result = {
      strings,
      options: stringOptions,
      metadata
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a random string generation expert. Analyze the random string generation parameters and provide insights about security, randomness quality, and best practices for different use cases.'
          },
          {
            role: 'user',
            content: `Analyze this random string generation:\n\nType: ${stringOptions.type}\nLength: ${stringOptions.length}\nCount: ${stringOptions.count}\nUnique: ${stringOptions.unique}\nCharset Size: ${metadata.charsetSize}\nEntropy: ${metadata.entropy.toFixed(2)} bits\nGeneration Time: ${metadata.generationTime}ms\n\nOptions: ${JSON.stringify({
              uppercase: stringOptions.uppercase,
              lowercase: stringOptions.lowercase,
              includeNumbers: stringOptions.includeNumbers,
              includeSymbols: stringOptions.includeSymbols,
              excludeSimilar: stringOptions.excludeSimilar,
              excludeAmbiguous: stringOptions.excludeAmbiguous
            }, null, 2)}\n\nSample Strings: ${strings.slice(0, 3).map(s => `"${s}"`).join(', ')}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<RandomStringResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Random string generation error:', error);
    return NextResponse.json<RandomStringResult>({
      success: false,
      error: 'Internal server error during random string generation'
    }, { status: 500 });
  }
}

function generateCharset(options: RandomStringOptions): string {
  let charset = '';

  if (options.customCharset) {
    charset = options.customCharset;
  } else {
    switch (options.type) {
      case 'alphanumeric':
        if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.includeNumbers) charset += '0123456789';
        break;
      
      case 'alphabetic':
        if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        break;
      
      case 'numeric':
        charset = '0123456789';
        break;
      
      case 'hex':
        charset = '0123456789ABCDEF';
        break;
      
      case 'binary':
        charset = '01';
        break;
      
      case 'custom':
        // Use the provided custom charset
        break;
    }

    // Add symbols if requested
    if (options.includeSymbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }
  }

  // Remove similar characters if requested
  if (options.excludeSimilar) {
    const similarChars = 'il1Lo0O';
    charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
  }

  // Remove ambiguous characters if requested
  if (options.excludeAmbiguous) {
    const ambiguousChars = 'B8G6I1l|O0DS5Z2';
    charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
  }

  return charset;
}

function generateRandomString(length: number, charset: string): string {
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charset.length;
    result += charset[randomIndex];
  }

  return result;
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with options'
  }, { status: 405 });
}