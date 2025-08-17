import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      websiteType,
      targetKeywords,
      businessGoals,
      currentSEOStatus,
      competitors,
      targetAudience,
      budget,
      timeline,
      technicalRequirements
    } = body;

    // Validate required fields
    if (!websiteType || !targetKeywords || !businessGoals) {
      return NextResponse.json(
        { error: 'Missing required fields: websiteType, targetKeywords, businessGoals' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI SEO Specialist, analyze the following SEO requirements and provide comprehensive search engine optimization recommendations:

Website Type: ${websiteType}
Target Keywords: ${targetKeywords}
Business Goals: ${businessGoals}
Current SEO Status: ${currentSEOStatus || 'Not specified'}
Competitors: ${competitors || 'Not specified'}
Target Audience: ${targetAudience || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Technical Requirements: ${technicalRequirements || 'Not specified'}

Please provide a detailed analysis including:
1. SEO Audit
2. Keyword Strategy
3. On-Page Optimization
4. Technical SEO
5. Content Strategy
6. Link Building
7. Local SEO
8. Analytics Setup
9. Performance Tracking
10. Implementation Timeline

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI SEO Specialist with deep knowledge of search engine optimization, keyword research, technical SEO, content optimization, and digital marketing. Provide practical, actionable SEO guidance.'
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
        websiteType,
        targetKeywords,
        businessGoals,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('SEO Specialist API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate SEO recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}