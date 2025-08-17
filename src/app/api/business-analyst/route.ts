import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface BusinessAnalystRequest {
  projectType?: string;
  industry?: string;
  businessObjectives?: string;
  stakeholderGroups?: string;
  currentProcesses?: string;
  budget?: string;
  timeline?: string;
  complexityLevel?: string;
  technologyRequirements?: string;
  successCriteria?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BusinessAnalystRequest;
    
    const {
      projectType = '',
      industry = '',
      businessObjectives = '',
      stakeholderGroups = '',
      currentProcesses = '',
      budget = '',
      timeline = '',
      complexityLevel = '',
      technologyRequirements = '',
      successCriteria = ''
    } = body;

    if (!projectType.trim()) {
      return NextResponse.json(
        { error: 'Project type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Business Analyst, provide comprehensive business analysis and requirements guidance for the following project:

Project Type: ${projectType}
Industry: ${industry}
Business Objectives: ${businessObjectives}
Stakeholder Groups: ${stakeholderGroups}
Current Processes: ${currentProcesses}
Budget: ${budget}
Timeline: ${timeline}
Complexity Level: ${complexityLevel}
Technology Requirements: ${technologyRequirements}
Success Criteria: ${successCriteria}

Please provide detailed business analysis guidance including:
1. Requirements gathering and elicitation
2. Stakeholder analysis and management
3. Business process analysis and modeling
4. Use case development and documentation
5. Functional and non-functional requirements
6. Data analysis and requirements
7. Solution evaluation and recommendation
8. Business case development
9. Change impact assessment
10. Implementation planning and validation

Format your response as a comprehensive business analysis with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Business Analyst with expertise in requirements gathering, process analysis, stakeholder management, and solution design. You provide practical, business-focused analysis guidance with implementation approaches.'
        },
                        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const businessAnalysisGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        projectType,
        industry,
        businessObjectives,
        stakeholderGroups,
        currentProcesses,
        budget,
        timeline,
        complexityLevel,
        technologyRequirements,
        successCriteria,
        businessAnalysisGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Business Analyst API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business analysis guidance' },
      { status: 500 }
    );
  }
}