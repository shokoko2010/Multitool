import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'

interface JsonToCsvRequest {
  jsonData: string
  delimiter?: string
  includeHeaders?: boolean
  dateFormat?: string
}

interface JsonToCsvResponse {
  csvData: string
  rowCount: number
  columnCount: number
  headers: string[]
  preview: string[]
  downloadUrl?: string
}

function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey))
      } else {
        flattened[newKey] = value
      }
    }
  }
  
  return flattened
}

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If the value contains comma, newline, or quotes, wrap it in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

function generateCsvFromJson(data: any[], options: {
  delimiter?: string
  includeHeaders?: boolean
  dateFormat?: string
}): string {
  const delimiter = options.delimiter || ','
  const includeHeaders = options.includeHeaders !== false
  const dateFormat = options.dateFormat || 'iso'
  
  if (data.length === 0) {
    return ''
  }
  
  // Flatten all objects and collect all possible keys
  const flattenedData = data.map(item => flattenObject(item))
  const allKeys = new Set<string>()
  
  flattenedData.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key))
  })
  
  const headers = Array.from(allKeys).sort()
  let csv = ''
  
  // Add headers if requested
  if (includeHeaders) {
    csv += headers.map(header => escapeCsvValue(header)).join(delimiter) + '\n'
  }
  
  // Add data rows
  flattenedData.forEach(item => {
    const row = headers.map(header => {
      const value = item[header]
      
      // Handle date formatting
      if (value instanceof Date) {
        switch (dateFormat) {
          case 'iso':
            return escapeCsvValue(value.toISOString())
          case 'local':
            return escapeCsvValue(value.toLocaleString())
          case 'utc':
            return escapeCsvValue(value.toUTCString())
          case 'timestamp':
            return escapeCsvValue(value.getTime().toString())
          default:
            return escapeCsvValue(value.toISOString())
        }
      }
      
      // Handle arrays - join them
      if (Array.isArray(value)) {
        return escapeCsvValue(value.join('; '))
      }
      
      // Handle objects - stringify them
      if (typeof value === 'object' && value !== null) {
        return escapeCsvValue(JSON.stringify(value))
      }
      
      return escapeCsvValue(value)
    })
    
    csv += row.join(delimiter) + '\n'
  })
  
  return csv
}

function validateJson(jsonString: string): any[] {
  try {
    const parsed = JSON.parse(jsonString)
    
    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      // If it's a single object, wrap it in an array
      return [parsed]
    }
    
    return parsed
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}

function generatePreview(csvData: string, maxLines: number = 5): string[] {
  const lines = csvData.split('\n').filter(line => line.trim())
  return lines.slice(0, maxLines)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: JsonToCsvRequest = await request.json()
    const { jsonData, delimiter = ',', includeHeaders = true, dateFormat = 'iso' } = body

    if (!jsonData) {
      return NextResponse.json(
        { error: 'JSON data is required' },
        { status: 400 }
      )
    }

    // Validate and parse JSON
    let parsedData: any[]
    try {
      parsedData = validateJson(jsonData)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format. Please check your JSON syntax.' },
        { status: 400 }
      )
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { error: 'JSON data is empty' },
        { status: 400 }
      )
    }

    // Generate CSV
    const csvData = generateCsvFromJson(parsedData, {
      delimiter,
      includeHeaders,
      dateFormat
    })

    // Generate preview
    const preview = generatePreview(csvData)

    // Extract headers (first line if headers are included)
    const headers = includeHeaders && csvData ? csvData.split('\n')[0].split(delimiter).map(h => h.replace(/^"|"$/g, '')) : []

    // Create download URL (base64 encoded)
    const base64Csv = Buffer.from(csvData).toString('base64')
    const downloadUrl = `data:text/csv;base64,${base64Csv}`

    const response: JsonToCsvResponse = {
      csvData,
      rowCount: parsedData.length,
      columnCount: headers.length,
      headers,
      preview,
      downloadUrl
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error converting JSON to CSV:', error)
    return NextResponse.json(
      { error: 'Failed to convert JSON to CSV' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return sample JSON and options
  const sampleJson = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      city: "New York",
      joinDate: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: "dark",
        notifications: true
      },
      tags: ["developer", "javascript"]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      age: 25,
      city: "Los Angeles",
      joinDate: new Date().toISOString(),
      isActive: false,
      preferences: {
        theme: "light",
        notifications: false
      },
      tags: ["designer", "css"]
    }
  ]

  return NextResponse.json({
    sampleJson: JSON.stringify(sampleJson, null, 2),
    options: {
      delimiters: [',', ';', '|', '\t'],
      dateFormats: ['iso', 'local', 'utc', 'timestamp'],
      includeHeaders: true
    },
    features: [
      "Flattens nested JSON objects",
      "Handles arrays by joining with semicolon",
      "Supports custom delimiters",
      "Date formatting options",
      "Automatic CSV escaping",
      "Preview functionality",
      "Direct download capability"
    ]
  })
}