'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, TrendingUp, Star, ExternalLink } from 'lucide-react'
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
}

interface ToolsSearchProps {
  tools: Tool[]
  onSelect?: (tool: Tool) => void
}

export function ToolsSearch({ tools, onSelect }: ToolsSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [recentTools, setRecentTools] = useState<Tool[]>([])
  const [popularTools, setPopularTools] = useState<Tool[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useClickOutside(searchRef, () => setIsOpen(false))

  // Mock data for recent and popular tools
  useEffect(() => {
    // In a real app, this would come from user data or analytics
    const mockRecent = tools.slice(0, 5).map(tool => ({
      ...tool,
      lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      usageCount: Math.floor(Math.random() * 100) + 1
    }))
    setRecentTools(mockRecent)

    const mockPopular = tools
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
      .map(tool => ({
        ...tool,
        usageCount: Math.floor(Math.random() * 1000) + 100
      }))
    setPopularTools(mockPopular)
  }, [tools])

  // Filter tools based on search query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredTools([])
      return
    }

    const filtered = tools.filter(tool =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase())
    )

    // Sort by relevance (exact matches first, then by usage count)
    const sorted = filtered.sort((a, b) => {
      const aExact = a.name.toLowerCase().includes(query.toLowerCase())
      const bExact = b.name.toLowerCase().includes(query.toLowerCase())
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      return (b.usageCount || 0) - (a.usageCount || 0)
    })

    setFilteredTools(sorted.slice(0, 10)) // Limit to 10 results
    setSelectedIndex(0)
  }, [query, tools])

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
        break
    }
  }

  const handleToolSelect = (tool: Tool) => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(0)
    onSelect?.(tool)
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 py-3 text-base border-2 focus:border-primary/50 transition-colors"
        />
      </div>

      <AnimatePresence>
        {isOpen && (query || filteredTools.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            {/* Search Results */}
            {query && filteredTools.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b bg-muted/50">
                  <p className="text-sm font-medium text-muted-foreground">
                    {filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {filteredTools.map((tool, index) => (
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
                          <h4 className="font-medium text-sm truncate">{tool.name}</h4>
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
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
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

            {/* Empty State */}
            {query && filteredTools.length === 0 && (
              <div className="p-6 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No tools found for "{query}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}