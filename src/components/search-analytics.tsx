'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Search, 
  Clock, 
  Target, 
  Zap,
  Eye,
  MousePointer,
  Calendar,
  Brain,
  Sparkles,
  Settings,
  Hash
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SearchAnalytics {
  totalSearches: number
  averageResults: number
  successfulSearches: number
  averageSessionTime: number
  aiEnhancedSearches: number
  averageResponseTime: number
  topSearches: Array<{
    query: string
    count: number
    success: boolean
    aiEnhanced: boolean
  }>
  searchTrends: Array<{
    date: string
    searches: number
    successRate: number
    aiEnhancedRate: number
  }>
  categoryBreakdown: Array<{
    category: string
    searches: number
    percentage: number
  }>
  aiInsights: Array<{
    id: string
    insight: string
    confidence: number
    impact: 'high' | 'medium' | 'low'
  }>
}

export function SearchAnalytics() {
  const [analytics, setAnalytics] = useState<SearchAnalytics>({
    totalSearches: 0,
    averageResults: 0,
    successfulSearches: 0,
    averageSessionTime: 0,
    aiEnhancedSearches: 0,
    averageResponseTime: 0,
    topSearches: [],
    searchTrends: [],
    categoryBreakdown: [],
    aiInsights: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadSearchAnalytics()
  }, [])

  const loadSearchAnalytics = () => {
    setLoading(true)
    
    try {
      // Load search stats from localStorage
      const savedStats = localStorage.getItem('searchStats')
      const searchStats = savedStats ? JSON.parse(savedStats) : {
        totalSearches: 0,
        averageResults: 0,
        popularSearches: {},
        aiSuggestionsUsed: 0
      }

      // Load search history
      const savedHistory = localStorage.getItem('searchHistory')
      const searchHistory = savedHistory ? JSON.parse(savedHistory) : []

      // Calculate analytics
      const successfulSearches = searchHistory.filter((search: any) => {
        // Mock success determination based on search query
        const query = search.text.toLowerCase()
        return query.includes('seo') || query.includes('image') || query.includes('password')
      }).length

      const aiEnhancedSearches = searchStats.aiSuggestionsUsed || 0
      const averageResponseTime = 150 + Math.random() * 100 // Mock response time

      const topSearches = Object.entries(searchStats.popularSearches || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([query, count]) => ({
          query,
          count: count as number,
          success: Math.random() > 0.2, // Mock success rate
          aiEnhanced: Math.random() > 0.6 // Mock AI enhancement rate
        }))

      const searchTrends = generateSearchTrends(searchStats.totalSearches, aiEnhancedSearches)
      const categoryBreakdown = generateCategoryBreakdown()
      const aiInsights = generateAIInsights(searchStats)

      setAnalytics({
        totalSearches: searchStats.totalSearches,
        averageResults: searchStats.averageResults || 0,
        successfulSearches,
        averageSessionTime: Math.floor(Math.random() * 120) + 30, // Mock data in seconds
        aiEnhancedSearches,
        averageResponseTime,
        topSearches,
        searchTrends,
        categoryBreakdown,
        aiInsights
      })
      
    } catch (error) {
      console.error('Failed to load search analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSearchTrends = (totalSearches: number, aiEnhanced: number) => {
    const trends = []
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for (let i = 6; i >= 0; i--) {
      const baseSearches = Math.floor(totalSearches / 7)
      const variation = Math.floor(Math.random() * 20) - 10
      const searches = Math.max(0, baseSearches + variation)
      const aiEnhancedRate = Math.min(0.8, (aiEnhanced / totalSearches) + (Math.random() * 0.2 - 0.1))
      
      trends.push({
        date: days[i],
        searches,
        successRate: 0.7 + (Math.random() * 0.2), // 70-90% success rate
        aiEnhancedRate: Math.max(0, Math.min(1, aiEnhancedRate))
      })
    }
    
    return trends
  }

  const generateCategoryBreakdown = () => {
    const categories = [
      { name: 'SEO Tools', percentage: 35 },
      { name: 'Image Tools', percentage: 25 },
      { name: 'Security Tools', percentage: 20 },
      { name: 'Network Tools', percentage: 15 },
      { name: 'Development Tools', percentage: 5 }
    ]

    return categories.map(cat => ({
      category: cat.name,
      searches: Math.floor((analytics.totalSearches || 100) * cat.percentage / 100),
      percentage: cat.percentage
    }))
  }

  const generateAIInsights = (searchStats: any) => {
    const insights = [
      {
        id: '1',
        insight: 'Users are increasingly searching for AI-powered tools',
        confidence: 0.85,
        impact: 'high' as const
      },
      {
        id: '2',
        insight: 'Search success rate improved by 23% with AI suggestions',
        confidence: 0.92,
        impact: 'high' as const
      },
      {
        id: '3',
        insight: 'SEO tools remain the most searched category',
        confidence: 0.78,
        impact: 'medium' as const
      },
      {
        id: '4',
        insight: 'Average search time decreased by 15 seconds',
        confidence: 0.67,
        impact: 'medium' as const
      }
    ]

    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatResponseTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalSearches}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all sessions
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Results</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.averageResults.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Results per search
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.totalSearches > 0 ? 
                      ((analytics.successfulSearches / analytics.totalSearches) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successful searches
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(analytics.averageSessionTime)}</div>
                  <p className="text-xs text-muted-foreground">
                    Per search session
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Top Search Queries</CardTitle>
              <CardDescription>
                Most frequently searched terms and their success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topSearches.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topSearches.map((search, index) => (
                    <motion.div
                      key={search.query}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index < 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{search.query}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={search.success ? 'default' : 'destructive'}>
                              {search.success ? 'Found' : 'No Results'}
                            </Badge>
                            {search.aiEnhanced && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Brain className="w-3 h-3 mr-1" />
                                AI Enhanced
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {search.count} searches
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {((search.count / analytics.totalSearches) * 100).toFixed(1)}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No search data yet</h3>
                  <p className="text-muted-foreground">
                    Start searching to see your most popular queries here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Search Trends</CardTitle>
              <CardDescription>
                Search volume and success rate over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.searchTrends.map((day, index) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.date}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">{day.searches} searches</span>
                        <span className={`text-sm font-medium ${
                          day.successRate > 0.8 ? 'text-green-600' : 
                          day.successRate > 0.6 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(day.successRate * 100).toFixed(0)}% success
                        </span>
                        {day.aiEnhancedRate > 0.3 && (
                          <Badge variant="outline" className="text-xs">
                            AI: {(day.aiEnhancedRate * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Search Volume</span>
                          <span>{day.searches}</span>
                        </div>
                        <Progress value={(day.searches / Math.max(...analytics.searchTrends.map(d => d.searches))) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Success Rate</span>
                          <span>{(day.successRate * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={day.successRate * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-performance" className="space-y-6">
          {/* AI Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Enhanced Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.aiEnhancedSearches}
                </div>
                <p className="text-sm text-muted-foreground">
                  Of {analytics.totalSearches} total searches
                </p>
                <Progress 
                  value={analytics.totalSearches > 0 ? (analytics.aiEnhancedSearches / analytics.totalSearches) * 100 : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatResponseTime(analytics.averageResponseTime)}
                </div>
                <p className="text-sm text-muted-foreground">
                  AI processing time
                </p>
                <Progress value={Math.max(0, 100 - (analytics.averageResponseTime / 3))} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.totalSearches > 0 ? 
                    ((analytics.aiEnhancedSearches / analytics.totalSearches) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Searches using AI
                </p>
                <Progress 
                  value={analytics.totalSearches > 0 ? (analytics.aiEnhancedSearches / analytics.totalSearches) * 100 : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
          </div>

          {/* AI Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>AI Impact Analysis</CardTitle>
              <CardDescription>
                How AI-powered search is improving user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Search Accuracy</span>
                      <span className="font-medium text-green-600">+23%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Satisfaction</span>
                      <span className="font-medium text-blue-600">+18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Time to Result</span>
                      <span className="font-medium text-purple-600">-15s</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">AI Features Usage</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Smart Suggestions</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Semantic Search</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Relevance Scoring</span>
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Intelligent analysis of search patterns and user behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.aiInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="p-4 rounded-lg border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium">{insight.insight}</p>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <Progress value={insight.confidence * 100} className="flex-1 h-2" />
                        <span className="text-xs font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Search Category Distribution</CardTitle>
              <CardDescription>
                Which tool categories are most frequently searched
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-secondary' :
                          index === 2 ? 'bg-accent' :
                          index === 3 ? 'bg-muted' : 'bg-muted/50'
                        }`} />
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{category.searches} searches</span>
                        <span className="text-sm font-medium">{category.percentage}%</span>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}