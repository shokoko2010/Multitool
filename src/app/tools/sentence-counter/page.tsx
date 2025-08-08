'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, FileText, Type, AlignLeft, Clock } from 'lucide-react'

interface SentenceAnalysis {
  totalSentences: number
  totalWords: number
  totalCharacters: number
  averageWordsPerSentence: number
  averageCharactersPerSentence: number
  averageWordsPerWord: number
  shortestSentence: number
  longestSentence: number
  sentenceLengths: Array<{
    length: number
    count: number
    percentage: number
    examples: string[]
  }>
  readingTime: number
  speakingTime: number
}

export default function SentenceCounter() {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeSentences = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Split into sentences (basic approach)
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const totalSentences = sentences.length
      
      // Analyze each sentence
      const sentenceLengths: number[] = []
      const lengthDistribution: { [key: number]: { count: number, examples: string[] } } = {}
      
      let totalWords = 0
      let totalCharacters = 0
      const shortestSentence = Infinity
      const longestSentence = 0

      sentences.forEach(sentence => {
        const words = sentence.trim().split(/\s+/).filter(word => word.length > 0)
        const wordCount = words.length
        const characterCount = sentence.trim().length
        
        sentenceLengths.push(wordCount)
        totalWords += wordCount
        totalCharacters += characterCount
        
        // Group by sentence length
        const lengthGroup = Math.floor(wordCount / 5) * 5 // Group in 5-word increments
        if (!lengthDistribution[lengthGroup]) {
          lengthDistribution[lengthGroup] = { count: 0, examples: [] }
        }
        lengthDistribution[lengthGroup].count++
        
        // Store examples (limit to 3 per group)
        if (lengthDistribution[lengthGroup].examples.length < 3) {
          lengthDistribution[lengthGroup].examples.push(sentence.trim())
        }
      })

      const averageWordsPerSentence = totalSentences > 0 ? totalWords / totalSentences : 0
      const averageCharactersPerSentence = totalSentences > 0 ? totalCharacters / totalSentences : 0
      const averageWordsPerWord = totalWords > 0 ? totalCharacters / totalWords : 0

      // Calculate reading and speaking time
      const readingTime = Math.ceil(totalWords / 200) // Average reading speed: 200 words per minute
      const speakingTime = Math.ceil(totalWords / 150) // Average speaking speed: 150 words per minute

      // Create length distribution
      const distribution = Object.entries(lengthDistribution)
        .map(([length, data]) => ({
          length: parseInt(length),
          count: data.count,
          percentage: (data.count / totalSentences) * 100,
          examples: data.examples
        }))
        .sort((a, b) => a.length - b.length)

      const sentenceAnalysis: SentenceAnalysis = {
        totalSentences,
        totalWords,
        totalCharacters,
        averageWordsPerSentence,
        averageCharactersPerSentence,
        averageWordsPerWord,
        shortestSentence: Math.min(...sentenceLengths),
        longestSentence: Math.max(...sentenceLengths),
        sentenceLengths: distribution,
        readingTime,
        speakingTime
      }

      setAnalysis(sentenceAnalysis)
    } catch (error) {
      console.error('Error analyzing sentences:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!analysis) return
    
    const resultText = `
Sentence Analysis Report:

Total Sentences: ${analysis.totalSentences}
Total Words: ${analysis.totalWords}
Total Characters: ${analysis.totalCharacters}
Average Words per Sentence: ${analysis.averageWordsPerSentence.toFixed(1)}
Average Characters per Sentence: ${analysis.averageCharactersPerSentence.toFixed(1)}
Average Characters per Word: ${analysis.averageWordsPerWord.toFixed(1)}
Shortest Sentence: ${analysis.shortestSentence} words
Longest Sentence: ${analysis.longestSentence} words
Reading Time: ${analysis.readingTime} minute${analysis.readingTime !== 1 ? 's' : ''}
Speaking Time: ${analysis.speakingTime} minute${analysis.speakingTime !== 1 ? 's' : ''}

Sentence Length Distribution:
${analysis.sentenceLengths.map(d => `${d.length}-${d.length + 4} words: ${d.count} sentences (${d.percentage.toFixed(1)}%)`).join('\n')}
    `.trim()
    
    navigator.clipboard.writeText(resultText)
  }

  const getLengthColor = (length: number) => {
    if (length >= 25) return 'bg-red-100 text-red-800'
    if (length >= 15) return 'bg-orange-100 text-orange-800'
    if (length >= 8) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sentence Counter</h1>
        <p className="text-muted-foreground">Analyze sentence structure, length, and readability metrics</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignLeft className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze sentence by sentence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for sentence analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={analyzeSentences} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Sentences'}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sentence Analysis Results
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyResult}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.totalSentences}</div>
                  <p className="text-sm text-muted-foreground">Sentences</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.totalWords}</div>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.totalCharacters}</div>
                  <p className="text-sm text-muted-foreground">Characters</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.averageWordsPerSentence.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Avg Words/Sentence</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Sentence Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Shortest Sentence:</span>
                      <span className="font-medium">{analysis.shortestSentence} words</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Longest Sentence:</span>
                      <span className="font-medium">{analysis.longestSentence} words</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Characters:</span>
                      <span className="font-medium">{analysis.averageCharactersPerSentence.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Character Density:</span>
                      <span className="font-medium">{analysis.averageWordsPerWord.toFixed(1)} chars/word</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Estimates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Reading Time:</span>
                      <span className="font-medium">{analysis.readingTime} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Speaking Time:</span>
                      <span className="font-medium">{analysis.speakingTime} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Words per Minute (Reading):</span>
                      <span className="font-medium">{(analysis.totalWords / Math.max(analysis.readingTime, 1)).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Words per Minute (Speaking):</span>
                      <span className="font-medium">{(analysis.totalWords / Math.max(analysis.speakingTime, 1)).toFixed(0)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Sentence Length Distribution</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analysis.sentenceLengths.map((item) => (
                    <div key={item.length} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getLengthColor(item.length)}
                          >
                            {item.length}-{item.length + 4}
                          </Badge>
                          <span className="text-sm font-medium">words</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.count} sentences
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{item.percentage.toFixed(1)}%</div>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Readability Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Sentence Length:</span>{' '}
                      {analysis.averageWordsPerSentence < 10 ? 'Very Short' :
                       analysis.averageWordsPerSentence < 15 ? 'Short' :
                       analysis.averageWordsPerSentence < 20 ? 'Medium' :
                       analysis.averageWordsPerSentence < 25 ? 'Long' : 'Very Long'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Complexity:</span>{' '}
                      {analysis.averageWordsPerSentence < 12 ? 'Simple' :
                       analysis.averageWordsPerSentence < 18 ? 'Moderate' : 'Complex'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Flow:</span>{' '}
                      {Math.abs(analysis.averageWordsPerSentence - 15) < 3 ? 'Good' : 'Needs Adjustment'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Content Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Variety:</span>{' '}
                      {analysis.sentenceLengths.length > 3 ? 'High' : 'Low'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Balance:</span>{' '}
                      {analysis.shortestSentence > 5 && analysis.longestSentence < 30 ? 'Good' : 'Poor'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Structure:</span>{' '}
                      {analysis.averageWordsPerSentence > 8 && analysis.averageWordsPerSentence < 20 ? 'Optimal' : 'Needs Work'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Writing Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Aim for 15-20 words per sentence for optimal readability</li>
                  <li>• Mix short and long sentences for better rhythm</li>
                  <li>• Avoid sentences over 25 words for complex content</li>
                  <li>• Use 5-10 word sentences for emphasis and clarity</li>
                  <li>• Vary sentence structure to maintain reader interest</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}