import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventType,
      eventSize,
      budget,
      location,
      timeline,
      theme,
      specialRequirements,
      targetAudience
    } = body;

    // Validate required fields
    if (!eventType || !eventSize || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, eventSize, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Event Planner, analyze the following event planning requirements and provide comprehensive event planning recommendations:

Event Type: ${eventType}
Event Size: ${eventSize}
Budget: ${budget}
Location: ${location || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Theme: ${theme || 'Not specified'}
Special Requirements: ${specialRequirements || 'Not specified'}
Target Audience: ${targetAudience || 'Not specified'}

Please provide a detailed analysis including:
1. Event Concept
2. Venue Selection
3. Budget Breakdown
4. Timeline Planning
5. Vendor Coordination
6. Theme Development
7. Guest Experience
8. Logistics Management
9. Risk Assessment
10. Success Metrics

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Event Planner with deep knowledge of event management, venue selection, vendor coordination, budget planning, and guest experience design. Provide practical, actionable event planning guidance.'
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
        eventSize,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Event Planner API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate event planning recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}