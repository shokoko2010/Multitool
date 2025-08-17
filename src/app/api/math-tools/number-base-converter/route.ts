import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface NumberBaseConversion {
  fromBase: number;
  toBase: number;
  inputValue: string;
  outputValue: string;
  decimalValue?: number;
  isValid: boolean;
  error?: string;
}

interface NumberBaseConverterOptions {
  precision?: number;
  uppercase?: boolean;
  showSteps?: boolean;
  includeDecimal?: boolean;
  maxDigits?: number;
}

interface NumberBaseConverterResult {
  success: boolean;
  data?: {
    conversions: NumberBaseConversion[];
    options: NumberBaseConverterOptions;
    metadata: {
      totalConversions: number;
      processingTime: number;
      inputLength: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { number, fromBase, toBases, options = {} } = await request.json();

    if (!number || !fromBase || !toBases) {
      return NextResponse.json<NumberBaseConverterResult>({
        success: false,
        error: 'Number, fromBase, and toBases are required'
      }, { status: 400 });
    }

    // Validate bases
    if (fromBase < 2 || fromBase > 36) {
      return NextResponse.json<NumberBaseConverterResult>({
        success: false,
        error: 'From base must be between 2 and 36'
      }, { status: 400 });
    }

    if (!Array.isArray(toBases)) {
      return NextResponse.json<NumberBaseConverterResult>({
        success: false,
        error: 'toBases must be an array'
      }, { status: 400 });
    }

    for (const base of toBases) {
      if (base < 2 || base > 36) {
        return NextResponse.json<NumberBaseConverterResult>({
          success: false,
          error: `To base ${base} must be between 2 and 36`
        }, { status: 400 });
      }
    }

    // Set default options
    const converterOptions: NumberBaseConverterOptions = {
      precision: Math.min(Math.max(options.precision || 10, 0), 20),
      uppercase: options.uppercase !== false,
      showSteps: options.showSteps || false,
      includeDecimal: options.includeDecimal !== false,
      maxDigits: Math.min(Math.max(options.maxDigits || 100, 1), 1000)
    };

    const startTime = Date.now();
    
    // Convert to decimal first
    const decimalConversion = convertToDecimal(number, fromBase);
    
    if (!decimalConversion.isValid) {
      return NextResponse.json<NumberBaseConverterResult>({
        success: true,
        data: {
          conversions: [decimalConversion],
          options: converterOptions,
          metadata: {
            totalConversions: 1,
            processingTime: Date.now() - startTime,
            inputLength: number.length
          }
        }
      });
    }

    // Convert from decimal to target bases
    const conversions: NumberBaseConversion[] = [decimalConversion];
    
    for (const toBase of toBases) {
      if (toBase === fromBase) {
        conversions.push({
          fromBase,
          toBase,
          inputValue: number,
          outputValue: number,
          decimalValue: decimalConversion.decimalValue,
          isValid: true
        });
      } else {
        const conversion = convertFromDecimal(decimalConversion.decimalValue!, toBase, converterOptions);
        conversions.push(conversion);
      }
    }

    const processingTime = Date.now() - startTime;

    const result = {
      conversions,
      options: converterOptions,
      metadata: {
        totalConversions: conversions.length,
        processingTime,
        inputLength: number.length
      }
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a number systems expert. Analyze the number base conversions and provide insights about the mathematical relationships, practical applications, and best practices for different number bases.'
          },
          {
            role: 'user',
            content: `Analyze this number base conversion:\n\nInput: ${number} (base ${fromBase})\nDecimal Value: ${decimalConversion.decimalValue}\nTarget Bases: ${toBases.join(', ')}\nConversions: ${conversions.filter(c => c.isValid).map(c => `${c.outputValue} (base ${c.toBase})`).join(', ')}\n\nOptions: ${JSON.stringify(converterOptions, null, 2)}\n\nProcessing Time: ${processingTime}ms`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<NumberBaseConverterResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Number base conversion error:', error);
    return NextResponse.json<NumberBaseConverterResult>({
      success: false,
      error: 'Internal server error during number base conversion'
    }, { status: 500 });
  }
}

function convertToDecimal(number: string, fromBase: number): NumberBaseConversion {
  try {
    // Validate input characters for the given base
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substring(0, fromBase);
    const upperNumber = number.toUpperCase();
    
    for (const char of upperNumber) {
      if (!validChars.includes(char)) {
        return {
          fromBase,
          toBase: 10,
          inputValue: number,
          outputValue: '',
          isValid: false,
          error: `Invalid character '${char}' for base ${fromBase}`
        };
      }
    }

    // Handle decimal point
    if (upperNumber.includes('.')) {
      const [integerPart, fractionalPart] = upperNumber.split('.');
      
      // Convert integer part
      let integerValue = 0;
      for (let i = 0; i < integerPart.length; i++) {
        const char = integerPart[i];
        const digitValue = validChars.indexOf(char);
        integerValue = integerValue * fromBase + digitValue;
      }
      
      // Convert fractional part
      let fractionalValue = 0;
      let divisor = fromBase;
      for (let i = 0; i < fractionalPart.length; i++) {
        const char = fractionalPart[i];
        const digitValue = validChars.indexOf(char);
        fractionalValue += digitValue / divisor;
        divisor *= fromBase;
      }
      
      const decimalValue = integerValue + fractionalValue;
      
      return {
        fromBase,
        toBase: 10,
        inputValue: number,
        outputValue: decimalValue.toString(),
        decimalValue,
        isValid: true
      };
    } else {
      // Convert integer
      let decimalValue = 0;
      for (let i = 0; i < upperNumber.length; i++) {
        const char = upperNumber[i];
        const digitValue = validChars.indexOf(char);
        decimalValue = decimalValue * fromBase + digitValue;
      }
      
      return {
        fromBase,
        toBase: 10,
        inputValue: number,
        outputValue: decimalValue.toString(),
        decimalValue,
        isValid: true
      };
    }
  } catch (error) {
    return {
      fromBase,
      toBase: 10,
      inputValue: number,
      outputValue: '',
      isValid: false,
      error: 'Invalid number format'
    };
  }
}

function convertFromDecimal(decimalValue: number, toBase: number, options: NumberBaseConverterOptions): NumberBaseConversion {
  try {
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Handle negative numbers
    const isNegative = decimalValue < 0;
    let absValue = Math.abs(decimalValue);
    
    let integerPart = Math.floor(absValue);
    let fractionalPart = absValue - integerPart;
    
    // Convert integer part
    let integerResult = '';
    if (integerPart === 0) {
      integerResult = '0';
    } else {
      while (integerPart > 0) {
        const remainder = integerPart % toBase;
        integerResult = validChars[remainder] + integerResult;
        integerPart = Math.floor(integerPart / toBase);
      }
    }
    
    let fractionalResult = '';
    if (options.includeDecimal && fractionalPart > 0) {
      fractionalResult = '.';
      let precision = 0;
      
      while (fractionalPart > 0 && precision < options.precision!) {
        fractionalPart *= toBase;
        const digit = Math.floor(fractionalPart);
        fractionalResult += validChars[digit];
        fractionalPart -= digit;
        precision++;
      }
    }
    
    let result = integerResult + fractionalResult;
    
    // Apply formatting options
    if (options.uppercase) {
      result = result.toUpperCase();
    } else {
      result = result.toLowerCase();
    }
    
    // Limit digits
    if (result.length > options.maxDigits!) {
      result = result.substring(0, options.maxDigits);
    }
    
    // Add negative sign
    if (isNegative) {
      result = '-' + result;
    }
    
    return {
      fromBase: 10,
      toBase,
      inputValue: decimalValue.toString(),
      outputValue: result,
      decimalValue,
      isValid: true
    };
  } catch (error) {
    return {
      fromBase: 10,
      toBase,
      inputValue: decimalValue.toString(),
      outputValue: '',
      decimalValue,
      isValid: false,
      error: 'Conversion error'
    };
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with number, fromBase, and toBases'
  }, { status: 405 });
}