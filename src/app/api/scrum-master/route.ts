import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      teamSize,
      projectType,
      currentMethodology,
    } = body;

    // Validate required fields
    if (!teamSize || !projectType || !currentMethodology) {
      return NextResponse.json(
        { error: 'Missing required fields: teamSize, projectType, currentMethodology' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Scrum Master, analyze the following agile team requirements and provide comprehensive Scrum implementation recommendations:

Team Size: ${teamSize}
Project Type: ${projectType}
Current Methodology: ${currentMethodology}
Challenges: ${challenges || 'Not specified'}
Goals: ${goals || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Experience Level: ${experienceLevel || 'Not specified'}
Tools Available: ${toolsAvailable || 'Not specified'}
Remote Work: ${remoteWork || 'Not specified'}

Please provide a detailed analysis including:
1. Agile Assessment
2. Scrum Framework Setup
3. Role Definition
4. Ceremony Planning
5. Artifact Management
6. Impediment Resolution
7. Team Dynamics
8. Metrics and Reporting
9. Continuous Improvement
10. Implementation Roadmap

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Scrum Master with deep knowledge of Scrum framework, agile methodologies, team facilitation, and continuous improvement. Provide practical, actionable Scrum implementation guidance.'
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
        teamSize,
        projectType,
        currentMethodology,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scrum Master API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate Scrum Master recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}