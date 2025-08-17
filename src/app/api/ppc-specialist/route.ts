import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessType,
      advertisingGoals,
      targetAudience,
      budget,
      currentPPCStrategy,
      platforms,
      geographicTargeting,
      conversionGoals,
      timeline
    } = body;

    // Validate required fields
    if (!businessType || !advertisingGoals || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: businessType, advertisingGoals, budget' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI PPC Specialist, analyze the following pay-per-click advertising requirements and provide comprehensive PPC campaign recommendations:

Business Type: ${businessType}
Advertising Goals: ${advertisingGoals}
Target Audience: ${targetAudience || 'Not specified'}
Budget: ${budget}
Current PPC Strategy: ${currentPPCStrategy || 'Not specified'}
Platforms: ${platforms || 'Not specified'}
Geographic Targeting: ${geographicTargeting || 'Not specified'}
Conversion Goals: ${conversionGoals || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Please provide a detailed analysis including:
1. Campaign Strategy
2. Keyword Research
3. Ad Copy Creation
4. Landing Page Optimization
5. Bidding Strategy
6. Targeting Options
7. Budget Allocation
8. Performance Tracking
9. A/B Testing
10. Optimization Tactics

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI PPC Specialist with deep knowledge of pay-per-click advertising, campaign management, keyword research, ad copy creation, and digital marketing. Provide practical, actionable PPC guidance.'
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
        businessType,
        advertisingGoals,
        budget,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PPC Specialist API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PPC campaign recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}