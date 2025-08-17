import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CustomerSuccessManagerRequest {
  businessType?: string;
  industry?: string;
  currentCSApproach?: string;
  customerSegments?: string;
  productComplexity?: string;
  budget?: string;
  timeline?: string;
  teamSize?: string;
  technologyStack?: string;
  successMetrics?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CustomerSuccessManagerRequest;
    
    const {
      businessType = '',
      industry = '',
      currentCSApproach = '',
      customerSegments = '',
      productComplexity = '',
      budget = '',
      timeline = '',
      teamSize = '',
      technologyStack = '',
      successMetrics = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Customer Success Manager, provide comprehensive customer success strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current CS Approach: ${currentCSApproach}
Customer Segments: ${customerSegments}
Product Complexity: ${productComplexity}
Budget: ${budget}
Timeline: ${timeline}
Team Size: ${teamSize}
Technology Stack: ${technologyStack}
Success Metrics: ${successMetrics}

Please provide detailed customer success guidance including:
1. Customer success assessment and maturity
2. Customer journey mapping and optimization
3. Customer segmentation and tiering strategy
4. Success planning and onboarding processes
5. Health scoring and risk identification
6. Proactive engagement strategies
7. Customer advocacy and reference programs
8. Technology and automation selection
9. Team structure and role definition
10. Measurement and reporting framework

Format your response as a comprehensive customer success strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Customer Success Manager with expertise in customer retention, adoption strategies, health scoring, and customer advocacy. You provide practical, customer-centric success guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const customerSuccessGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentCSApproach,
        customerSegments,
        productComplexity,
        budget,
        timeline,
        teamSize,
        technologyStack,
        successMetrics,
        customerSuccessGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Customer Success Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate customer success guidance' },
      { status: 500 }
    );
  }
}