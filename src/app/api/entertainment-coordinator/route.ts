import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventType,
      audienceDemographics,
      budget,
    } = body;

    // Validate required fields
    if (!eventType || !audienceDemographics || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, audienceDemographics, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Entertainment Coordinator, analyze the following entertainment coordination requirements and provide comprehensive entertainment recommendations:

Event Type: ${eventType}
Audience Demographics: ${audienceDemographics}
Budget: ${budget}
Entertainment Preferences: ${entertainmentPreferences || 'Not specified'}
Venue Type: ${venueType || 'Not specified'}
Duration: ${duration || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}
Special Requests: ${specialRequests || 'Not specified'}

Please provide a detailed analysis including:
1. Entertainment Strategy
2. Talent Selection
3. Budget Allocation
4. Technical Requirements
5. Performance Scheduling
6. Audience Engagement
7. Backup Plans
8. Contract Management
9. Logistics Coordination
10. Experience Enhancement

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Entertainment Coordinator with deep knowledge of talent booking, performance management, technical production, budget coordination, and creating memorable entertainment experiences. Provide practical, actionable entertainment coordination guidance.'
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
        audienceDemographics,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Entertainment Coordinator API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate entertainment coordination recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}