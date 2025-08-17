import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface TeamBuildingFacilitatorRequest {
  teamType?: string;
  industry?: string;
  teamChallenges?: string;
  teamSize?: string;
  budget?: string;
  timeline?: string;
  currentTeamDynamics?: string;
  teamGoals?: string;
  organizationalContext?: string;
  facilitationObjectives?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TeamBuildingFacilitatorRequest;
    
    const {
      teamType = '',
      industry = '',
      teamChallenges = '',
      teamSize = '',
      budget = '',
      timeline = '',
      currentTeamDynamics = '',
      teamGoals = '',
      organizationalContext = '',
      facilitationObjectives = ''
    } = body;

    if (!teamType.trim()) {
      return NextResponse.json(
        { error: 'Team type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Team Building Facilitator, provide comprehensive team building strategy and facilitation guidance for the following team:

Team Type: ${teamType}
Industry: ${industry}
Team Challenges: ${teamChallenges}
Team Size: ${teamSize}
Budget: ${budget}
Timeline: ${timeline}
Current Team Dynamics: ${currentTeamDynamics}
Team Goals: ${teamGoals}
Organizational Context: ${organizationalContext}
Facilitation Objectives: ${facilitationObjectives}

Please provide detailed team building guidance including:
1. Team assessment and dynamics analysis
2. Team development interventions
3. Communication and collaboration strategies
4. Trust building and relationship development
5. Conflict resolution and team harmony
6. Role clarification and accountability
7. Team goals alignment and motivation
8. Team building activities and exercises
9. Facilitation techniques and approaches
10. Implementation plan and sustainability

Format your response as a comprehensive team building strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Team Building Facilitator with expertise in team dynamics, group facilitation, conflict resolution, and organizational psychology. You provide practical, experiential team building guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const teamBuildingGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        teamType,
        industry,
        teamChallenges,
        teamSize,
        budget,
        timeline,
        currentTeamDynamics,
        teamGoals,
        organizationalContext,
        facilitationObjectives,
        teamBuildingGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Team Building Facilitator API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate team building guidance' },
      { status: 500 }
    );
  }
}