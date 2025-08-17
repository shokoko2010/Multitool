import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface OperationsManagerRequest {
  businessType?: string;
  industry?: string;
  operationalChallenges?: string;
  currentProcesses?: string;
  budget?: string;
  timeline?: string;
  scaleOfOperations?: string;
  technologyInfrastructure?: string;
  performanceMetrics?: string;
  strategicObjectives?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OperationsManagerRequest;
    
    const {
      businessType = '',
      industry = '',
      operationalChallenges = '',
      currentProcesses = '',
      budget = '',
      timeline = '',
      scaleOfOperations = '',
      technologyInfrastructure = '',
      performanceMetrics = '',
      strategicObjectives = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an Operations Manager, provide comprehensive operational strategy and optimization guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Operational Challenges: ${operationalChallenges}
Current Processes: ${currentProcesses}
Budget: ${budget}
Timeline: ${timeline}
Scale of Operations: ${scaleOfOperations}
Technology Infrastructure: ${technologyInfrastructure}
Performance Metrics: ${performanceMetrics}
Strategic Objectives: ${strategicObjectives}

Please provide detailed operational guidance including:
1. Operational assessment and gap analysis
2. Process optimization and improvement strategies
3. Resource allocation and utilization
4. Technology integration and automation
5. Quality management and control systems
6. Supply chain and logistics optimization
7. Performance measurement and KPIs
8. Cost reduction and efficiency improvements
9. Risk management and contingency planning
10. Change management and implementation roadmap

Format your response as a comprehensive operations strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Operations Manager with expertise in process optimization, operational efficiency, supply chain management, quality control, and business operations. You provide practical, results-oriented operational guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const operationsGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        operationalChallenges,
        currentProcesses,
        budget,
        timeline,
        scaleOfOperations,
        technologyInfrastructure,
        performanceMetrics,
        strategicObjectives,
        operationsGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Operations Manager API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate operations guidance' },
      { status: 500 }
    );
  }
}