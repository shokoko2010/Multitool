'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Download, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react'

export default function JsonToCsvConverterTool() {
  const [inputJson, setInputJson] = useState('')
  const [outputCsv, setOutputCsv] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [flattenNested, setFlattenNested] = useState(false)
  const [error, setError] = useState('')

  const convertJsonToCsv = useCallback(() => {
    if (!inputJson.trim()) {
      setError('Please enter JSON data to convert')
      return
    }

    try {
      const jsonData = JSON.parse(inputJson)
      
      if (!Array.isArray(jsonData)) {
        // If it's a single object, wrap it in an array
        const csv = convertObjectToCsv([jsonData], delimiter, includeHeaders, flattenNested)
        setOutputCsv(csv)
      } else {
        const csv = convertArrayToCsv(jsonData, delimiter, includeHeaders, flattenNested)
        setOutputCsv(csv)
      }
      
      setError('')
    } catch (parseError) {
      setError(`Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
    }
  }, [inputJson, delimiter, includeHeaders, flattenNested])

  const convertArrayToCsv = (data: any[], delimiter: string, includeHeaders: boolean, flattenNested: boolean): string => {
    if (data.length === 0) return ''

    // Flatten nested objects if requested
    const processedData = flattenNested ? data.map(item => flattenObject(item)) : data
    
    // Get all unique keys from all objects
    const allKeys = new Set<string>()
    processedData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key))
    })
    
    const headers = Array.from(allKeys)
    let csv = ''

    // Add headers if requested
    if (includeHeaders) {
      csv += headers.map(header => escapeCsvValue(header, delimiter)).join(delimiter) + '\n'
    }

    // Add data rows
    processedData.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        return escapeCsvValue(value, delimiter)
      })
      csv += row.join(delimiter) + '\n'
    })

    return csv
  }

  const convertObjectToCsv = (data: any[], delimiter: string, includeHeaders: boolean, flattenNested: boolean): string => {
    if (data.length === 0) return ''

    const processedData = flattenNested ? data.map(item => flattenObject(item)) : data
    const headers = Object.keys(processedData[0])
    let csv = ''

    if (includeHeaders) {
      csv += headers.map(header => escapeCsvValue(header, delimiter)).join(delimiter) + '\n'
    }

    processedData.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        return escapeCsvValue(value, delimiter)
      })
      csv += row.join(delimiter) + '\n'
    })

    return csv
  }

  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {}

    Object.keys(obj).forEach(key => {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey))
      } else if (Array.isArray(value)) {
        // Handle arrays by converting to string or flattening if they contain objects
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          // For arrays of objects, create separate columns for each item
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              Object.keys(item).forEach(subKey => {
                flattened[`${newKey}[${index}].${subKey}`] = item[subKey]
              })
            } else {
              flattened[`${newKey}[${index}]`] = item
            }
          })
        } else {
          // For simple arrays, join with comma
          flattened[newKey] = value.join(', ')
        }
      } else {
        flattened[newKey] = value
      }
    })

    return flattened
  }

  const escapeCsvValue = (value: any, delimiter: string): string => {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value)
    
    // If the value contains the delimiter, newlines, or quotes, wrap in quotes and escape internal quotes
    if (stringValue.includes(delimiter) || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    
    return stringValue
  }

  const handleCopy = async () => {
    if (outputCsv) {
      await navigator.clipboard.writeText(outputCsv)
    }
  }

  const handleDownload = () => {
    if (outputCsv) {
      const blob = new Blob([outputCsv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted-data.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputJson(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInputJson('')
    setOutputCsv('')
    setError('')
  }

  const getSampleData = () => {
    return `[
  {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001"
    },
    "hobbies": ["reading", "swimming", "coding"]
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "email": "jane@example.com",
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "zip": "90001"
    },
    "hobbies": ["painting", "traveling"]
  }
]`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            JSON to CSV Converter
          </CardTitle>
          <CardDescription>
            Convert JSON data to CSV format with customizable delimiters and options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">JSON Input</Label>
                <Textarea
                  id="json-input"
                  placeholder="Enter JSON data to convert to CSV..."
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Delimiter</Label>
                  <Select value={delimiter} onValueChange={setDelimiter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">Comma (,)</SelectItem>
                      <SelectItem value=";">Semicolon (;)</SelectItem>
                      <SelectItem value="\t">Tab</SelectItem>
                      <SelectItem value="|">Pipe (|)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-headers"
                      checked={includeHeaders}
                      onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
                    />
                    <Label htmlFor="include-headers">Include Headers</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="flatten-nested"
                      checked={flattenNested}
                      onCheckedChange={(checked) => setFlattenNested(checked as boolean)}
                    />
                    <Label htmlFor="flatten-nested">Flatten Nested</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertJsonToCsv} disabled={!inputJson.trim()}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Convert to CSV
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="outline" onClick={() => setInputJson(getSampleData())}>
                  Load Sample
                </Button>
                <div className="flex-1" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload JSON
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Options Explained</Label>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                  <div>
                    <div className="font-medium">Delimiter:</div>
                    <div className="text-muted-foreground">Character that separates values in CSV</div>
                  </div>
                  <div>
                    <div className="font-medium">Include Headers:</div>
                    <div className="text-muted-foreground">Add column names as first row</div>
                  </div>
                  <div>
                    <div className="font-medium">Flatten Nested:</div>
                    <div className="text-muted-foreground">Convert nested objects to flat columns</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {outputCsv && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">CSV Output</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </div>
              <Textarea
                value={outputCsv}
                readOnly
                rows={10}
                className="font-mono text-sm resize-none"
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">About JSON to CSV Conversion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                This tool converts JSON data to CSV (Comma-Separated Values) format. CSV is a simple 
                file format used to store tabular data, such as a spreadsheet or database.
              </p>
              <p className="text-sm text-muted-foreground">
                When converting nested JSON objects, you can choose to flatten them into separate 
                columns using dot notation (e.g., "address.city"). Arrays are handled by joining 
                simple values or creating separate columns for array elements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}