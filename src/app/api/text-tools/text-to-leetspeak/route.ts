import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Leetspeak mapping tables for different intensity levels
const LEETSpeak_MAPPINGS = {
  // Basic level (common substitutions)
  basic: {
    'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7',
    'A': '4', 'E': '3', 'I': '1', 'O': '0', 'S': '5', 'T': '7'
  },
  
  // Medium level (more substitutions)
  medium: {
    'a': '4', 'b': '8', 'e': '3', 'g': '9', 'i': '1', 'l': '1', 
    'o': '0', 's': '5', 't': '7', 'z': '2',
    'A': '4', 'B': '8', 'E': '3', 'G': '9', 'I': '1', 'L': '1',
    'O': '0', 'S': '5', 'T': '7', 'Z': '2'
  },
  
  // Advanced level (maximum substitutions)
  advanced: {
    'a': '@', 'b': '8', 'c': '(', 'e': '3', 'g': '9', 'h': '#', 
    'i': '1', 'l': '1', 'o': '0', 's': '5', 't': '7', 'x': '%',
    'z': '2',
    'A': '@', 'B': '8', 'C': '(', 'E': '3', 'G': '9', 'H': '#',
    'I': '1', 'L': '1', 'O': '0', 'S': '5', 'T': '7', 'X': '%',
    'Z': '2'
  },
  
  // Extreme level (creative substitutions)
  extreme: {
    'a': '@', 'b': '|3', 'c': '(', 'd': '|)', 'e': '3', 'f': '|=', 
    'g': '9', 'h': '#', 'i': '1', 'j': '_|', 'k': '|<', 'l': '1',
    'm': '|\\/|', 'n': '|\\|', 'o': '0', 'p': '|*', 'q': '0_', 
    'r': '|2', 's': '5', 't': '7', 'u': '|_|', 'v': '\\/', 'w': '\\/\\/',
    'x': '><', 'y': '`/', 'z': '2',
    'A': '@', 'B': '|3', 'C': '(', 'D': '|)', 'E': '3', 'F': '|=',
    'G': '9', 'H': '#', 'I': '1', 'J': '_|', 'K': '|<', 'L': '1',
    'M': '|\\/|', 'N': '|\\|', 'O': '0', 'P': '|*', 'Q': '0_',
    'R': '|2', 'S': '5', 'T': '7', 'U': '|_|', 'V': '\\/', 'W': '\\/\\/',
    'X': '><', 'Y': '`/', 'Z': '2'
  }
};

// Reverse mapping for leetspeak to text conversion
const REVERSE_LEET_MAPPINGS = {
  basic: {
    '4': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '7': 't'
  },
  medium: {
    '4': 'a', '8': 'b', '3': 'e', '9': 'g', '1': 'l', '0': 'o', 
    '5': 's', '7': 't', '2': 'z'
  },
  advanced: {
    '@': 'a', '8': 'b', '(': 'c', '3': 'e', '9': 'g', '#': 'h',
    '1': 'l', '0': 'o', '5': 's', '7': 't', '%': 'x', '2': 'z'
  },
  extreme: {
    '@': 'a', '|3': 'b', '(': 'c', '|)': 'd', '3': 'e', '|=': 'f',
    '9': 'g', '#': 'h', '_|': 'j', '|<': 'k', '|\\/|': 'm', '|\\|': 'n',
    '0': 'o', '|*': 'p', '0_': 'q', '|2': 'r', '5': 's', '7': 't',
    '|_|': 'u', '\\/': 'v', '\\/\\/': 'w', '><': 'x', '`/': 'y', '2': 'z'
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

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text must be less than 5,000 characters' },
        { status: 400 }
      );
    }

    // Parse options
    const {
      level = 'medium',
      preserveCase = true,
      randomize = false,
      customMappings = {}
    } = options;

    // Validate level
    const validLevels = ['basic', 'medium', 'advanced', 'extreme'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: `Invalid level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Get the appropriate mapping
    let mapping = { ...LEETSpeak_MAPPINGS[level as keyof typeof LEETSpeak_MAPPINGS] };
    
    // Apply custom mappings
    Object.assign(mapping, customMappings);

    // Convert text to leetspeak
    let result = text;
    let substitutions: Array<{ original: string; leet: string; position: number }> = [];

    if (randomize) {
      // Random substitution mode
      const chars = result.split('');
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (mapping[char] && Math.random() > 0.5) {
          const original = char;
          chars[i] = mapping[char];
          substitutions.push({ original, leet: chars[i], position: i });
        }
      }
      result = chars.join('');
    } else {
      // Full substitution mode
      let offset = 0;
      for (const [original, leet] of Object.entries(mapping)) {
        const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        let match;
        while ((match = regex.exec(result)) !== null) {
          substitutions.push({
            original: match[0],
            leet: leet,
            position: match.index
          });
        }
        result = result.replace(regex, leet);
      }
    }

    // Calculate statistics
    const statistics = {
      originalLength: text.length,
      leetspeakLength: result.length,
      substitutionCount: substitutions.length,
      uniqueSubstitutions: new Set(substitutions.map(s => s.original)).size,
      level,
      randomize
    };

    // Initialize ZAI SDK for AI analysis
    let aiAnalysis = null;
    try {
      const zai = await ZAI.create();
      
      const analysisPrompt = `
        Analyze this text to leetspeak conversion:
        
        Original text: "${text}"
        Leetspeak: "${result}"
        Conversion level: ${level}
        Randomization: ${randomize}
        Substitutions made: ${substitutions.length}
        
        Provide insights about:
        1. The readability and complexity of the leetspeak
        2. Cultural context and usage of leetspeak
        3. Common patterns and substitutions used
        4. Suggestions for improving the conversion
        5. Historical significance of leetspeak in internet culture
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in internet culture and leetspeak. Provide detailed analysis of text to leetspeak conversions.'
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
        leetspeak: result,
        options: {
          level,
          preserveCase,
          randomize,
          customMappings: Object.keys(customMappings).length > 0 ? customMappings : undefined
        },
        statistics,
        substitutions: substitutions.length > 0 ? substitutions : undefined,
        aiAnalysis
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Text to Leetspeak conversion error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during leetspeak conversion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function for leetspeak to text conversion
export function leetspeakToText(leetspeak: string, options: any = {}): { text: string; errors: string[] } {
  const {
    level = 'medium',
    handleUnknown = 'preserve' // 'preserve', 'remove', 'replace'
  } = options;

  let result = leetspeak;
  let errors: string[] = [];

  // Get the appropriate reverse mapping
  const reverseMapping = REVERSE_LEET_MAPPINGS[level as keyof typeof REVERSE_LEET_MAPPINGS] || REVERSE_LEET_MAPPINGS.medium;

  // Sort mappings by length (longest first) to handle multi-character substitutions
  const sortedMappings = Object.entries(reverseMapping)
    .sort((a, b) => b[0].length - a[0].length);

  // Apply substitutions
  for (const [leet, original] of sortedMappings) {
    const regex = new RegExp(leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, original);
  }

  // Handle unknown leetspeak characters
  const unknownChars = result.match(/[^a-zA-Z0-9\s.,!?;:'"()-]/g);
  if (unknownChars) {
    const uniqueUnknown = [...new Set(unknownChars)];
    errors.push(`Unknown leetspeak characters: ${uniqueUnknown.join(', ')}`);
    
    if (handleUnknown === 'remove') {
      result = result.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, '');
    } else if (handleUnknown === 'replace') {
      result = result.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, '?');
    }
  }

  return {
    text: result,
    errors
  };
}

// Helper function to get available levels
export function getAvailableLevels(): string[] {
  return ['basic', 'medium', 'advanced', 'extreme'];
}

// Helper function to get substitution count by level
export function getSubstitutionCount(level: string): number {
  const mapping = LEETSpeak_MAPPINGS[level as keyof typeof LEETSpeak_MAPPINGS];
  return mapping ? Object.keys(mapping).length : 0;
}