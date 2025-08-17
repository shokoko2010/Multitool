'use client'

import { useState, useEffect } from 'react'
import { Tool } from '@/data/tools'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Grid, List, ArrowRight, Tool as ToolIcon, Star, TrendingUp } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface CategoryStats {
  name: string
  count: number
  description: string
  icon: string
  popularTools: Tool[]
  color: string
}

const categoryDescriptions: Record<string, string> = {
  'development': 'Essential tools for software developers including code formatters, validators, and testing utilities.',
  'text': 'Text processing and manipulation tools for content creators and writers.',
  'conversion': 'Convert between different formats, encodings, and measurement units.',
  'validation': 'Validate and verify data formats, emails, URLs, and other inputs.',
  'generator': 'Generate various types of content, data, and test samples.',
  'math': 'Mathematical calculations, statistics, and number theory tools.',
  'time': 'Time zone converters, date calculators, and scheduling utilities.',
  'network': 'Network tools including IP lookup, port scanners, and DNS utilities.',
  'security': 'Security tools for encryption, hashing, and cybersecurity analysis.',
  'design': 'Design tools for colors, fonts, images, and visual assets.',
  'content': 'Content creation and optimization tools for writers and marketers.',
  'seo': 'Search engine optimization tools for website analysis and improvement.',
  'data': 'Data processing, analysis, and visualization tools.',
  'file': 'File manipulation, compression, and format conversion tools.',
  'system': 'System administration and monitoring utilities.',
  'communication': 'Communication and collaboration tools for teams.',
  'productivity': 'Productivity enhancement tools for workflow optimization.',
  'measurement': 'Unit converters and measurement calculation tools.',
  'finance': 'Financial calculators, currency converters, and investment tools.'
}

const categoryIcons: Record<string, string> = {
  'development': 'Code',
  'text': 'Type',
  'conversion': 'RefreshCw',
  'validation': 'CheckCircle',
  'generator': 'Zap',
  'math': 'Calculator',
  'time': 'Clock',
  'network': 'Globe',
  'security': 'Lock',
  'design': 'Palette',
  'content': 'FileText',
  'seo': 'TrendingUp',
  'data': 'Database',
  'file': 'File',
  'system': 'Settings',
  'communication': 'MessageSquare',
  'productivity': 'Target',
  'measurement': 'Ruler',
  'finance': 'DollarSign'
}

const categoryColors: Record<string, string> = {
  'development': 'bg-blue-100 text-blue-800',
  'text': 'bg-green-100 text-green-800',
  'conversion': 'bg-purple-100 text-purple-800',
  'validation': 'bg-red-100 text-red-800',
  'generator': 'bg-yellow-100 text-yellow-800',
  'math': 'bg-indigo-100 text-indigo-800',
  'time': 'bg-cyan-100 text-cyan-800',
  'network': 'bg-orange-100 text-orange-800',
  'security': 'bg-pink-100 text-pink-800',
  'design': 'bg-emerald-100 text-emerald-800',
  'content': 'bg-teal-100 text-teal-800',
  'seo': 'bg-amber-100 text-amber-800',
  'data': 'bg-violet-100 text-violet-800',
  'file': 'bg-slate-100 text-slate-800',
  'system': 'bg-zinc-100 text-zinc-800',
  'communication': 'bg-rose-100 text-rose-800',
  'productivity': 'bg-lime-100 text-lime-800',
  'measurement': 'bg-fuchsia-100 text-fuchsia-800',
  'finance': 'bg-rose-100 text-rose-800'
}

export default function CategoriesPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<CategoryStats[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools')
      const data = await response.json()
      if (data.success) {
        setTools(data.data)
        
        // Group tools by category and calculate stats
        const categoryMap = new Map<string, Tool[]>()
        data.data.forEach((tool: Tool) => {
          if (!categoryMap.has(tool.category)) {
            categoryMap.set(tool.category, [])
          }
          categoryMap.get(tool.category)?.push(tool)
        })

        // Create category stats
        const categoryStats = Array.from(categoryMap.entries()).map(([name, toolsInCategory]) => ({
          name,
          count: toolsInCategory.length,
          description: categoryDescriptions[name] || `Tools and utilities for ${name.toLowerCase()}.`,
          icon: categoryIcons[name] || 'Tool',
          popularTools: toolsInCategory.slice(0, 3), // Top 3 tools per category
          color: categoryColors[name] || 'bg-gray-100 text-gray-800'
        }))

        setCategories(categoryStats.sort((a, b) => b.count - a.count))
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getIconComponent = (iconName: string) => {
    // This would normally import the actual icon component
    // For now, we'll use a placeholder
    return <ToolIcon className="w-6 h-6" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading categories...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Tool Categories</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our comprehensive collection of 411+ tools organized into 19 specialized categories
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <ToolIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{tools.length}</p>
                    <p className="text-sm text-muted-foreground">Total Tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Grid className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(tools.length / categories.length)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Tools per Category</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Categories Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getIconComponent(category.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <Badge className={`mt-1 ${category.color}`}>
                            {category.count} tools
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {category.popularTools.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Popular Tools:</p>
                        <div className="space-y-1">
                          {category.popularTools.map((tool) => (
                            <div key={tool.id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{tool.name}</span>
                              <Star className="w-3 h-3 text-yellow-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-full mt-4" variant="outline">
                      Explore {category.name} Tools
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <Card key={category.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {getIconComponent(category.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{category.name}</h3>
                            <Badge className={category.color}>
                              {category.count} tools
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">
                            {category.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {category.popularTools.slice(0, 5).map((tool) => (
                              <Badge key={tool.id} variant="outline" className="text-xs">
                                {tool.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline">
                        View Tools
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found matching your search.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}