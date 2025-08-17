import { db } from '@/lib/db'
import { Usage, User, Plan, Subscription } from '@prisma/client'

export interface ActivityEvent {
  id: string
  userId: string
  eventType: 'tool_usage' | 'page_view' | 'search' | 'login' | 'signup' | 'subscription_change'
  eventData: Record<string, any>
  timestamp: Date
  userAgent?: string
  ipAddress?: string
  sessionId?: string
}

export interface AnalyticsMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalSessions: number
  averageSessionDuration: number
  bounceRate: number
  toolUsage: ToolUsageStats[]
  popularTools: PopularTool[]
  userRetention: UserRetentionStats
  revenueMetrics: RevenueMetrics
}

export interface ToolUsageStats {
  toolId: string
  toolName: string
  totalUses: number
  uniqueUsers: number
  averageUsesPerUser: number
  growthRate: number
}

export interface PopularTool {
  toolId: string
  toolName: string
  category: string
  usageCount: number
  userCount: number
  conversionRate: number
}

export interface UserRetentionStats {
  day1: number
  day7: number
  day30: number
  monthlyRetention: number[]
}

export interface RevenueMetrics {
  totalRevenue: number
  monthlyRevenue: number
  averageRevenuePerUser: number
  conversionRate: number
  churnRate: number
  lifetimeValue: number
}

export class AnalyticsService {
  static async trackEvent(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
    try {
      await db.activityEvent.create({
        data: {
          userId: event.userId,
          eventType: event.eventType,
          eventData: event.eventData,
          userAgent: event.userAgent,
          ipAddress: event.ipAddress,
          sessionId: event.sessionId,
        }
      })
    } catch (error) {
      console.error('Error tracking analytics event:', error)
    }
  }

  static async getAnalyticsMetrics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsMetrics> {
    const now = new Date()
    const timeRangeMap = {
      day: 1,
      week: 7,
      month: 30,
      year: 365
    }
    const daysBack = timeRangeMap[timeRange]
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Get basic user metrics
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      db.user.count({
        where: {
          // Users who have been active in the time range
          OR: [
            {
              usage: {
                some: {
                  lastUsed: {
                    gte: startDate
                  }
                }
              }
            },
            {
              subscriptions: {
                some: {
                  startedAt: {
                    gte: startDate
                  }
                }
              }
            }
          ]
        }
      })
    ])

    // Get tool usage statistics
    const toolUsage = await this.getToolUsageStats(startDate, now)
    const popularTools = await this.getPopularTools(startDate, now)

    // Get user retention statistics
    const userRetention = await this.getUserRetentionStats()

    // Get revenue metrics
    const revenueMetrics = await this.getRevenueMetrics(startDate, now)

    // Calculate session metrics (simplified)
    const totalSessions = await db.activityEvent.count({
      where: {
        eventType: 'login',
        timestamp: {
          gte: startDate
        }
      }
    })

    const averageSessionDuration = 1800 // 30 minutes average (mock data)
    const bounceRate = 0.35 // 35% bounce rate (mock data)

    return {
      totalUsers,
      activeUsers,
      newUsers,
      totalSessions,
      averageSessionDuration,
      bounceRate,
      toolUsage,
      popularTools,
      userRetention,
      revenueMetrics
    }
  }

  private static async getToolUsageStats(startDate: Date, endDate: Date): Promise<ToolUsageStats[]> {
    const toolUsage = await db.usage.groupBy({
      by: ['toolId'],
      where: {
        lastUsed: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        count: true
      },
      _count: {
        userId: true
      },
      orderBy: {
        _sum: {
          count: 'desc'
        }
      },
      take: 20
    })

    // Get tool names
    const toolIds = toolUsage.map(t => t.toolId)
    const toolsData = await db.tool.findMany({
      where: {
        id: {
          in: toolIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const toolMap = new Map(toolsData.map(t => [t.id, t.name]))

    return toolUsage.map(t => ({
      toolId: t.toolId,
      toolName: toolMap.get(t.toolId) || 'Unknown Tool',
      totalUses: t._sum.count || 0,
      uniqueUsers: t._count.userId,
      averageUsesPerUser: t._count.userId > 0 ? (t._sum.count || 0) / t._count.userId : 0,
      growthRate: Math.random() * 100 - 50 // Mock growth rate
    }))
  }

  private static async getPopularTools(startDate: Date, endDate: Date): Promise<PopularTool[]> {
    const popularTools = await db.$queryRaw`
      SELECT 
        t.id as "toolId",
        t.name as "toolName",
        t.category as "category",
        COUNT(DISTINCT u.userId) as "userCount",
        SUM(u.count) as "usageCount"
      FROM Usage u
      JOIN Tool t ON u.toolId = t.id
      WHERE u.lastUsed >= ${startDate} AND u.lastUsed <= ${endDate}
      GROUP BY t.id, t.name, t.category
      ORDER BY "usageCount" DESC
      LIMIT 10
    ` as PopularTool[]

    return popularTools.map(tool => ({
      ...tool,
      conversionRate: Math.random() * 100 // Mock conversion rate
    }))
  }

  private static async getUserRetentionStats(): Promise<UserRetentionStats> {
    // This is a simplified retention calculation
    // In a real implementation, you'd track user cohorts over time
    return {
      day1: 85,
      day7: 65,
      day30: 45,
      monthlyRetention: [85, 78, 72, 68, 65, 62, 58, 55, 52, 50, 48, 45]
    }
  }

  private static async getRevenueMetrics(startDate: Date, endDate: Date): Promise<RevenueMetrics> {
    const subscriptions = await db.subscription.findMany({
      where: {
        status: 'ACTIVE',
        startedAt: {
          lte: endDate
        },
        OR: [
          {
            endsAt: null
          },
          {
            endsAt: {
              gte: startDate
            }
          }
        ]
      },
      include: {
        plan: true
      }
    })

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.plan.price, 0)
    const monthlyRevenue = totalRevenue / Math.max(1, (endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
    const averageRevenuePerUser = subscriptions.length > 0 ? totalRevenue / subscriptions.length : 0
    const conversionRate = 0.05 // 5% conversion rate (mock data)
    const churnRate = 0.03 // 3% churn rate (mock data)
    const lifetimeValue = averageRevenuePerUser / Math.max(churnRate, 0.01)

    return {
      totalRevenue,
      monthlyRevenue,
      averageRevenuePerUser,
      conversionRate,
      churnRate,
      lifetimeValue
    }
  }

  static async getUserActivity(userId: string, timeRange: 'day' | 'week' | 'month' = 'week') {
    const now = new Date()
    const timeRangeMap = {
      day: 1,
      week: 7,
      month: 30
    }
    const daysBack = timeRangeMap[timeRange]
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const events = await db.activityEvent.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    })

    return events
  }

  static async getToolAnalytics(toolId: string, timeRange: 'day' | 'week' | 'month' = 'month') {
    const now = new Date()
    const timeRangeMap = {
      day: 1,
      week: 7,
      month: 30
    }
    const daysBack = timeRangeMap[timeRange]
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const usage = await db.usage.findMany({
      where: {
        toolId,
        lastUsed: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        lastUsed: 'desc'
      },
      take: 50
    })

    const totalUses = usage.reduce((sum, u) => sum + u.count, 0)
    const uniqueUsers = new Set(usage.map(u => u.userId)).size

    return {
      totalUses,
      uniqueUsers,
      averageUsesPerUser: uniqueUsers > 0 ? totalUses / uniqueUsers : 0,
      recentUsage: usage
    }
  }

  static async getRealTimeMetrics() {
    const now = new Date()
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

    const [activeUsers5min, activeUsers1hour, recentEvents] = await Promise.all([
      db.activityEvent.count({
        where: {
          timestamp: {
            gte: last5Minutes
          }
        },
        distinct: ['userId']
      }),
      db.activityEvent.count({
        where: {
          timestamp: {
            gte: lastHour
          }
        },
        distinct: ['userId']
      }),
      db.activityEvent.findMany({
        where: {
          timestamp: {
            gte: last5Minutes
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10
      })
    ])

    return {
      activeUsers5min,
      activeUsers1hour,
      recentEvents
    }
  }
}