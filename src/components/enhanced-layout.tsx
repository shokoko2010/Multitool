"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { EnhancedNavigation } from './enhanced-navigation'
import { EnhancedHero } from './enhanced-hero'
import { EnhancedToolsShowcase } from './enhanced-tools-showcase'
import { EnhancedFooter } from './enhanced-footer'
import { EnhancedButton } from './ui-enhanced'
import { ArrowUp, Menu, X } from 'lucide-react'
import { Tool, ToolCategory } from '@/types/tool'

interface EnhancedLayoutProps {
  tools: Tool[]
  categories: ToolCategory[]
}

export function EnhancedLayout({ tools, categories }: EnhancedLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 100], ["0%", "-100%"])
  const opacity = useTransform(scrollY, [0, 100], [1, 0])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enhanced Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md border-b' : 'bg-transparent'
        }`}
        style={{ y }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">🛠️</span>
              </div>
              <span className="font-bold text-xl">FreeTools</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {['Tools', 'Categories', 'Popular', 'About'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-foreground/80 hover:text-foreground transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <EnhancedButton variant="outline" size="sm">
                Sign In
              </EnhancedButton>
              <EnhancedButton size="sm">
                Get Started
              </EnhancedButton>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-t"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                {['Tools', 'Categories', 'Popular', 'About'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-foreground/80 hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ x: 8 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <EnhancedButton variant="outline" size="sm" className="w-full justify-start">
                    Sign In
                  </EnhancedButton>
                  <EnhancedButton size="sm" className="w-full justify-start">
                    Get Started
                  </EnhancedButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <EnhancedHero />

        {/* Tools Section */}
        <section id="tools" className="py-20">
          <div className="container mx-auto px-4">
            <EnhancedToolsShowcase tools={tools} categories={categories} />
          </div>
        </section>

        {/* Additional sections would go here */}
        <section id="categories" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our tools organized by category to find exactly what you need
              </p>
            </motion.div>
            {/* Category grid would go here */}
          </div>
        </section>
      </main>

      {/* Footer */}
      <EnhancedFooter />
    </div>
  )
}