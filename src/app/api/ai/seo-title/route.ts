import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { topic, keywords = [], targetAudience = 'general' } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are an SEO expert. Generate compelling, SEO-optimized titles based on the given topic.
    - Include relevant keywords naturally
    - Keep titles under 60 characters when possible
    - Make titles click-worthy and engaging
    - Target audience: ${targetAudience}
    - Generate 5 different title options`

    const keywordText = keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Topic: ${topic}\n${keywordText}`
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    const generatedTitles = completion.choices[0]?.message?.content || ''

    // Parse the generated titles into an array
    const titles = generatedTitles
      .split('\n')
      .map(title => title.replace(/^\d+\.\s*/, '').trim())
      .filter(title => title.length > 0)

    return NextResponse.json({
      success: true,
      data: {
        titles,
        topic,
        keywords
      }
    })
  } catch (error) {
    console.error('Error generating SEO titles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate SEO titles' },
      { status: 500 }
    )
  }
}