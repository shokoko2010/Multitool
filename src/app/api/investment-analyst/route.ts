import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface InvestmentAnalystRequest {
  investmentType?: string;
  investmentAmount?: string;
  timeHorizon?: string;
  riskProfile?: string;
  marketSector?: string;
  geographicFocus?: string;
  investmentGoals?: string;
  currentPortfolio?: string;
  marketConditions?: string;
  exitStrategy?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as InvestmentAnalystRequest;
    
    const {
      investmentType = '',
      investmentAmount = '',
      timeHorizon = '',
      riskProfile = '',
      marketSector = '',
      geographicFocus = '',
      investmentGoals = '',
      currentPortfolio = '',
      marketConditions = '',
      exitStrategy = ''
    } = body;

    if (!investmentType.trim()) {
      return NextResponse.json(
        { error: 'Investment type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a professional Investment Analyst, provide comprehensive investment analysis and recommendations for the following investment scenario:

Investment Type: ${investmentType}
Investment Amount: ${investmentAmount}
Time Horizon: ${timeHorizon}
Risk Profile: ${riskProfile}
Market Sector: ${marketSector}
Geographic Focus: ${geographicFocus}
Investment Goals: ${investmentGoals}
Current Portfolio: ${currentPortfolio}
Market Conditions: ${marketConditions}
Exit Strategy: ${exitStrategy}

Please provide detailed investment analysis including:
1. Market analysis and trends
2. Risk assessment and mitigation
3. Investment opportunity evaluation
4. Portfolio allocation recommendations
5. Financial projections and returns
6. Due diligence considerations
7. Market timing analysis
8. Competitive landscape assessment
9. Regulatory and compliance factors
10. Performance monitoring framework

Format your response as a comprehensive investment analysis report with actionable recommendations and strategic insights.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a certified Investment Analyst with extensive experience in financial markets, portfolio management, risk assessment, and investment strategy. You provide data-driven investment analysis with practical recommendations and risk considerations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const investmentAnalysis = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        investmentType,
        investmentAmount,
        timeHorizon,
        riskProfile,
        marketSector,
        geographicFocus,
        investmentGoals,
        currentPortfolio,
        marketConditions,
        exitStrategy,
        investmentAnalysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Investment Analyst API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate investment analysis' },
      { status: 500 }
    );
  }
}