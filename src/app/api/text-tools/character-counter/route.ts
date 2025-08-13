import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, includeSpaces = true, includeBreaks = true, caseSensitive = false, groupByType = false } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (typeof includeSpaces !== 'boolean' || typeof includeBreaks !== 'boolean' || 
        typeof caseSensitive !== 'boolean' || typeof groupByType !== 'boolean') {
      return NextResponse.json(
        { error: 'All boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    // Process text based on options
    let processedText = text;
    if (!includeSpaces) {
      processedText = processedText.replace(/\s/g, '');
    }
    if (!includeBreaks) {
      processedText = processedText.replace(/[\n\r]/g, '');
    }
    if (!caseSensitive) {
      processedText = processedText.toLowerCase();
    }

    // Basic character counts
    const totalCharacters = processedText.length;
    const uniqueCharacters = new Set(processedText).size;

    // Character type analysis
    const characterTypes = {
      letters: (processedText.match(/[a-zA-Z]/g) || []).length,
      digits: (processedText.match(/[0-9]/g) || []).length,
      spaces: includeSpaces ? (text.match(/\s/g) || []).length : 0,
      punctuation: (processedText.match(/[^\w\s]/g) || []).length,
      breaks: includeBreaks ? (text.match(/[\n\r]/g) || []).length : 0,
      special: (processedText.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length,
      vowels: (processedText.match(/[aeiouAEIOU]/g) || []).length,
      consonants: (processedText.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length
    };

    // Detailed character frequency
    const characterFrequency: Record<string, number> = {};
    for (const char of processedText) {
      characterFrequency[char] = (characterFrequency[char] || 0) + 1;
    }

    // Sort by frequency
    const sortedFrequency = Object.entries(characterFrequency)
      .sort(([, a], [, b]) => b - a);

    // Character position analysis
    const firstCharacter = processedText[0] || '';
    const lastCharacter = processedText[processedText.length - 1] || '';
    const middleCharacter = processedText[Math.floor(processedText.length / 2)] || '';

    // Character density analysis
    const density = {
      letters: totalCharacters > 0 ? ((characterTypes.letters / totalCharacters) * 100).toFixed(2) + '%' : '0%',
      digits: totalCharacters > 0 ? ((characterTypes.digits / totalCharacters) * 100).toFixed(2) + '%' : '0%',
      punctuation: totalCharacters > 0 ? ((characterTypes.punctuation / totalCharacters) * 100).toFixed(2) + '%' : '0%',
      vowels: characterTypes.letters > 0 ? ((characterTypes.vowels / characterTypes.letters) * 100).toFixed(2) + '%' : '0%',
      consonants: characterTypes.letters > 0 ? ((characterTypes.consonants / characterTypes.letters) * 100).toFixed(2) + '%' : '0%'
    };

    // Unicode category analysis
    const unicodeCategories = {
      ascii: (processedText.match(/^[\x00-\x7F]*$/) ? totalCharacters : 
              (processedText.match(/[\x00-\x7F]/g) || []).length),
      unicode: totalCharacters - (processedText.match(/[\x00-\x7F]/g) || []).length,
      emoji: (processedText.match(/[\p{Emoji_Presentation}\p{Emoji}\u200D]+/gu) || []).length,
      asian: (processedText.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || []).length,
      arabic: (processedText.match(/[\u0600-\u06ff]/g) || []).length,
      cyrillic: (processedText.match(/[\u0400-\u04ff]/g) || []).length
    };

    // Most and least common characters
    const mostCommon = sortedFrequency.length > 0 ? sortedFrequency[0] : null;
    const leastCommon = sortedFrequency.length > 0 ? sortedFrequency[sortedFrequency.length - 1] : null;

    // Character repetition analysis
    const repetitions: Record<string, number> = {};
    let maxRepetition = 0;
    let mostRepeatingChar = '';

    for (const [char, count] of sortedFrequency) {
      if (count > 1) {
        repetitions[char] = count;
        if (count > maxRepetition) {
          maxRepetition = count;
          mostRepeatingChar = char;
        }
      }
    }

    const result = {
      summary: {
        totalCharacters,
        uniqueCharacters,
        processedTextLength: processedText.length,
        originalTextLength: text.length
      },
      characterTypes,
      density,
      positions: {
        first: firstCharacter,
        last: lastCharacter,
        middle: middleCharacter
      },
      unicodeCategories,
      frequency: {
        mostCommon: mostCommon ? { character: mostCommon[0], count: mostCommon[1] } : null,
        leastCommon: leastCommon ? { character: leastCommon[0], count: leastCommon[1] } : null,
        repetitions: {
          maxRepetition,
          mostRepeatingChar,
          totalRepeatingChars: Object.keys(repetitions).length
        }
      }
    };

    // Add detailed frequency if requested
    if (groupByType) {
      result.frequency.detailed = {
        letters: Object.fromEntries(
          sortedFrequency.filter(([char]) => /[a-zA-Z]/.test(char))
        ),
        digits: Object.fromEntries(
          sortedFrequency.filter(([char]) => /[0-9]/.test(char))
        ),
        punctuation: Object.fromEntries(
          sortedFrequency.filter(([char]) => /[^\w\s]/.test(char))
        ),
        spaces: includeSpaces ? { ' ': characterTypes.spaces } : {},
        breaks: includeBreaks ? 
          Object.fromEntries(
            sortedFrequency.filter(([char]) => /[\n\r]/.test(char))
          ) : {}
      };
    } else {
      result.frequency.all = Object.fromEntries(sortedFrequency);
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a text analysis expert. Analyze the character count data and provide insights about the text composition, patterns, and characteristics.'
          },
          {
            role: 'user',
            content: `Analyzed text with ${totalCharacters} characters, ${uniqueCharacters} unique characters. Character distribution: ${characterTypes.letters} letters, ${characterTypes.digits} digits, ${characterTypes.punctuation} punctuation. Unicode analysis: ${unicodeCategories.ascii} ASCII, ${unicodeCategories.unicode} Unicode. Provide insights about text composition and patterns.`
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
      parameters: {
        includeSpaces,
        includeBreaks,
        caseSensitive,
        groupByType
      },
      aiInsights
    });

  } catch (error) {
    console.error('Character counter error:', error);
    return NextResponse.json(
      { error: 'Failed to count characters' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Character Counter API',
    usage: 'POST /api/text-tools/character-counter',
    parameters: {
      text: 'Text to analyze (required)',
      includeSpaces: 'Include spaces in count (default: true) - optional',
      includeBreaks: 'Include line breaks in count (default: true) - optional',
      caseSensitive: 'Treat uppercase and lowercase as different (default: false) - optional',
      groupByType: 'Group frequency by character type (default: false) - optional'
    },
    analysis: {
      summary: ['Total characters', 'Unique characters', 'Processed length'],
      characterTypes: ['Letters', 'Digits', 'Spaces', 'Punctuation', 'Breaks', 'Special chars', 'Vowels', 'Consonants'],
      density: ['Percentage breakdown by type'],
      positions: ['First, middle, last characters'],
      unicode: ['ASCII vs Unicode, Emoji, Asian, Arabic, Cyrillic'],
      frequency: ['Most/least common, repetitions, detailed breakdown']
    },
    example: {
      text: 'Hello World! 123',
      includeSpaces: true,
      includeBreaks: true,
      caseSensitive: false,
      groupByType: true
    }
  });
}