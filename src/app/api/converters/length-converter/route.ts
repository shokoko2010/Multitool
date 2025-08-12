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

    // Length conversion factors to meters (base unit)
    const lengthUnits: Record<string, number> = {
      // Metric units
      'meter': 1,
      'm': 1,
      'kilometer': 1000,
      'km': 1000,
      'centimeter': 0.01,
      'cm': 0.01,
      'millimeter': 0.001,
      'mm': 0.001,
      'micrometer': 0.000001,
      'μm': 0.000001,
      'nanometer': 0.000000001,
      'nm': 0.000000001,
      'decimeter': 0.1,
      'dm': 0.1,
      'dekameter': 10,
      'dam': 10,
      'hectometer': 100,
      'hm': 100,
      
      // Imperial/US units
      'inch': 0.0254,
      'in': 0.0254,
      'foot': 0.3048,
      'ft': 0.3048,
      'yard': 0.9144,
      'yd': 0.9144,
      'mile': 1609.344,
      'mi': 1609.344,
      'nautical-mile': 1852,
      'nmi': 1852,
      
      // Other units
      'light-year': 9460730472580800,
      'ly': 9460730472580800,
      'astronomical-unit': 149597870700,
      'au': 149597870700,
      'parsec': 30856775814913673,
      'pc': 30856775814913673,
      'furlong': 201.168,
      'chain': 20.1168,
      'rod': 5.0292,
      'fathom': 1.8288,
      'cable': 185.2,
      'league': 4828.032
    }

    // Validate units
    const normalizedFromUnit = fromUnit.toLowerCase()
    const normalizedToUnit = toUnit.toLowerCase()

    if (!lengthUnits[normalizedFromUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid fromUnit: ${fromUnit}. Supported units: ${Object.keys(lengthUnits).join(', ')}` },
        { status: 400 }
      )
    }

    if (!lengthUnits[normalizedToUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid toUnit: ${toUnit}. Supported units: ${Object.keys(lengthUnits).join(', ')}` },
        { status: 400 }
      )
    }

    // Perform conversion
    const meters = value * lengthUnits[normalizedFromUnit]
    const result = meters / lengthUnits[normalizedToUnit]
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision)

    // Initialize ZAI SDK for enhanced conversion analysis
    const zai = await ZAI.create()

    // Use AI to provide contextual information about the conversion
    const systemPrompt = `You are a unit conversion expert. Analyze the length conversion that was performed.

    Conversion: ${value} ${fromUnit} to ${toUnit}
    Result: ${roundedResult}
    Precision: ${precision} decimal places

    Please provide comprehensive length conversion analysis including:
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

    Use realistic conversion analysis based on common length measurement practices.
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
          "category": "metric" | "imperial" | "other",
          "system": "string",
          "commonUses": array,
          "relativeSize": "string"
        },
        "toUnit": {
          "name": "string",
          "category": "metric" | "imperial" | "other",
          "system": "string",
          "commonUses": array,
          "relativeSize": "string"
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
          content: `Analyze length conversion: ${value} ${fromUnit} to ${toUnit}`
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
        formula: `${value} × (${lengthUnits[normalizedFromUnit]} / ${lengthUnits[normalizedToUnit]})`,
        accuracy: 'exact'
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const unitCategory = (unit: string) => {
        const metric = ['meter', 'm', 'kilometer', 'km', 'centimeter', 'cm', 'millimeter', 'mm']
        const imperial = ['inch', 'in', 'foot', 'ft', 'yard', 'yd', 'mile', 'mi']
        
        if (metric.includes(unit)) return 'metric'
        if (imperial.includes(unit)) return 'imperial'
        return 'other'
      }
      
      analysis = {
        conversion: {
          fromValue: value,
          fromUnit: fromUnit,
          toValue: roundedResult,
          toUnit: toUnit,
          precision: precision,
          formula: `${value} × (${lengthUnits[normalizedFromUnit]} / ${lengthUnits[normalizedToUnit]})`,
          accuracy: 'exact'
        },
        units: {
          fromUnit: {
            name: fromUnit,
            category: unitCategory(normalizedFromUnit),
            system: unitCategory(normalizedFromUnit) === 'metric' ? 'Metric' : unitCategory(normalizedFromUnit) === 'imperial' ? 'Imperial' : 'Other',
            commonUses: getCommonUses(normalizedFromUnit),
            relativeSize: getRelativeSize(normalizedFromUnit)
          },
          toUnit: {
            name: toUnit,
            category: unitCategory(normalizedToUnit),
            system: unitCategory(normalizedToUnit) === 'metric' ? 'Metric' : unitCategory(normalizedToUnit) === 'imperial' ? 'Imperial' : 'Other',
            commonUses: getCommonUses(normalizedToUnit),
            relativeSize: getRelativeSize(normalizedToUnit)
          }
        },
        analysis: {
          complexity: 'simple',
          precisionLevel: precision > 6 ? 'high' : precision > 3 ? 'medium' : 'low',
          realWorldContext: `Converting ${value} ${fromUnit} to ${toUnit} is commonly used in ${getCommonContext(normalizedFromUnit, normalizedToUnit)}`,
          applications: [
            'Construction and building',
            'Manufacturing and engineering',
            'Scientific research',
            'Everyday measurements'
          ],
          difficulty: 'easy'
        },
        context: {
          examples: [
            `${value} ${fromUnit} is approximately ${roundedResult} ${toUnit}`,
            `This conversion is frequently used in ${getCommonContext(normalizedFromUnit, normalizedToUnit)}`
          ],
          comparisons: [
            `1 ${fromUnit} = ${lengthUnits[normalizedFromUnit]} meters`,
            `1 ${toUnit} = ${lengthUnits[normalizedToUnit]} meters`
          ],
          historicalNote: `${fromUnit} and ${toUnit} have different historical origins and usage patterns`,
          practicalTips: [
            'Double-check conversions for critical applications',
            'Use appropriate precision for your use case',
            'Consider the context when choosing units'
          ]
        },
        alternatives: {
          relatedUnits: Object.keys(lengthUnits).slice(0, 10),
          conversionPaths: [
            'Direct conversion using conversion factors',
            'Convert via base unit (meters)',
            'Use online conversion tools'
          ],
          tools: [
            'Digital calculators',
            'Conversion apps',
            'Physical conversion charts'
          ]
        },
        summary: {
          keyInsight: `${fromUnit} to ${toUnit} conversion is straightforward using standard conversion factors`,
          recommendation: 'Use this conversion for everyday measurements and calculations',
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
          formula: `${value} × (${lengthUnits[normalizedFromUnit]} / ${lengthUnits[normalizedToUnit]})`,
          timestamp: new Date().toISOString()
        },
        analysis: analysis,
        supportedUnits: Object.keys(lengthUnits)
      }
    })

  } catch (error) {
    console.error('Length Converter Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform length conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getCommonUses(unit: string): string[] {
  const uses: Record<string, string[]> = {
    'meter': ['Construction', 'Sports', 'Everyday measurements'],
    'kilometer': ['Distance measurement', 'Transportation', 'Geography'],
    'centimeter': ['Clothing sizes', 'Small objects', 'Precision measurements'],
    'millimeter': ['Engineering', 'Manufacturing', 'Scientific research'],
    'inch': ['Screen sizes', 'Construction', 'Imperial measurements'],
    'foot': ['Height measurement', 'Room dimensions', 'Construction'],
    'yard': ['Fabric measurement', 'Sports fields', 'Landscaping'],
    'mile': ['Road distances', 'Running tracks', 'Aviation']
  }
  
  return uses[unit] || ['General measurement', 'Various applications']
}

function getRelativeSize(unit: string): string {
  const sizes: Record<string, string> = {
    'nanometer': 'Extremely small',
    'micrometer': 'Microscopic',
    'millimeter': 'Very small',
    'centimeter': 'Small',
    'meter': 'Medium',
    'kilometer': 'Large',
    'mile': 'Very large',
    'inch': 'Small',
    'foot': 'Medium',
    'yard': 'Medium-large',
    'light-year': 'Astronomical'
  }
  
  return sizes[unit] || 'Variable'
}

function getCommonContext(fromUnit: string, toUnit: string): string {
  const contexts: Record<string, string> = {
    'meter-foot': 'construction and building',
    'kilometer-mile': 'transportation and travel',
    'centimeter-inch': 'manufacturing and product design',
    'millimeter-inch': 'engineering and precision work',
    'meter-yard': 'sports field measurements',
    'kilometer-nautical-mile': 'navigation and aviation'
  }
  
  const key = `${fromUnit}-${toUnit}`
  return contexts[key] || 'various fields and applications'
}