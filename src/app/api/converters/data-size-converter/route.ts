import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { value, fromUnit, toUnit, precision = 4, standard = 'decimal' } = await request.json()

    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Value is required' },
        { status: 400 }
      )
    }

    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      return NextResponse.json(
        { success: false, error: 'Value must be a valid positive number' },
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

    if (standard !== 'decimal' && standard !== 'binary') {
      return NextResponse.json(
        { success: false, error: 'Standard must be either "decimal" or "binary"' },
        { status: 400 }
      )
    }

    // Data size conversion factors to bytes (base unit)
    const decimalUnits: Record<string, number> = {
      'byte': 1,
      'b': 1,
      'kilobyte': 1000,
      'kb': 1000,
      'megabyte': 1000000,
      'mb': 1000000,
      'gigabyte': 1000000000,
      'gb': 1000000000,
      'terabyte': 1000000000000,
      'tb': 1000000000000,
      'petabyte': 1000000000000000,
      'pb': 1000000000000000,
      'exabyte': 1000000000000000000,
      'eb': 1000000000000000000,
      'zettabyte': 1000000000000000000000,
      'zb': 1000000000000000000000,
      'yottabyte': 1000000000000000000000000,
      'yb': 1000000000000000000000000,
      'kilobit': 125,
      'kbit': 125,
      'megabit': 125000,
      'mbit': 125000,
      'gigabit': 125000000,
      'gbit': 125000000,
      'terabit': 125000000000,
      'tbit': 125000000000,
      'petabit': 125000000000000,
      'pbit': 125000000000000,
      'exabit': 125000000000000000,
      'ebit': 125000000000000000,
      'bit': 0.125,
      'bits': 0.125
    }

    const binaryUnits: Record<string, number> = {
      'byte': 1,
      'b': 1,
      'kibibyte': 1024,
      'kib': 1024,
      'mebibyte': 1048576,
      'mib': 1048576,
      'gibibyte': 1073741824,
      'gib': 1073741824,
      'tebibyte': 1099511627776,
      'tib': 1099511627776,
      'pebibyte': 1125899906842624,
      'pib': 1125899906842624,
      'exbibyte': 1152921504606847000,
      'eib': 1152921504606847000,
      'zebibyte': 1180591620717411303424,
      'zib': 1180591620717411303424,
      'yobibyte': 1208925819614629174706176,
      'yib': 1208925819614629174706176,
      'kibibit': 128,
      'kibit': 128,
      'mebibit': 131072,
      'mibit': 131072,
      'gibibit': 134217728,
      'gibit': 134217728,
      'tebibit': 137438953472,
      'tibit': 137438953472,
      'pebibit': 140737488355328,
      'pibit': 140737488355328,
      'exbibit': 144115188075855872,
      'eibit': 144115188075855872,
      'bit': 0.125,
      'bits': 0.125
    }

    // Get the appropriate unit set based on standard
    const units = standard === 'decimal' ? decimalUnits : binaryUnits

    // Validate units
    const normalizedFromUnit = fromUnit.toLowerCase()
    const normalizedToUnit = toUnit.toLowerCase()

    if (!units[normalizedFromUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid fromUnit: ${fromUnit}. Supported units: ${Object.keys(units).join(', ')}` },
        { status: 400 }
      )
    }

    if (!units[normalizedToUnit]) {
      return NextResponse.json(
        { success: false, error: `Invalid toUnit: ${toUnit}. Supported units: ${Object.keys(units).join(', ')}` },
        { status: 400 }
      )
    }

    // Perform conversion
    const bytes = value * units[normalizedFromUnit]
    const result = bytes / units[normalizedToUnit]
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision)

    // Initialize ZAI SDK for enhanced conversion analysis
    const zai = await ZAI.create()

    // Use AI to provide contextual information about the conversion
    const systemPrompt = `You are a data size conversion expert. Analyze the data size conversion that was performed.

    Conversion: ${value} ${fromUnit} to ${toUnit}
    Result: ${roundedResult}
    Standard: ${standard}
    Precision: ${precision} decimal places

    Please provide comprehensive data size conversion analysis including:
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

    Use realistic conversion analysis based on common data storage practices.
    Return the response in JSON format with the following structure:
    {
      "conversion": {
        "fromValue": number,
        "fromUnit": "string",
        "toValue": number,
        "toUnit": "string",
        "standard": "decimal" | "binary",
        "precision": number,
        "formula": "string",
        "accuracy": "exact" | "approximate"
      },
      "units": {
        "fromUnit": {
          "name": "string",
          "category": "storage" | "data" | "memory",
          "system": "decimal" | "binary",
          "commonUses": array,
          "relativeSize": "string"
        },
        "toUnit": {
          "name": "string",
          "category": "storage" | "data" | "memory",
          "system": "decimal" | "binary",
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
          content: `Analyze data size conversion: ${value} ${fromUnit} to ${toUnit} using ${standard} standard`
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
        standard: standard,
        precision: precision,
        formula: `${value} × (${units[normalizedFromUnit]} / ${units[normalizedToUnit]})`,
        accuracy: 'exact'
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const unitCategory = (unit: string) => {
        const storage = ['byte', 'b', 'kilobyte', 'kb', 'megabyte', 'mb', 'gigabyte', 'gb', 'terabyte', 'tb', 'petabyte', 'pb']
        const binary = ['kibibyte', 'kib', 'mebibyte', 'mib', 'gibibyte', 'gib', 'tebibyte', 'tib', 'pebibyte', 'pib']
        const data = ['bit', 'bits', 'kilobit', 'kbit', 'megabit', 'mbit', 'gigabit', 'gbit', 'terabit', 'tbit']
        
        if (storage.includes(unit) || binary.includes(unit)) return 'storage'
        if (data.includes(unit)) return 'data'
        return 'memory'
      }
      
      analysis = {
        conversion: {
          fromValue: value,
          fromUnit: fromUnit,
          toValue: roundedResult,
          toUnit: toUnit,
          standard: standard,
          precision: precision,
          formula: `${value} × (${units[normalizedFromUnit]} / ${units[normalizedToUnit]})`,
          accuracy: 'exact'
        },
        units: {
          fromUnit: {
            name: fromUnit,
            category: unitCategory(normalizedFromUnit),
            system: standard,
            commonUses: getDataSizeCommonUses(normalizedFromUnit),
            relativeSize: getDataSizeRelativeSize(normalizedFromUnit, value)
          },
          toUnit: {
            name: toUnit,
            category: unitCategory(normalizedToUnit),
            system: standard,
            commonUses: getDataSizeCommonUses(normalizedToUnit),
            relativeSize: getDataSizeRelativeSize(normalizedToUnit, roundedResult)
          }
        },
        analysis: {
          complexity: 'simple',
          precisionLevel: precision > 6 ? 'high' : precision > 3 ? 'medium' : 'low',
          realWorldContext: `Converting ${value} ${fromUnit} to ${toUnit} is commonly used in ${getDataSizeCommonContext(normalizedFromUnit, normalizedToUnit)}`,
          applications: [
            'Data storage planning',
            'File size management',
            'Network bandwidth calculation',
            'Memory allocation'
          ],
          difficulty: 'easy'
        },
        context: {
          examples: [
            `${value} ${fromUnit} is approximately ${roundedResult} ${toUnit}`,
            `This conversion is frequently used in ${getDataSizeCommonContext(normalizedFromUnit, normalizedToUnit)}`
          ],
          comparisons: [
            `1 ${fromUnit} = ${units[normalizedFromUnit]} bytes`,
            `1 ${toUnit} = ${units[normalizedToUnit]} bytes`
          ],
          historicalNote: `${standard === 'decimal' ? 'Decimal (SI)' : 'Binary (IEC)'} standard is used for this conversion`,
          practicalTips: [
            'Use decimal for storage devices and network speeds',
            'Use binary for memory and file systems',
            'Be aware of the difference between standards'
          ]
        },
        alternatives: {
          relatedUnits: Object.keys(units).slice(0, 10),
          conversionPaths: [
            'Direct conversion using conversion factors',
            'Convert via base unit (bytes)',
            'Use system information tools'
          ],
          tools: [
            'File explorers',
            'System information utilities',
            'Conversion calculators'
          ]
        },
        summary: {
          keyInsight: `${fromUnit} to ${toUnit} conversion requires attention to the ${standard} standard`,
          recommendation: `Use ${standard} standard consistently for accurate data size calculations`,
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
          standard: standard,
          precision: precision,
          formula: `${value} × (${units[normalizedFromUnit]} / ${units[normalizedToUnit]})`,
          timestamp: new Date().toISOString()
        },
        analysis: analysis,
        supportedUnits: Object.keys(units)
      }
    })

  } catch (error) {
    console.error('Data Size Converter Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform data size conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getDataSizeCommonUses(unit: string): string[] {
  const uses: Record<string, string[]> = {
    'byte': ['Character encoding', 'Small data units', 'Programming'],
    'kilobyte': ['Text files', 'Small images', 'Configuration files'],
    'megabyte': ['Images', 'Documents', 'Small applications'],
    'gigabyte': ['Videos', 'Large applications', 'Databases'],
    'terabyte': ['Large databases', 'Media collections', 'Server storage'],
    'petabyte': ['Enterprise storage', 'Big data', 'Cloud storage'],
    'bit': ['Network rates', 'Data transmission', 'Communications'],
    'kilobit': ['Internet speeds', 'Network bandwidth'],
    'megabit': ['Broadband speeds', 'Data transfer rates'],
    'gigabit': ['High-speed networks', 'Fiber optics'],
    'kibibyte': ['Memory systems', 'File systems'],
    'mebibyte': ['RAM modules', 'System memory'],
    'gibibyte': ['Modern RAM', 'Storage devices'],
    'tebibyte': ['Large storage systems']
  }
  
  return uses[unit] || ['General data measurement', 'Various applications']
}

function getDataSizeRelativeSize(unit: string, value: number): string {
  if (unit.includes('yotta') || unit.includes('y')) {
    return 'Massive scale'
  }
  
  if (unit.includes('zetta') || unit.includes('z')) {
    return 'Very large scale'
  }
  
  if (unit.includes('exa') || unit.includes('e')) {
    return 'Large scale'
  }
  
  if (unit.includes('peta') || unit.includes('p')) {
    return 'Enterprise scale'
  }
  
  if (unit.includes('tera') || unit.includes('t')) {
    return 'Large storage'
  }
  
  if (unit.includes('giga') || unit.includes('g')) {
    if (value > 100) return 'Very large'
    if (value > 10) return 'Large'
    return 'Medium'
  }
  
  if (unit.includes('mega') || unit.includes('m')) {
    if (value > 1000) return 'Very large'
    if (value > 100) return 'Large'
    return 'Medium'
  }
  
  if (unit.includes('kilo') || unit.includes('k')) {
    if (value > 10000) return 'Very large'
    if (value > 1000) return 'Large'
    return 'Small'
  }
  
  if (unit.includes('byte') || unit.includes('b')) {
    if (value > 1000000) return 'Very large'
    if (value > 10000) return 'Large'
    return 'Small'
  }
  
  if (unit.includes('bit')) {
    return 'Data rate unit'
  }
  
  return 'Variable size'
}

function getDataSizeCommonContext(fromUnit: string, toUnit: string): string {
  const contexts: Record<string, string> = {
    'kilobyte-megabyte': 'file size management',
    'megabyte-gigabyte': 'storage capacity planning',
    'gigabyte-terabyte': 'large storage systems',
    'byte-kilobyte': 'small data measurements',
    'megabit-megabyte': 'network vs storage conversion',
    'gigabyte-gibibyte': 'decimal vs binary standards',
    'terabyte-petabyte': 'enterprise data centers'
  }
  
  const key = `${fromUnit}-${toUnit}`
  return contexts[key] || 'data storage and management'
}