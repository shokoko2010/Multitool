import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessType,
      emailListSize,
      campaignGoals,
      targetAudience,
      currentEmailStrategy,
      budget,
      emailFrequency,
    } = body;

    // Validate required fields
    if (!businessType || !campaignGoals || !targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields: businessType, campaignGoals, targetAudience' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Email Marketer, analyze the following email marketing requirements and provide comprehensive email marketing recommendations:

Business Type: ${businessType}
Email List Size: ${emailListSize || 'Not specified'}
Campaign Goals: ${campaignGoals}
Target Audience: ${targetAudience}
Current Email Strategy: ${currentEmailStrategy || 'Not specified'}
Budget: ${budget || 'Not specified'}
Email Frequency: ${emailFrequency || 'Not specified'}

Please provide a detailed analysis including:
1. Email Strategy
2. List Management
3. Campaign Planning
4. Content Creation
5. Automation Setup
6. Segmentation Strategy
7. A/B Testing
8. Analytics and Metrics
9. Deliverability Optimization
10. Compliance Guidelines

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Email Marketer with deep knowledge of email marketing, campaign strategy, list management, automation, and digital marketing. Provide practical, actionable email marketing guidance.'
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
        campaignGoals,
        targetAudience,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email Marketer API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate email marketing recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}