'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, BarChart3 } from 'lucide-react'

interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral'
  score: number
  confidence: number
  details: {
    positive: number
    negative: number
    neutral: number
  }
}

export default function SentimentAnalyzer() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeSentiment = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Simple sentiment analysis logic
      const words = input.toLowerCase().split(/\s+/)
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased', 'satisfied', 'perfect', 'awesome', 'brilliant', 'outstanding']
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'poor', 'horrible', 'worst', 'useless', 'broken', 'fail', 'error']

      let positiveCount = 0
      let negativeCount = 0

      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++
        if (negativeWords.includes(word)) negativeCount++
      })

      const totalWords = words.length
      const neutralCount = totalWords - positiveCount - negativeCount

      const positivePercentage = (positiveCount / totalWords) * 100
      const negativePercentage = (negativeCount / totalWords) * 100
      const neutralPercentage = (neutralCount / totalWords) * 100

      let overall: 'positive' | 'negative' | 'neutral'
      let score: number
      let confidence: number

      if (positivePercentage > negativePercentage && positivePercentage > neutralPercentage) {
        overall = 'positive'
        score = positivePercentage
        confidence = positivePercentage
      } else if (negativePercentage > positivePercentage && negativePercentage > neutralPercentage) {
        overall = 'negative'
        score = -negativePercentage
        confidence = negativePercentage
      } else {
        overall = 'neutral'
        score = neutralPercentage - 50
        confidence = neutralPercentage
      }

      const sentimentResult: SentimentResult = {
        overall,
        score,
        confidence,
        details: {
          positive: positivePercentage,
          negative: negativePercentage,
          neutral: neutralPercentage
        }
      }

      setResult(sentimentResult)
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    const resultText = `
Overall Sentiment: ${result.overall}
Score: ${result.score.toFixed(2)}
Confidence: ${result.confidence.toFixed(2)}%

Positive: ${result.details.positive.toFixed(2)}%
Negative: ${result.details.negative.toFixed(2)}%
Neutral: ${result.details.neutral.toFixed(2)}%
    `.trim()
    navigator.clipboard.writeText(resultText)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      case 'neutral': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😞'
      case 'neutral': return '😐'
      default: return '❓'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sentiment Analyzer</h1>
        <p className="text-muted-foreground">Analyze the emotional tone and sentiment of text content</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze for sentiment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for sentiment analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
            <Button 
              onClick={analyzeSentiment} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Sentiment'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sentiment Analysis Results
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyResult}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(result.overall)}`}>
                    {getSentimentEmoji(result.overall)} {result.overall.charAt(0).toUpperCase() + result.overall.slice(1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Overall Sentiment</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.score.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.confidence.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Detailed Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Positive</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${result.details.positive}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{result.details.positive.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Negative</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${result.details.negative}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{result.details.negative.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Neutral</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ width: `${result.details.neutral}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{result.details.neutral.toFixed(1)}%</span>
                    </div>
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