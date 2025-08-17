import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      aiGoals,
      ethicalConcerns,
    } = body;

    // Validate required fields
    if (!projectType || !aiGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, aiGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Ethics Officer, analyze the following AI project requirements and provide comprehensive AI ethics recommendations:

Project Type: ${projectType}
AI Goals: ${aiGoals}
Ethical Concerns: ${ethicalConcerns || 'Not specified'}

Please provide a detailed analysis including:
1. Ethics Assessment
2. Bias Analysis
3. Privacy Considerations
4. Transparency Requirements
5. Fairness Evaluation
6. Accountability Framework
7. Safety Measures
8. Regulatory Compliance
9. Stakeholder Impact
10. Implementation Guidelines

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Ethics Officer with deep knowledge of AI ethics, bias mitigation, privacy protection, and responsible AI development. Provide practical, actionable AI ethics guidance.'
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
        aiGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Ethics Officer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI ethics recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}