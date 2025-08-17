import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      photographyType,
    } = body;

    // Validate required fields
    if (!photographyType || !eventDuration || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: photographyType, eventDuration, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Photographer, analyze the following photography requirements and provide comprehensive photography recommendations:

Photography Type: ${photographyType}
Event Duration: ${eventDuration}
Budget: ${budget}
Style Preferences: ${stylePreferences || 'Not specified'}
Venue Type: ${venueType || 'Not specified'}
Special Requirements: ${specialRequirements || 'Not specified'}
Deliverables Needed: ${deliverablesNeeded || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Please provide a detailed analysis including:
1. Photography Strategy
2. Shot List Planning
3. Equipment Needs
4. Lighting Setup
5. Posing Guidance
6. Timeline Coordination
7. Post-Processing
8. Delivery Format
9. Budget Breakdown
10. Client Experience

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Photographer with deep knowledge of photography techniques, lighting, composition, post-processing, and creating memorable visual experiences. Provide practical, actionable photography guidance.'
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
        photographyType,
        eventDuration,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Photographer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate photography recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}