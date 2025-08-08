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
  Search, 
  Globe, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Server,
  Smartphone,
  FileText,
  Link,
  Database,
  BarChart3,
  Target,
  Eye,
  Wifi,
  HardDrive,
  Cpu,
  Hash,
  Info
} from 'lucide-react'

interface SEOAuditResult {
  url: string
  overallScore: number
  status: 'analyzing' | 'completed' | 'error'
  timestamp: string
  metrics: {
    technical: {
      score: number
      issues: Array<{
        type: 'error' | 'warning' | 'info'
        title: string
        description: string
        fix: string
      }>
    }
    performance: {
      score: number
      lcp: number
      fid: number
      cls: number
      recommendations: string[]
    }
    seo: {
      score: number
      issues: Array<{
        type: 'error' | 'warning' | 'info'
        title: string
        description: string
        fix: string
      }>
    }
    accessibility: {
      score: number
      issues: Array<{
        type: 'error' | 'warning' | 'info'
        title: string
        description: string
        fix: string
      }>
    }
    content: {
      score: number
      issues: Array<{
        type: 'error' | 'warning' | 'info'
        title: string
        description: string
        fix: string
      }>
    }
  }
}

export default function SEOAuditTool() {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null)
  const [history, setHistory] = useState<SEOAuditResult[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/seo-audit/history')
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
      const response = await fetch('/api/seo-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const auditData = result.data
        auditData.status = 'completed'
        
        // Save to history
        await fetch('/api/seo-audit/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: auditData.url,
            overallScore: auditData.overallScore,
            metrics: auditData.metrics
          }),
        })

        setAuditResult(auditData)
        setHistory(prev => [auditData, ...prev.slice(0, 4)]) // Keep last 5 results
      } else {
        throw new Error(result.error || 'Failed to analyze website')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      // You could add error handling here to show error message to user
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

  const getIssueIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Technical SEO Audit Tool</h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive website analysis for technical SEO, performance, and accessibility
          </p>
        </div>

        {/* URL Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analyze Your Website
            </CardTitle>
            <CardDescription>
              Enter a URL to perform a comprehensive technical SEO analysis
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
        {auditResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Analyzed: {auditResult.url} • {new Date(auditResult.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(auditResult.overallScore)}`}>
                    {auditResult.overallScore}/100
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Score
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Technical</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(auditResult.metrics.technical.score)}`}>
                          {auditResult.metrics.technical.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(auditResult.metrics.technical.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Performance</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(auditResult.metrics.performance.score)}`}>
                          {auditResult.metrics.performance.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(auditResult.metrics.performance.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">SEO</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(auditResult.metrics.seo.score)}`}>
                          {auditResult.metrics.seo.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(auditResult.metrics.seo.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Accessibility</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(auditResult.metrics.accessibility.score)}`}>
                          {auditResult.metrics.accessibility.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(auditResult.metrics.accessibility.score)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Content</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(auditResult.metrics.content.score)}`}>
                          {auditResult.metrics.content.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getScoreLabel(auditResult.metrics.content.score)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Largest Contentful Paint</span>
                            <span className={`text-sm ${auditResult.metrics.performance.lcp < 2500 ? 'text-green-600' : auditResult.metrics.performance.lcp < 4000 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {auditResult.metrics.performance.lcp}ms
                            </span>
                          </div>
                          <Progress value={Math.min(100, (auditResult.metrics.performance.lcp / 4000) * 100)} />
                          <div className="text-xs text-muted-foreground mt-1">
                            Good: &lt;2.5s | Needs improvement: &lt;4s
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">First Input Delay</span>
                            <span className={`text-sm ${auditResult.metrics.performance.fid < 100 ? 'text-green-600' : auditResult.metrics.performance.fid < 300 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {auditResult.metrics.performance.fid}ms
                            </span>
                          </div>
                          <Progress value={Math.min(100, (auditResult.metrics.performance.fid / 300) * 100)} />
                          <div className="text-xs text-muted-foreground mt-1">
                            Good: &lt;100ms | Needs improvement: &lt;300ms
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Cumulative Layout Shift</span>
                            <span className={`text-sm ${parseFloat(auditResult.metrics.performance.cls) < 0.1 ? 'text-green-600' : parseFloat(auditResult.metrics.performance.cls) < 0.25 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {auditResult.metrics.performance.cls}
                            </span>
                          </div>
                          <Progress value={parseFloat(auditResult.metrics.performance.cls) * 400} />
                          <div className="text-xs text-muted-foreground mt-1">
                            Good: &lt;0.1 | Needs improvement: &lt;0.25
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Technical Tab */}
                <TabsContent value="technical" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Technical SEO Issues
                      </CardTitle>
                      <CardDescription>
                        Technical issues that affect your site's SEO performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditResult.metrics.technical.issues.map((issue, index) => (
                          <Alert key={index}>
                            <div className="flex items-start gap-2">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1">
                                <AlertDescription className="font-medium">
                                  {issue.title}
                                </AlertDescription>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {issue.description}
                                </p>
                                <Badge variant="outline" className="mt-2">
                                  {issue.fix}
                                </Badge>
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Performance Recommendations
                      </CardTitle>
                      <CardDescription>
                        Suggestions to improve your website's loading speed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {auditResult.metrics.performance.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        SEO Issues
                      </CardTitle>
                      <CardDescription>
                        Search engine optimization issues and recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditResult.metrics.seo.issues.map((issue, index) => (
                          <Alert key={index}>
                            <div className="flex items-start gap-2">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1">
                                <AlertDescription className="font-medium">
                                  {issue.title}
                                </AlertDescription>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {issue.description}
                                </p>
                                <Badge variant="outline" className="mt-2">
                                  {issue.fix}
                                </Badge>
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Accessibility Tab */}
                <TabsContent value="accessibility" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Accessibility Issues
                      </CardTitle>
                      <CardDescription>
                        WCAG compliance issues and accessibility improvements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditResult.metrics.accessibility.issues.map((issue, index) => (
                          <Alert key={index}>
                            <div className="flex items-start gap-2">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1">
                                <AlertDescription className="font-medium">
                                  {issue.title}
                                </AlertDescription>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {issue.description}
                                </p>
                                <Badge variant="outline" className="mt-2">
                                  {issue.fix}
                                </Badge>
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Content Issues
                      </CardTitle>
                      <CardDescription>
                        Content quality and SEO recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditResult.metrics.content.issues.map((issue, index) => (
                          <Alert key={index}>
                            <div className="flex items-start gap-2">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1">
                                <AlertDescription className="font-medium">
                                  {issue.title}
                                </AlertDescription>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {issue.description}
                                </p>
                                <Badge variant="outline" className="mt-2">
                                  {issue.fix}
                                </Badge>
                              </div>
                            </div>
                          </Alert>
                        ))}
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
                Analysis History
              </CardTitle>
              <CardDescription>
                Your recent SEO audit results
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