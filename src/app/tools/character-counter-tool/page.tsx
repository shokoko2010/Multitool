'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Hash, Type, BarChart3, Copy, Download } from 'lucide-react'

interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  readingTime: number
  speakingTime: number
}

interface CharacterFrequency {
  [key: string]: number
}

export default function CharacterCounterTool() {
  const [text, setText] = useState('')
  const [includeSpaces, setIncludeSpaces] = useState(true)
  const [showFrequency, setShowFrequency] = useState(false)

  const stats = useMemo((): TextStats => {
    if (!text.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: 0,
        speakingTime: 0
      }
    }

    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    const lines = text ? text.split('\n').length : 0
    
    // Average reading speed: 200-250 words per minute
    const readingTime = Math.ceil(words / 200)
    // Average speaking speed: 130-150 words per minute
    const speakingTime = Math.ceil(words / 130)

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime
    }
  }, [text])

  const characterFrequency = useMemo((): CharacterFrequency => {
    const frequency: CharacterFrequency = {}
    
    for (const char of text) {
      if (char === ' ') continue // Skip spaces
      frequency[char] = (frequency[char] || 0) + 1
    }
    
    return frequency
  }, [text])

  const sortedFrequency = useMemo(() => {
    return Object.entries(characterFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20) // Top 20 characters
  }, [characterFrequency])

  const wordFrequency = useMemo((): CharacterFrequency => {
    const frequency: CharacterFrequency = {}
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1
    }
    
    return frequency
  }, [text])

  const sortedWordFrequency = useMemo(() => {
    return Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20) // Top 20 words
  }, [wordFrequency])

  const handleCopy = async () => {
    if (text) {
      await navigator.clipboard.writeText(text)
    }
  }

  const handleDownload = () => {
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'text-analysis.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleClear = () => {
    setText('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setText(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Character Counter
          </CardTitle>
          <CardDescription>
            Analyze text statistics including character count, word count, reading time, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Text</label>
                <Textarea
                  placeholder="Enter or paste your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={!text}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
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

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="h-4 w-4" />
                    <span className="text-sm font-medium">Characters</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {includeSpaces ? stats.characters : stats.charactersNoSpaces}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id="include-spaces"
                      checked={includeSpaces}
                      onCheckedChange={(checked) => setIncludeSpaces(checked as boolean)}
                    />
                    <label htmlFor="include-spaces" className="text-sm">
                      Include spaces
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm font-medium">Words</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.words}</div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Sentences</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.sentences}</div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Paragraphs</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.paragraphs}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Reading Time</div>
                  <div className="text-xl font-bold">{stats.readingTime} min</div>
                  <div className="text-xs text-muted-foreground">
                    ~{stats.words} words at 200 wpm
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Speaking Time</div>
                  <div className="text-xl font-bold">{stats.speakingTime} min</div>
                  <div className="text-xs text-muted-foreground">
                    ~{stats.words} words at 130 wpm
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Lines</div>
                  <div className="text-xl font-bold">{stats.lines}</div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Avg Words/Sentence</div>
                  <div className="text-xl font-bold">
                    {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(showFrequency || sortedFrequency.length > 0 || sortedWordFrequency.length > 0) && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-frequency"
                  checked={showFrequency}
                  onCheckedChange={(checked) => setShowFrequency(checked as boolean)}
                />
                <label htmlFor="show-frequency" className="text-sm font-medium">
                  Show Frequency Analysis
                </label>
              </div>

              {showFrequency && (
                <Tabs defaultValue="characters" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="characters">Character Frequency</TabsTrigger>
                    <TabsTrigger value="words">Word Frequency</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="characters" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {sortedFrequency.map(([char, count]) => (
                        <div key={char} className="p-2 bg-muted rounded text-sm">
                          <div className="font-mono text-lg">"{char}"</div>
                          <div className="text-muted-foreground">{count} times</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="words" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {sortedWordFrequency.map(([word, count]) => (
                        <div key={word} className="p-2 bg-muted rounded text-sm">
                          <div className="font-medium">"{word}"</div>
                          <div className="text-muted-foreground">{count} times</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About Text Analysis</TabsTrigger>
                <TabsTrigger value="metrics">Metrics Explained</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">About Text Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Text analysis provides valuable insights into your content by measuring various 
                    metrics such as character count, word count, and reading time. These metrics 
                    are essential for content creators, writers, and developers.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Understanding text statistics helps in optimizing content for readability, 
                    meeting length requirements, and improving overall communication effectiveness.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Metrics Explained</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div><strong>Characters:</strong> Total number of characters including or excluding spaces</div>
                    <div><strong>Words:</strong> Number of words separated by spaces</div>
                    <div><strong>Sentences:</strong> Number of sentences ending with .!? punctuation</div>
                    <div><strong>Paragraphs:</strong> Number of paragraphs separated by blank lines</div>
                    <div><strong>Reading Time:</strong> Estimated time to read at 200 words per minute</div>
                    <div><strong>Speaking Time:</strong> Estimated time to speak at 130 words per minute</div>
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