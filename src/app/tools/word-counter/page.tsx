'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Hash, Type, Copy, Download, Upload, X } from 'lucide-react'

interface TextAnalysis {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTime: number
  speakingTime: number
  wordFrequency: { [key: string]: number }
  characterFrequency: { [key: string]: number }
}

interface AnalysisHistory {
  id: string
  text: string
  analysis: TextAnalysis
  timestamp: Date
}

export default function WordCounter() {
  const [text, setText] = useState<string>('')
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
  const [showWordFrequency, setShowWordFrequency] = useState<boolean>(true)
  const [showCharacterFrequency, setShowCharacterFrequency] = useState<boolean>(false)

  const analyzeText = (inputText: string) => {
    if (!inputText.trim()) {
      setAnalysis(null)
      return
    }

    // Basic counts
    const characters = inputText.length
    const charactersNoSpaces = inputText.replace(/\s/g, '').length
    
    // Word count (handles multiple spaces and newlines)
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length
    
    // Sentence count (naive approach)
    const sentences = inputText.trim() === '' ? 0 : 
      inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    // Paragraph count
    const paragraphs = inputText.trim() === '' ? 0 : 
      inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200)
    
    // Speaking time (average 130 words per minute)
    const speakingTime = Math.ceil(words / 130)

    // Word frequency (case-insensitive, ignore common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']
    
    const wordFrequency: { [key: string]: number } = {}
    const wordsArray = inputText.toLowerCase().match(/\b\w+\b/g) || []
    
    wordsArray.forEach(word => {
      if (!commonWords.includes(word) && word.length > 2) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      }
    })

    // Character frequency
    const characterFrequency: { [key: string]: number } = {}
    const charsArray = inputText.toLowerCase().replace(/\s/g, '').split('')
    
    charsArray.forEach(char => {
      if (char.match(/[a-z]/)) {
        characterFrequency[char] = (characterFrequency[char] || 0) + 1
      }
    })

    const result: TextAnalysis = {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      wordFrequency,
      characterFrequency
    }

    setAnalysis(result)

    // Add to history
    const historyItem: AnalysisHistory = {
      id: Date.now().toString(),
      text: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
      analysis: result,
      timestamp: new Date()
    }
    
    setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const exportAnalysis = () => {
    if (!analysis) return

    const csvContent = [
      ['Metric', 'Value'],
      ['Characters', analysis.characters.toString()],
      ['Characters (no spaces)', analysis.charactersNoSpaces.toString()],
      ['Words', analysis.words.toString()],
      ['Sentences', analysis.sentences.toString()],
      ['Paragraphs', analysis.paragraphs.toString()],
      ['Reading Time (minutes)', analysis.readingTime.toString()],
      ['Speaking Time (minutes)', analysis.speakingTime.toString()]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-analysis-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportFrequencyData = () => {
    if (!analysis) return

    const wordFreqData = Object.entries(analysis.wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
    
    const charFreqData = Object.entries(analysis.characterFrequency)
      .sort(([,a], [,b]) => b - a)

    const csvContent = [
      ['Type', 'Item', 'Frequency'],
      ...wordFreqData.map(([word, freq]) => ['Word', word, freq.toString()]),
      ...charFreqData.map(([char, freq]) => ['Character', char, freq.toString()])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `frequency-analysis-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearText = () => {
    setText('')
    setAnalysis(null)
  }

  const loadSampleText = () => {
    const sampleText = `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is commonly used for testing fonts and keyboards.

Text analysis is a fascinating field that combines linguistics, statistics, and computer science. By analyzing text, we can gain insights into writing style, readability, and content structure.

Modern text analysis tools can count words, characters, sentences, and paragraphs. They can also calculate reading time, analyze word frequency, and even detect the emotional tone of the text.

Whether you're a writer, student, or researcher, understanding the characteristics of your text can help you improve your communication and achieve your goals more effectively.`
    
    setText(sampleText)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setText(content)
      }
      reader.readAsText(file)
    }
  }

  useEffect(() => {
    analyzeText(text)
  }, [text])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getTopWords = () => {
    if (!analysis) return []
    return Object.entries(analysis.wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  }

  const getCharacterFrequency = () => {
    if (!analysis) return []
    return Object.entries(analysis.characterFrequency)
      .sort(([,a], [,b]) => b - a)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Word Counter & Text Analyzer</h1>
        <p className="text-muted-foreground">Analyze your text with comprehensive statistics and insights</p>
      </div>

      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer">Text Analyzer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Text Input
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadSampleText}>
                    Load Sample
                  </Button>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </span>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" size="sm" onClick={clearText} disabled={!text}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Enter or paste your text below for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-y"
              />
            </CardContent>
          </Card>

          {analysis && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Characters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analysis.characters)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(analysis.charactersNoSpaces)} no spaces
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Words
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analysis.words)}</div>
                    <div className="text-sm text-muted-foreground">
                      {analysis.words > 0 ? Math.round(analysis.characters / analysis.words) : 0} avg length
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sentences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analysis.sentences)}</div>
                    <div className="text-sm text-muted-foreground">
                      {analysis.sentences > 0 ? Math.round(analysis.words / analysis.sentences) : 0} avg words
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Paragraphs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analysis.paragraphs)}</div>
                    <div className="text-sm text-muted-foreground">
                      {analysis.paragraphs > 0 ? Math.round(analysis.sentences / analysis.paragraphs) : 0} avg sentences
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Reading & Speaking Time</CardTitle>
                  <CardDescription>
                    Estimated time based on average reading and speaking speeds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {analysis.readingTime}
                      </div>
                      <div className="text-muted-foreground">minutes reading</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        (~200 words/minute)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {analysis.speakingTime}
                      </div>
                      <div className="text-muted-foreground">minutes speaking</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        (~130 words/minute)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Frequency Analysis
                    <div className="flex gap-2">
                      <Button
                        variant={showWordFrequency ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowWordFrequency(true)}
                      >
                        Words
                      </Button>
                      <Button
                        variant={showCharacterFrequency ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCharacterFrequency(true)}
                      >
                        Characters
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportFrequencyData}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {showWordFrequency ? 'Most frequent words (excluding common words)' : 'Character frequency distribution'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showWordFrequency && getTopWords().length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {getTopWords().map(([word, count]) => (
                        <div key={word} className="text-center">
                          <Badge variant="secondary" className="w-full justify-center">
                            {word}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {count}x
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showCharacterFrequency && getCharacterFrequency().length > 0 && (
                    <div className="grid grid-cols-6 md:grid-cols-13 gap-2">
                      {getCharacterFrequency().map(([char, count]) => (
                        <div key={char} className="text-center">
                          <Badge variant="outline" className="w-full justify-center">
                            {char.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {count}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Download your analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportAnalysis}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Analysis
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(
                        `Words: ${analysis.words}\n` +
                        `Characters: ${analysis.characters}\n` +
                        `Sentences: ${analysis.sentences}\n` +
                        `Reading Time: ${analysis.readingTime} minutes`
                      )}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>
                Your recent text analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No analysis history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analysisHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {item.text}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <Badge variant="outline">{item.analysis.words} words</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.analysis.characters} chars
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}