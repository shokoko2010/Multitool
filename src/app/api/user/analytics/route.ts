import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserAnalyticsService } from '@/lib/user/analytics'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user'
    const toolId = searchParams.get('toolId')

    let analytics

    switch (type) {
      case 'user':
        analytics = await UserAnalyticsService.getUserAnalytics(session.user.id)
        break
      case 'tool':
        if (!toolId) {
          return NextResponse.json(
            { error: 'Tool ID is required for tool analytics' },
            { status: 400 }
          )
        }
        analytics = await UserAnalyticsService.getToolPopularityStats(toolId)
        break
      case 'system':
        analytics = await UserAnalyticsService.getSystemWideAnalytics()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usageData = await request.json()
    
    if (!usageData.toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    const result = await UserAnalyticsService.trackToolUsage(
      session.user.id,
      usageData
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error tracking tool usage:', error)
    return NextResponse.json(
      { error: 'Failed to track tool usage' },
      { status: 500 }
    )
  }
}