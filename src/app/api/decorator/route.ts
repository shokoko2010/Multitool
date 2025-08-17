import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventType,
      venueType,
      budget,
    } = body;

    // Validate required fields
    if (!eventType || !venueType || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, venueType, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Decorator, analyze the following decoration requirements and provide comprehensive decoration recommendations:

Event Type: ${eventType}
Venue Type: ${venueType}
Budget: ${budget}
Theme Preferences: ${themePreferences || 'Not specified'}
Color Scheme: ${colorScheme || 'Not specified'}
Venue Size: ${venueSize || 'Not specified'}
Style Preferences: ${stylePreferences || 'Not specified'}
Special Requirements: ${specialRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Design Concept
2. Color Palette
3. Theme Development
4. Space Planning
5. Decor Elements
6. Lighting Design
7. Floral Arrangements
8. Furniture Selection
9. Budget Breakdown
10. Installation Timeline

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Decorator with deep knowledge of interior design, event styling, color theory, space planning, and creating visually stunning environments. Provide practical, actionable decoration guidance.'
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
        venueType,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Decorator API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate decoration recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}