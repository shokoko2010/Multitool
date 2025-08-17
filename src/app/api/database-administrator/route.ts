import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      dataVolume,
      dataTypes,
      performanceRequirements,
      budget,
      timeline,
      currentDatabase,
      scalabilityNeeds,
      securityRequirements
    } = body;

    // Validate required fields
    if (!projectType || !dataVolume || !performanceRequirements) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, dataVolume, performanceRequirements' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Database Administrator, analyze the following database requirements and provide comprehensive database management recommendations:

Project Type: ${projectType}
Data Volume: ${dataVolume}
Data Types: ${dataTypes || 'Not specified'}
Performance Requirements: ${performanceRequirements}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Current Database: ${currentDatabase || 'Not specified'}
Scalability Needs: ${scalabilityNeeds || 'Not specified'}
Security Requirements: ${securityRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. Database Assessment
2. Database Selection
3. Schema Design
4. Performance Optimization
5. Security Implementation
6. Backup Strategy
7. Monitoring Solutions
8. Migration Planning
9. Maintenance Strategy
10. Implementation Timeline

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Database Administrator with deep knowledge of database systems, performance tuning, security implementations, and data management best practices. Provide practical, actionable database administration guidance.'
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
        dataVolume,
        performanceRequirements,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database Administrator API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate database administration recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}