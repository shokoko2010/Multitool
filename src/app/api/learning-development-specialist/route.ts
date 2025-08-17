import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface LearningDevelopmentSpecialistRequest {
  organizationType?: string;
  industry?: string;
  currentLDPrograms?: string;
  skillGaps?: string;
  budget?: string;
  timeline?: string;
  employeeCount?: string;
  learningCulture?: string;
  technologyInfrastructure?: string;
  developmentGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LearningDevelopmentSpecialistRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentLDPrograms = '',
      skillGaps = '',
      budget = '',
      timeline = '',
      employeeCount = '',
      learningCulture = '',
      technologyInfrastructure = '',
      developmentGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Learning & Development Specialist, provide comprehensive learning and development strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current LD Programs: ${currentLDPrograms}
Skill Gaps: ${skillGaps}
Budget: ${budget}
Timeline: ${timeline}
Employee Count: ${employeeCount}
Learning Culture: ${learningCulture}
Technology Infrastructure: ${technologyInfrastructure}
Development Goals: ${developmentGoals}

Please provide detailed learning and development guidance including:
1. Learning needs assessment and analysis
2. Learning strategy and curriculum design
3. Content development and curation
4. Learning technology and platforms
5. Delivery methodologies and formats
6. Learning measurement and evaluation
7. Learning culture and engagement
8. Leadership development programs
9. Skills development and upskilling
10. Implementation roadmap and governance

Format your response as a comprehensive learning and development strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Learning & Development Specialist with expertise in instructional design, learning technology, talent development, and organizational learning. You provide practical, results-oriented L&D guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const learningDevelopmentGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentLDPrograms,
        skillGaps,
        budget,
        timeline,
        employeeCount,
        learningCulture,
        technologyInfrastructure,
        developmentGoals,
        learningDevelopmentGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Learning & Development Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning and development guidance' },
      { status: 500 }
    );
  }
}