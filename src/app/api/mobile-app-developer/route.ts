import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      appType,
      platform,
      appPurpose,
      targetAudience,
      featuresRequired,
      designPreferences,
      budget,
      timeline,
      technicalRequirements
    } = body;

    // Validate required fields
    if (!appType || !platform || !appPurpose) {
      return NextResponse.json(
        { error: 'Missing required fields: appType, platform, appPurpose' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Mobile App Developer, analyze the following mobile app development requirements and provide comprehensive mobile app development recommendations:

App Type: ${appType}
Platform: ${platform}
App Purpose: ${appPurpose}
Target Audience: ${targetAudience || 'Not specified'}
Features Required: ${featuresRequired}
Design Preferences: ${designPreferences || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Technology Stack
2. Development Approach
3. Feature Implementation
4. UI/UX Design
5. Development Timeline
6. Cost Estimation
7. Performance Optimization
8. Security Considerations
9. Testing Strategy
10. Deployment Plan

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Mobile App Developer with deep knowledge of mobile development, cross-platform frameworks, native development, UI/UX design, and mobile app best practices. Provide practical, actionable mobile app development guidance.'
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
        appType,
        platform,
        appPurpose,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Mobile App Developer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate mobile app development recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}