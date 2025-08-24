import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserAnalyticsService } from '@/lib/user/analytics'
import { tools } from '@/data/tools'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d' // 7d, 30d, 90d

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate: Date
    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get tool usage analytics
    const toolUsage = await db.toolUsage.findMany({
      where: {
        lastUsedAt: {
          gte: startDate
        }
      },
      orderBy: { lastUsedAt: 'desc' }
    })

    // Get user analytics
    const userAnalytics = await UserAnalyticsService.getSystemWideAnalytics()

    // Calculate tool popularity
    const toolStats = new Map<string, {
      toolId: string
      usageCount: number
      uniqueUsers: Set<string>
      totalDuration: number
      successRate: number
      avgDuration: number
    }>()

    for (const usage of toolUsage) {
      if (!toolStats.has(usage.toolId)) {
        toolStats.set(usage.toolId, {
          toolId: usage.toolId,
          usageCount: 0,
          uniqueUsers: new Set(),
          totalDuration: 0,
          successRate: 0,
          avgDuration: 0
        })
      }

      const stats = toolStats.get(usage.toolId)!
      stats.usageCount += usage.usageCount
      stats.uniqueUsers.add(usage.userId)
      stats.totalDuration += usage.duration || 0
      stats.successRate = usage.success ? 1 : 0
    }

    // Calculate average duration and convert Set to array length
    const processedToolStats = Array.from(toolStats.entries()).map(([toolId, stats]) => ({
      toolId,
      usageCount: stats.usageCount,
      uniqueUsers: stats.uniqueUsers.size,
      totalDuration: stats.totalDuration,
      avgDuration: stats.totalDuration / stats.usageCount,
      successRate: stats.successRate,
      tool: tools.find(t => t.id === toolId)
    }))

    // Sort by usage count
    const topTools = processedToolStats
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 20)

    // Calculate category analytics
    const categoryStats = new Map<string, {
      category: string
      usageCount: number
      uniqueUsers: Set<string>
      tools: Set<string>
    }>()

    for (const [toolId, stats] of toolStats.entries()) {
      const tool = tools.find(t => t.id === toolId)
      if (!tool) continue

      if (!categoryStats.has(tool.category)) {
        categoryStats.set(tool.category, {
          category: tool.category,
          usageCount: 0,
          uniqueUsers: new Set(),
          tools: new Set()
        })
      }

      const catStats = categoryStats.get(tool.category)!
      catStats.usageCount += stats.usageCount
      stats.uniqueUsers.forEach(user => catStats.uniqueUsers.add(user))
      catStats.tools.add(toolId)
    }

    const categoryAnalytics = Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      usageCount: stats.usageCount,
      uniqueUsers: stats.uniqueUsers.size,
      toolCount: stats.tools.size
    })).sort((a, b) => b.usageCount - a.usageCount)

    // Calculate hourly usage patterns
    const hourlyUsage = new Array(24).fill(0).map((_, hour) => ({
      hour,
      usageCount: 0,
      uniqueUsers: new Set<string>()
    }))

    for (const usage of toolUsage) {
      const hour = new Date(usage.lastUsedAt).getHours()
      hourlyUsage[hour].usageCount += usage.usageCount
      hourlyUsage[hour].uniqueUsers.add(usage.userId)
    }

    const hourlyAnalytics = hourlyUsage.map(h => ({
      hour: h.hour,
      usageCount: h.usageCount,
      uniqueUsers: h.uniqueUsers.size
    }))

    // Calculate daily usage patterns
    const dailyUsage = new Array(7).fill(0).map((_, day) => ({
      day,
      usageCount: 0,
      uniqueUsers: new Set<string>()
    }))

    for (const usage of toolUsage) {
      const day = new Date(usage.lastUsedAt).getDay()
      dailyUsage[day].usageCount += usage.usageCount
      dailyUsage[day].uniqueUsers.add(usage.userId)
    }

    const dailyAnalytics = dailyUsage.map(d => ({
      day: d.day,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.day],
      usageCount: d.usageCount,
      uniqueUsers: d.uniqueUsers.size
    }))

    // Calculate user engagement metrics
    const userEngagement = new Map<string, {
      userId: string
      usageCount: number
      uniqueTools: Set<string>
      totalDuration: number
      lastActive: Date
    }>()

    for (const usage of toolUsage) {
      if (!userEngagement.has(usage.userId)) {
        userEngagement.set(usage.userId, {
          userId: usage.userId,
          usageCount: 0,
          uniqueTools: new Set(),
          totalDuration: 0,
          lastActive: usage.lastUsedAt
        })
      }

      const engagement = userEngagement.get(usage.userId)!
      engagement.usageCount += usage.usageCount
      engagement.uniqueTools.add(usage.toolId)
      engagement.totalDuration += usage.duration || 0
      engagement.lastActive = new Date(Math.max(
        engagement.lastActive.getTime(),
        usage.lastUsedAt.getTime()
      ))
    }

    const userEngagementData = Array.from(userEngagement.entries()).map(([userId, data]) => ({
      userId,
      usageCount: data.usageCount,
      uniqueTools: data.uniqueTools.size,
      totalDuration: data.totalDuration,
      avgDuration: data.totalDuration / data.usageCount,
      lastActive: data.lastActive
    })).sort((a, b) => b.usageCount - a.usageCount)

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        totalUsage: toolUsage.length,
        uniqueUsers: userEngagement.size,
        topTools,
        categoryAnalytics,
        hourlyAnalytics,
        dailyAnalytics,
        userEngagement: userEngagementData.slice(0, 50), // Top 50 users
        systemWide: userAnalytics,
        summary: {
          totalToolUsage: processedToolStats.reduce((sum, tool) => sum + tool.usageCount, 0),
          avgSessionDuration: processedToolStats.reduce((sum, tool) => sum + tool.avgDuration, 0) / processedToolStats.length,
          mostPopularCategory: categoryAnalytics[0]?.category || 'N/A',
          peakUsageHour: hourlyAnalytics.reduce((max, curr) => curr.usageCount > max.usageCount ? curr : max, hourlyAnalytics[0])?.hour || 0,
          mostActiveDay: dailyAnalytics.reduce((max, curr) => curr.usageCount > max.usageCount ? curr : max, dailyAnalytics[0])?.dayName || 'N/A'
        }
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}