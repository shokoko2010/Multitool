import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'

interface GenerateRequest {
  prompt: string
  contentType: string
  tone: string
  length: string
}

interface GenerateResponse {
  content: string
  title?: string
  wordCount: number
}

function getContentLengthWords(length: string): number {
  switch (length) {
    case 'short': return 200
    case 'medium': return 500
    case 'long': return 1000
    case 'detailed': return 1500
    default: return 500
  }
}

function getContentTypeDescription(contentType: string): string {
  switch (contentType) {
    case 'blog-post': return 'blog post'
    case 'article': return 'article'
    case 'social-media': return 'social media content'
    case 'email': return 'email'
    case 'product-description': return 'product description'
    case 'ad-copy': return 'advertisement copy'
    case 'story': return 'story'
    default: return 'content'
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

    const body: GenerateRequest = await request.json()
    const { prompt, contentType, tone, length } = body

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Initialize Z-AI SDK
    const zai = await ZAI.create()

    // Create a comprehensive prompt for content generation
    const targetWords = getContentLengthWords(length)
    const contentDescription = getContentTypeDescription(contentType)

    const systemPrompt = `You are a professional content writer. Generate a ${contentDescription} with the following specifications:

- Tone: ${tone}
- Target length: approximately ${targetWords} words
- Content type: ${contentType}
- Style: engaging, informative, and well-structured

Please provide:
1. High-quality, original content that directly addresses the user's request
2. Well-structured paragraphs with clear headings when appropriate
3. Content that matches the specified tone and style
4. A compelling title suggestion (include it as "Title: [your title]" at the beginning)

The content should be ready to use and require minimal editing.`

    const userPrompt = `Please write a ${contentDescription} about: ${prompt}`

    // Generate content using Z-AI
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: Math.max(targetWords * 2, 1000), // Rough estimate for tokens
      temperature: 0.7
    })

    let generatedContent = completion.choices[0]?.message?.content || ''
    
    // Extract title if present
    let title: string | undefined
    const titleMatch = generatedContent.match(/^Title:\s*(.+)$/m)
    if (titleMatch) {
      title = titleMatch[1].trim()
      generatedContent = generatedContent.replace(/^Title:\s*.+$/m, '').trim()
    }

    // Clean up the content
    generatedContent = generatedContent.replace(/^\n+/, '').trim()

    // Calculate word count
    const wordCount = generatedContent.split(/\s+/).filter(word => word.length > 0).length

    const response: GenerateResponse = {
      content: generatedContent,
      title,
      wordCount
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}