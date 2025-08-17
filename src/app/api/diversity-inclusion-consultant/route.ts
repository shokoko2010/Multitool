import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DiversityInclusionConsultantRequest {
  organizationType?: string;
  industry?: string;
  currentDEIState?: string;
  diversityChallenges?: string;
  budget?: string;
  timeline?: string;
  employeeCount?: string;
  leadershipCommitment?: string;
  regulatoryEnvironment?: string;
  inclusionGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DiversityInclusionConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentDEIState = '',
      diversityChallenges = '',
      budget = '',
      timeline = '',
      employeeCount = '',
      leadershipCommitment = '',
      regulatoryEnvironment = '',
      inclusionGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Diversity & Inclusion Consultant, provide comprehensive diversity, equity, and inclusion strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current DEI State: ${currentDEIState}
Diversity Challenges: ${diversityChallenges}
Budget: ${budget}
Timeline: ${timeline}
Employee Count: ${employeeCount}
Leadership Commitment: ${leadershipCommitment}
Regulatory Environment: ${regulatoryEnvironment}
Inclusion Goals: ${inclusionGoals}

Please provide detailed DEI guidance including:
1. DEI assessment and gap analysis
2. Diversity strategy and recruitment
3. Inclusive culture development
4. Equity and fairness frameworks
5. Bias awareness and training
6. Employee resource groups
7. Inclusive leadership development
8. Measurement and accountability
9. Policy and procedure review
10. Implementation roadmap and sustainability

Format your response as a comprehensive DEI strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Diversity & Inclusion Consultant with expertise in DEI strategy, inclusive culture development, bias training, and organizational equity. You provide practical, transformative DEI guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const deiGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentDEIState,
        diversityChallenges,
        budget,
        timeline,
        employeeCount,
        leadershipCommitment,
        regulatoryEnvironment,
        inclusionGoals,
        deiGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Diversity & Inclusion Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate DEI guidance' },
      { status: 500 }
    );
  }
}