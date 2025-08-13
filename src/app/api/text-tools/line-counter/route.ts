import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, ignoreEmptyLines = true, ignoreWhitespaceLines = true, countCharacters = false, includeLineNumbers = false } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (typeof ignoreEmptyLines !== 'boolean' || typeof ignoreWhitespaceLines !== 'boolean' || 
        typeof countCharacters !== 'boolean' || typeof includeLineNumbers !== 'boolean') {
      return NextResponse.json(
        { error: 'All boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    // Split text into lines
    const lines = text.split('\n');
    
    // Analyze lines
    const lineAnalysis = {
      totalLines: lines.length,
      nonEmptyLines: 0,
      whitespaceLines: 0,
      emptyLines: 0,
      longestLine: { index: -1, length: 0, content: '' },
      shortestLine: { index: -1, length: Infinity, content: '' },
      averageLineLength: 0,
      totalCharacters: 0
    };

    const processedLines: Array<{
      number: number;
      content: string;
      length: number;
      type: 'empty' | 'whitespace' | 'content';
      characterCount: number;
    }> = [];

    let totalLength = 0;
    let contentLines = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLength = line.length;
      const trimmedLine = line.trim();
      
      // Determine line type
      let type: 'empty' | 'whitespace' | 'content' = 'empty';
      if (trimmedLine.length > 0) {
        type = 'content';
        lineAnalysis.nonEmptyLines++;
        contentLines++;
      } else if (line.length > 0) {
        type = 'whitespace';
        lineAnalysis.whitespaceLines++;
      } else {
        lineAnalysis.emptyLines++;
      }

      // Track longest and shortest lines
      if (type === 'content') {
        if (lineLength > lineAnalysis.longestLine.length) {
          lineAnalysis.longestLine = { index: i, length: lineLength, content: line };
        }
        if (lineLength < lineAnalysis.shortestLine.length) {
          lineAnalysis.shortestLine = { index: i, length: lineLength, content: line };
        }
      }

      totalLength += lineLength;

      // Count characters in line
      const characterCount = countCharacters ? {
        total: lineLength,
        nonWhitespace: line.replace(/\s/g, '').length,
        letters: (line.match(/[a-zA-Z]/g) || []).length,
        digits: (line.match(/[0-9]/g) || []).length,
        punctuation: (line.match(/[^\w\s]/g) || []).length
      } : null;

      processedLines.push({
        number: i + 1,
        content: line,
        length: lineLength,
        type,
        characterCount
      });
    }

    // Calculate average line length
    lineAnalysis.averageLineLength = contentLines > 0 ? 
      Math.round((totalLength / contentLines) * 100) / 100 : 0;
    lineAnalysis.totalCharacters = totalLength;

    // Apply filters
    let filteredLines = processedLines;
    if (ignoreEmptyLines) {
      filteredLines = filteredLines.filter(line => line.type !== 'empty');
    }
    if (ignoreWhitespaceLines) {
      filteredLines = filteredLines.filter(line => line.type !== 'whitespace');
    }

    // Line length distribution
    const lengthDistribution = {
      veryShort: 0,    // 1-10 chars
      short: 0,        // 11-30 chars
      medium: 0,       // 31-80 chars
      long: 0,         // 81-150 chars
      veryLong: 0      // 150+ chars
    };

    for (const line of processedLines) {
      if (line.type === 'content') {
        if (line.length <= 10) lengthDistribution.veryShort++;
        else if (line.length <= 30) lengthDistribution.short++;
        else if (line.length <= 80) lengthDistribution.medium++;
        else if (line.length <= 150) lengthDistribution.long++;
        else lengthDistribution.veryLong++;
      }
    }

    // Line pattern analysis
    const patterns = {
      numberedLines: (text.match(/^\s*\d+/gm) || []).length,
      bulletPoints: (text.match(/^[\s]*[-*•]/gm) || []).length,
      quotedLines: (text.match(/^[\s]*["']/gm) || []).length,
      codeLines: (text.match(/^[\s]*[{}[\]();]/gm) || []).length,
      urlLines: (text.match(/^[\s]*https?:\/\//gm) || []).length
    };

    // Calculate filtered counts
    const filteredCounts = {
      totalLines: filteredLines.length,
      contentLines: filteredLines.filter(line => line.type === 'content').length,
      whitespaceLines: filteredLines.filter(line => line.type === 'whitespace').length,
      emptyLines: filteredLines.filter(line => line.type === 'empty').length
    };

    const result = {
      summary: {
        totalLines: lineAnalysis.totalLines,
        filteredLines: filteredCounts.totalLines,
        contentLines: lineAnalysis.nonEmptyLines,
        whitespaceLines: lineAnalysis.whitespaceLines,
        emptyLines: lineAnalysis.emptyLines
      },
      lineAnalysis: {
        longestLine: {
          lineNumber: lineAnalysis.longestLine.index + 1,
          length: lineAnalysis.longestLine.length,
          content: includeLineNumbers ? lineAnalysis.longestLine.content : 
                   lineAnalysis.longestLine.content.substring(0, 50) + 
                   (lineAnalysis.longestLine.content.length > 50 ? '...' : '')
        },
        shortestLine: {
          lineNumber: lineAnalysis.shortestLine.index + 1,
          length: lineAnalysis.shortestLine.length,
          content: includeLineNumbers ? lineAnalysis.shortestLine.content : 
                   lineAnalysis.shortestLine.content
        },
        averageLineLength: lineAnalysis.averageLineLength,
        totalCharacters: lineAnalysis.totalCharacters
      },
      distribution: lengthDistribution,
      patterns,
      filteredCounts
    };

    // Add detailed line data if requested
    if (includeLineNumbers) {
      result.lines = processedLines.map(line => ({
        number: line.number,
        length: line.length,
        type: line.type,
        characterCount: line.characterCount,
        preview: line.content.length > 100 ? line.content.substring(0, 100) + '...' : line.content
      }));
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a text structure analysis expert. Analyze the line count data and provide insights about the text structure, formatting, and organization patterns.'
          },
          {
            role: 'user',
            content: `Analyzed text with ${lineAnalysis.totalLines} total lines, ${lineAnalysis.nonEmptyLines} content lines. Average line length: ${lineAnalysis.averageLineLength}. Longest line: ${lineAnalysis.longestLine.length} chars. Patterns found: ${Object.entries(patterns).filter(([_, count]) => count > 0).map(([type, count]) => `${type}: ${count}`).join(', ') || 'none'}. Provide insights about text structure and organization.`
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
        ignoreEmptyLines,
        ignoreWhitespaceLines,
        countCharacters,
        includeLineNumbers
      },
      aiInsights
    });

  } catch (error) {
    console.error('Line counter error:', error);
    return NextResponse.json(
      { error: 'Failed to count lines' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Line Counter API',
    usage: 'POST /api/text-tools/line-counter',
    parameters: {
      text: 'Text to analyze (required)',
      ignoreEmptyLines: 'Exclude empty lines from count (default: true) - optional',
      ignoreWhitespaceLines: 'Exclude lines with only whitespace (default: true) - optional',
      countCharacters: 'Include character count per line (default: false) - optional',
      includeLineNumbers: 'Include detailed line data (default: false) - optional'
    },
    analysis: {
      summary: ['Total lines', 'Content lines', 'Whitespace lines', 'Empty lines'],
      lineAnalysis: ['Longest/shortest lines', 'Average line length', 'Total characters'],
      distribution: ['Line length categories (very short to very long)'],
      patterns: ['Numbered lines', 'Bullet points', 'Quoted lines', 'Code lines', 'URL lines'],
      filteredCounts: ['Counts after applying filters']
    },
    example: {
      text: 'Line 1\n\nLine 3\n  \nLine 5 with more text',
      ignoreEmptyLines: true,
      ignoreWhitespaceLines: true,
      countCharacters: true,
      includeLineNumbers: false
    }
  });
}