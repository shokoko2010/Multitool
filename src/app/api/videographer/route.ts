import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      videoType,
    } = body;

    // Validate required fields
    if (!videoType || !eventDuration || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: videoType, eventDuration, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Videographer, analyze the following videography requirements and provide comprehensive videography recommendations:

Video Type: ${videoType}
Event Duration: ${eventDuration}
Budget: ${budget}
Style Preferences: ${stylePreferences || 'Not specified'}
Venue Type: ${venueType || 'Not specified'}
Special Requirements: ${specialRequirements || 'Not specified'}
Deliverables Needed: ${deliverablesNeeded || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Please provide a detailed analysis including:
1. Video Strategy
2. Shot Planning
3. Equipment Needs
4. Audio Setup
5. Lighting Requirements
6. Timeline Coordination
7. Post-Production
8. Editing Style
9. Delivery Format
10. Budget Breakdown

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Videographer with deep knowledge of video production, camera techniques, audio recording, editing, and creating compelling visual stories. Provide practical, actionable videography guidance.'
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
        eventDuration,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Videographer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate videography recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}