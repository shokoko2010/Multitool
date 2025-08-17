import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationType,
      mission,
    } = body;

    // Validate required fields
    if (!organizationType || !mission || !challenges) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationType, mission, challenges' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Nonprofit Consultant, analyze the following nonprofit organization requirements and provide comprehensive nonprofit management recommendations:

Organization Type: ${organizationType}
Mission: ${mission}
Challenges: ${challenges}
Current Programs: ${currentPrograms || 'Not specified'}
Budget: ${budget || 'Not specified'}
Staff Size: ${staffSize || 'Not specified'}
Target Beneficiaries: ${targetBeneficiaries || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Please provide a detailed analysis including:
1. Organizational Assessment
2. Strategic Planning
3. Program Development
4. Financial Management
5. Fundraising Strategy
6. Board Development
7. Marketing and Outreach
8. Impact Measurement
9. Compliance Requirements
10. Growth Strategy

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Nonprofit Consultant with deep knowledge of nonprofit management, strategic planning, program development, fundraising, and organizational development. Provide practical, actionable nonprofit guidance.'
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
        mission,
        challenges,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Nonprofit Consultant API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate nonprofit consulting recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}