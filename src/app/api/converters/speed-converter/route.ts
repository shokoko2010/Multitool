import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { value, fromUnit, toUnit, precision = 4 } = await request.json()

    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Value is required' },
        { status: 400 }
      )
    }

    if (typeof value !== 'number' || isNaN(value)) {
      return NextResponse.json(
        { success: false, error: 'Value must be a valid number' },
        { status: 400 }
      )
    }

    if (!fromUnit || !toUnit) {
      return NextResponse.json(
        { success: false, error: 'Both fromUnit and toUnit are required' },
        { status: 400 }
      )
    }

    if (typeof precision !== 'number' || precision < 0 || precision > 10) {
      return NextResponse.json(
        { success: false, error: 'Precision must be a number between 0 and 10' },
        { status: 400 }
      )
    }

    // Speed conversion factors to meters per second (base unit)
    const speedUnits: Record<string, number> = {
      // Metric units
      'meter-per-second': 1,
      'm/s': 1,
      'kilometer-per-hour': 0.2777777777777778,
      'km/h': 0.2777777777777778,
      'kmph': 0.2777777777777778,
      'centimeter-per-second': 0.01,
      'cm/s': 0.01,
      'millimeter-per-second': 0.001,
      'mm/s': 0.001,
      'kilometer-per-second': 1000,
      'km/s': 1000,
      
      // Imperial/US units
      'mile-per-hour': 0.44704,
      'mph': 0.44704,
      'foot-per-second': 0.3048,
      'ft/s': 0.3048,
      'foot-per-minute': 0.00508,
      'ft/min': 0.00508,
      'inch-per-second': 0.0254,
      'in/s': 0.0254,
      'inch-per-minute': 0.0004233333333333333,
      'in/min': 0.0004233333333333333,
      'yard-per-second': 0.9144,
      'yd/s': 0.9144,
      'mile-per-minute': 26.8224,
      'mi/min': 26.8224,
      'mile-per-second': 1609.344,
      'mi/s': 1609.344,
      'knot': 0.5144444444444444,
      'kt': 0.5144444444444444,
      'nautical-mile-per-hour': 0.5144444444444444,
      
      // Other units
      'speed-of-light': 299792458,
      'c': 299792458,
      'mach': 343, // At sea level, 20°C
      'ma': 343,
      'beaufort': 0.836, // Approximate conversion for Beaufort scale
      'bft': 0.836,
      'kilometer-per-minute': 16.666666666666668,
      'km/min': 16.666666666666668
    }

    // Validate units
    const normalizedFromUnit = fromUnit.toLowerCase()
    const normalizedToUnit = toUnit.toLowerCase()

    if (!speedUnits[normalizedFromUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid fromUnit: ${fromUnit}. Supported units: ${Object.keys(speedUnits).join(', ')}` },
        { status: 400 }
      )
    }

    if (!speedUnits[normalizedToUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid toUnit: ${toUnit}. Supported units: ${Object.keys(speedUnits).join(', ')}` },
        { status: 400 }
      )
    }

    // Perform conversion
    const metersPerSecond = value * speedUnits[normalizedFromUnit]
    const result = metersPerSecond / speedUnits[normalizedToUnit]
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision)

    // Initialize ZAI SDK for enhanced conversion analysis
    const zai = await ZAI.create()

    // Use AI to provide contextual information about the conversion
    const systemPrompt = `You are a speed conversion expert. Analyze the speed conversion that was performed.

    Conversion: ${value} ${fromUnit} to ${toUnit}
    Result: ${roundedResult}
    Precision: ${precision} decimal places

    Please provide comprehensive speed conversion analysis including:
    1. Conversion accuracy and precision assessment
    2. Contextual information about the units
    3. Real-world applications and examples
    4. Conversion difficulty level
    5. Common use cases for both units
    6. Historical context of the units
    7. Conversion tips and best practices
    8. Alternative conversion methods
    9. Error margin analysis
    10. Practical applications

    Use realistic conversion analysis based on common speed measurement practices.
    Return the response in JSON format with the following structure:
    {
      "conversion": {
        "fromValue": number,
        "fromUnit": "string",
        "toValue": number,
        "toUnit": "string",
        "precision": number,
        "formula": "string",
        "accuracy": "exact" | "approximate"
      },
      "units": {
        "fromUnit": {
          "name": "string",
          "category": "metric" | "imperial" | "scientific" | "nautical",
          "system": "string",
          "commonUses": array,
          "relativeSpeed": "string"
        },
        "toUnit": {
          "name": "string",
          "category": "metric" | "imperial" | "scientific" | "nautical",
          "system": "string",
          "commonUses": array,
          "relativeSpeed": "string"
        }
      },
      "analysis": {
        "complexity": "simple" | "moderate" | "complex",
        "precisionLevel": "high" | "medium" | "low",
        "realWorldContext": string,
        "applications": array,
        "difficulty": "easy" | "moderate" | "difficult"
      },
      "context": {
        "examples": array,
        "comparisons": array,
        "historicalNote": string,
        "practicalTips": array
      },
      "alternatives": {
        "relatedUnits": array,
        "conversionPaths": array,
        "tools": array
      },
      "summary": {
        "keyInsight": string,
        "recommendation": string,
        "confidence": "low" | "medium" | "high"
      }
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Analyze speed conversion: ${value} ${fromUnit} to ${toUnit}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1200
    })

    let analysis
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      analysis = JSON.parse(content)
      
      analysis.conversion = {
        ...analysis.conversion,
        fromValue: value,
        fromUnit: fromUnit,
        toValue: roundedResult,
        toUnit: toUnit,
        precision: precision,
        formula: `${value} × (${speedUnits[normalizedFromUnit]} / ${speedUnits[normalizedToUnit]})`,
        accuracy: 'exact'
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const unitCategory = (unit: string) => {
        const metric = ['meter-per-second', 'm/s', 'kilometer-per-hour', 'km/h', 'kmph', 'centimeter-per-second', 'cm/s']
        const imperial = ['mile-per-hour', 'mph', 'foot-per-second', 'ft/s', 'foot-per-minute', 'ft/min']
        const nautical = ['knot', 'kt', 'nautical-mile-per-hour']
        const scientific = ['speed-of-light', 'c', 'mach', 'ma']
        
        if (metric.includes(unit)) return 'metric'
        if (imperial.includes(unit)) return 'imperial'
        if (nautical.includes(unit)) return 'nautical'
        if (scientific.includes(unit)) return 'scientific'
        return 'other'
      }
      
      analysis = {
        conversion: {
          fromValue: value,
          fromUnit: fromUnit,
          toValue: roundedResult,
          toUnit: toUnit,
          precision: precision,
          formula: `${value} × (${speedUnits[normalizedFromUnit]} / ${speedUnits[normalizedToUnit]})`,
          accuracy: 'exact'
        },
        units: {
          fromUnit: {
            name: fromUnit,
            category: unitCategory(normalizedFromUnit),
            system: unitCategory(normalizedFromUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedFromUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedFromUnit) === 'nautical' ? 'Nautical' : 
                   unitCategory(normalizedFromUnit) === 'scientific' ? 'Scientific' : 'Other',
            commonUses: getSpeedCommonUses(normalizedFromUnit),
            relativeSpeed: getSpeedRelativeSize(normalizedFromUnit, value)
          },
          toUnit: {
            name: toUnit,
            category: unitCategory(normalizedToUnit),
            system: unitCategory(normalizedToUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedToUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedToUnit) === 'nautical' ? 'Nautical' : 
                   unitCategory(normalizedToUnit) === 'scientific' ? 'Scientific' : 'Other',
            commonUses: getSpeedCommonUses(normalizedToUnit),
            relativeSpeed: getSpeedRelativeSize(normalizedToUnit, roundedResult)
          }
        },
        analysis: {
          complexity: 'simple',
          precisionLevel: precision > 6 ? 'high' : precision > 3 ? 'medium' : 'low',
          realWorldContext: `Converting ${value} ${fromUnit} to ${toUnit} is commonly used in ${getSpeedCommonContext(normalizedFromUnit, normalizedToUnit)}`,
          applications: [
            'Transportation and travel',
            'Sports and athletics',
            'Weather and wind speed',
            'Engineering and physics'
          ],
          difficulty: 'easy'
        },
        context: {
          examples: [
            `${value} ${fromUnit} is approximately ${roundedResult} ${toUnit}`,
            `This conversion is frequently used in ${getSpeedCommonContext(normalizedFromUnit, normalizedToUnit)}`
          ],
          comparisons: [
            `1 ${fromUnit} = ${speedUnits[normalizedFromUnit]} m/s`,
            `1 ${toUnit} = ${speedUnits[normalizedToUnit]} m/s`
          ],
          historicalNote: `${fromUnit} and ${toUnit} are used in different contexts for speed measurement`,
          practicalTips: [
            'Use appropriate units for your application',
            'Consider precision requirements',
            'Be aware of different measurement systems'
          ]
        },
        alternatives: {
          relatedUnits: Object.keys(speedUnits).slice(0, 10),
          conversionPaths: [
            'Direct conversion using conversion factors',
            'Convert via base unit (meters per second)',
            'Use speedometer with unit conversion'
          ],
          tools: [
            'GPS devices',
            'Speedometers',
            'Conversion calculators'
          ]
        },
        summary: {
          keyInsight: `${fromUnit} to ${toUnit} conversion follows standard speed measurement principles`,
          recommendation: 'Use this conversion for accurate speed measurements across different systems',
          confidence: 'high'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        conversion: {
          from: {
            value: value,
            unit: fromUnit
          },
          to: {
            value: roundedResult,
            unit: toUnit
          },
          precision: precision,
          formula: `${value} × (${speedUnits[normalizedFromUnit]} / ${speedUnits[normalizedToUnit]})`,
          timestamp: new Date().toISOString()
        },
        analysis: analysis,
        supportedUnits: Object.keys(speedUnits)
      }
    })

  } catch (error) {
    console.error('Speed Converter Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform speed conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getSpeedCommonUses(unit: string): string[] {
  const uses: Record<string, string[]> = {
    'meter-per-second': ['Physics', 'Engineering', 'Scientific research'],
    'kilometer-per-hour': ['Road speed limits', 'Weather', 'Everyday use'],
    'mile-per-hour': ['Road speeds (US/UK)', 'Aviation', 'Marine'],
    'knot': ['Aviation', 'Marine navigation', 'Meteorology'],
    'mach': ['Aviation', 'Aerospace', 'High-speed flight'],
    'foot-per-second': ['Ballistics', 'Engineering', 'Sports'],
    'speed-of-light': ['Physics', 'Astronomy', 'Telecommunications']
  }
  
  return uses[unit] || ['General speed measurement', 'Various applications']
}

function getSpeedRelativeSize(unit: string, value: number): string {
  if (unit === 'speed-of-light' || unit === 'c') {
    return value > 0.1 ? 'Relativistic' : 'Sub-light speed'
  }
  
  if (unit === 'mach' || unit === 'ma') {
    if (value > 5) return 'Hypersonic'
    if (value > 1) return 'Supersonic'
    return 'Subsonic'
  }
  
  if (unit === 'kilometer-per-hour' || unit === 'km/h' || unit === 'kmph') {
    if (value > 1000) return 'Very high speed'
    if (value > 200) return 'High speed'
    if (value > 60) return 'Moderate speed'
    return 'Low speed'
  }
  
  if (unit === 'mile-per-hour' || unit === 'mph') {
    if (value > 600) return 'Very high speed'
    if (value > 120) return 'High speed'
    if (value > 40) return 'Moderate speed'
    return 'Low speed'
  }
  
  if (unit === 'knot' || unit === 'kt') {
    if (value > 500) return 'Very high speed'
    if (value > 100) return 'High speed'
    if (value > 30) return 'Moderate speed'
    return 'Low speed'
  }
  
  return 'Variable speed'
}

function getSpeedCommonContext(fromUnit: string, toUnit: string): string {
  const contexts: Record<string, string> = {
    'kilometer-per-hour-mile-per-hour': 'international travel and speed limits',
    'mile-per-hour-kilometer-per-hour': 'US/international speed conversion',
    'meter-per-second-kilometer-per-hour': 'scientific to everyday speed conversion',
    'knot-mile-per-hour': 'maritime and aviation navigation',
    'mach-kilometer-per-hour': 'aviation and aerospace',
    'foot-per-second-meter-per-second': 'engineering and ballistics'
  }
  
  const key = `${fromUnit}-${toUnit}`
  return contexts[key] || 'various transportation and scientific applications'
}