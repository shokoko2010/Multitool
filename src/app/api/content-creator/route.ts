import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      contentType,
      targetAudience,
      contentGoals,
      brandVoice,
      topics,
      platforms,
      contentFrequency,
      budget,
      teamResources
    } = body;

    // Validate required fields
    if (!contentType || !targetAudience || !contentGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: contentType, targetAudience, contentGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Content Creator, analyze the following content requirements and provide comprehensive content creation recommendations:

Content Type: ${contentType}
Target Audience: ${targetAudience}
Content Goals: ${contentGoals}
Brand Voice: ${brandVoice || 'Not specified'}
Topics: ${topics || 'Not specified'}
Platforms: ${platforms || 'Not specified'}
Content Frequency: ${contentFrequency || 'Not specified'}
Budget: ${budget || 'Not specified'}
Team Resources: ${teamResources || 'Not specified'}

Please provide a detailed analysis including:
1. Content Strategy
2. Topic Research
3. Content Planning
4. Creation Process
5. Distribution Strategy
6. Engagement Tactics
7. Performance Metrics
8. Optimization Tips
9. Content Calendar
10. Resource Management

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Content Creator with deep knowledge of content strategy, writing techniques, audience engagement, and content marketing. Provide practical, actionable content creation guidance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    let analysis;
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      analysis = {
        rawAnalysis: responseContent,
        message: 'AI response was not in valid JSON format, but contains valuable insights'
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        contentType,
        targetAudience,
        contentGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Content Creator API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate content creation recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}