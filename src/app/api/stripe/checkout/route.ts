import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { StripeService } from '@/lib/stripe/service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId, planName, price } = await request.json()

    if (!planId || !planName || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const successUrl = `${process.env.NEXTAUTH_URL}/subscription?success=true`
    const cancelUrl = `${process.env.NEXTAUTH_URL}/subscription?canceled=true`

    const checkoutSession = await StripeService.createCheckoutSession({
      userId: session.user.id,
      planId,
      planName,
      price,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json(checkoutSession)
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}