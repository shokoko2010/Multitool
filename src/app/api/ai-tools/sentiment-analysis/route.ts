import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      includeEmotions = false, 
      includeKeywords = false,
      includeSentenceAnalysis = false,
      model = 'basic'
    } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (typeof includeEmotions !== 'boolean' || typeof includeKeywords !== 'boolean' || 
        typeof includeSentenceAnalysis !== 'boolean') {
      return NextResponse.json(
        { error: 'All boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    if (!['basic', 'advanced'].includes(model)) {
      return NextResponse.json(
        { error: 'Model must be either "basic" or "advanced"' },
        { status: 400 }
      );
    }

    // Basic sentiment lexicons
    const positiveWords = new Set([
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love',
      'like', 'happy', 'joy', 'pleased', 'delighted', 'thrilled', 'excited', 'positive',
      'beautiful', 'perfect', 'best', 'brilliant', 'outstanding', 'superb', 'magnificent',
      'terrific', 'fabulous', 'incredible', 'marvelous', 'spectacular', 'impressive',
      'satisfied', 'content', 'grateful', 'blessed', 'fortunate', 'lucky', 'cheerful',
      'optimistic', 'hopeful', 'confident', 'proud', 'successful', 'victorious', 'triumphant'
    ]);

    const negativeWords = new Set([
      'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'dislike', 'angry',
      'sad', 'unhappy', 'miserable', 'depressed', 'disappointed', 'frustrated', 'annoyed',
      'upset', 'mad', 'furious', 'enraged', 'negative', 'worst', 'poor', 'inferior',
      'failure', 'fail', 'lose', 'lost', 'defeated', 'hopeless', 'helpless', 'worthless',
      'pathetic', 'useless', 'stupid', 'dumb', 'idiotic', 'ridiculous', 'absurd',
      'unfair', 'unjust', 'wrong', 'evil', 'vicious', 'cruel', 'brutal', 'harsh'
    ]);

    const emotionWords = {
      joy: new Set(['happy', 'joy', 'excited', 'delighted', 'thrilled', 'cheerful', 'gleeful', 'jubilant']),
      sadness: new Set(['sad', 'unhappy', 'depressed', 'miserable', 'grief', 'sorrow', 'melancholy', 'despair']),
      anger: new Set(['angry', 'mad', 'furious', 'enraged', 'irritated', 'annoyed', 'frustrated', 'outraged']),
      fear: new Set(['afraid', 'scared', 'terrified', 'fearful', 'anxious', 'worried', 'nervous', 'panicked']),
      surprise: new Set(['surprised', 'amazed', 'astonished', 'shocked', 'stunned', 'bewildered', 'astounded']),
      disgust: new Set(['disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated', 'appalled'])
    };

    // Preprocess text
    const processedText = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = processedText.split(/\s+/).filter(word => word.length > 0);

    // Calculate basic sentiment scores
    let positiveScore = 0;
    let negativeScore = 0;
    const foundPositiveWords: string[] = [];
    const foundNegativeWords: string[] = [];

    words.forEach(word => {
      if (positiveWords.has(word)) {
        positiveScore++;
        foundPositiveWords.push(word);
      }
      if (negativeWords.has(word)) {
        negativeScore++;
        foundNegativeWords.push(word);
      }
    });

    // Calculate overall sentiment
    const totalSentimentWords = positiveScore + negativeScore;
    const sentimentScore = totalSentimentWords > 0 ? (positiveScore - negativeScore) / totalSentimentWords : 0;

    // Determine sentiment category
    let sentimentCategory: string;
    let confidence: number;

    if (sentimentScore > 0.3) {
      sentimentCategory = 'Positive';
      confidence = Math.min(0.5 + (sentimentScore - 0.3) * 0.5, 1.0);
    } else if (sentimentScore < -0.3) {
      sentimentCategory = 'Negative';
      confidence = Math.min(0.5 + (-sentimentScore - 0.3) * 0.5, 1.0);
    } else {
      sentimentCategory = 'Neutral';
      confidence = 1.0 - Math.abs(sentimentScore);
    }

    // Emotion analysis
    let emotions: Record<string, number> = {};
    let dominantEmotion: string | null = null;
    let emotionKeywords: Record<string, string[]> = {};

    if (includeEmotions) {
      const emotionScores: Record<string, number> = {};
      
      Object.entries(emotionWords).forEach(([emotion, wordSet]) => {
        let score = 0;
        const keywords: string[] = [];
        
        words.forEach(word => {
          if (wordSet.has(word)) {
            score++;
            keywords.push(word);
          }
        });
        
        if (score > 0) {
          emotionScores[emotion] = score;
          emotionKeywords[emotion] = keywords;
        }
      });

      // Normalize emotion scores
      const totalEmotionScore = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
      if (totalEmotionScore > 0) {
        Object.keys(emotionScores).forEach(emotion => {
          emotions[emotion] = emotionScores[emotion] / totalEmotionScore;
        });
        
        // Find dominant emotion
        dominantEmotion = Object.entries(emotions).reduce((max, [emotion, score]) => 
          score > emotions[max] ? emotion : max, Object.keys(emotions)[0]);
      }
    }

    // Keyword analysis
    let keywordAnalysis: any = {};
    if (includeKeywords) {
      keywordAnalysis = {
        positive: {
          words: foundPositiveWords,
          count: foundPositiveWords.length,
          frequency: words.length > 0 ? (foundPositiveWords.length / words.length) * 100 : 0
        },
        negative: {
          words: foundNegativeWords,
          count: foundNegativeWords.length,
          frequency: words.length > 0 ? (foundNegativeWords.length / words.length) * 100 : 0
        },
        totalSentimentWords: totalSentimentWords,
        sentimentWordRatio: words.length > 0 ? (totalSentimentWords / words.length) * 100 : 0
      };
    }

    // Sentence-level analysis
    let sentenceAnalysis: any[] = [];
    if (includeSentenceAnalysis) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentenceAnalysis = sentences.map((sentence, index) => {
        const processedSentence = sentence.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        const sentenceWords = processedSentence.split(/\s+/).filter(word => word.length > 0);
        
        let sentencePositive = 0;
        let sentenceNegative = 0;
        const sentencePosWords: string[] = [];
        const sentenceNegWords: string[] = [];
        
        sentenceWords.forEach(word => {
          if (positiveWords.has(word)) {
            sentencePositive++;
            sentencePosWords.push(word);
          }
          if (negativeWords.has(word)) {
            sentenceNegative++;
            sentenceNegWords.push(word);
          }
        });
        
        const sentenceTotal = sentencePositive + sentenceNegative;
        const sentenceScore = sentenceTotal > 0 ? (sentencePositive - sentenceNegative) / sentenceTotal : 0;
        
        let sentenceSentiment: string;
        if (sentenceScore > 0.3) sentenceSentiment = 'Positive';
        else if (sentenceScore < -0.3) sentenceSentiment = 'Negative';
        else sentenceSentiment = 'Neutral';
        
        return {
          sentenceNumber: index + 1,
          text: sentence.trim(),
          sentiment: sentenceSentiment,
          score: sentenceScore,
          positiveWords: sentencePosWords,
          negativeWords: sentenceNegWords,
          wordCount: sentenceWords.length
        };
      });
    }

    // Text statistics
    const textStats = {
      totalWords: words.length,
      totalCharacters: text.length,
      averageWordLength: words.length > 0 ? (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(2) : '0.00',
      sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    };

    const result = {
      sentiment: {
        category: sentimentCategory,
        score: sentimentScore,
        confidence: confidence,
        interpretation: interpretSentiment(sentimentCategory, confidence)
      },
      scores: {
        positive: positiveScore,
        negative: negativeScore,
        neutral: words.length - totalSentimentWords
      },
      statistics: textStats
    };

    if (includeEmotions) {
      result.emotions = {
        dominant: dominantEmotion,
        scores: emotions,
        keywords: emotionKeywords
      };
    }

    if (includeKeywords) {
      result.keywords = keywordAnalysis;
    }

    if (includeSentenceAnalysis) {
      result.sentences = sentenceAnalysis;
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis expert. Analyze the sentiment analysis results and provide insights about the emotional tone, potential implications, and communication style.'
          },
          {
            role: 'user',
            content: `Analyzed text sentiment: ${sentimentCategory} (score: ${sentimentScore.toFixed(3)}, confidence: ${confidence.toFixed(3)}). Text has ${textStats.totalWords} words with ${positiveScore} positive and ${negativeScore} negative indicators. ${includeEmotions && dominantEmotion ? `Dominant emotion: ${dominantEmotion}.` : ''} Provide insights about the emotional tone and communication style.`
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
        includeEmotions,
        includeKeywords,
        includeSentenceAnalysis,
        model
      },
      aiInsights
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}

function interpretSentiment(category: string, confidence: number): string {
  const interpretations = {
    Positive: {
      high: 'Strongly positive tone with confident positive sentiment',
      medium: 'Generally positive with clear positive indicators',
      low: 'Slightly positive but with some uncertainty'
    },
    Negative: {
      high: 'Strongly negative tone with confident negative sentiment',
      medium: 'Generally negative with clear negative indicators',
      low: 'Slightly negative but with some uncertainty'
    },
    Neutral: {
      high: 'Clearly neutral with balanced sentiment',
      medium: 'Mostly neutral with slight tendencies',
      low: 'Neutral but with mixed or unclear indicators'
    }
  };

  let confidenceLevel: 'high' | 'medium' | 'low';
  if (confidence >= 0.8) confidenceLevel = 'high';
  else if (confidence >= 0.6) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  return interpretations[category as keyof typeof interpretations][confidenceLevel];
}

export async function GET() {
  return NextResponse.json({
    message: 'Sentiment Analysis API',
    usage: 'POST /api/ai-tools/sentiment-analysis',
    parameters: {
      text: 'Text to analyze (required)',
      includeEmotions: 'Include emotion analysis (default: false) - optional',
      includeKeywords: 'Include keyword analysis (default: false) - optional',
      includeSentenceAnalysis: 'Include sentence-level analysis (default: false) - optional',
      model: 'Analysis model: "basic" or "advanced" (default: "basic") - optional'
    },
    analysis: {
      sentiment: ['Category (Positive/Negative/Neutral)', 'Score (-1 to 1)', 'Confidence (0-1)', 'Interpretation'],
      scores: ['Positive word count', 'Negative word count', 'Neutral word count'],
      emotions: ['Dominant emotion', 'Emotion scores', 'Emotion keywords'],
      keywords: ['Positive/negative words', 'Frequency analysis'],
      sentences: ['Per-sentence sentiment', 'Sentence-level breakdown']
    },
    example: {
      text: 'I love this product! It works amazingly well and makes me very happy. The customer service was excellent too.',
      includeEmotions: true,
      includeKeywords: true,
      includeSentenceAnalysis: true,
      model: 'basic'
    }
  });
}