import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CSVToJSONOptions {
  delimiter?: string;
  hasHeader?: boolean;
  skipEmptyLines?: boolean;
  trimFields?: boolean;
  quoteCharacter?: string;
  escapeCharacter?: string;
  encoding?: string;
  outputFormat?: 'array' | 'object' | 'nested';
  includeHeaders?: boolean;
  includeRowNumbers?: boolean;
  maxRows?: number;
  dataTypes?: 'auto' | 'string' | 'number' | 'boolean';
}

interface CSVToJSONResult {
  success: boolean;
  data?: {
    json: any;
    options: CSVToJSONOptions;
    stats: {
      totalRows: number;
      processedRows: number;
      totalColumns: number;
      headers?: string[];
      dataTypes: Record<string, string>;
      encoding: string;
      delimiter: string;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { csv, options = {} } = await request.json();

    if (!csv) {
      return NextResponse.json<CSVToJSONResult>({
        success: false,
        error: 'CSV content is required'
      }, { status: 400 });
    }

    // Set default options
    const conversionOptions: CSVToJSONOptions = {
      delimiter: options.delimiter || ',',
      hasHeader: options.hasHeader !== false,
      skipEmptyLines: options.skipEmptyLines !== false,
      trimFields: options.trimFields !== false,
      quoteCharacter: options.quoteCharacter || '"',
      escapeCharacter: options.escapeCharacter || '"',
      encoding: options.encoding || 'utf-8',
      outputFormat: options.outputFormat || 'object',
      includeHeaders: options.includeHeaders !== false,
      includeRowNumbers: options.includeRowNumbers || false,
      maxRows: options.maxRows || 10000,
      dataTypes: options.dataTypes || 'auto'
    };

    // Validate options
    if (conversionOptions.delimiter.length !== 1) {
      return NextResponse.json<CSVToJSONResult>({
        success: false,
        error: 'Delimiter must be a single character'
      }, { status: 400 });
    }

    if (conversionOptions.maxRows < 1 || conversionOptions.maxRows > 100000) {
      return NextResponse.json<CSVToJSONResult>({
        success: false,
        error: 'Max rows must be between 1 and 100,000'
      }, { status: 400 });
    }

    // Parse CSV
    const result = parseCSV(csv, conversionOptions);

    // Calculate statistics
    const stats = calculateCSVStats(result, conversionOptions);

    const response = {
      json: result,
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
            content: 'You are a CSV to JSON conversion expert. Analyze the conversion results and provide insights about the data structure, potential improvements, and best practices for data handling.'
          },
          {
            role: 'user',
            content: `Analyze this CSV to JSON conversion:\n\nTotal Rows: ${stats.totalRows}\nProcessed Rows: ${stats.processedRows}\nTotal Columns: ${stats.totalColumns}\nHeaders: ${stats.headers ? stats.headers.join(', ') : 'None'}\nData Types: ${JSON.stringify(stats.dataTypes, null, 2)}\nEncoding: ${stats.encoding}\nDelimiter: '${stats.delimiter}'\n\nOptions: ${JSON.stringify({
              hasHeader: conversionOptions.hasHeader,
              outputFormat: conversionOptions.outputFormat,
              trimFields: conversionOptions.trimFields,
              dataTypes: conversionOptions.dataTypes
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

    return NextResponse.json<CSVToJSONResult>({
      success: true,
      data: response,
      analysis
    });

  } catch (error) {
    console.error('CSV to JSON conversion error:', error);
    return NextResponse.json<CSVToJSONResult>({
      success: false,
      error: 'Internal server error during CSV to JSON conversion'
    }, { status: 500 });
  }
}

function parseCSV(csv: string, options: CSVToJSONOptions): any {
  const lines = csv.split('\n');
  let result: any[] = [];
  let headers: string[] = [];

  // Process headers if present
  if (options.hasHeader && lines.length > 0) {
    const headerLine = lines[0];
    headers = parseCSVLine(headerLine, options);
    
    if (options.trimFields) {
      headers = headers.map(header => header.trim());
    }
  }

  // Process data rows
  const startIndex = options.hasHeader ? 1 : 0;
  const endIndex = Math.min(startIndex + options.maxRows!, lines.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i].trim();
    
    if (line === '' && options.skipEmptyLines) {
      continue;
    }

    const row = parseCSVLine(line, options);
    
    if (options.trimFields) {
      for (let j = 0; j < row.length; j++) {
        row[j] = row[j].trim();
      }
    }

    // Convert data types if requested
    if (options.dataTypes !== 'string') {
      for (let j = 0; j < row.length; j++) {
        row[j] = convertDataType(row[j], options.dataTypes!);
      }
    }

    // Format output based on options
    if (options.outputFormat === 'object' && headers.length > 0) {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || null;
      });
      
      if (options.includeRowNumbers) {
        obj._rowNumber = i - startIndex + 1;
      }
      
      result.push(obj);
    } else if (options.outputFormat === 'nested') {
      const nested: any = {};
      if (headers.length > 0) {
        headers.forEach((header, index) => {
          nested[header] = row[index] || null;
        });
      } else {
        nested.data = row;
      }
      
      if (options.includeRowNumbers) {
        nested._rowNumber = i - startIndex + 1;
      }
      
      result.push(nested);
    } else {
      // Array format
      const arrayRow = [...row];
      if (options.includeRowNumbers) {
        arrayRow.unshift(i - startIndex + 1);
      }
      result.push(arrayRow);
    }
  }

  // Include headers in result if requested
  if (options.includeHeaders && options.outputFormat === 'array') {
    const finalResult: any = {
      headers: options.includeRowNumbers ? ['_rowNumber', ...headers] : headers,
      data: result
    };
    return finalResult;
  }

  return result;
}

function parseCSVLine(line: string, options: CSVToJSONOptions): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === options.quoteCharacter) {
      if (inQuotes && i + 1 < line.length && line[i + 1] === options.quoteCharacter) {
        // Escaped quote
        current += options.quoteCharacter;
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === options.delimiter && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

function convertDataType(value: string, type: string): any {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case 'number': {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }
    
    case 'boolean': {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') {
        return true;
      } else if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') {
        return false;
      }
      return value;
    }
    
    case 'auto': {
      // Try to detect data type automatically
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      if (value.toLowerCase() === 'null') return null;
      
      const num = parseFloat(value);
      if (!isNaN(num) && isFinite(num)) {
        return num;
      }
      
      return value;
    }
    
    default:
      return value;
  }
}

function calculateCSVStats(result: any, options: CSVToJSONOptions) {
  let totalRows = 0;
  let processedRows = 0;
  let totalColumns = 0;
  let headers: string[] = [];
  const dataTypes: Record<string, string> = {};

  if (Array.isArray(result)) {
    totalRows = result.length;
    processedRows = Math.min(totalRows, options.maxRows!);

    if (result.length > 0) {
      const firstRow = result[0];
      
      if (options.outputFormat === 'object' && typeof firstRow === 'object') {
        headers = Object.keys(firstRow).filter(key => key !== '_rowNumber');
        totalColumns = headers.length;
        
        // Analyze data types
        headers.forEach(header => {
          const sample = firstRow[header];
          dataTypes[header] = getDataType(sample);
        });
      } else if (Array.isArray(firstRow)) {
        totalColumns = firstRow.length;
        
        // Analyze data types for array format
        if (totalColumns > 0) {
          for (let i = 0; i < Math.min(5, totalColumns); i++) {
            dataTypes[`column_${i}`] = getDataType(firstRow[i]);
          }
        }
      }
    }
  } else if (result && typeof result === 'object') {
    // Handle nested format with headers
    if (result.data && Array.isArray(result.data)) {
      totalRows = result.data.length;
      processedRows = Math.min(totalRows, options.maxRows!);
      
      if (result.headers && Array.isArray(result.headers)) {
        headers = result.headers.filter(header => header !== '_rowNumber');
        totalColumns = headers.length;
      }
    }
  }

  return {
    totalRows,
    processedRows,
    totalColumns,
    headers: headers.length > 0 ? headers : undefined,
    dataTypes,
    encoding: options.encoding,
    delimiter: options.delimiter
  };
}

function getDataType(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') return 'boolean';
    if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) return 'number';
  }
  return 'string';
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with CSV content'
  }, { status: 405 });
}