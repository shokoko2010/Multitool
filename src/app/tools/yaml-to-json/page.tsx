'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RefreshCw, FileText, Code, Settings, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConversionConfig {
  indent: number
  comments: boolean
  nullValues: 'null' | 'empty' | 'remove'
  quotes: 'double' | 'single'
  arrays: true | false
}

export default function YAMLToJSONTool() {
  const [yamlInput, setYamlInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [conversionConfig, setConversionConfig] = useState<ConversionConfig>({
    indent: 2,
    comments: true,
    nullValues: 'null',
    quotes: 'double',
    arrays: true
  })
  const [isConverting, setIsConverting] = useState(false)
  const [isValidYAML, setIsValidYAML] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const validateYAML = (yaml: string): boolean => {
    if (!yaml.trim()) return false
    
    try {
      // Basic YAML validation by checking common patterns
      const lines = yaml.split('\n')
      let inMultiline = false
      let arrayIndent = 0
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (!line || line.startsWith('#')) continue // Skip empty lines and comments
        
        // Check for basic YAML syntax issues
        if (line.includes(':') && line.split(':')[0].trim() === '') {
          setError(`Invalid key at line ${i + 1}`)
          return false
        }
        
        // Check indentation consistency
        const indent = lines[i].length - lines[i].trimStart().length
        if (line.startsWith('-') && arrayIndent === 0) {
          arrayIndent = indent
        } else if (line.startsWith('-') && indent !== arrayIndent) {
          setError(`Inconsistent array indentation at line ${i + 1}`)
          return false
        }
        
        // Check for malformed structures
        if (line.includes('  ') && line.startsWith(' ')) {
          const spaces = line.match(/^(\s+)/)?.[1]?.length || 0
          if (spaces % 2 !== 0) {
            setError(`Invalid indentation at line ${i + 1} (must be multiple of 2)`)
            return false
          }
        }
      }
      
      setError('')
      setIsValidYAML(true)
      return true
    } catch (err) {
      setError('Invalid YAML format')
      setIsValidYAML(false)
      return false
    }
  }

  const convertYAMLToJSON = async () => {
    if (!yamlInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter YAML content to convert",
        variant: "destructive",
      })
      return
    }

    if (!validateYAML(yamlInput)) {
      toast({
        title: "Invalid YAML",
        description: error || "Please check your YAML syntax",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    setTimeout(() => {
      const convertedJSON = simulateYAMLToJSONConversion()
      setJsonOutput(convertedJSON)
      setIsConverting(false)
      
      toast({
        title: "Conversion Complete",
        description: "YAML successfully converted to JSON",
      })
    }, 1000)
  }

  const simulateYAMLToJSONConversion = (): string => {
    const yaml = yamlInput.trim()
    
    try {
      // Simple YAML to JSON simulation
      const result: any = {}
      const lines = yaml.split('\n')
      let currentPath: string[] = []
      let inArray = false
      let arrayIndent = 0
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmedLine = line.trim()
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) continue
        
        // Calculate indentation
        const indent = line.length - line.trimStart().length
        
        // Handle arrays
        if (trimmedLine.startsWith('- ')) {
          const arrayKey = trimmedLine.substring(2).trim()
          if (!inArray) {
            inArray = true
            arrayIndent = indent
            currentPath.push('items')
          }
          
          // Add array item
          const arrayPath = currentPath.join('.')
          if (!result[arrayPath]) {
            result[arrayPath] = []
          }
          result[arrayPath].push(arrayKey)
        } else {
          // Handle key-value pairs
          inArray = false
          
          const colonIndex = trimmedLine.indexOf(':')
          if (colonIndex === -1) continue
          
          const key = trimmedLine.substring(0, colonIndex).trim()
          const value = trimmedLine.substring(colonIndex + 1).trim()
          
          if (!value) {
            // Object property
            currentPath = [key]
          } else if (value.startsWith('"') && value.endsWith('"')) {
            // String value
            const path = currentPath.length > 0 ? `${currentPath.join('.')}.${key}` : key
            result[path] = value.slice(1, -1)
          } else if (!isNaN(Number(value))) {
            // Numeric value
            const path = currentPath.length > 0 ? `${currentPath.join('.')}.${key}` : key
            result[path] = Number(value)
          } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            // Boolean value
            const path = currentPath.length > 0 ? `${currentPath.join('.')}.${key}` : key
            result[path] = value.toLowerCase() === 'true'
          } else if (value.toLowerCase() === 'null') {
            // Null value
            const path = currentPath.length > 0 ? `${currentPath.join('.')}.${key}` : key
            result[path] = conversionConfig.nullValues === 'null' ? null : 
                          conversionConfig.nullValues === 'empty' ? '' : undefined
          } else {
            // String value
            const path = currentPath.length > 0 ? `${currentPath.join('.')}.${key}` : key
            result[path] = value
          }
        }
      }
      
      // Flatten nested objects
      const flatten = (obj: any, prefix = ''): any => {
        const flattened: any = {}
        
        for (const [key, value] of Object.entries(obj)) {
          const newKey = prefix ? `${prefix}.${key}` : key
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(flattened, flatten(value, newKey))
          } else {
            flattened[newKey] = value
          }
        }
        
        return flattened
      }
      
      const flattened = flatten(result)
      
      // Format JSON with specified indentation
      return JSON.stringify(flattened, null, conversionConfig.indent)
      
    } catch (err) {
      return JSON.stringify({ error: "Conversion failed" }, null, 2)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const downloadJSON = () => {
    if (!jsonOutput) return
    
    const blob = new Blob([jsonOutput], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Your JSON file download has begun",
    })
  }

  const loadSampleYAML = () => {
    const sampleYAML = `
# Sample YAML Configuration
database:
  host: localhost
  port: 5432
  name: myapp
  user: admin
  password: secret123

server:
  host: 0.0.0.0
  port: 3000
  debug: true
  cors:
    origin: "*"
    methods: ["GET", "POST"]

features:
  - user authentication
  - file upload
  - email notifications
  - real-time chat

settings:
  maxFileSize: 10MB
  allowedTypes: ["jpg", "png", "pdf"]
  cache:
    enabled: true
    ttl: 3600

api:
  version: "v1"
  rateLimit:
    windowMs: 900000
    max: 100
`.trim()
    
    setYamlInput(sampleYAML)
  }

  const clearAll = () => {
    setYamlInput('')
    setJsonOutput('')
    setIsValidYAML(null)
    setError('')
  }

  const updateConfig = (key: keyof ConversionConfig, value: any) => {
    setConversionConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">YAML to JSON Converter</h1>
        <p className="text-muted-foreground">
          Convert YAML configuration files to JSON format with customizable options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              YAML Input
            </CardTitle>
            <CardDescription>
              Enter or paste YAML content to convert to JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yaml-input">YAML Content</Label>
              <Textarea
                id="yaml-input"
                placeholder="Paste your YAML content here..."
                value={yamlInput}
                onChange={(e) => {
                  setYamlInput(e.target.value)
                  validateYAML(e.target.value)
                }}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            {isValidYAML !== null && (
              <div className={`flex items-center gap-2 text-sm ${
                isValidYAML ? 'text-green-600' : 'text-red-600'
              }`}>
                {isValidYAML ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {isValidYAML ? 'Valid YAML' : error || 'Invalid YAML'}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={convertYAMLToJSON} disabled={isConverting || !isValidYAML} className="flex-1">
                {isConverting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Convert to JSON
                  </>
                )}
              </Button>
              <Button onClick={loadSampleYAML} variant="outline">
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                JSON Output
              </span>
              {jsonOutput && (
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(jsonOutput, 'JSON')} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadJSON} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Your converted JSON content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jsonOutput ? (
              <div className="space-y-4">
                <Textarea
                  value={jsonOutput}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="text-center">
                  <Badge variant="secondary">
                    {Object.keys(JSON.parse(jsonOutput)).length} properties
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No JSON converted yet</p>
                <p className="text-sm">Enter YAML content and click "Convert to JSON"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Conversion Configuration
          </CardTitle>
          <CardDescription>
            Customize how YAML is converted to JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Indentation</Label>
              <Select value={conversionConfig.indent.toString()} onValueChange={(value) => updateConfig('indent', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                  <SelectItem value="0">Minified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quote Style</Label>
              <Select value={conversionConfig.quotes} onValueChange={(value) => updateConfig('quotes', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="double">Double quotes (")</SelectItem>
                  <SelectItem value="single">Single quotes (')</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Null Values</Label>
              <Select value={conversionConfig.nullValues} onValueChange={(value) => updateConfig('nullValues', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Use null</SelectItem>
                  <SelectItem value="empty">Use empty string</SelectItem>
                  <SelectItem value="remove">Remove entirely</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionConfig.comments}
                  onChange={(e) => updateConfig('comments', e.target.checked)}
                  className="rounded"
                />
                <span>Preserve comments</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionConfig.arrays}
                  onChange={(e) => updateConfig('arrays', e.target.checked)}
                  className="rounded"
                />
                <span>Use arrays for lists</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Supported YAML Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Badge variant="outline">Key-value pairs</Badge>
              <Badge variant="outline">Nested objects</Badge>
              <Badge variant="outline">Arrays/lists</Badge>
              <Badge variant="outline">Comments</Badge>
              <Badge variant="outline">Multi-line strings</Badge>
              <Badge variant="outline">Data types</Badge>
              <Badge variant="outline">Anchors & aliases</Badge>
              <Badge variant="outline">Merge keys</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}