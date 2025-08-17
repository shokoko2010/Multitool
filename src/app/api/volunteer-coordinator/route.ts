import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationType,
      volunteerNeeds,
      programGoals,
      currentVolunteers,
      timeline,
      budget,
      targetDemographics,
      programDuration
    } = body;

    // Validate required fields
    if (!organizationType || !volunteerNeeds || !programGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationType, volunteerNeeds, programGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Volunteer Coordinator, analyze the following volunteer management requirements and provide comprehensive volunteer program recommendations:

Organization Type: ${organizationType}
Volunteer Needs: ${volunteerNeeds}
Program Goals: ${programGoals}
Current Volunteers: ${currentVolunteers || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Budget: ${budget || 'Not specified'}
Target Demographics: ${targetDemographics || 'Not specified'}
Program Duration: ${programDuration || 'Not specified'}

Please provide a detailed analysis including:
1. Volunteer Program Design
2. Recruitment Strategy
3. Training Program
4. Retention Strategies
5. Role Definitions
6. Scheduling System
7. Recognition Program
8. Communication Plan
9. Impact Measurement
10. Risk Management

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Volunteer Coordinator with deep knowledge of volunteer management, program development, recruitment strategies, and volunteer engagement. Provide practical, actionable volunteer coordination guidance.'
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
        organizationType,
        volunteerNeeds,
        programGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Volunteer Coordinator API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate volunteer coordination recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}