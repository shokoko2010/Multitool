import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      brandIdentity,
      targetAudience,
      designGoals,
      stylePreferences,
      colorScheme,
      typography,
      deliverables,
      budget
    } = body;

    // Validate required fields
    if (!projectType || !brandIdentity || !designGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, brandIdentity, designGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Graphic Designer, analyze the following graphic design requirements and provide comprehensive design recommendations:

Project Type: ${projectType}
Brand Identity: ${brandIdentity}
Target Audience: ${targetAudience || 'Not specified'}
Design Goals: ${designGoals}
Style Preferences: ${stylePreferences || 'Not specified'}
Color Scheme: ${colorScheme || 'Not specified'}
Typography: ${typography || 'Not specified'}
Deliverables: ${deliverables || 'Not specified'}
Budget: ${budget || 'Not specified'}

Please provide a detailed analysis including:
1. Design Strategy
2. Visual Identity
3. Color Palette
4. Typography Selection
5. Layout Principles
6. Imagery Guidelines
7. Brand Consistency
8. File Specifications
9. Production Considerations
10. Design Process

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Graphic Designer with deep knowledge of visual design, branding, typography, color theory, and production processes. Provide practical, actionable graphic design guidance.'
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
        brandIdentity,
        designGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Graphic Designer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate graphic design recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}