"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedCard, EnhancedButton, StaggerContainer } from '@/components/ui-enhanced'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tool, ToolCategory } from '@/types/tool'
import { Search, Filter, Grid, List, Star, TrendingUp, Zap, Shield, Code, Palette, ArrowRight, Globe, Settings, Calculator, Hash } from 'lucide-react'

interface EnhancedToolsShowcaseProps {
  tools: Tool[]
  categories: ToolCategory[]
}

export function EnhancedToolsShowcase({ tools, categories }: EnhancedToolsShowcaseProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'featured'>('popular')

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort tools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [tools, searchQuery, selectedCategory, sortBy])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    tools.forEach(tool => {
      counts[tool.category] = (counts[tool.category] || 0) + 1
    })
    return counts
  }, [tools])

  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      network: Globe,
      security: Shield,
      text: Code,
      image: Palette,
      seo: TrendingUp,
      ai: Zap,
      development: Settings,
      converters: Calculator,
      cryptography: Hash,
    }
    return iconMap[categoryId] || Grid
  }

  const handleToolClick = (tool: Tool) => {
    // In a real app, this would navigate to the tool page
    window.open(tool.href, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </Button>
            <Button
              variant={sortBy === 'featured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('featured')}
            >
              <Star className="h-4 w-4 mr-2" />
              Featured
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All ({tools.length})
          </Button>
          {categories.map((category) => {
            const count = categoryCounts[category.id] || 0
            const Icon = getCategoryIcon(category.id)
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.name} ({count})
              </Button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTools.length} of {tools.length} tools
      </div>

      {/* Tools Grid/List */}
      {filteredTools.length > 0 ? (
        <StaggerContainer className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredTools.map((tool, index) => {
            const Icon = getCategoryIcon(tool.category)
            
            if (viewMode === 'grid') {
              return (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <EnhancedCard
                    className="h-full cursor-pointer group"
                    onClick={() => handleToolClick(tool)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {tool.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {tool.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {tool.popular && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>

                      {/* Title and Description */}
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {tool.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {tool.description}
                      </p>

                      {/* Footer */}
                      <div className="pt-4 border-t">
                        <EnhancedButton size="sm" className="w-full group">
                          Open Tool
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </EnhancedButton>
                      </div>
                    </div>
                  </EnhancedCard>
                </motion.div>
              )
            } else {
              return (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <EnhancedCard
                    className="cursor-pointer group"
                    onClick={() => handleToolClick(tool)}
                  >
                    <div className="p-4 flex items-center space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">{tool.name}</h3>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {tool.category}
                          </Badge>
                          <div className="flex items-center space-x-1 ml-auto">
                            {tool.featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {tool.popular && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                      <EnhancedButton size="sm">
                        Open
                      </EnhancedButton>
                    </div>
                  </EnhancedCard>
                </motion.div>
              )
            }
          })}
        </StaggerContainer>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </motion.div>
      )}
    </div>
  )
}