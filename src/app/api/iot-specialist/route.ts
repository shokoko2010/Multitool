import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      iotGoals,
      currentIoTSetup,
      budget,
      timeline,
    } = body;

    // Validate required fields
    if (!projectType || !iotGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, iotGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI IoT Specialist, analyze the following IoT implementation requirements and provide comprehensive IoT development recommendations:

Project Type: ${projectType}
IoT Goals: ${iotGoals}
Current IoT Setup: ${currentIoTSetup || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Please provide a detailed analysis including:
1. IoT Assessment
2. Device Selection
3. Network Architecture
4. Data Management
5. Security Implementation
6. Cloud Integration
7. Analytics Strategy
8. Testing Approach
9. Deployment Plan
10. Maintenance Considerations

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI IoT Specialist with deep knowledge of IoT devices, network protocols, data management, and cloud integration. Provide practical, actionable IoT development guidance.'
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
        iotGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('IoT Specialist API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate IoT development recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}