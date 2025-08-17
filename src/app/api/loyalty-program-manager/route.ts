import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface LoyaltyProgramManagerRequest {
  businessType?: string;
  industry?: string;
  currentLoyaltyProgram?: string;
  customerBehavior?: string;
  programGoals?: string;
  budget?: string;
  timeline?: string;
  customerBase?: string;
  competitiveLandscape?: string;
  technologyRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoyaltyProgramManagerRequest;
    
    const {
      businessType = '',
      industry = '',
      currentLoyaltyProgram = '',
      customerBehavior = '',
      programGoals = '',
      budget = '',
      timeline = '',
      customerBase = '',
      competitiveLandscape = '',
      technologyRequirements = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Loyalty Program Manager, provide comprehensive loyalty program strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current Loyalty Program: ${currentLoyaltyProgram}
Customer Behavior: ${customerBehavior}
Program Goals: ${programGoals}
Budget: ${budget}
Timeline: ${timeline}
Customer Base: ${customerBase}
Competitive Landscape: ${competitiveLandscape}
Technology Requirements: ${technologyRequirements}

Please provide detailed loyalty program guidance including:
1. Loyalty program assessment and analysis
2. Program design and structure
3. Reward mechanisms and incentives
4. Customer segmentation and personalization
5. Engagement strategies and tactics
6. Technology platform selection
7. Program governance and rules
8. Communication and promotion strategy
9. Measurement and optimization framework
10. Implementation roadmap and change management

Format your response as a comprehensive loyalty program strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Loyalty Program Manager with expertise in customer retention, reward program design, customer engagement, and loyalty analytics. You provide practical, customer-centric loyalty program guidance with implementation approaches.'
        },
                        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const loyaltyProgramGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentLoyaltyProgram,
        customerBehavior,
        programGoals,
        budget,
        timeline,
        customerBase,
        competitiveLandscape,
        technologyRequirements,
        loyaltyProgramGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Loyalty Program Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate loyalty program guidance' },
      { status: 500 }
    );
  }
}