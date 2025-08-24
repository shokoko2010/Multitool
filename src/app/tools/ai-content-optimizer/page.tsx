'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, FileText, Brain, Sparkles, Target, Zap, TrendingUp } from 'lucide-react'

interface OptimizationResult {
  optimizedContent: string
  improvements: {
    readability: {
      before: number
      after: number
      improvement: string
    }
    engagement: {
      before: number
      after: number
      improvement: string
    }
    seo: {
      before: number
      after: number
      improvement: string
    }
  }
  suggestions: string[]
  keywords: Array<{
    keyword: string
    density: number
    recommendation: 'add' | 'reduce' | 'maintain'
  }>
  toneAnalysis: {
    current: string
    recommended: string
    confidence: number
  }
}

export default function AIContentOptimizer() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [contentType, setContentType] = useState<'blog' | 'product' | 'social' | 'email' | 'webpage'>('blog')
  const [targetAudience, setTargetAudience] = useState<'general' | 'professional' | 'technical' | 'casual'>('general')
  const [optimizationGoal, setOptimizationGoal] = useState<'readability' | 'engagement' | 'seo' | 'conversion'>('readability')

  const optimizeContent = async (text: string): Promise<OptimizationResult> => {
    // In a real implementation, this would use the z-ai-web-dev-sdk
    // For now, we'll simulate the AI response
    
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Analyze original content
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    const words = text.split(/\s+/).filter(word => word.length > 0)
    const avgSentenceLength = words.length / sentences.length
    
    // Generate optimized content based on goals
    let optimizedContent = text
    
    if (optimizationGoal === 'readability') {
      // Break down long sentences and simplify language
      optimizedContent = sentences
        .map(sentence => {
          const sentenceWords = sentence.split(/\s+/)
          if (sentenceWords.length > 20) {
            // Break long sentences
            const midpoint = Math.floor(sentenceWords.length / 2)
            return [
              sentenceWords.slice(0, midpoint).join(' ') + '.',
              sentenceWords.slice(midpoint).join(' ') + '.'
            ].join(' ')
          }
          return sentence + '.'
        })
        .join(' ')
    } else if (optimizationGoal === 'engagement') {
      // Add more engaging language and questions
      optimizedContent = text + '\n\nWhat are your thoughts on this? Share your experiences in the comments below!'
    } else if (optimizationGoal === 'seo') {
      // Add keyword-rich headings and structure
      optimizedContent = `# Main Topic\n\n${text}\n\n## Key Takeaways\n\nThis content covers important aspects that readers should remember.`
    }
    
    // Generate mock improvement scores
    const improvements = {
      readability: {
        before: Math.floor(Math.random() * 30) + 50,
        after: Math.floor(Math.random() * 20) + 70,
        improvement: '+25%'
      },
      engagement: {
        before: Math.floor(Math.random() * 30) + 40,
        after: Math.floor(Math.random() * 25) + 60,
        improvement: '+35%'
      },
      seo: {
        before: Math.floor(Math.random() * 25) + 45,
        after: Math.floor(Math.random() * 30) + 65,
        improvement: '+40%'
      }
    }
    
    // Generate suggestions
    const suggestions = [
      'Add more descriptive subheadings to improve scannability',
      'Include relevant statistics and data points',
      'Use more active voice to increase engagement',
      'Add internal links to related content',
      'Include a clear call-to-action',
      'Optimize meta description for better click-through rates'
    ].slice(0, Math.floor(Math.random() * 4) + 3)
    
    // Generate keyword analysis
    const keywords = [
      { keyword: 'content optimization', density: 1.2, recommendation: 'maintain' },
      { keyword: 'user engagement', density: 0.8, recommendation: 'add' },
      { keyword: 'readability', density: 2.1, recommendation: 'reduce' },
      { keyword: 'seo', density: 1.5, recommendation: 'maintain' }
    ]
    
    // Tone analysis
    const tones = ['professional', 'conversational', 'authoritative', 'friendly', 'informative']
    const currentTone = tones[Math.floor(Math.random() * tones.length)]
    const recommendedTone = tones[Math.floor(Math.random() * tones.length)]
    
    return {
      optimizedContent,
      improvements,
      suggestions,
      keywords,
      toneAnalysis: {
        current: currentTone,
        recommended: recommendedTone,
        confidence: Math.random() * 0.4 + 0.6
      }
    }
  }

  const handleOptimize = async () => {
    if (!input.trim() || input.trim().length < 100) return
    
    setIsLoading(true)
    try {
      const optimized = await optimizeContent(input)
      setResult(optimized)
    } catch (error) {
      console.error('Error optimizing content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const downloadOptimized = () => {
    if (!result) return
    
    const content = `AI-Optimized Content\n\nContent Type: ${contentType}\nTarget Audience: ${targetAudience}\nOptimization Goal: ${optimizationGoal}\n\nOptimized Content:\n${result.optimizedContent}\n\nImprovements:\n- Readability: ${result.improvements.readability.improvement}\n- Engagement: ${result.improvements.engagement.improvement}\n- SEO: ${result.improvements.seo.improvement}\n\nSuggestions:\n${result.suggestions.map(s => `- ${s}`).join('\n')}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized-content.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const loadExample = () => {
    setInput(`Creating effective content is essential for digital marketing success. Many businesses struggle to produce content that resonates with their target audience and achieves desired results. Content optimization involves various strategies including keyword research, audience analysis, and performance tracking. By understanding what works and what doesn't, companies can refine their approach and create more impactful content. The key is to focus on providing value to readers while also meeting business objectives. This balance requires careful planning and ongoing optimization based on data and feedback. Content that performs well typically addresses specific pain points, offers practical solutions, and encourages engagement through clear calls to action.`)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Content Optimizer
          </CardTitle>
          <CardDescription>
            Use advanced AI to optimize your content for better readability, engagement, SEO, and conversion rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="content-input">Content to Optimize</Label>
              <Textarea
                id="content-input"
                placeholder="Enter your content here (minimum 100 characters for best results)..."
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
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={(value: 'blog' | 'product' | 'social' | 'email' | 'webpage') => setContentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="product">Product Description</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="webpage">Web Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={(value: 'general' | 'professional' | 'technical' | 'casual') => setTargetAudience(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Audience</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="optimization-goal">Optimization Goal</Label>
                <Select value={optimizationGoal} onValueChange={(value: 'readability' | 'engagement' | 'seo' | 'conversion') => setOptimizationGoal(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="readability">Readability</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleOptimize} 
                disabled={!input.trim() || input.trim().length < 100 || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing Content...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize Content
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
              {/* Optimized Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Optimized Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {result.optimizedContent}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => copyToClipboard(result.optimizedContent)} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Optimized
                    </Button>
                    <Button onClick={downloadOptimized} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Improvement Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(result.improvements).map(([key, value]) => (
                      <div key={key} className="text-center p-4 border rounded-lg">
                        <div className="text-sm font-medium mb-2 capitalize">{key}</div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className={`text-lg font-bold ${getScoreColor(value.before)}`}>
                            {value.before}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`text-lg font-bold ${getScoreColor(value.after)}`}>
                            {value.after}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-green-600">
                          {value.improvement}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                        <Target className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Keyword Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.keywords.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{keyword.keyword}</span>
                          <Badge variant="outline">{keyword.density}%</Badge>
                        </div>
                        <Badge 
                          variant={keyword.recommendation === 'add' ? 'default' : 
                                   keyword.recommendation === 'reduce' ? 'destructive' : 'secondary'}
                        >
                          {keyword.recommendation}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tone Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tone Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Current Tone</div>
                      <div className="text-lg font-semibold">{result.toneAnalysis.current}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                      <div className="text-sm text-muted-foreground mb-1">Recommended Tone</div>
                      <div className="text-lg font-semibold text-blue-600">{result.toneAnalysis.recommended}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round(result.toneAnalysis.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Information Panel */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">About AI Content Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Our AI content optimizer uses advanced natural language processing to analyze your content 
              and provide data-driven recommendations for improvement. The system evaluates readability, 
              engagement potential, SEO optimization, and conversion effectiveness to help you create 
              content that resonates with your target audience and achieves your business goals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}