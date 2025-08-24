import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt parameter' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are a helpful assistant that converts text to JSON. Always respond with valid JSON only, no additional text or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    })

    const jsonContent = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ jsonContent })
  } catch (error) {
    console.error('Error converting prompt to JSON:', error)
    return NextResponse.json(
      { error: 'Failed to convert prompt to JSON' },
      { status: 500 }
    )
  }
}