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

    // Weight conversion factors to kilograms (base unit)
    const weightUnits: Record<string, number> = {
      // Metric units
      'kilogram': 1,
      'kg': 1,
      'gram': 0.001,
      'g': 0.001,
      'milligram': 0.000001,
      'mg': 0.000001,
      'microgram': 0.000000001,
      'μg': 0.000000001,
      'nanogram': 0.000000000001,
      'ng': 0.000000000001,
      'tonne': 1000,
      't': 1000,
      'metric-ton': 1000,
      'quintal': 100,
      'carat': 0.0002,
      'ct': 0.0002,
      
      // Imperial/US units
      'pound': 0.45359237,
      'lb': 0.45359237,
      'ounce': 0.028349523125,
      'oz': 0.028349523125,
      'stone': 6.35029318,
      'st': 6.35029318,
      'short-ton': 907.18474,
      'us-ton': 907.18474,
      'long-ton': 1016.0469088,
      'uk-ton': 1016.0469088,
      'grain': 0.00006479891,
      'gr': 0.00006479891,
      'dram': 0.0017718451953125,
      'dr': 0.0017718451953125,
      'pennyweight': 0.00155517384,
      'dwt': 0.00155517384,
      
      // Other units
      'atomic-mass-unit': 1.66053906660e-27,
      'amu': 1.66053906660e-27,
      'dalton': 1.66053906660e-27,
      'earth-mass': 5.9722e24,
      'solar-mass': 1.9891e30,
      'electronvolt': 1.78266192e-36,
      'eV': 1.78266192e-36
    }

    // Validate units
    const normalizedFromUnit = fromUnit.toLowerCase()
    const normalizedToUnit = toUnit.toLowerCase()

    if (!weightUnits[normalizedFromUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid fromUnit: ${fromUnit}. Supported units: ${Object.keys(weightUnits).join(', ')}` },
        { status: 400 }
      )
    }

    if (!weightUnits[normalizedToUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid toUnit: ${toUnit}. Supported units: ${Object.keys(weightUnits).join(', ')}` },
        { status: 400 }
      )
    }

    // Perform conversion
    const kilograms = value * weightUnits[normalizedFromUnit]
    const result = kilograms / weightUnits[normalizedToUnit]
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision)

    // Initialize ZAI SDK for enhanced conversion analysis
    const zai = await ZAI.create()

    // Use AI to provide contextual information about the conversion
    const systemPrompt = `You are a weight conversion expert. Analyze the weight conversion that was performed.

    Conversion: ${value} ${fromUnit} to ${toUnit}
    Result: ${roundedResult}
    Precision: ${precision} decimal places

    Please provide comprehensive weight conversion analysis including:
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

    Use realistic conversion analysis based on common weight measurement practices.
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
          "category": "metric" | "imperial" | "scientific" | "other",
          "system": "string",
          "commonUses": array,
          "relativeSize": "string"
        },
        "toUnit": {
          "name": "string",
          "category": "metric" | "imperial" | "scientific" | "other",
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
          content: `Analyze weight conversion: ${value} ${fromUnit} to ${toUnit}`
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
        formula: `${value} × (${weightUnits[normalizedFromUnit]} / ${weightUnits[normalizedToUnit]})`,
        accuracy: 'exact'
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const unitCategory = (unit: string) => {
        const metric = ['kilogram', 'kg', 'gram', 'g', 'milligram', 'mg', 'tonne', 't']
        const imperial = ['pound', 'lb', 'ounce', 'oz', 'stone', 'st']
        const scientific = ['atomic-mass-unit', 'amu', 'dalton', 'electronvolt', 'eV']
        
        if (metric.includes(unit)) return 'metric'
        if (imperial.includes(unit)) return 'imperial'
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
          formula: `${value} × (${weightUnits[normalizedFromUnit]} / ${weightUnits[normalizedToUnit]})`,
          accuracy: 'exact'
        },
        units: {
          fromUnit: {
            name: fromUnit,
            category: unitCategory(normalizedFromUnit),
            system: unitCategory(normalizedFromUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedFromUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedFromUnit) === 'scientific' ? 'Scientific' : 'Other',
            commonUses: getWeightCommonUses(normalizedFromUnit),
            relativeSize: getWeightRelativeSize(normalizedFromUnit)
          },
          toUnit: {
            name: toUnit,
            category: unitCategory(normalizedToUnit),
            system: unitCategory(normalizedToUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedToUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedToUnit) === 'scientific' ? 'Scientific' : 'Other',
            commonUses: getWeightCommonUses(normalizedToUnit),
            relativeSize: getWeightRelativeSize(normalizedToUnit)
          }
        },
        analysis: {
          complexity: 'simple',
          precisionLevel: precision > 6 ? 'high' : precision > 3 ? 'medium' : 'low',
          realWorldContext: `Converting ${value} ${fromUnit} to ${toUnit} is commonly used in ${getWeightCommonContext(normalizedFromUnit, normalizedToUnit)}`,
          applications: [
            'Cooking and recipes',
            'Shipping and logistics',
            'Scientific research',
            'Health and fitness'
          ],
          difficulty: 'easy'
        },
        context: {
          examples: [
            `${value} ${fromUnit} is approximately ${roundedResult} ${toUnit}`,
            `This conversion is frequently used in ${getWeightCommonContext(normalizedFromUnit, normalizedToUnit)}`
          ],
          comparisons: [
            `1 ${fromUnit} = ${weightUnits[normalizedFromUnit]} kilograms`,
            `1 ${toUnit} = ${weightUnits[normalizedToUnit]} kilograms`
          ],
          historicalNote: `${fromUnit} and ${toUnit} have different historical origins in measurement systems`,
          practicalTips: [
            'Use appropriate units for your application',
            'Consider precision requirements',
            'Be aware of different measurement systems'
          ]
        },
        alternatives: {
          relatedUnits: Object.keys(weightUnits).slice(0, 10),
          conversionPaths: [
            'Direct conversion using conversion factors',
            'Convert via base unit (kilograms)',
            'Use digital scales with unit conversion'
          ],
          tools: [
            'Digital kitchen scales',
            'Industrial weighing equipment',
            'Conversion calculators'
          ]
        },
        summary: {
          keyInsight: `${fromUnit} to ${toUnit} conversion follows standard weight measurement principles`,
          recommendation: 'Use this conversion for accurate weight measurements across different systems',
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
          formula: `${value} × (${weightUnits[normalizedFromUnit]} / ${weightUnits[normalizedToUnit]})`,
          timestamp: new Date().toISOString()
        },
        analysis: analysis,
        supportedUnits: Object.keys(weightUnits)
      }
    })

  } catch (error) {
    console.error('Weight Converter Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform weight conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getWeightCommonUses(unit: string): string[] {
  const uses: Record<string, string[]> = {
    'kilogram': ['Body weight', 'Food packaging', 'Shipping'],
    'gram': ['Cooking ingredients', 'Small items', 'Laboratory measurements'],
    'milligram': ['Medicine', 'Chemicals', 'Precise measurements'],
    'tonne': ['Industrial shipping', 'Large quantities', 'Freight'],
    'pound': ['Body weight (US)', 'Food items', 'Shipping'],
    'ounce': ['Cooking', 'Precise measurements', 'Small packages'],
    'stone': ['Body weight (UK)', 'Personal weight tracking'],
    'carat': ['Gemstones', 'Jewelry', 'Precious metals']
  }
  
  return uses[unit] || ['General weight measurement', 'Various applications']
}

function getWeightRelativeSize(unit: string): string {
  const sizes: Record<string, string> = {
    'nanogram': 'Extremely small',
    'microgram': 'Microscopic',
    'milligram': 'Very small',
    'gram': 'Small',
    'kilogram': 'Medium',
    'tonne': 'Large',
    'pound': 'Medium',
    'ounce': 'Small',
    'stone': 'Medium-large',
    'atomic-mass-unit': 'Subatomic',
    'earth-mass': 'Planetary',
    'solar-mass': 'Stellar'
  }
  
  return sizes[unit] || 'Variable'
}

function getWeightCommonContext(fromUnit: string, toUnit: string): string {
  const contexts: Record<string, string> = {
    'kilogram-pound': 'body weight and fitness',
    'gram-ounce': 'cooking and recipes',
    'tonne-pound': 'shipping and freight',
    'milligram-gram': 'medicine and pharmaceuticals',
    'kilogram-stone': 'personal weight tracking',
    'pound-ounce': 'food packaging and cooking'
  }
  
  const key = `${fromUnit}-${toUnit}`
  return contexts[key] || 'various fields and applications'
}