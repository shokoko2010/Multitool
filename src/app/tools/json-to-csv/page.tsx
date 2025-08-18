'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileJson, FileSpreadsheet, RotateCcw, Upload, Eye } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface ConversionOptions {
  delimiter: string
  includeHeaders: boolean
  dateFormat: string
}

interface ConversionResult {
  csvData: string
  rowCount: number
  columnCount: number
  headers: string[]
  preview: string[]
  downloadUrl?: string
}

interface SampleData {
  sampleJson: string
  options: {
    delimiters: string[]
    dateFormats: string[]
    includeHeaders: boolean
  }
  features: string[]
}

export default function JsonToCsvConverter() {
  const [jsonData, setJsonData] = useState('')
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: ',',
    includeHeaders: true,
    dateFormat: 'iso'
  })
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sampleData, setSampleData] = useState<SampleData | null>(null)
  
  const { trackUsage } = useToolAccess('json-to-csv')

  useEffect(() => {
    // Load sample data and options
    fetchSampleData()
  }, [])

  const fetchSampleData = async () => {
    try {
      const response = await fetch('/api/data-tools/json-to-csv')
      const data = await response.json()
      setSampleData(data)
    } catch (err) {
      console.error('Failed to load sample data:', err)
    }
  }

  const handleConvert = async () => {
    if (!jsonData.trim()) {
      setError('JSON data is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before converting
      await trackUsage()

      const response = await fetch('/api/data-tools/json-to-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonData,
          ...options
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert JSON to CSV')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    if (sampleData?.sampleJson) {
      setJsonData(sampleData.sampleJson)
      setResult(null)
      setError(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCsv = () => {
    if (result?.downloadUrl) {
      const link = document.createElement('a')
      link.href = result.downloadUrl
      link.download = 'converted-data.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearAll = () => {
    setJsonData('')
    setResult(null)
    setError(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setJsonData(content)
        setResult(null)
        setError(null)
      }
      reader.readAsText(file)
    }
  }

  const getDelimiterLabel = (delimiter: string): string => {
    switch (delimiter) {
      case ',':
        return 'Comma (,)'
      case ';':
        return 'Semicolon (;)'
      case '|':
        return 'Pipe (|)'
      case '\t':
        return 'Tab'
      default:
        return delimiter
    }
  }

  const getDateFormatLabel = (format: string): string => {
    switch (format) {
      case 'iso':
        return 'ISO Format'
      case 'local':
        return 'Local Format'
      case 'utc':
        return 'UTC Format'
      case 'timestamp':
        return 'Timestamp'
      default:
        return format
    }
  }

  return (
    <ToolLayout
      toolId="json-to-csv"
      toolName="JSON to CSV Converter"
      toolDescription="Convert JSON data to CSV format with customizable options"
      toolCategory="Data Tools"
      toolIcon={<FileSpreadsheet className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>JSON Data Input</CardTitle>
            <CardDescription>
              Enter your JSON data or upload a file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload JSON File</Label>
              <div className="flex gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline" onClick={loadSampleData}>
                  <Upload className="w-4 h-4 mr-2" />
                  Sample
                </Button>
              </div>
            </div>

            {/* JSON Input */}
            <div className="space-y-2">
              <Label htmlFor="json-data">JSON Data</Label>
              <Textarea
                id="json-data"
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Enter your JSON data here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Conversion Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Conversion Options</Label>
              
              {/* Delimiter */}
              <div className="space-y-2">
                <Label htmlFor="delimiter">Delimiter</Label>
                <Select value={options.delimiter} onValueChange={(value) => setOptions(prev => ({ ...prev, delimiter: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleData?.options.delimiters.map((delim) => (
                      <SelectItem key={delim} value={delim}>
                        {getDelimiterLabel(delim)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Format */}
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={options.dateFormat} onValueChange={(value) => setOptions(prev => ({ ...prev, dateFormat: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleData?.options.dateFormats.map((format) => (
                      <SelectItem key={format} value={format}>
                        {getDateFormatLabel(format)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Include Headers */}
              <div className="flex items-center justify-between">
                <Label htmlFor="include-headers">Include Headers</Label>
                <Switch
                  id="include-headers"
                  checked={options.includeHeaders}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeHeaders: checked }))}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleConvert}
                className="flex-1"
                disabled={loading || !jsonData.trim()}
              >
                {loading ? 'Converting...' : 'Convert to CSV'}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Output</CardTitle>
            <CardDescription>
              Your converted CSV data will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileSpreadsheet className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Converting JSON to CSV...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{result.rowCount}</div>
                    <div className="text-sm text-blue-700">Rows</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{result.columnCount}</div>
                    <div className="text-sm text-green-700">Columns</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{getDelimiterLabel(options.delimiter)}</div>
                    <div className="text-sm text-purple-700">Delimiter</div>
                  </div>
                </div>

                {/* Headers */}
                {result.headers.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Headers ({result.headers.length})</Label>
                    <div className="flex flex-wrap gap-1">
                      {result.headers.map((header, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {header}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview (First {result.preview.length} lines)</Label>
                  <div className="border rounded-lg p-3 bg-muted/50 max-h-60 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {result.preview.join('\n')}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.csvData)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCsv}>
                    <Download className="w-4 h-4 mr-1" />
                    Download CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}>
                    <Eye className="w-4 h-4 mr-1" />
                    Copy Stats
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileJson className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to convert</h3>
                <p className="text-muted-foreground">
                  Enter your JSON data and click "Convert to CSV" to transform it
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">JSON to CSV Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🔄 Conversion Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Flattens nested JSON objects</li>
                <li>• Handles arrays by joining with semicolon</li>
                <li>• Supports custom delimiters</li>
                <li>• Automatic CSV escaping</li>
                <li>• Date formatting options</li>
                <li>• Optional header row</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Data Handling</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Supports single objects and arrays</li>
                <li>• Preserves data types</li>
                <li>• Handles null and undefined values</li>
                <li>• Real-time preview generation</li>
                <li>• Row and column statistics</li>
                <li>• Direct download capability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}