import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { UserAnalyticsService } from '@/lib/user/analytics'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { toolId, duration, success, metadata } = await request.json()
    
    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    const result = await UserAnalyticsService.trackToolUsage(session.user.id, {
      toolId,
      duration,
      success,
      metadata
    })
    
    return NextResponse.json({
      success: result.success,
      error: result.error
    })
  } catch (error) {
    console.error('Error tracking tool usage:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track tool usage' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const analytics = await UserAnalyticsService.getUserAnalytics(session.user.id)
    
    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user analytics' },
      { status: 500 }
    )
  }
}