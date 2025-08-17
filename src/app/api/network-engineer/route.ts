import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationSize,
      currentNetworkSetup,
      networkRequirements,
      budget,
      timeline,
      securityNeeds,
      scalabilityRequirements,
      performanceGoals
    } = body;

    // Validate required fields
    if (!organizationSize || !networkRequirements) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationSize, networkRequirements' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Network Engineer, analyze the following network requirements and provide comprehensive network design recommendations:

Organization Size: ${organizationSize}
Current Network Setup: ${currentNetworkSetup || 'Not specified'}
Network Requirements: ${networkRequirements}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Security Needs: ${securityNeeds || 'Not specified'}
Scalability Requirements: ${scalabilityRequirements || 'Not specified'}
Performance Goals: ${performanceGoals || 'Not specified'}

Please provide a detailed analysis including:
1. Network Assessment
2. Network Architecture
3. Hardware Recommendations
4. Software Solutions
5. Security Implementation
6. Performance Optimization
7. Scalability Planning
8. Monitoring Strategy
9. Implementation Timeline
10. Maintenance Plan

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Network Engineer with deep knowledge of network design, routing protocols, security implementations, and network optimization. Provide practical, actionable network engineering guidance.'
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
        networkRequirements,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Network Engineer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate network engineering recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}