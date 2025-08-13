import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface RegexTestOptions {
  flags?: {
    global?: boolean;
    caseInsensitive?: boolean;
    multiline?: boolean;
    dotAll?: boolean;
    unicode?: boolean;
    sticky?: boolean;
  };
  testMode?: 'match' | 'test' | 'replace' | 'split';
  replacement?: string;
  limit?: number;
  includeGroups?: boolean;
  includeIndices?: boolean;
}

interface RegexMatch {
  match: string;
  index: number;
  groups?: Record<string, string>;
  indices?: {
    start: number;
    end: number;
  };
}

interface RegexTestResult {
  success: boolean;
  data?: {
    pattern: string;
    text: string;
    flags: string;
    isValid: boolean;
    error?: string;
    results: {
      matches: RegexMatch[];
      matchCount: number;
      fullMatch?: boolean;
      replacedText?: string;
      splitText?: string[];
    };
    options: RegexTestOptions;
    explanation?: string;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { pattern, text, options = {} } = await request.json();

    if (!pattern || !text) {
      return NextResponse.json<RegexTestResult>({
        success: false,
        error: 'Both pattern and text are required'
      }, { status: 400 });
    }

    // Set default options
    const regexOptions: RegexTestOptions = {
      flags: {
        global: options.flags?.global || false,
        caseInsensitive: options.flags?.caseInsensitive || false,
        multiline: options.flags?.multiline || false,
        dotAll: options.flags?.dotAll || false,
        unicode: options.flags?.unicode || false,
        sticky: options.flags?.sticky || false
      },
      testMode: options.testMode || 'match',
      replacement: options.replacement || '',
      limit: options.limit || 0,
      includeGroups: options.includeGroups !== false,
      includeIndices: options.includeIndices || false
    };

    // Build flags string
    const flags = Object.entries(regexOptions.flags || {})
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        switch (key) {
          case 'global': return 'g';
          case 'caseInsensitive': return 'i';
          case 'multiline': return 'm';
          case 'dotAll': return 's';
          case 'unicode': return 'u';
          case 'sticky': return 'y';
          default: return '';
        }
      })
      .join('');

    let isValid = true;
    let error = '';
    let regex: RegExp;

    try {
      regex = new RegExp(pattern, flags);
    } catch (err) {
      isValid = false;
      error = err instanceof Error ? err.message : 'Invalid regular expression';
    }

    let results: any = {};

    if (isValid) {
      switch (regexOptions.testMode) {
        case 'match':
          results = performMatch(regex, text, regexOptions);
          break;
        case 'test':
          results = performTest(regex, text);
          break;
        case 'replace':
          results = performReplace(regex, text, regexOptions.replacement || '');
          break;
        case 'split':
          results = performSplit(regex, text, regexOptions.limit || 0);
          break;
      }
    }

    // Generate regex explanation
    let explanation = '';
    if (isValid) {
      explanation = generateRegexExplanation(pattern, flags);
    }

    const result = {
      pattern,
      text,
      flags,
      isValid,
      error: error || undefined,
      results,
      options: regexOptions,
      explanation: explanation || undefined
    };

    // AI Analysis
    let analysis = '';
    if (isValid) {
      try {
        const zai = await ZAI.create();
        const analysisResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a regular expression expert. Analyze the regex pattern and test results, providing insights about the pattern\'s effectiveness, potential improvements, and common use cases.'
            },
            {
              role: 'user',
              content: `Analyze this regex test:\n\nPattern: ${pattern}\nFlags: ${flags}\nTest Mode: ${regexOptions.testMode}\nText Length: ${text.length} characters\nMatches Found: ${results.matchCount || 0}\n\nResults Summary: ${JSON.stringify({
                matchCount: results.matchCount || 0,
                fullMatch: results.fullMatch || false,
                hasGroups: regexOptions.includeGroups
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
    }

    return NextResponse.json<RegexTestResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Regex test error:', error);
    return NextResponse.json<RegexTestResult>({
      success: false,
      error: 'Internal server error during regex test'
    }, { status: 500 });
  }
}

function performMatch(regex: RegExp, text: string, options: RegexTestOptions) {
  const matches: RegexMatch[] = [];
  let match;
  const localRegex = new RegExp(regex.source, regex.flags);
  
  while ((match = localRegex.exec(text)) !== null) {
    const regexMatch: RegexMatch = {
      match: match[0],
      index: match.index
    };

    if (options.includeGroups && match.length > 1) {
      regexMatch.groups = {};
      for (let i = 1; i < match.length; i++) {
        regexMatch.groups[`group${i}`] = match[i] || '';
      }
    }

    if (options.includeIndices) {
      regexMatch.indices = {
        start: match.index,
        end: match.index + match[0].length
      };
    }

    matches.push(regexMatch);

    if (!regex.global) break;
  }

  return {
    matches,
    matchCount: matches.length,
    fullMatch: matches.some(m => m.match === text)
  };
}

function performTest(regex: RegExp, text: string) {
  return {
    matches: [],
    matchCount: regex.test(text) ? 1 : 0,
    fullMatch: regex.test(text)
  };
}

function performReplace(regex: RegExp, text: string, replacement: string) {
  const replacedText = text.replace(regex, replacement);
  const matchCount = (text.match(regex) || []).length;
  
  return {
    matches: [],
    matchCount,
    fullMatch: regex.test(text),
    replacedText
  };
}

function performSplit(regex: RegExp, text: string, limit: number) {
  const splitText = limit > 0 ? text.split(regex, limit) : text.split(regex);
  const matchCount = (text.match(regex) || []).length;
  
  return {
    matches: [],
    matchCount,
    fullMatch: regex.test(text),
    splitText
  };
}

function generateRegexExplanation(pattern: string, flags: string): string {
  let explanation = `Regular Expression: /${pattern}/${flags}\n\n`;
  
  // Simple explanation generator (in real implementation, use a regex parser)
  const explanations: Record<string, string> = {
    '.': 'Matches any character except newline',
    '^': 'Matches the beginning of the string',
    '$': 'Matches the end of the string',
    '*': 'Matches 0 or more of the preceding element',
    '+': 'Matches 1 or more of the preceding element',
    '?': 'Matches 0 or 1 of the preceding element',
    '\\d': 'Matches any digit (0-9)',
    '\\w': 'Matches any word character (alphanumeric + underscore)',
    '\\s': 'Matches any whitespace character',
    '[': 'Start of character class',
    ']': 'End of character class',
    '(': 'Start of capturing group',
    ')': 'End of capturing group',
    '{': 'Start of quantifier',
    '}': 'End of quantifier'
  };

  explanation += 'Pattern Breakdown:\n';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (explanations[char]) {
      explanation += `  ${char}: ${explanations[char]}\n`;
    }
  }

  if (flags) {
    explanation += '\nFlags:\n';
    if (flags.includes('g')) explanation += '  g: Global match (find all matches)\n';
    if (flags.includes('i')) explanation += '  i: Case-insensitive matching\n';
    if (flags.includes('m')) explanation += '  m: Multiline mode\n';
    if (flags.includes('s')) explanation += '  s: Dotall mode (dot matches newline)\n';
    if (flags.includes('u')) explanation += '  u: Unicode mode\n';
    if (flags.includes('y')) explanation += '  y: Sticky mode\n';
  }

  return explanation;
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with pattern and text'
  }, { status: 405 });
}