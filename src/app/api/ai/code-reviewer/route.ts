import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion'
  line: number
  message: string
  severity: 'high' | 'medium' | 'low'
  suggestion?: string
}

interface CodeAnalysis {
  overallScore: number
  issues: CodeIssue[]
  suggestions: string[]
  metrics: {
    complexity: number
    maintainability: number
    performance: number
    security: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, language = 'javascript' } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are an expert code reviewer specializing in ${language}. Analyze the provided code and give a comprehensive review including:
1. Overall code quality score (0-100)
2. List of issues with severity levels (high, medium, low)
3. Specific suggestions for improvement
4. Metrics for complexity, maintainability, performance, and security (0-10 scale)

Format your response as JSON with the following structure:
{
  "overallScore": number,
  "issues": [
    {
      "type": "error" | "warning" | "suggestion",
      "line": number,
      "message": string,
      "severity": "high" | "medium" | "low",
      "suggestion": string
    }
  ],
  "suggestions": [string],
  "metrics": {
    "complexity": number,
    "maintainability": number,
    "performance": number,
    "security": number
  }
}

Be specific, constructive, and provide actionable feedback.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Language: ${language}\n\nCode:\n${code}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const analysisText = completion.choices[0]?.message?.content || ''

    try {
      // Parse the JSON response from AI
      const analysis: CodeAnalysis = JSON.parse(analysisText)
      
      return NextResponse.json({
        success: true,
        data: analysis
      })
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('AI response:', analysisText)
      
      // Fallback to basic analysis if JSON parsing fails
      const fallbackAnalysis: CodeAnalysis = {
        overallScore: 75,
        issues: [
          {
            type: 'warning',
            line: 1,
            message: 'AI analysis was unable to parse properly. Please review code manually.',
            severity: 'medium',
            suggestion: 'Check code syntax and logic manually.'
          }
        ],
        suggestions: [
          'Review code for best practices',
          'Ensure proper error handling',
          'Add comments for complex logic',
          'Test thoroughly before deployment'
        ],
        metrics: {
          complexity: 5,
          maintainability: 7,
          performance: 7,
          security: 8
        }
      }
      
      return NextResponse.json({
        success: true,
        data: fallbackAnalysis
      })
    }
  } catch (error) {
    console.error('Error analyzing code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze code' },
      { status: 500 }
    )
  }
}