'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FileText, SortAsc, SortDesc, Copy, Download, Shuffle } from 'lucide-react'

export default function LineSorterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortType, setSortType] = useState<'alphabetical' | 'length' | 'numeric' | 'natural'>('alphabetical')
  const [removeDuplicates, setRemoveDuplicates] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [reverseLines, setReverseLines] = useState(false)
  const [shuffleLines, setShuffleLines] = useState(false)

  const sortLines = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    let lines = input.split('\n').filter(line => line.trim() !== '')

    if (removeDuplicates) {
      const seen = new Set()
      lines = lines.filter(line => {
        const key = ignoreCase ? line.toLowerCase() : line
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })
    }

    if (shuffleLines) {
      // Fisher-Yates shuffle
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]]
      }
    } else {
      lines.sort((a, b) => {
        let comparison = 0

        switch (sortType) {
          case 'alphabetical':
            comparison = ignoreCase 
              ? a.localeCompare(b, undefined, { sensitivity: 'base' })
              : a.localeCompare(b)
            break
          case 'length':
            comparison = a.length - b.length
            break
          case 'numeric':
            const numA = parseFloat(a)
            const numB = parseFloat(b)
            if (!isNaN(numA) && !isNaN(numB)) {
              comparison = numA - numB
            } else {
              comparison = ignoreCase 
                ? a.localeCompare(b, undefined, { sensitivity: 'base' })
                : a.localeCompare(b)
            }
            break
          case 'natural':
            comparison = naturalCompare(a, b, ignoreCase)
            break
        }

        return sortOrder === 'asc' ? comparison : -comparison
      })
    }

    if (reverseLines) {
      lines.reverse()
    }

    setOutput(lines.join('\n'))
  }, [input, sortOrder, sortType, removeDuplicates, ignoreCase, reverseLines, shuffleLines])

  const naturalCompare = (a: string, b: string, ignoreCase: boolean): number => {
    const re = /(^-?[0-9]+(\.?[0-9]*)$)|(^-?[0-9]*\.?[0-9]+$)/
    const aParts = a.split(/(\d+)/)
    const bParts = b.split(/(\d+)/)

    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
      const aPart = aParts[i]
      const bPart = bParts[i]

      if (re.test(aPart) && re.test(bPart)) {
        const aNum = parseFloat(aPart)
        const bNum = parseFloat(bPart)
        if (aNum !== bNum) {
          return aNum - bNum
        }
      } else {
        const comparison = ignoreCase 
          ? aPart.localeCompare(bPart, undefined, { sensitivity: 'base' })
          : aPart.localeCompare(bPart)
        if (comparison !== 0) {
          return comparison
        }
      }
    }

    return aParts.length - bParts.length
  }

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
    }
  }

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sorted-lines.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  const getStats = () => {
    const inputLines = input.split('\n').filter(line => line.trim() !== '')
    const outputLines = output.split('\n').filter(line => line.trim() !== '')
    
    return {
      inputLines: inputLines.length,
      outputLines: outputLines.length,
      removedDuplicates: inputLines.length - outputLines.length
    }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SortAsc className="h-5 w-5" />
            Line Sorter
          </CardTitle>
          <CardDescription>
            Sort lines of text alphabetically, by length, numerically, or naturally with various options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Input Text</Label>
                <Textarea
                  placeholder="Enter text to sort (one line per item)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={10}
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Type</Label>
                    <Select value={sortType} onValueChange={(value: 'alphabetical' | 'length' | 'numeric' | 'natural') => setSortType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        <SelectItem value="length">By Length</SelectItem>
                        <SelectItem value="numeric">Numeric</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remove-duplicates"
                        checked={removeDuplicates}
                        onCheckedChange={(checked) => setRemoveDuplicates(checked as boolean)}
                      />
                      <Label htmlFor="remove-duplicates" className="text-sm">Remove duplicates</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ignore-case"
                        checked={ignoreCase}
                        onCheckedChange={(checked) => setIgnoreCase(checked as boolean)}
                      />
                      <Label htmlFor="ignore-case" className="text-sm">Ignore case</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reverse-lines"
                        checked={reverseLines}
                        onCheckedChange={(checked) => setReverseLines(checked as boolean)}
                      />
                      <Label htmlFor="reverse-lines" className="text-sm">Reverse lines</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shuffle-lines"
                        checked={shuffleLines}
                        onCheckedChange={(checked) => setShuffleLines(checked as boolean)}
                      />
                      <Label htmlFor="shuffle-lines" className="text-sm">Shuffle lines</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={sortLines} disabled={!input.trim()}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort Lines
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                  <div className="flex-1" />
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sorted Output</Label>
                <Textarea
                  value={output}
                  readOnly
                  rows={10}
                  className="font-mono"
                />
              </div>

              {output && (
                <div className="space-y-4">
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Input Lines</div>
                      <div className="text-lg font-semibold">{stats.inputLines}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Output Lines</div>
                      <div className="text-lg font-semibold">{stats.outputLines}</div>
                    </div>
                    {removeDuplicates && (
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Removed</div>
                        <div className="text-lg font-semibold">{stats.removedDuplicates}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About Line Sorting</TabsTrigger>
                <TabsTrigger value="types">Sort Types</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">About Line Sorting</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Line sorting is the process of arranging lines of text in a specific order. 
                    This tool provides multiple sorting methods to organize your text data 
                    according to different criteria.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sorting is commonly used for organizing lists, cleaning up data, preparing 
                    content for processing, and making information more readable and accessible.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="types" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Sort Types Explained</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div><strong>Alphabetical:</strong> Sorts lines based on standard alphabetical order</div>
                    <div><strong>By Length:</strong> Sorts lines from shortest to longest (or vice versa)</div>
                    <div><strong>Numeric:</strong> Sorts lines as numbers when possible, falls back to alphabetical</div>
                    <div><strong>Natural:</strong> Sorts numbers within text naturally (e.g., "file2" comes before "file10")</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Usage Examples</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Sorting a numbered list:</p>
                      <div className="bg-background p-2 rounded font-mono text-xs">
                        item10<br/>
                        item2<br/>
                        item1
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Natural sort: item1, item2, item10<br/>
                        Alphabetical sort: item1, item10, item2
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Removing duplicates:</p>
                      <div className="bg-background p-2 rounded font-mono text-xs">
                        apple<br/>
                        banana<br/>
                        apple<br/>
                        cherry
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        With "Remove duplicates": apple, banana, cherry
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}