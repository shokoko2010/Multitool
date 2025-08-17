import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventType,
      guestCount,
      budget,
    } = body;

    // Validate required fields
    if (!eventType || !guestCount || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, guestCount, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Catering Coordinator, analyze the following catering requirements and provide comprehensive catering coordination recommendations:

Event Type: ${eventType}
Guest Count: ${guestCount}
Budget: ${budget}
Dietary Restrictions: ${dietaryRestrictions || 'Not specified'}
Service Style: ${serviceStyle || 'Not specified'}
Venue Type: ${venueType || 'Not specified'}
Cuisine Preferences: ${cuisinePreferences || 'Not specified'}
Beverage Needs: ${beverageNeeds || 'Not specified'}

Please provide a detailed analysis including:
1. Menu Planning
2. Budget Allocation
3. Service Style
4. Vendor Selection
5. Dietary Accommodations
6. Beverage Planning
7. Service Timeline
8. Staffing Requirements
9. Equipment Needs
10. Presentation Style

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Catering Coordinator with deep knowledge of menu planning, food service, vendor management, budget coordination, and creating exceptional dining experiences. Provide practical, actionable catering coordination guidance.'
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
        eventType,
        guestCount,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Catering Coordinator API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate catering coordination recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}