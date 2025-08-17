import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface EnvironmentalConsultantRequest {
  projectType?: string;
  location?: string;
  environmentalConcerns?: string;
  regulatoryRequirements?: string;
  budget?: string;
  timeline?: string;
  sustainabilityGoals?: string;
  stakeholderGroups?: string;
  assessmentScope?: string;
  reportingRequirements?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EnvironmentalConsultantRequest;
    
    const {
      projectType = '',
      location = '',
      environmentalConcerns = '',
      regulatoryRequirements = '',
      budget = '',
      timeline = '',
      sustainabilityGoals = '',
      stakeholderGroups = '',
      assessmentScope = '',
      reportingRequirements = ''
    } = body;

    if (!projectType.trim()) {
      return NextResponse.json(
        { error: 'Project type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an Environmental Consultant, provide comprehensive environmental assessment and guidance for the following project:

Project Type: ${projectType}
Location: ${location}
Environmental Concerns: ${environmentalConcerns}
Regulatory Requirements: ${regulatoryRequirements}
Budget: ${budget}
Timeline: ${timeline}
Sustainability Goals: ${sustainabilityGoals}
Stakeholder Groups: ${stakeholderGroups}
Assessment Scope: ${assessmentScope}
Reporting Requirements: ${reportingRequirements}

Please provide detailed environmental guidance including:
1. Environmental impact assessment
2. Regulatory compliance analysis
3. Mitigation strategies and recommendations
4. Sustainability implementation plan
5. Monitoring and evaluation framework
6. Stakeholder engagement strategy
7. Risk assessment and management
8. Best practices and standards
9. Cost-benefit analysis
10. Implementation roadmap and timeline

Format your response as a comprehensive environmental consulting report with actionable recommendations and strategic guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Environmental Consultant with expertise in environmental impact assessments, sustainability planning, regulatory compliance, and environmental management systems. You provide practical, science-based environmental guidance with strategic recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const environmentalGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        projectType,
        location,
        environmentalConcerns,
        regulatoryRequirements,
        budget,
        timeline,
        sustainabilityGoals,
        stakeholderGroups,
        assessmentScope,
        reportingRequirements,
        environmentalGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Environmental Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate environmental guidance' },
      { status: 500 }
    );
  }
}