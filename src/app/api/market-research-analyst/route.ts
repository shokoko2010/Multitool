import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface MarketResearchAnalystRequest {
  productService?: string;
  targetMarket?: string;
  researchObjectives?: string;
  budget?: string;
  timeline?: string;
  methodology?: string;
  competitorAnalysis?: string;
  customerSegments?: string;
  geographicScope?: string;
  dataSources?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MarketResearchAnalystRequest;
    
    const {
      productService = '',
      targetMarket = '',
      researchObjectives = '',
      budget = '',
      timeline = '',
      methodology = '',
      competitorAnalysis = '',
      customerSegments = '',
      geographicScope = '',
      dataSources = ''
    } = body;

    if (!productService.trim()) {
      return NextResponse.json(
        { error: 'Product or service description is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Market Research Analyst, provide comprehensive market research guidance and analysis for the following research initiative:

Product/Service: ${productService}
Target Market: ${targetMarket}
Research Objectives: ${researchObjectives}
Budget: ${budget}
Timeline: ${timeline}
Methodology: ${methodology}
Competitor Analysis: ${competitorAnalysis}
Customer Segments: ${customerSegments}
Geographic Scope: ${geographicScope}
Data Sources: ${dataSources}

Please provide detailed market research guidance including:
1. Research methodology recommendations
2. Market sizing and segmentation analysis
3. Competitive landscape assessment
4. Customer insights and behavior analysis
5. Data collection strategies
6. Sampling and survey design
7. Data analysis framework
8. Reporting and presentation recommendations
9. Actionable insights and recommendations
10. Implementation roadmap and timeline

Format your response as a comprehensive market research plan with actionable insights and strategic recommendations.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Market Research Analyst with expertise in market analysis, consumer research, competitive intelligence, and data-driven insights. You provide practical, research-based market guidance with actionable strategic recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const marketResearchGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        productService,
        targetMarket,
        researchObjectives,
        budget,
        timeline,
        methodology,
        competitorAnalysis,
        customerSegments,
        geographicScope,
        dataSources,
        marketResearchGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Market Research Analyst API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate market research guidance' },
      { status: 500 }
    );
  }
}