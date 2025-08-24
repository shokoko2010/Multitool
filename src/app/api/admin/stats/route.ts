import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { UserService, PlanService, SubscriptionService } from '@/lib/auth/services'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get basic stats
    const allUsers = await UserService.getAllUsers()
    const allPlans = await PlanService.getAllPlans()
    
    // Calculate active users (users with active subscriptions)
    const activeUsers = allUsers.filter(user => {
      // This is a simplified calculation - in production you'd want more sophisticated logic
      return user.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
    }).length

    // Get active subscriptions count
    const activeSubscriptions = allPlans.reduce((total, plan) => {
      return total + (plan.status === 'ACTIVE' ? 1 : 0)
    }, 0)

    // Mock recent activity data
    const recentActivity = [
      {
        id: '1',
        action: 'New user registration',
        user: 'john@example.com',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        action: 'Plan upgrade',
        user: 'jane@example.com',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        action: 'Tool usage',
        user: 'bob@example.com',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]

    return NextResponse.json({
      totalUsers: allUsers.length,
      activeUsers,
      totalPlans: allPlans.length,
      activeSubscriptions,
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}