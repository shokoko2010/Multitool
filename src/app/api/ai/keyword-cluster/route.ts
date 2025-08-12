import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface KeywordCluster {
  name: string
  keywords: string[]
  intent: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export async function POST(request: NextRequest) {
  try {
    const { primaryKeyword, additionalKeywords = [] } = await request.json()

    if (!primaryKeyword) {
      return NextResponse.json(
        { success: false, error: 'Primary keyword is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are an SEO expert specializing in keyword research and content strategy. Generate comprehensive keyword clusters based on the given primary keyword.

Create keyword clusters organized by:
1. Search Intent (Informational, Commercial, Transactional, Navigational)
2. User journey stages (Awareness, Consideration, Decision)
3. Difficulty levels (Easy, Medium, Hard)

For each cluster, provide:
- Cluster name describing the intent/theme
- 8-12 relevant keywords including variations
- Primary search intent
- Estimated difficulty level

Format your response as JSON with the following structure:
{
  "clusters": [
    {
      "name": "string",
      "keywords": ["string"],
      "intent": "string",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}

Generate 4-6 diverse clusters that cover different aspects of the primary keyword.`

    const additionalKeywordsText = additionalKeywords.length > 0 
      ? `\nAdditional keywords to consider: ${additionalKeywords.join(', ')}` 
      : ''

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Primary Keyword: ${primaryKeyword}${additionalKeywordsText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const clusterText = completion.choices[0]?.message?.content || ''

    try {
      // Parse the JSON response from AI
      const clusterData = JSON.parse(clusterText)
      
      return NextResponse.json({
        success: true,
        data: clusterData
      })
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('AI response:', clusterText)
      
      // Fallback to basic clusters if JSON parsing fails
      const fallbackClusters = {
        clusters: [
          {
            name: 'Informational Intent',
            keywords: [
              `${primaryKeyword} guide`,
              `how to ${primaryKeyword}`,
              `${primaryKeyword} tutorial`,
              `${primaryKeyword} basics`,
              `${primaryKeyword} explained`,
              `${primaryKeyword} for beginners`,
              `${primaryKeyword} overview`,
              `${primaryKeyword} examples`
            ],
            intent: 'Informational',
            difficulty: 'Easy' as const
          },
          {
            name: 'Commercial Intent',
            keywords: [
              `${primaryKeyword} services`,
              `best ${primaryKeyword} tools`,
              `${primaryKeyword} software`,
              `${primaryKeyword} solutions`,
              `${primaryKeyword} providers`,
              `${primaryKeyword} companies`,
              `${primaryKeyword} pricing`,
              `${primaryKeyword} comparison`
            ],
            intent: 'Commercial',
            difficulty: 'Medium' as const
          },
          {
            name: 'Transactional Intent',
            keywords: [
              `buy ${primaryKeyword}`,
              `${primaryKeyword} for sale`,
              `${primaryKeyword} deals`,
              `${primaryKeyword} discount`,
              `${primaryKeyword} coupon`,
              `${primaryKeyword} purchase`,
              `${primaryKeyword} online`,
              `${primaryKeyword} store`
            ],
            intent: 'Transactional',
            difficulty: 'Easy' as const
          }
        ]
      }
      
      return NextResponse.json({
        success: true,
        data: fallbackClusters
      })
    }
  } catch (error) {
    console.error('Error generating keyword clusters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate keyword clusters' },
      { status: 500 }
    )
  }
}