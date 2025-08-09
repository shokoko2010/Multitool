"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedButton } from './ui-enhanced'
import { Menu, X, Search, Github, Twitter, User } from 'lucide-react'

interface EnhancedNavigationProps {
  onSearchOpen?: () => void
}

export function EnhancedNavigation({ onSearchOpen }: EnhancedNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { name: 'Tools', href: '/tools' },
    { name: 'Categories', href: '/categories' },
    { name: 'Popular', href: '/popular' },
    { name: 'About', href: '/about' },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md border-b shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-primary-foreground font-bold">🛠️</span>
              </motion.div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                FreeTools
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="text-foreground/80 hover:text-foreground transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <motion.button
                onClick={onSearchOpen}
                className="p-2 text-foreground/60 hover:text-foreground transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="h-5 w-5" />
                <motion.span
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
              
              <motion.button
                className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.button>

              <div className="relative">
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-foreground/60 hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="h-5 w-5" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg py-2 z-50"
                    >
                      <motion.a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        whileHover={{ x: 4 }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Profile
                      </motion.a>
                      <motion.a
                        href="/settings"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        whileHover={{ x: 4 }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Settings
                      </motion.a>
                      <motion.div className="border-t my-2" />
                      <motion.a
                        href="/logout"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        whileHover={{ x: 4 }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Sign Out
                      </motion.a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <EnhancedButton size="sm">
                Get Started
              </EnhancedButton>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 text-foreground/60 hover:text-foreground transition-colors"
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
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Search */}
              <motion.button
                onClick={onSearchOpen}
                className="w-full flex items-center space-x-2 p-3 text-left text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted mb-4"
                whileHover={{ scale: 1.02 }}
              >
                <Search className="h-5 w-5" />
                <span>Search tools...</span>
              </motion.button>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ x: 8 }}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </div>

              {/* Mobile Social Links */}
              <div className="flex space-x-4 mt-6 pt-4 border-t">
                <motion.a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter className="h-5 w-5" />
                </motion.a>
              </div>

              {/* Mobile CTA */}
              <div className="mt-6 pt-4 border-t">
                <EnhancedButton size="sm" className="w-full justify-start">
                  Get Started
                </EnhancedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}