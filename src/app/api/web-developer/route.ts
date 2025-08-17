import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      websitePurpose,
      targetAudience,
      featuresRequired,
      designPreferences,
      budget,
      timeline,
      technicalRequirements,
      currentTechnology
    } = body;

    // Validate required fields
    if (!projectType || !websitePurpose || !featuresRequired) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, websitePurpose, featuresRequired' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Web Developer, analyze the following web development requirements and provide comprehensive web development recommendations:

Project Type: ${projectType}
Website Purpose: ${websitePurpose}
Target Audience: ${targetAudience || 'Not specified'}
Features Required: ${featuresRequired}
Design Preferences: ${designPreferences || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}
Current Technology: ${currentTechnology || 'Not specified'}

Please provide a detailed analysis including:
1. Technology Stack
2. Architecture Design
3. Feature Implementation
4. Development Timeline
5. Cost Estimation
6. Security Considerations
7. Performance Optimization
8. Scalability Planning
9. Maintenance Strategy
10. Deployment Strategy

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Web Developer with deep knowledge of web technologies, programming languages, frameworks, databases, and web development best practices. Provide practical, actionable web development guidance.'
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
        websitePurpose,
        featuresRequired,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Web Developer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate web development recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}