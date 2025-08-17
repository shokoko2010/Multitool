'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, Download, FileText, Braces, CheckCircle, AlertCircle } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface FormatOptions {
  indentSize: number
  indentType: 'spaces' | 'tabs'
  sortKeys: boolean
  removeQuotes: boolean
}

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<FormatOptions>({
    indentSize: 2,
    indentType: 'spaces',
    sortKeys: false,
    removeQuotes: false
  })

  const { trackUsage } = useToolAccess('json-formatter')

  const formatJSON = async () => {
    if (!input.trim()) {
      setError('Please enter JSON data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before formatting
      await trackUsage()

      // Parse and format JSON
      const parsed = JSON.parse(input)
      
      let formatted = JSON.stringify(parsed, null, options.indentType === 'spaces' ? options.indentSize : '\t')
      
      // Apply additional options
      if (options.sortKeys && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const sorted = {}
        Object.keys(parsed).sort().forEach(key => {
          sorted[key] = parsed[key]
        })
        formatted = JSON.stringify(sorted, null, options.indentType === 'spaces' ? options.indentSize : '\t')
      }

      if (options.removeQuotes) {
        // This is a simplified version - in practice, removing quotes is complex
        // and might break JSON validity, so we'll keep it simple
        formatted = formatted.replace(/"([^"]+)":/g, '$1:')
      }

      setOutput(formatted)
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      setOutput('')
      setIsValid(false)
    } finally {
      setLoading(false)
    }
  }

  const minifyJSON = async () => {
    if (!input.trim()) {
      setError('Please enter JSON data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before minifying
      await trackUsage()

      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      
      setOutput(minified)
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      setOutput('')
      setIsValid(false)
    } finally {
      setLoading(false)
    }
  }

  const validateJSON = () => {
    if (!input.trim()) {
      setError('Please enter JSON data')
      setIsValid(null)
      return
    }

    try {
      JSON.parse(input)
      setIsValid(true)
      setError(null)
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadJSON = () => {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' })
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
    setInput('')
    setOutput('')
    setError(null)
    setIsValid(null)
  }

  const loadSample = () => {
    const sample = {
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zip": "12345"
      },
      "hobbies": ["reading", "swimming", "coding"],
      "active": true,
      "metadata": {
        "created": "2024-01-01T00:00:00Z",
        "updated": "2024-01-02T00:00:00Z"
      }
    }
    setInput(JSON.stringify(sample, null, 2))
    setError(null)
    setIsValid(true)
  }

  return (
    <ToolLayout
      toolId="json-formatter"
      toolName="JSON Formatter"
      toolDescription="Format, validate, and minify JSON data with ease"
      toolCategory="Developer Tools"
      toolIcon={<Braces className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input JSON</CardTitle>
            <CardDescription>
              Enter your JSON data to format or validate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">JSON Data</label>
                <div className="flex items-center gap-2">
                  {isValid === true && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  )}
                  {isValid === false && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </div>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your JSON data here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={validateJSON}>
                Validate
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Formatted JSON</CardTitle>
            <CardDescription>
              Your formatted JSON will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Result</label>
                {output && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadJSON}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted JSON will appear here..."
                rows={12}
                className="font-mono text-sm bg-muted/50"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={formatJSON}
                disabled={loading || !input.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  'Format JSON'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={minifyJSON}
                disabled={loading || !input.trim()}
              >
                Minify
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Format Options */}
      <Card>
        <CardHeader>
          <CardTitle>Format Options</CardTitle>
          <CardDescription>
            Customize how your JSON is formatted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Indent Size</label>
              <Select 
                value={options.indentSize.toString()} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, indentSize: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Indent Type</label>
              <Select 
                value={options.indentType} 
                onValueChange={(value: 'spaces' | 'tabs') => setOptions(prev => ({ ...prev, indentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spaces">Spaces</SelectItem>
                  <SelectItem value="tabs">Tabs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort Keys</label>
              <Select 
                value={options.sortKeys.toString()} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, sortKeys: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Keep Order</SelectItem>
                  <SelectItem value="true">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quote Style</label>
              <Select 
                value={options.removeQuotes.toString()} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, removeQuotes: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">With Quotes</SelectItem>
                  <SelectItem value="true">Without Quotes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">JSON Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 Syntax</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use double quotes for keys</li>
                <li>• Separate items with commas</li>
                <li>• Use brackets for arrays</li>
                <li>• Use braces for objects</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Best Practices</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Validate before using</li>
                <li>• Use consistent formatting</li>
                <li>• Keep it readable</li>
                <li>• Remove unnecessary data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Real-time validation</li>
                <li>• Custom formatting</li>
                <li>• Error highlighting</li>
                <li>• Export options</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}