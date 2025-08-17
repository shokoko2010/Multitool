'use client'

import { useState, useEffect } from 'react'
import { Tool } from '@/data/tools'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Bot, Mail, CreditCard, DollarSign, Type, Hash, Calculator, Palette, Image, Clock, Globe, Ruler, Weight, Thermometer, Gauge, Lock, File, Tag, Code, FileText, Braces, Fingerprint, Key, Dice1, Wifi, Server, Link, Percent, Calendar, FileSpreadsheet, FileJson, FileCode, Shield, Copy, RotateCcw, AlignLeft, Scissors, Unlock, Upload, GitCompare, AtSign, BarChart, BarChart3, Binary, Camera, CheckCircle, Computer, Divide, ExternalLink, Eye, FlaskConical, Frown, GitBranch, Languages, ListOrdered, Merge, MessageCircle, Mic, Phone, PiggyBank, QrCode, Radio, RotateCw, Scan, ScanBarcode, Share, Smartphone, Smile, Square, Timer, Trash2, User, Volume2, Wrench, Youtube, Zap, ZapOff, Database } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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
  Merge,
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
  Square,
  Timer,
  Trash2,
  User,
  Volume2,
  Wrench,
  Youtube,
  Zap,
  ZapOff,
  Database,
  Tool: Search
}

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchTools()
  }, [])

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
      const response = await fetch('/api/tools')
      const data = await response.json()
      if (data.success) {
        setTools(data.data)
        
        // Set featured tools (tools with featured: true)
        const featured = data.data.filter((tool: Tool) => tool.featured)
        setFeaturedTools(featured.slice(0, 6)) // Show max 6 featured tools
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/tools?categories=true')
        const categoriesData = await categoriesResponse.json()
        if (categoriesData.success) {
          setCategories(['all', ...categoriesData.data])
        }
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <img
            src="/logo.svg"
            alt="Z.ai Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-lg">Loading tools...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6">
              <img
                src="/logo.svg"
                alt="Z.ai Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Z.ai MultiTool
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8">
              A comprehensive collection of 411+ tools for developers, designers, and content creators
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
          {!loading && featuredTools.length > 0 && (
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
                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {tool.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tool.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
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
            <div className="relative max-w-md mx-auto">
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

          {/* Stats Section */}
          {!loading && (
            <div className="mt-12 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{tools.length}+</div>
                  <div className="text-sm text-muted-foreground">Tools</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{categories.length - 1}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{featuredTools.length}</div>
                  <div className="text-sm text-muted-foreground">Featured</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">AI</div>
                  <div className="text-sm text-muted-foreground">Powered</div>
                </div>
              </div>
              <p className="text-muted-foreground mt-6">
                Showing {filteredTools.length} of {tools.length} tools
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}