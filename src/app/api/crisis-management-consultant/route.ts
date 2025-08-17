import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CrisisManagementConsultantRequest {
  organizationType?: string;
  industry?: string;
  crisisScenario?: string;
  currentPreparedness?: string;
  stakeholders?: string;
  budget?: string;
  timeline?: string;
  regulatoryEnvironment?: string;
  communicationChannels?: string;
  riskAssessment?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CrisisManagementConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      crisisScenario = '',
      currentPreparedness = '',
      stakeholders = '',
      budget = '',
      timeline = '',
      regulatoryEnvironment = '',
      communicationChannels = '',
      riskAssessment = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Crisis Management Consultant, provide comprehensive crisis management strategy and preparedness guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Crisis Scenario: ${crisisScenario}
Current Preparedness: ${currentPreparedness}
Stakeholders: ${stakeholders}
Budget: ${budget}
Timeline: ${timeline}
Regulatory Environment: ${regulatoryEnvironment}
Communication Channels: ${communicationChannels}
Risk Assessment: ${riskAssessment}

Please provide detailed crisis management guidance including:
1. Crisis risk assessment and vulnerability analysis
2. Crisis management framework development
3. Crisis team structure and roles
4. Communication strategy and messaging
5. Stakeholder management approach
6. Media and public relations protocols
7. Business continuity and recovery planning
8. Legal and regulatory compliance
9. Training and simulation exercises
10. Monitoring and early warning systems

Format your response as a comprehensive crisis management strategy with actionable recommendations and implementation guidance    const.`;

 completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Crisis Management Consultant with expertise in crisis planning, risk assessment, communication strategies, and organizational resilience. You provide practical, proactive crisis management guidance with implementation approaches.'
        },
                        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const crisisManagementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        crisisScenario,
        currentPreparedness,
        stakeholders,
        budget,
        timeline,
        regulatoryEnvironment,
        communicationChannels,
        riskAssessment,
        crisisManagementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Crisis Management Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate crisis management guidance' },
      { status: 500 }
    );
  }
}