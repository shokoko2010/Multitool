import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { SubscriptionService, PlanService } from '@/lib/auth/services'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscription = await SubscriptionService.getUserSubscription(session.user.id)
    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()

    // Verify plan exists
    const plan = await PlanService.getPlanById(planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Cancel existing subscription if any
    const existingSubscription = await SubscriptionService.getUserSubscription(session.user.id)
    if (existingSubscription) {
      await SubscriptionService.cancelSubscription(session.user.id, existingSubscription.id)
    }

    // Create new subscription
    const subscription = await SubscriptionService.createSubscription({
      userId: session.user.id,
      planId,
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}