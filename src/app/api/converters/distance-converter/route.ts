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

    // Distance conversion factors to meters (base unit)
    const distanceUnits: Record<string, number> = {
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
      'furlong': 201.168,
      'chain': 20.1168,
      'rod': 5.0292,
      'fathom': 1.8288,
      'cable': 185.2,
      'league': 4828.032,
      
      // Survey/Geographic units
      'survey-foot': 0.3048006096012192,
      'survey-mile': 1609.3472186944373,
      'link': 0.201168,
      'pole': 5.029210058420117,
      'perch': 5.029210058420117,
      'rope': 6.096,
      
      // Astronomical units
      'astronomical-unit': 149597870700,
      'au': 149597870700,
      'light-year': 9460730472580800,
      'ly': 9460730472580800,
      'parsec': 30856775814913673,
      'pc': 30856775814913673,
      'light-second': 299792458,
      'light-minute': 17987547480,
      'light-hour': 1079252848800,
      'light-day': 25902068371200,
      
      // Other units
      'cubit': 0.4572,
      'hand': 0.1016,
      'span': 0.2286,
      'finger': 0.022225,
      'palm': 0.0762,
      'digit': 0.01905,
      'barleycorn': 0.008466666666666667,
      'pace': 1.524,
      'ell': 1.143,
      'line': 0.0021166666666666667,
      'thou': 0.0000254
    }

    // Validate units
    const normalizedFromUnit = fromUnit.toLowerCase()
    const normalizedToUnit = toUnit.toLowerCase()

    if (!distanceUnits[normalizedFromUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid fromUnit: ${fromUnit}. Supported units: ${Object.keys(distanceUnits).join(', ')}` },
        { status: 400 }
      )
    }

    if (!distanceUnits[normalizedToUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid toUnit: ${toUnit}. Supported units: ${Object.keys(distanceUnits).join(', ')}` },
        { status: 400 }
      )
    }

    // Perform conversion
    const meters = value * distanceUnits[normalizedFromUnit]
    const result = meters / distanceUnits[normalizedToUnit]
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision)

    // Initialize ZAI SDK for enhanced conversion analysis
    const zai = await ZAI.create()

    // Use AI to provide contextual information about the conversion
    const systemPrompt = `You are a distance conversion expert. Analyze the distance conversion that was performed.

    Conversion: ${value} ${fromUnit} to ${toUnit}
    Result: ${roundedResult}
    Precision: ${precision} decimal places

    Please provide comprehensive distance conversion analysis including:
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

    Use realistic conversion analysis based on common distance measurement practices.
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
          "category": "metric" | "imperial" | "nautical" | "astronomical" | "historical",
          "system": "string",
          "commonUses": array,
          "relativeScale": "string"
        },
        "toUnit": {
          "name": "string",
          "category": "metric" | "imperial" | "nautical" | "astronomical" | "historical",
          "system": "string",
          "commonUses": array,
          "relativeScale": "string"
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
          content: `Analyze distance conversion: ${value} ${fromUnit} to ${toUnit}`
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
        formula: `${value} × (${distanceUnits[normalizedFromUnit]} / ${distanceUnits[normalizedToUnit]})`,
        accuracy: 'exact'
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const unitCategory = (unit: string) => {
        const metric = ['meter', 'm', 'kilometer', 'km', 'centimeter', 'cm', 'millimeter', 'mm']
        const imperial = ['inch', 'in', 'foot', 'ft', 'yard', 'yd', 'mile', 'mi']
        const nautical = ['nautical-mile', 'nmi', 'cable']
        const astronomical = ['astronomical-unit', 'au', 'light-year', 'ly', 'parsec', 'pc']
        const historical = ['cubit', 'hand', 'span', 'furlong', 'chain', 'rod', 'fathom']
        
        if (metric.includes(unit)) return 'metric'
        if (imperial.includes(unit)) return 'imperial'
        if (nautical.includes(unit)) return 'nautical'
        if (astronomical.includes(unit)) return 'astronomical'
        if (historical.includes(unit)) return 'historical'
        return 'other'
      }
      
      analysis = {
        conversion: {
          fromValue: value,
          fromUnit: fromUnit,
          toValue: roundedResult,
          toUnit: toUnit,
          precision: precision,
          formula: `${value} × (${distanceUnits[normalizedFromUnit]} / ${distanceUnits[normalizedToUnit]})`,
          accuracy: 'exact'
        },
        units: {
          fromUnit: {
            name: fromUnit,
            category: unitCategory(normalizedFromUnit),
            system: unitCategory(normalizedFromUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedFromUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedFromUnit) === 'nautical' ? 'Nautical' : 
                   unitCategory(normalizedFromUnit) === 'astronomical' ? 'Astronomical' : 
                   unitCategory(normalizedFromUnit) === 'historical' ? 'Historical' : 'Other',
            commonUses: getDistanceCommonUses(normalizedFromUnit),
            relativeScale: getDistanceRelativeScale(normalizedFromUnit, value)
          },
          toUnit: {
            name: toUnit,
            category: unitCategory(normalizedToUnit),
            system: unitCategory(normalizedToUnit) === 'metric' ? 'Metric' : 
                   unitCategory(normalizedToUnit) === 'imperial' ? 'Imperial' : 
                   unitCategory(normalizedToUnit) === 'nautical' ? 'Nautical' : 
                   unitCategory(normalizedToUnit) === 'astronomical' ? 'Astronomical' : 
                   unitCategory(normalizedToUnit) === 'historical' ? 'Historical' : 'Other',
            commonUses: getDistanceCommonUses(normalizedToUnit),
            relativeScale: getDistanceRelativeScale(normalizedToUnit, roundedResult)
          }
        },
        analysis: {
          complexity: 'simple',
          precisionLevel: precision > 6 ? 'high' : precision > 3 ? 'medium' : 'low',
          realWorldContext: `Converting ${value} ${fromUnit} to ${toUnit} is commonly used in ${getDistanceCommonContext(normalizedFromUnit, normalizedToUnit)}`,
          applications: [
            'Navigation and mapping',
            'Construction and engineering',
            'Sports and athletics',
            'Scientific research'
          ],
          difficulty: 'easy'
        },
        context: {
          examples: [
            `${value} ${fromUnit} is approximately ${roundedResult} ${toUnit}`,
            `This conversion is frequently used in ${getDistanceCommonContext(normalizedFromUnit, normalizedToUnit)}`
          ],
          comparisons: [
            `1 ${fromUnit} = ${distanceUnits[normalizedFromUnit]} meters`,
            `1 ${toUnit} = ${distanceUnits[normalizedToUnit]} meters`
          ],
          historicalNote: `${fromUnit} and ${toUnit} have different historical origins and usage patterns`,
          practicalTips: [
            'Use appropriate units for your application',
            'Consider precision requirements',
            'Be aware of different measurement systems'
          ]
        },
        alternatives: {
          relatedUnits: Object.keys(distanceUnits).slice(0, 10),
          conversionPaths: [
            'Direct conversion using conversion factors',
            'Convert via base unit (meters)',
            'Use GPS and mapping tools'
          ],
          tools: [
            'Measuring tapes and rulers',
            'GPS devices',
            'Mapping software',
            'Conversion calculators'
          ]
        },
        summary: {
          keyInsight: `${fromUnit} to ${toUnit} conversion follows standard distance measurement principles`,
          recommendation: 'Use this conversion for accurate distance measurements across different systems',
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
          formula: `${value} × (${distanceUnits[normalizedFromUnit]} / ${distanceUnits[normalizedToUnit]})`,
          timestamp: new Date().toISOString()
        },
        analysis: analysis,
        supportedUnits: Object.keys(distanceUnits)
      }
    })

  } catch (error) {
    console.error('Distance Converter Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform distance conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getDistanceCommonUses(unit: string): string[] {
  const uses: Record<string, string[]> = {
    'meter': ['Construction', 'Sports', 'Everyday measurements'],
    'kilometer': ['Road distances', 'Geographic measurements', 'Transportation'],
    'centimeter': ['Precision measurements', 'Clothing sizes', 'Small objects'],
    'millimeter': ['Engineering', 'Manufacturing', 'Scientific research'],
    'inch': ['Screen sizes', 'Construction', 'Imperial measurements'],
    'foot': ['Room dimensions', 'Height measurement', 'Construction'],
    'yard': ['Fabric measurement', 'Sports fields', 'Landscaping'],
    'mile': ['Road distances', 'Running tracks', 'Aviation'],
    'nautical-mile': ['Marine navigation', 'Aviation', 'Shipping'],
    'astronomical-unit': ['Astronomy', 'Planetary distances', 'Space science'],
    'light-year': ['Astronomy', 'Interstellar distances', 'Cosmology'],
    'parsec': ['Astronomy', 'Galactic distances', 'Astrophysics'],
    'cubit': ['Historical measurements', 'Archaeology', 'Biblical studies'],
    'furlong': ['Horse racing', 'Historical land measurement'],
    'chain': ['Surveying', 'Land measurement', 'Historical use']
  }
  
  return uses[unit] || ['General distance measurement', 'Various applications']
}

function getDistanceRelativeScale(unit: string, value: number): string {
  const astronomical = ['astronomical-unit', 'au', 'light-year', 'ly', 'parsec', 'pc', 'light-second', 'light-minute', 'light-hour', 'light-day']
  
  if (astronomical.includes(unit)) {
    return 'Astronomical scale'
  }
  
  if (unit === 'kilometer' || unit === 'km') {
    if (value > 1000) return 'Very long distance'
    if (value > 100) return 'Long distance'
    return 'Medium distance'
  }
  
  if (unit === 'mile' || unit === 'mi') {
    if (value > 100) return 'Very long distance'
    if (value > 10) return 'Long distance'
    return 'Medium distance'
  }
  
  if (unit === 'meter' || unit === 'm') {
    if (value > 1000) return 'Very long distance'
    if (value > 100) return 'Long distance'
    if (value > 10) return 'Medium distance'
    return 'Short distance'
  }
  
  if (unit === 'centimeter' || unit === 'cm') {
    if (value > 100) return 'Medium distance'
    return 'Short distance'
  }
  
  if (unit === 'millimeter' || unit === 'mm') {
    return 'Very short distance'
  }
  
  if (unit === 'inch' || unit === 'in') {
    if (value > 1000) return 'Long distance'
    if (value > 100) return 'Medium distance'
    return 'Short distance'
  }
  
  if (unit === 'foot' || unit === 'ft') {
    if (value > 1000) return 'Long distance'
    if (value > 100) return 'Medium distance'
    return 'Short distance'
  }
  
  if (unit === 'nautical-mile' || unit === 'nmi') {
    if (value > 100) return 'Very long distance'
    return 'Long distance'
  }
  
  return 'Variable scale'
}

function getDistanceCommonContext(fromUnit: string, toUnit: string): string {
  const contexts: Record<string, string> = {
    'kilometer-mile': 'international travel and transportation',
    'mile-kilometer': 'US/international distance conversion',
    'meter-foot': 'construction and building',
    'centimeter-inch': 'manufacturing and product design',
    'yard-meter': 'sports field measurements',
    'nautical-mile-kilometer': 'marine and aviation navigation',
    'astronomical-unit-light-year': 'astronomy and space science',
    'light-year-parsec': 'interstellar distance measurement'
  }
  
  const key = `${fromUnit}-${toUnit}`
  return contexts[key] || 'various fields and applications'
}