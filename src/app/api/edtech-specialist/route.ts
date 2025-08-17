import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface EdTechSpecialistRequest {
  educationalContext?: string;
  targetAudience?: string;
  learningObjectives?: string;
  technologyRequirements?: string;
  budget?: string;
  timeline?: string;
  existingInfrastructure?: string;
  accessibilityNeeds?: string;
  assessmentMethods?: string;
  integrationRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EdTechSpecialistRequest;
    
    const {
      educationalContext = '',
      targetAudience = '',
      learningObjectives = '',
      technologyRequirements = '',
      budget = '',
      timeline = '',
      existingInfrastructure = '',
      accessibilityNeeds = '',
      assessmentMethods = '',
      integrationRequirements = ''
    } = body;

    if (!educationalContext.trim()) {
      return NextResponse.json(
        { error: 'Educational context is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an Educational Technology Specialist, provide comprehensive edtech strategy and implementation guidance for the following educational initiative:

Educational Context: ${educationalContext}
Target Audience: ${targetAudience}
Learning Objectives: ${learningObjectives}
Technology Requirements: ${technologyRequirements}
Budget: ${budget}
Timeline: ${timeline}
Existing Infrastructure: ${existingInfrastructure}
Accessibility Needs: ${accessibilityNeeds}
Assessment Methods: ${assessmentMethods}
Integration Requirements: ${integrationRequirements}

Please provide detailed edtech guidance including:
1. Technology selection and evaluation
2. Learning management system recommendations
3. Digital content strategy
4. Implementation roadmap
5. Training and support plan
6. Accessibility and inclusion strategies
7. Data privacy and security considerations
8. Assessment and analytics framework
9. Change management approach
10. Evaluation and improvement methodology

Format your response as a comprehensive educational technology strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Educational Technology Specialist with expertise in learning management systems, digital pedagogy, educational technology integration, and instructional design. You provide practical, research-based edtech guidance with implementation strategies.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const edtechGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        educationalContext,
        targetAudience,
        learningObjectives,
        technologyRequirements,
        budget,
        timeline,
        existingInfrastructure,
        accessibilityNeeds,
        assessmentMethods,
        integrationRequirements,
        edtechGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Educational Technology Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate edtech guidance' },
      { status: 500 }
    );
  }
}