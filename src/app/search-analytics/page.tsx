'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Hash,
  Settings,
  ArrowRight,
  Download,
  Filter,
  Calendar as CalendarIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchAnalytics as SearchAnalyticsComponent } from '@/components/search-analytics'
import { Tool } from '@/types/tool'

export default function SearchAnalyticsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [searchResults, setSearchResults] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      // Mock tools data for search functionality
      const mockTools: Tool[] = [
        { name: 'SEO Analyzer', href: '/tools/seo-audit-tool', description: 'Comprehensive website SEO analysis', category: 'seo', icon: BarChart3 },
        { name: 'Image Compressor', href: '/tools/image-compressor', description: 'Compress images while maintaining quality', category: 'image', icon: Zap },
        { name: 'Password Generator', href: '/tools/password-generator', description: 'Generate secure random passwords', category: 'security', icon: Target },
        { name: 'JSON Formatter', href: '/tools/json-formatter', description: 'Format and validate JSON data', category: 'development', icon: Hash },
        { name: 'IP Lookup', href: '/tools/ip-lookup', description: 'Get detailed IP address information', category: 'network', icon: Search },
        { name: 'Meta Tag Generator', href: '/tools/meta-tag-generator', description: 'Generate SEO meta tags', category: 'seo', icon: Settings },
        { name: 'Image Resizer', href: '/tools/image-resizer', description: 'Resize images with quality control', category: 'image', icon: Zap },
        { name: 'Hash Checker', href: '/tools/hash-checker', description: 'Verify file integrity with hashes', category: 'security', icon: Target },
      ]
      
      setTools(mockTools)
    } catch (error) {
      console.error('Failed to load tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToolSelect = (tool: Tool) => {
    // Navigate to the selected tool
    window.location.href = tool.href
  }

  const handleSearch = (query: string, results: Tool[]) => {
    setSearchQuery(query)
    setSearchResults(results)
    console.log(`Search performed: "${query}" - ${results.length} results found`)
  }

  const exportSearchData = () => {
    // Mock export functionality
    const searchData = {
      query: searchQuery,
      results: searchResults.length,
      timestamp: new Date().toISOString(),
      tools: searchResults
    }
    
    const blob = new Blob([JSON.stringify(searchData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search-results-${searchQuery || 'all'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
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
            <h1 className="text-3xl font-bold mb-2">Search Analytics</h1>
            <p className="text-muted-foreground">
              Track search performance, user behavior, and tool discovery patterns
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportSearchData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Advanced Search</CardTitle>
          <CardDescription>
            Try our intelligent search with suggestions and real-time results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl mx-auto">
            <AdvancedSearch 
              tools={tools}
              onSelect={handleToolSelect}
              onSearch={handleSearch}
            />
          </div>
          
          {searchQuery && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Search Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Found {searchResults.length} tools for "{searchQuery}"
                  </p>
                </div>
                <Badge variant="secondary">
                  {searchResults.length} results
                </Badge>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((tool, index) => (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border/50 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleToolSelect(tool)}
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <tool.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{tool.name}</h5>
                        <p className="text-sm text-muted-foreground truncate">
                          {tool.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Searches</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold text-green-600">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg. Results</span>
                  <span className="font-semibold">3.2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Time</span>
                  <span className="font-semibold">2:34</span>
                </div>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">SEO Tools</span>
                  </div>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="text-sm">Image Tools</span>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-sm">Security Tools</span>
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted rounded-full" />
                    <span className="text-sm">Development</span>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted/50 rounded-full" />
                    <span className="text-sm">Other</span>
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Searches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['seo analyzer', 'image compressor', 'password generator'].map((search, index) => (
                  <motion.div
                    key={search}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm truncate">{search}</span>
                    <Badge variant="outline" className="text-xs">
                      {3 - index} results
                    </Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Search Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle>Search Effectiveness</CardTitle>
              <CardDescription>
                How well users are finding what they're looking for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">92%</div>
                  <div className="text-sm text-muted-foreground mt-1">First Click Success</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Users find what they need on first attempt
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">2.3</div>
                  <div className="text-sm text-muted-foreground mt-1">Avg. Results per Search</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Optimal number of relevant results
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">45s</div>
                  <div className="text-sm text-muted-foreground mt-1">Avg. Search Time</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Time from search to tool usage
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SearchAnalyticsComponent />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Volume Trends</CardTitle>
                <CardDescription>
                  How search volume changes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="text-sm font-medium text-green-600">+15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Week</span>
                    <span className="text-sm font-medium text-blue-600">+8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">2 Weeks Ago</span>
                    <span className="text-sm font-medium">-3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Month</span>
                    <span className="text-sm font-medium text-green-600">+22%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Pattern Analysis</CardTitle>
                <CardDescription>
                  User behavior and search patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mobile Searches</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Desktop Searches</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekend Activity</span>
                    <span className="text-sm font-medium text-green-600">+25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Hours</span>
                    <span className="text-sm font-medium">2-4 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seasonal Trends</CardTitle>
              <CardDescription>
                Search patterns throughout the day and week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="space-y-2">
                    <div className="text-xs font-medium">{day}</div>
                    <div className="h-20 bg-muted rounded relative">
                      <div 
                        className="absolute bottom-0 w-full bg-primary rounded"
                        style={{ height: `${30 + index * 10}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {20 + index * 15}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Behavior Insights</CardTitle>
                <CardDescription>
                  Key findings about user search patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Mobile-First Search</h4>
                  <p className="text-sm text-blue-700">
                    65% of searches come from mobile devices, indicating the need for mobile-optimized search experience.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">High Success Rate</h4>
                  <p className="text-sm text-green-700">
                    92% of searches result in successful tool discovery, suggesting effective search algorithms.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-1">Category Preferences</h4>
                  <p className="text-sm text-purple-700">
                    SEO and image tools dominate searches, reflecting user priorities for optimization and media processing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Actionable insights to improve search experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-1">Enhance Mobile Experience</h4>
                  <p className="text-sm text-orange-700">
                    Implement voice search and gesture controls for better mobile usability.
                  </p>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg">
                  <h4 className="font-medium text-teal-900 mb-1">Expand SEO Tools</h4>
                  <p className="text-sm text-teal-700">
                    Add more comprehensive SEO analysis tools to meet high demand.
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-1">Personalized Results</h4>
                  <p className="text-sm text-indigo-700">
                    Implement user-specific search ranking based on usage history and preferences.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for search functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1.2s</div>
                  <div className="text-sm text-muted-foreground mt-1">Avg. Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.7/5</div>
                  <div className="text-sm text-muted-foreground mt-1">User Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">500K+</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Searches</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}