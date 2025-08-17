import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface SupplyChainConsultantRequest {
  industry?: string;
  businessType?: string;
  supplyChainChallenges?: string;
  currentOperations?: string;
  budget?: string;
  timeline?: string;
  geographicScope?: string;
  technologyRequirements?: string;
  sustainabilityGoals?: string;
  stakeholderRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SupplyChainConsultantRequest;
    
    const {
      industry = '',
      businessType = '',
      supplyChainChallenges = '',
      currentOperations = '',
      budget = '',
      timeline = '',
      geographicScope = '',
      technologyRequirements = '',
      sustainabilityGoals = '',
      stakeholderRequirements = ''
    } = body;

    if (!industry.trim()) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Supply Chain Consultant, provide comprehensive supply chain optimization and strategy guidance for the following business:

Industry: ${industry}
Business Type: ${businessType}
Supply Chain Challenges: ${supplyChainChallenges}
Current Operations: ${currentOperations}
Budget: ${budget}
Timeline: ${timeline}
Geographic Scope: ${geographicScope}
Technology Requirements: ${technologyRequirements}
Sustainability Goals: ${sustainabilityGoals}
Stakeholder Requirements: ${stakeholderRequirements}

Please provide detailed supply chain guidance including:
1. Supply chain assessment and gap analysis
2. Network optimization recommendations
3. Inventory management strategies
4. Logistics and transportation optimization
5. Supplier relationship management
6. Technology integration roadmap
7. Risk mitigation strategies
8. Sustainability and resilience planning
9. Performance metrics and KPIs
10. Implementation roadmap and timeline

Format your response as a comprehensive supply chain strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Supply Chain Consultant with expertise in logistics, inventory management, procurement, supply chain optimization, and operations management. You provide practical, data-driven supply chain guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const supplyChainGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        industry,
        businessType,
        supplyChainChallenges,
        currentOperations,
        budget,
        timeline,
        geographicScope,
        technologyRequirements,
        sustainabilityGoals,
        stakeholderRequirements,
        supplyChainGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Supply Chain Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate supply chain guidance' },
      { status: 500 }
    );
  }
}