import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      targetAudience,
      designGoals,
      brandIdentity,
      userRequirements,
      technicalConstraints,
      budget,
      timeline,
      currentDesign
    } = body;

    // Validate required fields
    if (!projectType || !targetAudience || !designGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, targetAudience, designGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI UI/UX Designer, analyze the following design requirements and provide comprehensive UI/UX design recommendations:

Project Type: ${projectType}
Target Audience: ${targetAudience}
Design Goals: ${designGoals}
Brand Identity: ${brandIdentity || 'Not specified'}
User Requirements: ${userRequirements || 'Not specified'}
Technical Constraints: ${technicalConstraints || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Current Design: ${currentDesign || 'Not specified'}

Please provide a detailed analysis including:
1. User Research
2. Design Strategy
3. Information Architecture
4. Wireframing
5. Visual Design
6. Interaction Design
7. Prototyping
8. Usability Testing
9. Design System
10. Implementation Guidelines

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI UI/UX Designer with deep knowledge of user experience design, interface design, user research, prototyping, and design systems. Provide practical, actionable UI/UX design guidance.'
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
        projectType,
        targetAudience,
        designGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('UI/UX Designer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate UI/UX design recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}