import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text1, 
      text2, 
      algorithms = ['cosine', 'jaccard', 'levenshtein'],
      caseSensitive = false,
      ignorePunctuation = true,
      ignoreStopWords = false,
      includeDetails = false
    } = body;

    // Input validation
    if (!text1 || !text2) {
      return NextResponse.json(
        { error: 'Both text1 and text2 are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(algorithms) || algorithms.length === 0) {
      return NextResponse.json(
        { error: 'At least one algorithm must be specified' },
        { status: 400 }
      );
    }

    const validAlgorithms = ['cosine', 'jaccard', 'levenshtein', 'euclidean', 'manhattan'];
    const invalidAlgorithms = algorithms.filter(alg => !validAlgorithms.includes(alg));
    if (invalidAlgorithms.length > 0) {
      return NextResponse.json(
        { error: `Invalid algorithms: ${invalidAlgorithms.join(', ')}. Valid algorithms: ${validAlgorithms.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof caseSensitive !== 'boolean' || typeof ignorePunctuation !== 'boolean' || 
        typeof ignoreStopWords !== 'boolean' || typeof includeDetails !== 'boolean') {
      return NextResponse.json(
        { error: 'All boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    // Preprocess texts
    const preprocessText = (text: string): string => {
      let processed = text;
      
      if (!caseSensitive) {
        processed = processed.toLowerCase();
      }
      
      if (ignorePunctuation) {
        processed = processed.replace(/[^\w\s]/g, ' ');
      }
      
      // Normalize whitespace
      processed = processed.replace(/\s+/g, ' ').trim();
      
      return processed;
    };

    const processedText1 = preprocessText(text1);
    const processedText2 = preprocessText(text2);

    // Common stop words
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    // Tokenize texts
    const tokenize = (text: string): string[] => {
      let tokens = text.split(/\s+/);
      
      if (ignoreStopWords) {
        tokens = tokens.filter(token => !stopWords.has(token));
      }
      
      return tokens.filter(token => token.length > 0);
    };

    const tokens1 = tokenize(processedText1);
    const tokens2 = tokenize(processedText2);

    // Calculate similarity scores
    const similarities: Record<string, number> = {};
    const details: any = {};

    // Cosine Similarity
    if (algorithms.includes('cosine')) {
      const cosineResult = calculateCosineSimilarity(tokens1, tokens2);
      similarities.cosine = cosineResult.similarity;
      if (includeDetails) {
        details.cosine = cosineResult.details;
      }
    }

    // Jaccard Similarity
    if (algorithms.includes('jaccard')) {
      const jaccardResult = calculateJaccardSimilarity(tokens1, tokens2);
      similarities.jaccard = jaccardResult.similarity;
      if (includeDetails) {
        details.jaccard = jaccardResult.details;
      }
    }

    // Levenshtein Similarity
    if (algorithms.includes('levenshtein')) {
      const levenshteinResult = calculateLevenshteinSimilarity(processedText1, processedText2);
      similarities.levenshtein = levenshteinResult.similarity;
      if (includeDetails) {
        details.levenshtein = levenshteinResult.details;
      }
    }

    // Euclidean Distance (converted to similarity)
    if (algorithms.includes('euclidean')) {
      const euclideanResult = calculateEuclideanSimilarity(tokens1, tokens2);
      similarities.euclidean = euclideanResult.similarity;
      if (includeDetails) {
        details.euclidean = euclideanResult.details;
      }
    }

    // Manhattan Distance (converted to similarity)
    if (algorithms.includes('manhattan')) {
      const manhattanResult = calculateManhattanSimilarity(tokens1, tokens2);
      similarities.manhattan = manhattanResult.similarity;
      if (includeDetails) {
        details.manhattan = manhattanResult.details;
      }
    }

    // Calculate average similarity
    const similarityValues = Object.values(similarities);
    const averageSimilarity = similarityValues.length > 0 ? 
      similarityValues.reduce((sum, val) => sum + val, 0) / similarityValues.length : 0;

    // Basic text statistics
    const stats = {
      text1: {
        originalLength: text1.length,
        processedLength: processedText1.length,
        wordCount: tokens1.length,
        uniqueWords: new Set(tokens1).size
      },
      text2: {
        originalLength: text2.length,
        processedLength: processedText2.length,
        wordCount: tokens2.length,
        uniqueWords: new Set(tokens2).size
      },
      commonWords: new Set([...tokens1, ...tokens2]).size,
      ratio: {
        lengthRatio: Math.min(text1.length, text2.length) / Math.max(text1.length, text2.length),
        wordCountRatio: Math.min(tokens1.length, tokens2.length) / Math.max(tokens1.length, tokens2.length)
      }
    };

    // Similarity interpretation
    const interpretation = interpretSimilarity(averageSimilarity);

    const result = {
      similarities,
      averageSimilarity,
      interpretation,
      statistics: stats
    };

    if (includeDetails) {
      result.details = details;
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a text analysis expert. Analyze the text similarity results and provide insights about the relationship between the texts, their content similarity, and potential applications.'
          },
          {
            role: 'user',
            content: `Compared two texts with ${stats.text1.wordCount} and ${stats.text2.wordCount} words. Average similarity: ${averageSimilarity.toFixed(3)}. Individual scores: ${Object.entries(similarities).map(([alg, score]) => `${alg}: ${score.toFixed(3)}`).join(', ')}. Interpretation: ${interpretation.level}. Provide insights about text relationship and similarity.`
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
        algorithms,
        caseSensitive,
        ignorePunctuation,
        ignoreStopWords,
        includeDetails
      },
      aiInsights
    });

  } catch (error) {
    console.error('Text similarity analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text similarity' },
      { status: 500 }
    );
  }
}

function calculateCosineSimilarity(tokens1: string[], tokens2: string[]): { similarity: number; details: any } {
  // Create word frequency vectors
  const allWords = new Set([...tokens1, ...tokens2]);
  const vector1: number[] = [];
  const vector2: number[] = [];

  for (const word of allWords) {
    vector1.push(tokens1.filter(w => w === word).length);
    vector2.push(tokens2.filter(w => w === word).length);
  }

  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
  }

  // Calculate magnitudes
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

  // Calculate cosine similarity
  const similarity = magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);

  return {
    similarity,
    details: {
      vectorSize: allWords.size,
      dotProduct,
      magnitude1,
      magnitude2
    }
  };
}

function calculateJaccardSimilarity(tokens1: string[], tokens2: string[]): { similarity: number; details: any } {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const similarity = union.size === 0 ? 1 : intersection.size / union.size;

  return {
    similarity,
    details: {
      intersectionSize: intersection.size,
      unionSize: union.size,
      set1Size: set1.size,
      set2Size: set2.size
    }
  };
}

function calculateLevenshteinSimilarity(text1: string, text2: string): { similarity: number; details: any } {
  const distance = levenshteinDistance(text1, text2);
  const maxLength = Math.max(text1.length, text2.length);
  const similarity = maxLength === 0 ? 1 : 1 - (distance / maxLength);

  return {
    similarity,
    details: {
      distance,
      maxLength,
      text1Length: text1.length,
      text2Length: text2.length
    }
  };
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j += 1) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

function calculateEuclideanSimilarity(tokens1: string[], tokens2: string[]): { similarity: number; details: any } {
  const allWords = new Set([...tokens1, ...tokens2]);
  const vector1: number[] = [];
  const vector2: number[] = [];

  for (const word of allWords) {
    vector1.push(tokens1.filter(w => w === word).length);
    vector2.push(tokens2.filter(w => w === word).length);
  }

  // Calculate Euclidean distance
  let sumSquaredDifferences = 0;
  for (let i = 0; i < vector1.length; i++) {
    const diff = vector1[i] - vector2[i];
    sumSquaredDifferences += diff * diff;
  }
  
  const distance = Math.sqrt(sumSquaredDifferences);
  const maxDistance = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0) + 
                                 vector2.reduce((sum, val) => sum + val * val, 0));
  const similarity = maxDistance === 0 ? 1 : 1 - (distance / maxDistance);

  return {
    similarity,
    details: {
      distance,
      maxDistance,
      vectorSize: allWords.size
    }
  };
}

function calculateManhattanSimilarity(tokens1: string[], tokens2: string[]): { similarity: number; details: any } {
  const allWords = new Set([...tokens1, ...tokens2]);
  const vector1: number[] = [];
  const vector2: number[] = [];

  for (const word of allWords) {
    vector1.push(tokens1.filter(w => w === word).length);
    vector2.push(tokens2.filter(w => w === word).length);
  }

  // Calculate Manhattan distance
  let sumAbsoluteDifferences = 0;
  for (let i = 0; i < vector1.length; i++) {
    sumAbsoluteDifferences += Math.abs(vector1[i] - vector2[i]);
  }
  
  const distance = sumAbsoluteDifferences;
  const maxDistance = vector1.reduce((sum, val) => sum + val, 0) + 
                     vector2.reduce((sum, val) => sum + val, 0);
  const similarity = maxDistance === 0 ? 1 : 1 - (distance / maxDistance);

  return {
    similarity,
    details: {
      distance,
      maxDistance,
      vectorSize: allWords.size
    }
  };
}

function interpretSimilarity(similarity: number): { level: string; description: string } {
  if (similarity >= 0.9) {
    return {
      level: 'Very High',
      description: 'Texts are very similar, likely paraphrases or minor variations'
    };
  } else if (similarity >= 0.7) {
    return {
      level: 'High',
      description: 'Texts share significant content and structure'
    };
  } else if (similarity >= 0.5) {
    return {
      level: 'Moderate',
      description: 'Texts have some common elements but differ significantly'
    };
  } else if (similarity >= 0.3) {
    return {
      level: 'Low',
      description: 'Texts have minimal similarity'
    };
  } else {
    return {
      level: 'Very Low',
      description: 'Texts are substantially different'
    };
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Text Similarity API',
    usage: 'POST /api/text-tools/text-similarity',
    parameters: {
      text1: 'First text to compare (required)',
      text2: 'Second text to compare (required)',
      algorithms: 'Similarity algorithms to use (default: ["cosine", "jaccard", "levenshtein"]) - optional',
      caseSensitive: 'Case sensitive comparison (default: false) - optional',
      ignorePunctuation: 'Ignore punctuation (default: true) - optional',
      ignoreStopWords: 'Ignore common stop words (default: false) - optional',
      includeDetails: 'Include detailed calculation data (default: false) - optional'
    },
    algorithms: {
      cosine: 'Cosine similarity based on word frequency vectors',
      jaccard: 'Jaccard similarity based on word set intersection',
      levenshtein: 'Levenshtein distance-based similarity',
      euclidean: 'Euclidean distance-based similarity',
      manhattan: 'Manhattan distance-based similarity'
    },
    example: {
      text1: 'The quick brown fox jumps over the lazy dog',
      text2: 'A fast brown fox leaps over the sleepy dog',
      algorithms: ['cosine', 'jaccard', 'levenshtein'],
      caseSensitive: false,
      ignorePunctuation: true,
      ignoreStopWords: true,
      includeDetails: true
    }
  });
}