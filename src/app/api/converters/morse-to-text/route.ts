import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Morse code mapping (reverse of text-to-morse)
const MORSE_TO_TEXT: { [key: string]: string } = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
  '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
  '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
  '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
  '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
  '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
  '---..': '8', '----.': '9', '.-.-.-': '.', '--..--': ',', '..--..': '?',
  '.----.': "'", '-.-.--': '!', '-..-.': '/', '-.--.': '(', '-.--.-': ')',
  '.-...': '&', '---...': ':', '-.-.-.': ';', '-...-': '=', '.-.-.': '+',
  '-....-': '-', '..--.-': '_', '.-..-.': '"', '...-..-': '$', '.--.-.': '@',
  '/': ' '
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { morseCode, options = {} } = body;

    // Validate input
    if (!morseCode || typeof morseCode !== 'string') {
      return NextResponse.json(
        { error: 'Morse code is required and must be a string' },
        { status: 400 }
      );
    }

    if (morseCode.length > 50000) {
      return NextResponse.json(
        { error: 'Morse code must be less than 50,000 characters' },
        { status: 400 }
      );
    }

    // Parse options
    const {
      separator = ' ',
      validate = true,
      preserveCase = false,
      handleInvalid = 'skip' // 'skip', 'replace', 'error'
    } = options;

    let result = '';
    let errors: string[] = [];
    let statistics = {
      morseCodeLength: morseCode.length,
      characterCount: 0,
      wordCount: 0,
      errorCount: 0,
      validCodeCount: 0
    };

    // Split Morse code into individual codes
    const codes = morseCode.trim().split(/\s+/);
    
    for (const code of codes) {
      if (code === '') continue;

      if (MORSE_TO_TEXT[code]) {
        result += MORSE_TO_TEXT[code];
        statistics.validCodeCount++;
        statistics.characterCount++;
      } else if (code === '/') {
        result += ' ';
        statistics.wordCount++;
      } else {
        statistics.errorCount++;
        
        if (validate) {
          errors.push(`Invalid Morse code: '${code}'`);
          
          switch (handleInvalid) {
            case 'replace':
              result += '?';
              statistics.characterCount++;
              break;
            case 'error':
              return NextResponse.json(
                { 
                  error: 'Invalid Morse code detected',
                  details: `Invalid Morse code: '${code}'`,
                  position: morseCode.indexOf(code)
                },
                { status: 400 }
              );
            case 'skip':
            default:
              // Skip invalid codes
              break;
          }
        }
      }
    }

    // Count words in the result
    statistics.wordCount = result.split(/\s+/).filter(word => word.length > 0).length;

    // Initialize ZAI SDK for AI analysis
    let aiAnalysis = null;
    try {
      const zai = await ZAI.create();
      
      const analysisPrompt = `
        Analyze this Morse code to text conversion:
        
        Original Morse code: "${morseCode}"
        Converted text: "${result}"
        Conversion options: ${JSON.stringify(options)}
        ${errors.length > 0 ? `Errors encountered: ${errors.join(', ')}` : ''}
        
        Provide insights about:
        1. The accuracy and quality of the conversion
        2. Common Morse code patterns found
        3. Potential applications for this conversion
        4. Suggestions for improving Morse code input
        5. Historical context or interesting facts about the message
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Morse code and communication systems. Provide detailed analysis of Morse code to text conversions.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      aiAnalysis = completion.choices[0]?.message?.content || null;
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError);
      // Continue without AI analysis
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        originalMorseCode: morseCode,
        convertedText: preserveCase ? result : result.toLowerCase(),
        options: {
          separator,
          validate,
          preserveCase,
          handleInvalid
        },
        statistics,
        errors: errors.length > 0 ? errors : undefined,
        aiAnalysis
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Morse Code to Text conversion error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during Morse code to text conversion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to validate Morse code
export function validateMorseCode(morseCode: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const codes = morseCode.trim().split(/\s+/);
  
  for (const code of codes) {
    if (code === '' || code === '/') continue;
    
    if (!MORSE_TO_TEXT[code]) {
      errors.push(`Invalid Morse code sequence: '${code}'`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to get Morse code statistics
export function getMorseCodeStats(morseCode: string) {
  const codes = morseCode.trim().split(/\s+/).filter(code => code !== '');
  const uniqueCodes = new Set(codes);
  
  return {
    totalCodes: codes.length,
    uniqueCodes: uniqueCodes.size,
    averageCodeLength: codes.reduce((sum, code) => sum + code.length, 0) / codes.length,
    longestCode: codes.reduce((longest, code) => code.length > longest.length ? code : longest, ''),
    shortestCode: codes.reduce((shortest, code) => code.length < shortest.length ? code : shortest, codes[0] || '')
  };
}