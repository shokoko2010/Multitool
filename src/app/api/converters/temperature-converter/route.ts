import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { value, fromUnit, toUnit, precision = 2 } = await request.json()

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

    // Temperature conversion functions (to Kelvin as base unit)
    const toKelvin: Record<string, (value: number) => number> = {
      'celsius': (value) => value + 273.15,
      'c': (value) => value + 273.15,
      'fahrenheit': (value) => (value + 459.67) * 5/9,
      'f': (value) => (value + 459.67) * 5/9,
      'kelvin': (value) => value,
      'k': (value) => value,
      'rankine': (value) => value * 5/9,
      'r': (value) => value * 5/9,
      'delisle': (value) => 373.15 - value * 2/3,
      'de': (value) => 373.15 - value * 2/3,
      'newton': (value) => value * 100/33 + 273.15,
      'n': (value) => value * 100/33 + 273.15,
      'réaumur': (value) => value * 5/4 + 273.15,
      're': (value) => value * 5/4 + 273.15,
      'rømer': (value) => (value - 7.5) * 40/21 + 273.15,
      'ro': (value) => (value - 7.5) * 40/21 + 273.15
    }

    const fromKelvin: Record<string, (value: number) => number> = {
      'celsius': (value) => value - 273.15,
      'c': (value) => value - 273.15,
      'fahrenheit': (value) => value * 9/5 - 459.67,
      'f': (value) => value * 9/5 - 459.67,
      'kelvin': (value) => value,
      'k': (value) => value,
      'rankine': (value) => value * 9/5,
      'r': (value) => value * 9/5,
      'delisle': (value) => (373.15 - value) * 3/2,
      'de': (value) => (373.15 - value) * 3/2,
      'newton': (value) => (value - 273.15) * 33/100,
      'n': (value) => (value - 273.15) * 33/100,
      'réaumur': (value) => (value - 273.15) * 4/5,
      're': (value) => (value - 273.15) * 4/5,
      'rømer': (value) => (value - 273.15) * 21/40 + 7.5,
      'ro': (value) => (value - 273.15) * 21/40 + 7.5
    }

    // Validate units
    const normalizedFromUnit = fromUnit.toLowerCase()
    const normalizedToUnit = toUnit.toLowerCase()

    if (!toKelvin[normalizedFromUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid fromUnit: ${fromUnit}. Supported units: ${Object.keys(toKelvin).join(', ')}` },
        { status: 400 }
      )
    }

    if (!fromKelvin[normalizedToUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid toUnit: ${toUnit}. Supported units: ${Object.keys(fromKelvin).join(', ')}` },
        { status: 400 }
      )
    }

    // Perform conversion
    const kelvin = toKelvin[normalizedFromUnit](value)
    const result = fromKelvin[normalizedToUnit](kelvin)
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision)

    // Initialize ZAI SDK for enhanced conversion analysis
    const zai = await ZAI.create()

    // Use AI to provide contextual information about the conversion
    const systemPrompt = `You are a temperature conversion expert. Analyze the temperature conversion that was performed.

    Conversion: ${value} ${fromUnit} to ${toUnit}
    Result: ${roundedResult}
    Precision: ${precision} decimal places

    Please provide comprehensive temperature conversion analysis including:
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

    Use realistic conversion analysis based on common temperature measurement practices.
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
          "category": "metric" | "imperial" | "scientific" | "historical",
          "system": "string",
          "commonUses": array,
          "referencePoints": array
        },
        "toUnit": {
          "name": "string",
          "category": "metric" | "imperial" | "scientific" | "historical",
          "system": "string",
          "commonUses": array,
          "referencePoints": array
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
          content: `Analyze temperature conversion: ${value} ${fromUnit} to ${toUnit}`
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
        formula: getTemperatureFormula(normalizedFromUnit, normalizedToUnit),
        accuracy: 'exact'
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const unitCategory = (unit: string) => {
        const metric = ['celsius', 'c', 'kelvin', 'k']
        const imperial = ['fahrenheit', 'f', 'rankine', 'r']
        const historical = ['delisle', 'de', 'newton', 'n', 'réaumur', 're', 'rømer', 'ro']
        
        if (metric.includes(unit)) return 'metric'
        if (imperial.includes(unit)) return 'imperial'
        if (historical.includes(unit)) return 'historical'
        return 'scientific'
      }
      
      analysis = {
        conversion: {
          fromValue: value,
          fromUnit: fromUnit,
          toValue: roundedResult,
          toUnit: toUnit,
          precision: precision,
          formula: getTemperatureFormula(normalizedFromUnit, normalizedToUnit),
          accuracy: 'exact'
        },
        units: {
          fromUnit: {
            name: fromUnit,
            category: unitCategory(normalizedFromUnit),
            system: unitCategory(normalizedFromUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedFromUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedFromUnit) === 'historical' ? 'Historical' : 'Scientific',
            commonUses: getTemperatureCommonUses(normalizedFromUnit),
            referencePoints: getTemperatureReferencePoints(normalizedFromUnit)
          },
          toUnit: {
            name: toUnit,
            category: unitCategory(normalizedToUnit),
            system: unitCategory(normalizedToUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedToUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedToUnit) === 'historical' ? 'Historical' : 'Scientific',
            commonUses: getTemperatureCommonUses(normalizedToUnit),
            referencePoints: getTemperatureReferencePoints(normalizedToUnit)
          }
        },
        analysis: {
          complexity: 'simple',
          precisionLevel: precision > 4 ? 'high' : precision > 2 ? 'medium' : 'low',
          realWorldContext: `Converting ${value} ${fromUnit} to ${toUnit} is commonly used in ${getTemperatureCommonContext(normalizedFromUnit, normalizedToUnit)}`,
          applications: [
            'Weather forecasting',
            'Cooking and food safety',
            'Scientific research',
            'Climate monitoring'
          ],
          difficulty: 'easy'
        },
        context: {
          examples: [
            `${value}°${fromUnit.charAt(0).toUpperCase()} is approximately ${roundedResult}°${toUnit.charAt(0).toUpperCase()}`,
            `This conversion is essential for ${getTemperatureCommonContext(normalizedFromUnit, normalizedToUnit)}`
          ],
          comparisons: [
            `Water freezes at ${getFreezingPoint(normalizedFromUnit)}°${fromUnit.charAt(0).toUpperCase()}`,
            `Water boils at ${getBoilingPoint(normalizedFromUnit)}°${fromUnit.charAt(0).toUpperCase()}`
          ],
          historicalNote: `${fromUnit} and ${toUnit} scales were developed at different times for different purposes`,
          practicalTips: [
            'Use appropriate units for your region and application',
            'Be precise in scientific and medical contexts',
            'Understand the reference points of each scale'
          ]
        },
        alternatives: {
          relatedUnits: Object.keys(toKelvin).slice(0, 8),
          conversionPaths: [
            'Direct conversion formula',
            'Convert via Kelvin (absolute temperature)',
            'Use digital thermometers with unit conversion'
          ],
          tools: [
            'Digital thermometers',
            'Weather apps',
            'Conversion calculators'
          ]
        },
        summary: {
          keyInsight: `${fromUnit} to ${toUnit} conversion requires understanding different temperature scale reference points`,
          recommendation: 'Use this conversion for accurate temperature measurements across different systems',
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
          formula: getTemperatureFormula(normalizedFromUnit, normalizedToUnit),
          timestamp: new Date().toISOString()
        },
        analysis: analysis,
        supportedUnits: Object.keys(toKelvin)
      }
    })

  } catch (error) {
    console.error('Temperature Converter Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform temperature conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getTemperatureFormula(fromUnit: string, toUnit: string): string {
  const formulas: Record<string, string> = {
    'celsius-fahrenheit': '°F = (°C × 9/5) + 32',
    'fahrenheit-celsius': '°C = (°F - 32) × 5/9',
    'celsius-kelvin': 'K = °C + 273.15',
    'kelvin-celsius': '°C = K - 273.15',
    'fahrenheit-kelvin': 'K = (°F + 459.67) × 5/9',
    'kelvin-fahrenheit': '°F = K × 9/5 - 459.67'
  }
  
  const key = `${fromUnit}-${toUnit}`
  return formulas[key] || 'Complex conversion formula'
}

function getTemperatureCommonUses(unit: string): string[] {
  const uses: Record<string, string[]> = {
    'celsius': ['Weather', 'Scientific research', 'Most countries daily use'],
    'fahrenheit': ['Weather (US)', 'Cooking', 'Body temperature'],
    'kelvin': ['Scientific research', 'Physics', 'Absolute temperature'],
    'rankine': ['Engineering', 'Thermodynamics'],
    'delisle': ['Historical scientific use'],
    'newton': ['Historical temperature measurement'],
    'réaumur': ['Historical European use'],
    'rømer': ['Historical temperature measurement']
  }
  
  return uses[unit] || ['General temperature measurement']
}

function getTemperatureReferencePoints(unit: string): string[] {
  const referencePoints: Record<string, string[]> = {
    'celsius': ['Water freezes: 0°C', 'Water boils: 100°C', 'Room temperature: ~20°C'],
    'fahrenheit': ['Water freezes: 32°F', 'Water boils: 212°F', 'Room temperature: ~68°F'],
    'kelvin': ['Absolute zero: 0K', 'Water freezes: 273.15K', 'Water boils: 373.15K'],
    'rankine': ['Absolute zero: 0°R', 'Water freezes: 491.67°R', 'Water boils: 671.67°R']
  }
  
  return referencePoints[unit] || ['Reference points vary by scale']
}

function getTemperatureCommonContext(fromUnit: string, toUnit: string): string {
  const contexts: Record<string, string> = {
    'celsius-fahrenheit': 'international weather and cooking',
    'fahrenheit-celsius': 'US weather and scientific contexts',
    'celsius-kelvin': 'scientific and engineering applications',
    'kelvin-celsius': 'scientific research and education',
    'fahrenheit-kelvin': 'thermodynamics and engineering',
    'kelvin-fahrenheit': 'scientific to practical applications'
  }
  
  const key = `${fromUnit}-${toUnit}`
  return contexts[key] || 'various scientific and practical applications'
}

function getFreezingPoint(unit: string): number {
  const freezingPoints: Record<string, number> = {
    'celsius': 0,
    'fahrenheit': 32,
    'kelvin': 273.15,
    'rankine': 491.67
  }
  
  return freezingPoints[unit] || 0
}

function getBoilingPoint(unit: string): number {
  const boilingPoints: Record<string, number> = {
    'celsius': 100,
    'fahrenheit': 212,
    'kelvin': 373.15,
    'rankine': 671.67
  }
  
  return boilingPoints[unit] || 100
}