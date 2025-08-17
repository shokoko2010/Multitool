import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      arvrGoals,
      targetPlatforms,
    } = body;

    // Validate required fields
    if (!projectType || !arvrGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, arvrGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI AR/VR Developer, analyze the following AR/VR project requirements and provide comprehensive AR/VR implementation recommendations:

Project Type: ${projectType}
AR/VR Goals: ${arvrGoals}
Target Platforms: ${targetPlatforms || 'Not specified'}

Please provide a detailed analysis including:
1. AR/VR Assessment
2. Technology Selection
3. Development Approach
4. User Experience Design
5. Content Creation
6. Performance Optimization
7. Testing Strategy
8. Deployment Plan
9. Maintenance Considerations
10. Implementation Roadmap

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI AR/VR Developer with deep knowledge of AR/VR technologies, 3D development, user experience design, and performance optimization. Provide practical, actionable AR/VR development guidance.'
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
        arvrGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AR/VR Developer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AR/VR development recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}