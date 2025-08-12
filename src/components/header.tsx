'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Home, Settings, HelpCircle, Grid } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <img
                  src="/logo.svg"
                  alt="Z.ai Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">Z.ai MultiTool</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link href="/categories" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <Grid className="w-4 h-4" />
                <span>Categories</span>
              </Link>
              <Link href="/tools" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <Settings className="w-4 h-4" />
                <span>Tools</span>
              </Link>
              <Link href="/help" className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary">
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </Link>
            </nav>
          </div>

          {/* Search and Theme Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tools..."
                className="pl-10 w-64"
              />
            </div>
            
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}