import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      operations = [],
      preserveLineBreaks = true,
      trimWhitespace = true,
      outputFormat = 'plain'
    } = body;

    // Input validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(operations)) {
      return NextResponse.json(
        { error: 'Operations must be an array' },
        { status: 400 }
      );
    }

    const validOperations = [
      'uppercase', 'lowercase', 'titlecase', 'sentencecase', 'camelcase',
      'pascalcase', 'snakecase', 'kebabcase', 'reverse', 'shuffle',
      'removeSpaces', 'normalizeSpaces', 'addSpaces', 'removePunctuation',
      'removeNumbers', 'removeSpecialChars', 'reverseWords', 'sortWords',
      'countWords', 'countCharacters', 'countSentences', 'countLines'
    ];

    const invalidOperations = operations.filter(op => !validOperations.includes(op));
    if (invalidOperations.length > 0) {
      return NextResponse.json(
        { error: `Invalid operations: ${invalidOperations.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof preserveLineBreaks !== 'boolean' || typeof trimWhitespace !== 'boolean') {
      return NextResponse.json(
        { error: 'Boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    if (!['plain', 'html', 'markdown', 'json'].includes(outputFormat)) {
      return NextResponse.json(
        { error: 'Output format must be plain, html, markdown, or json' },
        { status: 400 }
      );
    }

    // Preprocess text
    let processedText = text;
    
    if (trimWhitespace) {
      processedText = processedText.trim();
    }

    if (!preserveLineBreaks) {
      processedText = processedText.replace(/\s+/g, ' ');
    }

    // Apply operations in order
    const operationResults: any[] = [];
    let currentText = processedText;

    for (const operation of operations) {
      const result = applyTextOperation(currentText, operation);
      currentText = result.text;
      operationResults.push({
        operation: operation,
        result: result.text,
        changes: result.changes,
        description: result.description
      });
    }

    // Generate statistics
    const stats = generateTextStatistics(currentText);

    // Format output
    let formattedOutput = currentText;
    let formattedHTML = '';
    let formattedMarkdown = '';
    let formattedJSON = '';

    switch (outputFormat) {
      case 'html':
        formattedOutput = formatAsHTML(currentText);
        break;
      case 'markdown':
        formattedOutput = formatAsMarkdown(currentText);
        break;
      case 'json':
        formattedOutput = currentText;
        break;
      default:
        // Keep as plain text
        break;
    }

    // Generate all formats for comparison
    formattedHTML = formatAsHTML(currentText);
    formattedMarkdown = formatAsMarkdown(currentText);
    formattedJSON = JSON.stringify({ text: currentText, statistics: stats }, null, 2);

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a text processing and typography expert. Analyze the text formatting operations and provide insights about text transformation, best practices, and applications.'
          },
          {
            role: 'user',
            content: `Applied ${operations.length} text formatting operations: ${operations.join(', ')}. Original text length: ${text.length}, processed text length: ${currentText.length}. Operations performed: ${operationResults.map(r => `${r.operation} (${r.changes} changes)`).join(', ')}. Provide insights about text processing and best practices.`
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
      original: {
        text: text,
        length: text.length,
        stats: generateTextStatistics(text)
      },
      processed: {
        text: currentText,
        length: currentText.length,
        stats: stats
      },
      output: {
        plain: currentText,
        html: formattedHTML,
        markdown: formattedMarkdown,
        json: formattedJSON
      },
      currentFormat: outputFormat,
      operations: operationResults,
      parameters: {
        operations,
        preserveLineBreaks,
        trimWhitespace,
        outputFormat
      },
      aiInsights
    });

  } catch (error) {
    console.error('Text formatting error:', error);
    return NextResponse.json(
      { error: 'Failed to format text' },
      { status: 500 }
    );
  }
}

// Helper functions
function applyTextOperation(text: string, operation: string): { text: string; changes: number; description: string } {
  let result = text;
  let changes = 0;
  let description = '';

  switch (operation) {
    case 'uppercase':
      result = text.toUpperCase();
      changes = text !== result ? 1 : 0;
      description = 'Converted to uppercase';
      break;

    case 'lowercase':
      result = text.toLowerCase();
      changes = text !== result ? 1 : 0;
      description = 'Converted to lowercase';
      break;

    case 'titlecase':
      result = text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      changes = text !== result ? 1 : 0;
      description = 'Converted to title case';
      break;

    case 'sentencecase':
      result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      changes = text !== result ? 1 : 0;
      description = 'Converted to sentence case';
      break;

    case 'camelcase':
      result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
      changes = text !== result ? 1 : 0;
      description = 'Converted to camel case';
      break;

    case 'pascalcase':
      result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '');
      changes = text !== result ? 1 : 0;
      description = 'Converted to pascal case';
      break;

    case 'snakecase':
      result = text.toLowerCase().replace(/\s+/g, '_');
      changes = text !== result ? 1 : 0;
      description = 'Converted to snake case';
      break;

    case 'kebabcase':
      result = text.toLowerCase().replace(/\s+/g, '-');
      changes = text !== result ? 1 : 0;
      description = 'Converted to kebab case';
      break;

    case 'reverse':
      result = text.split('').reverse().join('');
      changes = text !== result ? 1 : 0;
      description = 'Reversed text';
      break;

    case 'shuffle':
      const words = text.split(/\s+/);
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      result = words.join(' ');
      changes = text !== result ? 1 : 0;
      description = 'Shuffled words';
      break;

    case 'removeSpaces':
      result = text.replace(/\s+/g, '');
      changes = text !== result ? 1 : 0;
      description = 'Removed all spaces';
      break;

    case 'normalizeSpaces':
      result = text.replace(/\s+/g, ' ');
      changes = text !== result ? 1 : 0;
      description = 'Normalized whitespace';
      break;

    case 'addSpaces':
      result = text.split('').join(' ');
      changes = text !== result ? 1 : 0;
      description = 'Added spaces between characters';
      break;

    case 'removePunctuation':
      result = text.replace(/[^\w\s]/g, '');
      changes = text !== result ? 1 : 0;
      description = 'Removed punctuation';
      break;

    case 'removeNumbers':
      result = text.replace(/\d/g, '');
      changes = text !== result ? 1 : 0;
      description = 'Removed numbers';
      break;

    case 'removeSpecialChars':
      result = text.replace(/[^\w\s.,!?]/g, '');
      changes = text !== result ? 1 : 0;
      description = 'Removed special characters';
      break;

    case 'reverseWords':
      result = text.split(/\s+/).reverse().join(' ');
      changes = text !== result ? 1 : 0;
      description = 'Reversed word order';
      break;

    case 'sortWords':
      result = text.split(/\s+/).sort((a, b) => a.localeCompare(b)).join(' ');
      changes = text !== result ? 1 : 0;
      description = 'Sorted words alphabetically';
      break;

    case 'countWords':
      // This is a read-only operation, doesn't change text
      result = text;
      changes = 0;
      description = 'Counted words (no change to text)';
      break;

    case 'countCharacters':
      // This is a read-only operation, doesn't change text
      result = text;
      changes = 0;
      description = 'Counted characters (no change to text)';
      break;

    case 'countSentences':
      // This is a read-only operation, doesn't change text
      result = text;
      changes = 0;
      description = 'Counted sentences (no change to text)';
      break;

    case 'countLines':
      // This is a read-only operation, doesn't change text
      result = text;
      changes = 0;
      description = 'Counted lines (no change to text)';
      break;

    default:
      result = text;
      changes = 0;
      description = 'Unknown operation';
  }

  return { text: result, changes, description };
}

function generateTextStatistics(text: string): any {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  return {
    characters,
    charactersNoSpaces,
    words: words.length,
    sentences: sentences.length,
    lines: lines.length,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
    averageCharactersPerWord: words.length > 0 ? Math.round(charactersNoSpaces / words.length) : 0,
    lexicalDiversity: words.length > 0 ? ((new Set(words.map(w => w.toLowerCase())).size / words.length) * 100).toFixed(2) + '%' : '0%'
  };
}

function formatAsHTML(text: string): string {
  return `<p>${text.replace(/\n/g, '</p><p>')}</p>`;
}

function formatAsMarkdown(text: string): string {
  return text.replace(/\n/g, '\n\n');
}

export async function GET() {
  return NextResponse.json({
    message: 'Text Formatter API',
    usage: 'POST /api/text-tools/text-formatter',
    parameters: {
      text: 'Text to format (required)',
      operations: 'Array of operations to apply (default: []) - optional',
      preserveLineBreaks: 'Preserve line breaks (default: true) - optional',
      trimWhitespace: 'Trim leading/trailing whitespace (default: true) - optional',
      outputFormat: 'Output format: plain, html, markdown, json (default: plain) - optional'
    },
    operations: {
      case: {
        uppercase: 'Convert to UPPERCASE',
        lowercase: 'convert to lowercase',
        titlecase: 'Convert To Title Case',
        sentencecase: 'Convert to sentence case',
        camelcase: 'convertToCamelCase',
        pascalcase: 'ConvertToPascalCase'
      },
      formatting: {
        snakecase: 'convert_to_snake_case',
        kebabcase: 'convert-to-kebab-case',
        reverse: 'Reverse entire text',
        shuffle: 'Shuffle word order'
      },
      cleaning: {
        removeSpaces: 'RemoveAllSpaces',
        normalizeSpaces: 'Normalize whitespace',
        addSpaces: 'A d d S p a c e s',
        removePunctuation: 'Remove punctuation',
        removeNumbers: 'Remove numbers',
        removeSpecialChars: 'Remove special characters'
      },
      manipulation: {
        reverseWords: 'Reverse word order',
        sortWords: 'Sort words alphabetically'
      },
      analysis: {
        countWords: 'Count words (read-only)',
        countCharacters: 'Count characters (read-only)',
        countSentences: 'Count sentences (read-only)',
        countLines: 'Count lines (read-only)'
      }
    },
    examples: [
      {
        text: 'Hello World! This is a test.',
        operations: ['uppercase', 'removePunctuation'],
        outputFormat: 'plain'
      },
      {
        text: 'the quick brown fox jumps over the lazy dog',
        operations: ['titlecase', 'reverseWords'],
        outputFormat: 'html'
      },
      {
        text: 'ConvertThisToCamelCase',
        operations: ['snakecase', 'lowercase'],
        outputFormat: 'markdown'
      }
    ],
    tips: [
      'Operations are applied in the order they are specified',
      'Read-only operations (count*) do not modify the text',
      'Use multiple operations for complex transformations',
      'Consider the output format for your specific use case',
      'Test operations with sample text before applying to large amounts'
    ]
  });
}