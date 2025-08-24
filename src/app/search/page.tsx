'use client'

import { useState } from 'react'
import { tools } from '@/data/tools'
import { Tool as ToolType } from '@/types/tool'
import { AdvancedSearch } from '@/components/advanced-search'
import { SearchResults } from '@/components/search-results'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, TrendingUp, Clock, Star } from 'lucide-react'

function convertToolForSearch(tool: any): ToolType {
  return {
    name: tool.name,
    href: tool.path,
    description: tool.description,
    category: tool.category,
    icon: tool.icon,
    featured: tool.featured,
    tags: tool.tags
  }
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<ToolType[]>(tools.slice(0, 12).map(convertToolForSearch)) // Show first 12 by default
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleToolClick = (tool: ToolType) => {
    window.location.href = tool.href
  }

  const handleResultsChange = (results: ToolType[]) => {
    setSearchResults(results)
  }

  // Get featured tools for quick access
  const featuredTools = tools.filter(tool => tool.featured).slice(0, 6).map(convertToolForSearch)
  
  // Get popular categories
  const popularCategories = [...new Set(tools.map(tool => tool.category))].slice(0, 8)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Advanced Search</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find the perfect tool with powerful search, filters, and sorting options
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {tools.length}+ Tools
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {popularCategories.length} Categories
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Advanced Filters
          </Badge>
        </div>
      </div>

      {/* Advanced Search Component */}
      <AdvancedSearch 
        tools={tools.map(convertToolForSearch)} 
        onResultsChange={handleResultsChange}
        className="mb-8"
      />

      {/* Quick Access Sections */}
      {searchResults.length === tools.length && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Featured Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Tools
              </CardTitle>
              <CardDescription>
                Discover our most popular and powerful tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuredTools.map((tool) => (
                  <Button
                    key={tool.href}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => handleToolClick(tool)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-6 h-6 bg-primary/20 rounded flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.category}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Popular Categories
              </CardTitle>
              <CardDescription>
                Browse tools by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {popularCategories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
                      if (searchInput) {
                        searchInput.value = category
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }))
                      }
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Results */}
      <SearchResults
        tools={searchResults}
        viewMode={viewMode}
        onToolClick={handleToolClick}
      />

      {/* Search Tips */}
      {searchResults.length === tools.length && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Basic Search</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Search by tool name, description, or category</li>
                  <li>• Use keywords like "JSON", "image", "converter"</li>
                  <li>• Search is case-insensitive</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Advanced Filters</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Filter by specific categories</li>
                  <li>• Show only featured tools</li>
                  <li>• Sort by relevance, name, or category</li>
                  <li>• Switch between grid and list view</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}