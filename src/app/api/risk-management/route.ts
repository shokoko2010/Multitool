import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface RiskManagementRequest {
  projectType?: string;
  industry?: string;
  riskCategories?: string;
  riskTolerance?: string;
  organizationalContext?: string;
  timeframe?: string;
  budget?: string;
  stakeholders?: string;
  existingControls?: string;
  reportingRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RiskManagementRequest;
    
    const {
      projectType = '',
      industry = '',
      riskCategories = '',
      riskTolerance = '',
      organizationalContext = '',
      timeframe = '',
      budget = '',
      stakeholders = '',
      existingControls = '',
      reportingRequirements = ''
    } = body;

    if (!projectType.trim()) {
      return NextResponse.json(
        { error: 'Project type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Risk Management Specialist, provide comprehensive risk assessment and management strategy for the following scenario:

Project Type: ${projectType}
Industry: ${industry}
Risk Categories: ${riskCategories}
Risk Tolerance: ${riskTolerance}
Organizational Context: ${organizationalContext}
Timeframe: ${timeframe}
Budget: ${budget}
Stakeholders: ${stakeholders}
Existing Controls: ${existingControls}
Reporting Requirements: ${reportingRequirements}

Please provide detailed risk management guidance including:
1. Risk identification and categorization
2. Risk assessment and analysis methodology
3. Risk prioritization and scoring
4. Risk mitigation strategies and controls
5. Risk monitoring and reporting framework
6. Contingency planning
7. Risk communication strategy
8. Risk ownership and accountability
9. Risk culture development
10. Continuous risk improvement process

Format your response as a comprehensive risk management plan with actionable recommendations and implementation strategies.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Risk Management Specialist with expertise in enterprise risk management, operational risk, financial risk, and strategic risk assessment. You provide practical, systematic risk management guidance with actionable mitigation strategies.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const riskManagementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        projectType,
        industry,
        riskCategories,
        riskTolerance,
        organizationalContext,
        timeframe,
        budget,
        stakeholders,
        existingControls,
        reportingRequirements,
        riskManagementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Risk Management Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate risk management guidance' },
      { status: 500 }
    );
  }
}