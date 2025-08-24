'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Download, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react'

export default function CsvToJsonConverterTool() {
  const [inputCsv, setInputCsv] = useState('')
  const [outputJson, setOutputJson] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [hasHeaders, setHasHeaders] = useState(true)
  const [outputFormat, setOutputFormat] = useState<'array' | 'object'>('array')
  const [error, setError] = useState('')

  const convertCsvToJson = useCallback(() => {
    if (!inputCsv.trim()) {
      setError('Please enter CSV data to convert')
      return
    }

    try {
      const jsonData = parseCsv(inputCsv, delimiter, hasHeaders, outputFormat)
      const jsonString = JSON.stringify(jsonData, null, 2)
      setOutputJson(jsonString)
      setError('')
    } catch (parseError) {
      setError(`Conversion error: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
    }
  }, [inputCsv, delimiter, hasHeaders, outputFormat])

  const parseCsv = (csv: string, delimiter: string, hasHeaders: boolean, outputFormat: 'array' | 'object'): any => {
    const lines = csv.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      return outputFormat === 'array' ? [] : {}
    }

    // Parse CSV lines
    const parsedLines = lines.map(line => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Escaped quote
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current)
      return result
    })

    if (hasHeaders) {
      const headers = parsedLines[0]
      const dataLines = parsedLines.slice(1)
      
      if (outputFormat === 'array') {
        return dataLines.map(line => {
          const obj: any = {}
          headers.forEach((header, index) => {
            const value = line[index] || ''
            obj[header.trim()] = parseValue(value)
          })
          return obj
        })
      } else {
        // Object format - create nested object structure
        const result: any = {}
        dataLines.forEach((line, lineIndex) => {
          const key = line[0] || `row_${lineIndex}`
          const obj: any = {}
          headers.forEach((header, index) => {
            if (index > 0) { // Skip first column as it's used as key
              const value = line[index] || ''
              obj[header.trim()] = parseValue(value)
            }
          })
          result[key] = obj
        })
        return result
      }
    } else {
      // No headers - use column indices as keys
      if (outputFormat === 'array') {
        return parsedLines.map(line => {
          const obj: any = {}
          line.forEach((value, index) => {
            obj[`column_${index}`] = parseValue(value)
          })
          return obj
        })
      } else {
        const result: any = {}
        parsedLines.forEach((line, index) => {
          const obj: any = {}
          line.forEach((value, colIndex) => {
            obj[`column_${colIndex}`] = parseValue(value)
          })
          result[`row_${index}`] = obj
        })
        return result
      }
    }
  }

  const parseValue = (value: string): any => {
    const trimmed = value.trim()
    
    // Remove surrounding quotes if present
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const unquoted = trimmed.slice(1, -1).replace(/""/g, '"')
      return unquoted
    }
    
    // Try to parse as number
    if (/^-?\d*\.?\d+$/.test(trimmed)) {
      const num = parseFloat(trimmed)
      if (!isNaN(num)) {
        return num
      }
    }
    
    // Try to parse as boolean
    if (trimmed.toLowerCase() === 'true') return true
    if (trimmed.toLowerCase() === 'false') return false
    
    // Try to parse as null
    if (trimmed.toLowerCase() === 'null' || trimmed === '') return null
    
    // Return as string
    return trimmed
  }

  const handleCopy = async () => {
    if (outputJson) {
      await navigator.clipboard.writeText(outputJson)
    }
  }

  const handleDownload = () => {
    if (outputJson) {
      const blob = new Blob([outputJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted-data.json'
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
        setInputCsv(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInputCsv('')
    setOutputJson('')
    setError('')
  }

  const getSampleData = () => {
    return `name,age,email,city
John Doe,30,john@example.com,New York
Jane Smith,25,jane@example.com,Los Angeles
Bob Johnson,35,bob@example.com,Chicago
Alice Brown,28,alice@example.com,Houston`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            CSV to JSON Converter
          </CardTitle>
          <CardDescription>
            Convert CSV data to JSON format with customizable parsing options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-input">CSV Input</Label>
                <Textarea
                  id="csv-input"
                  placeholder="Enter CSV data to convert to JSON..."
                  value={inputCsv}
                  onChange={(e) => setInputCsv(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      id="has-headers"
                      checked={hasHeaders}
                      onCheckedChange={(checked) => setHasHeaders(checked as boolean)}
                    />
                    <Label htmlFor="has-headers">Has Headers</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select value={outputFormat} onValueChange={(value: 'array' | 'object') => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="array">Array of Objects</SelectItem>
                      <SelectItem value="object">Nested Object</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex items-end">
                  <Button onClick={convertCsvToJson} disabled={!inputCsv.trim()} className="w-full">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Convert
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="outline" onClick={() => setInputCsv(getSampleData())}>
                  Load Sample
                </Button>
                <div className="flex-1" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Options Explained</Label>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                  <div>
                    <div className="font-medium">Delimiter:</div>
                    <div className="text-muted-foreground">Character separating CSV values</div>
                  </div>
                  <div>
                    <div className="font-medium">Has Headers:</div>
                    <div className="text-muted-foreground">First row contains column names</div>
                  </div>
                  <div>
                    <div className="font-medium">Output Format:</div>
                    <div className="text-muted-foreground">
                      Array: {`[{"name":"John"}]`}<br />
                      Object: {`{"row1":{"name":"John"}}`}
                    </div>
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

          {outputJson && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">JSON Output</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
              </div>
              <Textarea
                value={outputJson}
                readOnly
                rows={12}
                className="font-mono text-sm resize-none"
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">About CSV to JSON Conversion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                This tool converts CSV (Comma-Separated Values) data to JSON format. CSV is a 
                simple format for storing tabular data, while JSON provides a more structured 
                and flexible data format.
              </p>
              <p className="text-sm text-muted-foreground">
                The tool automatically detects and handles quoted values, escaped quotes, and 
                converts data types appropriately (numbers, booleans, null). You can choose 
                between array format (most common) or nested object format for different use cases.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Data Type Conversion</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">CSV Value → JSON Type:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• "123" → Number (123)</li>
                    <li>• "true" → Boolean (true)</li>
                    <li>• "false" → Boolean (false)</li>
                    <li>• "null" or empty → null</li>
                    <li>• "hello" → String ("hello")</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Special Handling:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Quoted strings preserved</li>
                    <li>• Escaped quotes handled</li>
                    <li>• Empty cells become null</li>
                    <li>• Whitespace trimmed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}