"use client"

import { lazy, Suspense } from 'react'
import { LoadingSpinner, GridSkeleton } from '@/lib/lazy-loading'

// Lazy load the enhanced tools search component
const EnhancedToolsSearch = lazy(() => import('./enhanced-tools-search').then(mod => ({ default: mod.EnhancedToolsSearch })))

export function LazyEnhancedToolsSearch() {
  return (
    <Suspense fallback={<GridSkeleton />}>
      <EnhancedToolsSearch />
    </Suspense>
  )
}

// Individual lazy components for better granularity
export const LazyToolsSearch = lazy(() => import('./tools-search').then(mod => ({ default: mod.ToolsSearch })))
export const LazyToolsGrid = lazy(() => import('./tools-grid').then(mod => ({ default: mod.ToolsGrid })))