import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface RepeatOptions {
  count: number;
  separator: string;
  includeNewlines: boolean;
  reverseOrder: boolean;
  addNumbers: boolean;
  customPrefix?: string;
  customSuffix?: string;
  uppercase: boolean;
  lowercase: boolean;
  capitalize: boolean;
}

interface RepeatResult {
  success: boolean;
  originalText: string;
  repeatedText: string;
  totalCharacters: number;
  totalWords: number;
  totalLines: number;
  options: RepeatOptions;
  estimatedMemoryUsage: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options = {} } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: RepeatOptions = {
      count: 1,
      separator: ' ',
      includeNewlines: false,
      reverseOrder: false,
      addNumbers: false,
      uppercase: false,
      lowercase: false,
      capitalize: false,
    };

    const finalOptions: RepeatOptions = { ...defaultOptions, ...options };

    // Validate options
    if (finalOptions.count < 1 || finalOptions.count > 10000) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 10,000' },
        { status: 400 }
      );
    }

    if (text.length * finalOptions.count > 1000000) { // 1MB limit
      return NextResponse.json(
        { error: 'Result would be too large. Please reduce text length or count.' },
        { status: 400 }
      );
    }

    // Apply text transformations
    let processedText = text;
    
    if (finalOptions.uppercase) {
      processedText = text.toUpperCase();
    } else if (finalOptions.lowercase) {
      processedText = text.toLowerCase();
    } else if (finalOptions.capitalize) {
      processedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    // Generate repeated text
    const repeatedParts: string[] = [];
    
    for (let i = 0; i < finalOptions.count; i++) {
      let part = '';
      
      // Add custom prefix if specified
      if (finalOptions.customPrefix) {
        part += finalOptions.customPrefix;
      }
      
      // Add number if requested
      if (finalOptions.addNumbers) {
        part += `${i + 1}. `;
      }
      
      part += processedText;
      
      // Add custom suffix if specified
      if (finalOptions.customSuffix) {
        part += finalOptions.customSuffix;
      }
      
      repeatedParts.push(part);
    }

    // Reverse order if requested
    if (finalOptions.reverseOrder) {
      repeatedParts.reverse();
    }

    // Join parts with separator
    let repeatedText = repeatedParts.join(finalOptions.separator);
    
    // Add newlines if requested
    if (finalOptions.includeNewlines) {
      repeatedText = repeatedParts.join(finalOptions.separator + '\n');
    }

    // Calculate statistics
    const totalCharacters = repeatedText.length;
    const totalWords = repeatedText.split(/\s+/).filter(word => word.length > 0).length;
    const totalLines = repeatedText.split('\n').length;

    // Estimate memory usage
    const estimatedMemoryUsage = formatBytes(repeatedText.length * 2); // UTF-16 encoding

    const result: RepeatResult = {
      success: true,
      originalText: text,
      repeatedText,
      totalCharacters,
      totalWords,
      totalLines,
      options: finalOptions,
      estimatedMemoryUsage,
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a text processing expert. Provide insights about text repetition and its use cases.'
          },
          {
            role: 'user',
            content: `Analyze this text repetition operation:
            - Original text length: ${text.length} characters
            - Repetition count: ${finalOptions.count}
            - Result length: ${totalCharacters} characters
            - Memory usage: ${estimatedMemoryUsage}
            - Options: ${JSON.stringify(finalOptions, null, 2)}
            
            Provide insights about:
            1. Common use cases for text repetition
            2. Performance considerations
            3. Tips for efficient text processing
            Keep it concise and informative.`
          }
        ],
        max_tokens: 250,
        temperature: 0.3,
      });

      aiInsights = completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
      aiInsights = 'AI analysis unavailable';
    }

    return NextResponse.json({
      result,
      aiInsights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Text repeat error:', error);
    return NextResponse.json(
      { error: 'Internal server error during text repetition' },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}