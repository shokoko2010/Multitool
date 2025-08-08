'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, BookOpen, Users, Target } from 'lucide-react'

interface ReadabilityResult {
  wordCount: number
  sentenceCount: number
  syllableCount: number
  averageWordsPerSentence: number
  averageSyllablesPerWord: number
  fleschKincaidScore: number
  fleschKincaidGrade: string
  fleschKincaidLevel: string
  gunningFogScore: number
  gunningFogGrade: string
  automatedReadabilityIndex: number
  automatedReadabilityGrade: string
}

export default function ReadabilityScore() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ReadabilityResult | null>(null)
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
    
    if (word.endsWith('e')) syllableCount--
    if (syllableCount === 0) syllableCount = 1
    
    return syllableCount
  }

  const analyzeReadability = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Basic text analysis
      const words = input.toLowerCase().split(/\s+/).filter(word => word.length > 0)
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      
      const wordCount = words.length
      const sentenceCount = sentences.length
      
      // Count syllables
      let syllableCount = 0
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/g, '')
        if (cleanWord.length > 0) {
          syllableCount += countSyllables(cleanWord)
        }
      })

      // Calculate averages
      const averageWordsPerSentence = wordCount / sentenceCount
      const averageSyllablesPerWord = syllableCount / wordCount

      // Flesch Reading Ease Score
      const fleschKincaidScore = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord)
      
      let fleschKincaidGrade: string
      let fleschKincaidLevel: string
      
      if (fleschKincaidScore >= 90) {
        fleschKincaidGrade = '5th Grade'
        fleschKincaidLevel = 'Very Easy'
      } else if (fleschKincaidScore >= 80) {
        fleschKincaidGrade = '6th Grade'
        fleschKincaidLevel = 'Easy'
      } else if (fleschKincaidScore >= 70) {
        fleschKincaidGrade = '7th Grade'
        fleschKincaidLevel = 'Fairly Easy'
      } else if (fleschKincaidScore >= 60) {
        fleschKincaidGrade = '8-9th Grade'
        fleschKincaidLevel = 'Standard'
      } else if (fleschKincaidScore >= 50) {
        fleschKincaidGrade = '10-12th Grade'
        fleschKincaidLevel = 'Fairly Difficult'
      } else if (fleschKincaidScore >= 30) {
        fleschKincaidGrade = 'College Level'
        fleschKincaidLevel = 'Difficult'
      } else {
        fleschKincaidGrade = 'College Graduate'
        fleschKincaidLevel = 'Very Difficult'
      }

      // Gunning Fog Index
      const complexWords = words.filter(word => {
        const cleanWord = word.replace(/[^a-z]/g, '')
        return cleanWord.length > 0 && countSyllables(cleanWord) > 2
      }).length
      
      const gunningFogScore = 0.4 * (averageWordsPerSentence + (100 * complexWords / wordCount))
      
      let gunningFogGrade: string
      if (gunningFogScore < 6) {
        gunningFogGrade = 'Elementary'
      } else if (gunningFogScore < 8) {
        gunningFogGrade = 'Middle School'
      } else if (gunningFogScore < 12) {
        gunningFogGrade = 'High School'
      } else if (gunningFogScore < 16) {
        gunningFogGrade = 'College'
      } else {
        gunningFogGrade = 'Graduate'
      }

      // Automated Readability Index
      const charCount = input.replace(/\s/g, '').length
      const averageCharsPerWord = charCount / wordCount
      const automatedReadabilityIndex = 4.71 * (averageCharsPerWord) + 0.5 * (averageWordsPerSentence) - 21.43
      
      let automatedReadabilityGrade: string
      if (automatedReadabilityIndex < 13) {
        automatedReadabilityGrade = 'Middle School'
      } else if (automatedReadabilityIndex < 16) {
        automatedReadabilityGrade = 'High School'
      } else if (automatedReadabilityIndex < 18) {
        automatedReadabilityGrade = 'College'
      } else {
        automatedReadabilityGrade = 'Graduate'
      }

      const readabilityResult: ReadabilityResult = {
        wordCount,
        sentenceCount,
        syllableCount,
        averageWordsPerSentence,
        averageSyllablesPerWord,
        fleschKincaidScore,
        fleschKincaidGrade,
        fleschKincaidLevel,
        gunningFogScore,
        gunningFogGrade,
        automatedReadabilityIndex,
        automatedReadabilityGrade
      }

      setResult(readabilityResult)
    } catch (error) {
      console.error('Error analyzing readability:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    const resultText = `
Readability Analysis Report:

Word Count: ${result.wordCount}
Sentence Count: ${result.sentenceCount}
Syllable Count: ${result.syllableCount}

Averages:
- Words per sentence: ${result.averageWordsPerSentence.toFixed(1)}
- Syllables per word: ${result.averageSyllablesPerWord.toFixed(2)}

Flesch Reading Ease:
- Score: ${result.fleschKincaidScore.toFixed(1)}
- Grade: ${result.fleschKincaidGrade}
- Level: ${result.fleschKincaidLevel}

Gunning Fog Index:
- Score: ${result.gunningFogScore.toFixed(1)}
- Grade: ${result.gunningFogGrade}

Automated Readability Index:
- Score: ${result.automatedReadabilityIndex.toFixed(1)}
- Grade: ${result.automatedReadabilityGrade}
    `.trim()
    navigator.clipboard.writeText(resultText)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Readability Score Analyzer</h1>
        <p className="text-muted-foreground">Analyze text readability and complexity for better content</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze for readability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for readability analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={analyzeReadability} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Readability'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Readability Analysis Results
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
                  <div className="text-2xl font-bold">{result.wordCount}</div>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.sentenceCount}</div>
                  <p className="text-sm text-muted-foreground">Sentences</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.syllableCount}</div>
                  <p className="text-sm text-muted-foreground">Syllables</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.averageWordsPerSentence.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Avg Words/Sentence</p>
                </div>
              </div>

              <div className="grid gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-blue-500" />
                      Flesch Reading Ease
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(result.fleschKincaidScore)}`}>
                          {result.fleschKincaidScore.toFixed(1)}
                        </div>
                        <p className="text-sm text-muted-foreground">Score</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline">{result.fleschKincaidGrade}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Grade Level</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="secondary">{result.fleschKincaidLevel}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Difficulty</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-green-500" />
                      Gunning Fog Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {result.gunningFogScore.toFixed(1)}
                        </div>
                        <p className="text-sm text-muted-foreground">Score</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline">{result.gunningFogGrade}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Target Audience</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-purple-500" />
                      Automated Readability Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {result.automatedReadabilityIndex.toFixed(1)}
                        </div>
                        <p className="text-sm text-muted-foreground">Score</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline">{result.automatedReadabilityGrade}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Education Level</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Aim for 60-70 score for general audience content</li>
                  <li>• Complex topics may require lower scores (40-60)</li>
                  <li>• Keep sentences under 20 words for better readability</li>
                  <li>• Use simple words and avoid jargon when possible</li>
                  <li>• Break up large paragraphs into smaller ones</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}