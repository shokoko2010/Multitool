import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, includeWordFrequency = false, includeCharacterFrequency = false, maxFrequencyItems = 20 } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (typeof includeWordFrequency !== 'boolean' || typeof includeCharacterFrequency !== 'boolean') {
      return NextResponse.json(
        { error: 'Frequency flags must be boolean values' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(maxFrequencyItems) || maxFrequencyItems < 1 || maxFrequencyItems > 100) {
      return NextResponse.json(
        { error: 'Max frequency items must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Basic text statistics
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const lines = text.trim() === '' ? 0 : text.split('\n').length;

    // Reading time estimation (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(words / 200);
    const readingTimeSeconds = Math.ceil((words / 200) * 60);

    // Character frequency analysis
    let characterFrequency: Record<string, number> = {};
    if (includeCharacterFrequency) {
      const charCount: Record<string, number> = {};
      for (const char of text) {
        if (char !== ' ' && char !== '\n' && char !== '\t' && char !== '\r') {
          charCount[char] = (charCount[char] || 0) + 1;
        }
      }
      
      // Sort by frequency and take top items
      const sortedChars = Object.entries(charCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxFrequencyItems);
      
      characterFrequency = Object.fromEntries(sortedChars);
    }

    // Word frequency analysis
    let wordFrequency: Record<string, number> = {};
    if (includeWordFrequency) {
      const wordCount: Record<string, number> = {};
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      
      for (const word of words) {
        if (word.length > 1) { // Skip single characters
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      }
      
      // Sort by frequency and take top items
      const sortedWords = Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxFrequencyItems);
      
      wordFrequency = Object.fromEntries(sortedWords);
    }

    // Advanced text analysis
    const averageWordLength = words > 0 ? 
      (text.replace(/\s/g, '').length / words).toFixed(2) : '0.00';
    
    const averageSentenceLength = sentences > 0 ? 
      (words / sentences).toFixed(2) : '0.00';

    // Lexical diversity (unique words / total words)
    const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size;
    const lexicalDiversity = words > 0 ? 
      ((uniqueWords / words) * 100).toFixed(2) + '%' : '0%';

    // Complexity analysis
    const complexWords = (text.match(/\b\w{7,}\b/g) || []).length;
    const complexityScore = words > 0 ? 
      ((complexWords / words) * 100).toFixed(2) + '%' : '0%';

    // Language detection (simple heuristic)
    const detectLanguage = (text: string): string => {
      const nonEnglishChars = (text.match(/[^\x00-\x7F]/g) || []).length;
      const totalChars = text.length;
      
      if (nonEnglishChars / totalChars > 0.3) {
        return 'Likely non-English';
      }
      
      // Check for common patterns
      if (text.match(/[äöüß]/i)) return 'Likely German';
      if (text.match(/[àâäçéèêëïîôùûüÿñæœ]/i)) return 'Likely French';
      if (text.match(/[áéíóúüñ¿¡]/i)) return 'Likely Spanish';
      if (text.match(/[àèéìòù]/i)) return 'Likely Italian';
      
      return 'Likely English';
    };

    const detectedLanguage = detectLanguage(text);

    // Text readability scores
    const fleschReadingEase = calculateFleschReadingEase(text);
    const fleschKincaidGrade = calculateFleschKincaidGrade(text);

    const statistics = {
      basic: {
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        lines
      },
      readability: {
        readingTimeMinutes,
        readingTimeSeconds,
        averageWordLength,
        averageSentenceLength,
        lexicalDiversity,
        complexityScore,
        fleschReadingEase,
        fleschKincaidGrade
      },
      language: {
        detectedLanguage,
        uniqueWords,
        complexWords
      }
    };

    // Add frequency analysis if requested
    if (includeCharacterFrequency) {
      statistics.characterFrequency = characterFrequency;
    }
    if (includeWordFrequency) {
      statistics.wordFrequency = wordFrequency;
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a linguistics and text analysis expert. Analyze the text statistics and provide insights about the content, readability, and writing style.'
          },
          {
            role: 'user',
            content: `Analyzed text with ${words} words, ${sentences} sentences, reading time ${readingTimeMinutes} minutes. Flesch reading ease: ${fleschReadingEase}, complexity: ${complexityScore}. Language: ${detectedLanguage}. Provide analysis of writing style, readability, and content characteristics.`
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
      statistics,
      aiInsights
    });

  } catch (error) {
    console.error('Text statistics analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text statistics' },
      { status: 500 }
    );
  }
}

function calculateFleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const syllables = countSyllables(text);

  if (sentences === 0 || words === 0) return 0;

  const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateFleschKincaidGrade(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const syllables = countSyllables(text);

  if (sentences === 0 || words === 0) return 0;

  const score = (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59;
  return Math.max(0, Math.round(score * 10) / 10);
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let syllableCount = 0;

  for (const word of words) {
    if (word.length <= 3) {
      syllableCount += 1;
      continue;
    }

    const cleanedWord = word.replace(/(?:[^laeiouy]|ed|es|)$/, '');
    const syllableMatches = cleanedWord.match(/[aeiouy]{1,2}/g);
    syllableCount += syllableMatches ? syllableMatches.length : 1;
  }

  return syllableCount;
}

export async function GET() {
  return NextResponse.json({
    message: 'Text Statistics API',
    usage: 'POST /api/text-tools/text-statistics',
    parameters: {
      text: 'Text to analyze (required)',
      includeWordFrequency: 'Include word frequency analysis (default: false) - optional',
      includeCharacterFrequency: 'Include character frequency analysis (default: false) - optional',
      maxFrequencyItems: 'Maximum number of frequency items to return (1-100, default: 20) - optional'
    },
    analysis: {
      basic: ['Character count', 'Word count', 'Sentence count', 'Paragraph count', 'Line count'],
      readability: ['Reading time', 'Average word length', 'Average sentence length', 'Lexical diversity', 'Complexity score'],
      scores: ['Flesch Reading Ease', 'Flesch-Kincaid Grade Level'],
      language: ['Language detection', 'Unique words', 'Complex words']
    },
    example: {
      text: 'The quick brown fox jumps over the lazy dog. This sentence contains various words for analysis.',
      includeWordFrequency: true,
      includeCharacterFrequency: true,
      maxFrequencyItems: 10
    }
  });
}