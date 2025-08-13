import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ASCII art fonts and patterns
const ASCII_FONTS = {
  standard: {
    'A': [
      '  /\\  ',
      ' /  \\ ',
      '/----\\',
      '|    |',
      '|    |'
    ],
    'B': [
      '|----\\',
      '|    |',
      '|----/',
      '|    |',
      '|----/'
    ],
    'C': [
      ' ----',
      '|    ',
      '|    ',
      '|    ',
      ' ----'
    ],
    'D': [
      '|----\\',
      '|    |',
      '|    |',
      '|    |',
      '|----/'
    ],
    'E': [
      '|----',
      '|    ',
      '|--- ',
      '|    ',
      '|----'
    ],
    'F': [
      '|----',
      '|    ',
      '|--- ',
      '|    ',
      '|    '
    ],
    'G': [
      ' ----',
      '|    ',
      '|  --',
      '|    |',
      ' ----'
    ],
    'H': [
      '|    |',
      '|    |',
      '|----|',
      '|    |',
      '|    |'
    ],
    'I': [
      '-----',
      '  |  ',
      '  |  ',
      '  |  ',
      '-----'
    ],
    'J': [
      '-----',
      '   | ',
      '   | ',
      '|  | ',
      ' \\_/ '
    ],
    'K': [
      '|    |',
      '|   / ',
      '|--<  ',
      '|   \\ ',
      '|    |'
    ],
    'L': [
      '|    ',
      '|    ',
      '|    ',
      '|    ',
      '|----'
    ],
    'M': [
      '|\\  /|',
      '| \\/ |',
      '|    |',
      '|    |',
      '|    |'
    ],
    'N': [
      '|\\   |',
      '| \\  |',
      '|  \\ |',
      '|   \\|',
      '|    |'
    ],
    'O': [
      ' ---- ',
      '|    |',
      '|    |',
      '|    |',
      ' ---- '
    ],
    'P': [
      '|----\\',
      '|    |',
      '|----/',
      '|    ',
      '|    '
    ],
    'Q': [
      ' ---- ',
      '|    |',
      '|    |',
      '|  \\ |',
      ' \\__| '
    ],
    'R': [
      '|----\\',
      '|    |',
      '|----/',
      '|   \\ ',
      '|    \\'
    ],
    'S': [
      ' ----',
      '|    ',
      ' --- ',
      '    |',
      '---- '
    ],
    'T': [
      '-----',
      '  |  ',
      '  |  ',
      '  |  ',
      '  |  '
    ],
    'U': [
      '|    |',
      '|    |',
      '|    |',
      '|    |',
      ' \\__/ '
    ],
    'V': [
      '|    |',
      '|    |',
      '|    |',
      ' \\  / ',
      '  \\/  '
    ],
    'W': [
      '|    |',
      '|    |',
      '| /\\ |',
      '|/  \\|',
      '|    |'
    ],
    'X': [
      '|\\  /|',
      '| \\/ |',
      '|    |',
      '| /\\ |',
      '|/  \\|'
    ],
    'Y': [
      '|\\  /|',
      '| \\/ |',
      '  |  ',
      '  |  ',
      '  |  '
    ],
    'Z': [
      '-----',
      '   / ',
      '  /  ',
      ' /   ',
      '-----'
    ],
    '0': [
      ' ---- ',
      '|    |',
      '|    |',
      '|    |',
      ' ---- '
    ],
    '1': [
      '  |  ',
      '  |  ',
      '  |  ',
      '  |  ',
      '  |  '
    ],
    '2': [
      ' ---- ',
      '    |',
      ' ---- ',
      '|    ',
      ' ---- '
    ],
    '3': [
      ' ---- ',
      '    |',
      ' ---- ',
      '    |',
      ' ---- '
    ],
    '4': [
      '|    |',
      '|    |',
      ' ---- ',
      '    |',
      '    |'
    ],
    '5': [
      ' ---- ',
      '|    ',
      ' ---- ',
      '    |',
      ' ---- '
    ],
    '6': [
      ' ---- ',
      '|    ',
      ' ---- ',
      '|    |',
      ' ---- '
    ],
    '7': [
      ' ---- ',
      '    |',
      '    |',
      '    |',
      '    |'
    ],
    '8': [
      ' ---- ',
      '|    |',
      ' ---- ',
      '|    |',
      ' ---- '
    ],
    '9': [
      ' ---- ',
      '|    |',
      ' ---- ',
      '    |',
      ' ---- '
    ],
    ' ': [
      '     ',
      '     ',
      '     ',
      '     ',
      '     '
    ],
    '!': [
      '  |  ',
      '  |  ',
      '  |  ',
      '     ',
      '  |  '
    ],
    '?': [
      ' __ ',
      '|  |',
      '  / ',
      '    ',
      '  | '
    ],
    '.': [
      '     ',
      '     ',
      '     ',
      '     ',
      '  |  '
    ],
    ',': [
      '     ',
      '     ',
      '     ',
      '  |  ',
      ' /   '
    ],
    ':': [
      '     ',
      '  |  ',
      '     ',
      '  |  ',
      '     '
    ],
    ';': [
      '     ',
      '  |  ',
      '     ',
      '  |  ',
      ' /   '
    ],
    "'": [
      ' | ',
      ' | ',
      '   ',
      '   ',
      '   '
    ],
    '"': [
      '| |',
      '| |',
      '   ',
      '   ',
      '   '
    ],
    '-': [
      '     ',
      '     ',
      '-----',
      '     ',
      '     '
    ],
    '+': [
      '     ',
      '  |  ',
      '-----',
      '  |  ',
      '     '
    ],
    '=': [
      '     ',
      '-----',
      '     ',
      '-----',
      '     '
    ],
    '/': [
      '    /',
      '   / ',
      '  /  ',
      ' /   ',
      '/    '
    ],
    '\\': [
      '\\    ',
      ' \\   ',
      '  \\  ',
      '   \\ ',
      '    \\'
    ],
    '(': [
      '  / ',
      ' |  ',
      ' |  ',
      ' |  ',
      '  \\ '
    ],
    ')': [
      ' /  ',
      ' |  ',
      ' |  ',
      ' |  ',
      ' \\  '
    ],
    '[': [
      ' ---',
      '|   ',
      '|   ',
      '|   ',
      ' ---'
    ],
    ']': [
      '--- ',
      '   |',
      '   |',
      '   |',
      '--- '
    ],
    '{': [
      '  / ',
      ' |  ',
      ' |  ',
      ' |  ',
      '  \\ '
    ],
    '}': [
      ' \\  ',
      '  | ',
      '  | ',
      '  | ',
      ' /  '
    ],
    '<': [
      '   /',
      '  / ',
      ' /  ',
      '  / ',
      '   /'
    ],
    '>': [
      '\\   ',
      ' \\  ',
      '  \\ ',
      ' \\  ',
      '   \\'
    ],
    '@': [
      ' --- ',
      '|   \\',
      '|  / ',
      '|   \\',
      ' --- '
    ],
    '#': [
      ' # # ',
      '#####',
      ' # # ',
      '#####',
      ' # # '
    ],
    '$': [
      '  |  ',
      ' --- ',
      '|    ',
      ' --- ',
      '  |  '
    ],
    '%': [
      '|   |',
      '   / ',
      '  /  ',
      ' /   ',
      '|   |'
    ],
    '^': [
      ' /\\ ',
      '/  \\',
      '    ',
      '    ',
      '    '
    ],
    '&': [
      '  / ',
      ' /  ',
      '  \\ ',
      ' /  ',
      ' \\  '
    ],
    '*': [
      '     ',
      '\\ | /',
      ' -X- ',
      '/ | \\',
      '     '
    ]
  }
};

// Simple ASCII patterns for different styles
const ASCII_PATTERNS = {
  banner: (text: string) => {
    const banner = '='.repeat(text.length + 4);
    return `${banner}\n| ${text} |\n${banner}`;
  },
  
  box: (text: string) => {
    const lines = text.split('\n');
    const maxLength = Math.max(...lines.map(line => line.length));
    const horizontal = '+' + '-'.repeat(maxLength + 2) + '+';
    
    let result = horizontal + '\n';
    for (const line of lines) {
      result += '| ' + line.padEnd(maxLength) + ' |\n';
    }
    result += horizontal;
    
    return result;
  },
  
  diamond: (text: string) => {
    const chars = text.replace(/\s/g, '').split('');
    if (chars.length === 0) return '';
    
    let result = '';
    const n = chars.length;
    
    // Upper half
    for (let i = 0; i < n; i++) {
      const spaces = ' '.repeat(n - i - 1);
      const char = chars[i];
      result += spaces + char + ' '.repeat(i * 2) + char + spaces + '\n';
    }
    
    // Lower half
    for (let i = n - 2; i >= 0; i--) {
      const spaces = ' '.repeat(n - i - 1);
      const char = chars[i];
      result += spaces + char + ' '.repeat(i * 2) + char + spaces + '\n';
    }
    
    return result.trim();
  },
  
  wave: (text: string) => {
    const chars = text.split('');
    let result = '';
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < chars.length; col++) {
        const char = chars[col];
        if (char === ' ') {
          result += '  ';
        } else {
          const offset = Math.sin(col * 0.5 + row * 0.3) * 2;
          result += ' '.repeat(Math.max(0, Math.floor(offset))) + char + ' '.repeat(Math.max(0, Math.floor(-offset)));
        }
      }
      result += '\n';
    }
    
    return result;
  }
};

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

    if (text.length > 100) {
      return NextResponse.json(
        { error: 'Text must be less than 100 characters for ASCII art generation' },
        { status: 400 }
      );
    }

    // Parse options
    const {
      style = 'standard',
      font = 'standard',
      width = 80,
      character = '#',
      align = 'left'
    } = options;

    let result = '';
    let statistics = {
      originalLength: text.length,
      asciiArtLength: 0,
      lineCount: 0,
      characterCount: 0
    };

    // Generate ASCII art based on style
    switch (style) {
      case 'standard':
        result = generateStandardASCII(text, font);
        break;
      case 'banner':
        result = ASCII_PATTERNS.banner(text);
        break;
      case 'box':
        result = ASCII_PATTERNS.box(text);
        break;
      case 'diamond':
        result = ASCII_PATTERNS.diamond(text);
        break;
      case 'wave':
        result = ASCII_PATTERNS.wave(text);
        break;
      case 'block':
        result = generateBlockASCII(text, character);
        break;
      default:
        result = generateStandardASCII(text, font);
    }

    // Apply alignment if needed
    if (align !== 'left' && style === 'standard') {
      result = applyAlignment(result, align, width);
    }

    // Calculate statistics
    statistics.asciiArtLength = result.length;
    statistics.lineCount = result.split('\n').length;
    statistics.characterCount = result.replace(/\s/g, '').length;

    // Initialize ZAI SDK for AI analysis
    let aiAnalysis = null;
    try {
      const zai = await ZAI.create();
      
      const analysisPrompt = `
        Analyze this ASCII art generation:
        
        Original text: "${text}"
        ASCII art style: ${style}
        Generated art length: ${statistics.asciiArtLength} characters
        Line count: ${statistics.lineCount}
        
        Provide insights about:
        1. The visual appeal and readability of the ASCII art
        2. Creative applications for this style of ASCII art
        3. Suggestions for improving the ASCII art generation
        4. Historical context of ASCII art in computing
        5. Tips for creating better ASCII art
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in ASCII art and text-based graphics. Provide creative and practical analysis of ASCII art generation.'
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
        asciiArt: result,
        options: {
          style,
          font,
          width,
          character,
          align
        },
        statistics,
        aiAnalysis
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('ASCII Art generation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during ASCII art generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate standard ASCII art
function generateStandardASCII(text: string, font: string): string {
  const fontData = ASCII_FONTS[font as keyof typeof ASCII_FONTS] || ASCII_FONTS.standard;
  const lines: string[] = [];
  
  // Initialize lines array
  const height = 5; // Standard height
  for (let i = 0; i < height; i++) {
    lines[i] = '';
  }
  
  // Process each character
  for (const char of text.toUpperCase()) {
    const charLines = fontData[char as keyof typeof fontData] || fontData[' '];
    
    for (let i = 0; i < height; i++) {
      lines[i] += charLines[i] || '     ';
    }
  }
  
  return lines.join('\n');
}

// Helper function to generate block ASCII art
function generateBlockASCII(text: string, character: string): string {
  const lines = text.split('\n');
  let result = '';
  
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    let asciiLine = '';
    
    for (const char of upperLine) {
      if (char === ' ') {
        asciiLine += '  ';
      } else {
        asciiLine += character + character;
      }
    }
    
    result += asciiLine + '\n';
  }
  
  return result.trim();
}

// Helper function to apply alignment
function applyAlignment(text: string, align: string, width: number): string {
  const lines = text.split('\n');
  const alignedLines = lines.map(line => {
    switch (align) {
      case 'center':
        return line.padStart(Math.floor((width + line.length) / 2)).padEnd(width);
      case 'right':
        return line.padStart(width);
      default:
        return line;
    }
  });
  
  return alignedLines.join('\n');
}

// Helper function to get available styles
export function getAvailableStyles(): string[] {
  return ['standard', 'banner', 'box', 'diamond', 'wave', 'block'];
}

// Helper function to get available fonts
export function getAvailableFonts(): string[] {
  return ['standard'];
}