import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CloudMigrationSpecialistRequest {
  organizationType?: string;
  industry?: string;
  currentInfrastructure?: string;
  migrationGoals?: string;
  budget?: string;
  timeline?: string;
  workloadTypes?: string;
  complianceRequirements?: string;
  securityConcerns?: string;
  targetCloudPlatforms?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CloudMigrationSpecialistRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentInfrastructure = '',
      migrationGoals = '',
      budget = '',
      timeline = '',
      workloadTypes = '',
      complianceRequirements = '',
      securityConcerns = '',
      targetCloudPlatforms = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Cloud Migration Specialist, provide comprehensive cloud migration strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Infrastructure: ${currentInfrastructure}
Migration Goals: ${migrationGoals}
Budget: ${budget}
Timeline: ${timeline}
Workload Types: ${workloadTypes}
Compliance Requirements: ${complianceRequirements}
Security Concerns: ${securityConcerns}
Target Cloud Platforms: ${targetCloudPlatforms}

Please provide detailed cloud migration guidance including:
1. Cloud readiness assessment
2. Migration strategy and approach selection
3. Cloud platform evaluation and selection
4. Application portfolio assessment
5. Migration roadmap and phasing
6. Security and compliance considerations
7. Cost optimization strategies
8. Skills and capability development
9. Governance and operations model
10. Implementation and change management

Format your response as a comprehensive cloud migration strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Cloud Migration Specialist with expertise in cloud strategy, migration methodologies, cloud architecture, and transformation planning. You provide practical, results-oriented cloud migration guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const cloudMigrationGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentInfrastructure,
        migrationGoals,
        budget,
        timeline,
        workloadTypes,
        complianceRequirements,
        securityConcerns,
        targetCloudPlatforms,
        cloudMigrationGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cloud Migration Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cloud migration guidance' },
      { status: 500 }
    );
  }
}