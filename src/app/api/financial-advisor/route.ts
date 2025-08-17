import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface FinancialAdvisorRequest {
  financialGoals?: string;
  currentIncome?: string;
  expenses?: string;
  assets?: string;
  liabilities?: string;
  riskTolerance?: string;
  investmentHorizon?: string;
  age?: string;
  dependents?: string;
  retirementPlans?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FinancialAdvisorRequest;
    
    const {
      financialGoals = '',
      currentIncome = '',
      expenses = '',
      assets = '',
      liabilities = '',
      riskTolerance = '',
      investmentHorizon = '',
      age = '',
      dependents = '',
      retirementPlans = ''
    } = body;

    if (!financialGoals.trim()) {
      return NextResponse.json(
        { error: 'Financial goals are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a professional Financial Advisor, provide comprehensive financial planning advice based on the following information:

Financial Goals: ${financialGoals}
Current Income: ${currentIncome}
Monthly Expenses: ${expenses}
Current Assets: ${assets}
Current Liabilities: ${liabilities}
Risk Tolerance: ${riskTolerance}
Investment Horizon: ${investmentHorizon}
Age: ${age}
Number of Dependents: ${dependents}
Retirement Plans: ${retirementPlans}

Please provide detailed financial advice including:
1. Financial goal analysis and prioritization
2. Budget optimization recommendations
3. Investment strategy suggestions
4. Risk management approaches
5. Retirement planning guidance
6. Tax optimization strategies
7. Emergency fund recommendations
8. Debt management advice
9. Insurance coverage suggestions
10. Estate planning considerations

Format your response as a comprehensive financial plan with actionable steps and specific recommendations.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a certified Financial Advisor with extensive experience in personal finance, investment planning, retirement planning, and wealth management. You provide practical, personalized financial advice with clear action steps.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const financialAdvice = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        financialGoals,
        currentIncome,
        expenses,
        assets,
        liabilities,
        riskTolerance,
        investmentHorizon,
        age,
        dependents,
        retirementPlans,
        financialAdvice,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Financial Advisor API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial advice' },
      { status: 500 }
    );
  }
}