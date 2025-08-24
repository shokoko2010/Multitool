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

    const metrics = await AnalyticsService.getRealTimeMetrics()

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching real-time metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    )
  }
}