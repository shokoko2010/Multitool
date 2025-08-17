"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Globe, 
  Shield, 
  Code, 
  Image, 
  Palette, 
  Calculator, 
  Hash, 
  Database, 
  FileText, 
  Zap, 
  GitCompare, 
  BarChart3, 
  Key, 
  Volume2, 
  Video, 
  Monitor, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Hash as HashIcon, 
  Dice6, 
  Calendar, 
  QrCode, 
  BarChart3 as BarcodeIcon, 
  Upload, 
  Settings, 
  Binary, 
  FileCode, 
  Download, 
  CheckCircle, 
  Brain, 
  Star, 
  TrendingUp, 
  Users, 
  Zap as ZapIcon, 
  ArrowRight, 
  Sparkles, 
  Grid3X3, 
  Link as LinkIcon,
  AlertCircle,
  RefreshCw,
  Loader2,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EnhancedSearch } from '@/components/enhanced-search'
import { AdvancedSearch } from '@/components/advanced-search'
import { GridSkeleton, SearchSkeleton } from '@/components/ui/skeleton'
import { CategoryNavigation } from '@/components/category-navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import toast from '@/lib/toast'

interface Tool {
  id: string
  name: string
  description: string
  category: string
  icon: string
  path: string
  featured?: boolean
  tags?: string[]
}

interface Category {
  id: string
  name: string
  count: number
  icon: any
  description: string
}

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filter states
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'featured'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  // Usage statistics
  const [usageStats, setUsageStats] = useState<Record<string, number>>({})
  
  // Comparison state
  const [selectedToolsForComparison, setSelectedToolsForComparison] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  
  // Ratings and reviews state
  const [toolRatings, setToolRatings] = useState<Record<string, number>>({})
  const [toolReviews, setToolReviews] = useState<Record<string, Array<{user: string, rating: number, comment: string, date: string}>>>({})
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedToolForReview, setSelectedToolForReview] = useState<Tool | null>(null)
  const [newRating, setNewRating] = useState(5)
  const [newReview, setNewReview] = useState('')

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Search,
      Grid,
      Globe,
      Shield,
      Code,
      Image,
      Palette,
      Calculator,
      HashIcon,
      Database,
      FileText,
      Zap,
      GitCompare,
      BarChart3,
      Key,
      Volume2,
      Video,
      Monitor,
      Wifi,
      HardDrive,
      Cpu,
      Dice6,
      Calendar,
      QrCode,
      Upload,
      Settings,
      Binary,
      FileCode,
      Download,
      CheckCircle,
      Brain,
      Star,
      TrendingUp,
      Users,
      ZapIcon,
      ArrowRight,
      Sparkles,
      Grid3X3,
      LinkIcon,
      AlertCircle,
      RefreshCw,
      Loader2,
      X,
      Bot,
      Mail,
      CreditCard,
      DollarSign,
      Type,
      Hash,
      Filter,
      List
    }
    return iconMap[iconName] || Search
  }

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true)
        const [toolsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/tools'),
          fetch('/api/tools?categories=true')
        ])
        
        const toolsData = await toolsResponse.json()
        const categoriesData = await categoriesResponse.json()
        
        if (toolsData.success && categoriesData.success) {
          setTools(toolsData.data)
          
          // Add 'All Tools' category to the beginning
          const allToolsCategory = {
            id: 'all',
            name: 'All Tools',
            count: toolsData.data.length,
            icon: Grid3X3,
            description: 'Browse all available tools'
          }
          
          // Convert categories string array to Category objects
          const categoryObjects = categoriesData.data.map((categoryName: string) => ({
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName,
            count: toolsData.data.filter((tool: any) => tool.category === categoryName).length,
            icon: Grid3X3, // Default icon, can be customized per category
            description: `Browse ${categoryName.toLowerCase()} tools`
          }))
          
          setCategories(prev => [allToolsCategory, ...categoryObjects])
        }
      } catch (error) {
        console.error('Failed to fetch tools:', error)
        toast.error('Failed to load tools')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTools()
  }, [])

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tool-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    
    // Load usage stats from localStorage
    const savedStats = localStorage.getItem('tool-usage-stats')
    if (savedStats) {
      setUsageStats(JSON.parse(savedStats))
    }
    
    // Load ratings from localStorage
    const savedRatings = localStorage.getItem('tool-ratings')
    if (savedRatings) {
      setToolRatings(JSON.parse(savedRatings))
    }
    
    // Load reviews from localStorage
    const savedReviews = localStorage.getItem('tool-reviews')
    if (savedReviews) {
      setToolReviews(JSON.parse(savedReviews))
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        const searchInput = document.querySelector('input[placeholder="Search tools..."]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
      
      // Ctrl/Cmd + F for filters toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        setShowFilters(!showFilters)
      }
      
      // Escape to close filters and clear search
      if (event.key === 'Escape') {
        if (showFilters) {
          setShowFilters(false)
        } else if (searchQuery) {
          setSearchQuery('')
        }
      }
      
      // Arrow keys for navigation in grid view
      if (viewMode === 'grid' && !showFilters) {
        const tools = document.querySelectorAll('[data-tool-card]')
        const focusedElement = document.activeElement as HTMLElement
        
        if (focusedElement.closest('[data-tool-card]')) {
          const currentCard = focusedElement.closest('[data-tool-card]') as HTMLElement
          const currentIndex = Array.from(tools).indexOf(currentCard)
          
          switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
              event.preventDefault()
              const nextIndex = currentIndex + 1
              if (nextIndex < tools.length) {
                ;(tools[nextIndex] as HTMLElement).focus()
              }
              break
            case 'ArrowLeft':
            case 'ArrowUp':
              event.preventDefault()
              const prevIndex = currentIndex - 1
              if (prevIndex >= 0) {
                ;(tools[prevIndex] as HTMLElement).focus()
              }
              break
            case 'Enter':
            case ' ':
              event.preventDefault()
              currentCard.click()
              break
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showFilters, searchQuery, viewMode])

  useEffect(() => {
    // Filter tools based on search and category
    let filtered = tools

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(tool => tool.featured)
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(tool => favorites.includes(tool.name))
    }

    // Sort tools
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'popularity':
          const aPopularity = (a.featured ? 1 : 0) + (getUsageCount(a.name) > 0 ? 0.5 : 0)
          const bPopularity = (b.featured ? 1 : 0) + (getUsageCount(b.name) > 0 ? 0.5 : 0)
          comparison = aPopularity - bPopularity
          break
        case 'featured':
          const aFeatured = a.featured ? 1 : 0
          const bFeatured = b.featured ? 1 : 0
          comparison = aFeatured - bFeatured
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredTools(filtered)
  }, [tools, selectedCategory, searchQuery, showFeaturedOnly, sortBy, sortOrder, showFavoritesOnly, favorites])

  const handleToolClick = (tool: Tool) => {
    trackToolUsage(tool.name)
    toast.success(`Opening ${tool.name}...`)
    window.location.href = tool.path
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Tools refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh tools')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    
    // Smooth scroll to tools section
    const toolsSection = document.getElementById('tools-section')
    if (toolsSection) {
      toolsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const resetAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setShowFeaturedOnly(false)
    setShowFavoritesOnly(false)
    setSortBy('name')
    setSortOrder('asc')
  }

  const toggleFavorite = (toolName: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(toolName) 
        ? prev.filter(name => name !== toolName)
        : [...prev, toolName]
      
      // Save to localStorage
      localStorage.setItem('tool-favorites', JSON.stringify(newFavorites))
      
      return newFavorites
    })
  }

  const isFavorite = (toolName: string) => {
    return favorites.includes(toolName)
  }

  const trackToolUsage = (toolName: string) => {
    // Track usage stats
    setUsageStats(prev => {
      const newStats = {
        ...prev,
        [toolName]: (prev[toolName] || 0) + 1
      }
      
      // Save to localStorage
      localStorage.setItem('tool-usage-stats', JSON.stringify(newStats))
      
      return newStats
    })

    // Track activity
    const activity = {
      toolName,
      toolHref: tools.find(t => t.name === toolName)?.path || '#',
      timestamp: new Date().toISOString(),
      success: true
    }

    const savedActivity = localStorage.getItem('user-activity')
    const existingActivity = savedActivity ? JSON.parse(savedActivity) : []
    
    // Add new activity to the beginning and keep only last 50
    const updatedActivity = [activity, ...existingActivity].slice(0, 50)
    localStorage.setItem('user-activity', JSON.stringify(updatedActivity))
  }

  const getUsageCount = (toolName: string) => {
    return usageStats[toolName] || 0
  }

  const getRecentlyUsedTools = () => {
    const toolsWithUsage = tools.map(tool => ({
      ...tool,
      usageCount: getUsageCount(tool.name)
    })).filter(tool => tool.usageCount > 0)
    
    return toolsWithUsage
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
  }

  const toggleToolForComparison = (toolName: string) => {
    setSelectedToolsForComparison(prev => {
      if (prev.includes(toolName)) {
        return prev.filter(name => name !== toolName)
      } else if (prev.length < 3) {
        return [...prev, toolName]
      } else {
        toast.error('You can compare maximum 3 tools at once')
        return prev
      }
    })
  }

  const isToolSelectedForComparison = (toolName: string) => {
    return selectedToolsForComparison.includes(toolName)
  }

  const clearComparison = () => {
    setSelectedToolsForComparison([])
    setShowComparison(false)
  }

  const getToolsForComparison = () => {
    return tools.filter(tool => selectedToolsForComparison.includes(tool.name))
  }

  const getToolRating = (toolName: string) => {
    return toolRatings[toolName] || 0
  }

  const getToolReviews = (toolName: string) => {
    return toolReviews[toolName] || []
  }

  const submitRating = (toolName: string, rating: number) => {
    setToolRatings(prev => {
      const newRatings = {
        ...prev,
        [toolName]: rating
      }
      localStorage.setItem('tool-ratings', JSON.stringify(newRatings))
      return newRatings
    })
  }

  const submitReview = (toolName: string, rating: number, comment: string) => {
    setToolReviews(prev => {
      const newReviews = {
        ...prev,
        [toolName]: [
          ...(prev[toolName] || []),
          {
            user: 'Anonymous User',
            rating,
            comment,
            date: new Date().toLocaleDateString()
          }
        ]
      }
      localStorage.setItem('tool-reviews', JSON.stringify(newReviews))
      return newReviews
    })
    
    // Also update the rating
    submitRating(toolName, rating)
    setNewReview('')
    setShowReviewModal(false)
    setSelectedToolForReview(null)
    toast.success('Review submitted successfully!')
  }

  const openReviewModal = (tool: Tool) => {
    setSelectedToolForReview(tool)
    setShowReviewModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Zap className="h-6 w-6" />
                <span className="text-xl font-bold">ToolsHub</span>
              </Link>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {selectedToolsForComparison.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowComparison(true)}
                >
                  Compare ({selectedToolsForComparison.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {showFilters && <span className="ml-1 text-xs">(Active)</span>}
              </Button>
              {(searchQuery || selectedCategory !== 'all' || showFeaturedOnly || sortBy !== 'name' || showFavoritesOnly || selectedToolsForComparison.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetAllFilters()
                    clearComparison()
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => {
                  toast.info('Keyboard shortcuts: Ctrl+K (search), Ctrl+F (filters), Esc (clear/close)')
                }}
              >
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">?</kbd>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Free Online Tools</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover and use our collection of free online tools for all your needs. 
              From developers to designers, we've got you covered.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-8">
            <AdvancedSearch
              tools={tools}
              onSelect={handleToolClick}
              onSearch={(query, results) => {
                setSearchQuery(query)
                console.log(`Search: "${query}" - ${results.length} results`)
              }}
            />
          </div>

          {/* Comprehensive Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-muted/50 rounded-lg p-6 mb-8 border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.filter(c => c.id !== 'all').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: 'name' | 'popularity' | 'featured') => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Order</label>
                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Filters</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Featured only</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFavoritesOnly}
                        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Favorites only</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">
              Click on a category to filter tools
            </p>
          </div>
          
          <CategoryNavigation
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            className="mb-8"
          />
        </section>

        {/* Recently Used Tools Section */}
        {getRecentlyUsedTools().length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Recently Used</h2>
                <p className="text-muted-foreground">
                  Your most frequently used tools
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('tool-usage-stats')
                  setUsageStats({})
                  toast.success('Usage statistics cleared')
                }}
              >
                Clear Stats
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {getRecentlyUsedTools().map((tool, index) => {
                const IconComponent = tool.icon
                return (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      onClick={() => handleToolClick(tool)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 rounded-lg bg-muted">
                            <IconComponent className="h-6 w-6" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 truncate">
                          {tool.name}
                        </h3>
                        <div className="flex items-center justify-center space-x-1">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            {tool.usageCount} {tool.usageCount === 1 ? 'use' : 'uses'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* Tools Section */}
        <section id="tools-section">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedCategory === 'all' ? 'All Tools' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-muted-foreground">
                {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} found
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <div className="h-5 w-5 bg-muted-foreground/20 rounded"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                      <div className="h-3 bg-muted-foreground/10 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted-foreground/10 rounded"></div>
                    <div className="h-3 bg-muted-foreground/10 rounded w-5/6"></div>
                    <div className="h-3 bg-muted-foreground/10 rounded w-4/6"></div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="h-6 bg-muted-foreground/10 rounded w-16"></div>
                    <div className="h-8 bg-muted-foreground/10 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or selecting a different category
              </p>
              <Button onClick={resetAllFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              <AnimatePresence mode="wait">
                {filteredTools.map((tool, index) => {
                  const IconComponent = tool.icon
                  return (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      layout
                      data-tool-card
                      tabIndex={0}
                      className="outline-none"
                    >
                      <Card 
                        className={`h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                          tool.featured ? 'ring-2 ring-primary/20' : ''
                        }`}
                        onClick={() => handleToolClick(tool)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg leading-tight truncate">
                                  {tool.name}
                                </CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  {tool.featured && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                  {tool.popular && (
                                    <Badge variant="outline" className="text-xs">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Popular
                                    </Badge>
                                  )}
                                  {getUsageCount(tool.name) > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Zap className="h-3 w-3 mr-1" />
                                      {getUsageCount(tool.name)} uses
                                    </Badge>
                                  )}
                                  {getToolRating(tool.name) > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                                      {getToolRating(tool.name)}/5
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openReviewModal(tool)
                                }}
                                className="p-1 h-auto text-muted-foreground hover:text-foreground"
                                title="Rate & Review"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleToolForComparison(tool.name)
                                }}
                                className={`p-1 h-auto ${
                                  isToolSelectedForComparison(tool.name) 
                                    ? 'text-primary bg-primary/10' 
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                                disabled={selectedToolsForComparison.length >= 3 && !isToolSelectedForComparison(tool.name)}
                              >
                                <input
                                  type="checkbox"
                                  checked={isToolSelectedForComparison(tool.name)}
                                  onChange={() => {}}
                                  className="sr-only"
                                />
                                {isToolSelectedForComparison(tool.name) ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <div className="h-4 w-4 border-2 border-muted-foreground rounded" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(tool.name)
                                }}
                                className={`p-1 h-auto ${
                                  isFavorite(tool.name) 
                                    ? 'text-yellow-500 hover:text-yellow-600' 
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <Star 
                                  className={`h-4 w-4 ${
                                    isFavorite(tool.name) ? 'fill-current' : ''
                                  }`} 
                                />
                              </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm leading-relaxed mb-4">
                            {tool.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {tool.category}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              Open
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Comparison Modal */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-lg border max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Compare Tools</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearComparison}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1">
                  Comparing {getToolsForComparison().length} tools
                </p>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getToolsForComparison().map((tool, index) => {
                    const IconComponent = tool.icon
                    return (
                      <div key={tool.name} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{tool.name}</h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              {tool.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Featured:</span>
                              <div className="font-medium">
                                {tool.featured ? (
                                  <Badge variant="secondary" className="text-xs">Yes</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">No</Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Popular:</span>
                              <div className="font-medium">
                                {tool.popular ? (
                                  <Badge variant="outline" className="text-xs">Yes</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">No</Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Uses:</span>
                              <div className="font-medium">{getUsageCount(tool.name)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Favorites:</span>
                              <div className="font-medium">{favorites.filter(name => name === tool.name).length > 0 ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                          
                          <Button
                            className="w-full"
                            onClick={() => {
                              handleToolClick(tool)
                              setShowComparison(false)
                            }}
                          >
                            Open Tool
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedToolForReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-lg border max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Rate & Review</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1">
                  {selectedToolForReview.name}
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`h-6 w-6 ${
                            star <= newRating 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review</label>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Share your experience with this tool..."
                    className="w-full p-3 border rounded-md resize-none min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newReview.length}/500 characters
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => submitReview(selectedToolForReview.name, newRating, newReview)}
                    disabled={!newReview.trim()}
                    className="flex-1"
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stats Section */}
        <section className="mt-16 pt-16 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{tools.length}</div>
              <div className="text-sm text-muted-foreground">Total Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{categories.length - 1}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {tools.filter(t => t.featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {Object.keys(usageStats).length}
              </div>
              <div className="text-sm text-muted-foreground">Tracked Tools</div>
            </div>
          </div>
          
          {/* Usage Statistics */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Object.values(usageStats).reduce((sum, count) => sum + count, 0)}
                </div>
                <div className="text-muted-foreground">Total Uses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {getRecentlyUsedTools().length}
                </div>
                <div className="text-muted-foreground">Frequently Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round((Object.keys(usageStats).length / tools.length) * 100)}%
                </div>
                <div className="text-muted-foreground">Tools Tracked</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ToolsHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}