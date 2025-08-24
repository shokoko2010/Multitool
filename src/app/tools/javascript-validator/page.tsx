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
  codeSnippet?: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
  stats: {
    totalLines: number
    totalFunctions: number
    totalVariables: number
    totalLoops: number
    totalConditionals: number
    complexityScore: number
    hasStrictMode: boolean
    hasUseStrict: boolean
  }
}

export default function JavaScriptValidator() {
  const [jsInput, setJsInput] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const sampleJS = `// Sample JavaScript for validation
'use strict';

function greetUser(name) {
    // Missing parameter validation
    const greeting = "Hello, " + name + "!";
    console.log(greeting);
    
    return greeting;
}

function calculateTotal(items) {
    let total = 0;
    
    // Potential issue: no type checking
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    
    // Unused variable
    const tax = total * 0.08;
    
    return total;
}

// Deprecated function
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Modern ES6+ syntax
const user = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
};

const { name, age } = user;

// Arrow function with potential issues
const processData = (data) => {
    // No error handling
    return data.map(item => item.value * 2);
};

// Console.log in production code
console.log('Debug information:', user);

// Undefined variable usage
console.log(undefinedVariable);`

  const validateJavaScript = async () => {
    if (!jsInput.trim()) {
      setError('Please enter JavaScript code to validate')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const lines = jsInput.split('\n')
      const errors: ValidationError[] = []
      const warnings: ValidationError[] = []
      const info: ValidationError[] = []

      let totalFunctions = 0
      let totalVariables = 0
      let totalLoops = 0
      let totalConditionals = 0
      let complexityScore = 0
      let hasStrictMode = false
      let hasUseStrict = false

      // Track variable scope and usage
      const declaredVariables: Set<string> = new Set()
      const usedVariables: Set<string> = new Set()
      const functionScopes: string[] = ['global']

      // Common JavaScript issues and patterns
      const deprecatedMethods = ['escape', 'unescape']
      const globalVariables = ['undefined', 'NaN', 'Infinity', 'eval', 'arguments']
      const suspiciousMethods = ['eval', 'Function', 'setTimeout', 'setInterval']
      const consoleMethods = ['log', 'warn', 'error', 'info', 'debug']

      lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1
        const trimmedLine = line.trim()
        const originalLine = line

        // Skip empty lines and comments
        if (trimmedLine === '' || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
          return
        }

        // Check for strict mode
        if (trimmedLine.includes('use strict')) {
          hasUseStrict = true
          hasStrictMode = true
          info.push({
            line: lineNumber,
            column: originalLine.indexOf('use strict') + 1,
            message: 'Strict mode enabled - good practice!',
            severity: 'info',
            rule: 'strict-mode'
          })
        }

        // Count functions
        if (trimmedLine.match(/function\s+\w+\s*\(/) || trimmedLine.match(/=>/)) {
          totalFunctions++
          complexityScore += 2
        }

        // Count variables
        const varMatches = trimmedLine.match(/(?:var|let|const)\s+(\w+)/g)
        if (varMatches) {
          totalVariables += varMatches.length
          varMatches.forEach(match => {
            const varName = match.split(' ')[1]
            declaredVariables.add(varName)
          })
        }

        // Count loops
        if (trimmedLine.match(/for\s*\(|while\s*\(|do\s*\{/)) {
          totalLoops++
          complexityScore += 3
        }

        // Count conditionals
        if (trimmedLine.match(/if\s*\(|else\s+if|switch\s*\(|case\s+|default:/)) {
          totalConditionals++
          complexityScore += 2
        }

        // Check for deprecated methods
        deprecatedMethods.forEach(method => {
          if (trimmedLine.includes(method + '(')) {
            warnings.push({
              line: lineNumber,
              column: originalLine.indexOf(method) + 1,
              message: `Deprecated method '${method}' detected`,
              severity: 'warning',
              rule: 'deprecated-method',
              codeSnippet: method
            })
          }
        })

        // Check for eval usage
        if (trimmedLine.includes('eval(')) {
          errors.push({
            line: lineNumber,
            column: originalLine.indexOf('eval') + 1,
            message: "Avoid using eval() - security risk",
            severity: 'error',
            rule: 'no-eval',
            codeSnippet: 'eval'
          })
        }

        // Check for suspicious methods
        suspiciousMethods.forEach(method => {
          if (trimmedLine.includes(method + '(') && method !== 'eval') {
            warnings.push({
              line: lineNumber,
              column: originalLine.indexOf(method) + 1,
              message: `Use of '${method}' detected - review for security implications`,
              severity: 'warning',
              rule: 'suspicious-method',
              codeSnippet: method
            })
          }
        })

        // Check for console methods in production
        consoleMethods.forEach(method => {
          const consolePattern = `console.${method}(`
          if (trimmedLine.includes(consolePattern)) {
            warnings.push({
              line: lineNumber,
              column: originalLine.indexOf('console') + 1,
              message: `Console.${method} found - remove in production code`,
              severity: 'warning',
              rule: 'no-console',
              codeSnippet: `console.${method}`
            })
          }
        })

        // Check for var usage (prefer let/const)
        if (trimmedLine.match(/\bvar\s+\w+/)) {
          warnings.push({
            line: lineNumber,
            column: originalLine.indexOf('var') + 1,
            message: 'Consider using let or const instead of var',
            severity: 'warning',
            rule: 'prefer-const-let',
            codeSnippet: 'var'
          })
        }

        // Check for undefined variables
        const undefinedVarPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\s*[(=])/g
        let match
        while ((match = undefinedVarPattern.exec(trimmedLine)) !== null) {
          const varName = match[1]
          
          if (!declaredVariables.has(varName) && 
              !globalVariables.includes(varName) &&
              !varName.match(/^(if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|delete|typeof|instanceof|in|of|true|false|null|this|function|class|extends|super|import|export|default|async|await|yield|void)$/)) {
            
            // Skip if it's a method call or property access
            if (!trimmedLine.includes(varName + '.') && !trimmedLine.includes(varName + '(')) {
              usedVariables.add(varName)
            }
          }
        }

        // Check for missing semicolons
        if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && !trimmedLine.includes('//')) {
          const lastChar = trimmedLine[trimmedLine.length - 1]
          if (lastChar.match(/[a-zA-Z0-9)\]]/)) {
            warnings.push({
              line: lineNumber,
              column: trimmedLine.length,
              message: 'Missing semicolon',
              severity: 'warning',
              rule: 'semi'
            })
          }
        }

        // Check for potential null/undefined issues
        if (trimmedLine.includes('.') && !trimmedLine.includes('?.') && !trimmedLine.includes('||')) {
          const parts = trimmedLine.split('.')
          if (parts.length > 1) {
            const objectName = parts[0].trim()
            if (objectName && !declaredVariables.has(objectName) && !globalVariables.includes(objectName)) {
              warnings.push({
                line: lineNumber,
                column: originalLine.indexOf('.') + 1,
                message: `Potential null/undefined access on '${objectName}'`,
                severity: 'warning',
                rule: 'no-unsafe-access',
                codeSnippet: objectName
              })
            }
          }
        }

        // Check for magic numbers
        const magicNumberPattern = /[^a-zA-Z0-9_](\d+)(?![a-zA-Z])/g
        while ((match = magicNumberPattern.exec(trimmedLine)) !== null) {
          const number = match[1]
          if (number.length > 1 && !['0', '1', '2'].includes(number)) {
            info.push({
              line: lineNumber,
              column: match.index + 1,
              message: `Consider using named constants instead of magic number ${number}`,
              severity: 'info',
              rule: 'no-magic-numbers',
              codeSnippet: number
            })
          }
        }

        // Check for nested ternary operators
        const ternaryCount = (trimmedLine.match(/\?/g) || []).length
        if (ternaryCount > 1) {
          warnings.push({
            line: lineNumber,
            column: 1,
            message: 'Multiple ternary operators - consider using if/else for better readability',
            severity: 'warning',
            rule: 'no-nested-ternary'
          })
        }

        // Check for function complexity
        if (trimmedLine.match(/function\s+\w+\s*\(/)) {
          const functionBody = []
          let braceCount = 0
          let functionStart = lineIndex
          
          for (let i = lineIndex; i < lines.length; i++) {
            const currentLine = lines[i]
            braceCount += (currentLine.match(/{/g) || []).length
            braceCount -= (currentLine.match(/}/g) || []).length
            functionBody.push(currentLine)
            
            if (braceCount === 0 && i > lineIndex) break
          }
          
          const functionText = functionBody.join('\n')
          const functionComplexity = 
            (functionText.match(/if\s*\(/g) || []).length * 2 +
            (functionText.match(/for\s*\(/g) || []).length * 3 +
            (functionText.match(/while\s*\(/g) || []).length * 3 +
            (functionText.match(/switch\s*\(/g) || []).length * 2 +
            (functionText.match(/\?\s*/g) || []).length * 1
          
          if (functionComplexity > 10) {
            warnings.push({
              line: lineNumber,
              column: 1,
              message: `Function complexity score: ${functionComplexity}. Consider breaking it down.`,
              severity: 'warning',
              rule: 'complexity'
            })
          }
        }
      })

      // Check for undefined variables at the end
      usedVariables.forEach(varName => {
        if (!declaredVariables.has(varName) && !globalVariables.includes(varName)) {
          errors.push({
            line: 1,
            column: 1,
            message: `Undefined variable: ${varName}`,
            severity: 'error',
            rule: 'no-undef',
            codeSnippet: varName
          })
        }
      })

      // Calculate final complexity score
      complexityScore = Math.min(complexityScore, 100)

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        info,
        stats: {
          totalLines: lines.length,
          totalFunctions,
          totalVariables,
          totalLoops,
          totalConditionals,
          complexityScore,
          hasStrictMode,
          hasUseStrict
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
    setJsInput(sampleJS)
    setError('')
  }

  const clearAll = () => {
    setJsInput('')
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

  const getComplexityColor = (score: number) => {
    if (score <= 20) return 'text-green-600'
    if (score <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">JavaScript Validator</h1>
          <p className="text-muted-foreground">
            Validate your JavaScript code for syntax errors and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                JavaScript Input
              </CardTitle>
              <CardDescription>
                Enter your JavaScript code to validate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>JavaScript Code</Label>
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
                  value={jsInput}
                  onChange={(e) => setJsInput(e.target.value)}
                  placeholder="Enter your JavaScript code here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>

              <Button 
                onClick={validateJavaScript} 
                disabled={!jsInput.trim() || isValidating}
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
                    Validate JavaScript
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
                  validationResult.isValid ? '✅ JavaScript is valid!' : '❌ Issues found in JavaScript'
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
                        {validationResult.stats.totalFunctions}
                      </div>
                      <div className="text-sm text-gray-600">Functions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {validationResult.stats.totalVariables}
                      </div>
                      <div className="text-sm text-gray-600">Variables</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getComplexityColor(validationResult.stats.complexityScore)}`}>
                        {validationResult.stats.complexityScore}
                      </div>
                      <div className="text-sm text-gray-600">Complexity</div>
                    </div>
                  </div>

                  {/* JavaScript Features */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">JavaScript Features</h4>
                    <div className="flex gap-2">
                      <Badge variant={validationResult.stats.hasUseStrict ? "default" : "secondary"}>
                        Strict Mode
                      </Badge>
                      <Badge variant={validationResult.stats.totalLoops > 0 ? "default" : "secondary"}>
                        Loops ({validationResult.stats.totalLoops})
                      </Badge>
                      <Badge variant={validationResult.stats.totalConditionals > 0 ? "default" : "secondary"}>
                        Conditionals ({validationResult.stats.totalConditionals})
                      </Badge>
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
                                  {issue.codeSnippet && (
                                    <Badge variant="outline" className="text-xs font-mono">
                                      {issue.codeSnippet}
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
                                  {issue.codeSnippet && (
                                    <Badge variant="outline" className="text-xs font-mono">
                                      {issue.codeSnippet}
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
                                  {issue.codeSnippet && (
                                    <Badge variant="outline" className="text-xs font-mono">
                                      {issue.codeSnippet}
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
                        <p className="text-sm text-gray-500 mt-2">Your JavaScript code is valid and follows best practices.</p>
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
                    Enter JavaScript code and click validate to see results
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
                <h4 className="font-medium mb-2">🔍 Syntax Analysis</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Variable scope checking</li>
                  <li>• Function validation</li>
                  <li>• Loop and conditional analysis</li>
                  <li>• Strict mode detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚠️ Best Practices</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Deprecated method detection</li>
                  <li>• Security issue identification</li>
                  <li>• Code complexity scoring</li>
                  <li>• Performance suggestions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📊 Code Quality</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Complexity metrics</li>
                  <li>• Style guide compliance</li>
                  <li>• Error prevention</li>
                  <li>• Maintainability scoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}