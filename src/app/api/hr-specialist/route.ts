import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface HRSpecialistRequest {
  organizationSize?: string;
  industry?: string;
  hrChallenges?: string;
  currentHRPractices?: string;
  budget?: string;
  timeline?: string;
  employeeCount?: string;
  strategicGoals?: string;
  technologyRequirements?: string;
  complianceRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as HRSpecialistRequest;
    
    const {
      organizationSize = '',
      industry = '',
      hrChallenges = '',
      currentHRPractices = '',
      budget = '',
      timeline = '',
      employeeCount = '',
      strategicGoals = '',
      technologyRequirements = '',
      complianceRequirements = ''
    } = body;

    if (!organizationSize.trim()) {
      return NextResponse.json(
        { error: 'Organization size is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Human Resources Specialist, provide comprehensive HR strategy and operational guidance for the following organization:

Organization Size: ${organizationSize}
Industry: ${industry}
HR Challenges: ${hrChallenges}
Current HR Practices: ${currentHRPractices}
Budget: ${budget}
Timeline: ${timeline}
Employee Count: ${employeeCount}
Strategic Goals: ${strategicGoals}
Technology Requirements: ${technologyRequirements}
Compliance Requirements: ${complianceRequirements}

Please provide detailed HR guidance including:
1. HR assessment and gap analysis
2. Talent acquisition and recruitment strategies
3. Employee development and training programs
4. Performance management systems
5. Compensation and benefits optimization
6. Employee engagement and retention strategies
7. HR technology implementation roadmap
8. Compliance and regulatory guidance
9. Workplace culture development
10. Change management and communication strategies

Format your response as a comprehensive HR strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Human Resources Specialist with expertise in talent management, organizational development, HR technology, employee relations, and strategic HR planning. You provide practical, people-focused HR guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const hrGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationSize,
        industry,
        hrChallenges,
        currentHRPractices,
        budget,
        timeline,
        employeeCount,
        strategicGoals,
        technologyRequirements,
        complianceRequirements,
        hrGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Human Resources Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate HR guidance' },
      { status: 500 }
    );
  }
}