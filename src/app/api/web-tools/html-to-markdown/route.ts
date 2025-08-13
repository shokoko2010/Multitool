import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface HTMLToMarkdownOptions {
  flavor?: 'commonmark' | 'github' | 'markdown-extra';
  preserveWhitespace?: boolean;
  preserveLinks?: boolean;
  preserveImages?: boolean;
  preserveCode?: boolean;
  preserveTables?: boolean;
  preserveEmphasis?: boolean;
  gfm?: boolean; // GitHub Flavored Markdown
  useReferenceLinks?: boolean;
  headingStyle?: 'atx' | 'setext';
  codeBlockStyle?: 'indented' | 'fenced';
}

interface HTMLToMarkdownResult {
  success: boolean;
  data?: {
    markdown: string;
    options: HTMLToMarkdownOptions;
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
    const { html, options = {} } = await request.json();

    if (!html) {
      return NextResponse.json<HTMLToMarkdownResult>({
        success: false,
        error: 'HTML content is required'
      }, { status: 400 });
    }

    // Set default options
    const conversionOptions: HTMLToMarkdownOptions = {
      flavor: options.flavor || 'github',
      preserveWhitespace: options.preserveWhitespace || false,
      preserveLinks: options.preserveLinks !== false,
      preserveImages: options.preserveImages !== false,
      preserveCode: options.preserveCode !== false,
      preserveTables: options.preserveTables !== false,
      preserveEmphasis: options.preserveEmphasis !== false,
      gfm: options.gfm !== false,
      useReferenceLinks: options.useReferenceLinks || false,
      headingStyle: options.headingStyle || 'atx',
      codeBlockStyle: options.codeBlockStyle || 'fenced'
    };

    // Convert HTML to markdown
    const markdown = convertHTMLToMarkdown(html, conversionOptions);

    // Calculate statistics
    const stats = calculateMarkdownStats(markdown, html.length);

    const result = {
      markdown,
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
            content: 'You are an HTML and markdown expert. Analyze the HTML to markdown conversion results and provide insights about the conversion quality, potential improvements, and best practices for markdown usage.'
          },
          {
            role: 'user',
            content: `Analyze this HTML to markdown conversion:\n\nInput Length: ${stats.inputLength} characters\nOutput Length: ${stats.outputLength} characters\nCompression Ratio: ${stats.compressionRatio.toFixed(2)}%\n\nElements Found:\n- Headers: ${stats.headers}\n- Links: ${stats.links}\n- Images: ${stats.images}\n- Code Blocks: ${stats.codeBlocks}\n- Lists: ${stats.lists}\n- Tables: ${stats.tables}\n\nOptions Used: ${JSON.stringify(conversionOptions, null, 2)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<HTMLToMarkdownResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('HTML to markdown conversion error:', error);
    return NextResponse.json<HTMLToMarkdownResult>({
      success: false,
      error: 'Internal server error during HTML to markdown conversion'
    }, { status: 500 });
  }
}

function convertHTMLToMarkdown(html: string, options: HTMLToMarkdownOptions): string {
  let markdown = html;

  // Clean up HTML
  markdown = markdown.replace(/\r\n/g, '\n');
  markdown = markdown.replace(/\r/g, '\n');

  // Convert headers
  if (options.headingStyle === 'atx') {
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1');
  } else {
    // Setext style (only for h1 and h2)
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (match, content) => {
      return content + '\n' + '='.repeat(content.length);
    });
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, content) => {
      return content + '\n' + '-'.repeat(content.length);
    });
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1');
  }

  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');

  // Convert bold and italic
  if (options.preserveEmphasis) {
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  }

  // Convert strikethrough
  markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');

  // Convert code
  if (options.preserveCode) {
    // Inline code
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    
    // Code blocks
    if (options.codeBlockStyle === 'fenced') {
      markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
        const language = match.match(/class="language-(\w+)"/)?.[1] || '';
        return '```' + language + '\n' + code.trim() + '\n```';
      });
    } else {
      // Indented code blocks
      markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
        return '\n' + code.trim().split('\n').map(line => '    ' + line).join('\n') + '\n';
      });
    }
  }

  // Convert links
  if (options.preserveLinks) {
    if (options.useReferenceLinks) {
      // Reference style links
      let linkIndex = 1;
      const references: string[] = [];
      
      markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (match, href, text) => {
        const ref = `[${linkIndex}]`;
        references.push(`[${ref}]: ${href}`);
        linkIndex++;
        return `[${text}]${ref}`;
      });
      
      if (references.length > 0) {
        markdown += '\n\n' + references.join('\n');
      }
    } else {
      // Inline links
      markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    }
  }

  // Convert images
  if (options.preserveImages) {
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)');
  }

  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1').replace(/^\s*- /gm, '- ');
  });
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${index++}. $1`);
  });

  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    return content.split('\n').map(line => '> ' + line).join('\n');
  });

  // Convert horizontal rules
  markdown = markdown.replace(/<hr[^>]*>/gi, '---');

  // Convert line breaks
  markdown = markdown.replace(/<br[^>]*>/gi, '  \n');

  // Convert tables if enabled
  if (options.preserveTables && options.gfm) {
    markdown = convertHTMLTables(markdown);
  }

  // Clean up HTML entities
  markdown = markdown.replace(/&nbsp;/gi, ' ');
  markdown = markdown.replace(/&lt;/gi, '<');
  markdown = markdown.replace(/&gt;/gi, '>');
  markdown = markdown.replace(/&amp;/gi, '&');
  markdown = markdown.replace(/&quot;/gi, '"');
  markdown = markdown.replace(/&#39;/gi, "'");

  // Clean up extra whitespace
  if (!options.preserveWhitespace) {
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.replace(/^\s+|\s+$/g, '');
  }

  return markdown;
}

function convertHTMLTables(html: string): string {
  // Convert HTML tables to markdown tables
  let result = html;
  
  // Simple table conversion
  result = result.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
    const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    
    if (rows.length === 0) return match;
    
    let markdownTable = '';
    
    rows.forEach((row, rowIndex) => {
      const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
      const cellContents = cells.map(cell => {
        // Remove inner HTML tags
        return cell.replace(/<[^>]*>/g, '').trim();
      });
      
      markdownTable += '| ' + cellContents.join(' | ') + ' |\n';
      
      // Add header separator after first row
      if (rowIndex === 0) {
        markdownTable += '| ' + cellContents.map(() => '---').join(' | ') + ' |\n';
      }
    });
    
    return markdownTable;
  });
  
  return result;
}

function calculateMarkdownStats(markdown: string, inputLength: number) {
  const stats = {
    inputLength,
    outputLength: markdown.length,
    compressionRatio: ((markdown.length - inputLength) / inputLength) * 100,
    headers: (markdown.match(/^#{1,6}\s+/gm) || []).length,
    links: (markdown.match(/\[.*?\]\(.*?\)/g) || []).length,
    images: (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length,
    codeBlocks: (markdown.match(/```[\s\S]*?```/g) || []).length,
    lists: (markdown.match(/^[\*\-\+]\s+/gm) || []).length + (markdown.match(/^\d+\.\s+/gm) || []).length,
    tables: (markdown.match(/\|.*\|/g) || []).length / 3 // Rough estimate
  };

  return stats;
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with HTML content'
  }, { status: 405 });
}