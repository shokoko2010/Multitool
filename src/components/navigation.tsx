'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Search, 
  Settings, 
  Moon, 
  Sun, 
  Github,
  Twitter,
  Globe,
  BarChart3,
  Sparkles,
  ChevronDown,
  Loader2,
  User,
  LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedSearch } from './enhanced-search'
import { useTheme } from 'next-themes'
import toast from '@/lib/toast'
import { Tool } from '@/types/tool'
import { useAuth } from '@/hooks/use-auth'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isEnhancedSearch, setIsEnhancedSearch] = useState(true)
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoadingTools, setIsLoadingTools] = useState(true)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Load tools data for search
    const loadTools = async () => {
      try {
        // Simulate API call to get tools
        const response = await fetch('/api/tools')
        if (response.ok) {
          const toolsData = await response.json()
          setTools(toolsData)
        } else {
          // Fallback to mock data if API fails
          setTools([
            { id: '1', name: 'SEO Analyzer', href: '/tools/seo-audit-tool', description: 'Comprehensive website SEO analysis', category: 'seo', icon: BarChart3, featured: true, popular: true },
            { id: '2', name: 'AI Content Generator', href: '/tools/ai-content-generator', description: 'Generate high-quality content using AI', category: 'ai', icon: Sparkles, featured: true, popular: true },
            { id: '3', name: 'Meta Tag Generator', href: '/tools/meta-tag-generator', description: 'Generate SEO-optimized meta tags', category: 'seo', icon: Settings, popular: true },
            { id: '4', name: 'Image Optimizer', href: '/tools/image-optimizer', description: 'Compress and optimize images', category: 'image', icon: Settings, popular: true },
          ])
        }
      } catch (error) {
        console.error('Failed to load tools:', error)
        // Fallback to mock data
        setTools([
          { id: '1', name: 'SEO Analyzer', href: '/tools/seo-audit-tool', description: 'Comprehensive website SEO analysis', category: 'seo', icon: BarChart3, featured: true, popular: true },
          { id: '2', name: 'AI Content Generator', href: '/tools/ai-content-generator', description: 'Generate high-quality content using AI', category: 'ai', icon: Sparkles, featured: true, popular: true },
          { id: '3', name: 'Meta Tag Generator', href: '/tools/meta-tag-generator', description: 'Generate SEO-optimized meta tags', category: 'seo', icon: Settings, popular: true },
          { id: '4', name: 'Image Optimizer', href: '/tools/image-optimizer', description: 'Compress and optimize images', category: 'image', icon: Settings, popular: true },
        ])
      } finally {
        setIsLoadingTools(false)
      }
    }

    loadTools()
  }, [])

  const handleToolSelect = (tool: Tool) => {
    setIsSearchOpen(false)
    toast.success(`Opening ${tool.name}...`)
    // In a real app, you would navigate to the tool page
    window.location.href = tool.href
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', description: 'Your activity and insights' },
    { name: 'Tools', href: '/tools', description: 'Browse all tools' },
    { name: 'Search Analytics', href: '/search-analytics', description: 'Search performance data' },
    { name: 'Categories', href: '/categories', description: 'View by category' },
    { name: 'About', href: '/about', description: 'Learn more about us' },
    { name: 'Pricing', href: '/pricing', description: 'Premium features' },
  ]

  if (isAuthLoading) {
    return null // or a loading spinner
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                MultiTool
              </span>
              <Badge variant="secondary" className="text-xs px-2 py-0">235+</Badge>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hidden sm:flex"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Authentication */}
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center space-x-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user?.name || 'Dashboard'}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-2">
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-background border-t border-border"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </Link>
                  ))}

                  {/* Authentication in mobile menu */}
                  <div className="pt-4 border-t border-border">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <Link
                          href="/dashboard"
                          className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                          </div>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLogout}
                          className="w-full justify-start"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/auth/signin"
                          className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button className="w-full">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsSearchOpen(true)
                        setIsOpen(false)
                      }}
                      className="w-full justify-start"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search Tools
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className="w-full justify-start mt-2"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="h-4 w-4 mr-2" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4 mr-2" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            >
              <div className="w-full max-w-2xl">
                <div className="bg-background border border-border rounded-lg shadow-xl">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Tools
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEnhancedSearch(!isEnhancedSearch)}
                          className="text-xs"
                        >
                          {isEnhancedSearch ? 'Basic' : 'Enhanced'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {isEnhancedSearch ? (
                      <div className="relative">
                        {isLoadingTools ? (
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading tools...
                            </div>
                          </div>
                        ) : (
                          <EnhancedSearch 
                            tools={tools}
                            onSelect={handleToolSelect}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Basic search mode</p>
                        <p className="text-sm">Switch to enhanced search for better results</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}