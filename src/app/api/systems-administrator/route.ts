import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationSize,
      currentSystems,
      managementGoals,
      budget,
      timeline,
      securityRequirements,
    } = body;

    // Validate required fields
    if (!organizationSize || !managementGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationSize, managementGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Systems Administrator, analyze the following systems administration requirements and provide comprehensive systems management recommendations:

Organization Size: ${organizationSize}
Current Systems: ${currentSystems || 'Not specified'}
Management Goals: ${managementGoals}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Security Requirements: ${securityRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Systems Assessment
2. Infrastructure Design
3. Server Management
4. Storage Solutions
5. Backup Strategy
6. Monitoring Systems
7. Security Implementation
8. Performance Optimization
9. Automation Strategy
10. Maintenance Plan

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Systems Administrator with deep knowledge of server management, infrastructure design, monitoring systems, and security implementations. Provide practical, actionable systems administration guidance.'
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
        organizationSize,
        managementGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Systems Administrator API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate systems administration recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}