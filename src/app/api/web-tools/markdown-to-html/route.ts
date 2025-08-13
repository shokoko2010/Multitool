import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface MarkdownToHTMLOptions {
  flavor?: 'commonmark' | 'github' | 'markdown-extra';
  enableTables?: boolean;
  enableTaskLists?: boolean;
  enableStrikethrough?: boolean;
  enableEmoji?: boolean;
  enableHighlight?: boolean;
  enableSubscript?: boolean;
  enableSuperscript?: boolean;
  enableFootnotes?: boolean;
  sanitize?: boolean;
  linkify?: boolean;
  breaks?: boolean;
  headerIds?: boolean;
}

interface MarkdownToHTMLResult {
  success: boolean;
  data?: {
    html: string;
    options: MarkdownToHTMLOptions;
    stats: {
      inputLength: number;
      outputLength: number;
      compressionRatio: number;
      headers: number;
      links: number;
      images: number;
      codeBlocks: number;
      lists: number;
      tables: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { markdown, options = {} } = await request.json();

    if (!markdown) {
      return NextResponse.json<MarkdownToHTMLResult>({
        success: false,
        error: 'Markdown content is required'
      }, { status: 400 });
    }

    // Set default options
    const conversionOptions: MarkdownToHTMLOptions = {
      flavor: options.flavor || 'github',
      enableTables: options.enableTables !== false,
      enableTaskLists: options.enableTaskLists !== false,
      enableStrikethrough: options.enableStrikethrough !== false,
      enableEmoji: options.enableEmoji || false,
      enableHighlight: options.enableHighlight || false,
      enableSubscript: options.enableSubscript || false,
      enableSuperscript: options.enableSuperscript || false,
      enableFootnotes: options.enableFootnotes || false,
      sanitize: options.sanitize || false,
      linkify: options.linkify !== false,
      breaks: options.breaks || false,
      headerIds: options.headerIds !== false
    };

    // Convert markdown to HTML
    const html = convertMarkdownToHTML(markdown, conversionOptions);

    // Calculate statistics
    const stats = calculateHTMLStats(html, markdown.length);

    const result = {
      html,
      options: conversionOptions,
      stats
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a markdown and HTML expert. Analyze the markdown to HTML conversion results and provide insights about the conversion quality, potential improvements, and best practices for markdown usage.'
          },
          {
            role: 'user',
            content: `Analyze this markdown to HTML conversion:\n\nInput Length: ${stats.inputLength} characters\nOutput Length: ${stats.outputLength} characters\nCompression Ratio: ${stats.compressionRatio.toFixed(2)}%\n\nElements Found:\n- Headers: ${stats.headers}\n- Links: ${stats.links}\n- Images: ${stats.images}\n- Code Blocks: ${stats.codeBlocks}\n- Lists: ${stats.lists}\n- Tables: ${stats.tables}\n\nOptions Used: ${JSON.stringify(conversionOptions, null, 2)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<MarkdownToHTMLResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Markdown to HTML conversion error:', error);
    return NextResponse.json<MarkdownToHTMLResult>({
      success: false,
      error: 'Internal server error during markdown to HTML conversion'
    }, { status: 500 });
  }
}

function convertMarkdownToHTML(markdown: string, options: MarkdownToHTMLOptions): string {
  let html = markdown;

  // Sanitize input if requested
  if (options.sanitize) {
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }

  // Convert headers
  html = html.replace(/^#{1,6}\s+(.+)$/gm, (match, content) => {
    const level = match.match(/^#+/)?.[0].length || 1;
    const id = options.headerIds ? ` id="${content.toLowerCase().replace(/\s+/g, '-')}"` : '';
    return `<h${level}${id}>${content}</h${level}>`;
  });

  // Convert bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Convert strikethrough if enabled
  if (options.enableStrikethrough) {
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  }

  // Convert code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
    const lang = language ? ` class="language-${language}"` : '';
    return `<pre><code${lang}>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Convert unordered lists
  html = html.replace(/^[\*\-\+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Convert ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

  // Convert blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert horizontal rules
  html = html.replace(/^[-*_]{3,}$/gm, '<hr>');

  // Convert line breaks if enabled
  if (options.breaks) {
    html = html.replace(/\n/g, '<br>');
  }

  // Convert tables if enabled
  if (options.enableTables) {
    html = convertTables(html);
  }

  // Convert task lists if enabled
  if (options.enableTaskLists) {
    html = html.replace(/- \[ \]\s+(.+)$/gm, '<li><input type="checkbox" disabled> $1</li>');
    html = html.replace(/- \[x\]\s+(.+)$/gm, '<li><input type="checkbox" checked disabled> $1</li>');
  }

  // Convert emoji if enabled
  if (options.enableEmoji) {
    html = convertEmoji(html);
  }

  // Convert highlight if enabled
  if (options.enableHighlight) {
    html = html.replace(/==(.+?)==/g, '<mark>$1</mark>');
  }

  // Convert subscript if enabled
  if (options.enableSubscript) {
    html = html.replace(/~(.+?)~/g, '<sub>$1</sub>');
  }

  // Convert superscript if enabled
  if (options.enableSuperscript) {
    html = html.replace(/\^(.+?)\^/g, '<sup>$1</sup>');
  }

  // Auto-link URLs if enabled
  if (options.linkify) {
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
  }

  return html;
}

function convertTables(html: string): string {
  // Simple table conversion (basic implementation)
  let inTable = false;
  let tableRows: string[] = [];
  let result = '';

  const lines = html.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('|') && !line.includes('<')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      
      // Remove leading/trailing pipes and split
      const cells = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '').split(/\s*\|\s*/);
      tableRows.push(cells);
    } else {
      if (inTable) {
        result += buildTableHTML(tableRows);
        inTable = false;
        tableRows = [];
      }
      result += line + '\n';
    }
  }
  
  if (inTable) {
    result += buildTableHTML(tableRows);
  }
  
  return result;
}

function buildTableHTML(rows: string[][]): string {
  if (rows.length < 2) return '';
  
  let html = '<table>\n';
  
  // Header row
  html += '<thead><tr>';
  rows[0].forEach(cell => {
    html += `<th>${cell}</th>`;
  });
  html += '</tr></thead>\n';
  
  // Body rows
  html += '<tbody>\n';
  for (let i = 1; i < rows.length; i++) {
    html += '<tr>';
    rows[i].forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>\n';
  }
  html += '</tbody>\n';
  
  html += '</table>\n';
  return html;
}

function convertEmoji(html: string): string {
  // Simple emoji conversion (basic implementation)
  const emojiMap: Record<string, string> = {
    ':smile:': '😄',
    ':laugh:': '😂',
    ':heart:': '❤️',
    ':thumbsup:': '👍',
    ':fire:': '🔥',
    ':star:': '⭐',
    ':check:': '✅',
    ':cross:': '❌'
  };
  
  for (const [shortcode, emoji] of Object.entries(emojiMap)) {
    html = html.replace(new RegExp(shortcode, 'g'), emoji);
  }
  
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function calculateHTMLStats(html: string, inputLength: number) {
  const stats = {
    inputLength,
    outputLength: html.length,
    compressionRatio: ((html.length - inputLength) / inputLength) * 100,
    headers: (html.match(/<h[1-6][^>]*>/g) || []).length,
    links: (html.match(/<a[^>]*>/g) || []).length,
    images: (html.match(/<img[^>]*>/g) || []).length,
    codeBlocks: (html.match(/<pre><code[^>]*>/g) || []).length,
    lists: (html.match(/<[ou]l[^>]*>/g) || []).length,
    tables: (html.match(/<table[^>]*>/g) || []).length
  };

  return stats;
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with markdown content'
  }, { status: 405 });
}