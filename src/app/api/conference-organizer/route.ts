import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      conferenceType,
      expectedAttendees,
      budget,
      duration,
      location,
      targetIndustry,
      conferenceGoals,
      technicalRequirements
    } = body;

    // Validate required fields
    if (!conferenceType || !expectedAttendees || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: conferenceType, expectedAttendees, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Conference Organizer, analyze the following conference organization requirements and provide comprehensive conference planning recommendations:

Conference Type: ${conferenceType}
Expected Attendees: ${expectedAttendees}
Budget: ${budget}
Duration: ${duration || 'Not specified'}
Location: ${location || 'Not specified'}
Target Industry: ${targetIndustry || 'Not specified'}
Conference Goals: ${conferenceGoals || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Conference Strategy
2. Venue Selection
3. Budget Allocation
4. Program Development
5. Speaker Management
6. Attendee Experience
7. Technology Integration
8. Marketing Strategy
9. Logistics Planning
10. Success Metrics

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Conference Organizer with deep knowledge of conference management, venue selection, speaker coordination, program development, and attendee experience design. Provide practical, actionable conference organization guidance.'
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
        conferenceType,
        expectedAttendees,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Conference Organizer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate conference organization recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}