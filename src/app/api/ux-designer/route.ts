import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      targetAudience,
      businessGoals,
      userNeeds,
      currentIssues,
      platform,
      budget,
      timeline,
      constraints
    } = body;

    // Validate required fields
    if (!projectType || !targetAudience || !businessGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, targetAudience, businessGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI UX Designer, analyze the following UX design requirements and provide comprehensive user experience design recommendations:

Project Type: ${projectType}
Target Audience: ${targetAudience}
Business Goals: ${businessGoals}
User Needs: ${userNeeds || 'Not specified'}
Current Issues: ${currentIssues || 'Not specified'}
Platform: ${platform || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Constraints: ${constraints || 'Not specified'}

Please provide a detailed analysis including:
1. User Research
2. User Personas
3. Information Architecture
4. Wireframing
5. Prototyping
6. Usability Testing
7. Design Systems
8. Accessibility
9. Interaction Design
10. Implementation Strategy

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI UX Designer with deep knowledge of user research, information architecture, interaction design, and usability testing. Provide practical, actionable UX design guidance.'
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
        businessGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('UX Designer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate UX design recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}