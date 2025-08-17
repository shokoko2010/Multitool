import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DevOpsConsultantRequest {
  organizationType?: string;
  industry?: string;
  currentDevOpsState?: string;
  developmentChallenges?: string;
  budget?: string;
  timeline?: string;
  teamSize?: string;
  technologyStack?: string;
  automationGoals?: string;
  deploymentFrequency?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DevOpsConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentDevOpsState = '',
      developmentChallenges = '',
      budget = '',
      timeline = '',
      teamSize = '',
      technologyStack = '',
      automationGoals = '',
      deploymentFrequency = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a DevOps Consultant, provide comprehensive DevOps strategy and implementation guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current DevOps State: ${currentDevOpsState}
Development Challenges: ${developmentChallenges}
Budget: ${budget}
Timeline: ${timeline}
Team Size: ${teamSize}
Technology Stack: ${technologyStack}
Automation Goals: ${automationGoals}
Deployment Frequency: ${deploymentFrequency}

Please provide detailed DevOps guidance including:
1. DevOps maturity assessment
2. CI/CD pipeline design and implementation
3. Infrastructure as Code (IaC) strategy
4. Automation framework development
5. Monitoring and observability setup
6. Security integration (DevSecOps)
7. Collaboration and culture transformation
8. Toolchain selection and integration
9. Performance optimization and scaling
10. Implementation roadmap and governance

Format your response as a comprehensive DevOps strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced DevOps Consultant with expertise in CI/CD, automation, cloud infrastructure, and cultural transformation. You provide practical, results-oriented DevOps guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const devOpsGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentDevOpsState,
        developmentChallenges,
        budget,
        timeline,
        teamSize,
        technologyStack,
        automationGoals,
        deploymentFrequency,
        devOpsGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('DevOps Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate DevOps guidance' },
      { status: 500 }
    );
  }
}