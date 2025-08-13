import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      value,
      fromUnit,
      toUnit,
      category,
      precision = 6,
      showConversionSteps = false
    } = body;

    // Input validation
    if (value === undefined || value === null || isNaN(value)) {
      return NextResponse.json(
        { error: 'Value is required and must be a number' },
        { status: 400 }
      );
    }

    if (!fromUnit || !toUnit) {
      return NextResponse.json(
        { error: 'Both fromUnit and toUnit are required' },
        { status: 400 }
      );
    }

    if (typeof precision !== 'number' || precision < 0 || precision > 15) {
      return NextResponse.json(
        { error: 'Precision must be a number between 0 and 15' },
        { status: 400 }
      );
    }

    if (typeof showConversionSteps !== 'boolean') {
      return NextResponse.json(
        { error: 'showConversionSteps must be a boolean value' },
        { status: 400 }
      );
    }

    const numericValue = parseFloat(value.toString());

    // Get unit conversion data
    const conversionData = getUnitConversionData(category, fromUnit, toUnit);
    
    if (!conversionData) {
      return NextResponse.json(
        { error: `Unsupported conversion from ${fromUnit} to ${toUnit}${category ? ` in category ${category}` : ''}` },
        { status: 400 }
      );
    }

    // Perform conversion
    const conversion = performConversion(numericValue, conversionData, precision, showConversionSteps);
    
    // Get additional information
    const info = getConversionInfo(conversionData, numericValue, conversion.result);

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a unit conversion and measurement expert. Analyze the unit conversion and provide insights about the measurement, its significance, and practical applications.'
          },
          {
            role: 'user',
            content: `Converted ${numericValue} ${fromUnit} to ${conversion.result} ${toUnit} in ${conversionData.category} category. Conversion factor: ${conversionData.factor}. ${showConversionSteps ? 'Conversion steps shown.' : ''} Provide insights about this measurement conversion and its practical applications.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    return NextResponse.json({
      success: true,
      input: {
        value: numericValue,
        unit: fromUnit
      },
      output: {
        value: conversion.result,
        unit: toUnit
      },
      conversion: {
        category: conversionData.category,
        factor: conversionData.factor,
        formula: conversion.formula
      },
      ...(showConversionSteps && { steps: conversion.steps }),
      info,
      aiInsights
    });

  } catch (error) {
    console.error('Unit conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert units' },
      { status: 500 }
    );
  }
}

function getUnitConversionData(category: string | undefined, fromUnit: string, toUnit: string): any {
  const unitData: Record<string, Record<string, number>> = {
    length: {
      // Base unit: meter
      m: 1,
      km: 0.001,
      cm: 100,
      mm: 1000,
      mi: 0.000621371,
      yd: 1.09361,
      ft: 3.28084,
      in: 39.3701,
      nmi: 0.000539957,
      Å: 10000000000
    },
    weight: {
      // Base unit: kilogram
      kg: 1,
      g: 1000,
      mg: 1000000,
      lb: 2.20462,
      oz: 35.274,
      st: 0.157473,
      ton: 0.001,
      t: 0.001,
      ct: 5000
    },
    temperature: {
      // Special handling for temperature
      c: 'celsius',
      f: 'fahrenheit',
      k: 'kelvin'
    },
    area: {
      // Base unit: square meter
      m2: 1,
      km2: 0.000001,
      cm2: 10000,
      mm2: 1000000,
      ha: 0.0001,
      ac: 0.000247105,
      mi2: 0.000000386102,
      yd2: 1.19599,
      ft2: 10.7639,
      in2: 1550.0031
    },
    volume: {
      // Base unit: liter
      l: 1,
      ml: 1000,
      m3: 0.001,
      cm3: 1000,
      gal: 0.264172,
      qt: 1.05669,
      pt: 2.11338,
      fl_oz: 33.814,
      cup: 4.22675,
      tbsp: 67.628,
      tsp: 202.884
    },
    time: {
      // Base unit: second
      s: 1,
      min: 1/60,
      h: 1/3600,
      d: 1/86400,
      week: 1/604800,
      month: 1/2592000,
      year: 1/31536000,
      ms: 1000,
      μs: 1000000,
      ns: 1000000000
    },
    speed: {
      // Base unit: meter/second
      m_s: 1,
      km_h: 3.6,
      mph: 2.23694,
      knot: 1.94384,
      ft_s: 3.28084,
      c: 299792458
    },
    data: {
      // Base unit: byte
      b: 1,
      kb: 1000,
      mb: 1000000,
      gb: 1000000000,
      tb: 1000000000000,
      pb: 1000000000000000,
      kib: 1024,
      mib: 1048576,
      gib: 1073741824,
      tib: 1099511627776,
      pib: 1125899906842624
    },
    angle: {
      // Base unit: degree
      deg: 1,
      rad: 180/Math.PI,
      grad: 0.9,
      turn: 360,
      arcmin: 1/60,
      arcsec: 1/3600
    },
    pressure: {
      // Base unit: pascal
      pa: 1,
      kpa: 0.001,
      mpa: 0.000001,
      bar: 0.00001,
      atm: 0.00000986923,
      mmhg: 0.00750062,
      psi: 0.000145038,
      torr: 0.00750062
    },
    energy: {
      // Base unit: joule
      j: 1,
      kj: 0.001,
      mj: 0.000001,
      cal: 0.239006,
      kcal: 0.000239006,
      wh: 0.000277778,
      kwh: 0.000000277778,
      ev: 6241506479963200000,
      btu: 0.000947817
    }
  };

  // If category is specified, use that category
  if (category && unitData[category]) {
    const categoryData = unitData[category];
    if (categoryData[fromUnit] && categoryData[toUnit]) {
      return {
        category,
        fromUnit,
        toUnit,
        factor: categoryData[toUnit] / categoryData[fromUnit],
        type: 'linear'
      };
    }
  }

  // If no category specified, search all categories
  for (const [cat, units] of Object.entries(unitData)) {
    if (units[fromUnit] && units[toUnit]) {
      return {
        category: cat,
        fromUnit,
        toUnit,
        factor: units[toUnit] / units[fromUnit],
        type: 'linear'
      };
    }
  }

  // Special handling for temperature
  if ((fromUnit === 'c' || fromUnit === 'f' || fromUnit === 'k') && 
      (toUnit === 'c' || toUnit === 'f' || toUnit === 'k')) {
    return {
      category: 'temperature',
      fromUnit,
      toUnit,
      type: 'temperature'
    };
  }

  return null;
}

function performConversion(value: number, conversionData: any, precision: number, showSteps: boolean): any {
  const steps: any[] = [];
  let result: number;
  let formula: string;

  if (conversionData.type === 'temperature') {
    // Temperature conversion formulas
    switch (`${conversionData.fromUnit}_to_${conversionData.toUnit}`) {
      case 'c_to_f':
        result = (value * 9/5) + 32;
        formula = `°F = (°C × 9/5) + 32`;
        break;
      case 'f_to_c':
        result = (value - 32) * 5/9;
        formula = `°C = (°F - 32) × 5/9`;
        break;
      case 'c_to_k':
        result = value + 273.15;
        formula = `K = °C + 273.15`;
        break;
      case 'k_to_c':
        result = value - 273.15;
        formula = `°C = K - 273.15`;
        break;
      case 'f_to_k':
        result = (value - 32) * 5/9 + 273.15;
        formula = `K = (°F - 32) × 5/9 + 273.15`;
        break;
      case 'k_to_f':
        result = (value - 273.15) * 9/5 + 32;
        formula = `°F = (K - 273.15) × 9/5 + 32`;
        break;
      default:
        result = value; // Same unit
        formula = 'No conversion needed';
    }
  } else {
    // Linear conversion
    result = value * conversionData.factor;
    formula = `${conversionData.toUnit} = ${conversionData.fromUnit} × ${conversionData.factor}`;
  }

  // Round to specified precision
  const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);

  if (showSteps) {
    steps.push({
      step: 'input',
      description: `Input value: ${value} ${conversionData.fromUnit}`,
      value: value
    });

    if (conversionData.type === 'temperature') {
      steps.push({
        step: 'formula',
        description: `Using formula: ${formula}`,
        formula: formula
      });
    } else {
      steps.push({
        step: 'conversion_factor',
        description: `Conversion factor: ${conversionData.factor}`,
        factor: conversionData.factor
      });
    }

    steps.push({
      step: 'calculation',
      description: `Calculation: ${value} × ${conversionData.type === 'temperature' ? 'formula applied' : conversionData.factor}`,
      result: result
    });

    steps.push({
      step: 'rounding',
      description: `Rounded to ${precision} decimal places`,
      result: roundedResult
    });
  }

  return {
    result: roundedResult,
    formula,
    steps: showSteps ? steps : undefined
  };
}

function getConversionInfo(conversionData: any, inputValue: number, outputValue: number): any {
  const info = {
    category: conversionData.category,
    conversionType: conversionData.type,
    inputUnit: conversionData.fromUnit,
    outputUnit: conversionData.toUnit,
    ratio: outputValue / inputValue,
    difference: outputValue - inputValue,
    percentageChange: ((outputValue - inputValue) / inputValue) * 100
  };

  // Add category-specific information
  switch (conversionData.category) {
    case 'length':
      info.description = 'Length measurement conversion';
      info.commonUses = ['Construction', 'Engineering', 'Science', 'Everyday measurements'];
      break;
    case 'weight':
      info.description = 'Weight/Mass measurement conversion';
      info.commonUses = ['Cooking', 'Shipping', 'Science', 'Health'];
      break;
    case 'temperature':
      info.description = 'Temperature scale conversion';
      info.commonUses = ['Weather', 'Cooking', 'Science', 'HVAC'];
      info.referencePoints = {
        'Water freezing (C)': 0,
        'Water freezing (F)': 32,
        'Water freezing (K)': 273.15,
        'Water boiling (C)': 100,
        'Water boiling (F)': 212,
        'Water boiling (K)': 373.15,
        'Absolute zero (C)': -273.15,
        'Absolute zero (F)': -459.67,
        'Absolute zero (K)': 0
      };
      break;
    case 'area':
      info.description = 'Area measurement conversion';
      info.commonUses = ['Real estate', 'Agriculture', 'Construction', 'Geography'];
      break;
    case 'volume':
      info.description = 'Volume measurement conversion';
      info.commonUses = ['Cooking', 'Chemistry', 'Shipping', 'Manufacturing'];
      break;
    case 'time':
      info.description = 'Time unit conversion';
      info.commonUses = ['Scheduling', 'Science', 'Sports', 'Project management'];
      break;
    case 'speed':
      info.description = 'Speed/Velocity conversion';
      info.commonUses = ['Transportation', 'Sports', 'Weather', 'Physics'];
      break;
    case 'data':
      info.description = 'Data storage conversion';
      info.commonUses = ['Computing', 'Data storage', 'Network bandwidth', 'File sizes'];
      break;
    case 'angle':
      info.description = 'Angle measurement conversion';
      info.commonUses = ['Mathematics', 'Engineering', 'Navigation', 'Astronomy'];
      break;
    case 'pressure':
      info.description = 'Pressure measurement conversion';
      info.commonUses = ['Weather', 'Engineering', 'Medicine', 'Automotive'];
      break;
    case 'energy':
      info.description = 'Energy measurement conversion';
      info.commonUses = ['Physics', 'Engineering', 'Nutrition', 'Utilities'];
      break;
  }

  return info;
}

export async function GET() {
  return NextResponse.json({
    message: 'Unit Converter API',
    usage: 'POST /api/converters/unit-converter',
    parameters: {
      value: 'Value to convert (required)',
      fromUnit: 'Source unit (required)',
      toUnit: 'Target unit (required)',
      category: 'Conversion category (optional, auto-detected if not specified)',
      precision: 'Decimal precision (0-15, default: 6) - optional',
      showConversionSteps: 'Show detailed conversion steps (default: false) - optional'
    },
    categories: {
      length: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in', 'nmi', 'Å'],
      weight: ['kg', 'g', 'mg', 'lb', 'oz', 'st', 'ton', 't', 'ct'],
      temperature: ['c', 'f', 'k'],
      area: ['m2', 'km2', 'cm2', 'mm2', 'ha', 'ac', 'mi2', 'yd2', 'ft2', 'in2'],
      volume: ['l', 'ml', 'm3', 'cm3', 'gal', 'qt', 'pt', 'fl_oz', 'cup', 'tbsp', 'tsp'],
      time: ['s', 'min', 'h', 'd', 'week', 'month', 'year', 'ms', 'μs', 'ns'],
      speed: ['m_s', 'km_h', 'mph', 'knot', 'ft_s', 'c'],
      data: ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'kib', 'mib', 'gib', 'tib', 'pib'],
      angle: ['deg', 'rad', 'grad', 'turn', 'arcmin', 'arcsec'],
      pressure: ['pa', 'kpa', 'mpa', 'bar', 'atm', 'mmhg', 'psi', 'torr'],
      energy: ['j', 'kj', 'mj', 'cal', 'kcal', 'wh', 'kwh', 'ev', 'btu']
    },
    examples: [
      {
        value: 100,
        fromUnit: 'km',
        toUnit: 'mi',
        category: 'length'
      },
      {
        value: 32,
        fromUnit: 'f',
        toUnit: 'c',
        category: 'temperature',
        showConversionSteps: true
      },
      {
        value: 1,
        fromUnit: 'kg',
        toUnit: 'lb',
        category: 'weight'
      },
      {
        value: 1024,
        fromUnit: 'mb',
        toUnit: 'gb',
        category: 'data'
      }
    ]
  });
}