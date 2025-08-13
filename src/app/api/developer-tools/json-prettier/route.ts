import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface PrettifyOptions {
  indentSize: number;
  indentType: 'spaces' | 'tabs';
  sortKeys: boolean;
  trailingComma: boolean;
  maxLineLength?: number;
}

interface PrettifyResult {
  success: boolean;
  originalSize: number;
  formattedSize: number;
  compressionRatio: number;
  formattedJson: string;
  validationErrors: string[];
  options: PrettifyOptions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { json, options = {} } = body;

    if (!json || typeof json !== 'string') {
      return NextResponse.json(
        { error: 'JSON string is required' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: PrettifyOptions = {
      indentSize: 2,
      indentType: 'spaces',
      sortKeys: false,
      trailingComma: false,
      maxLineLength: 80,
    };

    const finalOptions: PrettifyOptions = { ...defaultOptions, ...options };

    // Validate options
    if (finalOptions.indentSize < 1 || finalOptions.indentSize > 8) {
      return NextResponse.json(
        { error: 'Indent size must be between 1 and 8' },
        { status: 400 }
      );
    }

    const originalSize = json.length;
    const validationErrors: string[] = [];

    try {
      // Parse and validate JSON
      const parsedJson = JSON.parse(json);
      
      // Format the JSON
      const formattedJson = formatJson(parsedJson, finalOptions);
      
      const result: PrettifyResult = {
        success: true,
        originalSize,
        formattedSize: formattedJson.length,
        compressionRatio: ((formattedJson.length - originalSize) / originalSize * 100).toFixed(2),
        formattedJson,
        validationErrors,
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
              content: 'You are a JSON formatting expert. Provide insights about JSON structure and best practices.'
            },
            {
              role: 'user',
              content: `Analyze this JSON formatting operation: 
              - Original size: ${originalSize} characters
              - Formatted size: ${formattedJson.length} characters
              - Options: ${JSON.stringify(finalOptions, null, 2)}
              
              Provide insights about:
              1. The formatting choices made
              2. Best practices for JSON structure
              3. Tips for maintaining readable JSON
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

    } catch (parseError) {
      // Handle JSON parsing errors
      const error = parseError as Error;
      const errorMessage = error.message;
      
      // Extract line and column information if available
      const lineMatch = errorMessage.match(/position (\d+)/);
      const position = lineMatch ? parseInt(lineMatch[1]) : -1;
      
      // Get context around the error
      const context = getErrorContext(json, position);
      
      validationErrors.push(`Invalid JSON: ${errorMessage}`);
      if (context) {
        validationErrors.push(`Error context: ${context}`);
      }

      const result: PrettifyResult = {
        success: false,
        originalSize,
        formattedSize: 0,
        compressionRatio: 0,
        formattedJson: '',
        validationErrors,
        options: finalOptions,
      };

      return NextResponse.json({
        result,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('JSON prettify error:', error);
    return NextResponse.json(
      { error: 'Internal server error during JSON formatting' },
      { status: 500 }
    );
  }
}

function formatJson(obj: any, options: PrettifyOptions): string {
  const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
  
  if (options.sortKeys && typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    // Sort keys for objects
    const sortedObj: any = {};
    Object.keys(obj).sort().forEach(key => {
      sortedObj[key] = obj[key];
    });
    obj = sortedObj;
  }

  let jsonString = JSON.stringify(obj, null, indent);
  
  // Handle trailing commas
  if (options.trailingComma) {
    jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
  }
  
  // Handle max line length if specified
  if (options.maxLineLength && options.maxLineLength > 0) {
    jsonString = breakLongLines(jsonString, options.maxLineLength);
  }
  
  return jsonString;
}

function breakLongLines(jsonString: string, maxLineLength: number): string {
  const lines = jsonString.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    if (line.length <= maxLineLength) {
      result.push(line);
      continue;
    }
    
    // Try to break long lines at appropriate points
    if (line.includes('": ')) {
      const [key, ...valueParts] = line.split('": ');
      const value = valueParts.join('": ');
      
      if (value.length > maxLineLength - key.length - 3) {
        // Break the value part
        result.push(key + '":');
        result.push('  ' + value);
      } else {
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

function getErrorContext(json: string, position: number): string {
  if (position === -1) return '';
  
  const lines = json.split('\n');
  let currentPos = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (currentPos + line.length >= position) {
      const charInLine = position - currentPos;
      return `Line ${i + 1}, character ${charInLine + 1}: "${line.substring(Math.max(0, charInLine - 20), charInLine + 20)}"`;
    }
    currentPos += line.length + 1; // +1 for newline
  }
  
  return '';
}