'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Star, 
  ExternalLink, 
  Keyboard,
  Sparkles,
  Zap,
  Filter,
  X,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClickOutside } from '@/hooks/use-click-outside'

interface Tool {
  id: string
  name: string
  href: string
  description: string
  category: string
  icon: any
  featured?: boolean
  popular?: boolean
  lastUsed?: Date
  usageCount?: number
  tags?: string[]
  aliases?: string[]
}

interface ToolsSearchProps {
  tools: Tool[]
  onSelect?: (tool: Tool) => void
  className?: string
}

// Simple fuzzy search implementation
function fuzzySearch(query: string, text: string): number {
  if (!query || !text) return 0
  
  query = query.toLowerCase()
  text = text.toLowerCase()
  
  let score = 0
  let queryIndex = 0
  let consecutiveMatches = 0
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      score += 10 + consecutiveMatches * 5 // Bonus for consecutive matches
      consecutiveMatches++
      queryIndex++
    } else {
      consecutiveMatches = 0
    }
  }
  
  // If we matched the whole query, give a big bonus
  if (queryIndex === query.length) {
    score += 100
    
    // Bonus for exact match at start
    if (text.startsWith(query)) {
      score += 50
    }
    
    // Bonus for exact match of whole word
    const words = text.split(/\s+/)
    if (words.some(word => word === query)) {
      score += 30
    }
  }
  
  return score
}

export function EnhancedToolsSearch({ tools, onSelect, className = '' }: ToolsSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [recentTools, setRecentTools] = useState<Tool[]>([])
  const [popularTools, setPopularTools] = useState<Tool[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useClickOutside(searchRef, () => setIsOpen(false))

  // Load user's recent and favorite tools from localStorage
  useEffect(() => {
    try {
      const recentToolsData = JSON.parse(localStorage.getItem('recentTools') || '[]')
      const popularToolsData = JSON.parse(localStorage.getItem('popularTools') || '[]')
      
      const recentToolsMap = new Map(recentToolsData)
      const popularToolsMap = new Map(popularToolsData)
      
      // Get actual tool objects from IDs
      const actualRecentTools = Array.from(recentToolsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, timestamp]) => {
          const tool = tools.find(t => t.id === id)
          return tool ? { ...tool, lastUsed: new Date(timestamp) } : null
        })
        .filter(Boolean) as Tool[]
      
      const actualPopularTools = Array.from(popularToolsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id, count]) => {
          const tool = tools.find(t => t.id === id)
          return tool ? { ...tool, usageCount: count } : null
        })
        .filter(Boolean) as Tool[]
      
      setRecentTools(actualRecentTools)
      setPopularTools(actualPopularTools)
    } catch (error) {
      console.error('Error loading tools from localStorage:', error)
    }
  }, [tools])

  // Enhanced search with fuzzy matching and smart ranking
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilteredTools([])
      return
    }

    setIsLoading(true)
    
    // Simulate async search for better UX
    setTimeout(() => {
      const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
      
      const scoredTools = tools.map(tool => {
        let totalScore = 0
        let matchFields: string[] = []
        
        // Name matching (highest weight)
        const nameScore = fuzzySearch(searchQuery, tool.name)
        totalScore += nameScore * 3
        if (nameScore > 0) matchFields.push('name')
        
        // Description matching
        const descScore = fuzzySearch(searchQuery, tool.description)
        totalScore += descScore * 2
        if (descScore > 0) matchFields.push('description')
        
        // Category matching
        const catScore = fuzzySearch(searchQuery, tool.category)
        totalScore += catScore * 1.5
        if (catScore > 0) matchFields.push('category')
        
        // Tags matching
        if (tool.tags) {
          tool.tags.forEach(tag => {
            const tagScore = fuzzySearch(searchQuery, tag)
            totalScore += tagScore * 1
            if (tagScore > 0) matchFields.push('tag')
          })
        }
        
        // Aliases matching
        if (tool.aliases) {
          tool.aliases.forEach(alias => {
            const aliasScore = fuzzySearch(searchQuery, alias)
            totalScore += aliasScore * 2.5
            if (aliasScore > 0) matchFields.push('alias')
          })
        }
        
        // Bonus for featured/popular tools
        if (tool.featured) totalScore += 20
        if (tool.popular) totalScore += 15
        
        // Usage count boost
        totalScore += (tool.usageCount || 0) * 0.01
        
        return {
          tool,
          score: totalScore,
          matchFields: [...new Set(matchFields)]
        }
      })
      
      // Filter out tools with zero scores
      const validResults = scoredTools.filter(result => result.score > 0)
      
      // Sort by score (descending)
      validResults.sort((a, b) => b.score - a.score)
      
      // Limit to top 12 results
      setFilteredTools(validResults.slice(0, 12).map(result => result.tool))
      setIsLoading(false)
    }, 100) // Small delay for better UX
  }, [tools])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 150) // 150ms debounce

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
        setSelectedIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredTools.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredTools[selectedIndex]) {
          handleToolSelect(filteredTools[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setQuery('')
        setSelectedIndex(0)
        break
      case 'Tab':
        e.preventDefault()
        if (filteredTools[selectedIndex]) {
          handleToolSelect(filteredTools[selectedIndex])
        }
        break
    }
  }

  const handleToolSelect = (tool: Tool) => {
    // Update recent tools
    try {
      const recentToolsData = JSON.parse(localStorage.getItem('recentTools') || '{}')
      recentToolsData[tool.id] = Date.now()
      
      // Keep only last 10 tools
      const sortedEntries = Object.entries(recentToolsData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
      
      localStorage.setItem('recentTools', JSON.stringify(Object.fromEntries(sortedEntries)))
      
      // Update popular tools
      const popularToolsData = JSON.parse(localStorage.getItem('popularTools') || '{}')
      popularToolsData[tool.id] = (popularToolsData[tool.id] || 0) + 1
      localStorage.setItem('popularTools', JSON.stringify(popularToolsData))
    } catch (error) {
      console.error('Error updating tools in localStorage:', error)
    }
    
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(0)
    setShowSuggestions(false)
    onSelect?.(tool)
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const getMatchHighlight = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 font-medium">
          {part}
        </span>
      ) : part
    )
  }

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tools... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12 py-3 text-base border-2 focus:border-primary/50 transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Zap className="absolute right-12 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query || filteredTools.length > 0 || recentTools.length > 0 || popularTools.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            {/* Search Results */}
            {query && (
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Keyboard className="h-3 w-3" />
                    ↑↓ to navigate
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : filteredTools.length > 0 ? (
                  filteredTools.map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: index * 0.02 }}
                      className={`p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-b-0 ${
                        index === selectedIndex ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleToolSelect(tool)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg mt-1">
                          <tool.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {getMatchHighlight(tool.name, query)}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {tool.category}
                            </Badge>
                            {tool.featured && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {tool.popular && (
                              <Badge variant="default" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {getMatchHighlight(tool.description, query)}
                          </p>
                          {tool.tags && tool.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tool.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No tools found for "{query}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try different keywords or browse categories
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Tools */}
            {!query && recentTools.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b bg-muted/50">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recently Used
                  </p>
                </div>
                {recentTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.02 }}
                    className="p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-b-0"
                    onClick={() => handleToolSelect(tool)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-1">
                        <tool.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">{tool.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(tool.lastUsed!)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Popular Tools */}
            {!query && popularTools.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b bg-muted/50">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular Tools
                  </p>
                </div>
                {popularTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.02 }}
                    className="p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-b-0"
                    onClick={() => handleToolSelect(tool)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-1">
                        <tool.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">{tool.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {tool.usageCount} uses
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {tool.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}