"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, BarChart3, Zap, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function LineCounter() {
  const [inputText, setInputText] = useState('')
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  const getLineStats = (text: string) => {
    const lines = text.split('\n')
    const totalLines = lines.length
    const nonEmptyLines = lines.filter(line => line.trim() !== '').length
    const emptyLines = totalLines - nonEmptyLines
    
    // Line length analysis
    const lineLengths = lines.map(line => line.length)
    const maxLineLength = Math.max(...lineLengths, 0)
    const minLineLength = Math.min(...lineLengths.filter(l => l > 0), 0)
    const avgLineLength = lineLengths.length > 0 ? 
      Math.round(lineLengths.reduce((sum, len) => sum + len, 0) / lineLengths.length) : 0
    
    // Character counts per line
    const lineCharCounts = lines.map((line, index) => ({
      lineNumber: index + 1,
      content: line,
      charCount: line.length,
      wordCount: line.trim() ? line.trim().split(/\s+/).length : 0
    }))
    
    // Longest and shortest lines
    const longestLine = lineCharCounts.reduce((prev, current) => 
      prev.charCount > current.charCount ? prev : current, lineCharCounts[0])
    
    const shortestLine = lineCharCounts.filter(line => line.charCount > 0)
      .reduce((prev, current) => prev.charCount < current.charCount ? prev : current, lineCharCounts[0])
    
    return {
      totalLines,
      nonEmptyLines,
      emptyLines,
      maxLineLength,
      minLineLength,
      avgLineLength,
      lineCharCounts,
      longestLine,
      shortestLine,
      totalCharacters: text.length,
      totalWords: text.trim() ? text.trim().split(/\s+/).length : 0
    }
  }

  const stats = getLineStats(inputText)

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([inputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'line-analysis.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputText('')
    toast.success('Cleared!')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      toast.success('Pasted from clipboard!')
    } catch (error) {
      toast.error('Failed to paste from clipboard')
    }
  }

  const formatLineContent = (line: string, lineNumber: number) => {
    if (!showLineNumbers) {
      return <span className="font-mono text-sm">{line}</span>
    }
    
    return (
      <div className="flex items-start">
        <span className="text-muted-foreground font-mono text-sm w-12 text-right pr-3 select-none">
          {lineNumber}
        </span>
        <span className="font-mono text-sm flex-1">{line}</span>
      </div>
    )
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
            <h1 className="text-4xl font-bold mb-4">Line Counter</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyze your text line by line with detailed statistics including line count, line length analysis, and more.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Text Input
              </CardTitle>
              <CardDescription>
                Enter or paste your text here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Enter your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handlePaste} size="sm">
                  Paste
                </Button>
                <Button onClick={handleCopy} disabled={!inputText} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownload} disabled={!inputText} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleClear} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button 
                  onClick={() => setShowLineNumbers(!showLineNumbers)} 
                  variant="outline" 
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showLineNumbers ? 'Hide' : 'Show'} Numbers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Line Statistics
              </CardTitle>
              <CardDescription>
                Detailed analysis of your lines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Lines</span>
                    <Badge variant="secondary">
                      <AlignLeft className="h-3 w-3 mr-1" />
                      {stats.totalLines}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Non-empty Lines</span>
                    <Badge variant="secondary">
                      {stats.nonEmptyLines}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Empty Lines</span>
                    <Badge variant="secondary">
                      {stats.emptyLines}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Characters</span>
                    <Badge variant="secondary">
                      <Hash className="h-3 w-3 mr-1" />
                      {stats.totalCharacters}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Words</span>
                    <Badge variant="secondary">
                      <Type className="h-3 w-3 mr-1" />
                      {stats.totalWords}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Max Line Length</span>
                    <Badge variant="secondary">
                      {stats.maxLineLength}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Min Line Length</span>
                    <Badge variant="secondary">
                      {stats.minLineLength}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Line Length</span>
                    <Badge variant="secondary">
                      {stats.avgLineLength}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Details */}
        {inputText && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Line Details
              </CardTitle>
              <CardDescription>
                View each line with its statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {stats.lineCharCounts.map((line, index) => (
                  <div key={line.lineNumber} className="border rounded-lg p-3 bg-muted/50">
                    <div className="flex justify-between items-start mb-2">
                      {formatLineContent(line.content, line.lineNumber)}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Chars: {line.charCount}</span>
                      <span>Words: {line.wordCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Analysis */}
        {inputText && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Longest Line */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlignLeft className="h-5 w-5" />
                  Longest Line
                </CardTitle>
                <CardDescription>
                  Line {stats.longestLine?.lineNumber} ({stats.longestLine?.charCount} characters)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  {stats.longestLine?.content || 'No content'}
                </div>
              </CardContent>
            </Card>

            {/* Shortest Line */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlignLeft className="h-5 w-5" />
                  Shortest Line
                </CardTitle>
                <CardDescription>
                  Line {stats.shortestLine?.lineNumber} ({stats.shortestLine?.charCount} characters)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  {stats.shortestLine?.content || 'No content'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>
              What you can do with this tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Line-by-line Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Analyze each line individually
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Line Length Stats</h4>
                <p className="text-sm text-muted-foreground">
                  Find longest and shortest lines
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Line Numbering</h4>
                <p className="text-sm text-muted-foreground">
                  Toggle line numbers on/off
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Empty Line Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Count empty vs non-empty lines
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Export Options</h4>
                <p className="text-sm text-muted-foreground">
                  Copy or download your text
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Real-time Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Statistics update as you type
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}