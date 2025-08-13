import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface TableOptions {
  tableClass: string;
  headerClass: string;
  rowClass: string;
  cellClass: string;
  includeCaption: boolean;
  captionText: string;
  includeThead: boolean;
  includeTfoot: boolean;
  responsive: boolean;
  striped: boolean;
  bordered: boolean;
  hover: boolean;
  condensed: boolean;
  customStyles: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
  footers?: string[];
}

interface TableResult {
  success: boolean;
  htmlTable: string;
  cssStyles: string;
  tableStats: {
    rows: number;
    columns: number;
    totalCells: number;
    hasHeaders: boolean;
    hasFooters: boolean;
  };
  options: TableOptions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, options = {} } = body;

    if (!data || !data.headers || !data.rows) {
      return NextResponse.json(
        { error: 'Table data with headers and rows is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.headers) || !Array.isArray(data.rows)) {
      return NextResponse.json(
        { error: 'Headers and rows must be arrays' },
        { status: 400 }
      );
    }

    if (data.rows.length > 1000) {
      return NextResponse.json(
        { error: 'Table cannot have more than 1000 rows' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: TableOptions = {
      tableClass: 'table',
      headerClass: 'table-header',
      rowClass: 'table-row',
      cellClass: 'table-cell',
      includeCaption: false,
      captionText: '',
      includeThead: true,
      includeTfoot: false,
      responsive: true,
      striped: true,
      bordered: true,
      hover: true,
      condensed: false,
      customStyles: '',
    };

    const finalOptions: TableOptions = { ...defaultOptions, ...options };

    // Validate data consistency
    const columnCount = data.headers.length;
    for (let i = 0; i < data.rows.length; i++) {
      if (data.rows[i].length !== columnCount) {
        return NextResponse.json(
          { error: `Row ${i + 1} has ${data.rows[i].length} columns, but headers have ${columnCount} columns` },
          { status: 400 }
        );
      }
    }

    // Validate footers if provided
    if (data.footers) {
      if (!Array.isArray(data.footers)) {
        return NextResponse.json(
          { error: 'Footers must be an array' },
          { status: 400 }
        );
      }
      if (data.footers.length !== columnCount) {
        return NextResponse.json(
          { error: `Footers have ${data.footers.length} columns, but headers have ${columnCount} columns` },
          { status: 400 }
        );
      }
    }

    // Generate HTML table
    const htmlTable = generateHTMLTable(data, finalOptions);
    
    // Generate CSS styles
    const cssStyles = generateCSSStyles(finalOptions);

    // Calculate table statistics
    const tableStats = {
      rows: data.rows.length,
      columns: columnCount,
      totalCells: data.rows.length * columnCount,
      hasHeaders: data.headers.length > 0,
      hasFooters: data.footers ? data.footers.length > 0 : false,
    };

    const result: TableResult = {
      success: true,
      htmlTable,
      cssStyles,
      tableStats,
      options: finalOptions,
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an HTML table design expert. Provide insights about table structure and best practices.'
          },
          {
            role: 'user',
            content: `Analyze this HTML table generation:
            - Table size: ${tableStats.rows} rows × ${tableStats.columns} columns
            - Total cells: ${tableStats.totalCells}
            - Styling options: ${JSON.stringify(finalOptions, null, 2)}
            
            Provide insights about:
            1. Table accessibility best practices
            2. Performance considerations for large tables
            3. Responsive design recommendations
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
    console.error('HTML table generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during table generation' },
      { status: 500 }
    );
  }
}

function generateHTMLTable(data: TableData, options: TableOptions): string {
  let html = '';

  // Start with responsive wrapper if requested
  if (options.responsive) {
    html += '<div class="table-responsive">\n';
  }

  // Start table
  const tableClasses = [options.tableClass];
  if (options.striped) tableClasses.push('table-striped');
  if (options.bordered) tableClasses.push('table-bordered');
  if (options.hover) tableClasses.push('table-hover');
  if (options.condensed) tableClasses.push('table-condensed');

  html += `<table class="${tableClasses.join(' ')}">\n`;

  // Add caption if requested
  if (options.includeCaption && options.captionText) {
    html += `  <caption>${escapeHtml(options.captionText)}</caption>\n`;
  }

  // Add header if requested
  if (options.includeThead && data.headers.length > 0) {
    html += '  <thead>\n';
    html += '    <tr>\n';
    for (const header of data.headers) {
      html += `      <th class="${options.headerClass}">${escapeHtml(header)}</th>\n`;
    }
    html += '    </tr>\n';
    html += '  </thead>\n';
  }

  // Add body
  html += '  <tbody>\n';
  for (const row of data.rows) {
    html += `    <tr class="${options.rowClass}">\n`;
    for (const cell of row) {
      html += `      <td class="${options.cellClass}">${escapeHtml(cell)}</td>\n`;
    }
    html += '    </tr>\n';
  }
  html += '  </tbody>\n';

  // Add footer if requested and provided
  if (options.includeTfoot && data.footers && data.footers.length > 0) {
    html += '  <tfoot>\n';
    html += '    <tr>\n';
    for (const footer of data.footers) {
      html += `      <td class="${options.cellClass}">${escapeHtml(footer)}</td>\n`;
    }
    html += '    </tr>\n';
    html += '  </tfoot>\n';
  }

  // End table
  html += '</table>\n';

  // Close responsive wrapper if opened
  if (options.responsive) {
    html += '</div>\n';
  }

  return html;
}

function generateCSSStyles(options: TableOptions): string {
  let css = '';

  // Basic table styles
  css += `
.table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-family: Arial, sans-serif;
}
`;

  // Responsive wrapper
  if (options.responsive) {
    css += `
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
`;
  }

  // Header styles
  css += `
.table-header {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: left;
  padding: 12px;
  border: 1px solid #dee2e6;
}
`;

  // Cell styles
  css += `
.table-cell {
  padding: 12px;
  border: 1px solid #dee2e6;
  vertical-align: top;
}
`;

  // Row styles
  css += `
.table-row:nth-child(even) {
  background-color: #f8f9fa;
}
`;

  // Striped rows
  if (options.striped) {
    css += `
.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}
`;
  }

  // Bordered table
  if (options.bordered) {
    css += `
.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}
`;
  }

  // Hover effect
  if (options.hover) {
    css += `
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}
`;
  }

  // Condensed table
  if (options.condensed) {
    css += `
.table-condensed th,
.table-condensed td {
  padding: 5px;
}
`;
  }

  // Caption styles
  if (options.includeCaption) {
    css += `
table caption {
  caption-side: top;
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 0.5em;
  text-align: left;
}
`;
  }

  // Add custom styles
  if (options.customStyles) {
    css += `\n${options.customStyles}\n`;
  }

  return css.trim();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}