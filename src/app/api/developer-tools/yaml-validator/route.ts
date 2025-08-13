import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface YAMLValidationError {
  line?: number;
  column?: number;
  message: string;
  type: 'syntax' | 'structure' | 'validation' | 'schema';
  severity: 'error' | 'warning' | 'info';
}

interface YAMLValidationOptions {
  checkSyntax?: boolean;
  validateAgainstSchema?: boolean;
  schema?: any;
  checkIndentation?: boolean;
  checkDataTypes?: boolean;
  maxDepth?: number;
  maxSize?: number;
  allowComments?: boolean;
  allowEmptyLines?: boolean;
  allowMultipleDocuments?: boolean;
  strictYAML11?: boolean;
}

interface YAMLValidationResult {
  success: boolean;
  data?: {
    isValid: boolean;
    parsed?: any;
    errors: YAMLValidationError[];
    warnings: YAMLValidationError[];
    info: YAMLValidationError[];
    stats: {
      size: number;
      depth: number;
      keys: number;
      arrays: number;
      objects: number;
      scalars: number;
      comments: number;
      emptyLines: number;
      documents: number;
    };
    options: YAMLValidationOptions;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { yaml, options = {} } = await request.json();

    if (!yaml) {
      return NextResponse.json<YAMLValidationResult>({
        success: false,
        error: 'YAML content is required'
      }, { status: 400 });
    }

    // Set default options
    const validationOptions: YAMLValidationOptions = {
      checkSyntax: options.checkSyntax !== false,
      validateAgainstSchema: options.validateAgainstSchema || false,
      schema: options.schema || undefined,
      checkIndentation: options.checkIndentation !== false,
      checkDataTypes: options.checkDataTypes || false,
      maxDepth: options.maxDepth || 100,
      maxSize: options.maxSize || 1024 * 1024, // 1MB
      allowComments: options.allowComments !== false,
      allowEmptyLines: options.allowEmptyLines !== false,
      allowMultipleDocuments: options.allowMultipleDocuments || false,
      strictYAML11: options.strictYAML11 || false
    };

    const result: YAMLValidationResult['data'] = {
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      stats: {
        size: yaml.length,
        depth: 0,
        keys: 0,
        arrays: 0,
        objects: 0,
        scalars: 0,
        comments: 0,
        emptyLines: 0,
        documents: 0
      },
      options: validationOptions
    };

    // Check size
    if (yaml.length > validationOptions.maxSize!) {
      result.errors.push({
        message: `YAML size (${yaml.length} bytes) exceeds maximum allowed size (${validationOptions.maxSize} bytes)`,
        type: 'validation',
        severity: 'error'
      });
      return NextResponse.json<YAMLValidationResult>({
        success: true,
        data: result
      });
    }

    // Basic YAML validation
    const validation = validateYAML(yaml, validationOptions);
    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);
    result.info.push(...validation.info);
    result.stats = validation.stats;
    result.isValid = result.errors.length === 0;

    // Parse YAML if valid
    if (result.isValid) {
      try {
        result.parsed = parseYAML(yaml);
      } catch (error) {
        result.isValid = false;
        result.errors.push({
          message: 'Failed to parse YAML despite validation',
          type: 'syntax',
          severity: 'error'
        });
      }
    }

    // Validate against schema if provided
    if (result.isValid && validationOptions.validateAgainstSchema && validationOptions.schema) {
      const schemaErrors = validateAgainstYAMLSchema(result.parsed, validationOptions.schema);
      schemaErrors.forEach(error => {
        result.errors.push({
          ...error,
          type: 'schema'
        });
      });
      result.isValid = result.errors.length === 0;
    }

    // AI Analysis
    let analysis = '';
    if (result.isValid || result.errors.length > 0) {
      try {
        const zai = await ZAI.create();
        const analysisResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a YAML validation expert. Analyze the YAML validation results and provide insights about the YAML structure, potential improvements, and best practices for YAML usage.'
            },
            {
              role: 'user',
              content: `Analyze this YAML validation:\n\nValid: ${result.isValid}\nSize: ${result.stats.size} bytes\nDepth: ${result.stats.depth}\nKeys: ${result.stats.keys}\nArrays: ${result.stats.arrays}\nObjects: ${result.stats.objects}\nScalars: ${result.stats.scalars}\nComments: ${result.stats.comments}\nDocuments: ${result.stats.documents}\n\nIssues:\n- Errors: ${result.errors.length}\n- Warnings: ${result.warnings.length}\n- Info: ${result.info.length}\n\nOptions: ${JSON.stringify(validationOptions, null, 2)}`
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

    return NextResponse.json<YAMLValidationResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('YAML validation error:', error);
    return NextResponse.json<YAMLValidationResult>({
      success: false,
      error: 'Internal server error during YAML validation'
    }, { status: 500 });
  }
}

function validateYAML(yaml: string, options: YAMLValidationOptions): {
  errors: YAMLValidationError[];
  warnings: YAMLValidationError[];
  info: YAMLValidationError[];
  stats: YAMLValidationResult['data']['stats'];
} {
  const errors: YAMLValidationError[] = [];
  const warnings: YAMLValidationError[] = [];
  const info: YAMLValidationError[] = [];
  
  const stats: YAMLValidationResult['data']['stats'] = {
    size: yaml.length,
    depth: 0,
    keys: 0,
    arrays: 0,
    objects: 0,
    scalars: 0,
    comments: 0,
    emptyLines: 0,
    documents: 0
  };

  const lines = yaml.split('\n');
  
  // Check for multiple documents
  const documentSeparators = yaml.match(/^---$/gm);
  if (documentSeparators && documentSeparators.length > 0) {
    stats.documents = documentSeparators.length + 1;
    
    if (!options.allowMultipleDocuments) {
      errors.push({
        message: 'Multiple documents found but only single document is allowed',
        type: 'validation',
        severity: 'error'
      });
    }
  } else {
    stats.documents = 1;
  }

  // Basic syntax validation
  if (options.checkSyntax) {
    let currentIndent = 0;
    let indentStack: number[] = [];
    let inMultilineString = false;
    let multilineStringIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (trimmedLine === '') {
        stats.emptyLines++;
        continue;
      }
      
      if (trimmedLine.startsWith('#')) {
        stats.comments++;
        if (!options.allowComments) {
          warnings.push({
            message: `Comment found on line ${i + 1} but comments are not allowed`,
            type: 'validation',
            severity: 'warning'
          });
        }
        continue;
      }

      // Handle document separators
      if (trimmedLine === '---') {
        currentIndent = 0;
        indentStack = [];
        continue;
      }

      // Calculate indentation
      const indent = line.length - line.trimStart().length;
      
      // Check for consistent indentation
      if (options.checkIndentation && indent > 0 && indent % 2 !== 0) {
        warnings.push({
          line: i + 1,
          column: 1,
          message: 'Indentation should be a multiple of 2 spaces',
          type: 'syntax',
          severity: 'warning'
        });
      }

      // Handle multiline strings
      if (trimmedLine.startsWith('|') || trimmedLine.startsWith('>')) {
        inMultilineString = true;
        multilineStringIndent = indent;
        continue;
      }

      if (inMultilineString) {
        if (indent <= multilineStringIndent) {
          inMultilineString = false;
        } else {
          continue;
        }
      }

      // Check for invalid characters
      if (trimmedLine.includes('\t')) {
        errors.push({
          line: i + 1,
          column: line.indexOf('\t') + 1,
          message: 'Tab characters are not allowed in YAML',
          type: 'syntax',
          severity: 'error'
        });
      }

      // Check key-value pairs
      const keyValueMatch = trimmedLine.match(/^([^:]+):\s*(.*)$/);
      if (keyValueMatch) {
        const [, key, value] = keyValueMatch;
        stats.keys++;
        
        // Validate key format
        if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key)) {
          warnings.push({
            line: i + 1,
            column: 1,
            message: `Key '${key}' should use snake_case or camelCase`,
            type: 'syntax',
            severity: 'warning'
          });
        }

        // Check for array values
        if (value.startsWith('[')) {
          stats.arrays++;
        }
      }

      // Check array items
      if (trimmedLine.startsWith('- ')) {
        stats.arrays++;
        
        // Check array indentation
        if (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
          warnings.push({
            line: i + 1,
            column: 1,
            message: 'Array item should be indented more than its parent',
            type: 'syntax',
            severity: 'warning'
          });
        }
      }

      // Update indentation stack
      if (indent > currentIndent) {
        indentStack.push(currentIndent);
        currentIndent = indent;
        stats.depth = Math.max(stats.depth, indentStack.length);
      } else if (indent < currentIndent) {
        while (indentStack.length > 0 && indentStack[indentStack.length - 1] >= indent) {
          indentStack.pop();
        }
        currentIndent = indentStack.length > 0 ? indentStack[indentStack.length - 1] : 0;
      }
    }

    // Check for unclosed structures
    if (indentStack.length > 0) {
      errors.push({
        message: `Unclosed indentation levels detected`,
        type: 'syntax',
        severity: 'error'
      });
    }
  }

  // Count data types
  const arrayMatches = yaml.match(/^-\s+/gm);
  const objectMatches = yaml.match(/^\s+\w+:\s*/gm);
  const scalarMatches = yaml.match(/^\s*\w+:\s*[^{\[\-]/gm);
  
  stats.arrays = arrayMatches ? arrayMatches.length : 0;
  stats.objects = objectMatches ? objectMatches.length : 0;
  stats.scalars = scalarMatches ? scalarMatches.length : 0;

  // Check depth limit
  if (stats.depth > options.maxDepth!) {
    errors.push({
      message: `YAML depth (${stats.depth}) exceeds maximum allowed depth (${options.maxDepth})`,
      type: 'validation',
      severity: 'error'
    });
  }

  return { errors, warnings, info, stats };
}

function parseYAML(yaml: string): any {
  // Simplified YAML parsing (in real implementation, use a proper YAML parser)
  const result: any = {};
  const lines = yaml.split('\n');
  let currentPath: string[] = [];
  let currentIndent = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // Handle document separators
    if (trimmedLine === '---') {
      currentPath = [];
      continue;
    }
    
    const indent = line.length - line.trimStart().length;
    const keyValueMatch = trimmedLine.match(/^([^:]+):\s*(.*)$/);
    
    if (keyValueMatch) {
      const [, key, value] = keyValueMatch;
      
      // Adjust current path based on indentation
      while (currentPath.length > 0 && indent <= currentIndent) {
        currentPath.pop();
      }
      
      currentPath.push(key);
      currentIndent = indent;
      
      // Set value in result
      let current = result;
      for (let i = 0; i < currentPath.length - 1; i++) {
        if (!current[currentPath[i]]) {
          current[currentPath[i]] = {};
        }
        current = current[currentPath[i]];
      }
      
      // Parse value
      if (value === '') {
        current[currentPath[currentPath.length - 1]] = null;
      } else if (value === 'null') {
        current[currentPath[currentPath.length - 1]] = null;
      } else if (value === 'true') {
        current[currentPath[currentPath.length - 1]] = true;
      } else if (value === 'false') {
        current[currentPath[currentPath.length - 1]] = false;
      } else if (value.startsWith('"') && value.endsWith('"')) {
        current[currentPath[currentPath.length - 1]] = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        current[currentPath[currentPath.length - 1]] = value.slice(1, -1);
      } else if (!isNaN(Number(value))) {
        current[currentPath[currentPath.length - 1]] = Number(value);
      } else {
        current[currentPath[currentPath.length - 1]] = value;
      }
    }
  }
  
  return result;
}

function validateAgainstYAMLSchema(data: any, schema: any): YAMLValidationError[] {
  const errors: YAMLValidationError[] = [];
  
  // Simplified schema validation (in real implementation, use a proper schema validator)
  if (schema.type) {
    const expectedType = schema.type;
    const actualType = Array.isArray(data) ? 'array' : 
                       data === null ? 'null' :
                       typeof data;
    
    if (expectedType !== actualType) {
      errors.push({
        message: `Expected type '${expectedType}' but got '${actualType}'`,
        type: 'schema',
        severity: 'error'
      });
    }
  }

  if (schema.required && Array.isArray(schema.required)) {
    if (typeof data === 'object' && data !== null) {
      schema.required.forEach((requiredField: string) => {
        if (!(requiredField in data)) {
          errors.push({
            message: `Required field '${requiredField}' is missing`,
            type: 'schema',
            severity: 'error'
          });
        }
      });
    }
  }

  if (schema.properties && typeof data === 'object' && data !== null) {
    Object.keys(schema.properties).forEach(key => {
      if (key in data) {
        const subErrors = validateAgainstYAMLSchema(data[key], schema.properties[key]);
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
    error: 'POST method required with YAML content'
  }, { status: 405 });
}