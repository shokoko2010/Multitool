'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText, FileCode, AlertCircle } from 'lucide-react'

export default function YamlToJsonConverterTool() {
  const [inputYaml, setInputYaml] = useState('')
  const [outputJson, setOutputJson] = useState('')
  const [indentation, setIndentation] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [error, setError] = useState('')

  const convertYamlToJson = useCallback(() => {
    if (!inputYaml.trim()) {
      setError('Please enter YAML data to convert')
      return
    }

    try {
      const jsonData = parseYaml(inputYaml)
      const jsonString = JSON.stringify(jsonData, sortKeys ? Object.keys(jsonData).sort() : null, indentation)
      setOutputJson(jsonString)
      setError('')
    } catch (parseError) {
      setError(`Conversion error: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
    }
  }, [inputYaml, indentation, sortKeys])

  const parseYaml = (yaml: string): any => {
    const lines = yaml.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    let result: any = {}
    let currentContext: any = result
    const contextStack: any[] = [result]
    let currentIndent = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      if (!trimmed) continue

      // Calculate indentation
      const indent = line.length - line.trimStart().length
      const indentLevel = Math.floor(indent / 2)

      // Handle context based on indentation
      while (contextStack.length > 1 && indentLevel < currentIndent) {
        currentContext = contextStack.pop()
        currentIndent--
      }

      // Handle different YAML structures
      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':')
        const value = valueParts.join(':').trim()
        const cleanKey = key.trim()

        if (!value) {
          // This is a nested object or array
          if (cleanKey.endsWith('-')) {
            // Array item
            const arrayKey = cleanKey.slice(0, -1).trim()
            if (!currentContext[arrayKey]) {
              currentContext[arrayKey] = []
            }
            currentContext[arrayKey].push({})
            contextStack.push(currentContext)
            currentContext = currentContext[arrayKey][currentContext[arrayKey].length - 1]
            currentIndent++
          } else {
            // Nested object
            if (!currentContext[cleanKey]) {
              currentContext[cleanKey] = {}
            }
            contextStack.push(currentContext)
            currentContext = currentContext[cleanKey]
            currentIndent++
          }
        } else {
          // Key-value pair
          currentContext[cleanKey] = parseValue(value)
        }
      } else if (trimmed.startsWith('- ')) {
        // Array item
        const value = trimmed.slice(2).trim()
        const parsedValue = parseValue(value)
        
        if (!Array.isArray(currentContext)) {
          // Convert to array if not already
          const parent = contextStack[contextStack.length - 1]
          const keys = Object.keys(parent)
          const lastKey = keys[keys.length - 1]
          parent[lastKey] = [parsedValue]
          currentContext = parent[lastKey]
        } else {
          currentContext.push(parsedValue)
        }
      }
    }

    return result
  }

  const parseValue = (value: string): any => {
    const trimmed = value.trim()

    // Remove quotes if present
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1)
    }
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1)
    }

    // Handle null
    if (trimmed === 'null' || trimmed === 'Null' || trimmed === 'NULL' || trimmed === '~') {
      return null
    }

    // Handle booleans
    if (trimmed === 'true' || trimmed === 'True' || trimmed === 'TRUE') {
      return true
    }
    if (trimmed === 'false' || trimmed === 'False' || trimmed === 'FALSE') {
      return false
    }

    // Handle numbers
    if (/^-?\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10)
    }
    if (/^-?\d+\.\d+$/.test(trimmed)) {
      return parseFloat(trimmed)
    }

    // Handle scientific notation
    if (/^-?\d+\.?\d*[eE][+-]?\d+$/.test(trimmed)) {
      return parseFloat(trimmed)
    }

    // Handle special strings
    if (trimmed === '|') {
      return '' // Multi-line string (simplified)
    }
    if (trimmed === '>') {
      return '' // Folded string (simplified)
    }

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
        setInputYaml(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInputYaml('')
    setOutputJson('')
    setError('')
  }

  const getSampleData = () => {
    return `# Sample Configuration
app:
  name: "My Application"
  version: 1.0.0
  debug: true
  port: 3000

database:
  host: "localhost"
  port: 5432
  name: "myapp_db"
  user: "admin"
  password: "secret123"
  
  ssl:
    enabled: false
    cert: null

features:
  - "authentication"
  - "logging"
  - "monitoring"

environment:
  development:
    debug: true
    log_level: "debug"
  production:
    debug: false
    log_level: "info"

metadata:
  created_at: "2024-01-01T00:00:00Z"
  updated_at: null
  tags: ["web", "api", "database"]`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            YAML to JSON Converter
          </CardTitle>
          <CardDescription>
            Convert YAML data to JSON format with customizable formatting options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yaml-input">YAML Input</Label>
                <Textarea
                  id="yaml-input"
                  placeholder="Enter YAML data to convert to JSON..."
                  value={inputYaml}
                  onChange={(e) => setInputYaml(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Indentation</Label>
                  <Select value={indentation.toString()} onValueChange={(value) => setIndentation(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Minified</SelectItem>
                      <SelectItem value="2">2 Spaces</SelectItem>
                      <SelectItem value="4">4 Spaces</SelectItem>
                      <SelectItem value="8">8 Spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sort-keys"
                      checked={sortKeys}
                      onChange={(e) => setSortKeys(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="sort-keys">Sort Keys</Label>
                  </div>
                </div>

                <div className="space-y-2 flex items-end">
                  <Button onClick={convertYamlToJson} disabled={!inputYaml.trim()} className="w-full">
                    <FileCode className="h-4 w-4 mr-2" />
                    Convert to JSON
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="outline" onClick={() => setInputYaml(getSampleData())}>
                  Load Sample
                </Button>
                <div className="flex-1" />
                <input
                  type="file"
                  accept=".yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload YAML
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>YAML Features Supported</Label>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                  <div>
                    <div className="font-medium">Data Types:</div>
                    <div className="text-muted-foreground">Strings, Numbers, Booleans, Null</div>
                  </div>
                  <div>
                    <div className="font-medium">Structures:</div>
                    <div className="text-muted-foreground">Objects, Arrays, Nested data</div>
                  </div>
                  <div>
                    <div className="font-medium">Syntax:</div>
                    <div className="text-muted-foreground">Key-value pairs, Lists, Comments</div>
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
              <h4 className="font-medium mb-2">About YAML to JSON Conversion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                This tool converts YAML (YAML Ain't Markup Language) data to JSON format. 
                YAML is a human-readable data serialization standard that is commonly used 
                for configuration files and data exchange.
              </p>
              <p className="text-sm text-muted-foreground">
                The converter handles YAML's indentation-based syntax, various data types, 
                and nested structures. It automatically detects and converts YAML data types 
                to their JSON equivalents while preserving the hierarchical structure.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">YAML Syntax Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Key-Value Pairs:</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    name: "John"<br/>
                    age: 30<br/>
                    active: true
                  </div>
                </div>
                <div>
                  <div className="font-medium">Arrays:</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    items:<br/>
                    &nbsp;&nbsp;- "item1"<br/>
                    &nbsp;&nbsp;- "item2"
                  </div>
                </div>
                <div>
                  <div className="font-medium">Nested Objects:</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    user:<br/>
                    &nbsp;&nbsp;name: "John"<br/>
                    &nbsp;&nbsp;address:<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;city: "NYC"
                  </div>
                </div>
                <div>
                  <div className="font-medium">Data Types:</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    string: "hello"<br/>
                    number: 42<br/>
                    boolean: true<br/>
                    null: null
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}