import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      weddingStyle,
      guestCount,
      budget,
      venueType,
      date,
      season,
      specialRequests,
      culturalConsiderations
    } = body;

    // Validate required fields
    if (!weddingStyle || !guestCount || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: weddingStyle, guestCount, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Wedding Planner, analyze the following wedding planning requirements and provide comprehensive wedding planning recommendations:

Wedding Style: ${weddingStyle}
Guest Count: ${guestCount}
Budget: ${budget}
Venue Type: ${venueType || 'Not specified'}
Date: ${date || 'Not specified'}
Season: ${season || 'Not specified'}
Special Requests: ${specialRequests || 'Not specified'}
Cultural Considerations: ${culturalConsiderations || 'Not specified'}

Please provide a detailed analysis including:
1. Wedding Concept
2. Venue Selection
3. Budget Allocation
4. Timeline Planning
5. Vendor Selection
6. Theme Development
7. Guest Experience
8. Ceremony Planning
9. Reception Planning
10. Day-of Coordination

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Wedding Planner with deep knowledge of wedding traditions, venue selection, vendor coordination, budget management, and wedding day logistics. Provide practical, actionable wedding planning guidance.'
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
        weddingStyle,
        guestCount,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Wedding Planner API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate wedding planning recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}