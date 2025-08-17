import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DataGovernanceSpecialistRequest {
  organizationType?: string;
  industry?: string;
  dataChallenges?: string;
  currentDataPractices?: string;
  regulatoryRequirements?: string;
  budget?: string;
  timeline?: string;
  dataVolume?: string;
  dataTypes?: string;
  stakeholders?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DataGovernanceSpecialistRequest;
    
    const {
      organizationType = '',
      industry = '',
      dataChallenges = '',
      currentDataPractices = '',
      regulatoryRequirements = '',
      budget = '',
      timeline = '',
      dataVolume = '',
      dataTypes = '',
      stakeholders = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Data Governance Specialist, provide comprehensive data governance strategy and implementation guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Data Challenges: ${dataChallenges}
Current Data Practices: ${currentDataPractices}
Regulatory Requirements: ${regulatoryRequirements}
Budget: ${budget}
Timeline: ${timeline}
Data Volume: ${dataVolume}
Data Types: ${dataTypes}
Stakeholders: ${stakeholders}

Please provide detailed data governance guidance including:
1. Data governance assessment and maturity model
2. Governance framework development
3. Data quality management strategies
4. Data security and privacy compliance
5. Metadata management and lineage
6. Master data management approach
7. Data stewardship and ownership
8. Policies, standards, and procedures
9. Technology and tool selection
10. Implementation roadmap and change management

Format your response as a comprehensive data governance strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Data Governance Specialist with expertise in data management, compliance, data quality, and governance frameworks. You provide practical, compliance-focused data governance guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const dataGovernanceGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        dataChallenges,
        currentDataPractices,
        regulatoryRequirements,
        budget,
        timeline,
        dataVolume,
        dataTypes,
        stakeholders,
        dataGovernanceGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Data Governance Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate data governance guidance' },
      { status: 500 }
    );
  }
}