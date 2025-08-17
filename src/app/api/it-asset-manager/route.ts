import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ITAssetManagerRequest {
  organizationType?: string;
  industry?: string;
  currentAssetManagement?: string;
  assetTypes?: string;
  budget?: string;
  timeline?: string;
  assetCount?: string;
  complianceRequirements?: string;
  technologyEnvironment?: string;
  optimizationGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ITAssetManagerRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentAssetManagement = '',
      assetTypes = '',
      budget = '',
      timeline = '',
      assetCount = '',
      complianceRequirements = '',
      technologyEnvironment = '',
      optimizationGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an IT Asset Manager, provide comprehensive IT asset management strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Asset Management: ${currentAssetManagement}
Asset Types: ${assetTypes}
Budget: ${budget}
Timeline: ${timeline}
Asset Count: ${assetCount}
Compliance Requirements: ${complianceRequirements}
Technology Environment: ${technologyEnvironment}
Optimization Goals: ${optimizationGoals}

Please provide detailed IT asset management guidance including:
1. Asset inventory and discovery
2. Asset lifecycle management
3. Software asset management and licensing
4. Hardware asset optimization
5. Cost optimization and budgeting
6. Compliance and audit readiness
7. Asset tracking and monitoring
8. Disposal and retirement strategies
9. Vendor management and contracts
10. Implementation roadmap and governance

Format your response as a comprehensive IT asset management strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced IT Asset Manager with expertise in asset lifecycle management, software licensing, cost optimization, and compliance. You provide practical, results-oriented asset management guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const assetManagementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentAssetManagement,
        assetTypes,
        budget,
        timeline,
        assetCount,
        complianceRequirements,
        technologyEnvironment,
        optimizationGoals,
        assetManagementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('IT Asset Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate IT asset management guidance' },
      { status: 500 }
    );
  }
}