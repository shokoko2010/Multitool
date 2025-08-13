import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      number,
      fromBase = 10,
      toBase = 16,
      uppercase = false,
      precision = 10,
      showSteps = false
    } = body;

    // Input validation
    if (number === undefined || number === null) {
      return NextResponse.json(
        { error: 'Number is required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(fromBase) || fromBase < 2 || fromBase > 36) {
      return NextResponse.json(
        { error: 'From base must be an integer between 2 and 36' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(toBase) || toBase < 2 || toBase > 36) {
      return NextResponse.json(
        { error: 'To base must be an integer between 2 and 36' },
        { status: 400 }
      );
    }

    if (typeof uppercase !== 'boolean' || typeof showSteps !== 'boolean') {
      return NextResponse.json(
        { error: 'Boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(precision) || precision < 0 || precision > 20) {
      return NextResponse.json(
        { error: 'Precision must be an integer between 0 and 20' },
        { status: 400 }
      );
    }

    // Parse the input number
    let decimalValue: number;
    let inputType: 'integer' | 'decimal' | 'fraction';
    let steps: any[] = [];

    try {
      const result = parseNumber(number.toString(), fromBase);
      decimalValue = result.value;
      inputType = result.type;
      
      if (showSteps) {
        steps.push({
          step: 'Input parsing',
          description: `Parsed "${number}" from base ${fromBase}`,
          result: decimalValue,
          type: inputType
        });
      }
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid number for base ${fromBase}: ${error}` },
        { status: 400 }
      );
    }

    // Convert to target base
    let convertedResult: string;
    let conversionSteps: any[] = [];

    if (toBase === 10) {
      // Convert to decimal (already done)
      convertedResult = decimalValue.toString();
      if (showSteps) {
        conversionSteps.push({
          step: 'Conversion to decimal',
          description: 'Number is already in decimal format',
          result: convertedResult
        });
      }
    } else {
      // Convert from decimal to target base
      const conversion = convertFromDecimal(decimalValue, toBase, precision, uppercase);
      convertedResult = conversion.result;
      
      if (showSteps) {
        conversionSteps = conversion.steps;
      }
    }

    // Additional information
    const info = {
      input: {
        value: number,
        base: fromBase,
        type: inputType
      },
      output: {
        value: convertedResult,
        base: toBase,
        type: convertedResult.includes('.') ? 'decimal' : 'integer'
      },
      decimalValue,
      conversion: {
        fromBase,
        toBase,
        precision,
        uppercase
      },
      isValid: true
    };

    // Binary-specific information
    if (fromBase === 2 || toBase === 2) {
      info.binaryInfo = {
        bitLength: Math.ceil(Math.log2(decimalValue + 1)),
        isPowerOfTwo: isPowerOfTwo(Math.floor(decimalValue)),
        byteCount: Math.ceil(Math.log2(decimalValue + 1) / 8)
      };
    }

    // Hexadecimal-specific information
    if (fromBase === 16 || toBase === 16) {
      info.hexInfo = {
        byteRepresentation: decimalValue <= 255 ? `0x${decimalValue.toString(16).padStart(2, '0').toUpperCase()}` : null,
        isPrintableAscii: decimalValue >= 32 && decimalValue <= 126,
        asciiChar: decimalValue >= 32 && decimalValue <= 126 ? String.fromCharCode(decimalValue) : null
      };
    }

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a number systems and mathematics expert. Analyze the base conversion and provide insights about the number representation, its properties, and applications.'
          },
          {
            role: 'user',
            content: `Converted number "${number}" from base ${fromBase} to base ${toBase}. Result: "${convertedResult}". Decimal value: ${decimalValue}. ${info.binaryInfo ? `Binary info: ${info.binaryInfo.bitLength} bits.` : ''} ${info.hexInfo ? `Hex info: ${info.hexInfo.byteRepresentation}.` : ''} Provide insights about number systems and this conversion.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    const result = {
      success: true,
      result: convertedResult,
      info
    };

    if (showSteps) {
      result.steps = [...steps, ...conversionSteps];
    }

    return NextResponse.json({
      ...result,
      aiInsights
    });

  } catch (error) {
    console.error('Number base conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert number base' },
      { status: 500 }
    );
  }
}

// Helper functions
function parseNumber(numberStr: string, base: number): { value: number; type: 'integer' | 'decimal' | 'fraction' } {
  numberStr = numberStr.trim().toLowerCase();
  
  // Handle negative numbers
  let isNegative = false;
  if (numberStr.startsWith('-')) {
    isNegative = true;
    numberStr = numberStr.substring(1);
  }

  // Check for decimal point
  const parts = numberStr.split('.');
  let integerPart = parts[0];
  let fractionalPart = parts.length > 1 ? parts[1] : '';

  // Validate characters for the given base
  const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base);
  const invalidChars = (integerPart + fractionalPart).split('').filter(char => !validChars.includes(char));
  
  if (invalidChars.length > 0) {
    throw new Error(`Invalid characters for base ${base}: ${invalidChars.join(', ')}`);
  }

  // Convert integer part
  let integerValue = 0;
  for (let i = 0; i < integerPart.length; i++) {
    const char = integerPart[i];
    const digitValue = validChars.indexOf(char);
    integerValue = integerValue * base + digitValue;
  }

  // Convert fractional part if present
  let fractionalValue = 0;
  if (fractionalPart.length > 0) {
    for (let i = 0; i < fractionalPart.length; i++) {
      const char = fractionalPart[i];
      const digitValue = validChars.indexOf(char);
      fractionalValue += digitValue / Math.pow(base, i + 1);
    }
  }

  const totalValue = integerValue + fractionalValue;
  const type = fractionalPart.length > 0 ? (integerValue === 0 ? 'fraction' : 'decimal') : 'integer';

  return {
    value: isNegative ? -totalValue : totalValue,
    type
  };
}

function convertFromDecimal(decimalValue: number, toBase: number, precision: number, uppercase: boolean): { result: string; steps: any[] } {
  const steps: any[] = [];
  let result = '';

  // Handle negative numbers
  let isNegative = decimalValue < 0;
  let absoluteValue = Math.abs(decimalValue);

  // Separate integer and fractional parts
  const integerPart = Math.floor(absoluteValue);
  const fractionalPart = absoluteValue - integerPart;

  // Convert integer part
  if (integerPart === 0) {
    result = '0';
    steps.push({
      step: 'Integer conversion',
      description: 'Integer part is 0',
      result: '0'
    });
  } else {
    let integerResult = '';
    let temp = integerPart;
    let conversionSteps: string[] = [];

    while (temp > 0) {
      const remainder = temp % toBase;
      const digit = getDigitForBase(remainder, uppercase);
      integerResult = digit + integerResult;
      conversionSteps.push(`${temp} ÷ ${toBase} = ${Math.floor(temp / toBase)} remainder ${remainder} (${digit})`);
      temp = Math.floor(temp / toBase);
    }

    result = integerResult;
    steps.push({
      step: 'Integer conversion',
      description: `Converting integer part ${integerPart} to base ${toBase}`,
      steps: conversionSteps,
      result: integerResult
    });
  }

  // Convert fractional part if present and precision > 0
  if (fractionalPart > 0 && precision > 0) {
    let fractionalResult = '';
    let temp = fractionalPart;
    let conversionSteps: string[] = [];

    for (let i = 0; i < precision; i++) {
      temp *= toBase;
      const digitValue = Math.floor(temp);
      const digit = getDigitForBase(digitValue, uppercase);
      fractionalResult += digit;
      conversionSteps.push(`${(temp / toBase).toFixed(6)} × ${toBase} = ${temp.toFixed(6)} → ${digit} (${digitValue})`);
      temp -= digitValue;
      
      if (temp === 0) break;
    }

    result += '.' + fractionalResult;
    steps.push({
      step: 'Fractional conversion',
      description: `Converting fractional part ${fractionalPart.toFixed(6)} to base ${toBase} with ${precision} digits precision`,
      steps: conversionSteps,
      result: fractionalResult
    });
  }

  // Add negative sign if needed
  if (isNegative) {
    result = '-' + result;
    steps.push({
      step: 'Sign handling',
      description: 'Added negative sign',
      result: result
    });
  }

  return { result, steps };
}

function getDigitForBase(value: number, uppercase: boolean): string {
  const digits = uppercase ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '0123456789abcdefghijklmnopqrstuvwxyz';
  return digits[value];
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export async function GET() {
  return NextResponse.json({
    message: 'Number Base Converter API',
    usage: 'POST /api/math-tools/number-base-converter',
    parameters: {
      number: 'Number to convert (required)',
      fromBase: 'Source base (2-36, default: 10) - optional',
      toBase: 'Target base (2-36, default: 16) - optional',
      uppercase: 'Use uppercase letters for bases > 10 (default: false) - optional',
      precision: 'Decimal precision for fractional parts (0-20, default: 10) - optional',
      showSteps: 'Show conversion steps (default: false) - optional'
    },
    commonBases: {
      2: 'Binary (0-1)',
      8: 'Octal (0-7)',
      10: 'Decimal (0-9)',
      16: 'Hexadecimal (0-9, A-F)',
      32: 'Base32 (A-Z, 2-7)',
      36: 'Base36 (A-Z, 0-9)'
    },
    examples: [
      {
        number: '255',
        fromBase: 10,
        toBase: 16,
        uppercase: true
      },
      {
        number: '1010',
        fromBase: 2,
        toBase: 10
      },
      {
        number: 'FF',
        fromBase: 16,
        toBase: 2,
        showSteps: true
      },
      {
        number: '10.5',
        fromBase: 10,
        toBase: 2,
        precision: 8
      }
    ]
  });
}