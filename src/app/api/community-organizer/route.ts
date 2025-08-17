import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      communityType,
      initiativeType,
    } = body;

    // Validate required fields
    if (!communityType || !initiativeType || !goals) {
      return NextResponse.json(
        { error: 'Missing required fields: communityType, initiativeType, goals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Community Organizer, analyze the following community organization requirements and provide comprehensive community building recommendations:

Community Type: ${communityType}
Initiative Type: ${initiativeType}
Goals: ${goals}
Current Resources: ${currentResources || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Budget: ${budget || 'Not specified'}
Target Population: ${targetPopulation || 'Not specified'}
Challenges: ${challenges || 'Not specified'}

Please provide a detailed analysis including:
1. Community Assessment
2. Engagement Strategy
3. Program Development
4. Resource Mobilization
5. Partnership Building
6. Communication Plan
7. Volunteer Recruitment
8. Impact Measurement
9. Sustainability Planning
10. Implementation Timeline

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Community Organizer with deep knowledge of community development, engagement strategies, program planning, and resource mobilization. Provide practical, actionable community organization guidance.'
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
        communityType,
        initiativeType,
        goals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Community Organizer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate community organization recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}