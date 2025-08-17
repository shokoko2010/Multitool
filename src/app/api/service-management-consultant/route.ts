import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ServiceManagementConsultantRequest {
  organizationType?: string;
  industry?: string;
  currentServiceManagement?: string;
  serviceChallenges?: string;
  budget?: string;
  timeline?: string;
  servicePortfolio?: string;
  customerBase?: string;
  technologyStack?: string;
  improvementGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ServiceManagementConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentServiceManagement = '',
      serviceChallenges = '',
      budget = '',
      timeline = '',
      servicePortfolio = '',
      customerBase = '',
      technologyStack = '',
      improvementGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Service Management Consultant, provide comprehensive service management strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Service Management: ${currentServiceManagement}
Service Challenges: ${serviceChallenges}
Budget: ${budget}
Timeline: ${timeline}
Service Portfolio: ${servicePortfolio}
Customer Base: ${customerBase}
Technology Stack: ${technologyStack}
Improvement Goals: ${improvementGoals}

Please provide detailed service management guidance including:
1. Service management assessment and maturity
2. ITIL framework implementation
3. Service catalog and portfolio management
4. Incident and problem management
5. Change and release management
6. Service level management
7. Knowledge management
8. Continuous service improvement
9. Customer experience optimization
10. Implementation roadmap and governance

Format your response as a comprehensive service management strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Service Management Consultant with expertise in ITIL, service optimization, customer experience, and operational excellence. You provide practical, service-focused guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const serviceManagementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentServiceManagement,
        serviceChallenges,
        budget,
        timeline,
        servicePortfolio,
        customerBase,
        technologyStack,
        improvementGoals,
        serviceManagementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Service Management Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate service management guidance' },
      { status: 500 }
    );
  }
}