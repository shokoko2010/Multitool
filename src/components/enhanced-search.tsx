'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Clock, TrendingUp, Star, Settings, Hash, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tool } from '@/types/tool'
import toast from '@/lib/toast'

interface SearchSuggestion {
  id: string
  text: string
  type: 'tool' | 'category' | 'recent'
  category?: string
  icon?: any
  popular?: boolean
}

interface EnhancedSearchProps {
  tools: Tool[]
  onSelect?: (tool: Tool) => void
  className?: string
}

const mockSearchHistory: SearchSuggestion[] = [
  { id: '1', text: 'SEO Analyzer', type: 'recent' },
  { id: '2', text: 'Image Compressor', type: 'recent' },
  { id: '3', text: 'Password Generator', type: 'recent' },
]

const popularSearches: SearchSuggestion[] = [
  { id: 'p1', text: 'JSON Formatter', type: 'tool', category: 'development', icon: Settings, popular: true },
  { id: 'p2', text: 'QR Code Generator', type: 'tool', category: 'image', icon: QrCode, popular: true },
  { id: 'p3', text: 'Base64 Encoder', type: 'tool', category: 'text', icon: Hash, popular: true },
]

export function EnhancedSearch({ tools, onSelect, className }: EnhancedSearchProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>(mockSearchHistory)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([])
  const [popularSearchesList] = useState<SearchSuggestion[]>(popularSearches)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setSearchHistory(parsed.slice(0, 5)) // Keep only last 5 searches
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
  }, [])

  // Save search history to localStorage
  const saveSearchHistory = useCallback((newSearch: string) => {
    if (!newSearch.trim()) return
    
    const updatedHistory = [
      { id: Date.now().toString(), text: newSearch, type: 'recent' as const },
      ...searchHistory.filter(item => item.text !== newSearch)
    ].slice(0, 5)
    
    setSearchHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
  }, [searchHistory])

  // Generate search suggestions
  const generateSuggestions = useCallback((searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery.trim()) {
      return [
        ...recentSearches,
        ...popularSearchesList
      ]
    }

    const query = searchQuery.toLowerCase()
    const toolMatches = tools
      .filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(tool => ({
        id: tool.href,
        text: tool.name,
        type: 'tool' as const,
        category: tool.category,
        icon: tool.icon
      }))

    const categoryMatches = tools
      .filter(tool => tool.category.toLowerCase().includes(query))
      .filter((tool, index, self) => self.findIndex(t => t.category === tool.category) === index)
      .slice(0, 3)
      .map(tool => ({
        id: `category-${tool.category}`,
        text: tool.category,
        type: 'category' as const,
        category: tool.category
      }))

    return [...toolMatches, ...categoryMatches]
  }, [tools, recentSearches, popularSearchesList])

  // Handle search input
  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.trim()) {
      setIsLoading(true)
      setTimeout(() => {
        const newSuggestions = generateSuggestions(value)
        setSuggestions(newSuggestions)
        setIsLoading(false)
      }, 300)
    } else {
      setSuggestions([])
    }
  }

  // Handle search
  const handleSearch = (searchTerm: string = query) => {
    if (!searchTerm.trim()) {
      toast.warning('Please enter a search term')
      return
    }

    saveSearchHistory(searchTerm)
    setShowSuggestions(false)

    // Find matching tool
    const matchingTool = tools.find(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (matchingTool) {
      onSelect?.(matchingTool)
      toast.success(`Navigating to ${matchingTool.name}`)
    } else {
      toast.info('No tools found for your search')
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
          if (suggestion.type === 'tool') {
            const tool = tools.find(t => t.href === suggestion.id)
            if (tool && onSelect) {
              onSelect(tool)
            }
          } else {
            setQuery(suggestion.text)
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
    if (suggestion.type === 'tool') {
      const tool = tools.find(t => t.href === suggestion.id)
      if (tool && onSelect) {
        onSelect(tool)
      }
    } else {
      setQuery(suggestion.text)
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

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query && setShowSuggestions(true)}
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
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ) : suggestions.length === 0 && query ? (
              <div className="p-4 text-center text-muted-foreground">
                No suggestions found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    className={`w-full p-3 text-left hover:bg-muted transition-colors flex items-center gap-3 ${
                      index === selectedIndex ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex-shrink-0">
                      {suggestion.type === 'tool' ? (
                        <suggestion.icon className="h-4 w-4 text-primary" />
                      ) : suggestion.type === 'category' ? (
                        <div className="w-4 h-4 bg-primary/20 rounded" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.text}</div>
                      {suggestion.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {suggestion.category}
                        </Badge>
                      )}
                    </div>
                    {suggestion.popular && (
                      <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                    {suggestion.type === 'recent' && (
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}