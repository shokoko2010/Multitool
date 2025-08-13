import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

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
      mode = 'reverse', // 'reverse', 'words', 'lines', 'mirrored'
      preserveCase = true,
      preserveSpacing = true,
      reverseUnicode = false
    } = options;

    // Validate mode
    const validModes = ['reverse', 'words', 'lines', 'mirrored'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: `Invalid mode. Must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      );
    }

    let result = '';
    let transformations: Array<{ type: string; from: string; to: string; position: number }> = [];

    // Apply different reversal modes
    switch (mode) {
      case 'reverse':
        // Simple character reversal
        result = reverseString(text, reverseUnicode);
        transformations.push({
          type: 'character_reversal',
          from: text,
          to: result,
          position: 0
        });
        break;

      case 'words':
        // Reverse word order but keep characters in words
        const words = text.split(/\s+/);
        result = words.reverse().join(preserveSpacing ? ' ' : '');
        transformations.push({
          type: 'word_reversal',
          from: text,
          to: result,
          position: 0
        });
        break;

      case 'lines':
        // Reverse line order
        const lines = text.split('\n');
        result = lines.reverse().join('\n');
        transformations.push({
          type: 'line_reversal',
          from: text,
          to: result,
          position: 0
        });
        break;

      case 'mirrored':
        // Create mirrored text (each character mirrored)
        result = createMirroredText(text);
        transformations.push({
          type: 'mirrored_text',
          from: text,
          to: result,
          position: 0
        });
        break;
    }

    // Apply case preservation if needed
    if (!preserveCase && mode !== 'mirrored') {
      const originalResult = result;
      result = result.toLowerCase();
      transformations.push({
        type: 'case_conversion',
        from: originalResult,
        to: result,
        position: 0
      });
    }

    // Calculate statistics
    const statistics = {
      originalLength: text.length,
      reversedLength: result.length,
      characterCount: result.replace(/\s/g, '').length,
      wordCount: result.split(/\s+/).filter(word => word.length > 0).length,
      lineCount: result.split('\n').length,
      mode,
      preserveCase,
      preserveSpacing,
      reverseUnicode
    };

    // Initialize ZAI SDK for AI analysis
    let aiAnalysis = null;
    try {
      const zai = await ZAI.create();
      
      const analysisPrompt = `
        Analyze this text reversal operation:
        
        Original text: "${text}"
        Reversed text: "${result}"
        Reversal mode: ${mode}
        Options: ${JSON.stringify({ preserveCase, preserveSpacing, reverseUnicode })}
        
        Provide insights about:
        1. The readability and interesting properties of the reversed text
        2. Potential applications for this type of text reversal
        3. Palindromes or interesting patterns found
        4. Suggestions for creative uses of text reversal
        5. Linguistic or cultural observations about the reversed text
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in linguistics and text manipulation. Provide creative analysis of text reversal operations.'
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

    // Check for palindromes
    const palindromeCheck = checkForPalindromes(text, result);

    // Prepare response
    const response = {
      success: true,
      data: {
        originalText: text,
        reversedText: result,
        options: {
          mode,
          preserveCase,
          preserveSpacing,
          reverseUnicode
        },
        statistics,
        transformations: transformations.length > 0 ? transformations : undefined,
        palindromeCheck,
        aiAnalysis
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Text Reverser error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during text reversal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to reverse a string
function reverseString(str: string, reverseUnicode: boolean = false): string {
  if (reverseUnicode) {
    // Handle Unicode characters properly (including surrogate pairs)
    return Array.from(str).reverse().join('');
  } else {
    // Simple reversal (may break Unicode characters)
    return str.split('').reverse().join('');
  }
}

// Helper function to create mirrored text
function createMirroredText(str: string): string {
  const mirrorMap: { [key: string]: string } = {
    'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁',
    'H': 'H', 'I': 'I', 'J': 'ᒋ', 'K': 'ꓘ', 'L': '⅂', 'M': 'W', 'N': 'N',
    'O': 'O', 'P': 'Ԁ', 'Q': 'Ọ', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩',
    'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
    'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
    'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ',
    'w': 'ʍ', 'y': 'ʎ', 'z': 'z',
    '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9',
    '7': 'ㄥ', '8': '8', '9': '6',
    '.': '˙', ',': "'", '?': '¿', '!': '¡', '"': '"', "'": ',', '(': ')',
    ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<'
  };

  return Array.from(str)
    .map(char => mirrorMap[char] || char)
    .reverse()
    .join('');
}

// Helper function to check for palindromes
function checkForPalindromes(original: string, reversed: string): {
  isPalindrome: boolean;
  wordPalindromes: string[];
  linePalindromes: string[];
  suggestions: string[];
} {
  const isPalindrome = original.toLowerCase() === reversed.toLowerCase();
  
  // Check for word palindromes
  const words = original.toLowerCase().split(/\s+/);
  const wordPalindromes = words.filter(word => 
    word.length > 1 && word === word.split('').reverse().join('')
  );
  
  // Check for line palindromes
  const lines = original.split('\n');
  const linePalindromes = lines.filter(line => 
    line.trim().length > 1 && line.toLowerCase() === line.toLowerCase().split('').reverse().join('')
  );
  
  const suggestions: string[] = [];
  
  if (isPalindrome) {
    suggestions.push('The entire text is a palindrome!');
  }
  
  if (wordPalindromes.length > 0) {
    suggestions.push(`Found ${wordPalindromes.length} word palindrome(s): ${wordPalindromes.join(', ')}`);
  }
  
  if (linePalindromes.length > 0) {
    suggestions.push(`Found ${linePalindromes.length} line palindrome(s)`);
  }
  
  if (suggestions.length === 0) {
    suggestions.push('No palindromes detected. Try different reversal modes!');
  }
  
  return {
    isPalindrome,
    wordPalindromes,
    linePalindromes,
    suggestions
  };
}

// Helper function to get available modes
export function getAvailableModes(): string[] {
  return ['reverse', 'words', 'lines', 'mirrored'];
}

// Helper function to generate creative text patterns
export function generateCreativePatterns(text: string): { [key: string]: string } {
  return {
    spiral: createSpiralText(text),
    pyramid: createPyramidText(text),
    diamond: createDiamondText(text),
    wave: createWaveText(text)
  };
}

// Helper function to create spiral text
function createSpiralText(text: string): string {
  const chars = text.replace(/\s/g, '').split('');
  const size = Math.ceil(Math.sqrt(chars.length));
  const matrix: string[][] = Array(size).fill(null).map(() => Array(size).fill(' '));
  
  let charIndex = 0;
  let top = 0, bottom = size - 1, left = 0, right = size - 1;
  
  while (top <= bottom && left <= right && charIndex < chars.length) {
    // Traverse right
    for (let i = left; i <= right && charIndex < chars.length; i++) {
      matrix[top][i] = chars[charIndex++];
    }
    top++;
    
    // Traverse down
    for (let i = top; i <= bottom && charIndex < chars.length; i++) {
      matrix[i][right] = chars[charIndex++];
    }
    right--;
    
    // Traverse left
    for (let i = right; i >= left && charIndex < chars.length; i--) {
      matrix[bottom][i] = chars[charIndex++];
    }
    bottom--;
    
    // Traverse up
    for (let i = bottom; i >= top && charIndex < chars.length; i--) {
      matrix[i][left] = chars[charIndex++];
    }
    left++;
  }
  
  return matrix.map(row => row.join('')).join('\n');
}

// Helper function to create pyramid text
function createPyramidText(text: string): string {
  const chars = text.replace(/\s/g, '').split('');
  let result = '';
  
  for (let i = 0; i < chars.length; i++) {
    const line = chars.slice(0, i + 1).join(' ');
    result += line + '\n';
  }
  
  return result.trim();
}

// Helper function to create diamond text
function createDiamondText(text: string): string {
  const chars = text.replace(/\s/g, '').split('');
  const size = Math.min(chars.length, 10); // Limit size for readability
  let result = '';
  
  // Upper half
  for (let i = 0; i < size; i++) {
    const spaces = ' '.repeat(size - i - 1);
    const charsLine = chars.slice(0, i + 1).join(' ');
    result += spaces + charsLine + '\n';
  }
  
  // Lower half
  for (let i = size - 2; i >= 0; i--) {
    const spaces = ' '.repeat(size - i - 1);
    const charsLine = chars.slice(0, i + 1).join(' ');
    result += spaces + charsLine + '\n';
  }
  
  return result.trim();
}

// Helper function to create wave text
function createWaveText(text: string): string {
  const chars = text.split('');
  let result = '';
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < chars.length; col++) {
      const offset = Math.sin(col * 0.5 + row * 0.3) * 2;
      result += ' '.repeat(Math.max(0, Math.floor(offset))) + chars[col] + ' '.repeat(Math.max(0, Math.floor(-offset)));
    }
    result += '\n';
  }
  
  return result.trim();
}