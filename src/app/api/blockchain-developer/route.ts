import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType,
      blockchainGoals,
      currentBlockchainSetup,
      budget,
      timeline,
    } = body;

    // Validate required fields
    if (!projectType || !blockchainGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: projectType, blockchainGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Blockchain Developer, analyze the following blockchain development requirements and provide comprehensive blockchain implementation recommendations:

Project Type: ${projectType}
Blockchain Goals: ${blockchainGoals}
Current Blockchain Setup: ${currentBlockchainSetup || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Please provide a detailed analysis including:
1. Blockchain Assessment
2. Platform Selection
3. Smart Contract Design
4. Consensus Mechanism
5. Security Implementation
6. Scalability Solutions
7. Integration Strategy
8. Testing Approach
9. Deployment Plan
10. Maintenance Considerations

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Blockchain Developer with deep knowledge of blockchain platforms, smart contracts, consensus mechanisms, and decentralized applications. Provide practical, actionable blockchain development guidance.'
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
        blockchainGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Blockchain Developer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate blockchain development recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}