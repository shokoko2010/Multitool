import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      videoType,
      targetAudience,
      message,
      platform,
      budget,
      timeline,
      stylePreferences,
      duration,
      technicalRequirements
    } = body;

    // Validate required fields
    if (!videoType || !targetAudience || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: videoType, targetAudience, message' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Video Producer, analyze the following video production requirements and provide comprehensive video production recommendations:

Video Type: ${videoType}
Target Audience: ${targetAudience}
Message: ${message}
Platform: ${platform || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Style Preferences: ${stylePreferences || 'Not specified'}
Duration: ${duration || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Video Strategy
2. Script Development
3. Production Planning
4. Visual Style
5. Audio Design
6. Equipment Needs
7. Post-Production
8. Distribution Strategy
9. Performance Metrics
10. Budget Breakdown

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Video Producer with deep knowledge of video production, storytelling, visual communication, and multimedia content creation. Provide practical, actionable video production guidance.'
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
        videoType,
        targetAudience,
        message,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Video Producer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate video production recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}