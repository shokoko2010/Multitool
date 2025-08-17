import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ITStrategyConsultantRequest {
  organizationType?: string;
  industry?: string;
  currentITState?: string;
  businessGoals?: string;
  budget?: string;
  timeline?: string;
  technologyChallenges?: string;
  organizationalSize?: string;
  regulatoryRequirements?: string;
  digitalMaturity?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ITStrategyConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentITState = '',
      businessGoals = '',
      budget = '',
      timeline = '',
      technologyChallenges = '',
      organizationalSize = '',
      regulatoryRequirements = '',
      digitalMaturity = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an IT Strategy Consultant, provide comprehensive IT strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current IT State: ${currentITState}
Business Goals: ${businessGoals}
Budget: ${budget}
Timeline: ${timeline}
Technology Challenges: ${technologyChallenges}
Organizational Size: ${organizationalSize}
Regulatory Requirements: ${regulatoryRequirements}
Digital Maturity: ${digitalMaturity}

Please provide detailed IT strategy guidance including:
1. IT assessment and gap analysis
2. Strategic alignment with business objectives
3. Technology roadmap and architecture
4. Digital transformation initiatives
5. Cloud and infrastructure strategy
6. Security and compliance framework
7. IT governance and operating model
8. Talent and capability development
9. Investment prioritization and ROI
10. Implementation roadmap and change management

Format your response as a comprehensive IT strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced IT Strategy Consultant with expertise in strategic planning, digital transformation, technology alignment, and IT governance. You provide practical, business-focused IT strategy guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const itStrategyGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentITState,
        businessGoals,
        budget,
        timeline,
        technologyChallenges,
        organizationalSize,
        regulatoryRequirements,
        digitalMaturity,
        itStrategyGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('IT Strategy Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate IT strategy guidance' },
      { status: 500 }
    );
  }
}