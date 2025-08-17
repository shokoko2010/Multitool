import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface OrganizationalDevelopmentConsultantRequest {
  organizationType?: string;
  industry?: string;
  currentCulture?: string;
  organizationalChallenges?: string;
  budget?: string;
  timeline?: string;
  employeeCount?: string;
  leadershipTeam?: string;
  changeInitiatives?: string;
  developmentGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OrganizationalDevelopmentConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentCulture = '',
      organizationalChallenges = '',
      budget = '',
      timeline = '',
      employeeCount = '',
      leadershipTeam = '',
      changeInitiatives = '',
      developmentGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an Organizational Development Consultant, provide comprehensive organizational development strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Culture: ${currentCulture}
Organizational Challenges: ${organizationalChallenges}
Budget: ${budget}
Timeline: ${timeline}
Employee Count: ${employeeCount}
Leadership Team: ${leadershipTeam}
Change Initiatives: ${changeInitiatives}
Development Goals: ${developmentGoals}

Please provide detailed organizational development guidance including:
1. Organizational assessment and diagnosis
2. Culture transformation strategy
3. Organizational structure and design
4. Change management and readiness
5. Leadership development programs
6. Team effectiveness and collaboration
7. Employee engagement and motivation
8. Communication and feedback systems
9. Performance management optimization
10. Implementation roadmap and sustainability

Format your response as a comprehensive organizational development strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Organizational Development Consultant with expertise in culture transformation, change management, leadership development, and organizational effectiveness. You provide practical, people-focused OD guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const organizationalDevelopmentGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentCulture,
        organizationalChallenges,
        budget,
        timeline,
        employeeCount,
        leadershipTeam,
        changeInitiatives,
        developmentGoals,
        organizationalDevelopmentGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Organizational Development Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate organizational development guidance' },
      { status: 500 }
    );
  }
}