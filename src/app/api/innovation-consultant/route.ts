import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface InnovationConsultantRequest {
  organizationType?: string;
  industry?: string;
  innovationChallenges?: string;
  currentInnovationPractices?: string;
  budget?: string;
  timeline?: string;
  marketContext?: string;
  competitiveLandscape?: string;
  technologyTrends?: string;
  strategicObjectives?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as InnovationConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      innovationChallenges = '',
      currentInnovationPractices = '',
      budget = '',
      timeline = '',
      marketContext = '',
      competitiveLandscape = '',
      technologyTrends = '',
      strategicObjectives = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an Innovation Consultant, provide comprehensive innovation strategy and implementation guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Innovation Challenges: ${innovationChallenges}
Current Innovation Practices: ${currentInnovationPractices}
Budget: ${budget}
Timeline: ${timeline}
Market Context: ${marketContext}
Competitive Landscape: ${competitiveLandscape}
Technology Trends: ${technologyTrends}
Strategic Objectives: ${strategicObjectives}

Please provide detailed innovation guidance including:
1. Innovation capability assessment
2. Innovation strategy development
3. Idea generation and management systems
4. Innovation culture and mindset
5. Technology scouting and adoption
6. Open innovation and collaboration
7. Innovation portfolio management
8. Measurement and evaluation framework
9. Risk management and experimentation
10. Implementation roadmap and timeline

Format your response as a comprehensive innovation strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Innovation Consultant with expertise in innovation strategy, design thinking, technology adoption, and organizational creativity. You provide practical, forward-thinking innovation guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const innovationGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        innovationChallenges,
        currentInnovationPractices,
        budget,
        timeline,
        marketContext,
        competitiveLandscape,
        technologyTrends,
        strategicObjectives,
        innovationGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Innovation Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate innovation guidance' },
      { status: 500 }
    );
  }
}