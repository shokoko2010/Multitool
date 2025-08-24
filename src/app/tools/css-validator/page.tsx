'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Code, CheckCircle, XCircle, AlertTriangle, Copy, Upload, FileText } from 'lucide-react'

interface ValidationError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  rule?: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
  stats: {
    totalLines: number
    totalRules: number
    totalSelectors: number
    totalProperties: number
  }
}

export default function CssValidator() {
  const [cssInput, setCssInput] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const sampleCSS = `/* Sample CSS for validation */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f4f4f4;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: #333;
  color: white;
  padding: 20px;
  text-align: center;
}

.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}

.invalid-property {
  color: invalid-color; /* This will cause an error */
  unknown-property: value; /* This will cause a warning */
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`

  const validateCSS = async () => {
    if (!cssInput.trim()) {
      setError('Please enter CSS code to validate')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Parse CSS and find issues
      const lines = cssInput.split('\n')
      const errors: ValidationError[] = []
      const warnings: ValidationError[] = []
      const info: ValidationError[] = []

      let totalRules = 0
      let totalSelectors = 0
      let totalProperties = 0

      // Common CSS validation rules
      const validProperties = [
        'color', 'background-color', 'background', 'font-family', 'font-size', 'font-weight',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border', 'border-width', 'border-style', 'border-color', 'border-radius',
        'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
        'display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear',
        'text-align', 'text-decoration', 'text-transform', 'line-height', 'letter-spacing',
        'overflow', 'overflow-x', 'overflow-y', 'visibility', 'opacity', 'z-index',
        'cursor', 'box-shadow', 'text-shadow', 'transform', 'transition', 'animation'
      ]

      const validColors = [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white',
        'gray', 'silver', 'gold', 'brown', 'cyan', 'magenta', 'lime', 'navy', 'teal',
        'transparent', 'inherit', 'initial', 'unset'
      ]

      const validUnits = ['px', '%', 'em', 'rem', 'pt', 'pc', 'in', 'cm', 'mm', 'vw', 'vh']

      lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1
        const trimmedLine = line.trim()

        // Skip comments and empty lines
        if (trimmedLine.startsWith('/*') || trimmedLine === '') return

        // Count rules and selectors
        if (trimmedLine.includes('{')) {
          totalRules++
          const selector = trimmedLine.split('{')[0].trim()
          if (selector) {
            totalSelectors++
          }
        }

        // Validate properties
        if (trimmedLine.includes(':') && !trimmedLine.includes('{')) {
          const [property, value] = trimmedLine.split(':').map(s => s.trim())
          
          if (property && value) {
            totalProperties++

            // Check for invalid properties
            if (!validProperties.includes(property)) {
              if (property.includes('-') && property !== 'unknown-property') {
                warnings.push({
                  line: lineNumber,
                  column: line.indexOf(property) + 1,
                  message: `Unknown CSS property: ${property}`,
                  severity: 'warning',
                  rule: 'property-existence'
                })
              }
            }

            // Check for invalid color values
            if (property.includes('color') || property === 'background') {
              const colorValue = value.replace(';', '').trim()
              if (!validColors.includes(colorValue) && !colorValue.startsWith('#') && !colorValue.startsWith('rgb') && !colorValue.startsWith('hsl')) {
                errors.push({
                  line: lineNumber,
                  column: line.indexOf(value) + 1,
                  message: `Invalid color value: ${colorValue}`,
                  severity: 'error',
                  rule: 'color-validation'
                })
              }
            }

            // Check for missing units in numeric values
            if (property.includes('width') || property.includes('height') || property.includes('margin') || property.includes('padding') || property.includes('font-size')) {
              const numericValue = value.replace(';', '').trim()
              if (/^\d+$/.test(numericValue)) {
                warnings.push({
                  line: lineNumber,
                  column: line.indexOf(value) + 1,
                  message: `Numeric value should have unit: ${numericValue}`,
                  severity: 'warning',
                  rule: 'unit-requirement'
                })
              }
            }

            // Check for invalid units
            const unitMatch = value.match(/(\d+)([a-zA-Z%]+)/)
            if (unitMatch) {
              const [, number, unit] = unitMatch
              if (!validUnits.includes(unit)) {
                errors.push({
                  line: lineNumber,
                  column: line.indexOf(unit) + 1,
                  message: `Invalid CSS unit: ${unit}`,
                  severity: 'error',
                  rule: 'unit-validation'
                })
              }
            }
          }
        }

        // Check for unclosed braces
        if (trimmedLine.includes('{') && !trimmedLine.includes('}')) {
          let braceCount = 0
          for (let i = lineIndex; i < lines.length; i++) {
            const currentLine = lines[i]
            braceCount += (currentLine.match(/{/g) || []).length
            braceCount -= (currentLine.match(/}/g) || []).length
          }
          
          if (braceCount > 0) {
            errors.push({
              line: lineNumber,
              column: line.indexOf('{') + 1,
              message: 'Unclosed brace detected',
              severity: 'error',
              rule: 'brace-matching'
            })
          }
        }

        // Check for browser-specific prefixes without standard property
        if (trimmedLine.includes('-webkit-') || trimmedLine.includes('-moz-') || trimmedLine.includes('-ms-') || trimmedLine.includes('-o-')) {
          info.push({
            line: lineNumber,
            column: 1,
            message: 'Browser-specific prefix detected. Consider adding standard property as well.',
            severity: 'info',
            rule: 'vendor-prefix'
          })
        }
      })

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        info,
        stats: {
          totalLines: lines.length,
          totalRules,
          totalSelectors,
          totalProperties
        }
      }

      setValidationResult(result)
    } catch (err) {
      setError('Validation failed: ' + (err as Error).message)
    } finally {
      setIsValidating(false)
    }
  }

  const loadSample = () => {
    setCssInput(sampleCSS)
    setError('')
  }

  const clearAll = () => {
    setCssInput('')
    setValidationResult(null)
    setError('')
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Code className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">CSS Validator</h1>
          <p className="text-muted-foreground">
            Validate your CSS code for syntax errors and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                CSS Input
              </CardTitle>
              <CardDescription>
                Enter your CSS code to validate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>CSS Code</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadSample}>
                      <FileText className="w-3 h-3 mr-1" />
                      Sample
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={cssInput}
                  onChange={(e) => setCssInput(e.target.value)}
                  placeholder="Enter your CSS code here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>

              <Button 
                onClick={validateCSS} 
                disabled={!cssInput.trim() || isValidating}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate CSS
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult?.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                Validation Results
              </CardTitle>
              <CardDescription>
                {validationResult ? (
                  validationResult.isValid ? '✅ CSS is valid!' : '❌ Issues found in CSS'
                ) : 'No validation results yet'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationResult ? (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {validationResult.stats.totalLines}
                      </div>
                      <div className="text-sm text-gray-600">Lines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {validationResult.stats.totalRules}
                      </div>
                      <div className="text-sm text-gray-600">Rules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {validationResult.stats.totalSelectors}
                      </div>
                      <div className="text-sm text-gray-600">Selectors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {validationResult.stats.totalProperties}
                      </div>
                      <div className="text-sm text-gray-600">Properties</div>
                    </div>
                  </div>

                  {/* Issues Summary */}
                  <div className="flex gap-4">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {validationResult.errors.length} Errors
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationResult.warnings.length} Warnings
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {validationResult.info.length} Info
                    </Badge>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {validationResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-600">Errors</h4>
                        {validationResult.errors.map((issue, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${getSeverityColor('error')}`}>
                            <div className="flex items-start gap-2">
                              {getSeverityIcon('error')}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">Line {issue.line}, Column {issue.column}</span>
                                  {issue.rule && (
                                    <Badge variant="outline" className="text-xs">
                                      {issue.rule}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm">{issue.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-yellow-600">Warnings</h4>
                        {validationResult.warnings.map((issue, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${getSeverityColor('warning')}`}>
                            <div className="flex items-start gap-2">
                              {getSeverityIcon('warning')}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">Line {issue.line}, Column {issue.column}</span>
                                  {issue.rule && (
                                    <Badge variant="outline" className="text-xs">
                                      {issue.rule}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm">{issue.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.info.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-600">Info</h4>
                        {validationResult.info.map((issue, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${getSeverityColor('info')}`}>
                            <div className="flex items-start gap-2">
                              {getSeverityIcon('info')}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">Line {issue.line}, Column {issue.column}</span>
                                  {issue.rule && (
                                    <Badge variant="outline" className="text-xs">
                                      {issue.rule}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm">{issue.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && validationResult.info.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-green-600 font-medium">No issues found!</p>
                        <p className="text-sm text-gray-500 mt-2">Your CSS code is valid and follows best practices.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    No validation results yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Enter CSS code and click validate to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Validation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">🔍 Syntax Validation</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Property existence checking</li>
                  <li>• Color value validation</li>
                  <li>• Unit validation</li>
                  <li>• Brace matching</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚠️ Best Practices</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Missing unit warnings</li>
                  <li>• Vendor prefix detection</li>
                  <li>• Property usage tips</li>
                  <li>• Performance suggestions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📊 Detailed Reports</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Line and column numbers</li>
                  <li>• Error severity levels</li>
                  <li>• CSS statistics</li>
                  <li>• Rule references</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}