import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Morse code mapping
const MORSE_CODE: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  ' ': '/'
};

const REVERSE_MORSE: { [key: string]: string } = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([key, value]) => [value, key])
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options = {} } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text must be less than 10,000 characters' },
        { status: 400 }
      );
    }

    // Parse options
    const {
      caseSensitive = false,
      separator = ' ',
      validate = true,
      includeSpaces = true
    } = options;

    // Convert text to uppercase for Morse code (unless case sensitive)
    const processedText = caseSensitive ? text : text.toUpperCase();

    let result = '';
    let errors: string[] = [];

    // Convert each character to Morse code
    for (let i = 0; i < processedText.length; i++) {
      const char = processedText[i];
      
      if (char === ' ') {
        if (includeSpaces) {
          result += MORSE_CODE[' '] + separator;
        }
        continue;
      }

      if (MORSE_CODE[char]) {
        result += MORSE_CODE[char] + separator;
      } else if (validate) {
        errors.push(`Unsupported character: '${char}' at position ${i}`);
        // Skip unsupported characters or use a placeholder
        result += '?' + separator;
      }
    }

    // Remove trailing separator
    result = result.trim();

    // Initialize ZAI SDK for AI analysis
    let aiAnalysis = null;
    try {
      const zai = await ZAI.create();
      
      const analysisPrompt = `
        Analyze this text to Morse code conversion:
        
        Original text: "${text}"
        Morse code: "${result}"
        Conversion options: ${JSON.stringify(options)}
        ${errors.length > 0 ? `Errors encountered: ${errors.join(', ')}` : ''}
        
        Provide insights about:
        1. The complexity and readability of the Morse code
        2. Common patterns or sequences
        3. Practical applications for this conversion
        4. Suggestions for improving readability
        5. Interesting facts about the converted text
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Morse code and communication systems. Provide detailed, practical analysis of text to Morse code conversions.'
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
        originalText: text,
        morseCode: result,
        options: {
          caseSensitive,
          separator,
          validate,
          includeSpaces
        },
        statistics: {
          originalLength: text.length,
          morseCodeLength: result.length,
          characterCount: processedText.replace(/\s/g, '').length,
          wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
          errorCount: errors.length
        },
        errors: errors.length > 0 ? errors : undefined,
        aiAnalysis
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Text to Morse Code conversion error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during Morse code conversion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function for Morse code to text conversion
export function morseToText(morseCode: string, options: any = {}): { text: string; errors: string[] } {
  const {
    separator = ' ',
    validate = true,
    preserveCase = false
  } = options;

  const words = morseCode.trim().split(/\s+/);
  let result = '';
  let errors: string[] = [];

  for (const word of words) {
    if (word === '/') {
      result += ' ';
      continue;
    }

    if (REVERSE_MORSE[word]) {
      result += REVERSE_MORSE[word];
    } else if (validate && word.length > 0) {
      errors.push(`Invalid Morse code: '${word}'`);
      result += '?';
    }
  }

  return {
    text: preserveCase ? result : result.toLowerCase(),
    errors
  };
}