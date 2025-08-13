import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface XMLValidationError {
  line?: number;
  column?: number;
  message: string;
  type: 'syntax' | 'structure' | 'validation' | 'well-formedness';
  severity: 'error' | 'warning' | 'info';
}

interface XMLValidationOptions {
  checkWellFormedness?: boolean;
  validateAgainstSchema?: boolean;
  schema?: string; // XSD or DTD
  checkNamespaces?: boolean;
  checkEncoding?: boolean;
  maxDepth?: number;
  maxSize?: number;
  allowComments?: boolean;
  allowProcessingInstructions?: boolean;
  allowCDATA?: boolean;
}

interface XMLValidationResult {
  success: boolean;
  data?: {
    isValid: boolean;
    parsed?: any;
    errors: XMLValidationError[];
    warnings: XMLValidationError[];
    info: XMLValidationError[];
    stats: {
      size: number;
      depth: number;
      elements: number;
      attributes: number;
      textNodes: number;
      comments: number;
      processingInstructions: number;
      cdataSections: number;
      namespaces: number;
    };
    options: XMLValidationOptions;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { xml, options = {} } = await request.json();

    if (!xml) {
      return NextResponse.json<XMLValidationResult>({
        success: false,
        error: 'XML content is required'
      }, { status: 400 });
    }

    // Set default options
    const validationOptions: XMLValidationOptions = {
      checkWellFormedness: options.checkWellFormedness !== false,
      validateAgainstSchema: options.validateAgainstSchema || false,
      schema: options.schema || undefined,
      checkNamespaces: options.checkNamespaces !== false,
      checkEncoding: options.checkEncoding || false,
      maxDepth: options.maxDepth || 100,
      maxSize: options.maxSize || 1024 * 1024, // 1MB
      allowComments: options.allowComments !== false,
      allowProcessingInstructions: options.allowProcessingInstructions !== false,
      allowCDATA: options.allowCDATA !== false
    };

    const result: XMLValidationResult['data'] = {
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      stats: {
        size: xml.length,
        depth: 0,
        elements: 0,
        attributes: 0,
        textNodes: 0,
        comments: 0,
        processingInstructions: 0,
        cdataSections: 0,
        namespaces: 0
      },
      options: validationOptions
    };

    // Check size
    if (xml.length > validationOptions.maxSize!) {
      result.errors.push({
        message: `XML size (${xml.length} bytes) exceeds maximum allowed size (${validationOptions.maxSize} bytes)`,
        type: 'validation',
        severity: 'error'
      });
      return NextResponse.json<XMLValidationResult>({
        success: true,
        data: result
      });
    }

    // Basic XML validation
    const validation = validateXML(xml, validationOptions);
    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);
    result.info.push(...validation.info);
    result.stats = validation.stats;
    result.isValid = result.errors.length === 0;

    // Parse XML if valid
    if (result.isValid) {
      try {
        result.parsed = parseXML(xml);
      } catch (error) {
        result.isValid = false;
        result.errors.push({
          message: 'Failed to parse XML despite validation',
          type: 'syntax',
          severity: 'error'
        });
      }
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
              content: 'You are an XML validation expert. Analyze the XML validation results and provide insights about the XML structure, potential improvements, and best practices for XML usage.'
            },
            {
              role: 'user',
              content: `Analyze this XML validation:\n\nValid: ${result.isValid}\nSize: ${result.stats.size} bytes\nDepth: ${result.stats.depth}\nElements: ${result.stats.elements}\nAttributes: ${result.stats.attributes}\nText Nodes: ${result.stats.textNodes}\nComments: ${result.stats.comments}\nNamespaces: ${result.stats.namespaces}\n\nIssues:\n- Errors: ${result.errors.length}\n- Warnings: ${result.warnings.length}\n- Info: ${result.info.length}\n\nOptions: ${JSON.stringify(validationOptions, null, 2)}`
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

    return NextResponse.json<XMLValidationResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('XML validation error:', error);
    return NextResponse.json<XMLValidationResult>({
      success: false,
      error: 'Internal server error during XML validation'
    }, { status: 500 });
  }
}

function validateXML(xml: string, options: XMLValidationOptions): {
  errors: XMLValidationError[];
  warnings: XMLValidationError[];
  info: XMLValidationError[];
  stats: XMLValidationResult['data']['stats'];
} {
  const errors: XMLValidationError[] = [];
  const warnings: XMLValidationError[] = [];
  const info: XMLValidationError[] = [];
  
  const stats: XMLValidationResult['data']['stats'] = {
    size: xml.length,
    depth: 0,
    elements: 0,
    attributes: 0,
    textNodes: 0,
    comments: 0,
    processingInstructions: 0,
    cdataSections: 0,
    namespaces: 0
  };

  // Basic well-formedness checks
  if (options.checkWellFormedness) {
    // Check for XML declaration
    if (!xml.trim().startsWith('<?xml')) {
      warnings.push({
        message: 'XML declaration is recommended but not present',
        type: 'well-formedness',
        severity: 'warning'
      });
    }

    // Check for single root element
    const rootMatches = xml.match(/<([^?!][^>]*)>/g);
    if (rootMatches && rootMatches.length > 0) {
      const rootElement = rootMatches[0].replace(/[<>]/g, '');
      const closingTags = xml.match(new RegExp(`<\/${rootElement}>`, 'g')) || [];
      
      if (closingTags.length === 0) {
        errors.push({
          message: `Root element '${rootElement}' is not properly closed`,
          type: 'well-formedness',
          severity: 'error'
        });
      }
    }

    // Check for balanced tags
    const tagStack: string[] = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    
    while ((match = tagRegex.exec(xml)) !== null) {
      const fullTag = match[0];
      const tagName = match[1];
      
      if (fullTag.startsWith('</')) {
        // Closing tag
        if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
          errors.push({
            message: `Mismatched closing tag '${tagName}'`,
            type: 'well-formedness',
            severity: 'error'
          });
        } else {
          tagStack.pop();
        }
      } else if (!fullTag.endsWith('/>')) {
        // Opening tag (not self-closing)
        tagStack.push(tagName);
      }
    }
    
    if (tagStack.length > 0) {
      errors.push({
        message: `Unclosed tags: ${tagStack.join(', ')}`,
        type: 'well-formedness',
        severity: 'error'
      });
    }

    // Check for proper attribute quoting
    const attrRegex = /(\w+)\s*=\s*([^"'][^>\s]*)/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(xml)) !== null) {
      warnings.push({
        message: `Attribute '${attrMatch[1]}' should be quoted`,
        type: 'well-formedness',
        severity: 'warning'
      });
    }

    // Check for special characters in text
    const specialCharRegex = /[^<&]*(&[^;]+;)[^<]*/g;
    while ((match = specialCharRegex.exec(xml)) !== null) {
      const entity = match[1];
      if (!/^&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);$/.test(entity)) {
        errors.push({
          message: `Invalid XML entity: ${entity}`,
          type: 'well-formedness',
          severity: 'error'
        });
      }
    }
  }

  // Check for comments
  if (!options.allowComments) {
    const commentMatches = xml.match(/<!--[\s\S]*?-->/g);
    if (commentMatches) {
      warnings.push({
        message: `${commentMatches.length} comment(s) found but comments are not allowed`,
        type: 'validation',
        severity: 'warning'
      });
    }
  }

  // Check for processing instructions
  if (!options.allowProcessingInstructions) {
    const piMatches = xml.match(/<\?[^>]*\?>/g);
    if (piMatches) {
      warnings.push({
        message: `${piMatches.length} processing instruction(s) found but not allowed`,
        type: 'validation',
        severity: 'warning'
      });
    }
  }

  // Check for CDATA sections
  if (!options.allowCDATA) {
    const cdataMatches = xml.match(/<!\[CDATA\[[\s\S]*?\]\]>/g);
    if (cdataMatches) {
      warnings.push({
        message: `${cdataMatches.length} CDATA section(s) found but not allowed`,
        type: 'validation',
        severity: 'warning'
      });
    }
  }

  // Calculate statistics
  stats.elements = (xml.match(/<[^?!][^>]*>/g) || []).length;
  stats.attributes = (xml.match(/\w+\s*=\s*("[^"]*"|'[^']*')/g) || []).length;
  stats.textNodes = (xml.match(/[^<][^<]*/g) || []).filter(text => text.trim().length > 0).length;
  stats.comments = (xml.match(/<!--[\s\S]*?-->/g) || []).length;
  stats.processingInstructions = (xml.match(/<\?[^>]*\?>/g) || []).length;
  stats.cdataSections = (xml.match(/<!\[CDATA\[[\s\S]*?\]\]>/g) || []).length;
  stats.namespaces = (xml.match(/xmlns:[^=]+=/g) || []).length;

  // Calculate depth (simplified)
  let currentDepth = 0;
  let maxDepth = 0;
  const depthRegex = /<([^\/][^>]*)>/g;
  
  while ((match = depthRegex.exec(xml)) !== null) {
    const tag = match[1];
    if (!tag.endsWith('/')) {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
    if (tag.startsWith('/')) {
      currentDepth--;
    }
  }
  
  stats.depth = maxDepth;

  // Check depth limit
  if (stats.depth > options.maxDepth!) {
    errors.push({
      message: `XML depth (${stats.depth}) exceeds maximum allowed depth (${options.maxDepth})`,
      type: 'validation',
      severity: 'error'
    });
  }

  return { errors, warnings, info, stats };
}

function parseXML(xml: string): any {
  // Simplified XML parsing (in real implementation, use a proper XML parser)
  const result: any = {};
  
  // Extract XML declaration
  const declMatch = xml.match(/<\?xml[^>]*\?>/);
  if (declMatch) {
    result.declaration = declMatch[0];
  }
  
  // Extract root element
  const rootMatch = xml.match(/<([^?!][^>]*)>([\s\S]*)<\/\1>/);
  if (rootMatch) {
    const [_, rootTag, content] = rootMatch;
    result.root = {
      name: rootTag,
      attributes: extractAttributes(rootTag),
      children: parseContent(content)
    };
  }
  
  return result;
}

function extractAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrRegex = /(\w+)\s*=\s*("[^"]*"|'[^']*')/g;
  let match;
  
  while ((match = attrRegex.exec(tag)) !== null) {
    const [_, name, value] = match;
    attributes[name] = value.replace(/^["']|["']$/g, '');
  }
  
  return attributes;
}

function parseContent(content: string): any[] {
  const children: any[] = [];
  const elementRegex = /<([^\/][^>]*>([\s\S]*?)<\/\1>|<([^\/][^>]*)\/>/g;
  let match;
  
  while ((match = elementRegex.exec(content)) !== null) {
    if (match[1]) {
      // Regular element with content
      const [_, fullTag, elementContent, tagName] = match;
      children.push({
        type: 'element',
        name: tagName,
        attributes: extractAttributes(fullTag),
        content: elementContent,
        children: parseContent(elementContent)
      });
    } else {
      // Self-closing element
      const [_, fullTag, tagName] = match;
      children.push({
        type: 'element',
        name: tagName,
        attributes: extractAttributes(fullTag),
        selfClosing: true
      });
    }
  }
  
  return children;
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with XML content'
  }, { status: 405 });
}