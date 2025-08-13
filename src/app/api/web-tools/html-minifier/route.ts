import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface HTMLMinifyOptions {
  removeComments?: boolean;
  removeWhitespace?: boolean;
  collapseWhitespace?: boolean;
  removeEmptyAttributes?: boolean;
  removeOptionalTags?: boolean;
  removeAttributeQuotes?: boolean;
  removeRedundantAttributes?: boolean;
  minifyCSS?: boolean;
  minifyJS?: boolean;
  preserveLineBreaks?: boolean;
  conservativeCollapse?: boolean;
}

interface HTMLMinifyResult {
  success: boolean;
  data?: {
    originalHTML: string;
    minifiedHTML: string;
    stats: {
      originalSize: number;
      minifiedSize: number;
      compressionRatio: number;
      savedBytes: number;
      savedPercentage: number;
    };
    options: HTMLMinifyOptions;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { html, options = {} } = await request.json();

    if (!html) {
      return NextResponse.json<HTMLMinifyResult>({
        success: false,
        error: 'HTML content is required'
      }, { status: 400 });
    }

    // Set default options
    const minifyOptions: HTMLMinifyOptions = {
      removeComments: options.removeComments !== false,
      removeWhitespace: options.removeWhitespace !== false,
      collapseWhitespace: options.collapseWhitespace !== false,
      removeEmptyAttributes: options.removeEmptyAttributes !== false,
      removeOptionalTags: options.removeOptionalTags !== false,
      removeAttributeQuotes: options.removeAttributeQuotes !== false,
      removeRedundantAttributes: options.removeRedundantAttributes !== false,
      minifyCSS: options.minifyCSS !== false,
      minifyJS: options.minifyJS !== false,
      preserveLineBreaks: options.preserveLineBreaks || false,
      conservativeCollapse: options.conservativeCollapse || false
    };

    let minifiedHTML = html;

    // Apply minification options
    if (minifyOptions.removeComments) {
      // Remove HTML comments
      minifiedHTML = minifiedHTML.replace(/<!--[\s\S]*?-->/g, '');
    }

    if (minifyOptions.collapseWhitespace) {
      // Collapse multiple whitespace characters
      minifiedHTML = minifiedHTML.replace(/\s+/g, ' ');
    }

    if (minifyOptions.removeWhitespace) {
      // Remove leading/trailing whitespace from lines
      minifiedHTML = minifiedHTML.split('\n').map(line => line.trim()).join('');
    }

    if (minifyOptions.removeEmptyAttributes) {
      // Remove empty attributes
      minifiedHTML = minifiedHTML.replace(/\s+([\w-]+)\s*=\s*(["'])\2/g, '');
    }

    if (minifyOptions.removeAttributeQuotes) {
      // Remove attribute quotes where possible
      minifiedHTML = minifiedHTML.replace(/([\w-]+)\s*=\s*"([^"]*)"/g, (match, attr, value) => {
        if (/^[a-zA-Z0-9_-]+$/.test(value)) {
          return `${attr}=${value}`;
        }
        return match;
      });
    }

    if (minifyOptions.removeOptionalTags) {
      // Remove optional closing tags
      const optionalTags = ['</li>', '</td>', '</tr>', '</th>', '</option>', '</thead>', '</tbody>', '</tfoot>'];
      optionalTags.forEach(tag => {
        minifiedHTML = minifiedHTML.replace(new RegExp(tag, 'g'), '');
      });
    }

    if (minifyOptions.minifyCSS) {
      // Simple CSS minification within style tags
      minifiedHTML = minifiedHTML.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
        const minifiedCSS = css
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
          .replace(/\s*\{\s*/g, '{') // Remove spaces around braces
          .replace(/\s*\}\s*/g, '}') // Remove spaces around braces
          .replace(/;\s*/g, ';') // Remove spaces after semicolons
          .replace(/,\s*/g, ',') // Remove spaces after commas
          .trim();
        return match.replace(css, minifiedCSS);
      });
    }

    if (minifyOptions.minifyJS) {
      // Simple JavaScript minification within script tags
      minifiedHTML = minifiedHTML.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
        const minifiedJS = js
          .replace(/\/\/.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
          .replace(/\s*\{\s*/g, '{') // Remove spaces around braces
          .replace(/\s*\}\s*/g, '}') // Remove spaces around braces
          .trim();
        return match.replace(js, minifiedJS);
      });
    }

    if (!minifyOptions.preserveLineBreaks) {
      // Remove line breaks
      minifiedHTML = minifiedHTML.replace(/\n/g, '');
    }

    // Calculate statistics
    const originalSize = html.length;
    const minifiedSize = minifiedHTML.length;
    const savedBytes = originalSize - minifiedSize;
    const savedPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
    const compressionRatio = originalSize > 0 ? minifiedSize / originalSize : 1;

    const stats = {
      originalSize,
      minifiedSize,
      compressionRatio,
      savedBytes,
      savedPercentage
    };

    const result = {
      originalHTML: html,
      minifiedHTML,
      stats,
      options: minifyOptions
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an HTML optimization expert. Analyze the HTML minification results and provide insights about the optimization effectiveness, potential issues, and recommendations for further improvements.'
          },
          {
            role: 'user',
            content: `Analyze this HTML minification result:\n\nOriginal Size: ${stats.originalSize} bytes\nMinified Size: ${stats.minifiedSize} bytes\nSaved: ${stats.savedBytes} bytes (${stats.savedPercentage.toFixed(2)}%)\nCompression Ratio: ${stats.compressionRatio.toFixed(3)}\n\nOptions Used: ${JSON.stringify(minifyOptions, null, 2)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<HTMLMinifyResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('HTML minification error:', error);
    return NextResponse.json<HTMLMinifyResult>({
      success: false,
      error: 'Internal server error during HTML minification'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with HTML content'
  }, { status: 405 });
}