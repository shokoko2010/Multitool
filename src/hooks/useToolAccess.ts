import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface ToolAccessInfo {
  hasAccess: boolean
  accessType: 'UNLIMITED' | 'LIMITED' | 'BLOCKED'
  maxUsage: number
  currentUsage: number
  remainingUsage: number
  features: Record<string, any>
}

export function useToolAccess(toolId: string) {
  const { data: session } = useSession()
  const [accessInfo, setAccessInfo] = useState<ToolAccessInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      setAccessInfo(null)
      setLoading(false)
      return
    }

    const checkAccess = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/tools/${toolId}/access`)
        
        if (!response.ok) {
          throw new Error('Failed to check tool access')
        }
        
        const data = await response.json()
        setAccessInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setAccessInfo(null)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [toolId, session])

  const trackUsage = async () => {
    if (!session) {
      throw new Error('No session found')
    }

    try {
      const response = await fetch(`/api/tools/${toolId}/usage`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to track usage')
      }

      // Refresh access info after tracking usage
      const accessResponse = await fetch(`/api/tools/${toolId}/access`)
      if (accessResponse.ok) {
        const updatedAccess = await accessResponse.json()
        setAccessInfo(updatedAccess)
      }

      return await response.json()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return {
    accessInfo,
    loading,
    error,
    trackUsage,
    hasAccess: accessInfo?.hasAccess || false,
    canUseTool: accessInfo?.hasAccess && (accessInfo.remainingUsage === -1 || accessInfo.remainingUsage > 0),
    usagePercentage: accessInfo?.maxUsage === -1 ? 100 : Math.round((accessInfo.currentUsage / accessInfo.maxUsage) * 100),
  }
}