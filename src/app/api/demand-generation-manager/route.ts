import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DemandGenerationManagerRequest {
  businessType?: string;
  industry?: string;
  currentDemandStrategy?: string;
  targetAudience?: string;
  marketingChannels?: string;
  budget?: string;
  timeline?: string;
  salesCycle?: string;
  leadGoals?: string;
  technologyStack?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DemandGenerationManagerRequest;
    
    const {
      businessType = '',
      industry = '',
      currentDemandStrategy = '',
      targetAudience = '',
      marketingChannels = '',
      budget = '',
      timeline = '',
      salesCycle = '',
      leadGoals = '',
      technologyStack = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Demand Generation Manager, provide comprehensive demand generation strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current Demand Strategy: ${currentDemandStrategy}
Target Audience: ${targetAudience}
Marketing Channels: ${marketingChannels}
Budget: ${budget}
Timeline: ${timeline}
Sales Cycle: ${salesCycle}
Lead Goals: ${leadGoals}
Technology Stack: ${technologyStack}

Please provide detailed demand generation guidance including:
1. Demand generation assessment and analysis
2. Lead generation strategy and tactics
3. Multi-channel campaign development
4. Content marketing and lead nurturing
5. Marketing automation and workflows
6. Lead scoring and qualification
7. Sales and marketing alignment
8. Performance measurement and optimization
9. Budget allocation and ROI analysis
10. Implementation roadmap and scaling strategy

Format your response as a comprehensive demand generation strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Demand Generation Manager with expertise in lead generation, marketing automation, campaign management, and revenue marketing. You provide practical, results-oriented demand generation guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const demandGenerationGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentDemandStrategy,
        targetAudience,
        marketingChannels,
        budget,
        timeline,
        salesCycle,
        leadGoals,
        technologyStack,
        demandGenerationGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Demand Generation Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate demand generation guidance' },
      { status: 500 }
    );
  }
}