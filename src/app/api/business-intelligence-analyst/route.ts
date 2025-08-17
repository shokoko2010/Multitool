import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface BusinessIntelligenceAnalystRequest {
  organizationType?: string;
  industry?: string;
  dataSources?: string;
  businessObjectives?: string;
  currentBIInfrastructure?: string;
  budget?: string;
  timeline?: string;
  analyticalNeeds?: string;
  reportingRequirements?: string;
  userBase?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BusinessIntelligenceAnalystRequest;
    
    const {
      organizationType = '',
      industry = '',
      dataSources = '',
      businessObjectives = '',
      currentBIInfrastructure = '',
      budget = '',
      timeline = '',
      analyticalNeeds = '',
      reportingRequirements = '',
      userBase = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Business Intelligence Analyst, provide comprehensive BI strategy and implementation guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Data Sources: ${dataSources}
Business Objectives: ${businessObjectives}
Current BI Infrastructure: ${currentBIInfrastructure}
Budget: ${budget}
Timeline: ${timeline}
Analytical Needs: ${analyticalNeeds}
Reporting Requirements: ${reportingRequirements}
User Base: ${userBase}

Please provide detailed business intelligence guidance including:
1. BI assessment and gap analysis
2. Data strategy and architecture
3. BI platform selection and evaluation
4. Data integration and ETL processes
5. Data modeling and warehouse design
6. Analytics and visualization strategy
7. Reporting and dashboard development
8. User adoption and training
9. Governance and security considerations
10. Implementation roadmap and timeline

Format your response as a comprehensive business intelligence strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Business Intelligence Analyst with expertise in data analytics, BI platforms, data visualization, and strategic reporting. You provide practical, data-driven BI guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const biGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        dataSources,
        businessObjectives,
        currentBIInfrastructure,
        budget,
        timeline,
        analyticalNeeds,
        reportingRequirements,
        userBase,
        biGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Business Intelligence Analyst API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business intelligence guidance' },
      { status: 500 }
    );
  }
}