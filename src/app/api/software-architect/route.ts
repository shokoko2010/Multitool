import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      requirements,
      scale,
      performanceNeeds,
      budget,
      timeline,
      teamSize,
      technicalConstraints,
      currentArchitecture
    } = body;

    // Validate required fields
    if (!projectType || !requirements || !scale) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, requirements, scale' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Software Architect, analyze the following software architecture requirements and provide comprehensive architecture design recommendations:

Project Type: ${projectType}
Requirements: ${requirements}
Scale: ${scale}
Performance Needs: ${performanceNeeds || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Team Size: ${teamSize || 'Not specified'}
Technical Constraints: ${technicalConstraints || 'Not specified'}
Current Architecture: ${currentArchitecture || 'Not specified'}

Please provide a detailed analysis including:
1. Architecture Assessment
2. Design Pattern Selection
3. Technology Stack
4. System Components
5. Integration Strategy
6. Performance Optimization
7. Security Considerations
8. Scalability Planning
9. Implementation Strategy
10. Maintenance Considerations

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Software Architect with deep knowledge of software design patterns, system architecture, scalability, and performance optimization. Provide practical, actionable software architecture guidance.'
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
        requirements,
        scale,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Software Architect API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate software architecture recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}