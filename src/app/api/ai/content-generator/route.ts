import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { prompt, tone = 'professional', length = 'medium', contentType = 'blog-post' } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are a professional content writer. Generate high-quality content based on the user's request. 
    Content Type: ${contentType}
    Tone: ${tone}
    Length: ${length}
    Make the content engaging, informative, and well-structured.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const generatedContent = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      data: {
        content: generatedContent,
        tone,
        length,
        contentType
      }
    })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}