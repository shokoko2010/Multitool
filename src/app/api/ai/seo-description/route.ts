import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { title, keywords = [], targetAudience = 'general' } = await request.json()

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are an SEO expert. Generate compelling meta descriptions based on the given title.
    - Include relevant keywords naturally
    - Keep descriptions between 150-160 characters
    - Make descriptions engaging and click-worthy
    - Include a call-to-action when appropriate
    - Target audience: ${targetAudience}
    - Generate 3 different description options`

    const keywordText = keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Title: ${title}\n${keywordText}`
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    const generatedDescriptions = completion.choices[0]?.message?.content || ''

    // Parse the generated descriptions into an array
    const descriptions = generatedDescriptions
      .split('\n')
      .map(desc => desc.replace(/^\d+\.\s*/, '').trim())
      .filter(desc => desc.length > 0)

    return NextResponse.json({
      success: true,
      data: {
        descriptions,
        title,
        keywords
      }
    })
  } catch (error) {
    console.error('Error generating SEO descriptions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate SEO descriptions' },
      { status: 500 }
    )
  }
}