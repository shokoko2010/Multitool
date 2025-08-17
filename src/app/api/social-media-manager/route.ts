import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessType,
      targetAudience,
      socialMediaGoals,
      currentPlatforms,
      contentStrategy,
      budget,
      teamSize,
      timeline,
      brandVoice
    } = body;

    // Validate required fields
    if (!businessType || !targetAudience || !socialMediaGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: businessType, targetAudience, socialMediaGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Social Media Manager, analyze the following social media requirements and provide comprehensive social media strategy recommendations:

Business Type: ${businessType}
Target Audience: ${targetAudience}
Social Media Goals: ${socialMediaGoals}
Current Platforms: ${currentPlatforms || 'Not specified'}
Content Strategy: ${contentStrategy || 'Not specified'}
Budget: ${budget || 'Not specified'}
Team Size: ${teamSize || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Brand Voice: ${brandVoice || 'Not specified'}

Please provide a detailed analysis including:
1. Platform Selection
2. Content Strategy
3. Posting Schedule
4. Engagement Tactics
5. Growth Strategies
6. Analytics and Metrics
7. Budget Allocation
8. Team Management
9. Crisis Management
10. Implementation Plan

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Social Media Manager with deep knowledge of social media platforms, content strategy, audience engagement, and digital marketing. Provide practical, actionable social media management guidance.'
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
        businessType,
        targetAudience,
        socialMediaGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Social Media Manager API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate social media management recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}