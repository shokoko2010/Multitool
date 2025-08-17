"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, Search, BarChart3, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function KeywordDensityAnalyzer() {
  const [inputText, setInputText] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [minWordLength, setMinWordLength] = useState(3)
  const [ignoreCommonWords, setIgnoreCommonWords] = useState(true)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ])

  const analyzeKeywordDensity = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    // Clean and tokenize the text
    const words = inputText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= minWordLength)
      .filter(word => !ignoreCommonWords || !commonWords.has(word))

    // Count word frequencies
    const wordCounts: Record<string, number> = {}
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    })

    // Calculate total words
    const totalWords = words.length

    // Calculate density for each word
    const keywordData = Object.entries(wordCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / totalWords) * 100).toFixed(2),
        frequency: Math.round((count / totalWords) * 1000) / 10
      }))
      .sort((a, b) => parseFloat(b.density) - parseFloat(a.density))

    // Analyze focus keyword if provided
    let focusKeywordAnalysis = null
    if (focusKeyword) {
      const focusWord = focusKeyword.toLowerCase()
      const focusCount = words.filter(word => word.includes(focusWord)).length
      const focusDensity = ((focusCount / totalWords) * 100).toFixed(2)
      
      focusKeywordAnalysis = {
        keyword: focusKeyword,
        count: focusCount,
        density: focusDensity,
        recommendation: getDensityRecommendation(parseFloat(focusDensity))
      }
    }

    // Calculate text statistics
    const textStats = {
      totalWords,
      uniqueWords: Object.keys(wordCounts).length,
      averageWordLength: Math.round(words.reduce((sum, word) => sum + word.length, 0) / totalWords * 100) / 100,
      totalCharacters: inputText.length,
      sentences: inputText.split(/[.!?]+/).filter(s => s.trim()).length
    }

    setAnalysisResults({
      keywordData,
      focusKeywordAnalysis,
      textStats,
      topKeywords: keywordData.slice(0, 10)
    })

    toast.success('Keyword analysis completed!')
  }

  const getDensityRecommendation = (density: number) => {
    if (density < 0.5) return { status: 'low', message: 'Consider using this keyword more frequently', color: 'text-yellow-600' }
    if (density > 3) return { status: 'high', message: 'Keyword density is too high, may be seen as keyword stuffing', color: 'text-red-600' }
    return { status: 'good', message: 'Good keyword density for SEO', color: 'text-green-600' }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    if (!analysisResults) return
    
    const csvContent = [
      'Word,Count,Density (%),Frequency',
      ...analysisResults.keywordData.map((item: any) => 
        `${item.word},${item.count},${item.density},${item.frequency}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyword-analysis.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputText('')
    setFocusKeyword('')
    setAnalysisResults(null)
    toast.success('Cleared!')
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
            <h1 className="text-4xl font-bold mb-4">Keyword Density Analyzer</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyze keyword density in your text to optimize for SEO. Find the most frequent words and check your keyword usage.
            </p>
          </motion.div>
        </div>

        {/* Analysis Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analysis Options
            </CardTitle>
            <CardDescription>
              Configure your keyword analysis settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="focus-keyword">Focus Keyword (Optional)</Label>
                <Input
                  id="focus-keyword"
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="Enter focus keyword"
                />
              </div>
              
              <div>
                <Label htmlFor="min-word-length">Minimum Word Length</Label>
                <Input
                  id="min-word-length"
                  type="number"
                  min="1"
                  max="10"
                  value={minWordLength}
                  onChange={(e) => setMinWordLength(parseInt(e.target.value) || 3)}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="ignore-common-words"
                  type="checkbox"
                  checked={ignoreCommonWords}
                  onChange={(e) => setIgnoreCommonWords(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="ignore-common-words">Ignore common words</Label>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <Button onClick={analyzeKeywordDensity} disabled={!inputText.trim()} size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Keywords
                </Button>
                <Button onClick={handleClear} variant="outline" size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Keyword analysis results will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults ? (
                <div className="space-y-4">
                  {/* Text Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResults.textStats.totalWords}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResults.textStats.uniqueWords}
                      </div>
                      <div className="text-sm text-muted-foreground">Unique Words</div>
                    </div>
                  </div>

                  {/* Focus Keyword Analysis */}
                  {analysisResults.focusKeywordAnalysis && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Focus Keyword: {analysisResults.focusKeywordAnalysis.keyword}</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Count: {analysisResults.focusKeywordAnalysis.count}</span>
                        <span>Density: {analysisResults.focusKeywordAnalysis.density}%</span>
                        <span className={analysisResults.focusKeywordAnalysis.recommendation.color}>
                          {analysisResults.focusKeywordAnalysis.recommendation.message}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleDownload} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Enter text and click "Analyze Keywords" to see results
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Keywords */}
        {analysisResults && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Keywords
              </CardTitle>
              <CardDescription>
                Most frequent keywords in your text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysisResults.topKeywords.map((item: any, index: number) => (
                  <div key={item.word} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{item.word}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {item.count} times ({item.density}%)
                      </div>
                      <div className="w-20 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min(parseFloat(item.density) * 10, 100)}%` }}
                        />
                      </div>
                      <Button 
                        onClick={() => handleCopy(item.word)} 
                        variant="ghost" 
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEO Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              SEO Tips
            </CardTitle>
            <CardDescription>
              Best practices for keyword density
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Optimal Density</h4>
                <p className="text-sm text-muted-foreground">
                  Aim for 1-2% keyword density for main keywords. Too high may be flagged as keyword stuffing.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Natural Usage</h4>
                <p className="text-sm text-muted-foreground">
                  Use keywords naturally in headings, paragraphs, and meta descriptions.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Long-tail Keywords</h4>
                <p className="text-sm text-muted-foreground">
                  Include longer, more specific keyword phrases for better targeting.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Quality</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on creating valuable content rather than just keyword density.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}