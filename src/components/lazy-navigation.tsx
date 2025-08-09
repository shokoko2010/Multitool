"use client"

import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/lib/lazy-loading'

// Lazy load navigation components
const Navigation = lazy(() => import('./navigation').then(mod => ({ default: mod.Navigation })))

export function LazyNavigation() {
  return (
    <Suspense fallback={<div className="h-16 bg-background border-b"></div>}>
      <Navigation />
    </Suspense>
  )
}

// Individual lazy navigation items
export const LazyCategoryNav = lazy(() => import('./category-nav').then(mod => ({ default: mod.CategoryNav })))
export const LazyThemeToggle = lazy(() => import('./theme-toggle').then(mod => ({ default: mod.ThemeToggle })))