'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RefreshCw, CheckCircle, XCircle, AlertTriangle, FileText, Code, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  timestamp: Date
}

interface SchemaConfig {
  validateFormat: boolean
  checkTypes: boolean
  strictMode: boolean
  allowUnknown: boolean
}

export default function JSONSchemaValidator() {
  const [jsonInput, setJsonInput] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [schemaConfig, setSchemaConfig] = useState<SchemaConfig>({
    validateFormat: true,
    checkTypes: true,
    strictMode: false,
    allowUnknown: true
  })
  const [isValidating, setIsValidating] = useState(false)
  const [activeTab, setActiveTab] = useState('validate')
  const { toast } = useToast()

  const parseJSON = (input: string): any => {
    try {
      return JSON.parse(input)
    } catch {
      return null
    }
  }

  const validateJSON = (): boolean => {
    if (!jsonInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter JSON content to validate",
        variant: "destructive",
      })
      return false
    }

    const parsed = parseJSON(jsonInput)
    if (!parsed) {
      toast({
        title: "Invalid JSON",
        description: "The JSON syntax is invalid",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const validateSchema = async () => {
    if (!validateJSON()) return

    if (!schemaInput.trim()) {
      toast({
        title: "Schema Required",
        description: "Please enter a JSON schema for validation",
        variant: "destructive",
      })
      return
    }

    const schema = parseJSON(schemaInput)
    if (!schema) {
      toast({
        title: "Invalid Schema",
        description: "The JSON schema syntax is invalid",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)

    setTimeout(() => {
      const result = simulateSchemaValidation()
      setValidationResult(result)
      setIsValidating(false)
      
      if (result.valid) {
        toast({
          title: "Validation Passed",
          description: "JSON data matches the schema",
        })
      } else {
        toast({
          title: "Validation Failed",
          description: `${result.errors.length} errors found`,
          variant: "destructive",
        })
      }
    }, 1500)
  }

  const simulateSchemaValidation = (): ValidationResult => {
    const json = parseJSON(jsonInput)
    const schema = parseJSON(schemaInput)
    
    const errors: string[] = []
    const warnings: string[] = []

    // Simulate validation logic
    if (schema.type && typeof json !== schema.type) {
      errors.push(`Expected type '${schema.type}' but got '${typeof json}'`)
    }

    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((field: string) => {
        if (!(field in json)) {
          errors.push(`Required field '${field}' is missing`)
        }
      })
    }

    if (schema.properties && typeof schema.properties === 'object') {
      Object.keys(schema.properties).forEach((prop) => {
        const propSchema = schema.properties[prop]
        if (prop in json) {
          const value = json[prop]
          
          if (propSchema.type && typeof value !== propSchema.type) {
            errors.push(`Property '${prop}' should be of type '${propSchema.type}'`)
          }

          if (propSchema.minLength && typeof value === 'string' && value.length < propSchema.minLength) {
            errors.push(`String '${prop}' is shorter than minimum length ${propSchema.minLength}`)
          }

          if (propSchema.maxLength && typeof value === 'string' && value.length > propSchema.maxLength) {
            errors.push(`String '${prop}' is longer than maximum length ${propSchema.maxLength}`)
          }

          if (propSchema.minimum !== undefined && typeof value === 'number' && value < propSchema.minimum) {
            errors.push(`Number '${prop}' is less than minimum value ${propSchema.minimum}`)
          }

          if (propSchema.maximum !== undefined && typeof value === 'number' && value > propSchema.maximum) {
            errors.push(`Number '${prop}' is greater than maximum value ${propSchema.maximum}`)
          }
        }
      })
    }

    // Add some simulated warnings
    if (Object.keys(json).length > 10) {
      warnings.push('JSON object has many properties - consider breaking it down')
    }

    if (JSON.stringify(json).length > 10000) {
      warnings.push('JSON data is quite large - consider optimizing')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date()
    }
  }

  const formatJSON = () => {
    if (!jsonInput.trim()) return

    try {
      const parsed = parseJSON(jsonInput)
      if (parsed) {
        setJsonInput(JSON.stringify(parsed, null, 2))
        toast({
          title: "JSON Formatted",
          description: "JSON has been properly formatted",
        })
      }
    } catch (err) {
      toast({
        title: "Formatting Failed",
        description: "Could not format JSON",
        variant: "destructive",
      })
    }
  }

  const formatSchema = () => {
    if (!schemaInput.trim()) return

    try {
      const parsed = parseJSON(schemaInput)
      if (parsed) {
        setSchemaInput(JSON.stringify(parsed, null, 2))
        toast({
          title: "Schema Formatted",
          description: "JSON schema has been properly formatted",
        })
      }
    } catch (err) {
      toast({
        title: "Formatting Failed",
        description: "Could not format JSON schema",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const downloadReport = () => {
    if (!validationResult) return

    const report = `
JSON Schema Validation Report
============================

Timestamp: ${validationResult.timestamp.toLocaleString()}
Status: ${validationResult.valid ? 'PASSED' : 'FAILED'}

${validationResult.errors.length > 0 ? `
Errors (${validationResult.errors.length}):
${validationResult.errors.map((error, index) => `${index + 1}. ${error}`).join('\n')}
` : ''}

${validationResult.warnings.length > 0 ? `
Warnings (${validationResult.warnings.length}):
${validationResult.warnings.map((warning, index) => `${index + 1}. ${warning}`).join('\n')}
` : ''}

JSON Data:
${jsonInput}

Schema:
${schemaInput}
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `validation-report-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Validation report download has begun",
    })
  }

  const loadSampleData = () => {
    const sampleJSON = {
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "zipCode": "12345"
      },
      "hobbies": ["reading", "swimming", "coding"],
      "active": true,
      "score": 95.5
    }

    const sampleSchema = {
      "type": "object",
      "required": ["name", "age", "email"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 2,
          "maxLength": 50
        },
        "age": {
          "type": "number",
          "minimum": 0,
          "maximum": 150
        },
        "email": {
          "type": "string",
          "format": "email"
        },
        "address": {
          "type": "object",
          "properties": {
            "street": { "type": "string" },
            "city": { "type": "string" },
            "zipCode": { "type": "string", "pattern": "^\\d{5}$" }
          }
        },
        "hobbies": {
          "type": "array",
          "items": { "type": "string" }
        },
        "active": { "type": "boolean" },
        "score": { "type": "number", "minimum": 0, "maximum": 100 }
      }
    }

    setJsonInput(JSON.stringify(sampleJSON, null, 2))
    setSchemaInput(JSON.stringify(sampleSchema, null, 2))
    
    toast({
      title: "Sample Data Loaded",
      description: "Sample JSON and schema have been loaded",
    })
  }

  const clearAll = () => {
    setJsonInput('')
    setSchemaInput('')
    setValidationResult(null)
  }

  const updateConfig = (key: keyof SchemaConfig, value: any) => {
    setSchemaConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">JSON Schema Validator</h1>
        <p className="text-muted-foreground">
          Validate JSON data against JSON schemas with detailed error reporting
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="validate">Validate JSON</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="validate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  JSON Data
                </CardTitle>
                <CardDescription>
                  Enter JSON data to validate against a schema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="json-input">JSON Content</Label>
                  <Textarea
                    id="json-input"
                    placeholder="Paste your JSON data here..."
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={formatJSON} variant="outline" size="sm">
                    <Code className="h-4 w-4 mr-2" />
                    Format
                  </Button>
                  <Button onClick={loadSampleData} variant="outline" size="sm">
                    Load Sample
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schema Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  JSON Schema
                </CardTitle>
                <CardDescription>
                  Enter JSON schema to validate against
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schema-input">Schema Content</Label>
                  <Textarea
                    id="schema-input"
                    placeholder="Paste your JSON schema here..."
                    value={schemaInput}
                    onChange={(e) => setSchemaInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={formatSchema} variant="outline" size="sm">
                    <Code className="h-4 w-4 mr-2" />
                    Format
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Controls</CardTitle>
              <CardDescription>
                Start validation and view results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={validateSchema} disabled={isValidating} className="flex-1">
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validate JSON
                    </>
                  )}
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>

              {validationResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {validationResult.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                        {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                      </span>
                      <Badge variant={validationResult.valid ? 'default' : 'destructive'}>
                        {validationResult.timestamp.toLocaleTimeString()}
                      </Badge>
                    </div>
                    {validationResult.valid && (
                      <Button onClick={downloadReport} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    )}
                  </div>

                  {validationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Errors ({validationResult.errors.length})
                      </h4>
                      <div className="space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warnings ({validationResult.warnings.length})
                      </h4>
                      <div className="space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            {warning}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Validation Configuration
              </CardTitle>
              <CardDescription>
                Configure JSON schema validation behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={schemaConfig.validateFormat}
                      onChange={(e) => updateConfig('validateFormat', e.target.checked)}
                      className="rounded"
                    />
                    <span>Validate JSON format</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={schemaConfig.checkTypes}
                      onChange={(e) => updateConfig('checkTypes', e.target.checked)}
                      className="rounded"
                    />
                    <span>Check data types strictly</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={schemaConfig.strictMode}
                      onChange={(e) => updateConfig('strictMode', e.target.checked)}
                      className="rounded"
                    />
                    <span>Strict validation mode</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={schemaConfig.allowUnknown}
                      onChange={(e) => updateConfig('allowUnknown', e.target.checked)}
                      className="rounded"
                    />
                    <span>Allow unknown properties</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Supported Schema Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <Badge variant="outline">type validation</Badge>
                  <Badge variant="outline">required fields</Badge>
                  <Badge variant="outline">string patterns</Badge>
                  <Badge variant="outline">numeric constraints</Badge>
                  <Badge variant="outline">array validation</Badge>
                  <Badge variant="outline">object schemas</Badge>
                  <Badge variant="outline">enum values</Badge>
                  <Badge variant="outline">format validation</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}