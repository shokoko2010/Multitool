import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      venueType,
      capacity,
      budget,
      location,
    } = body;

    // Validate required fields
    if (!venueType || !capacity || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: venueType, capacity, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Venue Manager, analyze the following venue management requirements and provide comprehensive venue management recommendations:

Venue Type: ${venueType}
Capacity: ${capacity}
Budget: ${budget}
Location: ${location || 'Not specified'}
Event Types: ${eventTypes || 'Not specified'}
Amenities Needed: ${amenitiesNeeded || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}
Accessibility Needs: ${accessibilityNeeds || 'Not specified'}

Please provide a detailed analysis including:
1. Venue Assessment
2. Space Optimization
3. Budget Management
4. Amenities Planning
5. Technical Setup
6. Staffing Requirements
7. Safety Compliance
8. Guest Experience
9. Maintenance Planning
10. Booking Strategy

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Venue Manager with deep knowledge of venue operations, space optimization, event coordination, budget management, and creating exceptional venue experiences. Provide practical, actionable venue management guidance.'
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
        venueType,
        capacity,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Venue Manager API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate venue management recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}