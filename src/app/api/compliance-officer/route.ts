import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ComplianceOfficerRequest {
  industry?: string;
  regulatoryFramework?: string;
  complianceArea?: string;
  organizationSize?: string;
  currentComplianceStatus?: string;
  riskFactors?: string;
  budget?: string;
  timeline?: string;
  stakeholderGroups?: string;
  auditRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ComplianceOfficerRequest;
    
    const {
      industry = '',
      regulatoryFramework = '',
      complianceArea = '',
      organizationSize = '',
      currentComplianceStatus = '',
      riskFactors = '',
      budget = '',
      timeline = '',
      stakeholderGroups = '',
      auditRequirements = ''
    } = body;

    if (!industry.trim()) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a professional Compliance Officer, provide comprehensive compliance guidance and strategy for the following organizational context:

Industry: ${industry}
Regulatory Framework: ${regulatoryFramework}
Compliance Area: ${complianceArea}
Organization Size: ${organizationSize}
Current Compliance Status: ${currentComplianceStatus}
Risk Factors: ${riskFactors}
Budget: ${budget}
Timeline: ${timeline}
Stakeholder Groups: ${stakeholderGroups}
Audit Requirements: ${auditRequirements}

Please provide detailed compliance guidance including:
1. Regulatory requirements analysis
2. Compliance gap assessment
3. Risk identification and mitigation
4. Compliance program development
5. Policies and procedures recommendations
6. Training and awareness strategy
7. Monitoring and testing framework
8. Documentation and reporting requirements
9. Third-party risk management
10. Continuous improvement methodology

Format your response as a comprehensive compliance strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Compliance Officer with expertise in regulatory compliance, risk management, audit preparation, and compliance program development. You provide practical, regulatory-focused compliance guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const complianceGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        industry,
        regulatoryFramework,
        complianceArea,
        organizationSize,
        currentComplianceStatus,
        riskFactors,
        budget,
        timeline,
        stakeholderGroups,
        auditRequirements,
        complianceGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Compliance Officer API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate compliance guidance' },
      { status: 500 }
    );
  }
}