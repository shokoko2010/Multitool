import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface PublicRelationsSpecialistRequest {
  organizationType?: string;
  industry?: string;
  currentPRState?: string;
  targetAudience?: string;
  communicationGoals?: string;
  budget?: string;
  timeline?: string;
  mediaLandscape?: string;
  keyMessages?: string;
  crisisHistory?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PublicRelationsSpecialistRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentPRState = '',
      targetAudience = '',
      communicationGoals = '',
      budget = '',
      timeline = '',
      mediaLandscape = '',
      keyMessages = '',
      crisisHistory = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Public Relations Specialist, provide comprehensive public relations strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current PR State: ${currentPRState}
Target Audience: ${targetAudience}
Communication Goals: ${communicationGoals}
Budget: ${budget}
Timeline: ${timeline}
Media Landscape: ${mediaLandscape}
Key Messages: ${keyMessages}
Crisis History: ${crisisHistory}

Please provide detailed public relations guidance including:
1. PR assessment and audit
2. Media relations strategy
3. Communication planning and messaging
4. Stakeholder engagement approach
5. Media outreach and pitching strategy
6. Content development and storytelling
7. Social media and digital PR
8. Measurement and evaluation framework
9. Crisis communication preparedness
10. Implementation roadmap and resource planning

Format your response as a comprehensive public relations strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Public Relations Specialist with expertise in media relations, communication strategy, crisis management, and reputation building. You provide practical, strategic PR guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const prGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentPRState,
        targetAudience,
        communicationGoals,
        budget,
        timeline,
        mediaLandscape,
        keyMessages,
        crisisHistory,
        prGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Public Relations Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate public relations guidance' },
      { status: 500 }
    );
  }
}