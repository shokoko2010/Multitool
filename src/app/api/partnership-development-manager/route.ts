import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface PartnershipDevelopmentManagerRequest {
  businessType?: string;
  industry?: string;
  partnershipGoals?: string;
  currentPartners?: string;
  targetPartnerTypes?: string;
  budget?: string;
  timeline?: string;
  partnershipModel?: string;
  valueProposition?: string;
  integrationRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PartnershipDevelopmentManagerRequest;
    
    const {
      businessType = '',
      industry = '',
      partnershipGoals = '',
      currentPartners = '',
      targetPartnerTypes = '',
      budget = '',
      timeline = '',
      partnershipModel = '',
      valueProposition = '',
      integrationRequirements = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Partnership Development Manager, provide comprehensive partnership strategy and development guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Partnership Goals: ${partnershipGoals}
Current Partners: ${currentPartners}
Target Partner Types: ${targetPartnerTypes}
Budget: ${budget}
Timeline: ${timeline}
Partnership Model: ${partnershipModel}
Value Proposition: ${valueProposition}
Integration Requirements: ${integrationRequirements}

Please provide detailed partnership development guidance including:
1. Partnership strategy and framework
2. Partner identification and qualification
3. Partnership models and structures
4. Value proposition development
5. Partner recruitment and onboarding
6. Relationship management and governance
7. Joint go-to-market strategies
8. Technology integration and alignment
9. Performance measurement and optimization
10. Partnership scaling and evolution

Format your response as a comprehensive partnership development strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Partnership Development Manager with expertise in strategic alliances, channel partnerships, ecosystem development, and relationship management. You provide practical, results-oriented partnership guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const partnershipGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        partnershipGoals,
        currentPartners,
        targetPartnerTypes,
        budget,
        timeline,
        partnershipModel,
        valueProposition,
        integrationRequirements,
        partnershipGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Partnership Development Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate partnership development guidance' },
      { status: 500 }
    );
  }
}