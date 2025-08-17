import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ChangeManagementConsultantRequest {
  organizationType?: string;
  changeInitiative?: string;
  scopeOfChange?: string;
  organizationalCulture?: string;
  budget?: string;
  timeline?: string;
  stakeholderGroups?: string;
  resistanceFactors?: string;
  successMetrics?: string;
  communicationNeeds?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChangeManagementConsultantRequest;
    
    const {
      organizationType = '',
      changeInitiative = '',
      scopeOfChange = '',
      organizationalCulture = '',
      budget = '',
      timeline = '',
      stakeholderGroups = '',
      resistanceFactors = '',
      successMetrics = '',
      communicationNeeds = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Change Management Consultant, provide comprehensive change management strategy and implementation guidance for the following organizational change:

Organization Type: ${organizationType}
Change Initiative: ${changeInitiative}
Scope of Change: ${scopeOfChange}
Organizational Culture: ${organizationalCulture}
Budget: ${budget}
Timeline: ${timeline}
Stakeholder Groups: ${stakeholderGroups}
Resistance Factors: ${resistanceFactors}
Success Metrics: ${successMetrics}
Communication Needs: ${communicationNeeds}

Please provide detailed change management guidance including:
1. Change readiness assessment
2. Stakeholder analysis and engagement strategy
3. Change impact assessment
4. Communication and training plan
5. Resistance management strategies
6. Leadership alignment and sponsorship
7. Change agent network development
8. Performance measurement and feedback
9. Sustainability and reinforcement strategies
10. Implementation roadmap and timeline

Format your response as a comprehensive change management strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Change Management Consultant with expertise in organizational change, transformation management, stakeholder engagement, and change communication strategies. You provide practical, people-focused change management guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const changeManagementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        changeInitiative,
        scopeOfChange,
        organizationalCulture,
        budget,
        timeline,
        stakeholderGroups,
        resistanceFactors,
        successMetrics,
        communicationNeeds,
        changeManagementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Change Management Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate change management guidance' },
      { status: 500 }
    );
  }
}