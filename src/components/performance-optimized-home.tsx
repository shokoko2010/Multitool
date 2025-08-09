"use client"

import { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { LoadingSpinner, GridSkeleton } from '@/lib/lazy-loading'
import { X } from 'lucide-react'
import { Tool } from '@/types/tool'

// Lazy load heavy components
const LazyEnhancedToolsSearch = lazy(() => import('./enhanced-tools-search').then(mod => ({ default: mod.EnhancedToolsSearch })))
const LazyToolsGrid = lazy(() => import('./tools-grid').then(mod => ({ default: mod.ToolsGrid })))

interface PerformanceOptimizedHomeProps {
  initialTools: Tool[]
}

export function PerformanceOptimizedHome({ initialTools }: PerformanceOptimizedHomeProps) {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [tools, setTools] = useState<Tool[]>(initialTools)
  const [filteredTools, setFilteredTools] = useState<Tool[]>(initialTools)
  const [showSearch, setShowSearch] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Keyboard shortcuts
  useKeyboardShortcut(
    { key: 'k', ctrlKey: true, metaKey: true },
    () => setShowSearch(true)
  )

  useKeyboardShortcut(
    { key: 'Escape' },
    () => setShowSearch(false)
  )

  // Filter tools based on search and category
  useEffect(() => {
    const filtered = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredTools(filtered)
  }, [tools, searchQuery, selectedCategory])

  const handleToolClick = (tool: Tool) => {
    // Simulate navigation or routing
    window.location.href = tool.href
  }

  const featuredTools = tools.filter(tool => tool.featured)
  const popularTools = tools.filter(tool => tool.popular)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
              Free Online Tools
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover 235+ free online tools for SEO, development, design, and productivity. 
              Fast, secure, and easy-to-use tools for professionals and beginners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3">
                Browse All Tools
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View Categories
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Featured Tools</h2>
              <p className="text-muted-foreground">
                Our most popular and powerful tools to boost your productivity
              </p>
            </motion.div>
            <Suspense fallback={<GridSkeleton />}>
              <LazyToolsGrid tools={featuredTools} onToolClick={handleToolClick} />
            </Suspense>
          </div>
        </section>
      )}

      {/* Popular Tools */}
      {popularTools.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Popular Tools</h2>
              <p className="text-muted-foreground">
                Tools that our users love and use frequently
              </p>
            </motion.div>
            <Suspense fallback={<GridSkeleton />}>
              <LazyToolsGrid tools={popularTools} onToolClick={handleToolClick} />
            </Suspense>
          </div>
        </section>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto mt-20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-background border rounded-lg shadow-lg">
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search for tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <Suspense fallback={<div className="animate-pulse">Loading search...</div>}>
                    <LazyEnhancedToolsSearch />
                  </Suspense>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">235+</CardTitle>
                <CardDescription>Total Tools</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">10+</CardTitle>
                <CardDescription>Categories</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">Free</CardTitle>
                <CardDescription>Always Free</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}