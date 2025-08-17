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

export default function CSSMinifier() {
  const [inputCSS, setInputCSS] = useState('')
  const [outputCSS, setOutputCSS] = useState('')
  const [removeComments, setRemoveComments] = useState(true)
  const [removeWhitespace, setRemoveWhitespace] = useState(true)
  const [compressColors, setCompressColors] = useState(true)
  const [removeLastSemicolon, setRemoveLastSemicolon] = useState(true)
  const [originalSize, setOriginalSize] = useState(0)
  const [minifiedSize, setMinifiedSize] = useState(0)

  const minifyCSS = () => {
    if (!inputCSS.trim()) {
      toast.error('Please enter some CSS to minify')
      return
    }

    let minified = inputCSS

    // Remove comments
    if (removeComments) {
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')
    }

    // Remove whitespace
    if (removeWhitespace) {
      minified = minified
        .replace(/\s+/g, ' ')  // Multiple spaces to single space
        .replace(/\s*([{}:;,])\s*/g, '$1')  // Remove spaces around brackets, colons, semicolons
        .replace(/;\s*}/g, '}')  // Remove semicolons before closing brackets
        .replace(/\{\s+/g, '{')  // Remove spaces after opening brackets
        .replace(/\s+\}/g, '}')  // Remove spaces before closing brackets
    }

    // Compress colors
    if (compressColors) {
      minified = minified.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')  // #RRGGBB to #RGB
    }

    // Remove last semicolon
    if (removeLastSemicolon) {
      minified = minified.replace(/;}/g, '}')
    }

    // Final cleanup
    minified = minified.trim()

    setOutputCSS(minified)
    setOriginalSize(inputCSS.length)
    setMinifiedSize(minified.length)
    toast.success('CSS minified successfully!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCSS)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([outputCSS], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'minified.css'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputCSS('')
    setOutputCSS('')
    setOriginalSize(0)
    setMinifiedSize(0)
    toast.success('Cleared!')
  }

  const handleFormat = () => {
    if (!outputCSS) return
    
    // Basic CSS formatting
    let formatted = outputCSS
      .replace(/}/g, '}\n')
      .replace(/\{/g, ' {\n  ')
      .replace(/;/g, ';\n  ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/  \}/g, '}')
    
    setInputCSS(formatted)
    toast.success('CSS formatted for editing!')
  }

  const getCompressionRatio = () => {
    if (originalSize === 0) return 0
    return Math.round(((originalSize - minifiedSize) / originalSize) * 100)
  }

  const getSizeReduction = () => {
    return originalSize - minifiedSize
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
            <h1 className="text-4xl font-bold mb-4">CSS Minifier</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Minify CSS code to reduce file size and improve website performance. Remove comments, whitespace, and optimize your stylesheets.
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
              Configure how you want to minify your CSS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  id="compress-colors"
                  checked={compressColors}
                  onCheckedChange={setCompressColors}
                />
                <Label htmlFor="compress-colors">Compress colors (#RRGGBB → #RGB)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-last-semicolon"
                  checked={removeLastSemicolon}
                  onCheckedChange={setRemoveLastSemicolon}
                />
                <Label htmlFor="remove-last-semicolon">Remove last semicolon</Label>
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
                Input CSS
              </CardTitle>
              <CardDescription>
                Enter or paste your CSS code here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your CSS code here..."
                value={inputCSS}
                onChange={(e) => setInputCSS(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                spellCheck="false"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {inputCSS.length} characters
                </Badge>
                {inputCSS && (
                  <Badge variant="outline">
                    {inputCSS.split('\n').length} lines
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
                Minified CSS
              </CardTitle>
              <CardDescription>
                Minified CSS will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputCSS}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Minified CSS will appear here..."
                spellCheck="false"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {outputCSS.length} characters
                </Badge>
                {outputCSS && (
                  <Badge variant="outline">
                    {outputCSS.split('\n').length} lines
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCopy} disabled={!outputCSS} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownload} disabled={!outputCSS} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleFormat} disabled={!outputCSS} variant="outline" size="sm">
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
                See how much your CSS was compressed
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
          <Button onClick={minifyCSS} disabled={!inputCSS.trim()} size="lg">
            <Minimize2 className="h-4 w-4 mr-2" />
            Minify CSS
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
              What this CSS minifier can do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Comment Removal</h4>
                <p className="text-sm text-muted-foreground">
                  Remove all CSS comments to reduce file size
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Whitespace Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Remove unnecessary spaces and line breaks
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Color Compression</h4>
                <p className="text-sm text-muted-foreground">
                  Convert hex colors to short format when possible
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Semicolon Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Remove unnecessary semicolons in CSS
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
                  Format minified CSS back to readable form
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}