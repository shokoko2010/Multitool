import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      dataSources,
      mlGoals,
      currentMLSetup,
      budget,
      timeline,
    } = body;

    // Validate required fields
    if (!projectType || !mlGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, mlGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Machine Learning Engineer, analyze the following machine learning requirements and provide comprehensive ML implementation recommendations:

Project Type: ${projectType}
Data Sources: ${dataSources || 'Not specified'}
ML Goals: ${mlGoals}
Current ML Setup: ${currentMLSetup || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Please provide a detailed analysis including:
1. ML Assessment
2. Data Strategy
3. Model Selection
4. Training Approach
5. Evaluation Metrics
6. Deployment Strategy
7. Monitoring Solutions
8. Performance Optimization
9. Scalability Planning
10. Implementation Timeline

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Machine Learning Engineer with deep knowledge of ML algorithms, data preprocessing, model training, and deployment strategies. Provide practical, actionable machine learning guidance.'
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
        mlGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Machine Learning Engineer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate machine learning recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}