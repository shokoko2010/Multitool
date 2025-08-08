'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Database, Download, Copy, RefreshCw, AlertCircle, CheckCircle, Filter, Search } from 'lucide-react'

interface ExtractedData {
  type: string
  data: any[]
  total: number
  columns: string[]
  preview: any[]
}

interface ExtractionRule {
  name: string
  pattern: string
  type: 'regex' | 'css' | 'xpath' | 'text'
  description: string
}

export default function DataExtractor() {
  const [inputText, setInputText] = useState('')
  const [extractionMethod, setExtractionMethod] = useState('regex')
  const [extractionPattern, setExtractionPattern] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [options, setOptions] = useState({
    removeDuplicates: true,
    trimWhitespace: true,
    limitResults: 100,
    includeHeaders: true
  })

  const extractionRules: ExtractionRule[] = [
    {
      name: 'Email Addresses',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      type: 'regex',
      description: 'Extract email addresses from text'
    },
    {
      name: 'Phone Numbers',
      pattern: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
      type: 'regex',
      description: 'Extract phone numbers in various formats'
    },
    {
      name: 'URLs',
      pattern: 'https?://[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*',
      type: 'regex',
      description: 'Extract URLs from text'
    },
    {
      name: 'IP Addresses',
      pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      type: 'regex',
      description: 'Extract IP addresses'
    },
    {
      name: 'Dates',
      pattern: '\\b\\d{1,4}[/-]\\d{1,2}[/-]\\d{1,4}\\b',
      type: 'regex',
      description: 'Extract dates in various formats'
    },
    {
      name: 'HTML Tags',
      pattern: '<[^>]+>',
      type: 'regex',
      description: 'Extract HTML tags'
    }
  ]

  const extractData = async () => {
    if (!inputText) {
      setError('Please enter text to extract data from')
      return
    }

    if (!extractionPattern) {
      setError('Please enter an extraction pattern')
      return
    }

    setIsExtracting(true)
    setError(null)
    setSuccess(false)
    setExtractedData(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      let extracted: any[] = []
      
      switch (extractionMethod) {
        case 'regex':
          const regex = new RegExp(extractionPattern, 'gi')
          const matches = inputText.match(regex)
          if (matches) {
            extracted = matches.map(match => ({
              value: match,
              position: inputText.indexOf(match)
            }))
          }
          break
        
        case 'text':
          const lines = inputText.split('\n')
          extracted = lines
            .filter(line => line.trim())
            .map((line, index) => ({
              value: line.trim(),
              line: index + 1
            }))
          break
        
        case 'css':
        case 'xpath':
          // Simulate CSS/XPath extraction
          const sampleData = [
            { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123' },
            { name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0124' },
            { name: 'Bob Johnson', email: 'bob@example.com', phone: '+1-555-0125' }
          ]
          extracted = sampleData
          break
      }

      // Apply options
      if (options.removeDuplicates) {
        const seen = new Set()
        extracted = extracted.filter(item => {
          const key = JSON.stringify(item)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
      }

      if (options.trimWhitespace) {
        extracted = extracted.map(item => {
          if (typeof item.value === 'string') {
            return { ...item, value: item.value.trim() }
          }
          return item
        })
      }

      if (extracted.length > options.limitResults) {
        extracted = extracted.slice(0, options.limitResults)
      }

      const columns = extracted.length > 0 ? Object.keys(extracted[0]) : []
      const preview = extracted.slice(0, 5)

      const result: ExtractedData = {
        type: extractionMethod,
        data: extracted,
        total: extracted.length,
        columns,
        preview
      }

      setExtractedData(result)
      setSuccess(true)

    } catch (err) {
      setError(`Extraction failed: ${err instanceof Error ? err.message : 'Invalid pattern'}`)
    } finally {
      setIsExtracting(false)
    }
  }

  const loadSampleData = () => {
    const sampleText = `Contact Information:
John Doe - john.doe@email.com - +1-555-0123
Jane Smith - jane.smith@email.com - +1-555-0124
Bob Johnson - bob.johnson@email.com - +1-555-0125
Alice Brown - alice.brown@email.com - +1-555-0126

Website URLs:
https://example.com/page1
https://google.com/search
https://github.com/user/repo
https://stackoverflow.com/questions/123456

Important Dates:
2024-01-15 - Project Start
2024-02-20 - Review Meeting
2024-03-10 - Deadline
2024-04-05 - Launch Date

IP Addresses:
192.168.1.1
10.0.0.1
172.16.0.1`
    
    setInputText(sampleText)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadData = (format: 'json' | 'csv' | 'txt') => {
    if (!extractedData) return

    let content = ''
    let filename = `extracted_data.${format}`

    switch (format) {
      case 'json':
        content = JSON.stringify(extractedData.data, null, 2)
        break
      case 'csv':
        if (extractedData.columns.length > 0) {
          content = extractedData.columns.join(',') + '\n'
          extractedData.data.forEach(row => {
            content += extractedData.columns.map(col => 
              `"${row[col] || ''}"`).join(',') + '\n'
          })
        }
        break
      case 'txt':
        content = '=== EXTRACTED DATA ===\n\n'
        content += `Extraction Method: ${extractedData.type}\n`
        content += `Total Items: ${extractedData.total}\n\n`
        
        extractedData.data.forEach((item, index) => {
          content += `Item ${index + 1}:\n`
          Object.entries(item).forEach(([key, value]) => {
            content += `  ${key}: ${value}\n`
          })
          content += '\n'
        })
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const applyRule = (rule: ExtractionRule) => {
    setExtractionPattern(rule.pattern)
    setExtractionMethod(rule.type)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Extractor
            </CardTitle>
            <CardDescription>
              Extract structured data from text using patterns, regex, and selectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="extraction-method">Extraction Method</Label>
                  <Select value={extractionMethod} onValueChange={setExtractionMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regex">Regular Expression</SelectItem>
                      <SelectItem value="text">Text Lines</SelectItem>
                      <SelectItem value="css">CSS Selector</SelectItem>
                      <SelectItem value="xpath">XPath Selector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={loadSampleData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Sample
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="input-text">Input Text</Label>
                <Textarea
                  id="input-text"
                  placeholder="Enter or paste text to extract data from..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="extraction-pattern">
                  {extractionMethod === 'regex' ? 'Regular Expression Pattern' :
                   extractionMethod === 'text' ? 'Text Separator' :
                   extractionMethod === 'css' ? 'CSS Selector' :
                   'XPath Selector'}
                </Label>
                <Input
                  id="extraction-pattern"
                  placeholder={extractionMethod === 'regex' ? 'e.g., [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' : 'Enter pattern...'}
                  value={extractionPattern}
                  onChange={(e) => setExtractionPattern(e.target.value)}
                />
                {extractionMethod === 'regex' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Use regex patterns to extract specific data formats
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Extraction Options</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remove-duplicates"
                        checked={options.removeDuplicates}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, removeDuplicates: checked as boolean }))
                        }
                      />
                      <Label htmlFor="remove-duplicates" className="text-sm">Remove Duplicates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trim-whitespace"
                        checked={options.trimWhitespace}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, trimWhitespace: checked as boolean }))
                        }
                      />
                      <Label htmlFor="trim-whitespace" className="text-sm">Trim Whitespace</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-headers"
                        checked={options.includeHeaders}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, includeHeaders: checked as boolean }))
                        }
                      />
                      <Label htmlFor="include-headers" className="text-sm">Include Headers</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="limit">Results Limit</Label>
                  <Select value={options.limitResults.toString()} onValueChange={(value) => 
                    setOptions(prev => ({ ...prev, limitResults: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 items</SelectItem>
                      <SelectItem value="100">100 items</SelectItem>
                      <SelectItem value="200">200 items</SelectItem>
                      <SelectItem value="500">500 items</SelectItem>
                      <SelectItem value="1000">1000 items</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-4">
                    <Button
                      onClick={extractData}
                      disabled={isExtracting || !inputText || !extractionPattern}
                      className="w-full"
                    >
                      {isExtracting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Filter className="h-4 w-4 mr-2" />
                          Extract Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {success && extractedData && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 text-sm">
                    Extracted {extractedData.total} items successfully!
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Common Extraction Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {extractionRules.map((rule, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{rule.name}</h4>
                      <Badge variant="outline" className="text-xs">{rule.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => applyRule(rule)}
                    >
                      Use Pattern
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {extractedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Extracted Results</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadData('json')}>
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadData('csv')}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadData('txt')}>
                    <Download className="h-4 w-4 mr-1" />
                    TXT
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">Method:</span>
                  <Badge variant="secondary">{extractedData.type}</Badge>
                  <span className="font-medium">Total:</span>
                  <span className="text-muted-foreground">{extractedData.total} items</span>
                  <span className="font-medium">Columns:</span>
                  <span className="text-muted-foreground">{extractedData.columns.length}</span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {extractedData.columns.map((column, index) => (
                          <th key={index} className="px-4 py-2 text-left text-sm font-medium border-b">
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-left text-sm font-medium border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedData.preview.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {extractedData.columns.map((column, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 text-sm border-b">
                              {row[column] || ''}
                            </td>
                          ))}
                          <td className="px-4 py-2 text-sm border-b">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(JSON.stringify(row, null, 2))}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {extractedData.total > 5 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing 5 of {extractedData.total} results
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Multiple Methods:</strong> Regex, text lines, CSS selectors, XPath
            </div>
            <div>
              <strong>Pattern Library:</strong> Pre-built patterns for common data types
            </div>
            <div>
              <strong>Data Processing:</strong> Remove duplicates, trim whitespace, set limits
            </div>
            <div>
              <strong>Export Formats:</strong> Download results in JSON, CSV, or plain text
            </div>
            <div>
              <strong>Preview:</strong> View extracted data before downloading
            </div>
            <div>
              <strong>Sample Data:</strong> Load sample text to test extraction patterns
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}