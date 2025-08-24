'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, GitCompare, FileDiff, Copy, Download } from 'lucide-react'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber?: number
}

export default function TextDiffTool() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [diffOutput, setDiffOutput] = useState<DiffLine[]>([])
  const [diffType, setDiffType] = useState<'line' | 'word'>('line')
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  const performDiff = useCallback(() => {
    if (!text1.trim() && !text2.trim()) {
      setDiffOutput([])
      return
    }

    if (diffType === 'line') {
      performLineDiff()
    } else {
      performWordDiff()
    }
  }, [text1, text2, diffType])

  const performLineDiff = () => {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const result: DiffLine[] = []

    const lcs = findLCS(lines1, lines2)
    let i = 0, j = 0, k = 0

    while (i < lines1.length || j < lines2.length) {
      if (k < lcs.length && i < lines1.length && j < lines2.length && 
          lines1[i] === lcs[k] && lines2[j] === lcs[k]) {
        result.push({ type: 'unchanged', content: lines1[i], lineNumber: i + 1 })
        i++; j++; k++
      } else {
        if (i < lines1.length && (k >= lcs.length || lines1[i] !== lcs[k])) {
          result.push({ type: 'removed', content: lines1[i], lineNumber: i + 1 })
          i++
        }
        if (j < lines2.length && (k >= lcs.length || lines2[j] !== lcs[k])) {
          result.push({ type: 'added', content: lines2[j], lineNumber: j + 1 })
          j++
        }
      }
    }

    setDiffOutput(result)
  }

  const performWordDiff = () => {
    const words1 = text1.split(/(\s+)/)
    const words2 = text2.split(/(\s+)/)
    const result: DiffLine[] = []

    const lcs = findLCS(words1, words2)
    let i = 0, j = 0, k = 0

    while (i < words1.length || j < words2.length) {
      if (k < lcs.length && i < words1.length && j < words2.length && 
          words1[i] === lcs[k] && words2[j] === lcs[k]) {
        result.push({ type: 'unchanged', content: words1[i] })
        i++; j++; k++
      } else {
        if (i < words1.length && (k >= lcs.length || words1[i] !== lcs[k])) {
          result.push({ type: 'removed', content: words1[i] })
          i++
        }
        if (j < words2.length && (k >= lcs.length || words2[j] !== lcs[k])) {
          result.push({ type: 'added', content: words2[j] })
          j++
        }
      }
    }

    setDiffOutput(result)
  }

  const findLCS = (arr1: string[], arr2: string[]): string[] => {
    const m = arr1.length
    const n = arr2.length
    const dp: string[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(''))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + arr1[i - 1]
        } else {
          dp[i][j] = dp[i - 1][j].length > dp[i][j - 1].length ? dp[i - 1][j] : dp[i][j - 1]
        }
      }
    }

    return dp[m][n].split('')
  }

  const handleCopy = async () => {
    const diffText = diffOutput.map(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
      return prefix + line.content
    }).join('\n')
    await navigator.clipboard.writeText(diffText)
  }

  const handleDownload = () => {
    const diffText = diffOutput.map(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
      return prefix + line.content
    }).join('\n')
    
    const blob = new Blob([diffText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diff-output.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setText1('')
    setText2('')
    setDiffOutput([])
  }

  const getStats = () => {
    const added = diffOutput.filter(line => line.type === 'added').length
    const removed = diffOutput.filter(line => line.type === 'removed').length
    const unchanged = diffOutput.filter(line => line.type === 'unchanged').length
    return { added, removed, unchanged }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDiff className="h-5 w-5" />
            Text Diff Tool
          </CardTitle>
          <CardDescription>
            Compare two texts and visualize differences with line-by-line or word-by-word comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Original Text</label>
              <Textarea
                placeholder="Enter original text..."
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Modified Text</label>
              <Textarea
                placeholder="Enter modified text..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                rows={10}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Diff Type:</label>
              <Select value={diffType} onValueChange={(value: 'line' | 'word') => setDiffType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="line-numbers"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
              />
              <label htmlFor="line-numbers" className="text-sm">Show Line Numbers</label>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={performDiff} disabled={!text1.trim() && !text2.trim()}>
              <GitCompare className="h-4 w-4 mr-2" />
              Compare
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {diffOutput.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Diff Result</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-green-600">+{stats.added}</span>{' '}
                    <span className="text-red-600">-{stats.removed}</span>{' '}
                    <span className="text-gray-600">{stats.unchanged}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-2 font-mono text-sm max-h-96 overflow-y-auto">
                  {diffOutput.map((line, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        line.type === 'added' ? 'bg-green-50 text-green-900' :
                        line.type === 'removed' ? 'bg-red-50 text-red-900' :
                        ''
                      }`}
                    >
                      {showLineNumbers && line.lineNumber && (
                        <span className="w-12 text-right pr-2 text-muted-foreground select-none">
                          {line.type === 'removed' ? line.lineNumber : ''}
                        </span>
                      )}
                      {showLineNumbers && line.type === 'added' && (
                        <span className="w-12 text-right pr-2 text-muted-foreground select-none">
                          {line.lineNumber}
                        </span>
                      )}
                      <span className="flex-1">
                        {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}
                        {line.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">About Text Diff</h4>
            <p className="text-sm text-muted-foreground">
              This tool compares two texts and highlights the differences between them. 
              It uses the Longest Common Subsequence (LCS) algorithm to find the optimal 
              alignment between the texts. You can compare texts line-by-line or word-by-word, 
              making it useful for comparing code, documents, or any text content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}