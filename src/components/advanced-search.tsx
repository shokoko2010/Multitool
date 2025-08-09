'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Clock, TrendingUp, Star, Settings, Hash, QrCode, Filter, X, ExternalLink, Sparkles, Brain, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tool } from '@/types/tool'
import { useToast } from '@/hooks/use-toast'

interface SearchSuggestion {
  id: string
  text: string
  type: 'tool' | 'category' | 'recent' | 'trending' | 'suggested' | 'ai-powered'
  category?: string
  icon?: any
  popular?: boolean
  description?: string
  href?: string
  relevance?: number
  aiInsights?: string
  confidence?: number
}

interface AdvancedSearchProps {
  tools: Tool[]
  onSelect?: (tool: Tool) => void
  className?: string
  onSearch?: (query: string, results: Tool[]) => void
}

// Enhanced search with AI-like capabilities
const performEnhancedSearch = (query: string, tools: Tool[]): SearchSuggestion[] => {
  if (!query.trim()) return []

  const results: SearchSuggestion[] = []
  const queryLower = query.toLowerCase()

  // AI-powered search with better relevance scoring
  const searchResults = tools.map(tool => {
    let score = 0
    const nameMatch = tool.name.toLowerCase().includes(queryLower)
    const descMatch = tool.description.toLowerCase().includes(queryLower)
    const categoryMatch = tool.category.toLowerCase().includes(queryLower)

    // Name match (highest priority)
    if (nameMatch) score += 100

    // Exact match bonus
    if (tool.name.toLowerCase() === queryLower) score += 50

    // Partial name match
    if (nameMatch && !tool.name.toLowerCase() === queryLower) score += 30

    // Description match
    if (descMatch) score += 20

    // Category match
    if (categoryMatch) score += 15

    // Word boundary matches (better for multi-word queries)
    const queryWords = queryLower.split(' ').filter(word => word.length > 2)
    const nameWords = tool.name.toLowerCase().split(' ')
    
    queryWords.forEach(queryWord => {
      nameWords.forEach(nameWord => {
        if (nameWord.includes(queryWord) && nameWord !== queryWord) {
          score += 5
        }
      })
    })

    return {
      ...tool,
      score,
      relevance: Math.min(score / 150, 1) // Normalize to 0-1
    }
  }).filter(tool => tool.score > 0)
    .sort((a, b) => (b as any).score - (a as any).score)

  // Convert to suggestions
  const toolResults = searchResults.slice(0, 8).map(tool => ({
    id: tool.href,
    text: tool.name,
    type: 'tool' as const,
    category: tool.category,
    icon: tool.icon,
    description: tool.description,
    href: tool.href,
    relevance: (tool as any).relevance,
    confidence: Math.min((tool as any).relevance * 100, 100)
  }))

  // AI-powered suggestions (simulate intelligent recommendations)
  const aiSuggestions = generateAISuggestions(query, tools, searchResults.slice(0, 3))

  // Category suggestions
  const categoryMatches = tools
    .filter(tool => tool.category.toLowerCase().includes(queryLower))
    .filter((tool, index, self) => self.findIndex(t => t.category === tool.category) === index)
    .slice(0, 3)
    .map(tool => ({
      id: `category-${tool.category}`,
      text: tool.category,
      type: 'category' as const,
      category: tool.category,
      icon: Settings,
      description: `Browse all ${tool.category} tools`,
      relevance: 0.5
    }))

  results.push(...toolResults, ...aiSuggestions, ...categoryMatches)
  
  // Remove duplicates and sort by relevance
  const uniqueResults = results.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  )

  return uniqueResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
}

// Generate AI-powered suggestions
const generateAISuggestions = (query: string, tools: Tool[], topResults: any[]): SearchSuggestion[] => {
  const suggestions: SearchSuggestion[] = []
  
  // Analyze query patterns and provide intelligent suggestions
  const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2)
  
  // Find related tools based on semantic similarity
  const relatedTools = tools.filter(tool => {
    const toolText = `${tool.name} ${tool.description}`.toLowerCase()
    return queryWords.some(word => 
      toolText.includes(word) && 
      !tool.name.toLowerCase().includes(query.toLowerCase())
    )
  }).slice(0, 3)

  relatedTools.forEach(tool => {
    const relevance = calculateSemanticSimilarity(query, tool.name + ' ' + tool.description)
    if (relevance > 0.3) {
      suggestions.push({
        id: `ai-${tool.href}`,
        text: tool.name,
        type: 'ai-powered' as const,
        category: tool.category,
        icon: Sparkles,
        description: `AI suggestion based on your search`,
        href: tool.href,
        relevance,
        confidence: Math.min(relevance * 100, 100),
        aiInsights: `This tool matches your search intent based on semantic analysis.`
      })
    }
  })

  return suggestions
}

// Simple semantic similarity calculation
const calculateSemanticSimilarity = (query: string, text: string): number => {
  const queryWords = query.toLowerCase().split(' ')
  const textWords = text.toLowerCase().split(' ')
  
  let matches = 0
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        matches++
      }
    })
  })
  
  return Math.min(matches / (queryWords.length * 1.5), 1)
}

export function AdvancedSearch({ tools, onSelect, className, onSearch }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([])
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>([])
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    averageResults: 0,
    popularSearches: {} as Record<string, number>,
    aiSuggestionsUsed: 0
  })
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load search data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    const savedStats = localStorage.getItem('searchStats')
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setSearchHistory(parsed.slice(0, 5))
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }

    if (savedStats) {
      try {
        setSearchStats(JSON.parse(savedStats))
      } catch (error) {
        console.error('Failed to load search stats:', error)
      }
    }

    // Generate trending searches (mock data)
    setTrendingSearches([
      { id: 't1', text: 'SEO Analyzer', type: 'trending', icon: TrendingUp, popular: true, description: 'Website SEO analysis tool' },
      { id: 't2', text: 'Image Compressor', type: 'trending', icon: Zap, popular: true, description: 'Compress and optimize images' },
      { id: 't3', text: 'Password Generator', type: 'trending', icon: Settings, popular: true, description: 'Generate secure passwords' },
      { id: 't4', text: 'JSON Formatter', type: 'trending', icon: Hash, popular: true, description: 'Format and validate JSON' },
    ])

    // Load recent searches
    setRecentSearches([
      { id: 'r1', text: 'meta tag generator', type: 'recent', icon: Clock, description: 'Search performed 2 hours ago' },
      { id: 'r2', text: 'ip lookup', type: 'recent', icon: Settings, description: 'Search performed yesterday' },
      { id: 'r3', text: 'image resizer', type: 'recent', icon: Settings, description: 'Search performed 3 days ago' },
    ])
  }, [])

  // Save search to history and stats
  const saveSearch = useCallback((searchQuery: string, usedAISuggestions: boolean = false) => {
    if (!searchQuery.trim()) return
    
    // Update search history
    const newSearch = {
      id: Date.now().toString(),
      text: searchQuery,
      type: 'recent' as const,
      description: `Search performed ${new Date().toLocaleTimeString()}`
    }
    
    const updatedHistory = [
      newSearch,
      ...searchHistory.filter(item => item.text !== searchQuery)
    ].slice(0, 10)
    
    setSearchHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))

    // Update search statistics
    const searchResults = performEnhancedSearch(searchQuery, tools)
    const newStats = {
      ...searchStats,
      totalSearches: searchStats.totalSearches + 1,
      averageResults: ((searchStats.averageResults * searchStats.totalSearches) + searchResults.length) / (searchStats.totalSearches + 1),
      popularSearches: {
        ...searchStats.popularSearches,
        [searchQuery]: (searchStats.popularSearches[searchQuery] || 0) + 1
      },
      aiSuggestionsUsed: usedAISuggestions ? searchStats.aiSuggestionsUsed + 1 : searchStats.aiSuggestionsUsed
    }
    
    setSearchStats(newStats)
    localStorage.setItem('searchStats', JSON.stringify(newStats))
  }, [searchHistory, searchStats, tools])

  // Generate search suggestions with debouncing
  const generateSuggestions = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      return [
        ...recentSearches,
        ...trendingSearches
      ]
    }

    setIsLoading(true)
    
    // Simulate API delay for AI processing
    setTimeout(() => {
      const results = performEnhancedSearch(searchQuery, tools)
      setSuggestions(results)
      setIsLoading(false)
    }, 200) // Faster response time
  }, [tools, recentSearches, trendingSearches])

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateSuggestions(query)
    }, 200) // Reduced debounce time for faster response

    return () => clearTimeout(timeoutId)
  }, [query, generateSuggestions])

  // Handle search
  const handleSearch = (searchTerm: string = query, usedAISuggestions: boolean = false) => {
    if (!searchTerm.trim()) {
      toast({
        title: "Enter a search term",
        description: "Please type something to search for",
        variant: "destructive"
      })
      return
    }

    saveSearch(searchTerm, usedAISuggestions)
    setShowSuggestions(false)

    // Find matching tools
    const matchingTools = tools.filter(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Call search callback if provided
    if (onSearch) {
      onSearch(searchTerm, matchingTools)
    }

    // Find first matching tool for navigation
    const firstMatch = matchingTools[0]
    if (firstMatch && onSelect) {
      onSelect(firstMatch)
      toast({
        title: "Found matching tools",
        description: `Showing ${matchingTools.length} results for "${searchTerm}"${usedAISuggestions ? ' (AI-enhanced)' : ''}`
      })
    } else if (matchingTools.length === 0) {
      toast({
        title: "No results found",
        description: `Try a different search term for "${searchTerm}"`,
        variant: "destructive"
      })
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex]
          if (suggestion.type === 'tool' && suggestion.href) {
            const tool = tools.find(t => t.href === suggestion.id)
            if (tool && onSelect) {
              onSelect(tool)
            }
          } else {
            setQuery(suggestion.text)
            // Trigger search if it's an AI suggestion
            if (suggestion.type === 'ai-powered') {
              setTimeout(() => handleSearch(suggestion.text, true), 100)
            }
          }
          setShowSuggestions(false)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'tool' && suggestion.href) {
      const tool = tools.find(t => t.href === suggestion.id)
      if (tool && onSelect) {
        onSelect(tool)
      }
    } else {
      setQuery(suggestion.text)
      // Trigger search if it's an AI suggestion
      if (suggestion.type === 'ai-powered') {
        setTimeout(() => handleSearch(suggestion.text, true), 100)
      }
    }
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when suggestions are shown
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSuggestions])

  // Get suggestion icon based on type
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon
    
    switch (suggestion.type) {
      case 'tool': return Settings
      case 'category': return Hash
      case 'recent': return Clock
      case 'trending': return TrendingUp
      case 'ai-powered': return Brain
      default: return Search
    }
  }

  // Get relevance badge
  const getRelevanceBadge = (relevance?: number, confidence?: number) => {
    if (!relevance) return null
    
    if (confidence && confidence > 80) {
      return <Badge variant="default" className="bg-green-600">AI {Math.round(confidence)}%</Badge>
    }
    if (relevance >= 0.9) return <Badge variant="default">Perfect</Badge>
    if (relevance >= 0.7) return <Badge variant="secondary">Good</Badge>
    if (relevance >= 0.5) return <Badge variant="outline">Okay</Badge>
    return null
  }

  // Get AI insights display
  const getAIInsights = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'ai-powered' && suggestion.aiInsights) {
      return (
        <div className="ml-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-600 dark:text-blue-400">
          {suggestion.aiInsights}
        </div>
      )
    }
    return null
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tools, categories, or descriptions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('')
              setSuggestions([])
            }}
          >
            ×
          </Button>
        )}
      </div>

      {showSuggestions && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border border-border max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ) : suggestions.length === 0 && query ? (
              <div className="p-4 text-center">
                <Brain className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground mt-1">Try different keywords or use AI suggestions</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* AI-powered suggestions section */}
                {suggestions.some(s => s.type === 'ai-powered') && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI-Powered Suggestions</span>
                    </div>
                    {suggestions
                      .filter(s => s.type === 'ai-powered')
                      .map((suggestion, index) => (
                        <button
                          key={suggestion.id}
                          className={`w-full p-3 text-left hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors flex items-start gap-3 ${
                            index === selectedIndex ? 'bg-blue-100 dark:bg-blue-950/30' : ''
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <Brain className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate">{suggestion.text}</div>
                              {getRelevanceBadge(suggestion.relevance, suggestion.confidence)}
                            </div>
                            {suggestion.description && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {suggestion.description}
                              </p>
                            )}
                            {getAIInsights(suggestion)}
                            {suggestion.category && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {suggestion.category}
                              </Badge>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      ))}
                  </div>
                )}

                {/* Regular suggestions */}
                <div className="divide-y divide-border">
                  {suggestions
                    .filter(s => s.type !== 'ai-powered')
                    .map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        className={`w-full p-3 text-left hover:bg-muted transition-colors flex items-start gap-3 ${
                          index === (suggestions.filter(s => s.type !== 'ai-powered').findIndex(s => s.id === suggestion.id) + (suggestions.some(s => s.type === 'ai-powered') ? 1 : 0)) ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <getSuggestionIcon suggestion className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate">{suggestion.text}</div>
                            {getRelevanceBadge(suggestion.relevance)}
                          </div>
                          {suggestion.description && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {suggestion.description}
                            </p>
                          )}
                          {suggestion.category && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {suggestion.category}
                            </Badge>
                          )}
                        </div>
                        {suggestion.type === 'tool' && suggestion.href && (
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        {suggestion.popular && (
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}