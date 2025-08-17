import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      engagementType,
    } = body;

    // Validate required fields
    if (!engagementType || !targetAudience || !civicGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: engagementType, targetAudience, civicGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Civic Engagement Specialist, analyze the following civic engagement requirements and provide comprehensive civic participation recommendations:

Engagement Type: ${engagementType}
Target Audience: ${targetAudience}
Civic Goals: ${civicGoals}
Current Activities: ${currentActivities || 'Not specified'}
Geographic Focus: ${geographicFocus || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Resources Available: ${resourcesAvailable || 'Not specified'}

Please provide a detailed analysis including:
1. Engagement Strategy
2. Audience Analysis
3. Program Development
4. Outreach Methods
5. Partnership Building
6. Communication Plan
7. Technology Integration
8. Impact Measurement
9. Sustainability Planning
10. Implementation Timeline

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Civic Engagement Specialist with deep knowledge of civic participation, community organizing, public policy, and democratic engagement. Provide practical, actionable civic engagement guidance.'
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
        engagementType,
        targetAudience,
        civicGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Civic Engagement Specialist API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate civic engagement recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}