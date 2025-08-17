"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, Code, Minimize2, Maximize2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function HTMLMinifier() {
  const [inputHTML, setInputHTML] = useState('')
  const [outputHTML, setOutputHTML] = useState('')
  const [removeComments, setRemoveComments] = useState(true)
  const [removeWhitespace, setRemoveWhitespace] = useState(true)
  const [removeEmptyAttributes, setRemoveEmptyAttributes] = useState(true)
  const [removeOptionalTags, setRemoveOptionalTags] = useState(false)
  const [collapseBooleanAttributes, setCollapseBooleanAttributes] = useState(true)
  const [originalSize, setOriginalSize] = useState(0)
  const [minifiedSize, setMinifiedSize] = useState(0)

  const minifyHTML = () => {
    if (!inputHTML.trim()) {
      toast.error('Please enter some HTML to minify')
      return
    }

    let minified = inputHTML

    // Remove HTML comments
    if (removeComments) {
      minified = minified.replace(/<!--[\s\S]*?-->/g, '')
    }

    // Remove whitespace
    if (removeWhitespace) {
      minified = minified
        .replace(/\s+/g, ' ')  // Multiple spaces to single space
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .replace(/\s+>/g, '>')  // Remove spaces before closing brackets
        .replace(/<\s+/g, '<')  // Remove spaces after opening brackets
    }

    // Remove empty attributes
    if (removeEmptyAttributes) {
      minified = minified.replace(/(\w+)=["']\s*["']/g, '')
    }

    // Collapse boolean attributes
    if (collapseBooleanAttributes) {
      const booleanAttributes = ['checked', 'disabled', 'readonly', 'multiple', 'selected', 'autoplay', 'controls', 'loop', 'muted', 'required', 'reversed', 'scoped', 'async', 'defer', 'default', 'ismap', 'noresize', 'declare', 'novalidate', 'open', 'hidden']
      booleanAttributes.forEach(attr => {
        const regex = new RegExp(`${attr}=["']${attr}["']`, 'gi')
        minified = minified.replace(regex, attr)
      })
    }

    // Remove optional tags (basic implementation)
    if (removeOptionalTags) {
      // Remove optional closing tags for certain elements
      const optionalClosingTags = ['</li>', '</dt>', '</dd>', '</p>', '</option>', '</thead>', '</tbody>', '</tfoot>', '</tr>', '</td>', '</th>']
      optionalClosingTags.forEach(tag => {
        // This is a simplified approach - real HTML minifiers are more sophisticated
        minified = minified.replace(new RegExp(tag, 'gi'), '')
      })
    }

    // Final cleanup
    minified = minified.trim()

    setOutputHTML(minified)
    setOriginalSize(inputHTML.length)
    setMinifiedSize(minified.length)
    toast.success('HTML minified successfully!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputHTML)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([outputHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'minified.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputHTML('')
    setOutputHTML('')
    setOriginalSize(0)
    setMinifiedSize(0)
    toast.success('Cleared!')
  }

  const handleFormat = () => {
    if (!outputHTML) return
    
    // Basic HTML formatting
    let formatted = outputHTML
      .replace(/></g, '>\n<')
      .replace(/(<([^>]+)>)/g, '\n$1')
      .replace(/\n\s*\n/g, '\n')
      .replace(/^\n/, '')
    
    // Add indentation for nested elements
    const lines = formatted.split('\n')
    let indent = 0
    const formattedLines = lines.map(line => {
      if (line.trim().startsWith('</')) {
        indent = Math.max(0, indent - 2)
      }
      const indentedLine = ' '.repeat(indent) + line.trim()
      if (line.trim().startsWith('<') && !line.trim().startsWith('</') && !line.trim().endsWith('/>')) {
        indent += 2
      }
      return indentedLine
    })
    
    setInputHTML(formattedLines.join('\n'))
    toast.success('HTML formatted for editing!')
  }

  const getCompressionRatio = () => {
    if (originalSize === 0) return 0
    return Math.round(((originalSize - minifiedSize) / originalSize) * 100)
  }

  const getSizeReduction = () => {
    return originalSize - minifiedSize
  }

  const validateHTML = (html: string) => {
    // Basic HTML validation
    const tagRegex = /<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/gi
    const selfClosingTagRegex = /<([a-z][a-z0-9]*)\b[^>]*\/?>/gi
    
    let hasValidTags = false
    let match
    
    // Check for properly paired tags
    while ((match = tagRegex.exec(html)) !== null) {
      hasValidTags = true
    }
    
    // Check for self-closing tags
    while ((match = selfClosingTagRegex.exec(html)) !== null) {
      hasValidTags = true
    }
    
    return hasValidTags || html.includes('<') && html.includes('>')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">HTML Minifier</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Minify HTML code to reduce file size and improve website performance. Remove comments, whitespace, and optimize your markup.
            </p>
          </motion.div>
        </div>

        {/* Minification Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Minimize2 className="h-5 w-5" />
              Minification Options
            </CardTitle>
            <CardDescription>
              Configure how you want to minify your HTML
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-comments"
                  checked={removeComments}
                  onCheckedChange={setRemoveComments}
                />
                <Label htmlFor="remove-comments">Remove comments</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-whitespace"
                  checked={removeWhitespace}
                  onCheckedChange={setRemoveWhitespace}
                />
                <Label htmlFor="remove-whitespace">Remove whitespace</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-empty-attributes"
                  checked={removeEmptyAttributes}
                  onCheckedChange={setRemoveEmptyAttributes}
                />
                <Label htmlFor="remove-empty-attributes">Remove empty attributes</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-optional-tags"
                  checked={removeOptionalTags}
                  onCheckedChange={setRemoveOptionalTags}
                />
                <Label htmlFor="remove-optional-tags">Remove optional tags</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="collapse-boolean-attributes"
                  checked={collapseBooleanAttributes}
                  onCheckedChange={setCollapseBooleanAttributes}
                />
                <Label htmlFor="collapse-boolean-attributes">Collapse boolean attributes</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Input HTML
              </CardTitle>
              <CardDescription>
                Enter or paste your HTML code here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your HTML code here..."
                value={inputHTML}
                onChange={(e) => setInputHTML(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                spellCheck="false"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {inputHTML.length} characters
                </Badge>
                {inputHTML && (
                  <Badge variant="outline">
                    {inputHTML.split('\n').length} lines
                  </Badge>
                )}
                {inputHTML && (
                  <Badge variant={validateHTML(inputHTML) ? "default" : "destructive"}>
                    {validateHTML(inputHTML) ? "Valid" : "Invalid"} HTML
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Minified HTML
              </CardTitle>
              <CardDescription>
                Minified HTML will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputHTML}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Minified HTML will appear here..."
                spellCheck="false"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {outputHTML.length} characters
                </Badge>
                {outputHTML && (
                  <Badge variant="outline">
                    {outputHTML.split('\n').length} lines
                  </Badge>
                )}
                {outputHTML && (
                  <Badge variant={validateHTML(outputHTML) ? "default" : "destructive"}>
                    {validateHTML(outputHTML) ? "Valid" : "Invalid"} HTML
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCopy} disabled={!outputHTML} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownload} disabled={!outputHTML} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleFormat} disabled={!outputHTML} variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Format
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compression Statistics */}
        {originalSize > 0 && minifiedSize > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compression Statistics
              </CardTitle>
              <CardDescription>
                See how much your HTML was compressed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {originalSize.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Original Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {minifiedSize.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Minified Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getSizeReduction().toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Bytes Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {getCompressionRatio()}%
                  </div>
                  <div className="text-sm text-muted-foreground">Compression Ratio</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Compression Progress</span>
                  <span>{getCompressionRatio()}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getCompressionRatio()}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={minifyHTML} disabled={!inputHTML.trim()} size="lg">
            <Minimize2 className="h-4 w-4 mr-2" />
            Minify HTML
          </Button>
          <Button onClick={handleClear} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>
              What this HTML minifier can do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Comment Removal</h4>
                <p className="text-sm text-muted-foreground">
                  Remove all HTML comments to reduce file size
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Whitespace Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Remove unnecessary spaces and line breaks
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Empty Attribute Removal</h4>
                <p className="text-sm text-muted-foreground">
                  Remove attributes with empty values
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Boolean Attribute Collapse</h4>
                <p className="text-sm text-muted-foreground">
                  Shorten boolean attributes (e.g., disabled="disabled" → disabled)
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optional Tag Removal</h4>
                <p className="text-sm text-muted-foreground">
                  Remove optional closing tags where possible
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Format & Edit</h4>
                <p className="text-sm text-muted-foreground">
                  Format minified HTML back to readable form
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Best Practices
            </CardTitle>
            <CardDescription>
              Tips for HTML minification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Keep Source Files</h4>
                <p className="text-sm text-muted-foreground">
                  Always keep your original, unminified source files for development and debugging.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Test Minified Code</h4>
                <p className="text-sm text-muted-foreground">
                  Always test your minified HTML to ensure it renders correctly in all browsers.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Use Build Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Consider using build tools like Gulp, Grunt, or Webpack for automated minification.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Combine with Other Optimizations</h4>
                <p className="text-sm text-muted-foreground">
                  Combine HTML minification with CSS and JavaScript minification for maximum performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}