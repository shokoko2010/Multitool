import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ProjectManagementConsultantRequest {
  projectType?: string;
  industry?: string;
  projectScope?: string;
  projectChallenges?: string;
  budget?: string;
  timeline?: string;
  teamSize?: string;
  stakeholders?: string;
  methodology?: string;
  successCriteria?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ProjectManagementConsultantRequest;
    
    const {
      projectType = '',
      industry = '',
      projectScope = '',
      projectChallenges = '',
      budget = '',
      timeline = '',
      teamSize = '',
      stakeholders = '',
      methodology = '',
      successCriteria = ''
    } = body;

    if (!projectType.trim()) {
      return NextResponse.json(
        { error: 'Project type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Project Management Consultant, provide comprehensive project management strategy and guidance for the following project:

Project Type: ${projectType}
Industry: ${industry}
Project Scope: ${projectScope}
Project Challenges: ${projectChallenges}
Budget: ${budget}
Timeline: ${timeline}
Team Size: ${teamSize}
Stakeholders: ${stakeholders}
Methodology: ${methodology}
Success Criteria: ${successCriteria}

Please provide detailed project management guidance including:
1. Project assessment and planning
2. Methodology selection and adaptation
3. Risk assessment and mitigation strategies
4. Resource allocation and team management
5. Timeline and scheduling optimization
6. Budget management and cost control
7. Quality assurance and deliverables management
8. Stakeholder communication and engagement
9. Change management and scope control
10. Monitoring, evaluation, and reporting framework

Format your response as a comprehensive project management strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Project Management Consultant with expertise in project planning, risk management, team leadership, and project delivery methodologies. You provide practical, results-oriented project management guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const projectManagementGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        projectType,
        industry,
        projectScope,
        projectChallenges,
        budget,
        timeline,
        teamSize,
        stakeholders,
        methodology,
        successCriteria,
        projectManagementGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Project Management Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate project management guidance' },
      { status: 500 }
    );
  }
}