'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, BarChart3, TrendingUp } from 'lucide-react'

interface WordFrequency {
  word: string
  frequency: number
  percentage: number
  rank: number
}

export default function WordFrequency() {
  const [input, setInput] = useState('')
  const [wordFrequencies, setWordFrequencies] = useState<WordFrequency[]>([])
  const [loading, setLoading] = useState(false)
  const [minLength, setMinLength] = useState(3)
  const [topN, setTopN] = useState(20)

  const analyzeWordFrequency = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Process text
      const words = input.toLowerCase().split(/\s+/)
      const totalWords = words.length
      
      // Filter by minimum length and remove empty words
      const filteredWords = words
        .filter(word => word.replace(/[^a-z]/g, '').length >= minLength)
        .filter(word => word.length > 0)
      
      // Count word frequencies
      const wordFreq: { [key: string]: number } = {}
      filteredWords.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/g, '')
        if (cleanWord.length > 0) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
        }
      })

      // Convert to array and sort by frequency
      const frequencyArray: WordFrequency[] = Object.entries(wordFreq)
        .map(([word, frequency]) => ({
          word,
          frequency,
          percentage: (frequency / totalWords) * 100,
          rank: 0 // Will be set after sorting
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, topN)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))

      setWordFrequencies(frequencyArray)
    } catch (error) {
      console.error('Error analyzing word frequency:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (wordFrequencies.length === 0) return
    
    const resultText = wordFrequencies
      .map(w => `${w.rank}. ${w.word}: ${w.frequency} (${w.percentage.toFixed(2)}%)`)
      .join('\n')
    
    navigator.clipboard.writeText(resultText)
  }

  const getFrequencyColor = (frequency: number) => {
    if (frequency >= 10) return 'bg-red-100 text-red-800'
    if (frequency >= 5) return 'bg-orange-100 text-orange-800'
    if (frequency >= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Word Frequency Analyzer</h1>
        <p className="text-muted-foreground">Analyze word usage patterns and frequency in your text</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze for word frequency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for word frequency analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Min Word Length:</label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={minLength}
                  onChange={(e) => setMinLength(parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="outline">{minLength}+ chars</Badge>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Top Results:</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={topN}
                  onChange={(e) => setTopN(parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="outline">{topN}</Badge>
              </div>
            </div>
            <Button 
              onClick={analyzeWordFrequency} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Word Frequency'}
            </Button>
          </CardContent>
        </Card>

        {wordFrequencies.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Word Frequency Analysis
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyResult}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Results
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{wordFrequencies.length}</div>
                  <p className="text-sm text-muted-foreground">Unique Words</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {wordFrequencies[0]?.frequency || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Highest Frequency</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {wordFrequencies[wordFrequencies.length - 1]?.frequency || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Lowest Frequency</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {wordFrequencies.reduce((sum, w) => sum + w.frequency, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Words</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Top {topN} Most Frequent Words</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {wordFrequencies.map((wordFreq) => (
                    <div key={wordFreq.word} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-muted-foreground w-8">
                          #{wordFreq.rank}
                        </div>
                        <div>
                          <span className="font-medium text-lg">{wordFreq.word}</span>
                          <div className="text-xs text-muted-foreground">
                            {wordFreq.frequency} occurrences
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{wordFreq.percentage.toFixed(2)}%</div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getFrequencyColor(wordFreq.frequency)}
                        >
                          {wordFreq.frequency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Frequency:</span>
                      <span className="font-medium">
                        {(wordFrequencies.reduce((sum, w) => sum + w.frequency, 0) / wordFrequencies.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Most Common Word:</span>
                      <span className="font-medium">{wordFrequencies[0]?.word}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vocabulary Richness:</span>
                      <span className="font-medium">
                        {((wordFrequencies.length / input.split(/\s+/).length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Dominant Words:</span>{' '}
                      {wordFrequencies.slice(0, 3).map(w => w.word).join(', ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Coverage:</span>{' '}
                      {wordFrequencies.slice(0, 5).reduce((sum, w) => sum + w.frequency, 0)} words 
                      ({wordFrequencies.slice(0, 5).reduce((sum, w) => sum + w.percentage, 0).toFixed(1)}%)
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Longest Word:</span>{' '}
                      {Math.max(...wordFrequencies.map(w => w.word.length))} characters
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Usage Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• High-frequency words may indicate key themes in your content</li>
                  <li>• Consider using synonyms to reduce repetition</li>
                  <li>• Vocabulary richness indicates writing diversity</li>
                  <li>• Adjust minimum word length to filter out common short words</li>
                  <li>• Use this analysis for SEO optimization and content improvement</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}