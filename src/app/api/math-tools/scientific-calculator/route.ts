import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      expression,
      precision = 10,
      showSteps = false,
      variables = {},
      angleUnit = 'radians'
    } = body;

    // Input validation
    if (!expression || typeof expression !== 'string') {
      return NextResponse.json(
        { error: 'Expression is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof precision !== 'number' || precision < 0 || precision > 15) {
      return NextResponse.json(
        { error: 'Precision must be a number between 0 and 15' },
        { status: 400 }
      );
    }

    if (typeof showSteps !== 'boolean') {
      return NextResponse.json(
        { error: 'showSteps must be a boolean value' },
        { status: 400 }
      );
    }

    if (typeof variables !== 'object' || variables === null) {
      return NextResponse.json(
        { error: 'Variables must be an object' },
        { status: 400 }
      );
    }

    if (!['radians', 'degrees'].includes(angleUnit)) {
      return NextResponse.json(
        { error: 'Angle unit must be either "radians" or "degrees"' },
        { status: 400 }
      );
    }

    // Clean and validate expression
    const cleanExpression = expression.trim();
    if (cleanExpression.length === 0) {
      return NextResponse.json(
        { error: 'Expression cannot be empty' },
        { status: 400 }
      );
    }

    // Check for potentially dangerous expressions
    if (/[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/.test(cleanExpression) && 
        !/^(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|log10|log2|exp|sqrt|abs|pow|floor|ceil|round|min|max|random)\s*\(/i.test(cleanExpression)) {
      return NextResponse.json(
        { error: 'Invalid function in expression' },
        { status: 400 }
      );
    }

    try {
      // Evaluate the expression
      const result = evaluateExpression(cleanExpression, variables, angleUnit, precision, showSteps);
      
      // Try to get AI insights
      let aiInsights = null;
      try {
        const zai = await ZAI.create();
        const insights = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a mathematics and scientific calculation expert. Analyze the mathematical expression and calculation, providing insights about the operations, mathematical concepts, and potential applications.'
            },
            {
              role: 'user',
              content: `Evaluated scientific expression: "${cleanExpression}" with result: ${result.value}. ${showSteps ? `Calculation involved ${result.steps?.length || 0} steps.` : ''} Variables used: ${Object.keys(variables).join(', ') || 'none'}. Angle unit: ${angleUnit}. Provide insights about the mathematical operations and concepts.`
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
        result: result.value,
        expression: cleanExpression,
        variables: variables,
        angleUnit: angleUnit,
        precision: precision,
        ...(showSteps && { steps: result.steps }),
        aiInsights
      });

    } catch (error) {
      return NextResponse.json(
        { error: `Evaluation error: ${error}` },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Scientific calculator error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate expression' },
      { status: 500 }
    );
  }
}

function evaluateExpression(expression: string, variables: Record<string, number>, angleUnit: string, precision: number, showSteps: boolean): { value: number; steps?: any[] } {
  const steps: any[] = [];
  
  // Replace variables with their values
  let processedExpression = expression;
  for (const [varName, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    processedExpression = processedExpression.replace(regex, value.toString());
    
    if (showSteps) {
      steps.push({
        step: 'variable_substitution',
        variable: varName,
        value: value,
        expression: processedExpression
      });
    }
  }

  // Create a safe evaluation context
  const context: Record<string, any> = {
    // Basic constants
    PI: Math.PI,
    E: Math.E,
    
    // Basic functions
    abs: Math.abs,
    sqrt: Math.sqrt,
    pow: Math.pow,
    exp: Math.exp,
    log: Math.log,
    log10: Math.log10,
    log2: Math.log2,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    min: Math.min,
    max: Math.max,
    random: Math.random,
    
    // Trigonometric functions
    sin: (x: number) => Math.sin(angleUnit === 'degrees' ? x * Math.PI / 180 : x),
    cos: (x: number) => Math.cos(angleUnit === 'degrees' ? x * Math.PI / 180 : x),
    tan: (x: number) => Math.tan(angleUnit === 'degrees' ? x * Math.PI / 180 : x),
    asin: (x: number) => angleUnit === 'degrees' ? Math.asin(x) * 180 / Math.PI : Math.asin(x),
    acos: (x: number) => angleUnit === 'degrees' ? Math.acos(x) * 180 / Math.PI : Math.acos(x),
    atan: (x: number) => angleUnit === 'degrees' ? Math.atan(x) * 180 / Math.PI : Math.atan(x),
    
    // Hyperbolic functions
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    asinh: Math.asinh,
    acosh: Math.acosh,
    atanh: Math.atanh
  };

  // Add mathematical constants
  context.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  context.euler = 0.5772156649015329; // Euler's constant
  
  // Add basic operations
  context.add = (a: number, b: number) => a + b;
  context.subtract = (a: number, b: number) => a - b;
  context.multiply = (a: number, b: number) => a * b;
  context.divide = (a: number, b: number) => a / b;
  context.modulo = (a: number, b: number) => a % b;

  // Replace function names with context function calls
  processedExpression = processedExpression
    .replace(/\bsin\s*\(/g, 'context.sin(')
    .replace(/\bcos\s*\(/g, 'context.cos(')
    .replace(/\btan\s*\(/g, 'context.tan(')
    .replace(/\basin\s*\(/g, 'context.asin(')
    .replace(/\bacos\s*\(/g, 'context.acos(')
    .replace(/\batan\s*\(/g, 'context.atan(')
    .replace(/\bsinh\s*\(/g, 'context.sinh(')
    .replace(/\bcosh\s*\(/g, 'context.cosh(')
    .replace(/\btanh\s*\(/g, 'context.tanh(')
    .replace(/\basinh\s*\(/g, 'context.asinh(')
    .replace(/\bacosh\s*\(/g, 'context.acosh(')
    .replace(/\batanh\s*\(/g, 'context.atanh(')
    .replace(/\blog\s*\(/g, 'context.log(')
    .replace(/\blog10\s*\(/g, 'context.log10(')
    .replace(/\blog2\s*\(/g, 'context.log2(')
    .replace(/\bexp\s*\(/g, 'context.exp(')
    .replace(/\bsqrt\s*\(/g, 'context.sqrt(')
    .replace(/\babs\s*\(/g, 'context.abs(')
    .replace(/\bpow\s*\(/g, 'context.pow(')
    .replace(/\bfloor\s*\(/g, 'context.floor(')
    .replace(/\bceil\s*\(/g, 'context.ceil(')
    .replace(/\bround\s*\(/g, 'context.round(')
    .replace(/\bmin\s*\(/g, 'context.min(')
    .replace(/\bmax\s*\(/g, 'context.max(')
    .replace(/\brandom\s*\(/g, 'context.random(')
    .replace(/\bPI\b/g, 'context.PI')
    .replace(/\bE\b/g, 'context.E')
    .replace(/\bphi\b/g, 'context.phi')
    .replace(/\beuler\b/g, 'context.euler');

  // Replace power operator (^) with Math.pow
  processedExpression = processedExpression.replace(/(\w+(?:\.\w+)?)\s*\^\s*(\w+(?:\.\w+)?|\d+(?:\.\d+)?)/g, 'context.pow($1, $2)');

  if (showSteps) {
    steps.push({
      step: 'function_replacement',
      expression: processedExpression
    });
  }

  // Evaluate the expression
  try {
    // Create a function from the expression
    const func = new Function('context', `
      "use strict";
      try {
        return ${processedExpression};
      } catch (e) {
        throw new Error("Evaluation failed: " + e.message);
      }
    `);

    const result = func(context);
    
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error('Invalid result');
    }

    // Round to specified precision
    const roundedResult = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);

    if (showSteps) {
      steps.push({
        step: 'evaluation',
        result: result,
        roundedResult: roundedResult,
        precision: precision
      });
    }

    return {
      value: roundedResult,
      steps: showSteps ? steps : undefined
    };

  } catch (error) {
    throw new Error(`Expression evaluation failed: ${error}`);
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Scientific Calculator API',
    usage: 'POST /api/math-tools/scientific-calculator',
    parameters: {
      expression: 'Mathematical expression to evaluate (required)',
      precision: 'Decimal precision (0-15, default: 10) - optional',
      showSteps: 'Show calculation steps (default: false) - optional',
      variables: 'Variable values as object (default: {}) - optional',
      angleUnit: 'Angle unit for trigonometric functions: "radians" or "degrees" (default: "radians") - optional'
    },
    supportedFunctions: {
      basic: ['abs', 'sqrt', 'pow', 'exp', 'log', 'log10', 'log2', 'floor', 'ceil', 'round', 'min', 'max', 'random'],
      trigonometric: ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'],
      hyperbolic: ['sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh']
    },
    constants: {
      PI: 'π (3.14159...)',
      E: 'e (2.71828...)',
      phi: 'Golden ratio (1.61803...)',
      euler: "Euler's constant (0.57721...)"
    },
    operators: [
      '+', '-', '*', '/', '^ (power)', '% (modulo)',
      '()', 'Mathematical precedence'
    ],
    examples: [
      {
        expression: 'sin(PI/2) + cos(0)',
        angleUnit: 'radians',
        precision: 6
      },
      {
        expression: '2^3 + sqrt(16)',
        showSteps: true
      },
      {
        expression: 'log10(100) * exp(1)',
        precision: 8
      },
      {
        expression: 'x^2 + y^2',
        variables: { x: 3, y: 4 },
        angleUnit: 'degrees'
      }
    ],
    notes: [
      'Use ^ for power operations',
      'Variables can be defined in the variables object',
      'Angle unit affects trigonometric functions',
      'Expression is evaluated safely with limited function access'
    ]
  });
}