import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productType,
      targetMarket,
      businessGoals,
      currentStage,
      budget,
      timeline,
      teamSize,
      competitiveLandscape
    } = body;

    // Validate required fields
    if (!productType || !targetMarket || !businessGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: productType, targetMarket, businessGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Product Manager, analyze the following product management requirements and provide comprehensive product strategy recommendations:

Product Type: ${productType}
Target Market: ${targetMarket}
Business Goals: ${businessGoals}
Current Stage: ${currentStage || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Team Size: ${teamSize || 'Not specified'}
Competitive Landscape: ${competitiveLandscape || 'Not specified'}

Please provide a detailed analysis including:
1. Product Assessment
2. Market Analysis
3. User Research
4. Product Strategy
5. Roadmap Planning
6. Feature Prioritization
7. Go-to-Market Strategy
8. Metrics and KPIs
9. Risk Management
10. Implementation Plan

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Product Manager with deep knowledge of product strategy, market analysis, user research, roadmap planning, and product lifecycle management. Provide practical, actionable product management guidance.'
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
        productType,
        targetMarket,
        businessGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Product Manager API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate product management recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}