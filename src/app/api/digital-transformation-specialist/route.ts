import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DigitalTransformationSpecialistRequest {
  organizationType?: string;
  industry?: string;
  digitalMaturity?: string;
  transformationGoals?: string;
  budget?: string;
  timeline?: string;
  currentTechnology?: string;
  organizationalReadiness?: string;
  customerExpectations?: string;
  marketDisruption?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DigitalTransformationSpecialistRequest;
    
    const {
      organizationType = '',
      industry = '',
      digitalMaturity = '',
      transformationGoals = '',
      budget = '',
      timeline = '',
      currentTechnology = '',
      organizationalReadiness = '',
      customerExpectations = '',
      marketDisruption = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Digital Transformation Specialist, provide comprehensive digital transformation strategy and implementation guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Digital Maturity: ${digitalMaturity}
Transformation Goals: ${transformationGoals}
Budget: ${budget}
Timeline: ${timeline}
Current Technology: ${currentTechnology}
Organizational Readiness: ${organizationalReadiness}
Customer Expectations: ${customerExpectations}
Market Disruption: ${marketDisruption}

Please provide detailed digital transformation guidance including:
1. Digital maturity assessment
2. Transformation strategy development
3. Technology roadmap and architecture
4. Digital capability building
5. Customer experience transformation
6. Operational digitization
7. Data strategy and analytics
8. Change management and culture
9. Governance and risk management
10. Implementation roadmap and timeline

Format your response as a comprehensive digital transformation strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Digital Transformation Specialist with expertise in digital strategy, technology adoption, change management, and business model innovation. You provide practical, strategic digital transformation guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const digitalTransformationGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        digitalMaturity,
        transformationGoals,
        budget,
        timeline,
        currentTechnology,
        organizationalReadiness,
        customerExpectations,
        marketDisruption,
        digitalTransformationGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Digital Transformation Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate digital transformation guidance' },
      { status: 500 }
    );
  }
}