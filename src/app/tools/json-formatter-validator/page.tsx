'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, CheckCircle, XCircle, Minimize2, Maximize2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ValidationError {
  line: number
  column: number
  message: string
}

export default function JSONFormatterValidator() {
  const [inputJson, setInputJson] = useState('')
  const [formattedJson, setFormattedJson] = useState('')
  const [minifiedJson, setMinifiedJson] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [indentSize, setIndentSize] = useState(2)
  const [isFormatting, setIsFormatting] = useState(false)
  const { toast } = useToast()

  const formatJSON = (jsonString: string, indent: number): string => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, indent)
    } catch {
      return jsonString
    }
  }

  const minifyJSON = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed)
    } catch {
      return jsonString
    }
  }

  const validateJSON = (jsonString: string): { isValid: boolean; errors: ValidationError[] } => {
    try {
      JSON.parse(jsonString)
      return { isValid: true, errors: [] }
    } catch (error) {
      const validationErrors: ValidationError[] = []
      
      if (error instanceof SyntaxError) {
        const message = error.message
        const match = message.match(/position (\d+)/)
        const position = match ? parseInt(match[1]) : 0
        
        // Calculate line and column from position
        const lines = jsonString.slice(0, position).split('\n')
        const line = lines.length
        const column = lines[lines.length - 1].length + 1
        
        validationErrors.push({
          line,
          column,
          message: message.replace(/^Unexpected end of JSON input/, 'Unexpected end of JSON input')
                     .replace(/^Unexpected token/, 'Unexpected token')
                     .replace(/^Unexpected string/, 'Unexpected string')
                     .replace(/^Unexpected number/, 'Unexpected number')
                     .replace(/^Unexpected identifier/, 'Unexpected identifier')
        })
      }
      
      return { isValid: false, errors: validationErrors }
    }
  }

  const handleFormat = () => {
    if (!inputJson.trim()) return

    setIsFormatting(true)
    
    try {
      const formatted = formatJSON(inputJson, indentSize)
      const minified = minifyJSON(inputJson)
      const validation = validateJSON(inputJson)
      
      setFormattedJson(formatted)
      setMinifiedJson(minified)
      setIsValid(validation.isValid)
      setErrors(validation.errors)
    } catch (error) {
      setIsValid(false)
      setErrors([{
        line: 1,
        column: 1,
        message: 'An unexpected error occurred'
      }])
    } finally {
      setIsFormatting(false)
    }
  }

  const handleValidate = () => {
    if (!inputJson.trim()) return

    const validation = validateJSON(inputJson)
    setIsValid(validation.isValid)
    setErrors(validation.errors)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "JSON has been copied to clipboard",
    })
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

  const clearAll = () => {
    setInputJson('')
    setFormattedJson('')
    setMinifiedJson('')
    setIsValid(null)
    setErrors([])
  }

  const loadExample = () => {
    const example = {
      "name": "Example JSON",
      "version": "1.0.0",
      "description": "A sample JSON object for testing",
      "author": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "features": [
        "validation",
        "formatting",
        "minification"
      ],
      "settings": {
        "enabled": true,
        "maxItems": 100,
        "timeout": 5000
      }
    }
    
    setInputJson(JSON.stringify(example, null, 2))
    setIsValid(null)
    setErrors([])
  }

  const getCharacterCount = (text: string) => {
    return text.length
  }

  const getLineCount = (text: string) => {
    return text.split('\n').length
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            JSON Formatter & Validator
          </CardTitle>
          <CardDescription>
            Format, validate, and minify JSON with real-time syntax checking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="indent-size">Indent Size:</Label>
                <Select value={indentSize.toString()} onValueChange={(value) => setIndentSize(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleFormat} disabled={isFormatting || !inputJson.trim()}>
                  {isFormatting ? 'Formatting...' : 'Format JSON'}
                </Button>
                <Button variant="outline" onClick={handleValidate} disabled={!inputJson.trim()}>
                  Validate Only
                </Button>
                <Button variant="outline" onClick={loadExample}>
                  Load Example
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Input JSON:</Label>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{getCharacterCount(inputJson)} chars</span>
                  <span>{getLineCount(inputJson)} lines</span>
                </div>
              </div>
              <Textarea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder="Paste your JSON here..."
                className="min-h-48 font-mono text-sm"
              />
            </div>

            {/* Validation Results */}
            {isValid !== null && (
              <Card className={isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Valid JSON</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">Invalid JSON</span>
                      </>
                    )}
                  </div>
                  
                  {!isValid && errors.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-red-600">Errors:</div>
                      {errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-100 p-2 rounded">
                          Line {error.line}, Column {error.column}: {error.message}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {(formattedJson || minifiedJson) && (
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="minified">Minified</TabsTrigger>
                </TabsList>

                <TabsContent value="formatted" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Formatted JSON:</Label>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          <span>{getCharacterCount(formattedJson)} chars</span>
                          <span className="mx-2">•</span>
                          <span>{getLineCount(formattedJson)} lines</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(formattedJson)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadJSON(formattedJson, 'formatted.json')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{formattedJson}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="minified" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Minified JSON:</Label>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          <span>{getCharacterCount(minifiedJson)} chars</span>
                          <span className="mx-2">•</span>
                          <span>{getLineCount(minifiedJson)} lines</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(minifiedJson)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadJSON(minifiedJson, 'minified.json')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{minifiedJson}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* JSON Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">JSON Tips & Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Syntax Rules</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Use double quotes for keys and string values</li>
                      <li>• Separate key-value pairs with commas</li>
                      <li>• Use proper nesting with braces and brackets</li>
                      <li>• No trailing commas in arrays or objects</li>
                      <li>• Comments are not allowed in standard JSON</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Common Errors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Missing quotes around keys or strings</li>
                      <li>• Trailing commas in arrays or objects</li>
                      <li>• Incorrect nesting of brackets and braces</li>
                      <li>• Using single quotes instead of double quotes</li>
                      <li>• Comments or other non-JSON syntax</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JSON Schema Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Types in JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">String</Badge>
                    <div className="text-sm text-muted-foreground">"text"</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">Number</Badge>
                    <div className="text-sm text-muted-foreground">42</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">Boolean</Badge>
                    <div className="text-sm text-muted-foreground">true/false</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">Array</Badge>
                    <div className="text-sm text-muted-foreground">[1, 2, 3]</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">Object</Badge>
                    <div className="text-sm text-muted-foreground">{`{"key": "value"}`}</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">Null</Badge>
                    <div className="text-sm text-muted-foreground">null</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}