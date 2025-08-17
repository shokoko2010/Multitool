import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CustomerExperienceStrategistRequest {
  businessType?: string;
  industry?: string;
  currentCXState?: string;
  customerSegments?: string;
  touchpoints?: string;
  budget?: string;
  timeline?: string;
  technologyInfrastructure?: string;
  customerFeedback?: string;
  strategicGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CustomerExperienceStrategistRequest;
    
    const {
      businessType = '',
      industry = '',
      currentCXState = '',
      customerSegments = '',
      touchpoints = '',
      budget = '',
      timeline = '',
      technologyInfrastructure = '',
      customerFeedback = '',
      strategicGoals = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Customer Experience Strategist, provide comprehensive customer experience strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current CX State: ${currentCXState}
Customer Segments: ${customerSegments}
Touchpoints: ${touchpoints}
Budget: ${budget}
Timeline: ${timeline}
Technology Infrastructure: ${technologyInfrastructure}
Customer Feedback: ${customerFeedback}
Strategic Goals: ${strategicGoals}

Please provide detailed customer experience guidance including:
1. CX assessment and maturity analysis
2. Customer journey mapping and optimization
3. Personalization strategies and approaches
4. Omnichannel experience design
5. Customer feedback and voice programs
6. Employee experience and empowerment
7. Technology and digital experience
8. Measurement and analytics framework
9. Culture and organizational alignment
10. Implementation roadmap and change management

Format your response as a comprehensive customer experience strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Customer Experience Strategist with expertise in customer journey mapping, experience design, personalization, and customer-centric transformation. You provide practical, customer-focused CX guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const cxGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentCXState,
        customerSegments,
        touchpoints,
        budget,
        timeline,
        technologyInfrastructure,
        customerFeedback,
        strategicGoals,
        cxGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Customer Experience Strategist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate customer experience guidance' },
      { status: 500 }
    );
  }
}