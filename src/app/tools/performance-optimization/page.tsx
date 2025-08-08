"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Zap, 
  Clock, 
  Database, 
  Image as ImageIcon, 
  FileCode, 
  Wifi,
  HardDrive,
  Cpu,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Target,
  Shield,
  Globe
} from 'lucide-react'

interface PerformanceResult {
  url: string
  overallScore: number
  status: 'analyzing' | 'completed' | 'error'
  timestamp: string
  metrics: {
    loading: {
      score: number
      fcp: number
      lcp: number
      fid: number
      cls: number
      ttfb: number
      suggestions: string[]
    }
    assets: {
      score: number
      totalSize: number
      imageCount: number
      imageSize: number
      jsSize: number
      cssSize: number
      suggestions: string[]
    }
    code: {
      score: number
      minification: {
        js: boolean
        css: boolean
        html: boolean
      }
      compression: {
        gzip: boolean
        brotli: boolean
      }
      suggestions: string[]
    }
    network: {
      score: number
      requests: number
      domains: number
      caching: {
        static: boolean
        dynamic: boolean
      }
      suggestions: string[]
    }
    accessibility: {
      score: number
      mobile: boolean
      responsive: boolean
      touch: boolean
      suggestions: string[]
    }
  }
}

export default function PerformanceOptimizationTool() {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [performanceResult, setPerformanceResult] = useState<PerformanceResult | null>(null)
  const [history, setHistory] = useState<PerformanceResult[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/performance-optimization/history')
      const result = await response.json()
      
      if (result.success && result.data) {
        setHistory(result.data.map((item: any) => ({
          url: item.url,
          overallScore: item.overallScore,
          status: item.status,
          timestamp: item.timestamp,
          metrics: item.metrics
        })))
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const handleAnalyze = async () => {
    if (!url.trim()) return

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/performance-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const perfData = result.data
        perfData.status = 'completed'
        
        // Save to history
        await fetch('/api/performance-optimization/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: perfData.url,
            overallScore: perfData.overallScore,
            metrics: perfData.metrics
          }),
        })

        setPerformanceResult(perfData)
        setHistory(prev => [perfData, ...prev.slice(0, 4)])
      } else {
        throw new Error(result.error || 'Failed to analyze website')
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  const getMetricStatus = (value: number, good: number, needsImprovement: number) => {
    if (value <= good) return { color: 'text-green-600', label: 'Good' }
    if (value <= needsImprovement) return { color: 'text-yellow-600', label: 'Needs Improvement' }
    return { color: 'text-red-600', label: 'Poor' }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Performance Optimization Tool</h1>
          <p className="text-xl text-muted-foreground">
            Lighthouse-style analysis with actionable recommendations for faster websites
          </p>
        </div>

        {/* URL Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analyze Website Performance
            </CardTitle>
            <CardDescription>
              Enter a URL to get detailed performance insights and optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={!url.trim() || isAnalyzing}
                className="px-8"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {performanceResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Analyzed: {performanceResult.url} • {new Date(performanceResult.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(performanceResult.overallScore)}`}>
                    {performanceResult.overallScore}/100
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Performance Score
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="loading">Loading</TabsTrigger>
                  <TabsTrigger value="assets">Assets</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="accessibility">Mobile</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Loading</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(performanceResult.metrics.loading.score)}`}>
                          {performanceResult.metrics.loading.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(performanceResult.metrics.loading.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Assets</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(performanceResult.metrics.assets.score)}`}>
                          {performanceResult.metrics.assets.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(performanceResult.metrics.assets.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCode className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Code</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(performanceResult.metrics.code.score)}`}>
                          {performanceResult.metrics.code.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(performanceResult.metrics.code.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wifi className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Network</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(performanceResult.metrics.network.score)}`}>
                          {performanceResult.metrics.network.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(performanceResult.metrics.network.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Mobile</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(performanceResult.metrics.accessibility.score)}`}>
                          {performanceResult.metrics.accessibility.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(performanceResult.metrics.accessibility.score)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Core Web Vitals */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Largest Contentful Paint</span>
                            <span className={getMetricStatus(performanceResult.metrics.loading.lcp, 2500, 4000).color}>
                              {performanceResult.metrics.loading.lcp}ms
                            </span>
                          </div>
                          <Progress value={Math.min(100, (performanceResult.metrics.loading.lcp / 4000) * 100)} />
                          <div className="text-xs text-muted-foreground mt-1">
                            Good: &lt;2.5s | Needs improvement: &lt;4s
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">First Input Delay</span>
                            <span className={getMetricStatus(performanceResult.metrics.loading.fid, 100, 300).color}>
                              {performanceResult.metrics.loading.fid}ms
                            </span>
                          </div>
                          <Progress value={Math.min(100, (performanceResult.metrics.loading.fid / 300) * 100)} />
                          <div className="text-xs text-muted-foreground mt-1">
                            Good: &lt;100ms | Needs improvement: &lt;300ms
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Cumulative Layout Shift</span>
                            <span className={getMetricStatus(parseFloat(performanceResult.metrics.loading.cls), 0.1, 0.25).color}>
                              {performanceResult.metrics.loading.cls}
                            </span>
                          </div>
                          <Progress value={parseFloat(performanceResult.metrics.loading.cls) * 400} />
                          <div className="text-xs text-muted-foreground mt-1">
                            Good: &lt;0.1 | Needs improvement: &lt;0.25
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">First Contentful Paint</span>
                            <span className={getMetricStatus(performanceResult.metrics.loading.fcp, 1800, 3000).color}>
                              {performanceResult.metrics.loading.fcp}ms
                            </span>
                          </div>
                          <Progress value={Math.min(100, (performanceResult.metrics.loading.fcp / 3000) * 100)} />
                          <div className="text-xs text-muted-foreground mt-1">
                            Good: &lt;1.8s | Needs improvement: &lt;3s
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Asset Size Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Asset Size Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatFileSize(performanceResult.metrics.assets.imageSize)}
                          </div>
                          <div className="text-sm text-muted-foreground">Images</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatFileSize(performanceResult.metrics.assets.jsSize)}
                          </div>
                          <div className="text-sm text-muted-foreground">JavaScript</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatFileSize(performanceResult.metrics.assets.cssSize)}
                          </div>
                          <div className="text-sm text-muted-foreground">CSS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatFileSize(performanceResult.metrics.assets.totalSize)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Loading Tab */}
                <TabsContent value="loading" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Loading Performance
                      </CardTitle>
                      <CardDescription>
                        Metrics related to how quickly your page loads
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Time to First Byte (TTFB)</span>
                              <span className={getMetricStatus(performanceResult.metrics.loading.ttfb, 200, 600).color}>
                                {performanceResult.metrics.loading.ttfb}ms
                              </span>
                            </div>
                            <Progress value={Math.min(100, (performanceResult.metrics.loading.ttfb / 600) * 100)} />
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Optimization Suggestions</h4>
                          <div className="space-y-2">
                            {performanceResult.metrics.loading.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Assets Tab */}
                <TabsContent value="assets" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Asset Optimization
                      </CardTitle>
                      <CardDescription>
                        Analysis of images, scripts, and stylesheets
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Total Images</div>
                            <div className="text-2xl font-bold">{performanceResult.metrics.assets.imageCount}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Total Requests</div>
                            <div className="text-2xl font-bold">{performanceResult.metrics.assets.totalSize / 1024 / 1024 > 1 ? 
                              (performanceResult.metrics.assets.totalSize / 1024 / 1024).toFixed(1) + 'M' : 
                              (performanceResult.metrics.assets.totalSize / 1024).toFixed(0) + 'K'} requests</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Asset Score</div>
                            <div className={`text-2xl font-bold ${getScoreColor(performanceResult.metrics.assets.score)}`}>
                              {performanceResult.metrics.assets.score}/100
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Optimization Suggestions</h4>
                          <div className="space-y-2">
                            {performanceResult.metrics.assets.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Code Tab */}
                <TabsContent value="code" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5" />
                        Code Optimization
                      </CardTitle>
                      <CardDescription>
                        Minification, compression, and code quality
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-3">Minification Status</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">JavaScript</span>
                                {performanceResult.metrics.code.minification.js ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">CSS</span>
                                {performanceResult.metrics.code.minification.css ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">HTML</span>
                                {performanceResult.metrics.code.minification.html ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-3">Compression Status</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Gzip</span>
                                {performanceResult.metrics.code.compression.gzip ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Brotli</span>
                                {performanceResult.metrics.code.compression.brotli ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Optimization Suggestions</h4>
                          <div className="space-y-2">
                            {performanceResult.metrics.code.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Network Tab */}
                <TabsContent value="network" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-5 w-5" />
                        Network Optimization
                      </CardTitle>
                      <CardDescription>
                        Request count, domains, and caching strategies
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Total Requests</div>
                            <div className="text-2xl font-bold">{performanceResult.metrics.network.requests}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Domains</div>
                            <div className="text-2xl font-bold">{performanceResult.metrics.network.domains}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Network Score</div>
                            <div className={`text-2xl font-bold ${getScoreColor(performanceResult.metrics.network.score)}`}>
                              {performanceResult.metrics.network.score}/100
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-3">Caching Status</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Static Assets</span>
                                {performanceResult.metrics.network.caching.static ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Dynamic Content</span>
                                {performanceResult.metrics.network.caching.dynamic ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Network Optimization</h4>
                          <div className="space-y-2">
                            {performanceResult.metrics.network.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Accessibility Tab */}
                <TabsContent value="accessibility" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Mobile & Accessibility
                      </CardTitle>
                      <CardDescription>
                        Mobile-friendliness and touch interface optimization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${performanceResult.metrics.accessibility.mobile ? 'text-green-600' : 'text-red-600'}`}>
                              {performanceResult.metrics.accessibility.mobile ? '✓' : '✗'}
                            </div>
                            <div className="text-sm text-muted-foreground">Mobile Friendly</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${performanceResult.metrics.accessibility.responsive ? 'text-green-600' : 'text-red-600'}`}>
                              {performanceResult.metrics.accessibility.responsive ? '✓' : '✗'}
                            </div>
                            <div className="text-sm text-muted-foreground">Responsive Design</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${performanceResult.metrics.accessibility.touch ? 'text-green-600' : 'text-red-600'}`}>
                              {performanceResult.metrics.accessibility.touch ? '✓' : '✗'}
                            </div>
                            <div className="text-sm text-muted-foreground">Touch Optimized</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Mobile Optimization</h4>
                          <div className="space-y-2">
                            {performanceResult.metrics.accessibility.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Analysis History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analysis History
              </CardTitle>
              <CardDescription>
                Your recent performance optimization results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{result.url}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(result.overallScore)}`}>
                        {result.overallScore}/100
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getScoreLabel(result.overallScore)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}