'use client'

import { tools } from '@/data/tools'
import { ToolsGrid } from '@/components/tools-grid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Zap } from 'lucide-react'
import { Tool } from '@/types/tool'
import { useState, useEffect } from 'react'

function convertToolForHomePage(tool: any): Tool {
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

export default function Home() {
  const [convertedTools, setConvertedTools] = useState<Tool[]>([])
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Process tools in useEffect to avoid blocking the initial render
    const converted = tools.map(convertToolForHomePage)
    const featured = converted.filter(tool => tool.featured)
    const uniqueCategories = Array.from(new Set(tools.map(tool => tool.category)))
    const cats = ['all', ...uniqueCategories]
    
    setConvertedTools(converted)
    setFeaturedTools(featured)
    setCategories(cats)
    setLoading(false)
  }, [])

  const handleToolClick = (tool: Tool) => {
    // Navigate to tool page
    window.location.href = tool.href
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Z.ai MultiTool</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Z.ai MultiTool
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8">
              A comprehensive collection of {convertedTools.length}+ tools for developers, designers, and content creators
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {convertedTools.length}+ Tools Available
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {categories.length - 1} Categories
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Star className="w-4 h-4 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>

          {/* Featured Tools Section */}
          {featuredTools.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Featured Tools</h2>
                <p className="text-muted-foreground">
                  Discover our most popular and powerful tools
                </p>
              </div>
              <ToolsGrid 
                tools={featuredTools.slice(0, 8)} // Limit to 8 featured tools
                onToolClick={handleToolClick}
                loading={false}
              />
            </div>
          )}

          {/* All Tools Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">All Tools</h2>
              <p className="text-muted-foreground">
                Browse our complete collection of tools
              </p>
            </div>
            <ToolsGrid 
              tools={convertedTools.slice(0, 12)} // Limit to 12 tools for performance
              onToolClick={handleToolClick}
              loading={false}
            />
          </div>

          {/* CTA Section */}
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore our powerful tools and boost your productivity today
            </p>
            <Button size="lg" className="px-8">
              Explore All Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}