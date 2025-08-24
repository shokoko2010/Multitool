'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect } from 'react'

export interface ToolUsageData {
  toolId: string
  duration?: number
  success?: boolean
  metadata?: Record<string, any>
}

export function useToolUsage() {
  const { data: session } = useSession()

  const trackToolUsage = useCallback(async (usageData: ToolUsageData) => {
    if (!session) return

    try {
      await fetch('/api/user/tool-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usageData),
      })
    } catch (error) {
      console.error('Error tracking tool usage:', error)
    }
  }, [session])

  const trackToolAccess = useCallback(async (toolId: string) => {
    if (!session) return

    try {
      // Track tool access
      await fetch(`/api/tools/${toolId}/usage`, {
        method: 'POST',
      })

      // Add to recent tools
      await fetch('/api/user/recent-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId }),
      })
    } catch (error) {
      console.error('Error tracking tool access:', error)
    }
  }, [session])

  return {
    trackToolUsage,
    trackToolAccess,
    isAuthenticated: !!session,
  }
}