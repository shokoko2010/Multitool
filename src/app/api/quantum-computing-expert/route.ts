import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      quantumGoals,
      currentQuantumSetup,
    } = body;

    // Validate required fields
    if (!projectType || !quantumGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, quantumGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Quantum Computing Expert, analyze the following quantum computing project requirements and provide comprehensive quantum computing implementation recommendations:

Project Type: ${projectType}
Quantum Goals: ${quantumGoals}
Current Quantum Setup: ${currentQuantumSetup || 'Not specified'}

Please provide a detailed analysis including:
1. Quantum Assessment
2. Algorithm Selection
3. Hardware Requirements
4. Development Approach
5. Error Correction
6. Performance Optimization
7. Integration Strategy
8. Testing Methodology
9. Future Considerations
10. Implementation Roadmap

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Quantum Computing Expert with deep knowledge of quantum algorithms, quantum hardware, error correction, and quantum applications. Provide practical, actionable quantum computing guidance.'
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
        quantumGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Quantum Computing Expert API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate quantum computing recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}