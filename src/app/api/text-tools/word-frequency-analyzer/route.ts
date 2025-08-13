import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      caseSensitive = false, 
      ignoreStopWords = false, 
      minLength = 1, 
      maxLength = 100,
      maxResults = 50,
      groupByLength = false,
      includePositions = false
    } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (typeof caseSensitive !== 'boolean' || typeof ignoreStopWords !== 'boolean' || 
        typeof groupByLength !== 'boolean' || typeof includePositions !== 'boolean') {
      return NextResponse.json(
        { error: 'All boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(minLength) || minLength < 1 || minLength > 100) {
      return NextResponse.json(
        { error: 'Min length must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(maxLength) || maxLength < minLength || maxLength > 100) {
      return NextResponse.json(
        { error: 'Max length must be between min length and 100' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 200) {
      return NextResponse.json(
        { error: 'Max results must be between 1 and 200' },
        { status: 400 }
      );
    }

    // Common stop words
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
      'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
    ]);

    // Extract words
    const words = (text.match(/\b\w+\b/g) || [])
      .filter(word => word.length >= minLength && word.length <= maxLength)
      .map(word => caseSensitive ? word : word.toLowerCase());

    // Filter stop words if requested
    const filteredWords = ignoreStopWords ? 
      words.filter(word => !stopWords.has(word)) : words;

    // Count word frequencies
    const wordCount: Record<string, { count: number; positions?: number[] }> = {};
    
    filteredWords.forEach((word, index) => {
      if (!wordCount[word]) {
        wordCount[word] = { count: 0 };
        if (includePositions) {
          wordCount[word].positions = [];
        }
      }
      wordCount[word].count++;
      if (includePositions) {
        wordCount[word].positions!.push(index);
      }
    });

    // Sort by frequency
    const sortedWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, maxResults);

    // Basic statistics
    const totalWords = filteredWords.length;
    const uniqueWords = Object.keys(wordCount).length;
    const averageFrequency = totalWords > 0 ? (totalWords / uniqueWords).toFixed(2) : '0.00';

    // Length distribution
    const lengthDistribution: Record<number, number> = {};
    filteredWords.forEach(word => {
      const length = word.length;
      lengthDistribution[length] = (lengthDistribution[length] || 0) + 1;
    });

    // Group by length if requested
    const lengthGroups: Record<number, Array<{ word: string; count: number; positions?: number[] }>> = {};
    if (groupByLength) {
      sortedWords.forEach(([word, data]) => {
        const length = word.length;
        if (!lengthGroups[length]) {
          lengthGroups[length] = [];
        }
        lengthGroups[length].push({ word, count: data.count, positions: data.positions });
      });
    }

    // Frequency distribution
    const frequencyDistribution = {
      single: 0,        // Appears once
      rare: 0,          // 2-5 times
      common: 0,        // 6-20 times
      frequent: 0,      // 21-50 times
      veryFrequent: 0   // 50+ times
    };

    Object.values(wordCount).forEach(({ count }) => {
      if (count === 1) frequencyDistribution.single++;
      else if (count <= 5) frequencyDistribution.rare++;
      else if (count <= 20) frequencyDistribution.common++;
      else if (count <= 50) frequencyDistribution.frequent++;
      else frequencyDistribution.veryFrequent++;
    });

    // Most frequent words
    const topWords = sortedWords.slice(0, 10).map(([word, data]) => ({
      word,
      count: data.count,
      percentage: ((data.count / totalWords) * 100).toFixed(2) + '%',
      positions: data.positions
    }));

    // Calculate lexical diversity
    const lexicalDiversity = totalWords > 0 ? 
      ((uniqueWords / totalWords) * 100).toFixed(2) + '%' : '0%';

    // Word pattern analysis
    const patterns = {
      capitalizedWords: (text.match(/\b[A-Z][a-z]+\b/g) || []).length,
      allCapsWords: (text.match(/\b[A-Z]+\b/g) || []).length,
      numericWords: (text.match(/\b\d+\b/g) || []).length,
      hyphenatedWords: (text.match(/\b\w+-\w+\b/g) || []).length,
      camelCaseWords: (text.match(/\b[a-z]+[A-Z][a-z]+\b/g) || []).length
    };

    const result = {
      summary: {
        totalWords,
        uniqueWords,
        averageFrequency,
        lexicalDiversity
      },
      topWords,
      frequencyDistribution,
      lengthDistribution,
      patterns,
      wordFrequency: Object.fromEntries(sortedWords)
    };

    // Add length groups if requested
    if (groupByLength) {
      result.lengthGroups = lengthGroups;
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a linguistic analysis expert. Analyze the word frequency data and provide insights about vocabulary, writing style, and text characteristics.'
          },
          {
            role: 'user',
            content: `Analyzed text with ${totalWords} words, ${uniqueWords} unique words. Lexical diversity: ${lexicalDiversity}. Top words: ${topWords.slice(0, 5).map(w => w.word).join(', ')}. Frequency distribution: single=${frequencyDistribution.single}, rare=${frequencyDistribution.rare}, common=${frequencyDistribution.common}. Provide insights about vocabulary usage and writing style.`
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
        caseSensitive,
        ignoreStopWords,
        minLength,
        maxLength,
        maxResults,
        groupByLength,
        includePositions
      },
      aiInsights
    });

  } catch (error) {
    console.error('Word frequency analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze word frequency' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Word Frequency Analyzer API',
    usage: 'POST /api/text-tools/word-frequency-analyzer',
    parameters: {
      text: 'Text to analyze (required)',
      caseSensitive: 'Treat uppercase and lowercase as different (default: false) - optional',
      ignoreStopWords: 'Exclude common stop words (default: false) - optional',
      minLength: 'Minimum word length (1-100, default: 1) - optional',
      maxLength: 'Maximum word length (minLength-100, default: 100) - optional',
      maxResults: 'Maximum number of results to return (1-200, default: 50) - optional',
      groupByLength: 'Group results by word length (default: false) - optional',
      includePositions: 'Include word positions in text (default: false) - optional'
    },
    analysis: {
      summary: ['Total words', 'Unique words', 'Average frequency', 'Lexical diversity'],
      topWords: ['Most frequent words with percentages'],
      frequencyDistribution: ['Single, rare, common, frequent, very frequent'],
      lengthDistribution: ['Word length distribution'],
      patterns: ['Capitalized, all caps, numeric, hyphenated, camel case words'],
      wordFrequency: ['Complete frequency dictionary']
    },
    example: {
      text: 'The quick brown fox jumps over the lazy dog. The dog was not impressed by the quick fox.',
      caseSensitive: false,
      ignoreStopWords: true,
      minLength: 3,
      maxLength: 10,
      maxResults: 20,
      groupByLength: true,
      includePositions: false
    }
  });
}