import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id || session.user.email || "anonymous"

    // Get user stats
    const [
      totalFavorites,
      totalUsageStats,
      recentActivities,
      weeklyUsage
    ] = await Promise.all([
      db.favorite.count({
        where: { userId }
      }),
      db.usageStat.findMany({
        where: { userId },
        select: { toolName: true, usageCount: true, category: true, lastUsed: true }
      }),
      db.activity.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      db.usageStat.findMany({
        where: { userId },
        select: { lastUsed: true }
      })
    ])

    // Calculate total tools used
    const totalToolsUsed = new Set(totalUsageStats.map(stat => stat.toolName)).size

    // Calculate most used category
    const categoryStats: Record<string, number> = {}
    totalUsageStats.forEach(stat => {
      categoryStats[stat.category] = (categoryStats[stat.category] || 0) + stat.usageCount
    })
    
    const mostUsedCategory = Object.keys(categoryStats).reduce((a, b) => 
      categoryStats[a] > categoryStats[b] ? a : b, 'general'
    )

    // Generate weekly usage data
    const weeklyUsageData = generateWeeklyUsage(weeklyUsage)

    // Format recent activities
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      action: activity.action,
      timestamp: activity.timestamp,
      details: activity.details,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalToolsUsed,
        totalFavorites,
        totalSessions: Math.floor(Math.random() * 50) + 10, // Mock for now
        averageSessionTime: Math.floor(Math.random() * 15) + 5, // Mock for now
        mostUsedCategory,
        weeklyUsage: weeklyUsageData,
        recentActivity: formattedActivities,
        favoriteTools: [], // Will be populated separately
        usageStats: totalUsageStats
      }
    })

  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateWeeklyUsage(usageStats: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date()
  const currentDay = today.getDay()
  
  // Count usages for each day of the current week
  const dayCounts: Record<string, number> = {}
  
  usageStats.forEach(stat => {
    const statDate = new Date(stat.lastUsed)
    const statDay = statDate.getDay()
    const dayName = days[statDay === 0 ? 6 : statDay - 1] // Convert 0 (Sunday) to 6
    
    dayCounts[dayName] = (dayCounts[dayName] || 0) + stat.usageCount
  })

  // Fill in missing days with 0
  return days.map(day => ({
    day,
    count: dayCounts[day] || 0
  }))
}