import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ChannelStrategyManagerRequest {
  businessType?: string;
  industry?: string;
  currentChannels?: string;
  targetMarket?: string;
  productType?: string;
  budget?: string;
  timeline?: string;
  geographicScope?: string;
  partnerEcosystem?: string;
  channelGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChannelStrategyManagerRequest;
    
    const {
      businessType = '',
      industry = '',
      currentChannels = '',
      targetMarket = '',
      productType = '',
      budget = '',
      timeline = '',
      geographicScope = '',
      partnerEcosystem = '',
      channelGoals = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Channel Strategy Manager, provide comprehensive channel strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current Channels: ${currentChannels}
Target Market: ${targetMarket}
Product Type: ${productType}
Budget: ${budget}
Timeline: ${timeline}
Geographic Scope: ${geographicScope}
Partner Ecosystem: ${partnerEcosystem}
Channel Goals: ${channelGoals}

Please provide detailed channel strategy guidance including:
1. Channel assessment and analysis
2. Channel selection and prioritization
3. Direct vs. indirect channel strategy
4. Partner recruitment and onboarding
5. Channel partner enablement and training
6. Channel incentive and compensation programs
7. Channel performance measurement
8. Channel conflict management
9. Technology and platform integration
10. Implementation roadmap and governance

Format your response as a comprehensive channel strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Channel Strategy Manager with expertise in channel development, partner management, distribution strategies, and go-to-market planning. You provide practical, results-oriented channel guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const channelStrategyGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentChannels,
        targetMarket,
        productType,
        budget,
        timeline,
        geographicScope,
        partnerEcosystem,
        channelGoals,
        channelStrategyGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Channel Strategy Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate channel strategy guidance' },
      { status: 500 }
    );
  }
}