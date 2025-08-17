import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      qualityGoals,
      currentQAProcess,
      testingRequirements,
      budget,
      timeline,
      teamSize,
      automationNeeds,
      complianceRequirements
    } = body;

    // Validate required fields
    if (!projectType || !qualityGoals || !testingRequirements) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, qualityGoals, testingRequirements' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Quality Assurance Engineer, analyze the following quality assurance requirements and provide comprehensive QA strategy recommendations:

Project Type: ${projectType}
Quality Goals: ${qualityGoals}
Current QA Process: ${currentQAProcess || 'Not specified'}
Testing Requirements: ${testingRequirements}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Team Size: ${teamSize || 'Not specified'}
Automation Needs: ${automationNeeds || 'Not specified'}
Compliance Requirements: ${complianceRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. QA Assessment
2. Testing Strategy
3. Test Planning
4. Automation Framework
5. Performance Testing
6. Security Testing
7. User Acceptance Testing
8. Defect Management
9. Quality Metrics
10. Implementation Timeline

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Quality Assurance Engineer with deep knowledge of testing methodologies, automation frameworks, quality metrics, and defect management. Provide practical, actionable QA guidance.'
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
        qualityGoals,
        testingRequirements,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Quality Assurance Engineer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate quality assurance recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}