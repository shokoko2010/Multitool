import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      partyType,
      guestCount,
      budget,
      venue,
      occasion,
      theme,
      ageGroup,
      specialActivities
    } = body;

    // Validate required fields
    if (!partyType || !guestCount || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: partyType, guestCount, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Party Planner, analyze the following party planning requirements and provide comprehensive party planning recommendations:

Party Type: ${partyType}
Guest Count: ${guestCount}
Budget: ${budget}
Venue: ${venue || 'Not specified'}
Occasion: ${occasion || 'Not specified'}
Theme: ${theme || 'Not specified'}
Age Group: ${ageGroup || 'Not specified'}
Special Activities: ${specialActivities || 'Not specified'}

Please provide a detailed analysis including:
1. Party Concept
2. Theme Development
3. Budget Breakdown
4. Entertainment Planning
5. Food and Beverage
6. Decorations
7. Music and Atmosphere
8. Activities and Games
9. Timeline Planning
10. Guest Experience

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Party Planner with deep knowledge of party themes, entertainment planning, budget management, guest experience design, and party logistics. Provide practical, actionable party planning guidance.'
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
        partyType,
        guestCount,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Party Planner API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate party planning recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}