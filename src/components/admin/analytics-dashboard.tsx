'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar, 
  Activity,
  RefreshCw,
  Download,
  Eye,
  Target,
  Zap,
  Award
} from 'lucide-react'

interface AnalyticsData {
  timeframe: string
  totalUsage: number
  uniqueUsers: number
  topTools: Array<{
    toolId: string
    usageCount: number
    uniqueUsers: number
    avgDuration: number
    tool: any
  }>
  categoryAnalytics: Array<{
    category: string
    usageCount: number
    uniqueUsers: number
    toolCount: number
  }>
  hourlyAnalytics: Array<{
    hour: number
    usageCount: number
    uniqueUsers: number
  }>
  dailyAnalytics: Array<{
    day: number
    dayName: string
    usageCount: number
    uniqueUsers: number
  }>
  userEngagement: Array<{
    userId: string
    usageCount: number
    uniqueTools: number
    totalDuration: number
    avgDuration: number
    lastActive: string
  }>
  summary: {
    totalToolUsage: number
    avgSessionDuration: number
    mostPopularCategory: string
    peakUsageHour: number
    mostActiveDay: string
  }
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeframe=${selectedTimeframe}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedTimeframe])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAnalytics()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, selectedTimeframe])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Real-time Analytics</h2>
          <p className="text-muted-foreground">
            Monitor tool usage and user engagement patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalUsage)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analytics.uniqueUsers)} unique users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analytics.summary.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Average duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.mostPopularCategory}</div>
            <p className="text-xs text-muted-foreground">
              Most popular category
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.peakUsageHour}:00</div>
            <p className="text-xs text-muted-foreground">
              Peak usage hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tools">Top Tools</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
          <TabsTrigger value="users">User Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Most Popular Tools
              </CardTitle>
              <CardDescription>
                Top tools by usage count and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topTools.slice(0, 10).map((tool, index) => (
                  <div key={tool.toolId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{tool.tool?.name || tool.toolId}</p>
                        <p className="text-sm text-muted-foreground">
                          {tool.tool?.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium">{formatNumber(tool.usageCount)}</p>
                          <p className="text-xs text-muted-foreground">uses</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatNumber(tool.uniqueUsers)}</p>
                          <p className="text-xs text-muted-foreground">users</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatDuration(tool.avgDuration)}</p>
                          <p className="text-xs text-muted-foreground">avg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Category Analytics
              </CardTitle>
              <CardDescription>
                Usage breakdown by tool categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryAnalytics.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.toolCount} tools
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium">{formatNumber(category.usageCount)}</p>
                          <p className="text-xs text-muted-foreground">uses</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatNumber(category.uniqueUsers)}</p>
                          <p className="text-xs text-muted-foreground">users</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hourly Usage Pattern
                </CardTitle>
                <CardDescription>
                  Usage distribution throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.hourlyAnalytics.map((hour) => (
                    <div key={hour.hour} className="flex items-center gap-3">
                      <div className="w-12 text-sm">{hour.hour}:00</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                        <div
                          className="bg-primary h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${(hour.usageCount / Math.max(...analytics.hourlyAnalytics.map(h => h.usageCount))) * 100}%`
                          }}
                        />
                      </div>
                      <div className="w-16 text-sm text-right">
                        {formatNumber(hour.usageCount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Usage Pattern
                </CardTitle>
                <CardDescription>
                  Usage distribution throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.dailyAnalytics.map((day) => (
                    <div key={day.day} className="flex items-center gap-3">
                      <div className="w-16 text-sm">{day.dayName}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                        <div
                          className="bg-primary h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${(day.usageCount / Math.max(...analytics.dailyAnalytics.map(d => d.usageCount))) * 100}%`
                          }}
                        />
                      </div>
                      <div className="w-16 text-sm text-right">
                        {formatNumber(day.usageCount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top User Engagement
              </CardTitle>
              <CardDescription>
                Most active users by usage and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.userEngagement.slice(0, 20).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          Last active: {new Date(user.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium">{formatNumber(user.usageCount)}</p>
                          <p className="text-xs text-muted-foreground">uses</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.uniqueTools}</p>
                          <p className="text-xs text-muted-foreground">tools</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatDuration(user.avgDuration)}</p>
                          <p className="text-xs text-muted-foreground">avg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}