import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface PricingStrategistRequest {
  productType?: string;
  industry?: string;
  currentPricingModel?: string;
  targetMarket?: string;
  competitivePricing?: string;
  costStructure?: string;
  valueProposition?: string;
  budget?: string;
  timeline?: string;
  pricingGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PricingStrategistRequest;
    
    const {
      productType = '',
      industry = '',
      currentPricingModel = '',
      targetMarket = '',
      competitivePricing = '',
      costStructure = '',
      valueProposition = '',
      budget = '',
      timeline = '',
      pricingGoals = ''
    } = body;

    if (!productType.trim()) {
      return NextResponse.json(
        { error: 'Product type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Pricing Strategist, provide comprehensive pricing strategy and guidance for the following product:

Product Type: ${productType}
Industry: ${industry}
Current Pricing Model: ${currentPricingModel}
Target Market: ${targetMarket}
Competitive Pricing: ${competitivePricing}
Cost Structure: ${costStructure}
Value Proposition: ${valueProposition}
Budget: ${budget}
Timeline: ${timeline}
Pricing Goals: ${pricingGoals}

Please provide detailed pricing strategy guidance including:
1. Pricing analysis and assessment
2. Value-based pricing approach
3. Competitive pricing analysis
4. Cost-based pricing considerations
5. Price elasticity and sensitivity analysis
6. Pricing model selection and design
7. Discount and promotion strategies
8. Geographic and segment pricing
9. Pricing implementation and communication
10. Pricing optimization and monitoring framework

Format your response as a comprehensive pricing strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Pricing Strategist with expertise in pricing models, value-based pricing, competitive analysis, and revenue optimization. You provide practical, data-driven pricing guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const pricingGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        productType,
        industry,
        currentPricingModel,
        targetMarket,
        competitivePricing,
        costStructure,
        valueProposition,
        budget,
        timeline,
        pricingGoals,
        pricingGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Pricing Strategist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pricing strategy guidance' },
      { status: 500 }
    );
  }
}