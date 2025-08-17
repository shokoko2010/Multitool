import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface SustainabilityConsultantRequest {
  organizationType?: string;
  industry?: string;
  sustainabilityGoals?: string;
  currentPractices?: string;
  budget?: string;
  timeline?: string;
  reportingStandards?: string;
  stakeholderExpectations?: string;
  regulatoryRequirements?: string;
  certificationGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SustainabilityConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      sustainabilityGoals = '',
      currentPractices = '',
      budget = '',
      timeline = '',
      reportingStandards = '',
      stakeholderExpectations = '',
      regulatoryRequirements = '',
      certificationGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Sustainability Consultant, provide comprehensive sustainability strategy and implementation guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Sustainability Goals: ${sustainabilityGoals}
Current Practices: ${currentPractices}
Budget: ${budget}
Timeline: ${timeline}
Reporting Standards: ${reportingStandards}
Stakeholder Expectations: ${stakeholderExpectations}
Regulatory Requirements: ${regulatoryRequirements}
Certification Goals: ${certificationGoals}

Please provide detailed sustainability guidance including:
1. Sustainability assessment and gap analysis
2. Strategy development and goal setting
3. Implementation roadmap and action plan
4. Resource optimization recommendations
5. Stakeholder engagement strategy
6. Measurement and reporting framework
7. Certification and compliance guidance
8. Cost-benefit analysis
9. Change management approach
10. Continuous improvement methodology

Format your response as a comprehensive sustainability strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Sustainability Consultant with expertise in corporate sustainability, ESG (Environmental, Social, Governance), sustainable development, and green business practices. You provide practical, results-oriented sustainability guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const sustainabilityGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        sustainabilityGoals,
        currentPractices,
        budget,
        timeline,
        reportingStandards,
        stakeholderExpectations,
        regulatoryRequirements,
        certificationGoals,
        sustainabilityGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sustainability Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sustainability guidance' },
      { status: 500 }
    );
  }
}