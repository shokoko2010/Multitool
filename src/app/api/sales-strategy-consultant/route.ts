import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface SalesStrategyConsultantRequest {
  businessType?: string;
  industry?: string;
  currentSalesApproach?: string;
  targetMarket?: string;
  salesChallenges?: string;
  budget?: string;
  timeline?: string;
  salesTeamSize?: string;
  productComplexity?: string;
  competitiveLandscape?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SalesStrategyConsultantRequest;
    
    const {
      businessType = '',
      industry = '',
      currentSalesApproach = '',
      targetMarket = '',
      salesChallenges = '',
      budget = '',
      timeline = '',
      salesTeamSize = '',
      productComplexity = '',
      competitiveLandscape = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Sales Strategy Consultant, provide comprehensive sales strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current Sales Approach: ${currentSalesApproach}
Target Market: ${targetMarket}
Sales Challenges: ${salesChallenges}
Budget: ${budget}
Timeline: ${timeline}
Sales Team Size: ${salesTeamSize}
Product Complexity: ${productComplexity}
Competitive Landscape: ${competitiveLandscape}

Please provide detailed sales strategy guidance including:
1. Sales process assessment and optimization
2. Target market segmentation and approach
3. Sales methodology selection and implementation
4. Sales team structure and roles
5. Sales performance metrics and KPIs
6. Sales technology and tools selection
7. Sales training and enablement
8. Compensation and incentive structures
9. Sales forecasting and pipeline management
10. Implementation roadmap and change management

Format your response as a comprehensive sales strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Sales Strategy Consultant with expertise in sales process optimization, team development, sales methodologies, and revenue growth strategies. You provide practical, results-oriented sales guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const salesStrategyGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentSalesApproach,
        targetMarket,
        salesChallenges,
        budget,
        timeline,
        salesTeamSize,
        productComplexity,
        competitiveLandscape,
        salesStrategyGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sales Strategy Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales strategy guidance' },
      { status: 500 }
    );
  }
}