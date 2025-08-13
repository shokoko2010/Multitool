import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface SQLFormatterOptions {
  indentSize?: number;
  useTabs?: boolean;
  uppercaseKeywords?: boolean;
  commaFirst?: boolean;
  alignColumns?: boolean;
  maxLineLength?: number;
  preserveComments?: boolean;
  preserveCase?: boolean;
  formatType?: 'standard' | 'dense' | 'expanded';
  dialect?: 'mysql' | 'postgresql' | 'sqlserver' | 'oracle' | 'sqlite';
}

interface SQLFormatterResult {
  success: boolean;
  data?: {
    originalSQL: string;
    formattedSQL: string;
    options: SQLFormatterOptions;
    stats: {
      originalLines: number;
      formattedLines: number;
      originalSize: number;
      formattedSize: number;
      compressionRatio: number;
      keywordsCount: number;
      tablesCount: number;
      columnsCount: number;
      joinsCount: number;
      subqueriesCount: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { sql, options = {} } = await request.json();

    if (!sql) {
      return NextResponse.json<SQLFormatterResult>({
        success: false,
        error: 'SQL content is required'
      }, { status: 400 });
    }

    // Set default options
    const formatterOptions: SQLFormatterOptions = {
      indentSize: Math.min(Math.max(options.indentSize || 2, 1), 8),
      useTabs: options.useTabs || false,
      uppercaseKeywords: options.uppercaseKeywords !== false,
      commaFirst: options.commaFirst || false,
      alignColumns: options.alignColumns || false,
      maxLineLength: Math.min(Math.max(options.maxLineLength || 80, 40), 200),
      preserveComments: options.preserveComments !== false,
      preserveCase: options.preserveCase || false,
      formatType: options.formatType || 'standard',
      dialect: options.dialect || 'standard'
    };

    // Format SQL
    const formattedSQL = formatSQL(sql, formatterOptions);

    // Calculate statistics
    const stats = calculateSQLStats(sql, formattedSQL);

    const result = {
      originalSQL: sql,
      formattedSQL,
      options: formatterOptions,
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
            content: 'You are a SQL formatting expert. Analyze the SQL formatting results and provide insights about the query structure, readability improvements, and best practices for SQL formatting.'
          },
          {
            role: 'user',
            content: `Analyze this SQL formatting:\n\nOriginal Lines: ${stats.originalLines}\nFormatted Lines: ${stats.formattedLines}\nOriginal Size: ${stats.originalSize} bytes\nFormatted Size: ${stats.formattedSize} bytes\nCompression Ratio: ${stats.compressionRatio.toFixed(3)}\n\nQuery Elements:\n- Keywords: ${stats.keywordsCount}\n- Tables: ${stats.tablesCount}\n- Columns: ${stats.columnsCount}\n- Joins: ${stats.joinsCount}\n- Subqueries: ${stats.subqueriesCount}\n\nFormat Options: ${JSON.stringify({
              indentSize: formatterOptions.indentSize,
              uppercaseKeywords: formatterOptions.uppercaseKeywords,
              commaFirst: formatterOptions.commaFirst,
              alignColumns: formatterOptions.alignColumns,
              formatType: formatterOptions.formatType,
              dialect: formatterOptions.dialect
            }, null, 2)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<SQLFormatterResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('SQL formatting error:', error);
    return NextResponse.json<SQLFormatterResult>({
      success: false,
      error: 'Internal server error during SQL formatting'
    }, { status: 500 });
  }
}

function formatSQL(sql: string, options: SQLFormatterOptions): string {
  let formatted = sql;
  
  // Preserve comments if requested
  const comments: string[] = [];
  if (options.preserveComments) {
    formatted = formatted.replace(/(--.*$|\/\*[\s\S]*?\*\/)/gm, (match) => {
      comments.push(match);
      return `__COMMENT_${comments.length - 1}__`;
    });
  }

  // Normalize whitespace
  formatted = formatted.replace(/\s+/g, ' ');
  formatted = formatted.replace(/\s*,\s*/g, ', ');
  formatted = formatted.replace(/\s*\(\s*/g, '(');
  formatted = formatted.replace(/\s*\)\s*/g, ')');
  formatted = formatted.replace(/\s*;\s*/g, ';');

  // Split into tokens
  const tokens = tokenizeSQL(formatted);
  
  // Format based on type
  switch (options.formatType) {
    case 'dense':
      formatted = formatDense(tokens, options);
      break;
    case 'expanded':
      formatted = formatExpanded(tokens, options);
      break;
    default:
      formatted = formatStandard(tokens, options);
  }

  // Restore comments
  if (options.preserveComments) {
    comments.forEach((comment, index) => {
      formatted = formatted.replace(`__COMMENT_${index}__`, comment);
    });
  }

  // Apply keyword case
  if (options.uppercaseKeywords) {
    formatted = uppercaseKeywords(formatted);
  }

  return formatted;
}

function tokenizeSQL(sql: string): string[] {
  const tokens: string[] = [];
  const regex = /(\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|GROUP BY|ORDER BY|HAVING|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|UNION|UNION ALL|INTERSECT|EXCEPT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|VIEW|DROP|ALTER|ADD|COLUMN|CONSTRAINT|PRIMARY KEY|FOREIGN KEY|REFERENCES|UNIQUE|CHECK|DEFAULT)\b)|([(),.;])|(\b\w+\b)|('(?:[^']|'')*')|("(?:[^"]|"")*")|(\S+)/gi;
  
  let match;
  while ((match = regex.exec(sql)) !== null) {
    tokens.push(match[0]);
  }
  
  return tokens;
}

function formatStandard(tokens: string[], options: SQLFormatterOptions): string {
  let formatted = '';
  let indent = 0;
  const indentStr = options.useTabs ? '\t' : ' '.repeat(options.indentSize!);
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const upperToken = token.toUpperCase();
    
    // Handle keywords that increase indentation
    if (['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING'].includes(upperToken)) {
      if (i > 0) formatted += '\n';
      formatted += indentStr.repeat(indent) + token + ' ';
      if (upperToken === 'SELECT' || upperToken === 'FROM') indent++;
    }
    // Handle keywords that decrease indentation
    else if (upperToken === 'AND' || upperToken === 'OR') {
      formatted += '\n' + indentStr.repeat(indent) + token + ' ';
    }
    // Handle JOIN keywords
    else if (upperToken.includes('JOIN')) {
      formatted += '\n' + indentStr.repeat(indent - 1) + token + ' ';
    }
    // Handle closing parentheses
    else if (token === ')') {
      indent--;
      formatted += token;
    }
    // Handle commas
    else if (token === ',') {
      formatted += token;
      if (options.commaFirst) {
        formatted += '\n' + indentStr.repeat(indent) + '  ';
      } else {
        formatted += ' ';
      }
    }
    // Handle semicolons
    else if (token === ';') {
      formatted += token + '\n';
    }
    // Handle opening parentheses
    else if (token === '(') {
      formatted += token;
      indent++;
    }
    // Default case
    else {
      formatted += token + ' ';
    }
  }
  
  return formatted.trim();
}

function formatDense(tokens: string[], options: SQLFormatterOptions): string {
  let formatted = '';
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const upperToken = token.toUpperCase();
    
    // Add space before keywords
    if (['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'GROUP BY', 'ORDER BY', 'HAVING', 'JOIN'].includes(upperToken)) {
      if (i > 0) formatted += ' ';
      formatted += token;
    }
    // Add space after keywords
    else if (token === '(' || token === ')') {
      formatted += token;
    }
    // Handle commas
    else if (token === ',') {
      formatted += token + ' ';
    }
    // Handle semicolons
    else if (token === ';') {
      formatted += token + ' ';
    }
    // Default case
    else {
      formatted += token + ' ';
    }
  }
  
  return formatted.trim();
}

function formatExpanded(tokens: string[], options: SQLFormatterOptions): string {
  let formatted = '';
  let indent = 0;
  const indentStr = options.useTabs ? '\t' : ' '.repeat(options.indentSize!);
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const upperToken = token.toUpperCase();
    
    // Major keywords on new lines with increased indentation
    if (['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING'].includes(upperToken)) {
      if (i > 0) formatted += '\n';
      formatted += indentStr.repeat(indent) + token + '\n';
      indent++;
      formatted += indentStr.repeat(indent);
    }
    // Logical operators on new lines
    else if (upperToken === 'AND' || upperToken === 'OR') {
      formatted += '\n' + indentStr.repeat(indent) + token + '\n' + indentStr.repeat(indent + 1);
    }
    // JOIN keywords
    else if (upperToken.includes('JOIN')) {
      formatted += '\n' + indentStr.repeat(indent - 1) + token + '\n' + indentStr.repeat(indent);
    }
    // Handle parentheses
    else if (token === '(') {
      formatted += token + '\n' + indentStr.repeat(indent + 1);
      indent++;
    }
    else if (token === ')') {
      indent--;
      formatted += '\n' + indentStr.repeat(indent) + token;
    }
    // Handle commas
    else if (token === ',') {
      formatted += token + '\n' + indentStr.repeat(indent + 1);
    }
    // Handle semicolons
    else if (token === ';') {
      formatted += token + '\n';
    }
    // Default case
    else {
      formatted += token + ' ';
    }
  }
  
  return formatted.trim();
}

function uppercaseKeywords(sql: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'GROUP BY', 'ORDER BY', 'HAVING', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'CROSS JOIN', 'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
    'SET', 'DELETE', 'CREATE', 'TABLE', 'INDEX', 'VIEW', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'CONSTRAINT',
    'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT', 'AS', 'ON', 'WITH'
  ];
  
  let result = sql;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, keyword);
  });
  
  return result;
}

function calculateSQLStats(originalSQL: string, formattedSQL: string) {
  const originalLines = originalSQL.split('\n').length;
  const formattedLines = formattedSQL.split('\n').length;
  const originalSize = originalSQL.length;
  const formattedSize = formattedSQL.length;
  const compressionRatio = originalSize > 0 ? formattedSize / originalSize : 1;

  // Count SQL elements
  const keywordsCount = (originalSQL.match(/\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|GROUP BY|ORDER BY|HAVING|JOIN|UNION|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/gi) || []).length;
  const tablesCount = (originalSQL.match(/\b(FROM|JOIN)\s+(\w+)/gi) || []).length;
  const columnsCount = (originalSQL.match(/\b(SELECT|UPDATE|SET)\s+[^,]+(,\s*[^,]+)*/gi) || []).length;
  const joinsCount = (originalSQL.match(/\b(JOIN)\b/gi) || []).length;
  const subqueriesCount = (originalSQL.match(/\(SELECT/gi) || []).length;

  return {
    originalLines,
    formattedLines,
    originalSize,
    formattedSize,
    compressionRatio,
    keywordsCount,
    tablesCount,
    columnsCount,
    joinsCount,
    subqueriesCount
  };
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with SQL content'
  }, { status: 405 });
}