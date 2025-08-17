import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface LegalConsultantRequest {
  legalIssue?: string;
  jurisdiction?: string;
  caseType?: string;
  partiesInvolved?: string;
  timeline?: string;
  budget?: string;
  desiredOutcome?: string;
  supportingDocuments?: string;
  previousLegalActions?: string;
  urgency?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LegalConsultantRequest;
    
    const {
      legalIssue = '',
      jurisdiction = '',
      caseType = '',
      partiesInvolved = '',
      timeline = '',
      budget = '',
      desiredOutcome = '',
      supportingDocuments = '',
      previousLegalActions = '',
      urgency = ''
    } = body;

    if (!legalIssue.trim()) {
      return NextResponse.json(
        { error: 'Legal issue description is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a professional Legal Consultant, provide comprehensive legal guidance and analysis for the following situation:

Legal Issue: ${legalIssue}
Jurisdiction: ${jurisdiction}
Case Type: ${caseType}
Parties Involved: ${partiesInvolved}
Timeline: ${timeline}
Budget: ${budget}
Desired Outcome: ${desiredOutcome}
Supporting Documents: ${supportingDocuments}
Previous Legal Actions: ${previousLegalActions}
Urgency Level: ${urgency}

Please provide detailed legal advice including:
1. Legal analysis and assessment
2. Applicable laws and regulations
3. Potential legal strategies
4. Risk assessment and mitigation
5. Procedural requirements
6. Documentation recommendations
7. Timeline and process overview
8. Cost considerations
9. Alternative dispute resolution options
10. Next steps and action items

Format your response as comprehensive legal guidance with clear recommendations and considerations. Note that this is for informational purposes only and does not constitute legal advice.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Legal Consultant with expertise in various areas of law including corporate law, contract law, intellectual property, employment law, and litigation. You provide clear, practical legal guidance with strategic recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const legalGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        legalIssue,
        jurisdiction,
        caseType,
        partiesInvolved,
        timeline,
        budget,
        desiredOutcome,
        supportingDocuments,
        previousLegalActions,
        urgency,
        legalGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Legal Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate legal guidance' },
      { status: 500 }
    );
  }
}