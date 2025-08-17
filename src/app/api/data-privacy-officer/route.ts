import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface DataPrivacyOfficerRequest {
  organizationType?: string;
  industry?: string;
  dataTypes?: string;
  regulatoryRequirements?: string;
  currentPrivacyPractices?: string;
  budget?: string;
  timeline?: string;
  geographicScope?: string;
  thirdPartyData?: string;
  privacyGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DataPrivacyOfficerRequest;
    
    const {
      organizationType = '',
      industry = '',
      dataTypes = '',
      regulatoryRequirements = '',
      currentPrivacyPractices = '',
      budget = '',
      timeline = '',
      geographicScope = '',
      thirdPartyData = '',
      privacyGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Data Privacy Officer, provide comprehensive data privacy strategy and compliance guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Data Types: ${dataTypes}
Regulatory Requirements: ${regulatoryRequirements}
Current Privacy Practices: ${currentPrivacyPractices}
Budget: ${budget}
Timeline: ${timeline}
Geographic Scope: ${geographicScope}
Third-Party Data: ${thirdPartyData}
Privacy Goals: ${privacyGoals}

Please provide detailed data privacy guidance including:
1. Privacy assessment and gap analysis
2. Regulatory compliance framework (GDPR, CCPA, etc.)
3. Data mapping and inventory
4. Privacy policies and procedures
5. Data subject rights management
6. Privacy by design principles
7. Data protection impact assessments
8. Vendor and third-party management
9. Privacy training and awareness
10. Implementation roadmap and governance

Format your response as a comprehensive data privacy strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Data Privacy Officer with expertise in privacy regulations, compliance frameworks, data protection, and privacy program management. You provide practical, compliance-focused privacy guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const privacyGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        dataTypes,
        regulatoryRequirements,
        currentPrivacyPractices,
        budget,
        timeline,
        geographicScope,
        thirdPartyData,
        privacyGoals,
        privacyGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Data Privacy Officer API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate data privacy guidance' },
      { status: 500 }
    );
  }
}