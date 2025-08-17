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

export default function JavaScriptMinifier() {
  const [inputJS, setInputJS] = useState('')
  const [outputJS, setOutputJS] = useState('')
  const [removeComments, setRemoveComments] = useState(true)
  const [removeWhitespace, setRemoveWhitespace] = useState(true)
  const [mungeVariables, setMungeVariables] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [minifiedSize, setMinifiedSize] = useState(0)

  const minifyJavaScript = () => {
    if (!inputJS.trim()) {
      toast.error('Please enter some JavaScript to minify')
      return
    }

    let minified = inputJS

    // Remove comments (single and multi-line)
    if (removeComments) {
      minified = minified
        .replace(/\/\/.*$/gm, '')  // Single line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')  // Multi-line comments
    }

    // Remove whitespace
    if (removeWhitespace) {
      minified = minified
        .replace(/\s+/g, ' ')  // Multiple spaces to single space
        .replace(/\s*([{}();,=+\-*\/%&|^~!<>?:])\s*/g, '$1')  // Remove spaces around operators
        .replace(/;\s*}/g, '}')  // Remove semicolons before closing brackets
        .replace(/\{\s+/g, '{')  // Remove spaces after opening brackets
        .replace(/\s+\}/g, '}')  // Remove spaces before closing brackets
        .replace(/\(\s+/g, '(')  // Remove spaces after opening parentheses
        .replace(/\s+\)/g, ')')  // Remove spaces before closing parentheses
    }

    // Basic variable name mangling (simplified)
    if (mungeVariables) {
      // This is a very basic implementation
      // In a real minifier, this would be much more sophisticated
      const varMap: Record<string, string> = {}
      let varCounter = 0
      
      minified = minified.replace(/var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (match, varName) => {
        if (!varMap[varName]) {
          varMap[varName] = String.fromCharCode(97 + (varCounter % 26)) + Math.floor(varCounter / 26)
          varCounter++
        }
        return `var ${varMap[varName]}`
      })
    }

    // Final cleanup
    minified = minified.trim()

    setOutputJS(minified)
    setOriginalSize(inputJS.length)
    setMinifiedSize(minified.length)
    toast.success('JavaScript minified successfully!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputJS)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([outputJS], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'minified.js'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputJS('')
    setOutputJS('')
    setOriginalSize(0)
    setMinifiedSize(0)
    toast.success('Cleared!')
  }

  const handleFormat = () => {
    if (!outputJS) return
    
    // Basic JavaScript formatting
    let formatted = outputJS
      .replace(/;/g, ';\n')
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}')
      .replace(/\n\s*\n/g, '\n')
      .replace(/  \}/g, '}')
      .replace(/var\s+/g, 'var ')
      .replace(/function\s+/g, 'function ')
      .replace(/return\s+/g, 'return ')
      .replace(/if\s*\(/g, 'if (')
      .replace(/else\s*\{/g, 'else {')
      .replace(/for\s*\(/g, 'for (')
      .replace(/while\s*\(/g, 'while (')
    
    setInputJS(formatted)
    toast.success('JavaScript formatted for editing!')
  }

  const getCompressionRatio = () => {
    if (originalSize === 0) return 0
    return Math.round(((originalSize - minifiedSize) / originalSize) * 100)
  }

  const getSizeReduction = () => {
    return originalSize - minifiedSize
  }

  const validateJavaScript = (code: string) => {
    try {
      // Basic syntax validation
      new Function(code)
      return true
    } catch (error) {
      return false
    }
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
            <h1 className="text-4xl font-bold mb-4">JavaScript Minifier</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Minify JavaScript code to reduce file size and improve website performance. Remove comments, whitespace, and optimize your scripts.
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
              Configure how you want to minify your JavaScript
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
                  id="munge-variables"
                  checked={mungeVariables}
                  onCheckedChange={setMungeVariables}
                />
                <Label htmlFor="munge-variables">Munge variable names</Label>
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
                Input JavaScript
              </CardTitle>
              <CardDescription>
                Enter or paste your JavaScript code here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your JavaScript code here..."
                value={inputJS}
                onChange={(e) => setInputJS(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                spellCheck="false"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {inputJS.length} characters
                </Badge>
                {inputJS && (
                  <Badge variant="outline">
                    {inputJS.split('\n').length} lines
                  </Badge>
                )}
                {inputJS && (
                  <Badge variant={validateJavaScript(inputJS) ? "default" : "destructive"}>
                    {validateJavaScript(inputJS) ? "Valid" : "Invalid"} Syntax
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
                Minified JavaScript
              </CardTitle>
              <CardDescription>
                Minified JavaScript will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputJS}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Minified JavaScript will appear here..."
                spellCheck="false"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {outputJS.length} characters
                </Badge>
                {outputJS && (
                  <Badge variant="outline">
                    {outputJS.split('\n').length} lines
                  </Badge>
                )}
                {outputJS && (
                  <Badge variant={validateJavaScript(outputJS) ? "default" : "destructive"}>
                    {validateJavaScript(outputJS) ? "Valid" : "Invalid"} Syntax
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCopy} disabled={!outputJS} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownload} disabled={!outputJS} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleFormat} disabled={!outputJS} variant="outline" size="sm">
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
                See how much your JavaScript was compressed
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
          <Button onClick={minifyJavaScript} disabled={!inputJS.trim()} size="lg">
            <Minimize2 className="h-4 w-4 mr-2" />
            Minify JavaScript
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
              What this JavaScript minifier can do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Comment Removal</h4>
                <p className="text-sm text-muted-foreground">
                  Remove all JavaScript comments to reduce file size
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Whitespace Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Remove unnecessary spaces and line breaks
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Variable Mangling</h4>
                <p className="text-sm text-muted-foreground">
                  Shorten variable names to reduce character count
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Syntax Validation</h4>
                <p className="text-sm text-muted-foreground">
                  Check if your JavaScript has valid syntax
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Boost</h4>
                <p className="text-sm text-muted-foreground">
                  Faster loading times for your website
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Format & Edit</h4>
                <p className="text-sm text-muted-foreground">
                  Format minified JavaScript back to readable form
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
              Tips for JavaScript minification
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
                  Always test your minified code to ensure it works correctly in production.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Use Build Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Consider using build tools like Webpack or Vite for automated minification.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Source Maps</h4>
                <p className="text-sm text-muted-foreground">
                  Generate source maps for easier debugging of minified code in production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}