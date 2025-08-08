'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, FileText, Minimize, Maximize } from 'lucide-react'

interface SummaryResult {
  originalLength: number
  summaryLength: number
  compressionRatio: number
  summary: string
}

export default function TextSummarizer() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [summaryLength, setSummaryLength] = useState(30)

  const summarizeText = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Simple text summarization logic
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const words = input.toLowerCase().split(/\s+/)
      
      // Simple keyword extraction (most frequent words)
      const wordFreq: { [key: string]: number } = {}
      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']
      
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
        if (cleanWord.length > 2 && !stopWords.includes(cleanWord)) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
        }
      })

      // Get top keywords
      const sortedWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word)

      // Score sentences based on keyword presence
      const scoredSentences = sentences.map(sentence => {
        const sentenceWords = sentence.toLowerCase().split(/\s+/)
        let score = 0
        sentenceWords.forEach(word => {
          const cleanWord = word.replace(/[^a-z]/g, '')
          if (sortedWords.includes(cleanWord)) {
            score += wordFreq[cleanWord]
          }
        })
        return { sentence, score }
      })

      // Sort by score and take top sentences
      const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.ceil(summaryLength / 20)) // Approximate sentence count

      // Build summary
      const summary = topSentences
        .map(item => item.sentence.trim())
        .join('. ') + '.'

      const originalLength = input.length
      const summaryLengthResult = summary.length
      const compressionRatio = ((originalLength - summaryLengthResult) / originalLength) * 100

      const summaryResult: SummaryResult = {
        originalLength,
        summaryLength: summaryLengthResult,
        compressionRatio,
        summary
      }

      setResult(summaryResult)
    } catch (error) {
      console.error('Error summarizing text:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(result.summary)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Summarizer</h1>
        <p className="text-muted-foreground">Generate concise summaries of long text documents</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to summarize
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for summarization..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Summary Length:</label>
              <input
                type="range"
                min="10"
                max="100"
                value={summaryLength}
                onChange={(e) => setSummaryLength(parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline">{summaryLength}%</Badge>
            </div>
            <Button 
              onClick={summarizeText} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Summarizing...' : 'Generate Summary'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Summary Results
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyResult}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Summary
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.originalLength}</div>
                  <p className="text-sm text-muted-foreground">Original Characters</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.summaryLength}</div>
                  <p className="text-sm text-muted-foreground">Summary Characters</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.compressionRatio.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Compression</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Generated Summary</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Note: This is a basic summarization tool. For more advanced results, consider using dedicated NLP libraries.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}