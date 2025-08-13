import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ConversionOptions {
  fromUnit: string;
  toUnit: string;
  baseFontSize: number; // For em/rem conversions
  parentFontSize: number; // For em conversions
  viewportWidth: number; // For vw/vh conversions
  viewportHeight: number; // For vw/vh conversions
  precision: number;
  includeFormula: boolean;
}

interface ConversionResult {
  success: boolean;
  inputValue: number;
  inputUnit: string;
  outputValue: number;
  outputUnit: string;
  formula: string;
  options: ConversionOptions;
  conversions: Record<string, number>;
  contextInfo: {
    baseFontSize: number;
    parentFontSize: number;
    viewportWidth: number;
    viewportHeight: number;
  };
}

// Supported CSS units
const SUPPORTED_UNITS = [
  'px', 'em', 'rem', '%', 'vw', 'vh', 'vmin', 'vmax', 'cm', 'mm', 'in', 'pt', 'pc'
];

// Conversion factors to pixels (base unit)
const TO_PIXELS: Record<string, number> = {
  'px': 1,
  'em': 16, // Default base font size
  'rem': 16, // Default root font size
  '%': 0.16, // 1% of 16px (default font size)
  'vw': 0.01, // 1vw = 1% of viewport width
  'vh': 0.01, // 1vh = 1% of viewport height
  'vmin': 0.01, // 1vmin = 1% of smaller viewport dimension
  'vmax': 0.01, // 1vmax = 1% of larger viewport dimension
  'cm': 37.8, // 1cm = 37.8px
  'mm': 3.78, // 1mm = 3.78px
  'in': 96, // 1in = 96px
  'pt': 1.333, // 1pt = 1.333px
  'pc': 16, // 1pc = 16px
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, fromUnit, toUnit, options = {} } = body;

    if (typeof value !== 'number' || isNaN(value)) {
      return NextResponse.json(
        { error: 'Value must be a valid number' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_UNITS.includes(fromUnit)) {
      return NextResponse.json(
        { error: `Invalid source unit. Supported units: ${SUPPORTED_UNITS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!SUPPORTED_UNITS.includes(toUnit)) {
      return NextResponse.json(
        { error: `Invalid target unit. Supported units: ${SUPPORTED_UNITS.join(', ')}` },
        { status: 400 }
      );
    }

    if (value < 0) {
      return NextResponse.json(
        { error: 'Value cannot be negative' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: ConversionOptions = {
      fromUnit,
      toUnit,
      baseFontSize: 16,
      parentFontSize: 16,
      viewportWidth: 1920,
      viewportHeight: 1080,
      precision: 4,
      includeFormula: true,
    };

    const finalOptions: ConversionOptions = { ...defaultOptions, ...options, fromUnit, toUnit };

    // Validate options
    if (finalOptions.baseFontSize <= 0) {
      return NextResponse.json(
        { error: 'Base font size must be positive' },
        { status: 400 }
      );
    }

    if (finalOptions.parentFontSize <= 0) {
      return NextResponse.json(
        { error: 'Parent font size must be positive' },
        { status: 400 }
      );
    }

    if (finalOptions.viewportWidth <= 0 || finalOptions.viewportHeight <= 0) {
      return NextResponse.json(
        { error: 'Viewport dimensions must be positive' },
        { status: 400 }
      );
    }

    // Perform conversion
    const conversion = convertUnit(value, fromUnit, toUnit, finalOptions);
    
    // Generate all conversions for reference
    const allConversions: Record<string, number> = {};
    for (const unit of SUPPORTED_UNITS) {
      if (unit !== fromUnit) {
        allConversions[unit] = convertUnit(value, fromUnit, unit, finalOptions).outputValue;
      }
    }

    const result: ConversionResult = {
      success: true,
      inputValue: value,
      inputUnit: fromUnit,
      outputValue: conversion.outputValue,
      outputUnit: toUnit,
      formula: conversion.formula,
      options: finalOptions,
      conversions: allConversions,
      contextInfo: {
        baseFontSize: finalOptions.baseFontSize,
        parentFontSize: finalOptions.parentFontSize,
        viewportWidth: finalOptions.viewportWidth,
        viewportHeight: finalOptions.viewportHeight,
      },
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a CSS units expert. Provide insights about CSS unit conversions and best practices.'
          },
          {
            role: 'user',
            content: `Analyze this CSS unit conversion:
            - Converting ${value}${fromUnit} to ${conversion.outputValue.toFixed(finalOptions.precision)}${toUnit}
            - Formula: ${conversion.formula}
            - Context: Base font size: ${finalOptions.baseFontSize}px, Viewport: ${finalOptions.viewportWidth}x${finalOptions.viewportHeight}
            
            Provide insights about:
            1. When to use ${fromUnit} vs ${toUnit}
            2. Responsive design considerations
            3. Accessibility implications
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
    console.error('CSS unit conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error during unit conversion' },
      { status: 500 }
    );
  }
}

function convertUnit(value: number, fromUnit: string, toUnit: string, options: ConversionOptions): {
  outputValue: number;
  formula: string;
} {
  // Convert to pixels first
  let pixels = value;
  let formula = '';

  switch (fromUnit) {
    case 'px':
      pixels = value;
      formula = `${value}px = ${value}px`;
      break;
    case 'em':
      pixels = value * options.parentFontSize;
      formula = `${value}em × ${options.parentFontSize}px = ${pixels}px`;
      break;
    case 'rem':
      pixels = value * options.baseFontSize;
      formula = `${value}rem × ${options.baseFontSize}px = ${pixels}px`;
      break;
    case '%':
      pixels = value * options.baseFontSize / 100;
      formula = `${value}% × ${options.baseFontSize}px ÷ 100 = ${pixels}px`;
      break;
    case 'vw':
      pixels = value * options.viewportWidth / 100;
      formula = `${value}vw × ${options.viewportWidth}px ÷ 100 = ${pixels}px`;
      break;
    case 'vh':
      pixels = value * options.viewportHeight / 100;
      formula = `${value}vh × ${options.viewportHeight}px ÷ 100 = ${pixels}px`;
      break;
    case 'vmin':
      const vmin = Math.min(options.viewportWidth, options.viewportHeight);
      pixels = value * vmin / 100;
      formula = `${value}vmin × ${vmin}px ÷ 100 = ${pixels}px`;
      break;
    case 'vmax':
      const vmax = Math.max(options.viewportWidth, options.viewportHeight);
      pixels = value * vmax / 100;
      formula = `${value}vmax × ${vmax}px ÷ 100 = ${pixels}px`;
      break;
    default:
      pixels = value * TO_PIXELS[fromUnit];
      formula = `${value}${fromUnit} × ${TO_PIXELS[fromUnit]} = ${pixels}px`;
  }

  // Convert from pixels to target unit
  let result = pixels;
  let targetFormula = formula;

  switch (toUnit) {
    case 'px':
      result = pixels;
      targetFormula = formula;
      break;
    case 'em':
      result = pixels / options.parentFontSize;
      targetFormula = `${formula} ÷ ${options.parentFontSize}px = ${result}em`;
      break;
    case 'rem':
      result = pixels / options.baseFontSize;
      targetFormula = `${formula} ÷ ${options.baseFontSize}px = ${result}rem`;
      break;
    case '%':
      result = pixels / options.baseFontSize * 100;
      targetFormula = `${formula} ÷ ${options.baseFontSize}px × 100 = ${result}%`;
      break;
    case 'vw':
      result = pixels / options.viewportWidth * 100;
      targetFormula = `${formula} ÷ ${options.viewportWidth}px × 100 = ${result}vw`;
      break;
    case 'vh':
      result = pixels / options.viewportHeight * 100;
      targetFormula = `${formula} ÷ ${options.viewportHeight}px × 100 = ${result}vh`;
      break;
    case 'vmin':
      const vmin = Math.min(options.viewportWidth, options.viewportHeight);
      result = pixels / vmin * 100;
      targetFormula = `${formula} ÷ ${vmin}px × 100 = ${result}vmin`;
      break;
    case 'vmax':
      const vmax = Math.max(options.viewportWidth, options.viewportHeight);
      result = pixels / vmax * 100;
      targetFormula = `${formula} ÷ ${vmax}px × 100 = ${result}vmax`;
      break;
    default:
      result = pixels / TO_PIXELS[toUnit];
      targetFormula = `${formula} ÷ ${TO_PIXELS[toUnit]} = ${result}${toUnit}`;
  }

  return {
    outputValue: parseFloat(result.toFixed(options.precision)),
    formula: targetFormula,
  };
}