'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AlignLeft, Copy, FileText, Hash } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function LineCounter() {
  const [inputText, setInputText] = useState('')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [countEmptyLines, setCountEmptyLines] = useState(true)

  const lines = inputText.split('\n')
  
  const stats = {
    totalLines: lines.length,
    nonEmptyLines: lines.filter(line => line.trim().length > 0).length,
    emptyLines: lines.filter(line => line.trim().length === 0).length,
    longestLine: Math.max(...lines.map(line => line.length), 0),
    averageLength: lines.length > 0 ? Math.round(lines.reduce((sum, line) => sum + line.length, 0) / lines.length) : 0
  }

  const displayLines = countEmptyLines ? lines : lines.filter(line => line.trim().length > 0)

  const copyWithLineNumbers = () => {
    const textWithNumbers = displayLines.map((line, index) => `${(index + 1).toString().padStart(4, ' ')}: ${line}`).join('\n')
    navigator.clipboard.writeText(textWithNumbers)
    toast({
      title: "Copied!",
      description: "Text with line numbers copied to clipboard"
    })
  }

  const copyWithoutLineNumbers = () => {
    const textWithoutNumbers = displayLines.join('\n')
    navigator.clipboard.writeText(textWithoutNumbers)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard"
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Line Counter</h1>
        <p className="text-muted-foreground">Count lines and analyze text structure</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Text Input
              </CardTitle>
              <CardDescription>Enter or paste your text to count lines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] resize-y font-mono text-sm"
              />
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-numbers"
                    checked={showLineNumbers}
                    onCheckedChange={setShowLineNumbers}
                  />
                  <Label htmlFor="show-numbers">Show Line Numbers</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="count-empty"
                    checked={countEmptyLines}
                    onCheckedChange={setCountEmptyLines}
                  />
                  <Label htmlFor="count-empty">Count Empty Lines</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {inputText && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlignLeft className="h-5 w-5" />
                  Line Display
                </CardTitle>
                <CardDescription>
                  {countEmptyLines ? 'All lines' : 'Non-empty lines only'} • {displayLines.length} lines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono max-h-[300px] overflow-y-auto">
                    {displayLines.map((line, index) => (
                      <div key={index} className="hover:bg-muted-foreground/10 px-2 py-1 rounded">
                        {showLineNumbers && (
                          <span className="text-muted-foreground select-none mr-4">
                            {(index + 1).toString().padStart(4, ' ')}:
                          </span>
                        )}
                        <span>{line || ' '}</span>
                      </div>
                    ))}
                  </pre>
                  
                  <div className="flex gap-2 mt-4">
                    <Button onClick={copyWithLineNumbers} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy with Numbers
                    </Button>
                    <Button onClick={copyWithoutLineNumbers} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text Only
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Line Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Lines</span>
                <Badge variant="secondary">{stats.totalLines}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Non-empty Lines</span>
                <Badge variant="secondary">{stats.nonEmptyLines}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Empty Lines</span>
                <Badge variant="secondary">{stats.emptyLines}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Longest Line</span>
                <Badge variant="secondary">{stats.longestLine} chars</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Length</span>
                <Badge variant="secondary">{stats.averageLength} chars</Badge>
              </div>
            </CardContent>
          </Card>

          {inputText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlignLeft className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => setInputText(lines.filter(line => line.trim().length > 0).join('\n'))}
                  variant="outline" 
                  className="w-full justify-start"
                  size="sm"
                >
                  Remove Empty Lines
                </Button>
                <Button 
                  onClick={() => setInputText(lines.map(line => line.trim()).join('\n'))}
                  variant="outline" 
                  className="w-full justify-start"
                  size="sm"
                >
                  Trim All Lines
                </Button>
                <Button 
                  onClick={() => setInputText(lines.sort().join('\n'))}
                  variant="outline" 
                  className="w-full justify-start"
                  size="sm"
                >
                  Sort Lines
                </Button>
                <Button 
                  onClick={() => setInputText(lines.reverse().join('\n'))}
                  variant="outline" 
                  className="w-full justify-start"
                  size="sm"
                >
                  Reverse Lines
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}