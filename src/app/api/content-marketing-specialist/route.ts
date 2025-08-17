import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ContentMarketingSpecialistRequest {
  businessType?: string;
  industry?: string;
  targetAudience?: string;
  contentGoals?: string;
  currentContentStrategy?: string;
  budget?: string;
  timeline?: string;
  contentTypes?: string;
  distributionChannels?: string;
  performanceMetrics?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContentMarketingSpecialistRequest;
    
    const {
      businessType = '',
      industry = '',
      targetAudience = '',
      contentGoals = '',
      currentContentStrategy = '',
      budget = '',
      timeline = '',
      contentTypes = '',
      distributionChannels = '',
      performanceMetrics = ''
    } = body;

    if (!businessType.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Content Marketing Specialist, provide comprehensive content marketing strategy and guidance for the following business:

Business Type: ${businessType}
Industry: ${industry}
Target Audience: ${targetAudience}
Content Goals: ${contentGoals}
Current Content Strategy: ${currentContentStrategy}
Budget: ${budget}
Timeline: ${timeline}
Content Types: ${contentTypes}
Distribution Channels: ${distributionChannels}
Performance Metrics: ${performanceMetrics}

Please provide detailed content marketing guidance including:
1. Content audit and assessment
2. Content strategy and planning framework
3. Audience research and persona development
4. Content calendar and editorial planning
5. Content creation and production workflows
6. SEO and content optimization strategies
7. Content distribution and promotion
8. Content performance measurement
9. Content governance and management
10. Implementation roadmap and resource planning

Format your response as a comprehensive content marketing strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Content Marketing Specialist with expertise in content strategy, SEO, content creation, and content distribution. You provide practical, results-oriented content marketing guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const contentMarketingGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        businessType,
        industry,
        targetAudience,
        contentGoals,
        currentContentStrategy,
        budget,
        timeline,
        contentTypes,
        distributionChannels,
        performanceMetrics,
        contentMarketingGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Content Marketing Specialist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content marketing guidance' },
      { status: 500 }
    );
  }
}