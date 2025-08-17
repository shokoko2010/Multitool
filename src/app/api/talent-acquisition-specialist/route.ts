import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface TalentAcquisitionSpecialistRequest {
  organizationType?: string;
  industry?: string;
  currentRecruitmentProcess?: string;
  hiringChallenges?: string;
  budget?: string;
  timeline?: string;
  hiringVolume?: string;
  targetRoles?: string;
  talentMarket?: string;
  recruitmentGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TalentAcquisitionSpecialistRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentRecruitmentProcess = '',
      hiringChallenges = '',
      budget = '',
      timeline = '',
      hiringVolume = '',
      targetRoles = '',
      talentMarket = '',
      recruitmentGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Talent Acquisition Specialist, provide comprehensive talent acquisition strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Recruitment Process: ${currentRecruitmentProcess}
Hiring Challenges: ${hiringChallenges}
Budget: ${budget}
Timeline: ${timeline}
Hiring Volume: ${hiringVolume}
Target Roles: ${targetRoles}
Talent Market: ${talentMarket}
Recruitment Goals: ${recruitmentGoals}

Please provide detailed talent acquisition guidance including:
1. Talent acquisition assessment and strategy
2. Recruitment process optimization
3. Sourcing and channel strategy
4. Employer branding and value proposition
5. Candidate experience enhancement
6. Interview and selection methodologies
7. Technology and automation solutions
8. Diversity and inclusion initiatives
9. Talent pipeline development
10. Implementation roadmap and metrics

Format your response as a comprehensive talent acquisition strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Talent Acquisition Specialist with expertise in recruitment strategy, employer branding, candidate experience, and talent pipeline development. You provide practical, results-oriented talent acquisition guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const talentAcquisitionGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentRecruitmentProcess,
        hiringChallenges,
        budget,
        timeline,
        hiringVolume,
        targetRoles,
        talentMarket,
        recruitmentGoals,
        talentAcquisitionGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Talent Acquisition Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate talent acquisition guidance' },
      { status: 500 }
    );
  }
}