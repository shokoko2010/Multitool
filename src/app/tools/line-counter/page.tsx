'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, FileText, Hash, Type, AlignLeft } from 'lucide-react'

interface LineAnalysis {
  totalLines: number
  nonEmptyLines: number
  emptyLines: number
  averageLineLength: number
  longestLine: number
  shortestLine: number
  lines: Array<{
    number: number
    content: string
    length: number
    isEmpty: boolean
  }>
}

export default function LineCounter() {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState<LineAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeLines = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Split into lines
      const lines = input.split('\n')
      const totalLines = lines.length
      
      // Analyze each line
      const lineData: LineAnalysis['lines'] = []
      let nonEmptyLines = 0
      let totalLength = 0
      let longestLine = 0
      let shortestLine = Infinity

      lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        const isEmpty = trimmedLine.length === 0
        const length = line.length

        if (!isEmpty) nonEmptyLines++
        totalLength += length
        longestLine = Math.max(longestLine, length)
        shortestLine = Math.min(shortestLine, length || 0)

        lineData.push({
          number: index + 1,
          content: line,
          length,
          isEmpty
        })
      })

      const emptyLines = totalLines - nonEmptyLines
      const averageLineLength = totalLines > 0 ? totalLength / totalLines : 0

      const lineAnalysis: LineAnalysis = {
        totalLines,
        nonEmptyLines,
        emptyLines,
        averageLineLength,
        longestLine,
        shortestLine: shortestLine === Infinity ? 0 : shortestLine,
        lines: lineData
      }

      setAnalysis(lineAnalysis)
    } catch (error) {
      console.error('Error analyzing lines:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!analysis) return
    
    const resultText = `
Line Analysis Report:

Total Lines: ${analysis.totalLines}
Non-empty Lines: ${analysis.nonEmptyLines}
Empty Lines: ${analysis.emptyLines}
Average Line Length: ${analysis.averageLineLength.toFixed(1)} characters
Longest Line: ${analysis.longestLine} characters
Shortest Line: ${analysis.shortestLine} characters
    `.trim()
    
    navigator.clipboard.writeText(resultText)
  }

  const copyLines = () => {
    if (!analysis) return
    
    const linesText = analysis.lines
      .filter(line => !line.isEmpty)
      .map(line => line.content)
      .join('\n')
    
    navigator.clipboard.writeText(linesText)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Line Counter</h1>
        <p className="text-muted-foreground">Count lines and analyze line-by-line content structure</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignLeft className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze line by line
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for line analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={analyzeLines} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Lines'}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Line Analysis Results
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyResult}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Report
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyLines}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Content
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.totalLines}</div>
                  <p className="text-sm text-muted-foreground">Total Lines</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.nonEmptyLines}</div>
                  <p className="text-sm text-muted-foreground">Non-empty</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{analysis.emptyLines}</div>
                  <p className="text-sm text-muted-foreground">Empty</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.averageLineLength.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">Avg Length</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.longestLine}</div>
                  <p className="text-sm text-muted-foreground">Longest</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.shortestLine}</div>
                  <p className="text-sm text-muted-foreground">Shortest</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Line Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Fill Ratio:</span>
                      <span className="font-medium">
                        {((analysis.nonEmptyLines / analysis.totalLines) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Empty Line Ratio:</span>
                      <span className="font-medium">
                        {((analysis.emptyLines / analysis.totalLines) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Characters:</span>
                      <span className="font-medium">
                        {analysis.lines.reduce((sum, line) => sum + line.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Characters per Line:</span>
                      <span className="font-medium">
                        {(analysis.lines.reduce((sum, line) => sum + line.length, 0) / analysis.totalLines).toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Content Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Most Common Line Length:</span>{' '}
                      {analysis.lines.filter(line => line.length > 0).sort((a, b) => {
                        const countA = analysis.lines.filter(l => l.length === a.length).length
                        const countB = analysis.lines.filter(l => l.length === b.length).length
                        return countB - countA
                      })[0]?.length || 0} characters
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Lines with 1-10 chars:</span>{' '}
                      {analysis.lines.filter(line => line.length > 0 && line.length <= 10).length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Lines with 11-50 chars:</span>{' '}
                      {analysis.lines.filter(line => line.length > 10 && line.length <= 50).length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Lines with 50+ chars:</span>{' '}
                      {analysis.lines.filter(line => line.length > 50).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Line Breakdown</h3>
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {analysis.lines.slice(0, 50).map((line, index) => (
                    <div 
                      key={index} 
                      className={`p-2 border-b last:border-b-0 ${line.isEmpty ? 'bg-gray-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {line.number}
                          </Badge>
                          <span className={`text-sm ${line.isEmpty ? 'text-gray-500' : ''}`}>
                            {line.isEmpty ? '[Empty Line]' : line.content.substring(0, 100)}
                            {line.content.length > 100 && '...'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {line.length} chars
                          </Badge>
                          {line.isEmpty && (
                            <Badge variant="outline" className="text-xs">
                              empty
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {analysis.lines.length > 50 && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      ... and {analysis.lines.length - 50} more lines
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Usage Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use line analysis to identify formatting issues in code or documents</li>
                  <li>• High empty line ratio may indicate excessive whitespace</li>
                  <li>• Consistent line lengths suggest well-formatted content</li>
                  <li>• Short lines may indicate broken text or formatting problems</li>
                  <li>• This tool is useful for code review and document analysis</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}