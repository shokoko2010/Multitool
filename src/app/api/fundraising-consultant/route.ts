import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationType,
      fundraisingGoal,
      timeline,
      cause,
      currentResources,
      targetAudience,
      fundraisingExperience,
      legalRequirements
    } = body;

    // Validate required fields
    if (!organizationType || !fundraisingGoal || !cause) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationType, fundraisingGoal, cause' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Fundraising Consultant, analyze the following fundraising requirements and provide comprehensive fundraising strategy recommendations:

Organization Type: ${organizationType}
Fundraising Goal: ${fundraisingGoal}
Timeline: ${timeline || 'Not specified'}
Cause: ${cause}
Current Resources: ${currentResources || 'Not specified'}
Target Audience: ${targetAudience || 'Not specified'}
Fundraising Experience: ${fundraisingExperience || 'Not specified'}
Legal Requirements: ${legalRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Fundraising Strategy
2. Donor Segmentation
3. Campaign Planning
4. Channel Selection
5. Messaging Strategy
6. Budget Allocation
7. Team Structure
8. Technology Tools
9. Compliance Considerations
10. Success Metrics

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Fundraising Consultant with deep knowledge of fundraising strategies, donor management, campaign planning, and nonprofit development. Provide practical, actionable fundraising guidance.'
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
        fundraisingGoal,
        cause,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Fundraising Consultant API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate fundraising recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}