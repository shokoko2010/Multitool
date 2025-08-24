'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, SortAsc, SortDesc, Grid, List, X, Clock, Star, Users, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Tool } from '@/types/tool'

interface AdvancedSearchProps {
  tools: Tool[]
  onResultsChange: (results: Tool[]) => void
  className?: string
}

interface SearchFilters {
  categories: string[]
  featuredOnly: boolean
  hasTags: boolean
  sortBy: 'relevance' | 'name' | 'category' | 'featured'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
}

interface SearchState {
  query: string
  filters: SearchFilters
  results: Tool[]
  isSearching: boolean
}

export function AdvancedSearch({ tools, onResultsChange, className }: AdvancedSearchProps) {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {
      categories: [],
      featuredOnly: false,
      hasTags: false,
      sortBy: 'relevance',
      sortOrder: 'desc',
      viewMode: 'grid'
    },
    results: [],
    isSearching: false
  })

  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = [...new Set(tools.map(tool => tool.category))]
    return categories.sort()
  }, [tools])

  // Get popular tags
  const popularTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    tools.forEach(tool => {
      tool.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag)
  }, [tools])

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('advancedSearchHistory')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved).slice(0, 10))
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
  }, [])

  // Save search to history
  const saveToHistory = (query: string) => {
    if (!query.trim()) return
    
    const updatedHistory = [
      query,
      ...searchHistory.filter(q => q !== query)
    ].slice(0, 10)
    
    setSearchHistory(updatedHistory)
    localStorage.setItem('advancedSearchHistory', JSON.stringify(updatedHistory))
  }

  // Perform search
  const performSearch = (query: string, filters: SearchFilters) => {
    setSearchState(prev => ({ ...prev, isSearching: true }))

    // Simulate search delay for better UX
    setTimeout(() => {
      let results = [...tools]

      // Filter by query
      if (query.trim()) {
        const queryLower = query.toLowerCase()
        results = results.filter(tool =>
          tool.name.toLowerCase().includes(queryLower) ||
          tool.description.toLowerCase().includes(queryLower) ||
          tool.category.toLowerCase().includes(queryLower) ||
          tool.tags?.some(tag => tag.toLowerCase().includes(queryLower))
        )
      }

      // Filter by categories
      if (filters.categories.length > 0) {
        results = results.filter(tool => filters.categories.includes(tool.category))
      }

      // Filter by featured only
      if (filters.featuredOnly) {
        results = results.filter(tool => tool.featured)
      }

      // Filter by has tags
      if (filters.hasTags) {
        results = results.filter(tool => tool.tags && tool.tags.length > 0)
      }

      // Sort results
      if (filters.sortBy === 'relevance' && query.trim()) {
        const queryLower = query.toLowerCase()
        results.sort((a, b) => {
          const aScore = calculateRelevanceScore(a, queryLower)
          const bScore = calculateRelevanceScore(b, queryLower)
          return filters.sortOrder === 'desc' ? bScore - aScore : aScore - bScore
        })
      } else {
        results.sort((a, b) => {
          let comparison = 0
          switch (filters.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'category':
              comparison = a.category.localeCompare(b.category)
              break
            case 'featured':
              comparison = (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
              break
            default:
              comparison = 0
          }
          return filters.sortOrder === 'desc' ? -comparison : comparison
        })
      }

      setSearchState(prev => ({
        ...prev,
        results,
        isSearching: false
      }))

      onResultsChange(results)
    }, 300)
  }

  // Calculate relevance score for sorting
  const calculateRelevanceScore = (tool: Tool, query: string): number => {
    let score = 0
    
    // Exact name match gets highest score
    if (tool.name.toLowerCase() === query) {
      score += 100
    } else if (tool.name.toLowerCase().includes(query)) {
      score += 50
    }
    
    // Description match
    if (tool.description.toLowerCase().includes(query)) {
      score += 30
    }
    
    // Category match
    if (tool.category.toLowerCase().includes(query)) {
      score += 20
    }
    
    // Tag matches
    tool.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        score += 10
      }
    })
    
    // Featured tools get bonus
    if (tool.featured) {
      score += 5
    }
    
    return score
  }

  // Handle search input
  const handleSearchInput = (query: string) => {
    setSearchState(prev => ({ ...prev, query }))
    performSearch(query, searchState.filters)
  }

  // Handle filter change
  const handleFilterChange = (filters: Partial<SearchFilters>) => {
    const newFilters = { ...searchState.filters, ...filters }
    setSearchState(prev => ({ ...prev, filters: newFilters }))
    performSearch(searchState.query, newFilters)
  }

  // Handle category filter toggle
  const toggleCategory = (category: string) => {
    const categories = searchState.filters.categories.includes(category)
      ? searchState.filters.categories.filter(c => c !== category)
      : [...searchState.filters.categories, category]
    
    handleFilterChange({ categories })
  }

  // Clear all filters
  const clearFilters = () => {
    const newFilters: SearchFilters = {
      categories: [],
      featuredOnly: false,
      hasTags: false,
      sortBy: 'relevance',
      sortOrder: 'desc',
      viewMode: 'grid'
    }
    handleFilterChange(newFilters)
  }

  // Quick search from history
  const quickSearch = (query: string) => {
    handleSearchInput(query)
    saveToHistory(query)
  }

  // Get active filters count
  const activeFiltersCount = [
    searchState.filters.categories.length > 0,
    searchState.filters.featuredOnly,
    searchState.filters.hasTags
  ].filter(Boolean).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Header */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search tools by name, description, category, or tags..."
            value={searchState.query}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchState.query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => handleSearchInput('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        <Select
          value={searchState.filters.viewMode}
          onValueChange={(value: 'grid' | 'list') => handleFilterChange({ viewMode: value })}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">
              <Grid className="h-4 w-4 mr-2 inline" />
              Grid
            </SelectItem>
            <SelectItem value="list">
              <List className="h-4 w-4 mr-2 inline" />
              List
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !searchState.query && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Recent:</span>
          {searchHistory.map((query, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => quickSearch(query)}
            >
              <Clock className="h-3 w-3 mr-1" />
              {query}
            </Badge>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories Filter */}
            <div>
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allCategories.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={searchState.filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Options Filter */}
            <div>
              <h4 className="font-medium mb-3">Options</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={searchState.filters.featuredOnly}
                    onCheckedChange={(checked) => handleFilterChange({ featuredOnly: !!checked })}
                  />
                  <span className="text-sm">Featured tools only</span>
                  <Star className="h-4 w-4 text-yellow-500 ml-1" />
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={searchState.filters.hasTags}
                    onCheckedChange={(checked) => handleFilterChange({ hasTags: !!checked })}
                  />
                  <span className="text-sm">Tools with tags</span>
                </label>
              </div>
            </div>

            <Separator />

            {/* Sorting */}
            <div>
              <h4 className="font-medium mb-3">Sort By</h4>
              <div className="flex gap-2">
                <Select
                  value={searchState.filters.sortBy}
                  onValueChange={(value: SearchFilters['sortBy']) => handleFilterChange({ sortBy: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={searchState.filters.sortOrder}
                  onValueChange={(value: SearchFilters['sortOrder']) => handleFilterChange({ sortOrder: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">
                      <SortDesc className="h-4 w-4 mr-2 inline" />
                      Desc
                    </SelectItem>
                    <SelectItem value="asc">
                      <SortAsc className="h-4 w-4 mr-2 inline" />
                      Asc
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Popular Tags</h4>
                  <div className="flex gap-2 flex-wrap">
                    {popularTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleSearchInput(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {searchState.query && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {searchState.isSearching ? (
              <span>Searching...</span>
            ) : (
              <span>
                Found {searchState.results.length} tool{searchState.results.length !== 1 ? 's' : ''}
                {searchState.query && ` for "${searchState.query}"`}
              </span>
            )}
          </div>
          
          {searchState.results.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>{searchState.results.filter(t => t.featured).length} featured</span>
              <Users className="h-4 w-4 ml-2" />
              <span>{searchState.results.filter(t => t.tags && t.tags.length > 0).length} with tags</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}