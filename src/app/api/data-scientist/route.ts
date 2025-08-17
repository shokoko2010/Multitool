import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      dataSources,
      analysisGoals,
      currentMethods,
      technicalRequirements,
      budget,
      timeline,
      teamSkills,
      businessContext
    } = body;

    // Validate required fields
    if (!projectType || !dataSources || !analysisGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, dataSources, analysisGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Data Scientist, analyze the following data science requirements and provide comprehensive data science recommendations:

Project Type: ${projectType}
Data Sources: ${dataSources}
Analysis Goals: ${analysisGoals}
Current Methods: ${currentMethods || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Team Skills: ${teamSkills || 'Not specified'}
Business Context: ${businessContext || 'Not specified'}

Please provide a detailed analysis including:
1. Data Assessment
2. Methodology Selection
3. Data Processing
4. Model Development
5. Validation Strategy
6. Implementation Plan
7. Tools and Technologies
8. Performance Metrics
9. Ethical Considerations
10. Deployment Strategy

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Data Scientist with deep knowledge of machine learning, statistical analysis, data processing, model development, and data science methodologies. Provide practical, actionable data science guidance.'
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
        dataSources,
        analysisGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Data Scientist API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate data science recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}