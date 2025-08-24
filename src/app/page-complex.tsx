'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Tool, tools } from '@/data/tools'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Bot, Mail, CreditCard, DollarSign, Type, Hash, Calculator, Palette, Image, Clock, Globe, Ruler, Weight, Thermometer, Gauge, Lock, File, Tag, Code, FileText, Braces, Fingerprint, Key, Dice1, Wifi, Server, Link, Percent, Calendar, FileSpreadsheet, FileJson, FileCode, Shield, Copy, RotateCcw, AlignLeft, Scissors, Unlock, Upload, GitCompare, AtSign, BarChart, BarChart3, Binary, Camera, CheckCircle, Computer, Divide, ExternalLink, Eye, FlaskConical, Frown, GitBranch, Languages, ListOrdered, MessageCircle, Mic, Phone, PiggyBank, QrCode, Radio, RotateCw, Scan, ScanBarcode, Share, Smartphone, Smile, Timer, Trash2, User, Volume2, Wrench, Youtube, Zap, ZapOff, Database, Bitcoin, Wand2, Replace, RefreshCw, Minimize2, CheckSquare, Maximize, Info, Edit, MapPin, Settings, Activity, Send, Link2, Table, TrendingUp, Music, Video, Download, AlertTriangle, Ban, ArrowUpDown, Shuffle, Barcode, Star, TrendingUp as TrendingUpIcon, Filter } from 'lucide-react'

const iconMap = {
  Bot,
  Mail,
  CreditCard,
  DollarSign,
  Type,
  Hash,
  Calculator,
  Palette,
  Image,
  Clock,
  Globe,
  Ruler,
  Weight,
  Thermometer,
  Gauge,
  Lock,
  File,
  Tag,
  Code,
  FileText,
  Braces,
  Fingerprint,
  Key,
  Dice1,
  Wifi,
  Server,
  Link,
  Percent,
  Calendar,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Shield,
  Copy,
  RotateCcw,
  AlignLeft,
  Scissors,
  Unlock,
  Upload,
  GitCompare,
  AtSign,
  BarChart,
  BarChart3,
  Binary,
  Camera,
  CheckCircle,
  Computer,
  Divide,
  ExternalLink,
  Eye,
  FlaskConical,
  Frown,
  GitBranch,
  Languages,
  ListOrdered,
  MessageCircle,
  Mic,
  Phone,
  PiggyBank,
  QrCode,
  Radio,
  RotateCw,
  Scan,
  ScanBarcode,
  Share,
  Smartphone,
  Smile,
  Timer,
  Trash2,
  User,
  Volume2,
  Wrench,
  Youtube,
  Zap,
  ZapOff,
  Database,
  Bitcoin,
  Wand2,
  Replace,
  RefreshCw,
  Minimize2,
  CheckSquare,
  Maximize,
  Info,
  Edit,
  MapPin,
  Settings,
  Activity,
  Send,
  Link2,
  Table,
  TrendingUp,
  Music,
  Video,
  Download,
  AlertTriangle,
  Ban,
  ArrowUpDown,
  Shuffle,
  Barcode,
  Star,
  Tool: Search
}

export default function Home() {
  const { data: session, status } = useSession()
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [trendingTools, setTrendingTools] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Load tools immediately without waiting for auth
    fetchTools()
    
    // Set a timeout for auth loading
    const authTimeout = setTimeout(() => {
      setAuthLoading(false)
    }, 3000) // 3 second timeout for auth
    
    return () => clearTimeout(authTimeout)
  }, [])

  useEffect(() => {
    // Only fetch recommendations when session is available and auth is not loading
    if (!authLoading && session) {
      fetchRecommendations()
    }
  }, [session, authLoading])

  useEffect(() => {
    filterTools()
  }, [tools, searchQuery, selectedCategory])

  useEffect(() => {
    // Add a small delay for search to show loading state
    if (searchQuery) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  const fetchTools = async () => {
    try {
      // Use directly imported tools
      setTools(tools)
      
      // Set featured tools (tools with featured: true)
      const featured = tools.filter((tool: Tool) => tool.featured)
      setFeaturedTools(featured.slice(0, 6)) // Show max 6 featured tools
      
      // Extract categories from tools
      const uniqueCategories = [...new Set(tools.map((tool: Tool) => tool.category))]
      setCategories(['all', ...uniqueCategories])
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const [personalizedRes, trendingRes] = await Promise.all([
        fetch('/api/user/recommendations?type=personalized&limit=6'),
        fetch('/api/user/recommendations?type=trending&limit=6')
      ])

      if (personalizedRes.ok) {
        const personalizedData = await personalizedRes.json()
        setRecommendations(personalizedData)
      }

      if (trendingRes.ok) {
        const trendingData = await trendingRes.json()
        setTrendingTools(trendingData)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const filterTools = () => {
    let filtered = tools

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    setFilteredTools(filtered)
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Search
    return <IconComponent className="w-6 h-6" />
  }

  // Show loading state only for initial tools loading, not for auth
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
        <div className="text-lg">Loading tools...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl">Z.ai MultiTool</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Z.ai MultiTool
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8">
              A comprehensive collection of {tools.length}+ tools for developers, designers, and content creators
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {tools.length}+ Tools Available
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {categories.length - 1} Categories
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                AI-Powered
              </Badge>
            </div>
          </div>

          {/* Featured Tools Section */}
          {featuredTools.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Featured Tools</h2>
                <p className="text-muted-foreground">
                  Discover our most popular and powerful tools
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTools.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-all duration-200 border-primary/20 hover:border-primary/40 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-primary group-hover:scale-110 transition-transform">
                          {getIconComponent(tool.icon)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {tool.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {tool.category}
                          </Badge>
                        </div>
                        {tool.featured && (
                          <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Personalized Recommendations Section */}
          {!authLoading && session && recommendations.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Star className="w-8 h-8 text-yellow-500" />
                  Recommended For You
                </h2>
                <p className="text-muted-foreground">
                  Personalized tool recommendations based on your usage and preferences
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200 border-primary/20 hover:border-primary/40 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-primary group-hover:scale-110 transition-transform">
                          {getIconComponent(rec.tool.icon)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {rec.tool.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {rec.tool.category}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Score: {Math.round(rec.score)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {rec.tool.description}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {rec.reason}
                      </p>
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => window.location.href = rec.tool.path}
                      >
                        Try Tool
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Trending Tools Section */}
          {!authLoading && trendingTools.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                  <TrendingUpIcon className="w-8 h-8 text-green-500" />
                  Trending Tools
                </h2>
                <p className="text-muted-foreground">
                  Most popular tools based on community usage
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTools.slice(0, 6).map((rec, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200 border-primary/20 hover:border-primary/40 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-primary group-hover:scale-110 transition-transform">
                          {getIconComponent(rec.tool.icon)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {rec.tool.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {rec.tool.category}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(rec.score)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {rec.tool.description}
                      </CardDescription>
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => window.location.href = rec.tool.path}
                      >
                        Try Tool
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Find Your Perfect Tool</h2>
              <p className="text-muted-foreground">
                Search through {tools.length}+ tools by name, description, or tags
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                )}
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/search'}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Search
              </Button>
            </div>
            {searchQuery && (
              <div className="text-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''} found
                </p>
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">
                Explore tools organized by category
              </p>
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 mb-8 h-auto p-1">
                {categories.slice(0, 10).map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    className="text-xs sm:text-sm py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => (
                    <Card 
                      key={tool.id} 
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:-translate-y-1"
                      onClick={() => window.location.href = tool.path}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-primary group-hover:scale-110 transition-transform">
                            {getIconComponent(tool.icon)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                              {tool.name}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {tool.category}
                            </Badge>
                          </div>
                          {tool.featured && (
                            <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm line-clamp-2">
                          {tool.description}
                        </CardDescription>
                        {tool.tags && tool.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {tool.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {tool.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tool.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Search className="w-16 h-16 mx-auto text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No tools found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? `No tools match "${searchQuery}". Try different keywords or browse categories.`
                      : selectedCategory !== 'all'
                      ? `No tools found in the "${selectedCategory}" category.`
                      : 'No tools available at the moment.'
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    {searchQuery && (
                      <Button onClick={() => setSearchQuery('')} variant="outline">
                        Clear Search
                      </Button>
                    )}
                    {selectedCategory !== 'all' && (
                      <Button onClick={() => setSelectedCategory('all')} variant="outline">
                        View All Categories
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}