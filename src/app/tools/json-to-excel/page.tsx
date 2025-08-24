'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileSpreadsheet, Download, Upload, FileJson, FileText, Copy } from 'lucide-react'

interface ConversionResult {
  success: boolean
  data?: any
  error?: string
  format: 'csv' | 'html' | 'json'
}

export default function JsonToExcel() {
  const [inputJson, setInputJson] = useState('')
  const [outputData, setOutputData] = useState('')
  const [conversionType, setConversionType] = useState<'csv' | 'html'>('csv')
  const [result, setResult] = useState<ConversionResult | null>(null)

  const validateJson = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }

  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {}
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value, newKey))
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value)
        } else {
          flattened[newKey] = value
        }
      }
    }
    
    return flattened
  }

  const convertToCSV = (data: any[]): string => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array')
    }

    // Flatten all objects and collect all possible keys
    const flattenedData = data.map(item => flattenObject(item))
    const allKeys = new Set<string>()
    
    flattenedData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key))
    })

    const headers = Array.from(allKeys).sort()
    
    // Create CSV content
    const csvLines = [
      headers.join(','),
      ...flattenedData.map(row => {
        return headers.map(header => {
          const value = row[header]
          if (value === undefined || value === null) return ''
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      })
    ]

    return csvLines.join('\\n')
  }

  const convertToHTML = (data: any[]): string => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array')
    }

    const flattenedData = data.map(item => flattenObject(item))
    const allKeys = new Set<string>()
    
    flattenedData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key))
    })

    const headers = Array.from(allKeys).sort()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>JSON to Excel Conversion</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        tr:hover {
            background-color: #e9ecef;
        }
        .stats {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .stats-item {
            display: inline-block;
            margin-right: 30px;
        }
        .stats-label {
            font-weight: bold;
            color: #1976d2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JSON Data Export</h1>
        
        <div class="stats">
            <div class="stats-item">
                <span class="stats-label">Rows:</span> ${data.length}
            </div>
            <div class="stats-item">
                <span class="stats-label">Columns:</span> ${headers.length}
            </div>
            <div class="stats-item">
                <span class="stats-label">Generated:</span> ${new Date().toLocaleString()}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${flattenedData.map(row => `
                    <tr>
                        ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`

    return html
  }

  const handleConvert = () => {
    if (!inputJson.trim()) return

    try {
      const jsonData = validateJson(inputJson)
      
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON data must be an array of objects')
      }

      let convertedData: string
      let format: 'csv' | 'html'

      if (conversionType === 'csv') {
        convertedData = convertToCSV(jsonData)
        format = 'csv'
      } else {
        convertedData = convertToHTML(jsonData)
        format = 'html'
      }

      setOutputData(convertedData)
      setResult({
        success: true,
        data: jsonData,
        format
      })
    } catch (error) {
      setResult({
        success: false,
        error: (error as Error).message,
        format: conversionType
      })
    }
  }

  const downloadFile = () => {
    if (!outputData) return

    const mimeType = conversionType === 'csv' ? 'text/csv' : 'text/html'
    const extension = conversionType === 'csv' ? 'csv' : 'html'
    const filename = `converted_data.${extension}`

    const blob = new Blob([outputData], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    if (!outputData) return
    navigator.clipboard.writeText(outputData)
  }

  const loadExample = () => {
    const exampleJson = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "department": "Engineering",
    "salary": 75000,
    "active": true,
    "joinDate": "2022-01-15",
    "skills": ["JavaScript", "React", "Node.js"],
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001"
    }
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 34,
    "department": "Marketing",
    "salary": 85000,
    "active": true,
    "joinDate": "2021-03-20",
    "skills": ["SEO", "Content", "Analytics"],
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "zip": "90001"
    }
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "age": 45,
    "department": "Sales",
    "salary": 92000,
    "active": false,
    "joinDate": "2020-06-10",
    "skills": ["Sales", "CRM", "Negotiation"],
    "address": {
      "street": "789 Pine Rd",
      "city": "Chicago",
      "zip": "60601"
    }
  }
]`

    setInputJson(exampleJson)
  }

  const getStats = () => {
    if (!result || !result.data) return null

    const data = result.data as any[]
    const flattenedData = data.map(item => flattenObject(item))
    const allKeys = new Set<string>()
    
    flattenedData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key))
    })

    return {
      rows: data.length,
      columns: allKeys.size,
      format: result.format.toUpperCase()
    }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            JSON to Excel Converter
          </CardTitle>
          <CardDescription>
            Convert JSON data to CSV or HTML table format for Excel compatibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="json-input">JSON Data</Label>
              <Textarea
                id="json-input"
                placeholder="Paste your JSON array here..."
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="min-h-64 font-mono text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Output Format</Label>
                <Select value={conversionType} onValueChange={(value: 'csv' | 'html') => setConversionType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="html">HTML Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Label htmlFor="output">Converted Output</Label>
              <Textarea
                id="output"
                value={outputData}
                readOnly
                className="min-h-64 font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConvert} disabled={!inputJson.trim()} className="flex-1">
              <FileJson className="h-4 w-4 mr-2" />
              Convert JSON
            </Button>
            <Button onClick={loadExample} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Load Example
            </Button>
            {outputData && (
              <>
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadFile} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download {conversionType.toUpperCase()}
                </Button>
              </>
            )}
          </div>

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Conversion Successful</h3>
                    <p className="text-sm text-green-600">
                      JSON data successfully converted to {result.format.toUpperCase()} format
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Conversion Failed</h3>
                    <p className="text-sm text-red-600">{result.error}</p>
                  </div>
                </div>
              )}

              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.rows}</div>
                      <div className="text-sm text-muted-foreground">Rows</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.columns}</div>
                      <div className="text-sm text-muted-foreground">Columns</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.format}</div>
                      <div className="text-sm text-muted-foreground">Format</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">About JSON to Excel Conversion</h3>
            <p className="text-sm text-muted-foreground">
              This tool converts JSON arrays to spreadsheet-compatible formats. CSV format is ideal for importing into Excel, 
              while HTML format provides better styling and can be opened directly in browsers. The tool automatically flattens 
              nested objects and handles arrays by converting them to strings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}