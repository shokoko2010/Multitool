'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Loader2, 
  Copy, 
  Download, 
  ExternalLink, 
  Search, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Eye,
  MousePointer,
  Smartphone,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface SearchConsoleData {
  siteUrl: string
  propertyType: string
  timeRange: string
  metrics: {
    totalClicks: number
    totalImpressions: number
    averagePosition: number
    average_ctr: number
    total_pages: number
    total_queries: number
  }
  pages: Array<{
    page: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  queries: Array<{
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  technicalIssues: Array<{
    type: string
    severity: 'critical' | 'warning' | 'info'
    pages: number
    description: string
    fix: string
  }>
}

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
]

const PROPERTY_TYPES = [
  { value: 'site-search', label: 'Site Search' },
  { value: 'web-search', label: 'Web Search' },
  { value: 'image-search', label: 'Image Search' },
  { value: 'video-search', label: 'Video Search' }
]

const TECHNICAL_ISSUES = [
  {
    type: 'coverage',
    severity: 'critical' as const,
    pages: Math.floor(Math.random() * 50) + 10,
    description: 'Pages with coverage errors',
    fix: 'Fix crawl errors and ensure proper indexing'
  },
  {
    type: 'mobile-usability',
    severity: 'warning' as const,
    pages: Math.floor(Math.random() * 30) + 5,
    description: 'Mobile usability issues',
    fix: 'Fix mobile responsiveness and viewport issues'
  },
  {
    type: 'security-issues',
    severity: 'critical' as const,
    pages: Math.floor(Math.random() * 10) + 1,
    description: 'Security issues detected',
    fix: 'Remove malware and fix security vulnerabilities'
  },
  {
    type: 'structured-data',
    severity: 'warning' as const,
    pages: Math.floor(Math.random() * 40) + 15,
    description: 'Structured data errors',
    fix: 'Fix structured data markup and validate with Google'
  }
]

export default function SearchConsoleSimulator() {
  const [siteUrl, setSiteUrl] = useState('')
  const [propertyType, setPropertyType] = useState('site-search')
  const [timeRange, setTimeRange] = useState('30d')
  const [generatedData, setGeneratedData] = useState<SearchConsoleData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const generateSearchConsoleData = async () => {
    if (!siteUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const baseDomain = new URL(siteUrl).hostname
      const totalClicks = Math.floor(Math.random() * 10000) + 1000
      const totalImpressions = Math.floor(Math.random() * 50000) + 10000
      const averagePosition = (Math.random() * 20 + 5).toFixed(2)
      const average_ctr = ((totalClicks / totalImpressions) * 100).toFixed(2)

      // Generate pages data
      const pages = Array.from({ length: 15 }, (_, i) => ({
        page: `${baseDomain}${i === 0 ? '' : `/page-${i + 1}`}`,
        clicks: Math.floor(Math.random() * 500) + 50,
        impressions: Math.floor(Math.random() * 2000) + 200,
        ctr: ((Math.random() * 10 + 1)).toFixed(2),
        position: (Math.random() * 30 + 1).toFixed(2)
      })).sort((a, b) => b.clicks - a.clicks)

      // Generate queries data
      const queries = Array.from({ length: 20 }, (_, i) => ({
        query: `sample query ${i + 1}`,
        clicks: Math.floor(Math.random() * 300) + 20,
        impressions: Math.floor(Math.random() * 1500) + 100,
        ctr: ((Math.random() * 8 + 1)).toFixed(2),
        position: (Math.random() * 25 + 1).toFixed(2)
      })).sort((a, b) => b.clicks - a.clicks)

      // Generate technical issues
      const technicalIssues = TECHNICAL_ISSUES.map(issue => ({
        ...issue,
        pages: Math.floor(Math.random() * issue.pages) + 1
      }))

      const data: SearchConsoleData = {
        siteUrl,
        propertyType,
        timeRange,
        metrics: {
          totalClicks,
          totalImpressions: parseFloat(totalImpressions.toFixed(0)),
          averagePosition: parseFloat(averagePosition),
          average_ctr: parseFloat(average_ctr),
          total_pages: pages.length,
          total_queries: queries.length
        },
        pages: pages.slice(0, 10),
        queries: queries.slice(0, 15),
        technicalIssues
      }

      setGeneratedData(data)
      toast.success('Search Console data generated successfully!')
    } catch (error) {
      toast.error('Failed to generate Search Console data')
    } finally {
      setIsGenerating(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPerformanceTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    if (Math.abs(change) < 1) return { trend: 'stable', color: 'text-gray-600', icon: '→' }
    if (change > 0) return { trend: 'up', color: 'text-green-600', icon: '↑' }
    return { trend: 'down', color: 'text-red-600', icon: '↓' }
  }

  const exportData = () => {
    if (!generatedData) return

    const csvContent = [
      ['Metric', 'Value'],
      ['Site URL', generatedData.siteUrl],
      ['Property Type', generatedData.propertyType],
      ['Time Range', generatedData.timeRange],
      ['Total Clicks', generatedData.metrics.totalClicks.toString()],
      ['Total Impressions', generatedData.metrics.totalImpressions.toString()],
      ['Average Position', generatedData.metrics.averagePosition.toString()],
      ['Average CTR', generatedData.metrics.average_ctr.toString()],
      ['Total Pages', generatedData.metrics.total_pages.toString()],
      ['Total Queries', generatedData.metrics.total_queries.toString()],
      [''],
      ['Page', 'Clicks', 'Impressions', 'CTR', 'Position'],
      ...generatedData.pages.map(page => [
        page.page,
        page.clicks.toString(),
        page.impressions.toString(),
        page.ctr.toString(),
        page.position.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search-console-data-${generatedData.siteUrl.replace(/^https?:\/\//, '').replace(/\./g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully!')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Search Console Simulator</h1>
        <p className="text-muted-foreground">
          Simulate Google Search Console data to understand your website's search performance
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Set up your website and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Website URL *</label>
                <Input
                  placeholder="https://example.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Property Type</label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate Search Console Data</CardTitle>
            <CardDescription>Generate simulated Search Console performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateSearchConsoleData}
              disabled={isGenerating || !siteUrl.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Search Console Data...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Generate Search Console Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedData && (
          <Card>
            <CardHeader>
              <CardTitle>Search Console Dashboard</CardTitle>
              <CardDescription>Performance overview for {generatedData.siteUrl}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="pages">Pages</TabsTrigger>
                  <TabsTrigger value="queries">Queries</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MousePointer className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Clicks</span>
                        </div>
                        <div className="text-2xl font-bold">{generatedData.metrics.totalClicks.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Total clicks from search
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Impressions</span>
                        </div>
                        <div className="text-2xl font-bold">{generatedData.metrics.totalImpressions.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Total times shown in search
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Avg Position</span>
                        </div>
                        <div className="text-2xl font-bold">{generatedData.metrics.averagePosition}</div>
                        <div className="text-xs text-muted-foreground">
                          Average search position
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">CTR</span>
                        </div>
                        <div className="text-2xl font-bold">{generatedData.metrics.average_ctr}%</div>
                        <div className="text-xs text-muted-foreground">
                          Click-through rate
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                      <CardDescription>Search performance metrics over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Click Performance</span>
                            <span className="text-sm text-muted-foreground">75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Impression Performance</span>
                            <span className="text-sm text-muted-foreground">82%</span>
                          </div>
                          <Progress value={82} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Position Performance</span>
                            <span className="text-sm text-muted-foreground">68%</span>
                          </div>
                          <Progress value={68} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in Google Search Console
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pages" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Top Performing Pages</h3>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {generatedData.pages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">{page.page}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold">{page.clicks}</div>
                            <div className="text-muted-foreground">Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{page.impressions}</div>
                            <div className="text-muted-foreground">Impressions</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{page.ctr}%</div>
                            <div className="text-muted-foreground">CTR</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">#{page.position}</div>
                            <div className="text-muted-foreground">Position</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="queries" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Search Queries</h3>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {generatedData.queries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">{query.query}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold">{query.clicks}</div>
                            <div className="text-muted-foreground">Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{query.impressions}</div>
                            <div className="text-muted-foreground">Impressions</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{query.ctr}%</div>
                            <div className="text-muted-foreground">CTR</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">#{query.position}</div>
                            <div className="text-muted-foreground">Position</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Technical Issues</h3>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {generatedData.technicalIssues.map((issue, index) => (
                      <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {issue.severity === 'critical' ? (
                              <AlertTriangle className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                            <h4 className="font-semibold">{issue.type}</h4>
                          </div>
                          <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {issue.pages} pages
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.description}</p>
                        <p className="text-xs font-medium">Fix: {issue.fix}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Search Console Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Verify</div>
                <div className="text-sm mt-2">Verify your website ownership</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Submit</div>
                <div className="text-sm mt-2">Submit sitemap and URLs</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Monitor</div>
                <div className="text-sm mt-2">Track performance regularly</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">Optimize</div>
                <div className="text-sm mt-2">Fix issues and improve SEO</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}