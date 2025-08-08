'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Hash, BookOpen } from 'lucide-react'

interface SyllableResult {
  totalSyllables: number
  wordCount: number
  averageSyllablesPerWord: number
  syllableDistribution: Array<{
    syllables: number
    count: number
    percentage: number
    words: string[]
  }>
  difficultWords: string[]
  readingTime: number
}

export default function SyllableCounter() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<SyllableResult | null>(null)
  const [loading, setLoading] = useState(false)

  const countSyllables = (word: string): number => {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    let syllableCount = 0
    let vowels = 'aeiouy'
    let prevCharVowel = false
    
    for (let i = 0; i < word.length; i++) {
      let isVowel = vowels.includes(word[i])
      
      if (isVowel && !prevCharVowel) {
        syllableCount++
      }
      prevCharVowel = isVowel
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) syllableCount--
    if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
      syllableCount++
    }
    
    // Ensure at least 1 syllable
    if (syllableCount === 0) syllableCount = 1
    
    return syllableCount
  }

  const analyzeSyllables = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Process text
      const words = input.toLowerCase().split(/\s+/).filter(word => word.length > 0)
      const wordCount = words.length
      
      // Count syllables for each word
      const syllableCounts: number[] = []
      const syllableMap: { [key: number]: string[] } = {}
      const difficultWords: string[] = []
      
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/g, '')
        if (cleanWord.length > 0) {
          const syllableCount = countSyllables(cleanWord)
          syllableCounts.push(syllableCount)
          
          if (!syllableMap[syllableCount]) {
            syllableMap[syllableCount] = []
          }
          syllableMap[syllableCount].push(cleanWord)
          
          // Mark difficult words (3+ syllables)
          if (syllableCount >= 3) {
            difficultWords.push(cleanWord)
          }
        }
      })

      const totalSyllables = syllableCounts.reduce((sum, count) => sum + count, 0)
      const averageSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0

      // Create syllable distribution
      const distribution = Object.entries(syllableMap)
        .map(([syllables, words]) => ({
          syllables: parseInt(syllables),
          count: words.length,
          percentage: (words.length / wordCount) * 100,
          words: [...new Set(words)].slice(0, 5) // Unique words, max 5 per category
        }))
        .sort((a, b) => a.syllables - b.syllables)

      // Estimate reading time (average reading speed: 200 words per minute)
      const readingTime = Math.ceil(wordCount / 200)

      const syllableResult: SyllableResult = {
        totalSyllables,
        wordCount,
        averageSyllablesPerWord,
        syllableDistribution: distribution,
        difficultWords: [...new Set(difficultWords)].slice(0, 10), // Remove duplicates, limit to 10
        readingTime
      }

      setResult(syllableResult)
    } catch (error) {
      console.error('Error analyzing syllables:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    
    const resultText = `
Syllable Analysis Report:

Total Syllables: ${result.totalSyllables}
Word Count: ${result.wordCount}
Average Syllables per Word: ${result.averageSyllablesPerWord.toFixed(2)}
Reading Time: ${result.readingTime} minute${result.readingTime !== 1 ? 's' : ''}

Syllable Distribution:
${result.syllableDistribution.map(d => `${d.syllables} syllables: ${d.count} words (${d.percentage.toFixed(1)}%)`).join('\n')}

Difficult Words (${result.difficultWords.length}):
${result.difficultWords.join(', ')}
    `.trim()
    
    navigator.clipboard.writeText(resultText)
  }

  const getSyllableColor = (count: number) => {
    if (count >= 4) return 'bg-red-100 text-red-800'
    if (count >= 3) return 'bg-orange-100 text-orange-800'
    if (count >= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Syllable Counter</h1>
        <p className="text-muted-foreground">Count syllables in text and analyze readability metrics</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze for syllables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for syllable analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
            <Button 
              onClick={analyzeSyllables} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Syllables'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Syllable Analysis Results
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
                  <div className="text-2xl font-bold">{result.totalSyllables}</div>
                  <p className="text-sm text-muted-foreground">Total Syllables</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.wordCount}</div>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.averageSyllablesPerWord.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Avg Syllables/Word</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.readingTime}</div>
                  <p className="text-sm text-muted-foreground">Min Read Time</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Syllable Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.syllableDistribution.map((item) => (
                      <div key={item.syllables} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getSyllableColor(item.syllables)}
                          >
                            {item.syllables}
                          </Badge>
                          <span className="text-sm">syllables</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.count} words</span>
                          <span className="text-xs text-muted-foreground">({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Complexity Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Simple Words (1-2 syllables):</span>
                      <span className="font-medium">
                        {result.syllableDistribution
                          .filter(d => d.syllables <= 2)
                          .reduce((sum, d) => sum + d.count, 0)} words
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medium Words (3 syllables):</span>
                      <span className="font-medium">
                        {result.syllableDistribution
                          .find(d => d.syllables === 3)?.count || 0} words
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Complex Words (4+ syllables):</span>
                      <span className="font-medium">
                        {result.syllableDistribution
                          .filter(d => d.syllables >= 4)
                          .reduce((sum, d) => sum + d.count, 0)} words
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vocabulary Diversity:</span>
                      <span className="font-medium">
                        {((result.difficultWords.length / result.wordCount) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {result.difficultWords.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Difficult Words (3+ syllables)</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.difficultWords.map((word, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Reading Level Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Flesch Reading Ease</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Score:</span>
                        <span className="font-medium">
                          {(206.835 - 1.015 * (result.wordCount / Math.max(1, input.split(/[.!?]+/).filter(s => s.trim().length > 0).length)) - 84.6 * result.averageSyllablesPerWord).toFixed(1)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {result.averageSyllablesPerWord < 1.5 ? 'Easy' : 
                         result.averageSyllablesPerWord < 2.0 ? 'Medium' : 'Difficult'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Gunning Fog Index</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Grade Level:</span>
                        <span className="font-medium">
                          {(0.4 * (result.wordCount / Math.max(1, input.split(/[.!?]+/).filter(s => s.trim().length > 0).length) + 15 * (result.difficultWords.length / result.wordCount))).toFixed(1)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {result.difficultWords.length / result.wordCount < 0.05 ? 'Elementary' :
                         result.difficultWords.length / result.wordCount < 0.1 ? 'Middle School' : 'High School+'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Usage Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Average English words have 1.4-1.5 syllables</li>
                  <li>• Higher syllable counts indicate more complex vocabulary</li>
                  <li>• Aim for 1.5-2.0 average syllables per word for general audiences</li>
                  <li>• Consider simplifying complex words for better readability</li>
                  <li>• Use syllable counting for poetry, music lyrics, and educational content</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}