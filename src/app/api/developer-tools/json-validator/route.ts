import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface JSONValidationOptions {
  strict?: boolean;
  allowComments?: boolean;
  allowTrailingComma?: boolean;
  maxDepth?: number;
  maxSize?: number;
  schema?: any; // JSON Schema for validation
  checkCircularReferences?: boolean;
}

interface ValidationError {
  line?: number;
  column?: number;
  position?: number;
  message: string;
  type: 'syntax' | 'schema' | 'circular' | 'size' | 'depth';
}

interface JSONValidationResult {
  success: boolean;
  data?: {
    isValid: boolean;
    parsed?: any;
    errors: ValidationError[];
    warnings: string[];
    stats: {
      size: number;
      depth: number;
      keys: number;
      arrays: number;
      objects: number;
      strings: number;
      numbers: number;
      booleans: number;
      nulls: number;
    };
    options: JSONValidationOptions;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { json, options = {} } = await request.json();

    if (!json) {
      return NextResponse.json<JSONValidationResult>({
        success: false,
        error: 'JSON content is required'
      }, { status: 400 });
    }

    // Set default options
    const validationOptions: JSONValidationOptions = {
      strict: options.strict !== false,
      allowComments: options.allowComments || false,
      allowTrailingComma: options.allowTrailingComma || false,
      maxDepth: options.maxDepth || 100,
      maxSize: options.maxSize || 1024 * 1024, // 1MB
      schema: options.schema || undefined,
      checkCircularReferences: options.checkCircularReferences !== false
    };

    const result: JSONValidationResult['data'] = {
      isValid: false,
      errors: [],
      warnings: [],
      stats: {
        size: 0,
        depth: 0,
        keys: 0,
        arrays: 0,
        objects: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0
      },
      options: validationOptions
    };

    // Check size
    const jsonSize = JSON.stringify(json).length;
    result.stats.size = jsonSize;
    
    if (jsonSize > validationOptions.maxSize!) {
      result.errors.push({
        message: `JSON size (${jsonSize} bytes) exceeds maximum allowed size (${validationOptions.maxSize} bytes)`,
        type: 'size'
      });
      return NextResponse.json<JSONValidationResult>({
        success: true,
        data: result
      });
    }

    // Try to parse JSON
    let parsed: any;
    try {
      parsed = typeof json === 'string' ? JSON.parse(json) : json;
      result.parsed = parsed;
    } catch (error) {
      const parseError = error as Error;
      const errorMatch = parseError.message.match(/position (\d+)/);
      const position = errorMatch ? parseInt(errorMatch[1]) : undefined;
      
      result.errors.push({
        message: parseError.message,
        position,
        type: 'syntax'
      });
      
      return NextResponse.json<JSONValidationResult>({
        success: true,
        data: result
      });
    }

    // Analyze JSON structure
    analyzeJSONStructure(parsed, result.stats, 0, validationOptions.maxDepth!);

    // Check depth
    if (result.stats.depth > validationOptions.maxDepth!) {
      result.errors.push({
        message: `JSON depth (${result.stats.depth}) exceeds maximum allowed depth (${validationOptions.maxDepth})`,
        type: 'depth'
      });
    }

    // Check for circular references
    if (validationOptions.checkCircularReferences) {
      const circularRefs = findCircularReferences(parsed);
      if (circularRefs.length > 0) {
        result.errors.push({
          message: `Circular references detected: ${circularRefs.join(', ')}`,
          type: 'circular'
        });
      }
    }

    // Validate against schema if provided
    if (validationOptions.schema) {
      const schemaErrors = validateAgainstSchema(parsed, validationOptions.schema);
      schemaErrors.forEach(error => {
        result.errors.push({
          ...error,
          type: 'schema'
        });
      });
    }

    // Check for warnings
    if (result.stats.keys > 1000) {
      result.warnings.push('Large number of keys may impact performance');
    }
    
    if (result.stats.depth > 20) {
      result.warnings.push('Deep nesting may be difficult to maintain');
    }

    result.isValid = result.errors.length === 0;

    // AI Analysis
    let analysis = '';
    if (result.isValid || result.errors.length > 0) {
      try {
        const zai = await ZAI.create();
        const analysisResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a JSON validation expert. Analyze the JSON validation results and provide insights about the structure, potential improvements, and best practices for JSON data organization.'
            },
            {
              role: 'user',
              content: `Analyze this JSON validation:\n\nValid: ${result.isValid}\nErrors: ${result.errors.length}\nWarnings: ${result.warnings.length}\n\nStructure Stats:\n- Size: ${result.stats.size} bytes\n- Depth: ${result.stats.depth}\n- Keys: ${result.stats.keys}\n- Objects: ${result.stats.objects}\n- Arrays: ${result.stats.arrays}\n- Strings: ${result.stats.strings}\n- Numbers: ${result.stats.numbers}\n- Booleans: ${result.stats.booleans}\n- Nulls: ${result.stats.nulls}\n\n${result.errors.length > 0 ? 'Errors: ' + result.errors.map(e => e.message).join('; ') : ''}\n${result.warnings.length > 0 ? 'Warnings: ' + result.warnings.join('; ') : ''}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        });

        analysis = analysisResponse.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }

    return NextResponse.json<JSONValidationResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('JSON validation error:', error);
    return NextResponse.json<JSONValidationResult>({
      success: false,
      error: 'Internal server error during JSON validation'
    }, { status: 500 });
  }
}

function analyzeJSONStructure(obj: any, stats: JSONValidationResult['data']['stats'], depth: number, maxDepth: number) {
  if (depth > stats.depth) {
    stats.depth = depth;
  }

  if (depth > maxDepth) {
    return;
  }

  if (obj === null) {
    stats.nulls++;
    return;
  }

  if (typeof obj === 'string') {
    stats.strings++;
    return;
  }

  if (typeof obj === 'number') {
    stats.numbers++;
    return;
  }

  if (typeof obj === 'boolean') {
    stats.booleans++;
    return;
  }

  if (Array.isArray(obj)) {
    stats.arrays++;
    obj.forEach(item => analyzeJSONStructure(item, stats, depth + 1, maxDepth));
    return;
  }

  if (typeof obj === 'object') {
    stats.objects++;
    Object.keys(obj).forEach(key => {
      stats.keys++;
      analyzeJSONStructure(obj[key], stats, depth + 1, maxDepth);
    });
    return;
  }
}

function findCircularReferences(obj: any, seen = new WeakMap(), path = ''): string[] {
  const circularRefs: string[] = [];

  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) {
      circularRefs.push(path || 'root');
      return circularRefs;
    }
    
    seen.set(obj, true);

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        circularRefs.push(...findCircularReferences(item, seen, `${path}[${index}]`));
      });
    } else {
      Object.keys(obj).forEach(key => {
        circularRefs.push(...findCircularReferences(obj[key], seen, path ? `${path}.${key}` : key));
      });
    }
  }

  return circularRefs;
}

function validateAgainstSchema(data: any, schema: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Simplified schema validation (in real implementation, use a proper schema validator)
  if (schema.type) {
    const expectedType = schema.type;
    const actualType = Array.isArray(data) ? 'array' : 
                       data === null ? 'null' :
                       typeof data;
    
    if (expectedType !== actualType) {
      errors.push({
        message: `Expected type '${expectedType}' but got '${actualType}'`,
        type: 'schema'
      });
    }
  }

  if (schema.required && Array.isArray(schema.required)) {
    if (typeof data === 'object' && data !== null) {
      schema.required.forEach((requiredField: string) => {
        if (!(requiredField in data)) {
          errors.push({
            message: `Missing required field: '${requiredField}'`,
            type: 'schema'
          });
        }
      });
    }
  }

  if (schema.properties && typeof data === 'object' && data !== null) {
    Object.keys(schema.properties).forEach(key => {
      if (key in data) {
        const subErrors = validateAgainstSchema(data[key], schema.properties[key]);
        subErrors.forEach(error => {
          errors.push({
            ...error,
            message: `Field '${key}': ${error.message}`
          });
        });
      }
    });
  }

  return errors;
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with JSON content'
  }, { status: 405 });
}