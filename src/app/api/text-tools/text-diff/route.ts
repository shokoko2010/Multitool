import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DiffOptions {
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
  ignoreLineEnding?: boolean;
  contextLines?: number;
  outputFormat?: 'unified' | 'context' | 'html' | 'json';
  showLineNumbers?: boolean;
  highlightChanges?: boolean;
}

interface DiffResult {
  success: boolean;
  data?: {
    originalText: string;
    modifiedText: string;
    diff: {
      added: number;
      removed: number;
      unchanged: number;
      total: number;
      similarity: number;
    };
    changes: Array<{
      type: 'added' | 'removed' | 'unchanged';
      line?: number;
      content: string;
      oldLine?: number;
      newLine?: number;
    }>;
    formattedDiff?: string;
    options: DiffOptions;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { originalText, modifiedText, options = {} } = await request.json();

    if (!originalText || !modifiedText) {
      return NextResponse.json<DiffResult>({
        success: false,
        error: 'Both original and modified text are required'
      }, { status: 400 });
    }

    // Set default options
    const diffOptions: DiffOptions = {
      ignoreCase: options.ignoreCase || false,
      ignoreWhitespace: options.ignoreWhitespace || false,
      ignoreLineEnding: options.ignoreLineEnding || false,
      contextLines: Math.min(Math.max(options.contextLines || 3, 0), 10),
      outputFormat: options.outputFormat || 'unified',
      showLineNumbers: options.showLineNumbers !== false,
      highlightChanges: options.highlightChanges !== false
    };

    // Preprocess texts based on options
    let processedOriginal = originalText;
    let processedModified = modifiedText;

    if (diffOptions.ignoreCase) {
      processedOriginal = processedOriginal.toLowerCase();
      processedModified = processedModified.toLowerCase();
    }

    if (diffOptions.ignoreWhitespace) {
      processedOriginal = processedOriginal.replace(/\s+/g, ' ').trim();
      processedModified = processedModified.replace(/\s+/g, ' ').trim();
    }

    if (diffOptions.ignoreLineEnding) {
      processedOriginal = processedOriginal.replace(/\r\n/g, '\n');
      processedModified = processedModified.replace(/\r\n/g, '\n');
    }

    // Split into lines
    const originalLines = processedOriginal.split('\n');
    const modifiedLines = processedModified.split('\n');

    // Perform diff analysis
    const diffResult = performDiff(originalLines, modifiedLines, diffOptions);

    // Calculate statistics
    const added = diffResult.filter(change => change.type === 'added').length;
    const removed = diffResult.filter(change => change.type === 'removed').length;
    const unchanged = diffResult.filter(change => change.type === 'unchanged').length;
    const total = Math.max(originalLines.length, modifiedLines.length);
    const similarity = total > 0 ? ((unchanged * 2) / (originalLines.length + modifiedLines.length)) * 100 : 100;

    // Format output based on options
    let formattedDiff = '';
    if (diffOptions.outputFormat === 'unified') {
      formattedDiff = formatUnifiedDiff(diffResult, diffOptions);
    } else if (diffOptions.outputFormat === 'html') {
      formattedDiff = formatHtmlDiff(diffResult, diffOptions);
    } else if (diffOptions.outputFormat === 'json') {
      formattedDiff = JSON.stringify(diffResult, null, 2);
    }

    const result = {
      originalText,
      modifiedText,
      diff: {
        added,
        removed,
        unchanged,
        total,
        similarity: Math.round(similarity * 100) / 100
      },
      changes: diffResult,
      formattedDiff: diffOptions.outputFormat !== 'json' ? formattedDiff : undefined,
      options: diffOptions
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a text comparison expert. Analyze the diff results and provide insights about the nature of changes, potential impact, and recommendations for reviewing the differences.'
          },
          {
            role: 'user',
            content: `Analyze this text diff result:\n\nSimilarity: ${result.diff.similarity}%\nAdded Lines: ${result.diff.added}\nRemoved Lines: ${result.diff.removed}\nUnchanged Lines: ${result.diff.unchanged}\nTotal Lines: ${result.diff.total}\n\nOptions Used: ${JSON.stringify(diffOptions, null, 2)}\n\nChange Summary: ${result.changes.slice(0, 5).map(c => `${c.type}: ${c.content.substring(0, 50)}...`).join(', ')}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<DiffResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Text diff error:', error);
    return NextResponse.json<DiffResult>({
      success: false,
      error: 'Internal server error during text diff'
    }, { status: 500 });
  }
}

// Simple diff algorithm implementation
function performDiff(originalLines: string[], modifiedLines: string[], options: DiffOptions) {
  const changes: Array<{
    type: 'added' | 'removed' | 'unchanged';
    line?: number;
    content: string;
    oldLine?: number;
    newLine?: number;
  }> = [];

  const maxLines = Math.max(originalLines.length, modifiedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i];
    const modifiedLine = modifiedLines[i];
    
    if (originalLine === modifiedLine) {
      changes.push({
        type: 'unchanged',
        line: i + 1,
        content: originalLine || '',
        oldLine: i + 1,
        newLine: i + 1
      });
    } else if (originalLine && !modifiedLine) {
      changes.push({
        type: 'removed',
        line: i + 1,
        content: originalLine,
        oldLine: i + 1
      });
    } else if (!originalLine && modifiedLine) {
      changes.push({
        type: 'added',
        line: i + 1,
        content: modifiedLine,
        newLine: i + 1
      });
    } else {
      // Both lines exist but are different
      changes.push({
        type: 'removed',
        line: i + 1,
        content: originalLine,
        oldLine: i + 1
      });
      changes.push({
        type: 'added',
        line: i + 1,
        content: modifiedLine,
        newLine: i + 1
      });
    }
  }

  return changes;
}

// Format diff in unified format
function formatUnifiedDiff(changes: any[], options: DiffOptions): string {
  let output = '';
  
  changes.forEach(change => {
    const prefix = change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' ';
    const lineNum = options.showLineNumbers ? `${change.line || ''}\t` : '';
    output += `${prefix}${lineNum}${change.content}\n`;
  });
  
  return output;
}

// Format diff in HTML format
function formatHtmlDiff(changes: any[], options: DiffOptions): string {
  let output = '<div class="diff-container">';
  
  changes.forEach(change => {
    const className = change.type === 'added' ? 'diff-added' : 
                     change.type === 'removed' ? 'diff-removed' : 'diff-unchanged';
    const lineNum = options.showLineNumbers ? `<span class="line-number">${change.line || ''}</span>` : '';
    output += `<div class="${className}">${lineNum}<span class="content">${escapeHtml(change.content)}</span></div>`;
  });
  
  output += '</div>';
  return output;
}

// Escape HTML entities
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with original and modified text'
  }, { status: 405 });
}