'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Hash, FileText, Copy, Download, Upload, BarChart3, Clock, Zap } from 'lucide-react'

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
}

export default function WordCounter() {
  const [inputText, setInputText] = useState('')
  const [stats, setStats] = useState<TextStats>({
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
    wordFrequency: {}
  })

  const calculateStats = (text: string) => {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    const lines = text ? text.split('\n').length : 0
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200)
    // Speaking time (average 130 words per minute)
    const speakingTime = Math.ceil(words / 130)
    
    const averageWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0
    const averageCharactersPerWord = words > 0 ? Math.round(charactersNoSpaces / words) : 0
    
    // Find longest and shortest words
    const wordsArray = text.trim().split(/\s+/).filter(word => word.length > 0)
    const longestWord = wordsArray.reduce((longest, current) => 
      current.length > longest.length ? current : longest, '')
    const shortestWord = wordsArray.reduce((shortest, current) => 
      current.length < shortest.length || shortest.length === 0 ? current : shortest, '')
    
    // Word frequency
    const wordFrequency: { [key: string]: number } = {}
    const cleanWords = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 0)
    
    cleanWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    })
    
    const mostFrequentWord = Object.keys(wordFrequency).reduce((a, b) => 
      wordFrequency[a] > wordFrequency[b] ? a : b, '')
    
    setStats({
      characters,
      charactersNoSpaces,
      words,
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
      wordFrequency
    })
  }

  useEffect(() => {
    calculateStats(inputText)
  }, [inputText])

  const copyToClipboard = async () => {
    if (inputText) {
      try {
        await navigator.clipboard.writeText(inputText)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const downloadText = () => {
    if (inputText) {
      const blob = new Blob([inputText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'text-analysis.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearText = () => {
    setInputText('')
  }

  const loadSample = () => {
    const sampleText = `The quick brown fox jumps over the lazy dog. This pangram sentence contains every letter of the alphabet at least once. 

Text analysis is an important part of understanding written communication. By counting words, characters, and other metrics, we can gain insights into the complexity and readability of text.

Word counters are useful tools for writers, students, and professionals who need to meet specific length requirements or analyze their writing style. They provide valuable statistics about text composition and reading time.`
    setInputText(sampleText)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    }
  }

  const getTopWords = (count: number = 10) => {
    return Object.entries(stats.wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Hash className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Word Counter</h1>
            </div>
            <p className="text-muted-foreground">
              Analyze text with comprehensive statistics and insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Input Text
                </CardTitle>
                <CardDescription>
                  Enter or paste your text for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your text here for analysis..."
                  className="min-h-[400px]"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={loadSample} variant="outline" size="sm">
                    Load Sample
                  </Button>
                  <Button onClick={clearText} variant="outline" size="sm">
                    Clear
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" size="sm" disabled={!inputText}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadText} variant="outline" size="sm" disabled={!inputText}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </span>
                    </Button>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".txt,.md,.doc,.docx" 
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Text Statistics
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of your text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Characters</p>
                      <p className="text-2xl font-bold">{stats.characters.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.charactersNoSpaces.toLocaleString()} without spaces
                      </p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Words</p>
                      <p className="text-2xl font-bold">{stats.words.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Sentences</p>
                      <p className="text-2xl font-bold">{stats.sentences.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Paragraphs</p>
                      <p className="text-2xl font-bold">{stats.paragraphs.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Lines</p>
                      <p className="text-2xl font-bold">{stats.lines.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Reading Time
                      </p>
                      <p className="text-2xl font-bold">{stats.readingTime}m</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.speakingTime}m speaking
                      </p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Avg Words/Sentence</p>
                      <p className="text-2xl font-bold">{stats.averageWordsPerSentence}</p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Avg Characters/Word</p>
                      <p className="text-2xl font-bold">{stats.averageCharactersPerWord}</p>
                    </div>
                  </div>
                </div>

                {inputText && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Longest Word</p>
                      <p className="font-mono text-sm">{stats.longestWord || 'N/A'}</p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Shortest Word</p>
                      <p className="font-mono text-sm">{stats.shortestWord || 'N/A'}</p>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Most Frequent Word</p>
                      <p className="font-mono text-sm">{stats.mostFrequentWord || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.wordFrequency[stats.mostFrequentWord] || 0} occurrences
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {inputText && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Advanced Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="frequency" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="frequency">Word Frequency</TabsTrigger>
                    <TabsTrigger value="readability">Readability</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="frequency" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Top Words by Frequency</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {getTopWords(15).map(([word, count], index) => (
                          <div key={word} className="p-2 bg-muted rounded-md text-center">
                            <p className="text-sm font-medium">{word}</p>
                            <p className="text-xs text-muted-foreground">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="readability" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Readability Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Text Complexity</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-background rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (stats.averageWordsPerSentence / 20) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {stats.averageWordsPerSentence > 15 ? 'Complex' : stats.averageWordsPerSentence > 10 ? 'Moderate' : 'Simple'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Reading Level</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-background rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (stats.averageCharactersPerWord / 8) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {stats.averageCharactersPerWord > 6 ? 'Advanced' : stats.averageCharactersPerWord > 4 ? 'Intermediate' : 'Basic'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Writing Insights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Content Type</p>
                          <p className="text-xs text-muted-foreground">
                            {stats.paragraphs > 5 ? 'Long-form content' : 
                             stats.paragraphs > 2 ? 'Medium-form content' : 'Short-form content'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Style Analysis</p>
                          <p className="text-xs text-muted-foreground">
                            {stats.averageWordsPerSentence > 15 ? 'Complex sentences' : 
                             stats.averageWordsPerSentence > 10 ? 'Balanced style' : 'Simple sentences'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Time Investment</p>
                          <p className="text-xs text-muted-foreground">
                            {stats.readingTime > 10 ? 'Extended reading' : 
                             stats.readingTime > 5 ? 'Moderate reading' : 'Quick reading'}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Vocabulary Richness</p>
                          <p className="text-xs text-muted-foreground">
                            {Object.keys(stats.wordFrequency).length > 100 ? 'Rich vocabulary' : 
                             Object.keys(stats.wordFrequency).length > 50 ? 'Moderate vocabulary' : 'Basic vocabulary'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}