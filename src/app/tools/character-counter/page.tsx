"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, BarChart3, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function CharacterCounter() {
  const [inputText, setInputText] = useState('')

  const getTextStats = (text: string) => {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const lines = text.split('\n').length
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
    const paragraphs = text.trim() ? text.split('\n\n').filter(p => p.trim()).length : 0
    
    // Character frequency
    const charFrequency: Record<string, number> = {}
    for (const char of text.toLowerCase()) {
      if (char.match(/[a-z]/)) {
        charFrequency[char] = (charFrequency[char] || 0) + 1
      }
    }
    
    // Word frequency
    const wordFrequency: Record<string, number> = {}
    const wordsArray = text.toLowerCase().match(/\b\w+\b/g) || []
    for (const word of wordsArray) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    }
    
    // Most common characters and words
    const topChars = Object.entries(charFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      topChars,
      topWords,
      readingTime: Math.ceil(words / 200) // Average reading speed: 200 words per minute
    }
  }

  const stats = getTextStats(inputText)

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([inputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'text-analysis.txt'
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Character Counter</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyze your text with detailed statistics including character count, word count, reading time, and more.
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
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              
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
              </div>
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Text Statistics
              </CardTitle>
              <CardDescription>
                Detailed analysis of your text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Characters</span>
                    <Badge variant="secondary">
                      <Hash className="h-3 w-3 mr-1" />
                      {stats.characters}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Characters (no spaces)</span>
                    <Badge variant="secondary">
                      <Hash className="h-3 w-3 mr-1" />
                      {stats.charactersNoSpaces}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Words</span>
                    <Badge variant="secondary">
                      <Type className="h-3 w-3 mr-1" />
                      {stats.words}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lines</span>
                    <Badge variant="secondary">
                      <AlignLeft className="h-3 w-3 mr-1" />
                      {stats.lines}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sentences</span>
                    <Badge variant="secondary">
                      {stats.sentences}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Paragraphs</span>
                    <Badge variant="secondary">
                      {stats.paragraphs}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reading Time</span>
                    <Badge variant="secondary">
                      {stats.readingTime} min
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Words/Sentence</span>
                    <Badge variant="secondary">
                      {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Frequency Analysis */}
        {inputText && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Character Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Most Common Characters
                </CardTitle>
                <CardDescription>
                  Top 5 most frequent characters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topChars.length > 0 ? (
                    stats.topChars.map(([char, count], index) => (
                      <div key={char} className="flex justify-between items-center">
                        <span className="font-mono text-lg">{char.toUpperCase()}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(count / stats.topChars[0][1]) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No characters found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Word Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Most Common Words
                </CardTitle>
                <CardDescription>
                  Top 5 most frequent words
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topWords.length > 0 ? (
                    stats.topWords.map(([word, count], index) => (
                      <div key={word} className="flex justify-between items-center">
                        <span className="font-medium">{word}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(count / stats.topWords[0][1]) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No words found</p>
                  )}
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
                <h4 className="font-medium mb-2">Real-time Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Get instant statistics as you type
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Character Frequency</h4>
                <p className="text-sm text-muted-foreground">
                  See which characters appear most often
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Word Frequency</h4>
                <p className="text-sm text-muted-foreground">
                  Identify the most common words
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Reading Time</h4>
                <p className="text-sm text-muted-foreground">
                  Estimate how long it takes to read
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Export Options</h4>
                <p className="text-sm text-muted-foreground">
                  Copy or download your text
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Multiple Formats</h4>
                <p className="text-sm text-muted-foreground">
                  Works with any text format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}