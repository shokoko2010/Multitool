import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface BrandStrategyConsultantRequest {
  businessType?: string;
  industry?: string;
  currentBrandState?: string;
  targetAudience?: string;
  brandChallenges?: string;
  budget?: string;
  timeline?: string;
  competitivePositioning?: string;
  marketContext?: string;
  brandGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BrandStrategyConsultantRequest;
    
    const {
      businessType = '',
      industry = '',
      currentBrandState = '',
      targetAudience = '',
      brandChallenges = '',
      budget = '',
      timeline = '',
      competitivePositioning = '',
      marketContext = '',
      brandGoals = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Brand Strategy Consultant, provide comprehensive brand strategy and development guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current Brand State: ${currentBrandState}
Target Audience: ${targetAudience}
Brand Challenges: ${brandChallenges}
Budget: ${budget}
Timeline: ${timeline}
Competitive Positioning: ${competitivePositioning}
Market Context: ${marketContext}
Brand Goals: ${brandGoals}

Please provide detailed brand strategy guidance including:
1. Brand assessment and audit
2. Brand positioning and differentiation
3. Brand identity and personality development
4. Brand architecture and portfolio strategy
5. Brand messaging and communication framework
6. Visual identity and design guidelines
7. Brand experience and touchpoints
8. Brand measurement and analytics
9. Internal brand alignment and culture
10. Implementation roadmap and brand governance

Format your response as a comprehensive brand strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Brand Strategy Consultant with expertise in brand positioning, identity development, brand architecture, and brand experience design. You provide practical, strategic brand guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const brandStrategyGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentBrandState,
        targetAudience,
        brandChallenges,
        budget,
        timeline,
        competitivePositioning,
        marketContext,
        brandGoals,
        brandStrategyGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Brand Strategy Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate brand strategy guidance' },
      { status: 500 }
    );
  }
}