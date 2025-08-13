import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Reverse leetspeak mappings for different levels
const REVERSE_LEET_MAPPINGS = {
  // Basic level (common substitutions)
  basic: {
    '4': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '7': 't'
  },
  
  // Medium level (more substitutions)
  medium: {
    '4': 'a', '8': 'b', '3': 'e', '9': 'g', '1': 'l', '0': 'o', 
    '5': 's', '7': 't', '2': 'z'
  },
  
  // Advanced level (maximum substitutions)
  advanced: {
    '@': 'a', '8': 'b', '(': 'c', '3': 'e', '9': 'g', '#': 'h',
    '1': 'l', '0': 'o', '5': 's', '7': 't', '%': 'x', '2': 'z'
  },
  
  // Extreme level (creative substitutions)
  extreme: {
    '@': 'a', '|3': 'b', '(': 'c', '|)': 'd', '3': 'e', '|=': 'f',
    '9': 'g', '#': 'h', '_|': 'j', '|<': 'k', '|\\/|': 'm', '|\\|': 'n',
    '0': 'o', '|*': 'p', '0_': 'q', '|2': 'r', '5': 's', '7': 't',
    '|_|': 'u', '\\/': 'v', '\\/\\/': 'w', '><': 'x', '`/': 'y', '2': 'z'
  }
};

// Additional common leetspeak patterns
const COMMON_PATTERNS = {
  // Multi-character patterns
  'ph': 'f',
  'vv': 'w',
  'ck': 'k',
  'qu': 'kw',
  
  // Number patterns
  '1337': 'leet',
  '5318008': 'boobies',
  '8008': 'boob',
  '420': 'weed',
  '69': 'nice'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leetspeak, options = {} } = body;

    // Validate input
    if (!leetspeak || typeof leetspeak !== 'string') {
      return NextResponse.json(
        { error: 'Leetspeak is required and must be a string' },
        { status: 400 }
      );
    }

    if (leetspeak.length > 10000) {
      return NextResponse.json(
        { error: 'Leetspeak must be less than 10,000 characters' },
        { status: 400 }
      );
    }

    // Parse options
    const {
      level = 'medium',
      handleUnknown = 'preserve', // 'preserve', 'remove', 'replace'
      preserveCase = true,
      customMappings = {},
      detectPatterns = true
    } = options;

    // Validate level
    const validLevels = ['basic', 'medium', 'advanced', 'extreme'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: `Invalid level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Start with the original leetspeak
    let result = leetspeak;
    let substitutions: Array<{ leet: string; original: string; position: number }> = [];
    let errors: string[] = [];
    let unknownChars: string[] = [];

    // Get the appropriate reverse mapping
    let reverseMapping = { ...REVERSE_LEET_MAPPINGS[level as keyof typeof REVERSE_LEET_MAPPINGS] };
    
    // Apply custom mappings
    Object.assign(reverseMapping, customMappings);

    // Sort mappings by length (longest first) to handle multi-character substitutions
    const sortedMappings = Object.entries(reverseMapping)
      .sort((a, b) => b[0].length - a[0].length);

    // Apply substitutions
    for (const [leet, original] of sortedMappings) {
      const regex = new RegExp(leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      let match;
      while ((match = regex.exec(result)) !== null) {
        substitutions.push({
          leet: match[0],
          original: original,
          position: match.index
        });
      }
      result = result.replace(regex, original);
    }

    // Apply common patterns if enabled
    if (detectPatterns) {
      for (const [pattern, replacement] of Object.entries(COMMON_PATTERNS)) {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let match;
        while ((match = regex.exec(result)) !== null) {
          substitutions.push({
            leet: match[0],
            original: replacement,
            position: match.index
          });
        }
        result = result.replace(regex, replacement);
      }
    }

    // Handle unknown leetspeak characters
    const unknownRegex = /[^a-zA-Z0-9\s.,!?;:'"()-]/g;
    let unknownMatch;
    while ((unknownMatch = unknownRegex.exec(result)) !== null) {
      const char = unknownMatch[0];
      if (!unknownChars.includes(char)) {
        unknownChars.push(char);
      }
    }

    if (unknownChars.length > 0) {
      errors.push(`Unknown leetspeak characters: ${unknownChars.join(', ')}`);
      
      if (handleUnknown === 'remove') {
        result = result.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, '');
      } else if (handleUnknown === 'replace') {
        result = result.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, '?');
      }
    }

    // Calculate statistics
    const statistics = {
      originalLength: leetspeak.length,
      convertedLength: result.length,
      substitutionCount: substitutions.length,
      uniqueSubstitutions: new Set(substitutions.map(s => s.leet)).size,
      unknownCharacterCount: unknownChars.length,
      level,
      handleUnknown,
      detectPatterns
    };

    // Initialize ZAI SDK for AI analysis
    let aiAnalysis = null;
    try {
      const zai = await ZAI.create();
      
      const analysisPrompt = `
        Analyze this leetspeak to text conversion:
        
        Original leetspeak: "${leetspeak}"
        Converted text: "${result}"
        Conversion level: ${level}
        Substitutions made: ${substitutions.length}
        Unknown characters: ${unknownChars.length}
        
        Provide insights about:
        1. The accuracy and quality of the conversion
        2. Cultural context and meaning of the leetspeak
        3. Common patterns and substitutions found
        4. Suggestions for improving the conversion
        5. Interesting observations about the leetspeak usage
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in internet culture and leetspeak. Provide detailed analysis of leetspeak to text conversions.'
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
        originalLeetspeak: leetspeak,
        convertedText: result,
        options: {
          level,
          handleUnknown,
          preserveCase,
          customMappings: Object.keys(customMappings).length > 0 ? customMappings : undefined,
          detectPatterns
        },
        statistics,
        substitutions: substitutions.length > 0 ? substitutions : undefined,
        errors: errors.length > 0 ? errors : undefined,
        unknownCharacters: unknownChars.length > 0 ? unknownChars : undefined,
        aiAnalysis
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Leetspeak to Text conversion error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during leetspeak to text conversion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to validate leetspeak
export function validateLeetspeak(leetspeak: string, level: string = 'medium'): { 
  isValid: boolean; 
  confidence: number; 
  unknownChars: string[]; 
  suggestions: string[] 
} {
  const reverseMapping = REVERSE_LEET_MAPPINGS[level as keyof typeof REVERSE_LEET_MAPPINGS] || REVERSE_LEET_MAPPINGS.medium;
  const unknownChars: string[] = [];
  const suggestions: string[] = [];
  
  // Check for known leetspeak characters
  const knownChars = new Set(Object.keys(reverseMapping));
  const totalChars = leetspeak.replace(/\s/g, '').length;
  let knownCharCount = 0;
  
  for (const char of leetspeak) {
    if (/\s/.test(char)) continue;
    
    if (knownChars.has(char)) {
      knownCharCount++;
    } else if (!/[a-zA-Z0-9.,!?;:'"()-]/.test(char)) {
      unknownChars.push(char);
    }
  }
  
  // Calculate confidence
  const confidence = totalChars > 0 ? (knownCharCount / totalChars) * 100 : 0;
  
  // Generate suggestions
  if (confidence < 30) {
    suggestions.push('This text might not be leetspeak. Consider using a different tool.');
  } else if (confidence < 60) {
    suggestions.push('Low confidence conversion. Try a higher level or check for custom patterns.');
  }
  
  if (unknownChars.length > 0) {
    suggestions.push(`Unknown characters detected: ${unknownChars.join(', ')}`);
  }
  
  return {
    isValid: confidence > 20, // Consider valid if at least 20% leetspeak characters
    confidence,
    unknownChars,
    suggestions
  };
}

// Helper function to get conversion suggestions
export function getConversionSuggestions(leetspeak: string): string[] {
  const suggestions: string[] = [];
  
  // Check for common patterns
  if (leetspeak.includes('1337')) {
    suggestions.push('Detected "1337" pattern - this is leetspeak for "leet"');
  }
  
  if (leetspeak.includes('pwn')) {
    suggestions.push('Detected "pwn" - common gaming leetspeak');
  }
  
  if (leetspeak.includes('n00b')) {
    suggestions.push('Detected "n00b" - common gaming leetspeak for "newbie"');
  }
  
  // Check character frequency
  const leetChars = leetspeak.match(/[43105789@#$%&*]/g) || [];
  if (leetChars.length > leetspeak.length * 0.3) {
    suggestions.push('High concentration of leetspeak characters detected');
  }
  
  return suggestions;
}

// Helper function to get available levels
export function getAvailableLevels(): string[] {
  return ['basic', 'medium', 'advanced', 'extreme'];
}