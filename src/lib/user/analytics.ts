import { db } from '@/lib/db'
import { UserPreferencesService } from './preferences'

export interface ToolUsageData {
  toolId: string
  duration?: number
  success?: boolean
  metadata?: Record<string, any>
}

export class UserAnalyticsService {
  static async trackToolUsage(userId: string, usageData: ToolUsageData) {
    try {
      // Update or create tool usage record
      const existingUsage = await db.toolUsage.findFirst({
        where: {
          userId,
          toolId: usageData.toolId
        }
      })

      if (existingUsage) {
        await db.toolUsage.update({
          where: { id: existingUsage.id },
          data: {
            usageCount: existingUsage.usageCount + 1,
            lastUsedAt: new Date(),
            duration: usageData.duration,
            success: usageData.success ?? true,
            usageData: usageData.metadata ? JSON.stringify(usageData.metadata) : existingUsage.usageData
          }
        })
      } else {
        await db.toolUsage.create({
          data: {
            userId,
            toolId: usageData.toolId,
            usageCount: 1,
            lastUsedAt: new Date(),
            duration: usageData.duration,
            success: usageData.success ?? true,
            usageData: usageData.metadata ? JSON.stringify(usageData.metadata) : null
          }
        })
      }

      // Add to recent tools
      await UserPreferencesService.addToRecentTools(userId, usageData.toolId)

      return { success: true }
    } catch (error) {
      console.error('Error tracking tool usage:', error)
      return { success: false, error }
    }
  }

  static async getUserAnalytics(userId: string) {
    try {
      const toolUsage = await db.toolUsage.findMany({
        where: { userId },
        orderBy: { lastUsedAt: 'desc' }
      })

      const totalUsage = toolUsage.reduce((sum, usage) => sum + usage.usageCount, 0)
      const uniqueTools = toolUsage.length
      const averageDuration = toolUsage.reduce((sum, usage) => sum + (usage.duration || 0), 0) / totalUsage
      const successRate = toolUsage.filter(usage => usage.success).length / toolUsage.length

      // Get most used categories
      const categoryUsage = new Map<string, number>()
      for (const usage of toolUsage) {
        // This would need to be enhanced to get the actual tool category
        // For now, we'll use the toolId as a proxy
        const category = usage.toolId.split('-')[0]
        categoryUsage.set(category, (categoryUsage.get(category) || 0) + usage.usageCount)
      }

      const mostUsedCategories = Array.from(categoryUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category]) => category)

      return {
        totalUsage,
        uniqueTools,
        averageDuration: Math.round(averageDuration),
        successRate: Math.round(successRate * 100),
        mostUsedCategories,
        recentActivity: toolUsage.slice(0, 10).map(usage => ({
          toolId: usage.toolId,
          lastUsed: usage.lastUsedAt,
          usageCount: usage.usageCount
        }))
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      return null
    }
  }

  static async getToolPopularityStats(toolId: string) {
    try {
      const usage = await db.toolUsage.findMany({
        where: { toolId }
      })

      if (usage.length === 0) {
        return {
          totalUsers: 0,
          totalUsage: 0,
          averageDuration: 0,
          successRate: 0
        }
      }

      const totalUsers = new Set(usage.map(u => u.userId)).size
      const totalUsage = usage.reduce((sum, u) => sum + u.usageCount, 0)
      const averageDuration = usage.reduce((sum, u) => sum + (u.duration || 0), 0) / totalUsage
      const successRate = usage.filter(u => u.success).length / usage.length

      return {
        totalUsers,
        totalUsage,
        averageDuration: Math.round(averageDuration),
        successRate: Math.round(successRate * 100)
      }
    } catch (error) {
      console.error('Error fetching tool popularity stats:', error)
      return null
    }
  }

  static async getSystemWideAnalytics() {
    try {
      const allUsage = await db.toolUsage.findMany()
      
      const totalUsers = new Set(allUsage.map(u => u.userId)).size
      const totalUsage = allUsage.reduce((sum, u) => sum + u.usageCount, 0)
      const averageDuration = allUsage.reduce((sum, u) => sum + (u.duration || 0), 0) / totalUsage
      const successRate = allUsage.filter(u => u.success).length / allUsage.length

      // Get top tools by usage
      const toolUsageMap = new Map<string, number>()
      for (const usage of allUsage) {
        toolUsageMap.set(usage.toolId, (toolUsageMap.get(usage.toolId) || 0) + usage.usageCount)
      }

      const topTools = Array.from(toolUsageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([toolId, usageCount]) => ({ toolId, usageCount }))

      return {
        totalUsers,
        totalUsage,
        averageDuration: Math.round(averageDuration),
        successRate: Math.round(successRate * 100),
        topTools
      }
    } catch (error) {
      console.error('Error fetching system-wide analytics:', error)
      return null
    }
  }
}