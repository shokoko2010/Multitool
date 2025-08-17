import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ProductMarketingManagerRequest {
  productType?: string;
  industry?: string;
  targetMarket?: string;
  competitiveLandscape?: string;
  marketingChallenges?: string;
  budget?: string;
  timeline?: string;
  productStage?: string;
  marketingChannels?: string;
  successMetrics?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ProductMarketingManagerRequest;
    
    const {
      productType = '',
      industry = '',
      targetMarket = '',
      competitiveLandscape = '',
      marketingChallenges = '',
      budget = '',
      timeline = '',
      productStage = '',
      marketingChannels = '',
      successMetrics = ''
    } = body;

    if (!productType.trim()) {
      return NextResponse.json(
        { error: 'Product type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Product Marketing Manager, provide comprehensive product marketing strategy and guidance for the following product:

Product Type: ${productType}
Industry: ${industry}
Target Market: ${targetMarket}
Competitive Landscape: ${competitiveLandscape}
Marketing Challenges: ${marketingChallenges}
Budget: ${budget}
Timeline: ${timeline}
Product Stage: ${productStage}
Marketing Channels: ${marketingChannels}
Success Metrics: ${successMetrics}

Please provide detailed product marketing guidance including:
1. Product positioning and messaging
2. Go-to-market strategy development
3. Competitive analysis and differentiation
4. Pricing strategy and packaging
5. Channel strategy and distribution
6. Launch planning and execution
7. Sales enablement and training
8. Customer acquisition strategies
9. Performance measurement and optimization
10. Marketing mix and campaign development

Format your response as a comprehensive product marketing strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Product Marketing Manager with expertise in product positioning, go-to-market strategies, competitive analysis, and product launch planning. You provide practical, results-oriented product marketing guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const productMarketingGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        productType,
        industry,
        targetMarket,
        competitiveLandscape,
        marketingChallenges,
        budget,
        timeline,
        productStage,
        marketingChannels,
        successMetrics,
        productMarketingGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Product Marketing Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate product marketing guidance' },
      { status: 500 }
    );
  }
}