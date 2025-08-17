import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface LeadershipCoachRequest {
  leadershipLevel?: string;
  industry?: string;
  currentLeadershipStyle?: string;
  leadershipChallenges?: string;
  budget?: string;
  timeline?: string;
  teamSize?: string;
  organizationalContext?: string;
  developmentGoals?: string;
  coachingFocus?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LeadershipCoachRequest;
    
    const {
      leadershipLevel = '',
      industry = '',
      currentLeadershipStyle = '',
      leadershipChallenges = '',
      budget = '',
      timeline = '',
      teamSize = '',
      organizationalContext = '',
      developmentGoals = '',
      coachingFocus = ''
    } = body;

    if (!leadershipLevel.trim()) {
      return NextResponse.json(
        { error: 'Leadership level is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Leadership Coach, provide comprehensive leadership development strategy and coaching guidance for the following leader:

Leadership Level: ${leadershipLevel}
Industry: ${industry}
Current Leadership Style: ${currentLeadershipStyle}
Leadership Challenges: ${leadershipChallenges}
Budget: ${budget}
Timeline: ${timeline}
Team Size: ${teamSize}
Organizational Context: ${organizationalContext}
Development Goals: ${developmentGoals}
Coaching Focus: ${coachingFocus}

Please provide detailed leadership coaching guidance including:
1. Leadership assessment and self-awareness
2. Leadership style development and adaptation
3. Communication and influence strategies
4. Emotional intelligence and relationship building
5. Strategic thinking and decision making
6. Team leadership and motivation
7. Change management and resilience
8. Conflict resolution and negotiation
9. Personal branding and executive presence
10. Development plan and action steps

Format your response as a comprehensive leadership coaching strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Leadership Coach with expertise in executive coaching, leadership development, emotional intelligence, and organizational leadership. You provide practical, transformative leadership guidance with actionable development approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const leadershipGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        leadershipLevel,
        industry,
        currentLeadershipStyle,
        leadershipChallenges,
        budget,
        timeline,
        teamSize,
        organizationalContext,
        developmentGoals,
        coachingFocus,
        leadershipGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Leadership Coach API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate leadership coaching guidance' },
      { status: 500 }
    );
  }
}