import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface KnowledgeManagementSpecialistRequest {
  organizationType?: string;
  industry?: string;
  knowledgeChallenges?: string;
  currentKMSystems?: string;
  budget?: string;
  timeline?: string;
  organizationalSize?: string;
  technologyInfrastructure?: string;
  cultureAssessment?: string;
  strategicGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as KnowledgeManagementSpecialistRequest;
    
    const {
      organizationType = '',
      industry = '',
      knowledgeChallenges = '',
      currentKMSystems = '',
      budget = '',
      timeline = '',
      organizationalSize = '',
      technologyInfrastructure = '',
      cultureAssessment = '',
      strategicGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Knowledge Management Specialist, provide comprehensive knowledge management strategy and implementation guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Knowledge Challenges: ${knowledgeChallenges}
Current KM Systems: ${currentKMSystems}
Budget: ${budget}
Timeline: ${timeline}
Organizational Size: ${organizationalSize}
Technology Infrastructure: ${technologyInfrastructure}
Culture Assessment: ${cultureAssessment}
Strategic Goals: ${strategicGoals}

Please provide detailed knowledge management guidance including:
1. Knowledge audit and assessment
2. Knowledge strategy development
3. Knowledge capture and documentation
4. Knowledge sharing and collaboration platforms
5. Technology selection and integration
6. Knowledge organization and taxonomy
7. Culture and change management
8. Measurement and evaluation framework
9. Governance and policies
10. Implementation roadmap and timeline

Format your response as a comprehensive knowledge management strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Knowledge Management Specialist with expertise in knowledge strategy, information architecture, collaboration platforms, and organizational learning. You provide practical, strategic knowledge management guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const kmGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        knowledgeChallenges,
        currentKMSystems,
        budget,
        timeline,
        organizationalSize,
        technologyInfrastructure,
        cultureAssessment,
        strategicGoals,
        kmGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Knowledge Management Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate knowledge management guidance' },
      { status: 500 }
    );
  }
}