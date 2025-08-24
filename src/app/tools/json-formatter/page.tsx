'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Download, Upload, FileText, Braces, Minify, Validate } from 'lucide-react'

interface JSONValidationResult {
  isValid: boolean
  error?: string
  line?: number
  column?: number
  formatted?: string
  minified?: string
  stats?: {
    size: number
    keys: number
    arrays: number
    objects: number
    strings: number
    numbers: number
    booleans: number
    nulls: number
  }
}

interface FormatHistory {
  id: string
  originalSize: number
  formattedSize: number
  timestamp: Date
}

export default function JSONFormatter() {
  const [inputJSON, setInputJSON] = useState<string>('')
  const [formattedJSON, setFormattedJSON] = useState<string>('')
  const [minifiedJSON, setMinifiedJSON] = useState<string>('')
  const [indentSize, setIndentSize] = useState<number>(2)
  const [validationResult, setValidationResult] = useState<JSONValidationResult | null>(null)
  const [formatHistory, setFormatHistory] = useState<FormatHistory[]>([])

  const validateAndFormatJSON = (jsonString: string): JSONValidationResult => {
    if (!jsonString.trim()) {
      return {
        isValid: false,
        error: 'Please enter JSON data'
      }
    }

    try {
      const parsed = JSON.parse(jsonString)
      
      // Format the JSON
      const formatted = JSON.stringify(parsed, null, indentSize)
      const minified = JSON.stringify(parsed)
      
      // Calculate statistics
      const stats = calculateJSONStats(parsed)
      
      return {
        isValid: true,
        formatted,
        minified,
        stats
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON'
      const errorMatch = errorMessage.match(/position (\d+)/)
      const position = errorMatch ? parseInt(errorMatch[1]) : 0
      
      // Calculate line and column
      const lines = jsonString.substring(0, position).split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      
      return {
        isValid: false,
        error: errorMessage,
        line,
        column
      }
    }
  }

  const calculateJSONStats = (obj: any) => {
    let keys = 0
    let arrays = 0
    let objects = 0
    let strings = 0
    let numbers = 0
    let booleans = 0
    let nulls = 0

    const traverse = (item: any) => {
      if (item === null) {
        nulls++
      } else if (typeof item === 'string') {
        strings++
      } else if (typeof item === 'number') {
        numbers++
      } else if (typeof item === 'boolean') {
        booleans++
      } else if (Array.isArray(item)) {
        arrays++
        item.forEach(traverse)
      } else if (typeof item === 'object') {
        objects++
        keys += Object.keys(item).length
        Object.values(item).forEach(traverse)
      }
    }

    traverse(obj)
    
    return { keys, arrays, objects, strings, numbers, booleans, nulls }
  }

  const formatJSON = () => {
    const result = validateAndFormatJSON(inputJSON)
    setValidationResult(result)
    
    if (result.isValid) {
      setFormattedJSON(result.formatted || '')
      setMinifiedJSON(result.minified || '')
      
      // Add to history
      const historyItem: FormatHistory = {
        id: Date.now().toString(),
        originalSize: new Blob([inputJSON]).size,
        formattedSize: new Blob([result.formatted || '']).size,
        timestamp: new Date()
      }
      
      setFormatHistory(prev => [historyItem, ...prev.slice(0, 9)])
    }
  }

  const minifyJSON = () => {
    if (validationResult?.isValid && validationResult.minified) {
      setFormattedJSON(validationResult.minified)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadJSON = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputJSON(content)
      }
      reader.readAsText(file)
    }
  }

  const clearAll = () => {
    setInputJSON('')
    setFormattedJSON('')
    setMinifiedJSON('')
    setValidationResult(null)
  }

  const loadSampleJSON = () => {
    const sampleJSON = `{
  "name": "John Doe",
  "age": 30,
  "isStudent": false,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "scores": [85, 92, 78, 96],
  "metadata": {
    "created": "2024-01-01",
    "version": "1.0"
  }
}`
    setInputJSON(sampleJSON)
  }

  useEffect(() => {
    if (inputJSON) {
      formatJSON()
    }
  }, [inputJSON, indentSize])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JSON Formatter & Validator</h1>
        <p className="text-muted-foreground">Format, validate, and minify JSON data with syntax highlighting</p>
      </div>

      <Tabs defaultValue="formatter" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="formatter">Formatter</TabsTrigger>
          <TabsTrigger value="validator">Validator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="formatter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Input JSON
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSampleJSON}>
                      Sample
                    </Button>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter or paste your JSON data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputJSON}
                  onChange={(e) => setInputJSON(e.target.value)}
                  placeholder="Enter your JSON data here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="indentSize">Indent Size:</Label>
                      <select
                        id="indentSize"
                        value={indentSize}
                        onChange={(e) => setIndentSize(parseInt(e.target.value))}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value={2}>2 spaces</option>
                        <option value={4}>4 spaces</option>
                        <option value={8}>8 spaces</option>
                        <option value={0}>Minified</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Size: {formatFileSize(new Blob([inputJSON]).size)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Braces className="h-5 w-5" />
                    Formatted JSON
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={minifyJSON}>
                      <Minify className="h-4 w-4 mr-2" />
                      Minify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(formattedJSON)}
                      disabled={!formattedJSON}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadJSON(formattedJSON, 'formatted.json')}
                      disabled={!formattedJSON}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Formatted and validated JSON output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto min-h-[300px] max-h-[400px]">
                    <code className="text-sm font-mono">{formattedJSON}</code>
                  </pre>
                  {formattedJSON && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Size: {formatFileSize(new Blob([formattedJSON]).size)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Validate className="h-5 w-5" />
                  Validation Results
                </CardTitle>
                <CardDescription>
                  JSON validation and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validationResult.isValid ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-700">Valid JSON</span>
                    </div>

                    {validationResult.stats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.stats.keys}</div>
                          <div className="text-sm text-muted-foreground">Keys</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.stats.objects}</div>
                          <div className="text-sm text-muted-foreground">Objects</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.stats.arrays}</div>
                          <div className="text-sm text-muted-foreground">Arrays</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.stats.strings}</div>
                          <div className="text-sm text-muted-foreground">Strings</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.stats.numbers}</div>
                          <div className="text-sm text-muted-foreground">Numbers</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.stats.booleans}</div>
                          <div className="text-sm text-muted-foreground">Booleans</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.stats.nulls}</div>
                          <div className="text-sm text-muted-foreground">Nulls</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-2xl font-bold">
                            {validationResult.stats.keys + validationResult.stats.objects + validationResult.stats.arrays + validationResult.stats.strings + validationResult.stats.numbers + validationResult.stats.booleans + validationResult.stats.nulls}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Items</div>
                        </div>
                      </div>
                    )}

                    {minifiedJSON && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium text-blue-800">Size Comparison</div>
                          <div className="text-sm text-blue-600">
                            Original: {formatFileSize(new Blob([inputJSON]).size)} → 
                            Formatted: {formatFileSize(new Blob([formattedJSON]).size)} → 
                            Minified: {formatFileSize(new Blob([minifiedJSON]).size)}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {Math.round((1 - new Blob([minifiedJSON]).size / new Blob([inputJSON]).size) * 100)}% smaller
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-700">Invalid JSON</span>
                    </div>
                    
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800">Error: {validationResult.error}</div>
                      {validationResult.line && validationResult.column && (
                        <div className="text-sm text-red-600 mt-1">
                          Line: {validationResult.line}, Column: {validationResult.column}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Common JSON Issues:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Missing quotes around string keys</li>
                        <li>• Trailing commas in arrays or objects</li>
                        <li>• Single quotes instead of double quotes</li>
                        <li>• Comments are not allowed in standard JSON</li>
                        <li>• Undefined values are not valid JSON</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON Validation Guide</CardTitle>
              <CardDescription>
                Learn about JSON syntax and common validation issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Valid JSON Syntax</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-mono text-sm">{"{\"name\": \"John\", \"age\": 30}"}</div>
                      <div className="text-sm text-green-600 mt-1">✓ Double quotes for keys and strings</div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-mono text-sm">{`["apple", "banana", "cherry"]`}</div>
                      <div className="text-sm text-green-600 mt-1">✓ Proper array syntax</div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-mono text-sm">{"{\"active\": true, \"count\": null}"}</div>
                      <div className="text-sm text-green-600 mt-1">✓ Valid data types</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Common JSON Errors</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-mono text-sm">{"{name: 'John', age: 30}"}</div>
                      <div className="text-sm text-red-600 mt-1">✗ Missing quotes around keys</div>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-mono text-sm">{"[\"apple\", \"banana\", ]"}</div>
                      <div className="text-sm text-red-600 mt-1">✗ Trailing comma</div>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-mono text-sm">{"{/* This is a comment */}"}</div>
                      <div className="text-sm text-red-600 mt-1">✗ Comments not allowed</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">JSON Data Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-mono text-sm">"string"</div>
                    <div className="text-xs text-muted-foreground">Text in quotes</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-mono text-sm">42</div>
                    <div className="text-xs text-muted-foreground">Number</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-mono text-sm">true/false</div>
                    <div className="text-xs text-muted-foreground">Boolean</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="font-mono text-sm">null</div>
                    <div className="text-xs text-muted-foreground">Null value</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Format History</CardTitle>
              <CardDescription>
                Your recent JSON formatting operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formatHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No formatting history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formatHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {formatFileSize(item.originalSize)} → {formatFileSize(item.formattedSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((1 - item.formattedSize / item.originalSize) * 100)}% size change
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {item.formattedSize < item.originalSize ? 'Optimized' : 'Formatted'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}