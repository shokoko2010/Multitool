import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { PlanToolService, UsageService } from '@/lib/auth/services'

export async function POST(
  request: NextRequest,
  { params }: { params: { toolId: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { toolId } = params

    // Check if user has access to this tool
    const accessInfo = await PlanToolService.getToolAccessInfo(
      session.user.id,
      toolId
    )

    if (!accessInfo.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check usage limits
    if (accessInfo.accessType === 'LIMITED' && accessInfo.remainingUsage <= 0) {
      return NextResponse.json(
        { error: 'Usage limit exceeded' },
        { status: 429 }
      )
    }

    // Track usage
    await UsageService.incrementUsage(session.user.id, toolId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking tool usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}