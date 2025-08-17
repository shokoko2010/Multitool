import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface EnterpriseArchitectRequest {
  organizationType?: string;
  industry?: string;
  currentArchitecture?: string;
  businessStrategy?: string;
  budget?: string;
  timeline?: string;
  technologyLandscape?: string;
  organizationalComplexity?: string;
  integrationChallenges?: string;
  transformationGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EnterpriseArchitectRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentArchitecture = '',
      businessStrategy = '',
      budget = '',
      timeline = '',
      technologyLandscape = '',
      organizationalComplexity = '',
      integrationChallenges = '',
      transformationGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an Enterprise Architect, provide comprehensive enterprise architecture strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Architecture: ${currentArchitecture}
Business Strategy: ${businessStrategy}
Budget: ${budget}
Timeline: ${timeline}
Technology Landscape: ${technologyLandscape}
Organizational Complexity: ${organizationalComplexity}
Integration Challenges: ${integrationChallenges}
Transformation Goals: ${transformationGoals}

Please provide detailed enterprise architecture guidance including:
1. Architecture assessment and gap analysis
2. Business architecture and capability mapping
3. Application architecture and portfolio rationalization
4. Data architecture and integration strategy
5. Technology architecture and infrastructure
6. Security architecture and governance
7. Integration architecture and API strategy
8. Architecture governance and standards
9. Digital transformation roadmap
10. Implementation approach and change management

Format your response as a comprehensive enterprise architecture strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Enterprise Architect with expertise in business alignment, technology strategy, integration architecture, and digital transformation. You provide practical, strategic architecture guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const enterpriseArchitectureGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentArchitecture,
        businessStrategy,
        budget,
        timeline,
        technologyLandscape,
        organizationalComplexity,
        integrationChallenges,
        transformationGoals,
        enterpriseArchitectureGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Enterprise Architect API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate enterprise architecture guidance' },
      { status: 500 }
    );
  }
}