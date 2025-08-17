'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Upload, FileSpreadsheet, FileJson, Settings } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface ConversionOptions {
  hasHeaders: boolean
  delimiter: string
  quoteChar: string
  outputFormat: 'array' | 'object'
  indent: number
}

export default function CsvToJsonConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [options, setOptions] = useState<ConversionOptions>({
    hasHeaders: true,
    delimiter: ',',
    quoteChar: '"',
    outputFormat: 'array',
    indent: 2
  })
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const { trackUsage } = useToolAccess('csv-to-json')

  const parseCSV = (csvText: string, opts: ConversionOptions): any[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length === 0) return []

    const result: any[] = []
    const delimiter = opts.delimiter
    const quoteChar = opts.quoteChar

    // Parse CSV lines
    const parseLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === quoteChar) {
          inQuotes = !inQuotes
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const parsedLines = lines.map(parseLine)

    if (opts.hasHeaders) {
      const headers = parsedLines[0]
      for (let i = 1; i < parsedLines.length; i++) {
        const values = parsedLines[i]
        const obj: any = {}
        
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        
        result.push(obj)
      }
    } else {
      for (let i = 0; i < parsedLines.length; i++) {
        result.push(parsedLines[i])
      }
    }

    return result
  }

  const convertCsvToJson = () => {
    if (!input.trim()) {
      setError('Please enter CSV data')
      return
    }

    try {
      setError(null)
      trackUsage()

      const parsedData = parseCSV(input, options)
      const jsonString = JSON.stringify(parsedData, null, options.indent)
      setOutput(jsonString)
    } catch (err) {
      setError('Failed to parse CSV. Please check your data format.')
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadJson = () => {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'converted-data.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
    setFileName('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
        setFileName(file.name.replace('.csv', ''))
        trackUsage()
      }
      reader.readAsText(file)
    }
  }

  const loadSampleData = () => {
    const sampleCSV = `name,age,city,occupation
John Doe,30,New York,Software Engineer
Jane Smith,25,Los Angeles,Designer
Bob Johnson,35,Chicago,Manager
Alice Brown,28,Houston,Developer
Charlie Wilson,32,Phoenix,Analyst`

    setInput(sampleCSV)
    setFileName('sample-data')
    trackUsage()
  }

  return (
    <ToolLayout
      toolId="csv-to-json"
      toolName="CSV to JSON Converter"
      toolDescription="Convert CSV data to JSON format with customizable options"
      toolCategory="Data Tools"
      toolIcon={<FileSpreadsheet className="w-8 h-8" />}
      action={{
        label: "Convert to JSON",
        onClick: convertCsvToJson,
        disabled: !input.trim()
      }}
    >
      <div className="space-y-6">
        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversion Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Has Headers</Label>
                <Select value={options.hasHeaders.toString()} onValueChange={(value) => setOptions(prev => ({ ...prev, hasHeaders: value === 'true' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Delimiter</Label>
                <Select value={options.delimiter} onValueChange={(value) => setOptions(prev => ({ ...prev, delimiter: value }))}>
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
                <Label>Quote Character</Label>
                <Select value={options.quoteChar} onValueChange={(value) => setOptions(prev => ({ ...prev, quoteChar: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='"">Double Quote (")</SelectItem>
                    <SelectItem value="'">Single Quote (')</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={options.outputFormat} onValueChange={(value) => setOptions(prev => ({ ...prev, outputFormat: value as 'array' | 'object' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="array">Array of Objects</SelectItem>
                    <SelectItem value="object">Single Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="indent">Indent Size</Label>
                <Input
                  id="indent"
                  type="number"
                  min="0"
                  max="8"
                  value={options.indent}
                  onChange={(e) => setOptions(prev => ({ ...prev, indent: parseInt(e.target.value) || 2 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">CSV Input</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="output">JSON Output</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CSV Input */}
              <Card>
                <CardHeader>
                  <CardTitle>CSV Data</CardTitle>
                  <CardDescription>
                    Enter your CSV data or use the sample data below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="name,age,city&#10;John,30,New York&#10;Jane,25,Los Angeles"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={10}
                      className="font-mono text-sm resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={loadSampleData}>
                      <FileText className="w-4 h-4 mr-1" />
                      Load Sample
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={clearAll}
                      disabled={!input && !output}
                    >
                      Clear All
                    </Button>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* JSON Output */}
              <Card>
                <CardHeader>
                  <CardTitle>JSON Output</CardTitle>
                  <CardDescription>
                    Your converted JSON data will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {output ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          <FileJson className="w-3 h-3 mr-1" />
                          {output.length} characters
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={copyToClipboard}>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadJson}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                        <pre className="text-sm leading-relaxed">
                          {output}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileJson className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Ready to convert</h3>
                      <p className="text-muted-foreground">
                        Enter CSV data above and click "Convert to JSON" to transform it
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Upload a CSV file to convert it to JSON format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">Drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                    </div>
                  </label>
                </div>

                {fileName && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      File loaded: {fileName}.csv
                    </p>
                  </div>
                )}

                {input && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>File Preview</Label>
                      <Badge variant="outline">
                        {input.split('\n').length} lines
                      </Badge>
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto">
                      <pre className="text-sm font-mono">
                        {input.split('\n').slice(0, 10).join('\n')}
                        {input.split('\n').length > 10 && '\n...'}
                      </pre>
                    </div>
                    <Button onClick={convertCsvToJson} className="w-full">
                      Convert Uploaded File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="output" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>JSON Output</CardTitle>
                <CardDescription>
                  View and download your converted JSON data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {output ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          <FileJson className="w-3 h-3 mr-1" />
                          {output.length} characters
                        </Badge>
                        <Badge variant="outline">
                          {JSON.parse(output).length} records
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadJson}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                      <pre className="text-sm leading-relaxed">
                        {output}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileJson className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No output yet</h3>
                    <p className="text-muted-foreground">
                      Convert some CSV data first to see the JSON output here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">About CSV to JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">What is CSV?</h4>
                  <p className="text-muted-foreground">
                    CSV (Comma-Separated Values) is a simple file format used to store tabular data, such as a spreadsheet or database.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">What is JSON?</h4>
                  <p className="text-muted-foreground">
                    JSON (JavaScript Object Notation) is a lightweight data-interchange format that's easy for humans to read and write.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Why Convert?</h4>
                  <p className="text-muted-foreground">
                    JSON is more flexible and widely used in web applications, APIs, and modern data processing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Flexible Delimiters</h4>
                  <p className="text-muted-foreground">
                    Supports comma, semicolon, tab, and pipe delimiters for different CSV formats.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Header Support</h4>
                  <p className="text-muted-foreground">
                    Automatically detects and uses headers to create properly structured JSON objects.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">File Upload</h4>
                  <p className="text-muted-foreground">
                    Upload CSV files directly from your computer for easy conversion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  )
}