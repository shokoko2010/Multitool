"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, Search, BarChart3, TrendingUp, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function KeywordExtractor() {
  const [inputText, setInputText] = useState('')
  const [minWordLength, setMinWordLength] = useState(3)
  const [maxKeywords, setMaxKeywords] = useState(20)
  const [extractionMethod, setExtractionMethod] = useState<'frequency' | 'tf-idf' | 'combined'>('frequency')
  const [ignoreCommonWords, setIgnoreCommonWords] = useState(true)
  const [extractedKeywords, setExtractedKeywords] = useState<any[]>(null)

  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ])

  const extractKeywords = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to extract keywords')
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

    // Calculate TF (Term Frequency)
    const totalWords = words.length
    const tfScores: Record<string, number> = {}
    Object.entries(wordCounts).forEach(([word, count]) => {
      tfScores[word] = count / totalWords
    })

    // Calculate IDF (Inverse Document Frequency) - simplified version
    // In a real implementation, this would require a corpus
    const idfScores: Record<string, number> = {}
    const totalUniqueWords = Object.keys(wordCounts).length
    Object.keys(wordCounts).forEach(word => {
      // Simplified IDF: log(total_unique_words / frequency)
      idfScores[word] = Math.log(totalUniqueWords / (wordCounts[word] + 1))
    })

    // Calculate TF-IDF scores
    const tfidfScores: Record<string, number> = {}
    Object.keys(tfScores).forEach(word => {
      tfidfScores[word] = tfScores[word] * idfScores[word]
    })

    // Create keyword data based on extraction method
    let keywordData: any[] = []

    if (extractionMethod === 'frequency') {
      keywordData = Object.entries(wordCounts).map(([word, count]) => ({
        word,
        count,
        frequency: ((count / totalWords) * 100).toFixed(2),
        score: count
      }))
    } else if (extractionMethod === 'tf-idf') {
      keywordData = Object.entries(tfidfScores).map(([word, score]) => ({
        word,
        count: wordCounts[word],
        frequency: ((wordCounts[word] / totalWords) * 100).toFixed(2),
        score: score.toFixed(4),
        tfidf: score.toFixed(4)
      }))
    } else if (extractionMethod === 'combined') {
      keywordData = Object.keys(wordCounts).map(word => ({
        word,
        count: wordCounts[word],
        frequency: ((wordCounts[word] / totalWords) * 100).toFixed(2),
        score: (wordCounts[word] * tfidfScores[word]).toFixed(4),
        tfidf: tfidfScores[word].toFixed(4)
      }))
    }

    // Sort by score and limit results
    keywordData.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
    keywordData = keywordData.slice(0, maxKeywords)

    setExtractedKeywords(keywordData)
    toast.success('Keywords extracted successfully!')
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to!')
  }

  const handleCopyAll = () => {
    if (!extractedKeywords) return
    const allKeywords = extractedKeywords.map(k => k.word).join(', ')
    navigator.clipboard.writeText(allKeywords)
    toast.success('All keywords copied!')
  }

  const handleDownload = () => {
    if (!extractedKeywords) return
    
    const csvContent = [
      'Keyword,Count,Frequency (%),Score',
      ...extractedKeywords.map(item => 
        `${item.word},${item.count},${item.frequency},${item.score}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted-keywords.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputText('')
    setExtractedKeywords(null)
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
            <h1 className="text-4xl font-bold mb-4">Keyword Extractor</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Extract the most important keywords from your text using advanced algorithms. Perfect for SEO, content analysis, and research.
            </p>
          </motion.div>
        </div>

        {/* Extraction Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Extraction Options
            </CardTitle>
            <CardDescription>
              Configure your keyword extraction settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="extraction-method">Method</Label>
                <Select value={extractionMethod} onValueChange={(value: any) => setExtractionMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frequency">Frequency</SelectItem>
                    <SelectItem value="tf-idf">TF-IDF</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="min-word-length">Min Word Length</Label>
                <Input
                  id="min-word-length"
                  type="number"
                  min="1"
                  max="10"
                  value={minWordLength}
                  onChange={(e) => setMinWordLength(parseInt(e.target.value) || 3)}
                />
              </div>
              
              <div>
                <Label htmlFor="max-keywords">Max Keywords</Label>
                <Input
                  id="max-keywords"
                  type="number"
                  min="1"
                  max="100"
                  value={maxKeywords}
                  onChange={(e) => setMaxKeywords(parseInt(e.target.value) || 20)}
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
                <Button onClick={extractKeywords} disabled={!inputText.trim()} size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Extract Keywords
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
                Extracted Keywords
              </CardTitle>
              <CardDescription>
                {extractedKeywords ? `${extractedKeywords.length} keywords found` : 'Keywords will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {extractedKeywords ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleCopyAll} size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                    <Button onClick={handleDownload} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {extractedKeywords.map((item, index) => (
                      <div key={item.word} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{item.word}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.count}x ({item.frequency}%)
                          </span>
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
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Enter text and click "Extract Keywords" to see results
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Method Explanation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Extraction Methods
            </CardTitle>
            <CardDescription>
              Learn about the different keyword extraction methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Frequency</h4>
                <p className="text-sm text-muted-foreground">
                  Extracts keywords based on how often they appear in the text. Simple but effective for basic analysis.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">TF-IDF</h4>
                <p className="text-sm text-muted-foreground">
                  Uses Term Frequency-Inverse Document Frequency to find keywords that are important but not too common.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Combined</h4>
                <p className="text-sm text-muted-foreground">
                  Combines frequency and TF-IDF scores for a balanced approach to keyword extraction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Use Cases
            </CardTitle>
            <CardDescription>
              Common uses for keyword extraction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">SEO Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Find the most important keywords for your content
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Understand the main topics in your text
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Research</h4>
                <p className="text-sm text-muted-foreground">
                  Extract key terms from academic papers
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Marketing</h4>
                <p className="text-sm text-muted-foreground">
                  Identify important terms for campaigns
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Mining</h4>
                <p className="text-sm text-muted-foreground">
                  Extract key terms from large datasets
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Plan content around key topics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}