import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      operation,
      value1,
      value2,
      precision = 2,
      showFormula = false,
      includeExplanation = true
    } = body;

    // Input validation
    if (!operation || !['calculate_percentage', 'percentage_of', 'percentage_change', 'percentage_difference', 'percentage_increase', 'percentage_decrease'].includes(operation)) {
      return NextResponse.json(
        { error: 'Valid operation is required: calculate_percentage, percentage_of, percentage_change, percentage_difference, percentage_increase, percentage_decrease' },
        { status: 400 }
      );
    }

    if (value1 === undefined || value1 === null || isNaN(value1)) {
      return NextResponse.json(
        { error: 'value1 is required and must be a number' },
        { status: 400 }
      );
    }

    if (operation !== 'calculate_percentage' && (value2 === undefined || value2 === null || isNaN(value2))) {
      return NextResponse.json(
        { error: 'value2 is required and must be a number' },
        { status: 400 }
      );
    }

    if (typeof precision !== 'number' || precision < 0 || precision > 10) {
      return NextResponse.json(
        { error: 'Precision must be a number between 0 and 10' },
        { status: 400 }
      );
    }

    if (typeof showFormula !== 'boolean' || typeof includeExplanation !== 'boolean') {
      return NextResponse.json(
        { error: 'Boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    // Convert values to numbers
    const num1 = parseFloat(value1.toString());
    const num2 = operation !== 'calculate_percentage' ? parseFloat(value2.toString()) : 0;

    // Validate numbers
    if (isNaN(num1) || (operation !== 'calculate_percentage' && isNaN(num2))) {
      return NextResponse.json(
        { error: 'Invalid numeric values' },
        { status: 400 }
      );
    }

    // Perform calculation based on operation
    let result: number;
    let formula: string;
    let explanation: string;
    let calculation: any = {};

    switch (operation) {
      case 'calculate_percentage':
        // Convert fraction to percentage
        result = num1 * 100;
        formula = `${num1} × 100 = ${result.toFixed(precision)}%`;
        explanation = `Convert ${num1} to percentage by multiplying by 100`;
        calculation = {
          type: 'fraction_to_percentage',
          input: num1,
          multiplier: 100,
          result: result
        };
        break;

      case 'percentage_of':
        // Calculate X% of Y
        result = (num1 / 100) * num2;
        formula = `(${num1}% of ${num2}) = (${num1} ÷ 100) × ${num2} = ${result.toFixed(precision)}`;
        explanation = `${num1}% of ${num2} is ${result.toFixed(precision)}`;
        calculation = {
          type: 'percentage_of',
          percentage: num1,
          total: num2,
          result: result
        };
        break;

      case 'percentage_change':
        // Calculate percentage change from old value to new value
        if (num2 === 0) {
          return NextResponse.json(
            { error: 'Cannot calculate percentage change when original value is zero' },
            { status: 400 }
          );
        }
        result = ((num1 - num2) / num2) * 100;
        formula = `((${num1} - ${num2}) ÷ ${num2}) × 100 = ${result.toFixed(precision)}%`;
        explanation = `Percentage change from ${num2} to ${num1} is ${result.toFixed(precision)}%`;
        calculation = {
          type: 'percentage_change',
          newValue: num1,
          oldValue: num2,
          change: num1 - num2,
          result: result
        };
        break;

      case 'percentage_difference':
        // Calculate percentage difference between two values
        const average = (num1 + num2) / 2;
        if (average === 0) {
          return NextResponse.json(
            { error: 'Cannot calculate percentage difference when both values are zero' },
            { status: 400 }
          );
        }
        result = (Math.abs(num1 - num2) / average) * 100;
        formula = `(|${num1} - ${num2}| ÷ ((${num1} + ${num2}) ÷ 2)) × 100 = ${result.toFixed(precision)}%`;
        explanation = `Percentage difference between ${num1} and ${num2} is ${result.toFixed(precision)}%`;
        calculation = {
          type: 'percentage_difference',
          value1: num1,
          value2: num2,
          absoluteDifference: Math.abs(num1 - num2),
          average: average,
          result: result
        };
        break;

      case 'percentage_increase':
        // Calculate value after percentage increase
        result = num1 * (1 + num2 / 100);
        formula = `${num1} × (1 + ${num2}%) = ${num1} × ${(1 + num2 / 100).toFixed(precision)} = ${result.toFixed(precision)}`;
        explanation = `${num1} increased by ${num2}% is ${result.toFixed(precision)}`;
        calculation = {
          type: 'percentage_increase',
          original: num1,
          percentage: num2,
          increase: num1 * (num2 / 100),
          result: result
        };
        break;

      case 'percentage_decrease':
        // Calculate value after percentage decrease
        result = num1 * (1 - num2 / 100);
        formula = `${num1} × (1 - ${num2}%) = ${num1} × ${(1 - num2 / 100).toFixed(precision)} = ${result.toFixed(precision)}`;
        explanation = `${num1} decreased by ${num2}% is ${result.toFixed(precision)}`;
        calculation = {
          type: 'percentage_decrease',
          original: num1,
          percentage: num2,
          decrease: num1 * (num2 / 100),
          result: result
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

    // Round result to specified precision
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);

    // Additional analysis
    const analysis = {
      result: roundedResult,
      precision: precision,
      isPositive: result > 0,
      isNegative: result < 0,
      isZero: result === 0,
      absoluteValue: Math.abs(result),
      percentage: operation === 'calculate_percentage' ? roundedResult : null
    };

    // Contextual information
    const context = {
      operation: operation,
      inputs: {
        value1: num1,
        value2: operation !== 'calculate_percentage' ? num2 : null
      },
      formula: showFormula ? formula : null,
      explanation: includeExplanation ? explanation : null,
      calculation: calculation
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a mathematics and percentage calculation expert. Analyze the percentage calculation and provide insights about the result, its significance, and practical applications.'
          },
          {
            role: 'user',
            content: `Performed ${operation} calculation with inputs ${num1}${operation !== 'calculate_percentage' ? ' and ' + num2 : ''}. Result: ${roundedResult.toFixed(precision)}. ${includeExplanation ? explanation : ''} Provide insights about this percentage calculation and its practical applications.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    return NextResponse.json({
      success: true,
      result: roundedResult,
      analysis,
      context,
      aiInsights
    });

  } catch (error) {
    console.error('Percentage calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate percentage' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Percentage Calculator API',
    usage: 'POST /api/math-tools/percentage-calculator',
    parameters: {
      operation: 'Calculation type (required):',
      value1: 'First numeric value (required)',
      value2: 'Second numeric value (required for most operations)',
      precision: 'Decimal precision (0-10, default: 2) - optional',
      showFormula: 'Show calculation formula (default: false) - optional',
      includeExplanation: 'Include explanation (default: true) - optional'
    },
    operations: {
      calculate_percentage: 'Convert fraction to percentage (value1 only)',
      percentage_of: 'Calculate X% of Y',
      percentage_change: 'Calculate percentage change from old to new value',
      percentage_difference: 'Calculate percentage difference between two values',
      percentage_increase: 'Calculate value after percentage increase',
      percentage_decrease: 'Calculate value after percentage decrease'
    },
    examples: [
      {
        operation: 'percentage_of',
        value1: 25,
        value2: 200,
        precision: 2
      },
      {
        operation: 'percentage_change',
        value1: 150,
        value2: 100,
        showFormula: true
      },
      {
        operation: 'calculate_percentage',
        value1: 0.75,
        precision: 1
      },
      {
        operation: 'percentage_increase',
        value1: 1000,
        value2: 15
      }
    ]
  });
}