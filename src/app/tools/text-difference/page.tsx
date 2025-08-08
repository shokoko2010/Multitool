'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, RotateCcw, GitCompare, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DiffLine {
  type: 'equal' | 'insert' | 'delete'
  content: string
  lineNumber?: number
}

export default function TextDifference() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [diff, setDiff] = useState<DiffLine[]>([])
  const [diffFormat, setDiffFormat] = useState('unified')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const computeDiff = () => {
    if (!text1.trim() && !text2.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter text in at least one field",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const lines1 = text1.split('\n')
      const lines2 = text2.split('\n')
      const result: DiffLine[] = []

      let i = 0, j = 0
      while (i < lines1.length || j < lines2.length) {
        if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
          result.push({ type: 'equal', content: lines1[i], lineNumber: i + 1 })
          i++
          j++
        } else {
          if (i < lines1.length) {
            result.push({ type: 'delete', content: lines1[i], lineNumber: i + 1 })
            i++
          }
          if (j < lines2.length) {
            result.push({ type: 'insert', content: lines2[j], lineNumber: j + 1 })
            j++
          }
        }
      }

      setDiff(result)
      
      toast({
        title: "Difference computed",
        description: `Found ${result.filter(line => line.type !== 'equal').length} differences`
      })
    } catch (error) {
      toast({
        title: "Diff computation failed",
        description: "Unable to compute text differences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateUnifiedDiff = () => {
    const header = `--- Text 1\n+++ Text 2\n@@ -1,${text1.split('\n').length} +1,${text2.split('\n').length} @@\n`
    const diffLines = diff
      .filter(line => line.type !== 'equal')
      .map(line => {
        switch (line.type) {
          case 'insert': return `+${line.content}`
          case 'delete': return `-${line.content}`
          default: return ` ${line.content}`
        }
      })
      .join('\n')

    return header + diffLines
  }

  const generateContextDiff = () => {
    let result = '***************\n'
    result += '*** Text 1\n'
    result +='--- Text 2\n'
    result +='***************\n'
    
    diff.forEach(line => {
      switch (line.type) {
        case 'insert': result += `+${line.content}\n`; break
        case 'delete': result += `-${line.content}\n`; break
        default: result += ` ${line.content}\n`; break
      }
    })
    
    return result
  }

  const generateHtmlDiff = () => {
    let result = '<div class="diff-container"><table class="diff">\n'
    result += '<thead><tr><th>Text 1</th><th>Text 2</th></tr></thead>\n'
    result += '<tbody>\n'
    
    diff.forEach(line => {
      const class1 = line.type === 'delete' ? 'diff-delete' : 
                    line.type === 'insert' ? 'diff-insert' : 'diff-equal'
      const class2 = line.type === 'insert' ? 'diff-insert' : 
                    line.type === 'delete' ? 'diff-delete' : 'diff-equal'
      
      result += `<tr class="${line.type}">\n`
      result += `<td class="${class1}">${line.type === 'delete' ? line.content : '&nbsp;'}</td>\n`
      result += `<td class="${class2}">${line.type === 'insert' ? line.content : '&nbsp;'}</td>\n`
      result += '</tr>\n'
    })
    
    result += '</tbody></table></div>\n'
    result += '<style>\n'
    result += '.diff-container { font-family: monospace; }\n'
    result += '.diff { border-collapse: collapse; width: 100%; }\n'
    result += '.diff td { padding: 2px 4px; border: 1px solid #ddd; }\n'
    result += '.diff-delete { background-color: #ffebee; }\n'
    result += '.diff-insert { background-color: #e8f5e8; }\n'
    result += '.diff-equal { background-color: #f5f5f5; }\n'
    result += '</style>'
    
    return result
  }

  const getFormattedDiff = () => {
    switch (diffFormat) {
      case 'unified': return generateUnifiedDiff()
      case 'context': return generateContextDiff()
      case 'html': return generateHtmlDiff()
      default: return generateUnifiedDiff()
    }
  }

  const copyToClipboard = () => {
    const formattedDiff = getFormattedDiff()
    navigator.clipboard.writeText(formattedDiff)
    toast({
      title: "Copied to clipboard",
      description: "Diff has been copied to clipboard"
    })
  }

  const downloadDiff = () => {
    const formattedDiff = getFormattedDiff()
    const blob = new Blob([formattedDiff], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'text-diff.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "Diff file download has started"
    })
  }

  const clearAll = () => {
    setText1('')
    setText2('')
    setDiff([])
  }

  const setSampleTexts = () => {
    setText1(`function greet(name) {
    console.log('Hello, ' + name + '!');
    return 'Welcome ' + name;
}

const user = {
    name: 'John',
    age: 30,
    hobbies: ['reading', 'coding']
};`)

    setText2(`function greet(name) {
    console.log('Hello, ' + name + '!');
    return 'Welcome ' + name;
}

const user = {
    name: 'John',
    age: 31,
    hobbies: ['reading', 'coding', 'gaming']
    email: 'john@example.com'
};`)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Difference</h1>
        <p className="text-muted-foreground">
          Compare two texts and see the differences highlighted
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Text Tool</Badge>
          <Badge variant="outline">Comparison</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Text 1</CardTitle>
            <CardDescription>
              Enter the first text to compare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter first text here..."
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="min-h-[200px] font-mono"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Text 2</CardTitle>
            <CardDescription>
              Enter the second text to compare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter second text here..."
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="min-h-[200px] font-mono"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={computeDiff} disabled={loading || (!text1.trim() && !text2.trim())} className="flex-1">
          {loading ? <GitCompare className="w-4 h-4 mr-2 animate-spin" /> : <GitCompare className="w-4 h-4 mr-2" />}
          {loading ? "Computing..." : "Compare Texts"}
        </Button>
        <Button onClick={setSampleTexts} variant="outline" className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          Load Sample
        </Button>
        <Button onClick={clearAll} variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {diff.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Difference Results</CardTitle>
            <CardDescription>
              Found {diff.filter(line => line.type !== 'equal').length} differences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Label htmlFor="diff-format">Output Format:</Label>
              <Select value={diffFormat} onValueChange={setDiffFormat}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unified">Unified Diff</SelectItem>
                  <SelectItem value="context">Context Diff</SelectItem>
                  <SelectItem value="html">HTML Diff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg p-4 bg-muted">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {getFormattedDiff()}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Diff
              </Button>
              <Button onClick={downloadDiff} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Usage Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enter text in both fields to compare</li>
                <li>• Click "Compare Texts" to see differences</li>
                <li>• Choose output format for different needs</li>
                <li>• Use "Load Sample" to see example</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Diff Formats</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Unified: Standard diff format</li>
                <li>• Context: More detailed context</li>
                <li>• HTML: Visual comparison table</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}