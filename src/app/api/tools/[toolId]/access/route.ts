import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PlanToolService } from '@/lib/auth/services'

export async function GET(
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
    const accessInfo = await PlanToolService.getToolAccessInfo(
      session.user.id,
      toolId
    )

    return NextResponse.json(accessInfo)
  } catch (error) {
    console.error('Error checking tool access:', error)
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    )
  }
}