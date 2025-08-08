'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Brain, Target, TrendingUp, AlertTriangle } from 'lucide-react'

interface ComplexityMetrics {
  fleschKincaidGrade: number
  fleschReadingEase: number
  gunningFog: number
  colemanLiau: number
  automatedReadability: number
  averageWordsPerSentence: number
  averageSyllablesPerWord: number
  sentenceCount: number
  wordCount: number
  characterCount: number
  complexityScore: number
  level: 'Elementary' | 'Middle School' | 'High School' | 'College' | 'Graduate'
  suggestions: string[]
}

export default function TextComplexity() {
  const [input, setInput] = useState('')
  const [metrics, setMetrics] = useState<ComplexityMetrics | null>(null)
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

  const analyzeComplexity = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const words = input.toLowerCase().split(/\s+/).filter(word => word.length > 0)
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      
      const wordCount = words.length
      const sentenceCount = sentences.length
      const characterCount = input.length
      
      // Calculate averages
      const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0
      let totalSyllables = 0
      
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/g, '')
        if (cleanWord.length > 0) {
          totalSyllables += countSyllables(cleanWord)
        }
      })
      
      const averageSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0

      // Flesch Reading Ease
      const fleschReadingEase = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord)
      
      // Flesch-Kincaid Grade Level
      const fleschKincaidGrade = (0.39 * averageWordsPerSentence) + (11.8 * averageSyllablesPerWord) - 15.59
      
      // Gunning Fog Index
      const complexWords = words.filter(word => {
        const cleanWord = word.replace(/[^a-z]/g, '')
        return cleanWord.length > 0 && countSyllables(cleanWord) > 2
      }).length
      
      const gunningFog = 0.4 * (averageWordsPerSentence + (100 * complexWords / wordCount))
      
      // Coleman-Liau Index
      const l = (characterCount / wordCount) * 100
      const s = (sentenceCount / wordCount) * 100
      const colemanLiau = (0.0588 * l) - (0.296 * s) - 15.8
      
      // Automated Readability Index
      const averageCharactersPerWord = characterCount / wordCount
      const automatedReadability = (4.71 * averageCharactersPerWord) + (0.5 * averageWordsPerSentence) - 21.43

      // Calculate overall complexity score (0-100)
      const complexityScore = calculateComplexityScore({
        fleschKincaidGrade,
        fleschReadingEase,
        gunningFog,
        colemanLiau,
        automatedReadability,
        averageWordsPerSentence,
        averageSyllablesPerWord
      })

      // Determine level
      const level = getComplexityLevel(complexityScore)

      // Generate suggestions
      const suggestions = generateSuggestions({
        fleschKincaidGrade,
        fleschReadingEase,
        gunningFog,
        averageWordsPerSentence,
        averageSyllablesPerWord,
        wordCount,
        sentenceCount
      })

      const complexityMetrics: ComplexityMetrics = {
        fleschKincaidGrade,
        fleschReadingEase,
        gunningFog,
        colemanLiau,
        automatedReadability,
        averageWordsPerSentence,
        averageSyllablesPerWord,
        sentenceCount,
        wordCount,
        characterCount,
        complexityScore,
        level,
        suggestions
      }

      setMetrics(complexityMetrics)
    } catch (error) {
      console.error('Error analyzing complexity:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateComplexityScore = (data: any): number => {
    // Normalize all metrics to 0-100 scale and calculate average
    const fleschScore = Math.max(0, Math.min(100, data.fleschReadingEase))
    const kincaidScore = Math.max(0, Math.min(100, 100 - (data.fleschKincaidGrade * 5)))
    const fogScore = Math.max(0, Math.min(100, 100 - (data.gunningFog * 3)))
    const colemanScore = Math.max(0, Math.min(100, 100 - (data.colemanLiau * 3)))
    const automatedScore = Math.max(0, Math.min(100, 100 - (data.automatedReadability * 3)))
    
    return (fleschScore + kincaidScore + fogScore + colemanScore + automatedScore) / 5
  }

  const getComplexityLevel = (score: number): ComplexityMetrics['level'] => {
    if (score >= 80) return 'Elementary'
    if (score >= 65) return 'Middle School'
    if (score >= 50) return 'High School'
    if (score >= 35) return 'College'
    return 'Graduate'
  }

  const generateSuggestions = (data: any): string[] => {
    const suggestions: string[] = []
    
    if (data.fleschReadingEase < 60) {
      suggestions.push('Consider simplifying vocabulary and sentence structure')
    }
    
    if (data.averageWordsPerSentence > 20) {
      suggestions.push('Break up long sentences for better readability')
    }
    
    if (data.averageSyllablesPerWord > 1.6) {
      suggestions.push('Use simpler words with fewer syllables')
    }
    
    if (data.gunningFog > 12) {
      suggestions.push('Content is quite complex; consider targeting a more educated audience')
    }
    
    if (data.wordCount < 100) {
      suggestions.push('Consider expanding content for more comprehensive coverage')
    }
    
    if (data.sentenceCount < 5) {
      suggestions.push('Add more sentences to improve content flow')
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Text complexity is well-balanced for general audiences')
    }
    
    return suggestions
  }

  const copyResult = () => {
    if (!metrics) return
    
    const resultText = `
Text Complexity Analysis Report:

Overall Complexity: ${metrics.complexityScore.toFixed(1)}/100 (${metrics.level})
Word Count: ${metrics.wordCount}
Sentence Count: ${metrics.sentenceCount}
Character Count: ${metrics.characterCount}

Readability Scores:
- Flesch Reading Ease: ${metrics.fleschReadingEase.toFixed(1)}
- Flesch-Kincaid Grade: ${metrics.fleschKincaidGrade.toFixed(1)}
- Gunning Fog Index: ${metrics.gunningFog.toFixed(1)}
- Coleman-Liau Index: ${metrics.colemanLiau.toFixed(1)}
- Automated Readability: ${metrics.automatedReadability.toFixed(1)}

Averages:
- Words per Sentence: ${metrics.averageWordsPerSentence.toFixed(1)}
- Syllables per Word: ${metrics.averageSyllablesPerWord.toFixed(2)}

Suggestions:
${metrics.suggestions.map(s => `- ${s}`).join('\n')}
    `.trim()
    
    navigator.clipboard.writeText(resultText)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Elementary': return 'bg-green-100 text-green-800'
      case 'Middle School': return 'bg-blue-100 text-blue-800'
      case 'High School': return 'bg-yellow-100 text-yellow-800'
      case 'College': return 'bg-orange-100 text-orange-800'
      case 'Graduate': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Complexity Analyzer</h1>
        <p className="text-muted-foreground">Analyze text complexity using multiple readability metrics</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze for complexity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for complexity analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={analyzeComplexity} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Complexity'}
            </Button>
          </CardContent>
        </Card>

        {metrics && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Text Complexity Analysis
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(metrics.complexityScore)}`}>
                    {metrics.complexityScore.toFixed(1)}/100
                  </div>
                  <p className="text-sm text-muted-foreground">Complexity Score</p>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(metrics.level)}`}>
                    {metrics.level}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Reading Level</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.wordCount}</div>
                  <p className="text-sm text-muted-foreground">Word Count</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Readability Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Flesch Reading Ease:</span>
                      <span className={`text-sm font-medium ${getScoreColor(metrics.fleschReadingEase)}`}>
                        {metrics.fleschReadingEase.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Flesch-Kincaid Grade:</span>
                      <span className="text-sm font-medium">
                        {metrics.fleschKincaidGrade.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gunning Fog Index:</span>
                      <span className="text-sm font-medium">
                        {metrics.gunningFog.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Coleman-Liau Index:</span>
                      <span className="text-sm font-medium">
                        {metrics.colemanLiau.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Automated Readability:</span>
                      <span className="text-sm font-medium">
                        {metrics.automatedReadability.toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Content Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Words per Sentence:</span>
                      <span className="text-sm font-medium">
                        {metrics.averageWordsPerSentence.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Syllables per Word:</span>
                      <span className="text-sm font-medium">
                        {metrics.averageSyllablesPerWord.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sentences:</span>
                      <span className="text-sm font-medium">
                        {metrics.sentenceCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Characters:</span>
                      <span className="text-sm font-medium">
                        {metrics.characterCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Characters per Word:</span>
                      <span className="text-sm font-medium">
                        {(metrics.characterCount / metrics.wordCount).toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Recommendations</h3>
                <div className="space-y-2">
                  {metrics.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Interpretation Guide</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Score Ranges</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 80-100: Elementary (Very Easy)</li>
                      <li>• 65-79: Middle School (Easy)</li>
                      <li>• 50-64: High School (Standard)</li>
                      <li>• 35-49: College (Difficult)</li>
                      <li>• 0-34: Graduate (Very Difficult)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Target Audiences</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• General public: 60-70 score</li>
                      <li>• Students: 50-65 score</li>
                      <li>• Professionals: 40-55 score</li>
                      <li>• Experts: 30-45 score</li>
                      <li>• Academic: 20-40 score</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}