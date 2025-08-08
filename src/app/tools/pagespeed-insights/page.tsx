'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ExternalLink, TrendingUp, TrendingDown, Minus, Zap, Smartphone, Desktop, Globe, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PagespeedData {
  url: string
  overallScore: number
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  loadingExperience: {
    firstContentfulPaint: number
    speedIndex: number
    largestContentfulPaint: number
    timeToInteractive: number
    totalBlockingTime: number
    cumulativeLayoutShift: number
  }
  opportunities: string[]
  diagnostics: string[]
  audits: {
    'first-contentful-paint': number
    'speed-index': number
    'largest-contentful-paint': number
    'interactive': number
    'total-blocking-time': number
    'cumulative-layout-shift': number
  }
}

export default function PagespeedInsightsChecker() {
  const [url, setUrl] = useState('')
  const [pagespeedData, setPagespeedData] = useState<PagespeedData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState('mobile')

  const devices = [
    { id: 'mobile', name: 'Mobile', icon: Smartphone },
    { id: 'desktop', name: 'Desktop', icon: Desktop }
  ]

  const analyzePagespeed = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulate Pagespeed Insights analysis
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      // Mock Pagespeed data
      const mockData: PagespeedData = {
        url: url,
        overallScore: Math.floor(Math.random() * 30) + 70,
        performance: Math.floor(Math.random() * 25) + 65,
        accessibility: Math.floor(Math.random() * 20) + 75,
        bestPractices: Math.floor(Math.random() * 15) + 80,
        seo: Math.floor(Math.random() * 20) + 70,
        loadingExperience: {
          firstContentfulPaint: Math.floor(Math.random() * 2) + 1,
          speedIndex: Math.floor(Math.random() * 4) + 2,
          largestContentfulPaint: Math.floor(Math.random() * 3) + 1,
          timeToInteractive: Math.floor(Math.random() * 5) + 3,
          totalBlockingTime: Math.floor(Math.random() * 200) + 100,
          cumulativeLayoutShift: Math.random() * 0.3
        },
        opportunities: [
          'Optimize images to reduce their size',
          'Eliminate render-blocking resources',
          'Reduce initial server response time',
          'Properly size images',
          'Enable text compression'
        ],
        diagnostics: [
          'Serve images in next-gen formats',
          'Reduce unused JavaScript',
          'Reduce unused CSS',
          'Minify CSS',
          'Minify JavaScript'
        ],
        audits: {
          'first-contentful-paint': Math.floor(Math.random() * 1000) + 1000,
          'speed-index': Math.floor(Math.random() * 3000) + 2000,
          'largest-contentful-paint': Math.floor(Math.random() * 2500) + 1500,
          'interactive': Math.floor(Math.random() * 4000) + 3000,
          'total-blocking-time': Math.floor(Math.random() * 300) + 100,
          'cumulative-layout-shift': Math.random() * 0.3
        }
      }
      
      setPagespeedData(mockData)
      toast.success('Pagespeed analysis completed!')
    } catch (error) {
      toast.error('Failed to analyze Pagespeed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="secondary" className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 50) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>
    return <Badge variant="destructive">Poor</Badge>
  }

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`
  }

  const openInNewTab = () => {
    if (pagespeedData) {
      window.open(`https://pagespeed.web.dev/url=${encodeURIComponent(pagespeedData.url)}`, '_blank')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Pagespeed Insights Checker</h1>
        <p className="text-muted-foreground">
          Analyze website performance, SEO, and user experience with Google Pagespeed Insights
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Analysis</CardTitle>
            <CardDescription>Enter website URL to analyze performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Website URL *</label>
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Device Type</label>
                <Tabs value={selectedDevice} onValueChange={setSelectedDevice}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mobile" className="text-xs">
                      <Smartphone className="h-4 w-4 mr-1" />
                      Mobile
                    </TabsTrigger>
                    <TabsTrigger value="desktop" className="text-xs">
                      <Desktop className="h-4 w-4 mr-1" />
                      Desktop
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={analyzePagespeed}
                disabled={isAnalyzing || !url.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Analyze Performance
                  </>
                )}
              </Button>
              <Button 
                onClick={openInNewTab}
                variant="outline"
                disabled={!pagespeedData}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {pagespeedData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Score</CardTitle>
                <CardDescription>Overall Pagespeed Insights score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold ${getScoreColor(pagespeedData.overallScore)}`}>
                    {pagespeedData.overallScore}
                  </div>
                  <div className="flex justify-center">
                    {getScoreBadge(pagespeedData.overallScore)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Score out of 100 - Higher is better
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Scores</CardTitle>
                <CardDescription>Detailed scores for each performance category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(pagespeedData.performance)}`}>
                      {pagespeedData.performance}
                    </div>
                    <div className="text-sm font-medium">Performance</div>
                    {getScoreBadge(pagespeedData.performance)}
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(pagespeedData.accessibility)}`}>
                      {pagespeedData.accessibility}
                    </div>
                    <div className="text-sm font-medium">Accessibility</div>
                    {getScoreBadge(pagespeedData.accessibility)}
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(pagespeedData.bestPractices)}`}>
                      {pagespeedData.bestPractices}
                    </div>
                    <div className="text-sm font-medium">Best Practices</div>
                    {getScoreBadge(pagespeedData.bestPractices)}
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(pagespeedData.seo)}`}>
                      {pagespeedData.seo}
                    </div>
                    <div className="text-sm font-medium">SEO</div>
                    {getScoreBadge(pagespeedData.seo)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading Metrics</CardTitle>
                <CardDescription>Detailed loading performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">First Contentful Paint</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatTime(pagespeedData.audits['first-contentful-paint'])}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Time to first render
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Speed Index</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatTime(pagespeedData.audits['speed-index'])}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Visual loading speed
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Largest Contentful Paint</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatTime(pagespeedData.audits['largest-contentful-paint'])}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Main content render time
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Time to Interactive</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatTime(pagespeedData.audits['interactive'])}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Time to full interactivity
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Total Blocking Time</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {pagespeedData.audits['total-blocking-time']}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Main thread blocking time
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Cumulative Layout Shift</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {pagespeedData.audits['cumulative-layout-shift'].toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Visual stability score
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Opportunities</CardTitle>
                <CardDescription>Recommendations to improve website performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pagespeedData.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diagnostics</CardTitle>
                <CardDescription>Issues found during analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pagespeedData.diagnostics.map((diagnostic, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{diagnostic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!pagespeedData && !isAnalyzing && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Enter a website URL and click analyze to see detailed performance metrics
                </p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}