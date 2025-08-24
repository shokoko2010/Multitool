import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { fromCurrency, toCurrency } = await request.json()

    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()
    
    const insightPrompt = `Provide a brief insight about the ${fromCurrency} to ${toCurrency} currency pair. Include:
1. Current market sentiment
2. Any notable economic factors
3. A short trend prediction
Keep it under 150 words.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a currency market analyst providing concise insights.'
        },
        {
          role: 'user',
          content: insightPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    const insights = completion.choices[0]?.message?.content || 'No insights available at this time.'

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error generating currency insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}