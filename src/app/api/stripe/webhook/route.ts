import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/lib/stripe/service'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature')!
    const payload = await request.text()

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    const result = await StripeService.handleWebhook(signature, Buffer.from(payload))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}