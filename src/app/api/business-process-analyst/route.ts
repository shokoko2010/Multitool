import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface BusinessProcessAnalystRequest {
  businessType?: string;
  industry?: string;
  processChallenges?: string;
  currentProcesses?: string;
  budget?: string;
  timeline?: string;
  automationGoals?: string;
  integrationRequirements?: string;
  performanceIssues?: string;
  strategicObjectives?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BusinessProcessAnalystRequest;
    
    const {
      businessType = '',
      industry = '',
      processChallenges = '',
      currentProcesses = '',
      budget = '',
      timeline = '',
      automationGoals = '',
      integrationRequirements = '',
      performanceIssues = '',
      strategicObjectives = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Business Process Analyst, provide comprehensive business process analysis and optimization guidance for the following organization:

Business Type: ${businessType}
Industry: ${industry}
Process Challenges: ${processChallenges}
Current Processes: ${currentProcesses}
Budget: ${budget}
Timeline: ${timeline}
Automation Goals: ${automationGoals}
Integration Requirements: ${integrationRequirements}
Performance Issues: ${performanceIssues}
Strategic Objectives: ${strategicObjectives}

Please provide detailed business process guidance including:
1. Process mapping and documentation
2. Process analysis and gap identification
3. Bottleneck identification and resolution
4. Process optimization and redesign strategies
5. Automation and technology integration
6. Performance measurement and metrics
7. Workflow improvement recommendations
8. Change management and training needs
9. Cost-benefit analysis
10. Implementation roadmap and timeline

Format your response as a comprehensive business process analysis with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Business Process Analyst with expertise in process mapping, workflow optimization, business analysis, and process automation. You provide practical, data-driven process improvement guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const processGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        processChallenges,
        currentProcesses,
        budget,
        timeline,
        automationGoals,
        integrationRequirements,
        performanceIssues,
        strategicObjectives,
        processGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Business Process Analyst API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business process guidance' },
      { status: 500 }
    );
  }
}