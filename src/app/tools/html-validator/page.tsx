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
  element?: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
  stats: {
    totalLines: number
    totalElements: number
    totalAttributes: number
    doctypePresent: boolean
    hasHtmlTag: boolean
    hasHeadTag: boolean
    hasBodyTag: boolean
  }
}

export default function HtmlValidator() {
  const [htmlInput, setHtmlInput] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Document</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to HTML Validator</h1>
        <p>This is a sample HTML document for testing validation.</p>
        
        <div class="content">
            <h2>Features</h2>
            <ul>
                <li>HTML syntax validation</li>
                <li>Attribute checking</li>
                <li>Structure analysis</li>
            </ul>
            
            <img src="image.jpg" alt="Sample image">
            
            <a href="https://example.com">External link</a>
            
            <div class="invalid-attribute" non-standard="value">
                This div has invalid attributes
            </div>
            
            <p>Unclosed paragraph tag
    </div>
    
    <script>
        console.log('Hello, World!');
    </script>
</body>
</html>`

  const validateHTML = async () => {
    if (!htmlInput.trim()) {
      setError('Please enter HTML code to validate')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const lines = htmlInput.split('\n')
      const errors: ValidationError[] = []
      const warnings: ValidationError[] = []
      const info: ValidationError[] = []

      let totalElements = 0
      let totalAttributes = 0
      let doctypePresent = false
      let hasHtmlTag = false
      let hasHeadTag = false
      let hasBodyTag = false

      // HTML5 elements and their required attributes
      const htmlElements = {
        void: ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'],
        block: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'blockquote', 'pre', 'figure', 'figcaption', 'fieldset', 'legend', 'address', 'section', 'article', 'nav', 'aside', 'header', 'footer', 'main'],
        inline: ['span', 'a', 'strong', 'em', 'code', 'small', 'mark', 'del', 'ins', 'sub', 'sup', 'time', 'abbr', 'dfn', 'q', 'cite', 'data', 'var', 'samp', 'kbd', 's', 'u', 'b', 'i', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'br', 'wbr']
      }

      const requiredAttributes = {
        img: ['src', 'alt'],
        a: ['href'],
        link: ['href', 'rel'],
        meta: ['name', 'content'],
        input: ['type', 'name'],
        script: ['src'],
        style: ['type']
      }

      const deprecatedAttributes = ['align', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'valign', 'width', 'height']

      // Track open tags for validation
      const openTags: { tag: string; line: number; column: number }[] = []

      lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1
        const trimmedLine = line.trim()

        // Check for DOCTYPE
        if (trimmedLine.toUpperCase().includes('<!DOCTYPE')) {
          doctypePresent = true
          if (!trimmedLine.toUpperCase().includes('HTML')) {
            warnings.push({
              line: lineNumber,
              column: 1,
              message: 'Consider using HTML5 DOCTYPE: <!DOCTYPE html>',
              severity: 'warning',
              rule: 'doctype-html5'
            })
          }
        }

        // Check for HTML structure tags
        if (trimmedLine.includes('<html')) hasHtmlTag = true
        if (trimmedLine.includes('<head')) hasHeadTag = true
        if (trimmedLine.includes('<body')) hasBodyTag = true

        // Find all HTML tags in the line
        const tagRegex = /<([^!>]+)>/g
        let match
        
        while ((match = tagRegex.exec(line)) !== null) {
          const fullMatch = match[0]
          const tagContent = match[1]
          const column = match.index + 1

          // Skip comments and doctype
          if (tagContent.startsWith('!--') || tagContent.startsWith('!DOCTYPE')) {
            continue
          }

          // Check if it's a closing tag
          if (tagContent.startsWith('/')) {
            const tagName = tagContent.substring(1)
            
            // Check for matching opening tag
            const lastOpenTag = openTags.findLast(tag => tag.tag === tagName)
            if (lastOpenTag) {
              openTags.splice(openTags.indexOf(lastOpenTag), 1)
            } else {
              warnings.push({
                line: lineNumber,
                column: column,
                message: `Closing tag for '${tagName}' without matching opening tag`,
                severity: 'warning',
                rule: 'tag-matching',
                element: tagName
              })
            }
            continue
          }

          // Check if it's a self-closing tag
          const isSelfClosing = tagContent.endsWith('/') || htmlElements.void.includes(tagContent.split(' ')[0])
          
          if (!isSelfClosing) {
            const tagName = tagContent.split(' ')[0]
            openTags.push({ tag: tagName, line: lineNumber, column: column })
          }

          // Parse tag and attributes
          const tagName = tagContent.split(' ')[0]
          totalElements++

          // Check for valid element names
          const allElements = [...htmlElements.void, ...htmlElements.block, ...htmlElements.inline, 'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style', 'form', 'button', 'select', 'option', 'table', 'tr', 'td', 'th', 'iframe', 'canvas', 'video', 'audio']
          if (!allElements.includes(tagName)) {
            warnings.push({
              line: lineNumber,
              column: column,
              message: `Unknown HTML element: ${tagName}`,
              severity: 'warning',
              rule: 'element-existence',
              element: tagName
            })
          }

          // Parse attributes
          const attributeRegex = /(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^>\s]*)))?/g
          let attrMatch
          
          while ((attrMatch = attributeRegex.exec(tagContent)) !== null) {
            const attrName = attrMatch[1]
            totalAttributes++

            // Check for deprecated attributes
            if (deprecatedAttributes.includes(attrName)) {
              warnings.push({
                line: lineNumber,
                column: column + tagContent.indexOf(attrName),
                message: `Deprecated attribute: ${attrName}. Use CSS instead.`,
                severity: 'warning',
                rule: 'deprecated-attribute',
                element: tagName
              })
            }

            // Check for required attributes
            if (requiredAttributes[tagName as keyof typeof requiredAttributes]?.includes(attrName)) {
              // This is a valid required attribute
            } else if (attrName.startsWith('on') && attrName.length > 2) {
              warnings.push({
                line: lineNumber,
                column: column + tagContent.indexOf(attrName),
                message: `Inline event handler '${attrName}' detected. Consider using event listeners.`,
                severity: 'warning',
                rule: 'inline-event-handlers',
                element: tagName
              })
            }
          }

          // Check for required attributes
          if (requiredAttributes[tagName as keyof typeof requiredAttributes]) {
            const required = requiredAttributes[tagName as keyof typeof requiredAttributes]
            const foundAttributes: string[] = []
            const attrMatches = tagContent.match(/(\w+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]*))?/g) || []
            
            attrMatches.forEach(attr => {
              const attrName = attr.split('=')[0].trim()
              foundAttributes.push(attrName)
            })

            required.forEach(reqAttr => {
              if (!foundAttributes.includes(reqAttr)) {
                if (tagName === 'img' && reqAttr === 'alt') {
                  errors.push({
                    line: lineNumber,
                    column: column,
                    message: `Missing required 'alt' attribute for accessibility`,
                    severity: 'error',
                    rule: 'required-attribute',
                    element: tagName
                  })
                } else if (tagName === 'a' && reqAttr === 'href') {
                  errors.push({
                    line: lineNumber,
                    column: column,
                    message: `Missing required 'href' attribute for link`,
                    severity: 'error',
                    rule: 'required-attribute',
                    element: tagName
                  })
                } else {
                  warnings.push({
                    line: lineNumber,
                    column: column,
                    message: `Missing recommended attribute: ${reqAttr}`,
                    severity: 'warning',
                    rule: 'required-attribute',
                    element: tagName
                  })
                }
              }
            })
          }
        }
      })

      // Check for unclosed tags
      openTags.forEach(openTag => {
        if (!htmlElements.void.includes(openTag.tag)) {
          errors.push({
            line: openTag.line,
            column: openTag.column,
            message: `Unclosed tag: ${openTag.tag}`,
            severity: 'error',
            rule: 'unclosed-tag',
            element: openTag.tag
          })
        }
      })

      // Check for basic HTML structure
      if (hasHtmlTag && !hasHeadTag) {
        warnings.push({
          line: 1,
          column: 1,
          message: 'HTML document should have a <head> section',
          severity: 'warning',
          rule: 'document-structure'
        })
      }

      if (hasHtmlTag && !hasBodyTag) {
        warnings.push({
          line: 1,
          column: 1,
          message: 'HTML document should have a <body> section',
          severity: 'warning',
          rule: 'document-structure'
        })
      }

      if (!doctypePresent) {
        warnings.push({
          line: 1,
          column: 1,
          message: 'Missing DOCTYPE declaration',
          severity: 'warning',
          rule: 'doctype-missing'
        })
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        info,
        stats: {
          totalLines: lines.length,
          totalElements,
          totalAttributes,
          doctypePresent,
          hasHtmlTag,
          hasHeadTag,
          hasBodyTag
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
    setHtmlInput(sampleHTML)
    setError('')
  }

  const clearAll = () => {
    setHtmlInput('')
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
          <h1 className="text-3xl font-bold mb-2">HTML Validator</h1>
          <p className="text-muted-foreground">
            Validate your HTML code for syntax errors and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                HTML Input
              </CardTitle>
              <CardDescription>
                Enter your HTML code to validate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>HTML Code</Label>
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
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="Enter your HTML code here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>

              <Button 
                onClick={validateHTML} 
                disabled={!htmlInput.trim() || isValidating}
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
                    Validate HTML
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
                  validationResult.isValid ? '✅ HTML is valid!' : '❌ Issues found in HTML'
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
                        {validationResult.stats.totalElements}
                      </div>
                      <div className="text-sm text-gray-600">Elements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {validationResult.stats.totalAttributes}
                      </div>
                      <div className="text-sm text-gray-600">Attributes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {validationResult.errors.length}
                      </div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </div>
                  </div>

                  {/* Document Structure */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Document Structure</h4>
                    <div className="flex gap-2">
                      <Badge variant={validationResult.stats.doctypePresent ? "default" : "secondary"}>
                        DOCTYPE
                      </Badge>
                      <Badge variant={validationResult.stats.hasHtmlTag ? "default" : "secondary"}>
                        &lt;html&gt;
                      </Badge>
                      <Badge variant={validationResult.stats.hasHeadTag ? "default" : "secondary"}>
                        &lt;head&gt;
                      </Badge>
                      <Badge variant={validationResult.stats.hasBodyTag ? "default" : "secondary"}>
                        &lt;body&gt;
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
                                  {issue.element && (
                                    <Badge variant="outline" className="text-xs">
                                      {issue.element}
                                    </Badge>
                                  )}
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
                                  {issue.element && (
                                    <Badge variant="outline" className="text-xs">
                                      {issue.element}
                                    </Badge>
                                  )}
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
                                  {issue.element && (
                                    <Badge variant="outline" className="text-xs">
                                      {issue.element}
                                    </Badge>
                                  )}
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
                        <p className="text-sm text-gray-500 mt-2">Your HTML code is valid and follows best practices.</p>
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
                    Enter HTML code and click validate to see results
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
                  <li>• Tag matching and nesting</li>
                  <li>• Attribute validation</li>
                  <li>• Required attribute checking</li>
                  <li>• Deprecated attribute detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📋 Structure Analysis</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• DOCTYPE validation</li>
                  <li>• Document structure checking</li>
                  <li>• HTML5 compliance</li>
                  <li>• Accessibility checks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚡ Best Practices</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Inline event handler warnings</li>
                  <li>• Semantic HTML suggestions</li>
                  <li>• Performance optimizations</li>
                  <li>• Security recommendations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}