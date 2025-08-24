import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AnalyticsService } from '@/lib/analytics/service'

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
    const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' | 'year' || 'month'

    const metrics = await AnalyticsService.getAnalyticsMetrics(timeRange)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching analytics metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics metrics' },
      { status: 500 }
    )
  }
}