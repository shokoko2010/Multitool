import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DecodeOptions {
  decodeAll: boolean;
  decodeNamedEntities: boolean;
  decodeNumericEntities: boolean;
  decodeHexEntities: boolean;
  preserveFormatting: boolean;
  strictMode: boolean;
  includeStatistics: boolean;
  customReplacements: Record<string, string>;
}

interface DecodeResult {
  success: boolean;
  originalText: string;
  decodedText: string;
  statistics: {
    totalEntities: number;
    namedEntities: number;
    numericEntities: number;
    hexEntities: number;
    customReplacements: number;
    failedDecodes: number;
    decodingTime: number;
  };
  options: DecodeOptions;
  entitiesFound: Array<{
    entity: string;
    decoded: string;
    position: number;
    type: 'named' | 'numeric' | 'hex' | 'custom';
  }>;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// Common HTML entities
const NAMED_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&cent;': '¢',
  '&pound;': '£',
  '&yen;': '¥',
  '&euro;': '€',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&micro;': 'µ',
  '&middot;': '·',
  '&hellip;': '…',
  '&prime;': '′',
  '&Prime;': '″',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&laquo;': '«',
  '&raquo;': '»',
  '&lsaquo;': '‹',
  '&rsaquo;': '›',
  '&mdash;': '—',
  '&ndash;': '–',
  '&circ;': 'ˆ',
  '&tilde;': '˜',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  '&sup1;': '¹',
  '&sup2;': '²',
  '&sup3;': '³',
  '&Alpha;': 'Α',
  '&Beta;': 'Β',
  '&Gamma;': 'Γ',
  '&Delta;': 'Δ',
  '&Epsilon;': 'Ε',
  '&Zeta;': 'Ζ',
  '&Eta;': 'Η',
  '&Theta;': 'Θ',
  '&Iota;': 'Ι',
  '&Kappa;': 'Κ',
  '&Lambda;': 'Λ',
  '&Mu;': 'Μ',
  '&Nu;': 'Ν',
  '&Xi;': 'Ξ',
  '&Omicron;': 'Ο',
  '&Pi;': 'Π',
  '&Rho;': 'Ρ',
  '&Sigma;': 'Σ',
  '&Tau;': 'Τ',
  '&Upsilon;': 'Υ',
  '&Phi;': 'Φ',
  '&Chi;': 'Χ',
  '&Psi;': 'Ψ',
  '&Omega;': 'Ω',
  '&alpha;': 'α',
  '&beta;': 'β',
  '&gamma;': 'γ',
  '&delta;': 'δ',
  '&epsilon;': 'ε',
  '&zeta;': 'ζ',
  '&eta;': 'η',
  '&theta;': 'θ',
  '&iota;': 'ι',
  '&kappa;': 'κ',
  '&lambda;': 'λ',
  '&mu;': 'μ',
  '&nu;': 'ν',
  '&xi;': 'ξ',
  '&omicron;': 'ο',
  '&pi;': 'π',
  '&rho;': 'ρ',
  '&sigma;': 'σ',
  '&tau;': 'τ',
  '&upsilon;': 'υ',
  '&phi;': 'φ',
  '&chi;': 'χ',
  '&psi;': 'ψ',
  '&omega;': 'ω',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options = {} } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 100000) { // 100KB limit
      return NextResponse.json(
        { error: 'Text size exceeds 100KB limit' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: DecodeOptions = {
      decodeAll: true,
      decodeNamedEntities: true,
      decodeNumericEntities: true,
      decodeHexEntities: true,
      preserveFormatting: false,
      strictMode: false,
      includeStatistics: true,
      customReplacements: {},
    };

    const finalOptions: DecodeOptions = { ...defaultOptions, ...options };

    const startTime = Date.now();
    
    // Decode HTML entities
    const result = decodeHTMLEntities(text, finalOptions);
    
    const endTime = Date.now();
    result.statistics.decodingTime = endTime - startTime;

    // Validate result
    const validation = validateDecodingResult(text, result.decodedText, finalOptions);
    result.validation = validation;

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an HTML entity decoding expert. Provide insights about entity encoding and best practices.'
          },
          {
            role: 'user',
            content: `Analyze this HTML entity decoding operation:
            - Total entities found: ${result.statistics.totalEntities}
            - Named entities: ${result.statistics.namedEntities}
            - Numeric entities: ${result.statistics.numericEntities}
            - Processing time: ${result.statistics.decodingTime}ms
            
            Provide insights about:
            1. Common use cases for HTML entities
            2. Security considerations
            3. Best practices for entity handling
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
    console.error('HTML entity decoding error:', error);
    return NextResponse.json(
      { error: 'Internal server error during entity decoding' },
      { status: 500 }
    );
  }
}

function decodeHTMLEntities(text: string, options: DecodeOptions): DecodeResult {
  let decodedText = text;
  const entitiesFound: Array<{
    entity: string;
    decoded: string;
    position: number;
    type: 'named' | 'numeric' | 'hex' | 'custom';
  }> = [];

  const statistics = {
    totalEntities: 0,
    namedEntities: 0,
    numericEntities: 0,
    hexEntities: 0,
    customReplacements: 0,
    failedDecodes: 0,
    decodingTime: 0,
  };

  // Create combined entity map
  const entityMap = { ...NAMED_ENTITIES, ...options.customReplacements };

  // Process named entities
  if (options.decodeNamedEntities || options.decodeAll) {
    for (const [entity, replacement] of Object.entries(entityMap)) {
      const regex = new RegExp(escapeRegex(entity), 'g');
      let match;
      
      while ((match = regex.exec(decodedText)) !== null) {
        entitiesFound.push({
          entity: match[0],
          decoded: replacement,
          position: match.index,
          type: entity in NAMED_ENTITIES ? 'named' : 'custom',
        });
        
        statistics.totalEntities++;
        if (entity in NAMED_ENTITIES) {
          statistics.namedEntities++;
        } else {
          statistics.customReplacements++;
        }
      }
      
      decodedText = decodedText.replace(regex, replacement);
    }
  }

  // Process numeric entities (&#123;)
  if (options.decodeNumericEntities || options.decodeAll) {
    const numericRegex = /&#(\d+);/g;
    let match;
    
    while ((match = numericRegex.exec(decodedText)) !== null) {
      const codePoint = parseInt(match[1], 10);
      let replacement = '';
      
      try {
        replacement = String.fromCodePoint(codePoint);
        entitiesFound.push({
          entity: match[0],
          decoded: replacement,
          position: match.index,
          type: 'numeric',
        });
        
        statistics.totalEntities++;
        statistics.numericEntities++;
      } catch (error) {
        statistics.failedDecodes++;
        continue;
      }
    }
    
    decodedText = decodedText.replace(numericRegex, (match, codePoint) => {
      try {
        return String.fromCodePoint(parseInt(codePoint, 10));
      } catch {
        statistics.failedDecodes++;
        return match; // Return original if invalid
      }
    });
  }

  // Process hex entities (&#x1F600;)
  if (options.decodeHexEntities || options.decodeAll) {
    const hexRegex = /&#x([0-9a-fA-F]+);/g;
    let match;
    
    while ((match = hexRegex.exec(decodedText)) !== null) {
      const codePoint = parseInt(match[1], 16);
      let replacement = '';
      
      try {
        replacement = String.fromCodePoint(codePoint);
        entitiesFound.push({
          entity: match[0],
          decoded: replacement,
          position: match.index,
          type: 'hex',
        });
        
        statistics.totalEntities++;
        statistics.hexEntities++;
      } catch (error) {
        statistics.failedDecodes++;
        continue;
      }
    }
    
    decodedText = decodedText.replace(hexRegex, (match, hexCode) => {
      try {
        return String.fromCodePoint(parseInt(hexCode, 16));
      } catch {
        statistics.failedDecodes++;
        return match; // Return original if invalid
      }
    });
  }

  // Handle malformed entities in strict mode
  if (options.strictMode) {
    const malformedRegex = /&(?:#[0-9]+;?|#x[0-9a-fA-F]+;?|[a-zA-Z]+;?)/g;
    const malformedMatches = decodedText.match(malformedRegex);
    
    if (malformedMatches) {
      statistics.failedDecodes += malformedMatches.length;
    }
  }

  // Preserve formatting if requested
  if (options.preserveFormatting) {
    decodedText = decodedText.replace(/\s+/g, ' ');
  }

  return {
    success: true,
    originalText: text,
    decodedText,
    statistics,
    options,
    entitiesFound,
    validation: {
      isValid: statistics.failedDecodes === 0,
      errors: [],
      warnings: [],
    },
  };
}

function validateDecodingResult(original: string, decoded: string, options: DecodeOptions) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  // Check for remaining entities
  const remainingEntities = decoded.match(/&(?:#[0-9]+;|#x[0-9a-fA-F]+;|[a-zA-Z]+;)/g);
  if (remainingEntities && remainingEntities.length > 0) {
    if (options.strictMode) {
      errors.push(`${remainingEntities.length} entities could not be decoded`);
      isValid = false;
    } else {
      warnings.push(`${remainingEntities.length} entities could not be decoded`);
    }
  }

  // Check for malformed entities
  const malformedEntities = decoded.match(/&(?:#[0-9]+;?|#x[0-9a-fA-F]+;?|[a-zA-Z]+;?)/g);
  if (malformedEntities) {
    warnings.push(`${malformedEntities.length} potentially malformed entities found`);
  }

  // Check for ampersands that might be missed entities
  const standaloneAmps = decoded.match(/&(?!(?:#[0-9]+;|#x[0-9a-fA-F]+;|[a-zA-Z]+;))/g);
  if (standaloneAmps) {
    warnings.push(`${standaloneAmps.length} standalone ampersands found - might be missed entities`);
  }

  // Check for Unicode replacement characters
  const replacementChars = decoded.match(/\uFFFD/g);
  if (replacementChars) {
    warnings.push(`${replacementChars.length} Unicode replacement characters found - indicates decoding errors`);
  }

  return {
    isValid,
    errors,
    warnings,
  };
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}