'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Braces, Copy, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function JSONFormatter() {
  const [inputJson, setInputJson] = useState('')
  const [formattedJson, setFormattedJson] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState('2')
  const [isCopied, setIsCopied] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const formatJson = () => {
    try {
      if (!inputJson.trim()) {
        setError('Please enter JSON data')
        setFormattedJson('')
        setIsValid(false)
        return
      }

      const parsed = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize))
      setFormattedJson(formatted)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setFormattedJson('')
      setIsValid(false)
    }
  }

  const minifyJson = () => {
    try {
      if (!inputJson.trim()) {
        setError('Please enter JSON data')
        setFormattedJson('')
        setIsValid(false)
        return
      }

      const parsed = JSON.parse(inputJson)
      const minified = JSON.stringify(parsed)
      setFormattedJson(minified)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setFormattedJson('')
      setIsValid(false)
    }
  }

  const validateJson = () => {
    try {
      if (!inputJson.trim()) {
        setError('Please enter JSON data')
        setIsValid(false)
        return
      }

      JSON.parse(inputJson)
      setError('JSON is valid!')
      setIsValid(true)
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsValid(false)
    }
  }

  const copyToClipboard = async () => {
    if (formattedJson) {
      try {
        await navigator.clipboard.writeText(formattedJson)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const downloadJson = () => {
    if (formattedJson) {
      const blob = new Blob([formattedJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'formatted.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInputJson('')
    setFormattedJson('')
    setError('')
    setIsValid(false)
  }

  const loadSample = () => {
    const sampleJson = {
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA"
      },
      "hobbies": ["reading", "swimming", "coding"],
      "isActive": true,
      "metadata": {
        "created": "2024-01-01T00:00:00Z",
        "updated": "2024-01-15T12:30:00Z"
      }
    }
    setInputJson(JSON.stringify(sampleJson, null, 2))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Braces className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">JSON Formatter</h1>
            </div>
            <p className="text-muted-foreground">
              Format, validate, and beautify JSON data with ease
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Input JSON
                </CardTitle>
                <CardDescription>
                  Paste your JSON data here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  className="min-h-[400px] font-mono text-sm"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={loadSample} variant="outline" size="sm">
                    Load Sample
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear
                  </Button>
                  <Select value={indentSize} onValueChange={setIndentSize}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                      <SelectItem value="tab">Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className={`flex items-center gap-2 p-3 rounded-md ${
                    isValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {isValid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Braces className="w-5 h-5" />
                  Formatted JSON
                </CardTitle>
                <CardDescription>
                  Formatted and validated JSON output
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={formattedJson}
                  readOnly
                  placeholder="Formatted JSON will appear here..."
                  className="min-h-[400px] font-mono text-sm bg-muted/50"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={formatJson} disabled={!inputJson.trim()}>
                    Format
                  </Button>
                  <Button onClick={minifyJson} variant="outline" disabled={!inputJson.trim()}>
                    Minify
                  </Button>
                  <Button onClick={validateJson} variant="outline" disabled={!inputJson.trim()}>
                    Validate
                  </Button>
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline" 
                    disabled={!formattedJson}
                    className="flex items-center gap-2"
                  >
                    {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button 
                    onClick={downloadJson} 
                    variant="outline" 
                    disabled={!formattedJson}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                {formattedJson && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {formattedJson.split('\n').length} lines
                    </Badge>
                    <Badge variant="secondary">
                      {formattedJson.length} characters
                    </Badge>
                    <Badge variant="secondary">
                      Size: {(new Blob([formattedJson]).size / 1024).toFixed(2)} KB
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="formatting" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="formatting">Formatting</TabsTrigger>
                  <TabsTrigger value="validation">Validation</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                
                <TabsContent value="formatting" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">JSON Formatting Options:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Choose between 2, 4, or 8 spaces for indentation</li>
                      <li>• Use tab character for indentation</li>
                      <li>• Minify JSON to remove all whitespace</li>
                      <li>• Preserve JSON structure and data types</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="validation" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">JSON Validation:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Real-time syntax checking</li>
                      <li>• Detailed error messages with line numbers</li>
                      <li>• Support for all JSON data types</li>
                      <li>• Validates nested objects and arrays</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Common Use Cases:</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">API Responses</p>
                        <p className="text-xs text-muted-foreground">Format JSON responses from REST APIs</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Configuration Files</p>
                        <p className="text-xs text-muted-foreground">Beautify package.json, tsconfig.json, etc.</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Data Exchange</p>
                        <p className="text-xs text-muted-foreground">Format JSON for data transfer between systems</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tips" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Pro Tips:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Use the "Load Sample" button to test the formatter</li>
                      <li>• Copy formatted JSON with one click</li>
                      <li>• Download formatted JSON as a file</li>
                      <li>• Use minify option for production JSON</li>
                      <li>• Validate JSON before using in applications</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}