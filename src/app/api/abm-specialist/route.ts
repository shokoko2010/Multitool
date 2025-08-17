import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ABMSpecialistRequest {
  businessType?: string;
  industry?: string;
  targetAccounts?: string;
  currentABMApproach?: string;
  salesAlignment?: string;
  budget?: string;
  timeline?: string;
  technologyStack?: string;
  contentStrategy?: string;
  measurementGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ABMSpecialistRequest;
    
    const {
      businessType = '',
      industry = '',
      targetAccounts = '',
      currentABMApproach = '',
      salesAlignment = '',
      budget = '',
      timeline = '',
      technologyStack = '',
      contentStrategy = '',
      measurementGoals = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an Account Based Marketing Specialist, provide comprehensive ABM strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Target Accounts: ${targetAccounts}
Current ABM Approach: ${currentABMApproach}
Sales Alignment: ${salesAlignment}
Budget: ${budget}
Timeline: ${timeline}
Technology Stack: ${technologyStack}
Content Strategy: ${contentStrategy}
Measurement Goals: ${measurementGoals}

Please provide detailed ABM guidance including:
1. ABM assessment and maturity analysis
2. Account selection and prioritization
3. Account profiling and persona development
4. Personalized content and messaging strategy
5. Multi-channel engagement tactics
6. Sales and marketing alignment framework
7. Technology and data integration
8. Account-based analytics and measurement
9. Scaling and optimization strategies
10. Implementation roadmap and governance

Format your response as a comprehensive ABM strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Account Based Marketing Specialist with expertise in strategic account targeting, personalized marketing, sales alignment, and ABM technology platforms. You provide practical, results-oriented ABM guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const abmGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        targetAccounts,
        currentABMApproach,
        salesAlignment,
        budget,
        timeline,
        technologyStack,
        contentStrategy,
        measurementGoals,
        abmGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('ABM Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ABM guidance' },
      { status: 500 }
    );
  }
}