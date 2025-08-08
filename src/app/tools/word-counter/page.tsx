'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, RotateCcw, FileText, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WordStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTime: number
  averageWordsPerSentence: number
  averageCharsPerWord: number
  longestWord: string
  wordFrequency: { [key: string]: number }
}

export default function WordCounter() {
  const [text, setText] = useState('')
  const [stats, setStats] = useState<WordStats | null>(null)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [includeNumbers, setIncludeNumbers] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const calculateStats = () => {
    if (!text.trim()) {
      setStats(null)
      return
    }

    setLoading(true)
    try {
      // Basic character counts
      const characters = text.length
      const charactersNoSpaces = text.replace(/\s/g, '').length

      // Word counting
      const words = text.trim() ? text.trim().split(/\s+/).length : 0

      // Sentence counting
      const sentences = text.trim() ? 
        text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0

      // Paragraph counting
      const paragraphs = text.trim() ? 
        text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 1

      // Reading time (average 200 words per minute)
      const readingTime = Math.ceil(words / 200)

      // Average words per sentence
      const averageWordsPerSentence = sentences > 0 ? words / sentences : 0

      // Average characters per word
      const averageCharsPerWord = words > 0 ? charactersNoSpaces / words : 0

      // Longest word
      const wordsArray = text.trim().split(/\s+/)
      const longestWord = wordsArray.reduce((longest, current) => 
        current.length > longest.length ? current : longest, '')

      // Word frequency
      const wordFreq: { [key: string]: number } = {}
      const wordsForFrequency = text.trim().split(/\s+/).map(word => 
        caseSensitive ? word : word.toLowerCase()
      )

      wordsForFrequency.forEach(word => {
        if (includeNumbers || !/\d/.test(word)) {
          const cleanWord = word.replace(/[^\w\u00C0-\u024F]/g, '')
          if (cleanWord.length > 0) {
            wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
          }
        }
      })

      const sortedWordFreq = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [word, count]) => {
          obj[word] = count
          return obj
        }, {} as { [key: string]: number })

      setStats({
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        readingTime,
        averageWordsPerSentence,
        averageCharsPerWord,
        longestWord,
        wordFrequency: sortedWordFreq
      })
      
      toast({
        title: "Statistics calculated",
        description: `Found ${words} words and ${characters} characters`
      })
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: "Unable to calculate text statistics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyStats = () => {
    if (!stats) return

    const statsText = `Text Statistics Report:
    
Characters (with spaces): ${stats.characters}
Characters (without spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Estimated reading time: ${stats.readingTime} minutes
Average words per sentence: ${stats.averageWordsPerSentence.toFixed(1)}
Average characters per word: ${stats.averageCharsPerWord.toFixed(1)}
Longest word: "${stats.longestWord}" (${stats.longestWord.length} characters)

Top 10 most frequent words:
${Object.entries(stats.wordFrequency).map(([word, count]) => `${word}: ${count}`).join('\n')}`

    navigator.clipboard.writeText(statsText)
    toast({
      title: "Copied to clipboard",
      description: "Statistics have been copied to clipboard"
    })
  }

  const downloadStats = () => {
    if (!stats) return

    const statsText = `Text Statistics Report
    
Generated on: ${new Date().toLocaleString()}

Basic Counts:
- Characters (with spaces): ${stats.characters}
- Characters (without spaces): ${stats.charactersNoSpaces}
- Words: ${stats.words}
- Sentences: ${stats.sentences}
- Paragraphs: ${stats.paragraphs}

Analysis:
- Estimated reading time: ${stats.readingTime} minutes
- Average words per sentence: ${stats.averageWordsPerSentence.toFixed(1)}
- Average characters per word: ${stats.averageCharsPerWord.toFixed(1)}
- Longest word: "${stats.longestWord}" (${stats.longestWord.length} characters)

Word Frequency (Top 10):
${Object.entries(stats.wordFrequency).map(([word, count]) => `${word}: ${count}`).join('\n')}`

    const blob = new Blob([statsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'text-stats.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "Statistics file download has started"
    })
  }

  const clearText = () => {
    setText('')
    setStats(null)
  }

  const setSampleText = () => {
    setText(`The quick brown fox jumps over the lazy dog. This is a sample text for testing the word counter tool. It contains multiple sentences, various words, and punctuation marks to demonstrate the statistical analysis capabilities.

Word counters are essential tools for writers, editors, and content creators. They help in analyzing text quality, reading level, and content structure. By understanding these metrics, you can improve your writing and ensure it meets specific requirements or guidelines.

The tool calculates various statistics including character counts, word counts, sentence analysis, and reading time estimates. This information is valuable for SEO optimization, content planning, and academic writing.`)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Word Counter</h1>
        <p className="text-muted-foreground">
          Analyze text with comprehensive statistics including word count, reading time, and word frequency
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Text Tool</Badge>
          <Badge variant="outline">Analysis</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Text Input</CardTitle>
            <CardDescription>
              Enter your text to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] font-mono"
            />
            
            <div className="flex gap-2">
              <Button onClick={calculateStats} disabled={loading || !text.trim()} className="flex-1">
                {loading ? <BarChart3 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                {loading ? "Analyzing..." : "Analyze Text"}
              </Button>
              <Button onClick={setSampleText} variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Load Sample
              </Button>
              <Button onClick={clearText} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Analysis Options</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Case sensitive</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Include numbers</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>
              Text analysis results will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.characters}</div>
                    <div className="text-sm text-muted-foreground">Characters</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.words}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.sentences}</div>
                    <div className="text-sm text-muted-foreground">Sentences</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.paragraphs}</div>
                    <div className="text-sm text-muted-foreground">Paragraphs</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Additional Metrics</h4>
                  <div className="text-sm space-y-1">
                    <p>Reading time: {stats.readingTime} minute{stats.readingTime !== 1 ? 's' : ''}</p>
                    <p>Avg words per sentence: {stats.averageWordsPerSentence.toFixed(1)}</p>
                    <p>Avg chars per word: {stats.averageCharsPerWord.toFixed(1)}</p>
                    <p>Longest word: "{stats.longestWord}" ({stats.longestWord.length} chars)</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={copyStats} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadStats} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">
                  Enter text and click "Analyze Text" to see statistics
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats && Object.keys(stats.wordFrequency).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Word Frequency Analysis</CardTitle>
            <CardDescription>
              Most common words in your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Word List</TabsTrigger>
                <TabsTrigger value="visual">Visual</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="space-y-2">
                <div className="max-h-48 overflow-y-auto">
                  {Object.entries(stats.wordFrequency).map(([word, count]) => (
                    <div key={word} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{word}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="visual" className="space-y-2">
                <div className="space-y-2">
                  {Object.entries(stats.wordFrequency).map(([word, count]) => {
                    const maxCount = Math.max(...Object.values(stats.wordFrequency))
                    const percentage = (count / maxCount) * 100
                    return (
                      <div key={word} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{word}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Word Counter Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">What it measures</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Total character count</li>
                <li>• Word count and frequency</li>
                <li>• Sentence and paragraph structure</li>
                <li>• Reading time estimation</li>
                <li>• Text complexity metrics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Use cases</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Content creation and editing</li>
                <li>• SEO optimization</li>
                <li>• Academic writing requirements</li>
                <li>• Social media character limits</li>
                <li>• Content quality assessment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}