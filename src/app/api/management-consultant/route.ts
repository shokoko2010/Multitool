import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ManagementConsultantRequest {
  organizationType?: string;
  industry?: string;
  businessChallenges?: string;
  strategicGoals?: string;
  budget?: string;
  timeline?: string;
  organizationalSize?: string;
  marketPosition?: string;
  competitiveLandscape?: string;
  improvementAreas?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ManagementConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      businessChallenges = '',
      strategicGoals = '',
      budget = '',
      timeline = '',
      organizationalSize = '',
      marketPosition = '',
      competitiveLandscape = '',
      improvementAreas = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Management Consultant, provide comprehensive management consulting strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Business Challenges: ${businessChallenges}
Strategic Goals: ${strategicGoals}
Budget: ${budget}
Timeline: ${timeline}
Organizational Size: ${organizationalSize}
Market Position: ${marketPosition}
Competitive Landscape: ${competitiveLandscape}
Improvement Areas: ${improvementAreas}

Please provide detailed management consulting guidance including:
1. Organizational assessment and diagnosis
2. Strategic planning and development
3. Operational efficiency optimization
4. Financial performance improvement
5. Market positioning and competitive strategy
6. Organizational structure and design
7. Leadership and talent development
8. Change management and transformation
9. Performance measurement and KPIs
10. Implementation roadmap and governance

Format your response as a comprehensive management consulting strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Management Consultant with expertise in strategic planning, organizational development, operational excellence, and business transformation. You provide practical, results-oriented management guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const managementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        businessChallenges,
        strategicGoals,
        budget,
        timeline,
        organizationalSize,
        marketPosition,
        competitiveLandscape,
        improvementAreas,
        managementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Management Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate management consulting guidance' },
      { status: 500 }
    );
  }
}