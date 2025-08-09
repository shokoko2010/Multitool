'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  BarChart3,
  Clock,
  Globe,
  FileText,
  Hash,
  Link,
  Eye,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface SEOAnalysis {
  url: string
  title: {
    status: 'good' | 'warning' | 'error'
    text: string
    length: number
    recommendation: string
  }
  description: {
    status: 'good' | 'warning' | 'error'
    text: string
    length: number
    recommendation: string
  }
  headings: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
    h6: number
  }
  images: {
    total: number
    missingAlt: number
    withAlt: number
  }
  links: {
    internal: number
    external: number
    broken: number
  }
  performance: {
    score: number
    loadTime: number
    mobileFriendly: boolean
  }
  keywords: Array<{
    keyword: string
    density: number
    position: number
  }>
  lastAnalyzed: string
}

export default function SEOAnalyzer() {
  const { theme } = useTheme()
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [history, setHistory] = useState<SEOAnalysis[]>([])

  const analyzeSEO = async () => {
    if (!url.trim()) return

    setIsAnalyzing(true)
    try {
      // Simulate SEO analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockAnalysis: SEOAnalysis = {
        url,
        title: {
          status: 'good',
          text: 'SEO Analysis Tool - Comprehensive Website Optimization Guide',
          length: 58,
          recommendation: 'Title length is optimal for search engines'
        },
        description: {
          status: 'warning',
          text: 'Analyze your website SEO with our comprehensive tool. Get detailed insights and recommendations for better search rankings.',
          length: 142,
          recommendation: 'Consider making the description more compelling and under 160 characters'
        },
        headings: {
          h1: 1,
          h2: 4,
          h3: 8,
          h4: 2,
          h5: 0,
          h6: 0
        },
        images: {
          total: 15,
          missingAlt: 3,
          withAlt: 12
        },
        links: {
          internal: 45,
          external: 12,
          broken: 1
        },
        performance: {
          score: 85,
          loadTime: 2.3,
          mobileFriendly: true
        },
        keywords: [
          { keyword: 'seo analysis', density: 2.5, position: 1 },
          { keyword: 'website optimization', density: 1.8, position: 3 },
          { keyword: 'search rankings', density: 1.2, position: 5 }
        ],
        lastAnalyzed: new Date().toISOString()
      }
      
      setAnalysis(mockAnalysis)
      setHistory([mockAnalysis, ...history])
    } catch (error) {
      console.error('Error analyzing SEO:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusColor = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      default: return <XCircle className="h-4 w-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Analyzer</h1>
        <p className="text-muted-foreground">
          Comprehensive website SEO analysis and optimization recommendations
        </p>
      </div>

      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer">SEO Analyzer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          {/* URL Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Analyze Website SEO
              </CardTitle>
              <CardDescription>
                Enter a URL to perform comprehensive SEO analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeSEO()}
                />
                <Button 
                  onClick={analyzeSEO} 
                  disabled={!url.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Overview Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    SEO Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysis.performance.score)}`}>
                        {analysis.performance.score}/100
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                      <Progress value={analysis.performance.score} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {analysis.performance.loadTime}s
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Load Time</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {analysis.performance.loadTime < 3 ? 'Good' : 'Needs optimization'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {analysis.performance.mobileFriendly ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Mobile Friendly</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {analysis.performance.mobileFriendly ? 'Passes' : 'Fails'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* On-Page SEO */}
                <Card>
                  <CardHeader>
                    <CardTitle>On-Page SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(analysis.title.status)}
                          <span className="text-sm">Page Title</span>
                        </div>
                        <Badge variant={analysis.title.status === 'good' ? 'default' : 'secondary'}>
                          {analysis.title.length} chars
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analysis.title.recommendation}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(analysis.description.status)}
                          <span className="text-sm">Meta Description</span>
                        </div>
                        <Badge variant={analysis.description.status === 'good' ? 'default' : 'secondary'}>
                          {analysis.description.length} chars
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analysis.description.recommendation}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          <span className="text-sm">Headings Structure</span>
                        </div>
                        <Badge variant="outline">
                          H1: {analysis.headings.h1}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Proper heading hierarchy is important for SEO
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Content & Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content & Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-400 rounded" />
                          <span className="text-sm">Images</span>
                        </div>
                        <Badge variant="outline">
                          {analysis.images.total} total
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {analysis.images.withAlt} have alt text, {analysis.images.missingAlt} missing
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          <span className="text-sm">Links</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline">
                            {analysis.links.internal} internal
                          </Badge>
                          <Badge variant="outline">
                            {analysis.links.external} external
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analysis.links.broken} broken links found
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Analysis</CardTitle>
                  <CardDescription>
                    Top keywords found on the page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.keywords.map((keyword, index) => (
                      <motion.div
                        key={keyword.keyword}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">{keyword.keyword}</span>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Density: {keyword.density}%</span>
                          <span>Position: {keyword.position}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Good Page Title</p>
                        <p className="text-xs text-muted-foreground">
                          Your page title length is optimal for search engines
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Meta Description</p>
                        <p className="text-xs text-muted-foreground">
                          Consider making the description more compelling and under 160 characters
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Broken Links</p>
                        <p className="text-xs text-muted-foreground">
                          Fix {analysis.links.broken} broken links to improve user experience and SEO
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No analysis history yet</p>
              </CardContent>
            </Card>
          ) : (
            history.map((analysis, index) => (
              <motion.div
                key={analysis.lastAnalyzed}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{analysis.url}</h3>
                    <p className="text-sm text-muted-foreground">
                      Score: {analysis.performance.score}/100 • 
                      Load Time: {analysis.performance.loadTime}s
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(analysis.lastAnalyzed).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant={analysis.title.status === 'good' ? 'default' : 'secondary'}>
                    Title: {analysis.title.status}
                  </Badge>
                  <Badge variant={analysis.description.status === 'good' ? 'default' : 'secondary'}>
                    Description: {analysis.description.status}
                  </Badge>
                  <Badge variant="outline">
                    Images: {analysis.images.withAlt}/{analysis.images.total}
                  </Badge>
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">PDF and CSV export functionality coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}