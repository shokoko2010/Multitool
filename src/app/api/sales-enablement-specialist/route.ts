import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface SalesEnablementSpecialistRequest {
  businessType?: string;
  industry?: string;
  currentEnablement?: string;
  salesTeamSize?: string;
  productComplexity?: string;
  budget?: string;
  timeline?: string;
  technologyStack?: string;
  trainingNeeds?: string;
  contentRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SalesEnablementSpecialistRequest;
    
    const {
      businessType = '',
      industry = '',
      currentEnablement = '',
      salesTeamSize = '',
      productComplexity = '',
      budget = '',
      timeline = '',
      technologyStack = '',
      trainingNeeds = '',
      contentRequirements = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Sales Enablement Specialist, provide comprehensive sales enablement strategy and implementation guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Current Enablement: ${currentEnablement}
Sales Team Size: ${salesTeamSize}
Product Complexity: ${productComplexity}
Budget: ${budget}
Timeline: ${timeline}
Technology Stack: ${technologyStack}
Training Needs: ${trainingNeeds}
Content Requirements: ${contentRequirements}

Please provide detailed sales enablement guidance including:
1. Sales enablement assessment and maturity
2. Content strategy and development
3. Training and onboarding programs
4. Sales tools and technology selection
5. Playbook and process documentation
6. Coaching and performance support
7. Knowledge management systems
8. Measurement and analytics framework
9. Sales and marketing alignment
10. Implementation roadmap and change management

Format your response as a comprehensive sales enablement strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Sales Enablement Specialist with expertise in sales training, content development, sales tools, and performance optimization. You provide practical, results-oriented sales enablement guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const salesEnablementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        currentEnablement,
        salesTeamSize,
        productComplexity,
        budget,
        timeline,
        technologyStack,
        trainingNeeds,
        contentRequirements,
        salesEnablementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sales Enablement Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales enablement guidance' },
      { status: 500 }
    );
  }
}