'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  readingTime: number
  speakingTime: number
  averageWordsPerSentence: number
  averageCharactersPerWord: number
  longestWord: string
  shortestWord: string
  mostFrequentWord: string
  wordFrequency: { [key: string]: number }
  characterFrequency: { [key: string]: number }
}

export default function TextStatisticsAnalyzer() {
  const [text, setText] = useState('')
  const [stats, setStats] = useState<TextStats | null>(null)
  const { toast } = useToast()

  const analyzeText = (input: string): TextStats => {
    if (!input.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: 0,
        speakingTime: 0,
        averageWordsPerSentence: 0,
        averageCharactersPerWord: 0,
        longestWord: '',
        shortestWord: '',
        mostFrequentWord: '',
        wordFrequency: {},
        characterFrequency: {}
      }
    }

    // Basic statistics
    const characters = input.length
    const charactersNoSpaces = input.replace(/\s/g, '').length
    const lines = input.split('\n').length
    
    // Words
    const words = input.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    
    // Sentences (naive approach)
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    // Paragraphs
    const paragraphs = input.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    
    // Reading and speaking time (approximate)
    const readingTime = Math.ceil(wordCount / 200) // 200 words per minute
    const speakingTime = Math.ceil(wordCount / 130) // 130 words per minute
    
    // Average words per sentence
    const averageWordsPerSentence = sentences > 0 ? Math.round((wordCount / sentences) * 100) / 100 : 0
    
    // Average characters per word
    const averageCharactersPerWord = wordCount > 0 ? Math.round((charactersNoSpaces / wordCount) * 100) / 100 : 0
    
    // Longest and shortest words
    const cleanedWords = words.map(word => word.replace(/[^\w]/g, ''))
    const longestWord = cleanedWords.reduce((longest, current) => 
      current.length > longest.length ? current : longest, '')
    const shortestWord = cleanedWords.reduce((shortest, current) => 
      current.length < shortest.length || shortest.length === 0 ? current : shortest, '')
    
    // Word frequency
    const wordFrequency: { [key: string]: number } = {}
    cleanedWords.forEach(word => {
      const lowerWord = word.toLowerCase()
      wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1
    })
    
    // Most frequent word
    const mostFrequentWord = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''
    
    // Character frequency
    const characterFrequency: { [key: string]: number } = {}
    input.toLowerCase().split('').forEach(char => {
      if (char.match(/[a-z]/)) {
        characterFrequency[char] = (characterFrequency[char] || 0) + 1
      }
    })
    
    return {
      characters,
      charactersNoSpaces,
      words: wordCount,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      averageWordsPerSentence,
      averageCharactersPerWord,
      longestWord,
      shortestWord,
      mostFrequentWord,
      wordFrequency,
      characterFrequency
    }
  }

  const handleAnalyze = () => {
    const analysis = analyzeText(text)
    setStats(analysis)
  }

  const handleClear = () => {
    setText('')
    setStats(null)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to clipboard",
    })
  }

  const downloadReport = () => {
    if (!stats) return
    
    const report = `Text Statistics Analysis Report
===============================

Basic Statistics:
- Characters: ${stats.characters}
- Characters (no spaces): ${stats.charactersNoSpaces}
- Words: ${stats.words}
- Sentences: ${stats.sentences}
- Paragraphs: ${stats.paragraphs}
- Lines: ${stats.lines}

Time Estimates:
- Reading time: ${stats.readingTime} minutes
- Speaking time: ${stats.speakingTime} minutes

Averages:
- Average words per sentence: ${stats.averageWordsPerSentence}
- Average characters per word: ${stats.averageCharactersPerWord}

Word Analysis:
- Longest word: ${stats.longestWord}
- Shortest word: ${stats.shortestWord}
- Most frequent word: ${stats.mostFrequentWord}

Top 10 Most Frequent Words:
${Object.entries(stats.wordFrequency)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([word, count]) => `- ${word}: ${count}`)
  .join('\n')}

Character Frequency:
${Object.entries(stats.characterFrequency)
  .sort(([,a], [,b]) => b - a)
  .map(([char, count]) => `- ${char}: ${count}`)
  .join('\n')}
`
    
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'text-statistics-report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Text Statistics Analyzer
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of text including character count, word frequency, reading time, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleAnalyze} disabled={!text.trim()}>
                  Analyze Text
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                {stats && (
                  <Button variant="outline" onClick={downloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
              
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter or paste your text here for analysis..."
                className="min-h-32"
              />
            </div>

            {stats && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="words">Word Analysis</TabsTrigger>
                  <TabsTrigger value="characters">Character Analysis</TabsTrigger>
                  <TabsTrigger value="frequency">Frequency</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Characters</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.characters.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.charactersNoSpaces.toLocaleString()} without spaces
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Words</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.words.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.averageCharactersPerWord} avg chars/word
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Sentences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.sentences}</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.averageWordsPerSentence} avg words/sentence
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Paragraphs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.paragraphs}</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.lines} lines
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatTime(stats.readingTime)}</div>
                        <div className="text-sm text-muted-foreground">
                          200 words/minute
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Speaking Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatTime(stats.speakingTime)}</div>
                        <div className="text-sm text-muted-foreground">
                          130 words/minute
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="words" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Word Extremes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Longest Word:</span>
                          <Badge variant="secondary">{stats.longestWord || 'N/A'}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Shortest Word:</span>
                          <Badge variant="secondary">{stats.shortestWord || 'N/A'}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Most Frequent:</span>
                          <Badge variant="default">{stats.mostFrequentWord || 'N/A'}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Word Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Words:</span>
                          <span className="font-mono">{stats.words.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Unique Words:</span>
                          <span className="font-mono">{Object.keys(stats.wordFrequency).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Avg Word Length:</span>
                          <span className="font-mono">{stats.averageCharactersPerWord}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="characters" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Character Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Characters:</span>
                          <span className="font-mono">{stats.characters.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Without Spaces:</span>
                          <span className="font-mono">{stats.charactersNoSpaces.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Spaces:</span>
                          <span className="font-mono">{(stats.characters - stats.charactersNoSpaces).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Letters Only:</span>
                          <span className="font-mono">{Object.values(stats.characterFrequency).reduce((a, b) => a + b, 0)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Text Structure</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Lines:</span>
                          <span className="font-mono">{stats.lines}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Paragraphs:</span>
                          <span className="font-mono">{stats.paragraphs}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Sentences:</span>
                          <span className="font-mono">{stats.sentences}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Avg Sentence Length:</span>
                          <span className="font-mono">{stats.averageWordsPerSentence} words</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="frequency" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Top 20 Most Frequent Words
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              Object.entries(stats.wordFrequency)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 20)
                                .map(([word, count]) => `${word}: ${count}`)
                                .join('\n')
                            )}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {Object.entries(stats.wordFrequency)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 20)
                            .map(([word, count]) => (
                              <div key={word} className="flex justify-between items-center p-2 rounded hover:bg-muted">
                                <span className="font-mono">{word}</span>
                                <Badge variant="outline">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Character Frequency Distribution
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              Object.entries(stats.characterFrequency)
                                .sort(([,a], [,b]) => b - a)
                                .map(([char, count]) => `${char}: ${count}`)
                                .join('\n')
                            )}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {Object.entries(stats.characterFrequency)
                            .sort(([,a], [,b]) => b - a)
                            .map(([char, count]) => (
                              <div key={char} className="flex justify-between items-center p-2 rounded hover:bg-muted">
                                <span className="font-mono text-lg">{char.toUpperCase()}</span>
                                <Badge variant="outline">{count}</Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}