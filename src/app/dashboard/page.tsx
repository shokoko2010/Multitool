'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Clock, 
  Star, 
  Zap, 
  TrendingUp, 
  Target, 
  Calendar,
  Activity,
  Trophy,
  Settings,
  User,
  ArrowRight,
  Plus,
  Loader2
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Tool } from '@/types/tool'
import Link from 'next/link'

interface DashboardStats {
  totalToolsUsed: number
  favoriteTools: number
  totalSessions: number
  averageSessionTime: number
  mostUsedCategory: string
  weeklyUsage: { day: string; count: number }[]
}

interface RecentActivity {
  id: string
  toolName: string
  toolHref: string
  timestamp: Date
  duration?: number
  success: boolean
}

export default function Dashboard() {
  const { theme } = useTheme()
  const [stats, setStats] = useState<DashboardStats>({
    totalToolsUsed: 0,
    favoriteTools: 0,
    totalSessions: 0,
    averageSessionTime: 0,
    mostUsedCategory: '',
    weeklyUsage: []
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    setLoading(true)
    
    try {
      // Load usage stats from localStorage
      const savedStats = localStorage.getItem('tool-usage-stats')
      const usageStats = savedStats ? JSON.parse(savedStats) : {}
      
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('tool-favorites')
      const favorites = savedFavorites ? JSON.parse(savedFavorites) : []
      
      // Load activity history from localStorage
      const savedActivity = localStorage.getItem('user-activity')
      const activity = savedActivity ? JSON.parse(savedActivity) : []

      // Calculate dashboard stats
      const totalToolsUsed = Object.keys(usageStats).length
      const favoriteToolsList = getFavoriteToolsData(favorites)
      
      // Generate weekly usage data (mock data for now)
      const weeklyUsage = generateWeeklyUsageData()
      
      // Calculate most used category
      const categoryStats = calculateCategoryStats(usageStats)
      const mostUsedCategory = Object.keys(categoryStats).reduce((a, b) => 
        categoryStats[a] > categoryStats[b] ? a : b, ''
      )

      // Process recent activity
      const recentActivityData = processRecentActivity(activity).slice(0, 10)

      setStats({
        totalToolsUsed,
        favoriteTools: favorites.length,
        totalSessions: Math.floor(Math.random() * 50) + 10, // Mock data
        averageSessionTime: Math.floor(Math.random() * 15) + 5, // Mock data in minutes
        mostUsedCategory,
        weeklyUsage
      })
      
      setRecentActivity(recentActivityData)
      setFavoriteTools(favoriteToolsList)
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFavoriteToolsData = (favorites: string[]): Tool[] => {
    // This would normally fetch from API, using mock data for now
    return [
      { name: 'SEO Analyzer', href: '/tools/seo-audit-tool', description: 'Comprehensive website SEO analysis', category: 'seo', icon: BarChart3 },
      { name: 'Image Compressor', href: '/tools/image-compressor', description: 'Compress images while maintaining quality', category: 'image', icon: Zap },
      { name: 'Password Generator', href: '/tools/password-generator', description: 'Generate secure random passwords', category: 'security', icon: Target },
    ]
  }

  const generateWeeklyUsageData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      count: Math.floor(Math.random() * 20) + 1
    }))
  }

  const calculateCategoryStats = (usageStats: Record<string, number>) => {
    const categoryStats: Record<string, number> = {}
    
    Object.keys(usageStats).forEach(toolName => {
      // Mock category assignment based on tool name
      let category = 'general'
      if (toolName.toLowerCase().includes('seo') || toolName.toLowerCase().includes('meta')) {
        category = 'seo'
      } else if (toolName.toLowerCase().includes('image') || toolName.toLowerCase().includes('video')) {
        category = 'media'
      } else if (toolName.toLowerCase().includes('password') || toolName.toLowerCase().includes('ssl')) {
        category = 'security'
      } else if (toolName.toLowerCase().includes('network') || toolName.toLowerCase().includes('ip')) {
        category = 'network'
      }
      
      categoryStats[category] = (categoryStats[category] || 0) + usageStats[toolName]
    })
    
    return categoryStats
  }

  const processRecentActivity = (activity: any[]): RecentActivity[] => {
    return activity.map((item, index) => ({
      id: `activity-${index}`,
      toolName: item.toolName || 'Unknown Tool',
      toolHref: item.toolHref || '#',
      timestamp: new Date(item.timestamp || Date.now()),
      duration: item.duration,
      success: item.success !== false
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your activity overview and insights.
            </p>
          </div>
          <Button variant="outline" onClick={loadDashboardData}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tools Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalToolsUsed}</div>
              <p className="text-xs text-muted-foreground">
                Different tools explored
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
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoriteTools}</div>
              <p className="text-xs text-muted-foreground">
                Tools you've favorited
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
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Total sessions this month
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
              <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSessionTime}m</div>
              <p className="text-xs text-muted-foreground">
                Average session duration
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Usage</CardTitle>
                <CardDescription>
                  Your tool usage over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.weeklyUsage.map((day, index) => (
                    <div key={day.day} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <Progress value={(day.count / 25) * 100} className="h-2" />
                      </div>
                      <div className="w-8 text-sm text-muted-foreground">
                        {day.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Used Category */}
            <Card>
              <CardHeader>
                <CardTitle>Most Used Category</CardTitle>
                <CardDescription>
                  Your preferred tool categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{stats.mostUsedCategory || 'General'}</div>
                    <div className="text-sm text-muted-foreground">
                      Most frequently used category
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>SEO Tools</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Image Tools</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Security Tools</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Fast access to common tasks and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Add Tool</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Target className="h-5 w-5" />
                  <span className="text-xs">New Search</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Trophy className="h-5 w-5" />
                  <span className="text-xs">Achievements</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Favorite Tools</CardTitle>
                  <CardDescription>
                    Tools you've marked as favorites for quick access
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Favorite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {favoriteTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteTools.map((tool, index) => (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <tool.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{tool.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {tool.description}
                              </p>
                            </div>
                            <Badge variant="secondary">{tool.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding your most-used tools to favorites for quick access
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Tools
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest tool usage and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-4 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.success ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium truncate">{activity.toolName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {activity.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = activity.toolHref}
                      >
                        View
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recent activity</h3>
                  <p className="text-muted-foreground">
                    Start using tools to see your activity history here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>
                  How your tool usage has changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="text-sm font-medium text-green-600">+12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Month</span>
                    <span className="text-sm font-medium">8% increase</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">3 Months Ago</span>
                    <span className="text-sm font-medium">25% increase</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tool Categories</CardTitle>
                <CardDescription>
                  Distribution of tool usage by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      <span className="text-sm">SEO Tools</span>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-secondary rounded-full" />
                      <span className="text-sm">Image Tools</span>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-accent rounded-full" />
                      <span className="text-sm">Security Tools</span>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-muted rounded-full" />
                      <span className="text-sm">Other</span>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}