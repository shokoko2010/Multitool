import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface WorkplaceWellnessConsultantRequest {
  organizationType?: string;
  industry?: string;
  currentWellnessPrograms?: string;
  wellnessChallenges?: string;
  budget?: string;
  timeline?: string;
  employeeCount?: string;
  workplaceCulture?: string;
  healthRisks?: string;
  wellnessGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WorkplaceWellnessConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentWellnessPrograms = '',
      wellnessChallenges = '',
      budget = '',
      timeline = '',
      employeeCount = '',
      workplaceCulture = '',
      healthRisks = '',
      wellnessGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Workplace Wellness Consultant, provide comprehensive workplace wellness strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Wellness Programs: ${currentWellnessPrograms}
Wellness Challenges: ${wellnessChallenges}
Budget: ${budget}
Timeline: ${timeline}
Employee Count: ${employeeCount}
Workplace Culture: ${workplaceCulture}
Health Risks: ${healthRisks}
Wellness Goals: ${wellnessGoals}

Please provide detailed workplace wellness guidance including:
1. Wellness needs assessment
2. Mental health and wellbeing programs
3. Physical health and fitness initiatives
4. Work-life balance strategies
5. Stress management and resilience
6. Healthy workplace environment
7. Wellness communication and engagement
8. Leadership support and culture
9. Measurement and evaluation framework
10. Implementation roadmap and sustainability

Format your response as a comprehensive workplace wellness strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Workplace Wellness Consultant with expertise in employee wellbeing, mental health, work-life balance, and organizational health. You provide practical, holistic wellness guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const wellnessGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentWellnessPrograms,
        wellnessChallenges,
        budget,
        timeline,
        employeeCount,
        workplaceCulture,
        healthRisks,
        wellnessGoals,
        wellnessGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Workplace Wellness Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate workplace wellness guidance' },
      { status: 500 }
    );
  }
}