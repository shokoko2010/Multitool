import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      input,
      operation = 'to_roman',
      strict = true,
      includeValidation = true,
      showSteps = false
    } = body;

    // Input validation
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    if (!['to_roman', 'from_roman'].includes(operation)) {
      return NextResponse.json(
        { error: 'Operation must be either "to_roman" or "from_roman"' },
        { status: 400 }
      );
    }

    if (typeof strict !== 'boolean' || typeof includeValidation !== 'boolean' || typeof showSteps !== 'boolean') {
      return NextResponse.json(
        { error: 'All boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    let result: string | number;
    let validation: any = null;
    let steps: any[] = [];
    let conversionInfo: any = {};

    if (operation === 'to_roman') {
      // Convert number to Roman numeral
      const number = parseInt(input.toString());
      
      if (isNaN(number) || number < 1 || number > 3999) {
        return NextResponse.json(
          { error: 'Number must be between 1 and 3999' },
          { status: 400 }
        );
      }

      const conversion = numberToRoman(number, showSteps);
      result = conversion.roman;
      
      if (showSteps) {
        steps = conversion.steps;
      }

      conversionInfo = {
        type: 'to_roman',
        input: number,
        output: result,
        method: 'standard',
        maxValue: 3999
      };

    } else {
      // Convert Roman numeral to number
      const roman = input.toString().toUpperCase().trim();
      
      if (!isValidRoman(roman)) {
        return NextResponse.json(
          { error: 'Invalid Roman numeral format' },
          { status: 400 }
        );
      }

      const conversion = romanToNumber(roman, showSteps);
      result = conversion.number;
      
      if (showSteps) {
        steps = conversion.steps;
      }

      conversionInfo = {
        type: 'from_roman',
        input: roman,
        output: result,
        method: 'subtractive'
      };
    }

    // Validation information
    if (includeValidation) {
      validation = {
        isValid: true,
        strictMode: strict,
        rules: {
          noMoreThanThreeRepeats: true,
          subtractiveNotation: true,
          validSymbols: true,
          orderValidation: true
        }
      };

      if (operation === 'from_roman') {
        const roman = input.toString().toUpperCase();
        validation.rules.validSymbols = /^[MDCLXVI]+$/.test(roman);
        validation.rules.noMoreThanThreeRepeats = !/(.)\1{3,}/.test(roman);
        validation.rules.orderValidation = isValidRomanOrder(roman);
        validation.rules.subtractiveNotation = isValidSubtractiveNotation(roman);
        
        validation.isValid = Object.values(validation.rules).every(rule => rule);
      }
    }

    // Additional information
    const info = {
      conversion: conversionInfo,
      romanNumerals: {
        symbols: {
          M: 1000,
          D: 500,
          C: 100,
          L: 50,
          X: 10,
          V: 5,
          I: 1
        },
        subtractivePairs: {
          CM: 900,
          CD: 400,
          XC: 90,
          XL: 40,
          IX: 9,
          IV: 4
        },
        maxValue: 3999,
        minValue: 1
      },
      historical: {
        origin: 'Ancient Rome',
        usage: 'Numbering system, dates, inscriptions',
        modernUsage: 'Clock faces, book numbering, formal documents'
      }
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a Roman numeral and ancient mathematics expert. Analyze the Roman numeral conversion and provide insights about the numbering system, its history, and applications.'
          },
          {
            role: 'user',
            content: `Converted ${operation === 'to_roman' ? 'number' : 'Roman numeral'} "${input}" ${operation === 'to_roman' ? 'to' : 'from'} Roman ${operation === 'to_roman' ? 'numeral' : 'number'}. Result: "${result}". ${validation ? `Validation: ${validation.isValid ? 'Valid' : 'Invalid'}.` : ''} Provide insights about Roman numerals and their historical significance.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    const response: any = {
      success: true,
      result,
      info
    };

    if (includeValidation) {
      response.validation = validation;
    }

    if (showSteps) {
      response.steps = steps;
    }

    return NextResponse.json({
      ...response,
      aiInsights
    });

  } catch (error) {
    console.error('Roman numeral conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert Roman numeral' },
      { status: 500 }
    );
  }
}

// Helper functions
function numberToRoman(num: number, showSteps: boolean): { roman: string; steps: any[] } {
  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' }
  ];

  let result = '';
  let remaining = num;
  const steps: any[] = [];

  for (const numeral of romanNumerals) {
    while (remaining >= numeral.value) {
      result += numeral.symbol;
      remaining -= numeral.value;
      
      if (showSteps) {
        steps.push({
          step: 'Subtraction',
          description: `${numeral.symbol} = ${numeral.value}`,
          remaining: remaining + numeral.value,
          result: result
        });
      }
    }
  }

  return { roman: result, steps };
}

function romanToNumber(roman: string, showSteps: boolean): { number: number; steps: any[] } {
  const romanValues: Record<string, number> = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };

  let total = 0;
  let i = 0;
  const steps: any[] = [];

  while (i < roman.length) {
    const current = romanValues[roman[i]];
    const next = i + 1 < roman.length ? romanValues[roman[i + 1]] : 0;

    if (current < next) {
      // Subtractive notation
      total += next - current;
      if (showSteps) {
        steps.push({
          step: 'Subtractive notation',
          description: `${roman[i]}${roman[i + 1]} = ${next - current}`,
          total: total
        });
      }
      i += 2;
    } else {
      // Additive notation
      total += current;
      if (showSteps) {
        steps.push({
          step: 'Additive notation',
          description: `${roman[i]} = ${current}`,
          total: total
        });
      }
      i += 1;
    }
  }

  return { number: total, steps };
}

function isValidRoman(roman: string): boolean {
  // Check if string contains only valid Roman numeral symbols
  if (!/^[MDCLXVI]+$/.test(roman)) {
    return false;
  }

  // Check for more than three consecutive identical symbols
  if (/(.)\1{3,}/.test(roman)) {
    return false;
  }

  // Check for valid subtractive notation
  if (!isValidSubtractiveNotation(roman)) {
    return false;
  }

  // Check for valid order
  if (!isValidRomanOrder(roman)) {
    return false;
  }

  return true;
}

function isValidSubtractiveNotation(roman: string): boolean {
  const invalidSubtractives = [
    'IL', 'IC', 'ID', 'IM',  // I can only be subtracted from V and X
    'XD', 'XM',              // X can only be subtracted from L and C
    'VX', 'VL', 'VC', 'VD', 'VM',  // V cannot be subtracted
    'LC', 'LD', 'LM',        // L can only be subtracted from C
    'DM'                     // D can only be subtracted from M
  ];

  return !invalidSubtractives.some(pattern => roman.includes(pattern));
}

function isValidRomanOrder(roman: string): boolean {
  const order = ['M', 'D', 'C', 'L', 'X', 'V', 'I'];
  
  for (let i = 0; i < roman.length - 1; i++) {
    const current = roman[i];
    const next = roman[i + 1];
    
    const currentIndex = order.indexOf(current);
    const nextIndex = order.indexOf(next);
    
    // If current symbol is smaller than next, it should be a valid subtractive pair
    if (currentIndex > nextIndex) {
      const pair = current + next;
      const validSubtractives = ['IV', 'IX', 'XL', 'XC', 'CD', 'CM'];
      if (!validSubtractives.includes(pair)) {
        return false;
      }
    }
  }
  
  return true;
}

export async function GET() {
  return NextResponse.json({
    message: 'Roman Numeral Converter API',
    usage: 'POST /api/math-tools/roman-numeral-converter',
    parameters: {
      input: 'Number or Roman numeral to convert (required)',
      operation: 'Conversion direction: "to_roman" or "from_roman" (default: "to_roman") - optional',
      strict: 'Use strict validation rules (default: true) - optional',
      includeValidation: 'Include validation information (default: true) - optional',
      showSteps: 'Show conversion steps (default: false) - optional'
    },
    romanNumerals: {
      symbols: {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
      },
      subtractive: {
        'IV': 4,
        'IX': 9,
        'XL': 40,
        'XC': 90,
        'CD': 400,
        'CM': 900
      },
      rules: [
        'Symbols should be written from largest to smallest',
        'No more than three identical symbols in a row',
        'Subtractive notation for 4, 9, 40, 90, 400, 900',
        'Valid range: 1 to 3999'
      ]
    },
    examples: [
      {
        input: '2024',
        operation: 'to_roman',
        showSteps: true
      },
      {
        input: 'MMXXIV',
        operation: 'from_roman',
        includeValidation: true
      },
      {
        input: '1999',
        operation: 'to_roman'
      },
      {
        input: 'MCMXCIX',
        operation: 'from_roman'
      }
    ]
  });
}