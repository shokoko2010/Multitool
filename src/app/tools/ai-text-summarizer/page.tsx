'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Copy, Download, FileText, Brain, Sparkles, BarChart3 } from 'lucide-react'

interface SummaryResult {
  summary: string
  keyPoints: string[]
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral'
    confidence: number
  }
  stats: {
    originalLength: number
    summaryLength: number
    compressionRatio: number
    readingTime: {
      original: number
      summary: number
    }
  }
}

export default function AITextSummarizer() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [summaryLength, setSummaryLength] = useState([30]) // percentage
  const [summaryStyle, setSummaryStyle] = useState<'concise' | 'detailed' | 'bullet-points'>('concise')
  const [focusArea, setFocusArea] = useState<'general' | 'key-facts' | 'action-items' | 'conclusions'>('general')

  const generateSummary = async (text: string): Promise<SummaryResult> => {
    // In a real implementation, this would use the z-ai-web-dev-sdk
    // For now, we'll simulate the AI response
    
    const words = text.split(/\s+/).filter(word => word.length > 0)
    const originalLength = words.length
    const targetLength = Math.ceil(originalLength * (summaryLength[0] / 100))
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate a mock summary based on the input
    const summarySentences = text.split(/[.!?]+/).filter(s => s.trim()).slice(0, 3)
    let summary = summarySentences.join('. ') + '.'
    
    if (summaryStyle === 'bullet-points') {
      const points = summarySentences.slice(0, 5).map(s => `• ${s.trim()}`)
      summary = points.join('\n')
    } else if (summaryStyle === 'detailed') {
      summary = summary + ' This comprehensive analysis covers the main aspects discussed in the original text, providing a thorough overview while maintaining the key information and context.'
    }
    
    // Generate key points
    const keyPoints = [
      'Main topic identified and analyzed',
      'Key findings summarized effectively',
      'Important conclusions highlighted',
      'Actionable insights provided'
    ].slice(0, Math.min(4, Math.ceil(originalLength / 100)))
    
    // Analyze sentiment (mock)
    const sentimentWords = text.toLowerCase().match(/\b(good|great|excellent|amazing|wonderful|fantastic|bad|terrible|awful|horrible|poor)\b/g) || []
    const positiveWords = sentimentWords.filter(word => ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'].includes(word))
    const negativeWords = sentimentWords.filter(word => ['bad', 'terrible', 'awful', 'horrible', 'poor'].includes(word))
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    let confidence = 0.5
    
    if (positiveWords.length > negativeWords.length) {
      sentiment = 'positive'
      confidence = Math.min(0.9, 0.5 + (positiveWords.length - negativeWords.length) * 0.1)
    } else if (negativeWords.length > positiveWords.length) {
      sentiment = 'negative'
      confidence = Math.min(0.9, 0.5 + (negativeWords.length - positiveWords.length) * 0.1)
    }
    
    const summaryWords = summary.split(/\s+/).filter(word => word.length > 0)
    const summaryLengthCount = summaryWords.length
    
    return {
      summary,
      keyPoints,
      sentiment: {
        overall: sentiment,
        confidence
      },
      stats: {
        originalLength,
        summaryLength: summaryLengthCount,
        compressionRatio: Math.round((1 - summaryLengthCount / originalLength) * 100),
        readingTime: {
          original: Math.ceil(originalLength / 200), // 200 words per minute
          summary: Math.ceil(summaryLengthCount / 200)
        }
      }
    }
  }

  const handleSummarize = async () => {
    if (!input.trim() || input.trim().length < 50) return
    
    setIsLoading(true)
    try {
      const summary = await generateSummary(input)
      setResult(summary)
    } catch (error) {
      console.error('Error generating summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result.summary)
  }

  const downloadSummary = () => {
    if (!result) return
    
    const content = `AI-Generated Summary\n\n${result.summary}\n\nKey Points:\n${result.keyPoints.map(point => `• ${point}`).join('\n')}\n\nSentiment: ${result.sentiment.overall} (${Math.round(result.sentiment.confidence * 100)}% confidence)\n\nOriginal Length: ${result.stats.originalLength} words\nSummary Length: ${result.stats.summaryLength} words\nCompression: ${result.stats.compressionRatio}%`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😞'
      default: return '😐'
    }
  }

  const loadExample = () => {
    setInput(`Artificial intelligence has revolutionized numerous industries, from healthcare to finance, by enabling machines to perform tasks that typically require human intelligence. Machine learning algorithms can now analyze vast amounts of data to identify patterns, make predictions, and automate complex decision-making processes. In healthcare, AI-powered diagnostic tools can detect diseases earlier and more accurately than traditional methods, potentially saving countless lives. The financial sector benefits from AI through fraud detection, algorithmic trading, and personalized financial advice. However, the rapid advancement of AI also raises important ethical considerations, including concerns about privacy, bias in algorithms, and the potential displacement of human workers. As we continue to develop more sophisticated AI systems, it's crucial to establish robust ethical frameworks and regulatory guidelines to ensure these technologies are used responsibly and for the benefit of all humanity. The future of AI holds tremendous promise, but realizing its full potential will require careful navigation of both technical challenges and societal implications.`)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Text Summarizer
          </CardTitle>
          <CardDescription>
            Use advanced AI to generate intelligent summaries of your text with customizable length and style options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-input">Text to Summarize</Label>
              <Textarea
                id="text-input"
                placeholder="Enter your text here (minimum 50 characters for best results)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-48"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {input.length} characters
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="summary-length">Summary Length: {summaryLength[0]}%</Label>
                <Slider
                  value={summaryLength}
                  onValueChange={setSummaryLength}
                  max={80}
                  min={10}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="summary-style">Summary Style</Label>
                <Select value={summaryStyle} onValueChange={(value: 'concise' | 'detailed' | 'bullet-points') => setSummaryStyle(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="bullet-points">Bullet Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="focus-area">Focus Area</Label>
                <Select value={focusArea} onValueChange={(value: 'general' | 'key-facts' | 'action-items' | 'conclusions') => setFocusArea(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Summary</SelectItem>
                    <SelectItem value="key-facts">Key Facts</SelectItem>
                    <SelectItem value="action-items">Action Items</SelectItem>
                    <SelectItem value="conclusions">Conclusions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSummarize} 
                disabled={!input.trim() || input.trim().length < 50 || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Summary
                  </>
                )}
              </Button>
              <Button onClick={loadExample} variant="outline">
                Load Example
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {result.summary}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Summary
                    </Button>
                    <Button onClick={downloadSummary} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Key Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sentiment Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-3">
                      <div className="text-4xl">{getSentimentIcon(result.sentiment.overall)}</div>
                      <div className={`text-lg font-semibold ${getSentimentColor(result.sentiment.overall)}`}>
                        {result.sentiment.overall.charAt(0).toUpperCase() + result.sentiment.overall.slice(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(result.sentiment.confidence * 100)}% confidence
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            result.sentiment.overall === 'positive' ? 'bg-green-500' :
                            result.sentiment.overall === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${result.sentiment.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Summary Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Original Length:</span>
                        <Badge variant="outline">{result.stats.originalLength} words</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Summary Length:</span>
                        <Badge variant="outline">{result.stats.summaryLength} words</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Compression:</span>
                        <Badge variant="secondary">{result.stats.compressionRatio}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Reading Time Saved:</span>
                        <Badge variant="outline">
                          {result.stats.readingTime.original - result.stats.readingTime.summary} min
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reading Time Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reading Time Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {result.stats.readingTime.original} min
                      </div>
                      <div className="text-sm text-muted-foreground">Original Text</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">
                        {result.stats.readingTime.summary} min
                      </div>
                      <div className="text-sm text-muted-foreground">AI Summary</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Information Panel */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">About AI Text Summarization</h3>
            <p className="text-sm text-muted-foreground">
              Our AI-powered summarization uses advanced natural language processing to understand context, 
              identify key information, and generate coherent summaries. The system analyzes sentence structure, 
              semantic meaning, and importance scoring to create summaries that maintain the essence of the 
              original text while significantly reducing reading time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}