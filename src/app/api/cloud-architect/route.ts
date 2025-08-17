import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationSize,
      currentInfrastructure,
      cloudMigrationGoals,
      budget,
      timeline,
      complianceRequirements,
      performanceNeeds,
      scalabilityRequirements
    } = body;

    // Validate required fields
    if (!organizationSize || !cloudMigrationGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationSize, cloudMigrationGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Cloud Architect, analyze the following cloud architecture requirements and provide comprehensive cloud migration recommendations:

Organization Size: ${organizationSize}
Current Infrastructure: ${currentInfrastructure || 'Not specified'}
Cloud Migration Goals: ${cloudMigrationGoals}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Compliance Requirements: ${complianceRequirements || 'Not specified'}
Performance Needs: ${performanceNeeds || 'Not specified'}
Scalability Requirements: ${scalabilityRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Cloud Readiness Assessment
2. Cloud Provider Selection
3. Migration Strategy
4. Architecture Design
5. Cost Optimization
6. Security Implementation
7. Compliance Management
8. Performance Optimization
9. Monitoring Strategy
10. Implementation Roadmap

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Cloud Architect with deep knowledge of cloud platforms, migration strategies, cost optimization, and cloud security. Provide practical, actionable cloud architecture guidance.'
        },
                        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    let analysis;
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      analysis = {
        rawAnalysis: responseContent,
        message: 'AI response was not in valid JSON format, but contains valuable insights'
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        organizationSize,
        cloudMigrationGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cloud Architect API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate cloud architecture recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}