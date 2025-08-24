import { db } from '@/lib/db'
import { tools } from '@/data/tools'
import { UserPreferencesService } from './preferences'

export interface ToolRecommendation {
  tool: any
  score: number
  reason: string
}

export class ToolRecommendationService {
  static async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<ToolRecommendation[]> {
    try {
      const preferences = await UserPreferencesService.getPreferences(userId)
      const recommendations: ToolRecommendation[] = []

      // Get user's tool usage history
      const toolUsage = await db.toolUsage.findMany({
        where: { userId },
        orderBy: { lastUsedAt: 'desc' }
      })

      // Calculate scores for each tool
      for (const tool of tools) {
        let score = 0
        const reasons: string[] = []

        // Score based on preferred categories
        if (preferences.preferredCategories.includes(tool.category)) {
          score += 30
          reasons.push('Matches your preferred categories')
        }

        // Score based on usage history of similar tools
        const similarCategoryUsage = toolUsage.filter(usage => {
          const usedTool = tools.find(t => t.id === usage.toolId)
          return usedTool && usedTool.category === tool.category
        })
        
        if (similarCategoryUsage.length > 0) {
          score += Math.min(similarCategoryUsage.length * 5, 25)
          reasons.push('Similar to tools you use frequently')
        }

        // Score based on featured tools
        if (tool.featured) {
          score += 10
          reasons.push('Popular featured tool')
        }

        // Score based on recent activity in category
        const recentUsage = toolUsage.filter(usage => {
          const usedTool = tools.find(t => t.id === usage.toolId)
          return usedTool && usedTool.category === tool.category && 
                 new Date(usage.lastUsedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        })

        if (recentUsage.length > 0) {
          score += 15
          reasons.push('Active in this category recently')
        }

        // Avoid recommending already used tools recently
        const recentlyUsed = toolUsage.find(usage => 
          usage.toolId === tool.id && 
          new Date(usage.lastUsedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        )

        if (recentlyUsed) {
          score -= 20
        }

        // Only include tools with positive scores
        if (score > 0) {
          recommendations.push({
            tool,
            score,
            reason: reasons.join(', ')
          })
        }
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  static async getTrendingTools(limit: number = 10): Promise<ToolRecommendation[]> {
    try {
      // Get all tool usage from the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const toolUsage = await db.toolUsage.findMany({
        where: {
          lastUsedAt: {
            gte: thirtyDaysAgo
          }
        }
      })

      // Calculate usage statistics for each tool
      const toolStats = new Map<string, {
        usageCount: number
        uniqueUsers: Set<string>
        totalDuration: number
        successRate: number
      }>()

      for (const usage of toolUsage) {
        if (!toolStats.has(usage.toolId)) {
          toolStats.set(usage.toolId, {
            usageCount: 0,
            uniqueUsers: new Set(),
            totalDuration: 0,
            successRate: 0
          })
        }

        const stats = toolStats.get(usage.toolId)!
        stats.usageCount += usage.usageCount
        stats.uniqueUsers.add(usage.userId)
        stats.totalDuration += usage.duration || 0
        stats.successRate = usage.success ? 1 : 0
      }

      // Generate recommendations based on trending data
      const recommendations: ToolRecommendation[] = []

      for (const [toolId, stats] of toolStats.entries()) {
        const tool = tools.find(t => t.id === toolId)
        if (!tool) continue

        let score = 0
        const reasons: string[] = []

        // Score based on usage frequency
        score += Math.min(stats.usageCount * 2, 50)
        reasons.push(`Used ${stats.usageCount} times recently`)

        // Score based on unique users
        score += Math.min(stats.uniqueUsers.size * 3, 30)
        reasons.push(`Popular among ${stats.uniqueUsers.size} users`)

        // Score based on average duration (engagement)
        const avgDuration = stats.totalDuration / stats.usageCount
        if (avgDuration > 60) { // More than 1 minute average usage
          score += 10
          reasons.push('High user engagement')
        }

        // Score based on success rate
        if (stats.successRate > 0.8) {
          score += 10
          reasons.push('High success rate')
        }

        recommendations.push({
          tool,
          score,
          reason: reasons.join(', ')
        })
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Error generating trending recommendations:', error)
      return []
    }
  }

  static async getCategoryBasedRecommendations(userId: string, category: string, limit: number = 5): Promise<ToolRecommendation[]> {
    try {
      const categoryTools = tools.filter(tool => tool.category === category)
      const recommendations: ToolRecommendation[] = []

      // Get user's usage in this category
      const toolUsage = await db.toolUsage.findMany({
        where: { userId }
      })

      const userCategoryUsage = toolUsage.filter(usage => {
        const usedTool = tools.find(t => t.id === usage.toolId)
        return usedTool && usedTool.category === category
      })

      for (const tool of categoryTools) {
        let score = 0
        const reasons: string[] = []

        // Base score for being in the category
        score += 20
        reasons.push(`In ${category} category`)

        // Score based on featured status
        if (tool.featured) {
          score += 15
          reasons.push('Featured tool')
        }

        // Score based on user's usage patterns in this category
        if (userCategoryUsage.length > 0) {
          score += 10
          reasons.push('You use tools in this category')
        }

        // Check if user has used this specific tool
        const toolUsageRecord = userCategoryUsage.find(usage => usage.toolId === tool.id)
        if (toolUsageRecord) {
          score += 5
          reasons.push('You\'ve used this before')
        }

        recommendations.push({
          tool,
          score,
          reason: reasons.join(', ')
        })
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Error generating category-based recommendations:', error)
      return []
    }
  }
}