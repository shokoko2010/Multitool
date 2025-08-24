'use client'

import { useEffect, useState } from 'react'
import { useToolUsage } from '@/hooks/use-tool-usage'
import { useToolAccess } from '@/hooks/useToolAccess'

interface ToolUsageTrackerProps {
  toolId: string
  children: React.ReactNode
  trackAccess?: boolean
}

export function ToolUsageTracker({ 
  toolId, 
  children, 
  trackAccess = true 
}: ToolUsageTrackerProps) {
  const { trackToolUsage, trackToolAccess } = useToolUsage()
  const { hasAccess } = useToolAccess(toolId)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [hasTrackedAccess, setHasTrackedAccess] = useState(false)

  useEffect(() => {
    if (trackAccess && hasAccess && !hasTrackedAccess) {
      trackToolAccess(toolId)
      setHasTrackedAccess(true)
      setStartTime(Date.now())
    }
  }, [trackAccess, hasAccess, hasTrackedAccess, trackToolAccess, toolId])

  useEffect(() => {
    // Track page unload for duration
    const handleUnload = () => {
      if (startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000)
        trackToolUsage({
          toolId,
          duration,
          success: true,
          metadata: { pageUnload: true }
        })
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [startTime, toolId, trackToolUsage])

  const handleToolUsage = useCallback((success: boolean = true, metadata?: Record<string, any>) => {
    if (startTime) {
      const duration = Math.round((Date.now() - startTime) / 1000)
      trackToolUsage({
        toolId,
        duration,
        success,
        metadata
      })
    }
  }, [startTime, toolId, trackToolUsage])

  return (
    <>
      {children}
      {/* Hidden button for manual usage tracking */}
      <button
        onClick={() => handleToolUsage(true)}
        className="hidden"
        aria-hidden="true"
      />
    </>
  )
}