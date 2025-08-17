import { NextRequest, NextResponse } from 'next/server'
import { PlanService } from '@/lib/auth/services'

export async function GET(request: NextRequest) {
  try {
    const plans = await PlanService.getAllPlans()
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}