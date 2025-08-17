import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      currentInfrastructure,
      deploymentGoals,
      teamSize,
      technicalRequirements,
      budget,
      timeline,
      complianceNeeds,
      scalabilityRequirements
    } = body;

    // Validate required fields
    if (!projectType || !deploymentGoals || !currentInfrastructure) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, deploymentGoals, currentInfrastructure' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI DevOps Engineer, analyze the following DevOps requirements and provide comprehensive DevOps implementation recommendations:

Project Type: ${projectType}
Current Infrastructure: ${currentInfrastructure}
Deployment Goals: ${deploymentGoals}
Team Size: ${teamSize || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Compliance Needs: ${complianceNeeds || 'Not specified'}
Scalability Requirements: ${scalabilityRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Infrastructure Assessment
2. CI/CD Pipeline Design
3. Containerization Strategy
4. Cloud Architecture
5. Monitoring and Logging
6. Security Implementation
7. Automation Strategy
8. Configuration Management
9. Disaster Recovery
10. Implementation Roadmap

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI DevOps Engineer with deep knowledge of CI/CD pipelines, containerization, cloud infrastructure, automation, and DevOps best practices. Provide practical, actionable DevOps guidance.'
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
        projectType,
        deploymentGoals,
        currentInfrastructure,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('DevOps Engineer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate DevOps recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}