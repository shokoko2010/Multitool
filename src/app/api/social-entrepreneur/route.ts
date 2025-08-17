import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessIdea,
      socialImpact,
    } = body;

    // Validate required fields
    if (!businessIdea || !socialImpact || !targetMarket) {
      return NextResponse.json(
        { error: 'Missing required fields: businessIdea, socialImpact, targetMarket' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Social Entrepreneur, analyze the following social enterprise requirements and provide comprehensive social business recommendations:

Business Idea: ${businessIdea}
Social Impact: ${socialImpact}
Target Market: ${targetMarket}
Current Stage: ${currentStage || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Team Size: ${teamSize || 'Not specified'}
Industry: ${industry || 'Not specified'}

Please provide a detailed analysis including:
1. Business Model
2. Impact Strategy
3. Market Analysis
4. Financial Planning
5. Operations Strategy
6. Marketing Approach
7. Impact Measurement
8. Funding Strategy
9. Scaling Plan
10. Implementation Roadmap

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Social Entrepreneur with deep knowledge of social business models, impact measurement, sustainable development, and social innovation. Provide practical, actionable social entrepreneurship guidance.'
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
        businessIdea,
        socialImpact,
        targetMarket,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Social Entrepreneur API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate social entrepreneurship recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}