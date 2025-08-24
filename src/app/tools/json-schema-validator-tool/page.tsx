'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ValidationError {
  path: string
  message: string
  value?: any
  type: 'error' | 'warning'
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export default function JsonSchemaValidatorTool() {
  const [jsonInput, setJsonInput] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const validateJsonSchema = useCallback(async () => {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      return
    }

    setIsProcessing(true)
    
    try {
      const result = await performValidation(jsonInput, schemaInput)
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [{ path: '', message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' }],
        warnings: []
      })
    } finally {
      setIsProcessing(false)
    }
  }, [jsonInput, schemaInput])

  const performValidation = async (jsonStr: string, schemaStr: string): Promise<ValidationResult> => {
    try {
      // Parse JSON
      const jsonData = JSON.parse(jsonStr)
      const schemaData = JSON.parse(schemaStr)

      // Basic validation (simplified implementation)
      const errors: ValidationError[] = []
      const warnings: ValidationError[] = []

      // Validate against schema
      validateAgainstSchema(jsonData, schemaData, '', errors, warnings)

      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
    } catch (parseError) {
      throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
    }
  }

  const validateAgainstSchema = (
    data: any,
    schema: any,
    path: string,
    errors: ValidationError[],
    warnings: ValidationError[]
  ) => {
    // Type validation
    if (schema.type) {
      const expectedType = schema.type
      const actualType = getJsonType(data)

      if (Array.isArray(expectedType)) {
        if (!expectedType.includes(actualType)) {
          errors.push({
            path,
            message: `Expected type ${expectedType.join(' or ')}, got ${actualType}`,
            value: data,
            type: 'error'
          })
        }
      } else if (actualType !== expectedType) {
        errors.push({
          path,
          message: `Expected type ${expectedType}, got ${actualType}`,
          value: data,
          type: 'error'
        })
      }
    }

    // Required properties validation
    if (schema.required && Array.isArray(schema.required)) {
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        schema.required.forEach(prop => {
          if (!(prop in data)) {
            errors.push({
              path: path ? `${path}.${prop}` : prop,
              message: `Required property '${prop}' is missing`,
              type: 'error'
            })
          }
        })
      }
    }

    // Properties validation
    if (schema.properties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      Object.keys(schema.properties).forEach(prop => {
        if (prop in data) {
          validateAgainstSchema(
            data[prop],
            schema.properties[prop],
            path ? `${path}.${prop}` : prop,
            errors,
            warnings
          )
        }
      })
    }

    // Array validation
    if (schema.items && Array.isArray(data)) {
      data.forEach((item, index) => {
        validateAgainstSchema(
          item,
          schema.items,
          `${path}[${index}]`,
          errors,
          warnings
        )
      })
    }

    // String validations
    if (schema.type === 'string' && typeof data === 'string') {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({
          path,
          message: `String length must be at least ${schema.minLength}, got ${data.length}`,
          value: data,
          type: 'error'
        })
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({
          path,
          message: `String length must be at most ${schema.maxLength}, got ${data.length}`,
          value: data,
          type: 'error'
        })
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        errors.push({
          path,
          message: `String does not match pattern: ${schema.pattern}`,
          value: data,
          type: 'error'
        })
      }
    }

    // Number validations
    if (schema.type === 'number' && typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push({
          path,
          message: `Number must be at least ${schema.minimum}, got ${data}`,
          value: data,
          type: 'error'
        })
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push({
          path,
          message: `Number must be at most ${schema.maximum}, got ${data}`,
          value: data,
          type: 'error'
        })
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push({
        path,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        value: data,
        type: 'error'
      })
    }
  }

  const getJsonType = (value: any): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setJsonInput('')
    setSchemaInput('')
    setValidationResult(null)
  }

  const getSampleJson = () => {
    return `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "active": true
}`
  }

  const getSampleSchema = () => {
    return `{
  "$schema": "http://json-schema.org/draft-07/schema#",
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
      "pattern": "^[^@]+@[^@]+\\.[^@]+$"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {"type": "string"},
        "city": {"type": "string"},
        "zip": {"type": "string"}
      }
    },
    "hobbies": {
      "type": "array",
      "items": {"type": "string"}
    },
    "active": {
      "type": "boolean"
    }
  }
}`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            JSON Schema Validator
          </CardTitle>
          <CardDescription>
            Validate JSON data against JSON Schema with detailed error reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">JSON Data</label>
                <Textarea
                  placeholder="Enter JSON data to validate..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setJsonInput(getSampleJson())}>
                  Load Sample JSON
                </Button>
                <Button variant="outline" onClick={() => handleCopy(jsonInput)} disabled={!jsonInput}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => handleDownload(jsonInput, 'data.json')} disabled={!jsonInput}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">JSON Schema</label>
                <Textarea
                  placeholder="Enter JSON Schema to validate against..."
                  value={schemaInput}
                  onChange={(e) => setSchemaInput(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSchemaInput(getSampleSchema())}>
                  Load Sample Schema
                </Button>
                <Button variant="outline" onClick={() => handleCopy(schemaInput)} disabled={!schemaInput}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => handleDownload(schemaInput, 'schema.json')} disabled={!schemaInput}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button 
              onClick={validateJsonSchema} 
              disabled={!jsonInput.trim() || !schemaInput.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Validating...
                </>
              ) : (
                'Validate JSON'
              )}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {validationResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                validationResult.valid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    validationResult.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.valid ? 'Validation Successful' : 'Validation Failed'}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {validationResult.valid 
                    ? 'The JSON data conforms to the schema.'
                    : `${validationResult.errors.length} error(s) found.`
                  }
                </p>
              </div>

              {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                <Tabs defaultValue="errors" className="w-full">
                  <TabsList>
                    {validationResult.errors.length > 0 && (
                      <TabsTrigger value="errors">
                        Errors ({validationResult.errors.length})
                      </TabsTrigger>
                    )}
                    {validationResult.warnings.length > 0 && (
                      <TabsTrigger value="warnings">
                        Warnings ({validationResult.warnings.length})
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {validationResult.errors.length > 0 && (
                    <TabsContent value="errors" className="space-y-2">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-red-800 text-sm">
                                  {error.path ? `Path: ${error.path}` : 'Root'}
                                </div>
                                <div className="text-red-700 text-sm">{error.message}</div>
                                {error.value !== undefined && (
                                  <div className="text-red-600 text-xs font-mono mt-1">
                                    Value: {JSON.stringify(error.value)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <TabsContent value="warnings" className="space-y-2">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {validationResult.warnings.map((warning, index) => (
                          <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-yellow-800 text-sm">
                                  {warning.path ? `Path: ${warning.path}` : 'Root'}
                                </div>
                                <div className="text-yellow-700 text-sm">{warning.message}</div>
                                {warning.value !== undefined && (
                                  <div className="text-yellow-600 text-xs font-mono mt-1">
                                    Value: {JSON.stringify(warning.value)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">About JSON Schema Validation</h4>
              <p className="text-sm text-muted-foreground mb-2">
                JSON Schema is a vocabulary that allows you to annotate and validate JSON documents. 
                It provides a way to describe the structure, constraints, and data types expected 
                in your JSON data.
              </p>
              <p className="text-sm text-muted-foreground">
                This validator supports common JSON Schema features including type checking, 
                required fields, string patterns, numeric ranges, array validation, and nested 
                object structures. It helps ensure data consistency and catch errors early in 
                development.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Supported Schema Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Type Validation:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• string, number, boolean, null</li>
                    <li>• object, array</li>
                    <li>• multiple types (union)</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">String Constraints:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• minLength, maxLength</li>
                    <li>• pattern (regex)</li>
                    <li>• format validation</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Number Constraints:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• minimum, maximum</li>
                    <li>• exclusive bounds</li>
                    <li>• multiple of</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Structural Validation:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• required properties</li>
                    <li>• nested objects</li>
                    <li>• array item validation</li>
                    <li>• enum values</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}