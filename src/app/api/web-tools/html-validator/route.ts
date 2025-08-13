import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ValidationOptions {
  validateStructure: boolean;
  validateAccessibility: boolean;
  validateSEO: boolean;
  validatePerformance: boolean;
  validateSecurity: boolean;
  checkLinks: boolean;
  checkImages: boolean;
  checkForms: boolean;
  checkTables: boolean;
  customRules: Array<{
    selector: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  strictMode: boolean;
}

interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  selector?: string;
  rule: string;
  severity: 'high' | 'medium' | 'low';
  category: 'structure' | 'accessibility' | 'seo' | 'performance' | 'security' | 'custom';
}

interface ValidationResult {
  success: boolean;
  html: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  statistics: {
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
    validationTime: number;
    linesChecked: number;
    elementsChecked: number;
  };
  options: ValidationOptions;
  summary: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  };
  details: {
    structure: { issues: number; passed: number };
    accessibility: { issues: number; passed: number };
    seo: { issues: number; passed: number };
    performance: { issues: number; passed: number };
    security: { issues: number; passed: number };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, options = {} } = body;

    if (!html || typeof html !== 'string') {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    if (html.length > 1000000) { // 1MB limit
      return NextResponse.json(
        { error: 'HTML content exceeds 1MB limit' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: ValidationOptions = {
      validateStructure: true,
      validateAccessibility: true,
      validateSEO: true,
      validatePerformance: true,
      validateSecurity: true,
      checkLinks: true,
      checkImages: true,
      checkForms: true,
      checkTables: true,
      customRules: [],
      strictMode: false,
    };

    const finalOptions: ValidationOptions = { ...defaultOptions, ...options };

    const startTime = Date.now();
    
    // Validate HTML
    const result = validateHTML(html, finalOptions);
    
    const endTime = Date.now();
    result.statistics.validationTime = endTime - startTime;

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an HTML validation expert. Provide insights about HTML quality and best practices.'
          },
          {
            role: 'user',
            content: `Analyze this HTML validation result:
            - Total errors: ${result.statistics.totalErrors}
            - Total warnings: ${result.statistics.totalWarnings}
            - Overall score: ${result.summary.score}/100
            - Grade: ${result.summary.grade}
            
            Provide insights about:
            1. Code quality assessment
            2. Critical issues to address
            3. Best practices for improvement
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
    console.error('HTML validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during HTML validation' },
      { status: 500 }
    );
  }
}

function validateHTML(html: string, options: ValidationOptions): ValidationResult {
  const startTime = Date.now();
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const info: ValidationError[] = [];

  const lines = html.split('\n');
  const statistics = {
    totalErrors: 0,
    totalWarnings: 0,
    totalInfo: 0,
    validationTime: 0,
    linesChecked: lines.length,
    elementsChecked: 0,
  };

  const details = {
    structure: { issues: 0, passed: 0 },
    accessibility: { issues: 0, passed: 0 },
    seo: { issues: 0, passed: 0 },
    performance: { issues: 0, passed: 0 },
    security: { issues: 0, passed: 0 },
  };

  // Basic structure validation
  if (options.validateStructure) {
    validateStructure(html, lines, errors, warnings, info, details);
  }

  // Accessibility validation
  if (options.validateAccessibility) {
    validateAccessibility(html, lines, errors, warnings, info, details);
  }

  // SEO validation
  if (options.validateSEO) {
    validateSEO(html, lines, errors, warnings, info, details);
  }

  // Performance validation
  if (options.validatePerformance) {
    validatePerformance(html, lines, errors, warnings, info, details);
  }

  // Security validation
  if (options.validateSecurity) {
    validateSecurity(html, lines, errors, warnings, info, details);
  }

  // Specific element checks
  if (options.checkLinks) {
    checkLinks(html, lines, errors, warnings, info, details);
  }

  if (options.checkImages) {
    checkImages(html, lines, errors, warnings, info, details);
  }

  if (options.checkForms) {
    checkForms(html, lines, errors, warnings, info, details);
  }

  if (options.checkTables) {
    checkTables(html, lines, errors, warnings, info, details);
  }

  // Custom rules
  if (options.customRules.length > 0) {
    validateCustomRules(html, lines, options.customRules, errors, warnings, info, details);
  }

  // Count elements
  statistics.elementsChecked = (html.match(/<[^>]+>/g) || []).length;

  // Update statistics
  statistics.totalErrors = errors.length;
  statistics.totalWarnings = warnings.length;
  statistics.totalInfo = info.length;
  statistics.validationTime = Date.now() - startTime;

  // Calculate score and grade
  const score = calculateScore(errors, warnings, info);
  const grade = calculateGrade(score);

  // Generate recommendations
  const recommendations = generateRecommendations(errors, warnings, info);

  return {
    success: true,
    html,
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
    statistics,
    options,
    summary: {
      score,
      grade,
      recommendations,
    },
    details,
  };
}

function validateStructure(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for DOCTYPE
  if (!html.includes('<!DOCTYPE')) {
    errors.push({
      type: 'error',
      message: 'Missing DOCTYPE declaration',
      rule: 'DOCTYPE_REQUIRED',
      severity: 'high',
      category: 'structure',
    });
    details.structure.issues++;
  } else {
    details.structure.passed++;
  }

  // Check for HTML tag
  if (!html.includes('<html')) {
    errors.push({
      type: 'error',
      message: 'Missing <html> tag',
      rule: 'HTML_TAG_REQUIRED',
      severity: 'high',
      category: 'structure',
    });
    details.structure.issues++;
  } else {
    details.structure.passed++;
  }

  // Check for head tag
  if (!html.includes('<head')) {
    errors.push({
      type: 'error',
      message: 'Missing <head> tag',
      rule: 'HEAD_TAG_REQUIRED',
      severity: 'high',
      category: 'structure',
    });
    details.structure.issues++;
  } else {
    details.structure.passed++;
  }

  // Check for body tag
  if (!html.includes('<body')) {
    errors.push({
      type: 'error',
      message: 'Missing <body> tag',
      rule: 'BODY_TAG_REQUIRED',
      severity: 'high',
      category: 'structure',
    });
    details.structure.issues++;
  } else {
    details.structure.passed++;
  }

  // Check for unclosed tags
  const tagStack: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let match;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    while ((match = tagRegex.exec(line)) !== null) {
      const tag = match[1];
      const isClosing = match[0].startsWith('</');

      if (isClosing) {
        if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tag) {
          errors.push({
            type: 'error',
            message: `Unexpected closing tag </${tag}>`,
            line: i + 1,
            column: match.index,
            rule: 'UNEXPECTED_CLOSING_TAG',
            severity: 'medium',
            category: 'structure',
          });
          details.structure.issues++;
        } else {
          tagStack.pop();
          details.structure.passed++;
        }
      } else if (!match[0].endsWith('/>') && !isSelfClosingTag(tag)) {
        tagStack.push(tag);
      }
    }
  }

  // Check for unclosed tags
  for (const tag of tagStack) {
    errors.push({
      type: 'error',
      message: `Unclosed tag <${tag}>`,
      rule: 'UNCLOSED_TAG',
      severity: 'high',
      category: 'structure',
    });
    details.structure.issues++;
  }

  // Check for deprecated tags
  const deprecatedTags = ['font', 'center', 'marquee', 'blink', 'frame', 'frameset'];
  for (const tag of deprecatedTags) {
    if (html.includes(`<${tag}`)) {
      warnings.push({
        type: 'warning',
        message: `Deprecated tag <${tag}> detected`,
        rule: 'DEPRECATED_TAG',
        severity: 'medium',
        category: 'structure',
      });
      details.structure.issues++;
    }
  }
}

function validateAccessibility(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for alt attributes on images
  const imgRegex = /<img\s+[^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (!match[0].includes('alt=')) {
      errors.push({
        type: 'error',
        message: 'Missing alt attribute on <img> tag',
        rule: 'IMG_ALT_REQUIRED',
        severity: 'high',
        category: 'accessibility',
      });
      details.accessibility.issues++;
    } else {
      details.accessibility.passed++;
    }
  }

  // Check for missing lang attribute
  if (!html.includes('lang=')) {
    warnings.push({
      type: 'warning',
      message: 'Missing lang attribute on <html> tag',
      rule: 'LANG_ATTRIBUTE_REQUIRED',
      severity: 'medium',
      category: 'accessibility',
    });
    details.accessibility.issues++;
  } else {
    details.accessibility.passed++;
  }

  // Check for form labels
  const inputRegex = /<input\s+[^>]*>/gi;
  while ((match = inputRegex.exec(html)) !== null) {
    if (!match[0].includes('id=') || !html.includes(`for="${match[0].match(/id="([^"]*)"/)?.[1]}"`)) {
      warnings.push({
        type: 'warning',
        message: 'Input element missing associated label',
        rule: 'FORM_LABEL_REQUIRED',
        severity: 'medium',
        category: 'accessibility',
      });
      details.accessibility.issues++;
    } else {
      details.accessibility.passed++;
    }
  }

  // Check for ARIA attributes
  const ariaRegex = /aria-[a-zA-Z-]+=/g;
  if (!ariaRegex.test(html)) {
    info.push({
      type: 'info',
      message: 'Consider adding ARIA attributes for better accessibility',
      rule: 'ARIA_ATTRIBUTES_RECOMMENDED',
      severity: 'low',
      category: 'accessibility',
    });
  }
}

function validateSEO(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for title tag
  if (!html.includes('<title>')) {
    errors.push({
      type: 'error',
      message: 'Missing <title> tag',
      rule: 'TITLE_TAG_REQUIRED',
      severity: 'high',
      category: 'seo',
    });
    details.seo.issues++;
  } else {
    details.seo.passed++;
  }

  // Check for meta description
  if (!html.includes('name="description"')) {
    warnings.push({
      type: 'warning',
      message: 'Missing meta description',
      rule: 'META_DESCRIPTION_REQUIRED',
      severity: 'medium',
      category: 'seo',
    });
    details.seo.issues++;
  } else {
    details.seo.passed++;
  }

  // Check for heading structure
  const headingRegex = /<h([1-6])\b[^>]*>/gi;
  let lastLevel = 0;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    if (level > lastLevel + 1) {
      warnings.push({
        type: 'warning',
        message: `Heading level jump from H${lastLevel} to H${level}`,
        rule: 'HEADING_STRUCTURE',
        severity: 'medium',
        category: 'seo',
      });
      details.seo.issues++;
    } else {
      details.seo.passed++;
    }
    lastLevel = level;
  }

  // Check for meta keywords (optional)
  if (!html.includes('name="keywords"')) {
    info.push({
      type: 'info',
      message: 'Consider adding meta keywords for better SEO',
      rule: 'META_KEYWORDS_RECOMMENDED',
      severity: 'low',
      category: 'seo',
    });
  }
}

function validatePerformance(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for inline styles
  const styleRegex = /style=/gi;
  const styleMatches = html.match(styleRegex);
  if (styleMatches && styleMatches.length > 5) {
    warnings.push({
      type: 'warning',
      message: `Found ${styleMatches.length} inline styles, consider using external CSS`,
      rule: 'INLINE_STYLES',
      severity: 'medium',
      category: 'performance',
    });
    details.performance.issues++;
  } else {
    details.performance.passed++;
  }

  // Check for inline scripts
  const scriptRegex = /<script[^>]*>[^<]*<\/script>/gi;
  const scriptMatches = html.match(scriptRegex);
  if (scriptMatches && scriptMatches.length > 3) {
    warnings.push({
      type: 'warning',
      message: `Found ${scriptMatches.length} inline scripts, consider using external JS`,
      rule: 'INLINE_SCRIPTS',
      severity: 'medium',
      category: 'performance',
    });
    details.performance.issues++;
  } else {
    details.performance.passed++;
  }

  // Check for large images
  const imgRegex = /<img\s+[^>]*>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[0].includes('width=') && match[0].includes('height=')) {
      const widthMatch = match[0].match(/width="(\d+)"/);
      const heightMatch = match[0].match(/height="(\d+)"/);
      if (widthMatch && heightMatch) {
        const width = parseInt(widthMatch[1]);
        const height = parseInt(heightMatch[1]);
        if (width > 1000 || height > 1000) {
          warnings.push({
            type: 'warning',
            message: 'Large image dimensions detected, consider optimizing',
            rule: 'LARGE_IMAGES',
            severity: 'medium',
            category: 'performance',
          });
          details.performance.issues++;
        } else {
          details.performance.passed++;
        }
      }
    }
  }
}

function validateSecurity(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for inline event handlers
  const eventRegex = /on\w+\s*=/gi;
  const eventMatches = html.match(eventRegex);
  if (eventMatches) {
    warnings.push({
      type: 'warning',
      message: `Found ${eventMatches.length} inline event handlers, consider using event listeners`,
      rule: 'INLINE_EVENT_HANDLERS',
      severity: 'high',
      category: 'security',
    });
    details.security.issues++;
  } else {
    details.security.passed++;
  }

  // Check for javascript: protocol
  if (html.includes('javascript:')) {
    errors.push({
      type: 'error',
      message: 'Found javascript: protocol, security risk',
      rule: 'JAVASCRIPT_PROTOCOL',
      severity: 'high',
      category: 'security',
    });
    details.security.issues++;
  } else {
    details.security.passed++;
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /eval\s*\(/gi,
    /document\.write/gi,
    /innerHTML/gi,
    /outerHTML/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(html)) {
      warnings.push({
        type: 'warning',
        message: `Potentially dangerous pattern detected: ${pattern.source}`,
        rule: 'DANGEROUS_PATTERN',
        severity: 'high',
        category: 'security',
      });
      details.security.issues++;
    } else {
      details.security.passed++;
    }
  }
}

function checkLinks(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for empty links
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']\s*["'][^>]*>/gi;
  const emptyLinks = html.match(linkRegex);
  if (emptyLinks) {
    warnings.push({
      type: 'warning',
      message: `Found ${emptyLinks.length} empty links`,
      rule: 'EMPTY_LINKS',
      severity: 'medium',
      category: 'structure',
    });
  }

  // Check for missing target="_blank" on external links
  const externalLinkRegex = /<a\s+[^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*>/gi;
  while ((match = externalLinkRegex.exec(html)) !== null) {
    if (!match[0].includes('target="_blank"')) {
      info.push({
        type: 'info',
        message: 'External link missing target="_blank"',
        rule: 'EXTERNAL_LINK_TARGET',
        severity: 'low',
        category: 'security',
      });
    }
  }
}

function checkImages(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for missing dimensions
  const imgRegex = /<img\s+[^>]*>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    if (!match[0].includes('width=') || !match[0].includes('height=')) {
      warnings.push({
        type: 'warning',
        message: 'Image missing width or height attributes',
        rule: 'IMAGE_DIMENSIONS',
        severity: 'medium',
        category: 'performance',
      });
    }
  }
}

function checkForms(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for form action
  const formRegex = /<form\s+[^>]*>/gi;
  while ((match = formRegex.exec(html)) !== null) {
    if (!match[0].includes('action=')) {
      warnings.push({
        type: 'warning',
        message: 'Form missing action attribute',
        rule: 'FORM_ACTION',
        severity: 'medium',
        category: 'structure',
      });
    }
  }

  // Check for required fields
  const requiredRegex = /required\s*=\s*["']required["']/gi;
  const requiredFields = html.match(requiredRegex);
  if (requiredFields && requiredFields.length > 0) {
    info.push({
      type: 'info',
      message: `Found ${requiredFields.length} required form fields`,
      rule: 'REQUIRED_FIELDS',
      severity: 'low',
      category: 'accessibility',
    });
  }
}

function checkTables(html: string, lines: string[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  // Check for table headers
  const tableRegex = /<table\s+[^>]*>/gi;
  while ((match = tableRegex.exec(html)) !== null) {
    const tableContent = html.substring(match.index);
    const tableEnd = tableContent.indexOf('</table>');
    const tableHTML = tableContent.substring(0, tableEnd + 8);
    
    if (!tableHTML.includes('<th>')) {
      warnings.push({
        type: 'warning',
        message: 'Table missing header cells (<th>)',
        rule: 'TABLE_HEADERS',
        severity: 'medium',
        category: 'accessibility',
      });
    }
  }

  // Check for table summary
  while ((match = tableRegex.exec(html)) !== null) {
    if (!match[0].includes('summary=')) {
      info.push({
        type: 'info',
        message: 'Table missing summary attribute',
        rule: 'TABLE_SUMMARY',
        severity: 'low',
        category: 'accessibility',
      });
    }
  }
}

function validateCustomRules(html: string, lines: string[], customRules: any[], errors: ValidationError[], warnings: ValidationError[], info: ValidationError[], details: any) {
  for (const rule of customRules) {
    if (html.includes(rule.selector)) {
      const issue = {
        type: rule.type,
        message: rule.message,
        rule: 'CUSTOM_RULE',
        severity: rule.severity,
        category: 'custom',
      };

      switch (rule.type) {
        case 'error':
          errors.push(issue);
          break;
        case 'warning':
          warnings.push(issue);
          break;
        case 'info':
          info.push(issue);
          break;
      }
    }
  }
}

function calculateScore(errors: ValidationError[], warnings: ValidationError[], info: ValidationError[]): number {
  const errorWeight = 10;
  const warningWeight = 3;
  const infoWeight = 1;

  const totalIssues = errors.length * errorWeight + warnings.length * warningWeight + info.length * infoWeight;
  const maxScore = 100;

  return Math.max(0, maxScore - totalIssues);
}

function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function generateRecommendations(errors: ValidationError[], warnings: ValidationError[], info: ValidationError[]): string[] {
  const recommendations: string[] = [];

  // High priority recommendations
  if (errors.length > 0) {
    recommendations.push('Fix all errors first as they may break functionality');
  }

  // Structure recommendations
  const structureErrors = errors.filter(e => e.category === 'structure');
  if (structureErrors.length > 0) {
    recommendations.push('Ensure proper HTML structure with all required tags');
  }

  // Accessibility recommendations
  const accessibilityIssues = [...errors, ...warnings].filter(e => e.category === 'accessibility');
  if (accessibilityIssues.length > 0) {
    recommendations.push('Improve accessibility by adding proper alt text and ARIA attributes');
  }

  // SEO recommendations
  const seoIssues = [...errors, ...warnings].filter(e => e.category === 'seo');
  if (seoIssues.length > 0) {
    recommendations.push('Optimize SEO by adding proper meta tags and heading structure');
  }

  // Performance recommendations
  const performanceIssues = [...errors, ...warnings].filter(e => e.category === 'performance');
  if (performanceIssues.length > 0) {
    recommendations.push('Improve performance by optimizing images and using external CSS/JS');
  }

  // Security recommendations
  const securityIssues = [...errors, ...warnings].filter(e => e.category === 'security');
  if (securityIssues.length > 0) {
    recommendations.push('Enhance security by avoiding inline scripts and dangerous patterns');
  }

  // General recommendations
  recommendations.push('Use HTML5 semantic elements for better structure');
  recommendations.push('Test your HTML across different browsers and devices');
  recommendations.push('Consider using automated testing tools for continuous validation');

  return recommendations;
}

function isSelfClosingTag(tag: string): boolean {
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  return selfClosingTags.includes(tag.toLowerCase());
}