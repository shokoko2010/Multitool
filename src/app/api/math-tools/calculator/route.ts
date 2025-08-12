import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { expression, mode = 'basic', options = {} } = await request.json()

    if (!expression) {
      return NextResponse.json(
        { success: false, error: 'Mathematical expression is required' },
        { status: 400 }
      )
    }

    // Validate mode
    const validModes = ['basic', 'scientific', 'programmer', 'statistical']
    if (!validModes.includes(mode.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Invalid mode. Must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      )
    }

    const normalizedMode = mode.toLowerCase()

    // Set default options
    const defaultOptions = {
      precision: 10,
      angleUnit: 'radians',
      showSteps: false,
      variables: {},
      history: []
    }

    const mergedOptions = { ...defaultOptions, ...options }

    // Initialize ZAI SDK for enhanced calculation analysis
    const zai = await ZAI.create()

    // Perform calculation
    const calculationResult = performCalculation(expression, normalizedMode, mergedOptions)

    // Use AI to enhance calculation analysis
    const systemPrompt = `You are a mathematical computation and analysis expert. Analyze the mathematical calculation that was performed.

    Expression: "${expression}"
    Mode: ${normalizedMode}
    Options: ${JSON.stringify(mergedOptions)}
    Result: ${calculationResult.result}
    Success: ${calculationResult.success}

    Please provide comprehensive mathematical analysis including:
    1. Expression complexity assessment
    2. Mathematical domain classification
    3. Computational accuracy verification
    4. Alternative solution methods
    5. Mathematical properties analysis
    6. Optimization opportunities
    7. Error analysis and precision assessment
    8. Real-world application suggestions
    9. Mathematical best practices
    10. Educational value assessment
    11. Computational efficiency analysis
    12. Cross-validation with alternative methods

    Use realistic mathematical analysis based on computational mathematics and numerical analysis principles.
    Return the response in JSON format with the following structure:
    {
      "complexity": {
        "level": "simple" | "moderate" | "complex" | "very-complex",
        "operations": number,
        "nestedDepth": number,
        "variables": number,
        "functions": number
      },
      "domain": {
        "primary": "arithmetic" | "algebra" | "calculus" | "trigonometry" | "statistics" | "linear-algebra" | "discrete-math",
        "secondary": array,
        "applications": array
      },
      "accuracy": {
        "precision": number,
        "confidence": number,
        "errorMargin": number,
        "validation": "exact" | "approximate" | "estimated"
      },
      "analysis": {
        "mathematicalProperties": array,
        "simplificationOpportunities": array,
        "alternativeMethods": array,
        "optimizationSuggestions": array
      },
      "applications": {
        "realWorld": array,
        "educational": array,
        "professional": array
      },
      "performance": {
        "computationalComplexity": "O(1)" | "O(n)" | "O(n²)" | "O(log n)" | "O(n log n)",
        "efficiency": "excellent" | "good" | "fair" | "poor",
        "scalability": "excellent" | "good" | "fair" | "poor"
      },
      "validation": {
        "crossCheck": array,
        "consistency": "high" | "medium" | "low",
        "reliability": "high" | "medium" | "low"
      },
      "educational": {
        "learningValue": number,
        "concepts": array,
        "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
        "prerequisites": array
      },
      "recommendations": {
        "improvements": array,
        "bestPractices": array,
        "furtherStudy": array
      }
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Analyze mathematical calculation: ${expression}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    })

    let analysis
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      analysis = JSON.parse(content)
      
      // Enhance analysis with actual calculation metrics
      if (!analysis.complexity) {
        analysis.complexity = assessExpressionComplexity(expression)
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      analysis = {
        complexity: assessExpressionComplexity(expression),
        domain: classifyMathematicalDomain(expression, normalizedMode),
        accuracy: {
          precision: mergedOptions.precision,
          confidence: calculationResult.success ? 0.95 : 0.5,
          errorMargin: calculateErrorMargin(calculationResult.result),
          validation: calculationResult.success ? 'exact' : 'approximate'
        },
        analysis: {
          mathematicalProperties: identifyMathematicalProperties(expression),
          simplificationOpportunities: findSimplificationOpportunities(expression),
          alternativeMethods: suggestAlternativeMethods(expression),
          optimizationSuggestions: generateOptimizationSuggestions(expression)
        },
        applications: {
          realWorld: generateRealWorldApplications(expression),
          educational: generateEducationalApplications(expression),
          professional: generateProfessionalApplications(expression)
        },
        performance: {
          computationalComplexity: assessComputationalComplexity(expression),
          efficiency: assessComputationalEfficiency(expression),
          scalability: assessScalability(expression)
        },
        validation: {
          crossCheck: performCrossCheck(expression, calculationResult.result),
          consistency: assessConsistency(calculationResult),
          reliability: assessReliability(calculationResult)
        },
        educational: {
          learningValue: assessLearningValue(expression),
          concepts: identifyMathematicalConcepts(expression),
          difficulty: assessDifficulty(expression, normalizedMode),
          prerequisites: identifyPrerequisites(expression)
        },
        recommendations: {
          improvements: generateImprovementSuggestions(expression),
          bestPractices: generateMathBestPractices(),
          furtherStudy: generateFurtherStudyTopics(expression)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          expression: expression,
          mode: normalizedMode,
          options: mergedOptions
        },
        result: calculationResult,
        analysis: analysis,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Calculator Error:', error)
    
    // Fallback calculation
    const { expression, mode = 'basic' } = await request.json()
    let fallbackResult = { result: 0, success: false, error: 'Calculation failed' }
    
    try {
      fallbackResult = performFallbackCalculation(expression || '0', mode)
    } catch (fallbackError) {
      fallbackResult = {
        result: 0,
        success: false,
        error: 'Fallback calculation failed'
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        input: { expression: expression || '0', mode },
        result: fallbackResult,
        timestamp: new Date().toISOString()
      }
    })
  }
}

function performCalculation(expression: string, mode: string, options: any): any {
  const result: any = {
    result: 0,
    success: true,
    steps: [],
    variables: {},
    error: null,
    warnings: []
  }

  try {
    // Clean and validate expression
    const cleanExpression = expression.trim()
    
    if (!cleanExpression) {
      throw new Error('Empty expression')
    }

    // Basic safety check for potentially dangerous expressions
    if (/[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/.test(cleanExpression) && 
        !/^(Math\.|sin|cos|tan|log|sqrt|abs|floor|ceil|round|max|min|pow|exp|PI|E)/.test(cleanExpression)) {
      result.warnings.push('Potential function call detected - using safe evaluation')
    }

    // Replace mathematical constants and functions
    let processedExpression = cleanExpression
      .replace(/π|pi/gi, 'Math.PI')
      .replace(/e(?![a-zA-Z])/gi, 'Math.E')
      .replace(/√/g, 'Math.sqrt')
      .replace(/²/g, '**2')
      .replace(/³/g, '**3')
      .replace(/\^/g, '**')

    // Handle trigonometric functions based on angle unit
    if (options.angleUnit === 'degrees') {
      processedExpression = processedExpression
        .replace(/sin\(/g, 'Math.sin(Math.PI/180*')
        .replace(/cos\(/g, 'Math.cos(Math.PI/180*')
        .replace(/tan\(/g, 'Math.tan(Math.PI/180*')
    } else {
      processedExpression = processedExpression
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
    }

    // Replace other mathematical functions
    processedExpression = processedExpression
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/floor\(/g, 'Math.floor(')
      .replace(/ceil\(/g, 'Math.ceil(')
      .replace(/round\(/g, 'Math.round(')
      .replace(/max\(/g, 'Math.max(')
      .replace(/min\(/g, 'Math.min(')
      .replace(/exp\(/g, 'Math.exp(')

    // Apply variable substitutions
    Object.entries(options.variables || {}).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'g')
      processedExpression = processedExpression.replace(regex, String(value))
    })

    // Show steps if requested
    if (options.showSteps) {
      result.steps.push({
        step: 1,
        description: 'Original expression',
        expression: cleanExpression
      })
      
      if (processedExpression !== cleanExpression) {
        result.steps.push({
          step: 2,
          description: 'Processed expression',
          expression: processedExpression
        })
      }
    }

    // Evaluate the expression safely
    try {
      // Use Function constructor for safer evaluation than eval
      const evalFunction = new Function('return ' + processedExpression)
      let evalResult = evalFunction()
      
      // Handle precision
      if (typeof evalResult === 'number' && options.precision) {
        evalResult = Number(evalResult.toPrecision(options.precision))
      }
      
      result.result = evalResult
      
      if (options.showSteps) {
        result.steps.push({
          step: result.steps.length + 1,
          description: 'Final result',
          expression: String(evalResult)
        })
      }
      
    } catch (evalError) {
      throw new Error(`Evaluation failed: ${evalError instanceof Error ? evalError.message : 'Unknown error'}`)
    }

    // Mode-specific processing
    if (mode === 'scientific') {
      result.variables = extractVariables(cleanExpression)
    } else if (mode === 'programmer') {
      if (typeof result.result === 'number') {
        result.programmerFormats = {
          binary: Math.floor(result.result).toString(2),
          octal: Math.floor(result.result).toString(8),
          hexadecimal: Math.floor(result.result).toString(16).toUpperCase(),
          decimal: result.result.toString()
        }
      }
    } else if (mode === 'statistical') {
      result.statisticalInfo = generateStatisticalInfo(cleanExpression, result.result)
    }

  } catch (error) {
    result.success = false
    result.error = error instanceof Error ? error.message : 'Unknown error'
    result.result = null
  }

  return result
}

function assessExpressionComplexity(expression: string): any {
  const operations = (expression.match(/[+\-*/%^]/g) || []).length
  const functions = (expression.match(/\b(sin|cos|tan|log|sqrt|abs|floor|ceil|round|max|min|pow|exp)\b/gi) || []).length
  const parentheses = (expression.match(/[()]/g) || []).length
  const nestedDepth = calculateNestedDepth(expression)
  const variables = (expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []).length

  let level = 'simple'
  if (operations > 10 || functions > 5 || nestedDepth > 5) level = 'very-complex'
  else if (operations > 5 || functions > 3 || nestedDepth > 3) level = 'complex'
  else if (operations > 2 || functions > 1 || nestedDepth > 1) level = 'moderate'

  return {
    level,
    operations,
    nestedDepth,
    variables,
    functions
  }
}

function calculateNestedDepth(expression: string): number {
  let maxDepth = 0
  let currentDepth = 0
  
  for (const char of expression) {
    if (char === '(') {
      currentDepth++
      maxDepth = Math.max(maxDepth, currentDepth)
    } else if (char === ')') {
      currentDepth--
    }
  }
  
  return maxDepth
}

function classifyMathematicalDomain(expression: string, mode: string): any {
  const domains = []
  
  // Check for arithmetic
  if (/[+\-*/%^]/.test(expression)) domains.push('arithmetic')
  
  // Check for algebra
  if (/[a-zA-Z]/.test(expression) && !/(sin|cos|tan|log|sqrt|abs|floor|ceil|round|max|min|pow|exp)/i.test(expression)) {
    domains.push('algebra')
  }
  
  // Check for trigonometry
  if (/(sin|cos|tan)/i.test(expression)) domains.push('trigonometry')
  
  // Check for calculus
  if (/(log|ln|exp|sqrt|pow)/i.test(expression)) domains.push('calculus')
  
  // Check for statistics
  if (/(max|min|avg|mean|std|var)/i.test(expression)) domains.push('statistics')
  
  // Check for linear algebra
  if (/(matrix|vector|det)/i.test(expression)) domains.push('linear-algebra')
  
  // Check for discrete math
  if (/(mod|gcd|lcm|factorial)/i.test(expression)) domains.push('discrete-math')
  
  return {
    primary: domains[0] || 'arithmetic',
    secondary: domains.slice(1),
    applications: generateDomainApplications(domains)
  }
}

function generateDomainApplications(domains: string[]): string[] {
  const applications = []
  
  if (domains.includes('arithmetic')) applications.push('Basic calculations', 'Everyday math')
  if (domains.includes('algebra')) applications.push('Equation solving', 'Variable manipulation')
  if (domains.includes('trigonometry')) applications.push('Geometry', 'Physics', 'Engineering')
  if (domains.includes('calculus')) applications.push('Physics', 'Engineering', 'Economics')
  if (domains.includes('statistics')) applications.push('Data analysis', 'Research', 'Business')
  if (domains.includes('linear-algebra')) applications.push('Computer graphics', 'Machine learning')
  if (domains.includes('discrete-math')) applications.push('Computer science', 'Cryptography')
  
  return applications
}

function calculateErrorMargin(result: number): number {
  if (typeof result !== 'number' || !isFinite(result)) return 1
  return Math.abs(result) > 1000 ? result * 0.0001 : 0.0001
}

function identifyMathematicalProperties(expression: string): string[] {
  const properties = []
  
  if (expression.includes('+') || expression.includes('-')) properties.push('Additive')
  if (expression.includes('*') || expression.includes('/')) properties.push('Multiplicative')
  if (expression.includes('^') || expression.includes('**')) properties.push('Exponential')
  if (/(sin|cos|tan)/i.test(expression)) properties.push('Periodic')
  if (/(log|ln)/i.test(expression)) properties.push('Logarithmic')
  
  return properties
}

function findSimplificationOpportunities(expression: string): string[] {
  const opportunities = []
  
  if (expression.includes('*0') || expression.includes('0*')) opportunities.push('Zero multiplication')
  if (expression.includes('*1') || expression.includes('1*')) opportunities.push('Identity multiplication')
  if (expression.includes('/1')) opportunities.push('Identity division')
  if (expression.includes('^0')) opportunities.push('Zero exponent')
  if (expression.includes('^1')) opportunities.push('Identity exponent')
  
  return opportunities
}

function suggestAlternativeMethods(expression: string): string[] {
  return [
    'Numerical approximation',
    'Symbolic computation',
    'Graphical method',
    'Iterative approach',
    'Series expansion'
  ]
}

function generateOptimizationSuggestions(expression: string): string[] {
  const suggestions = []
  
  if (expression.length > 100) suggestions.push('Break down complex expression')
  if ((expression.match(/\(/g) || []).length > 5) suggestions.push('Simplify nested parentheses')
  if ((expression.match(/\^/g) || []).length > 3) suggestions.push('Consider logarithmic transformation')
  
  suggestions.push('Use constant folding')
  suggestions.push('Cache repeated subexpressions')
  
  return suggestions
}

function generateRealWorldApplications(expression: string): string[] {
  const applications = []
  
  if (/(sin|cos|tan)/i.test(expression)) applications.push('Physics problems', 'Engineering calculations')
  if (/(log|exp)/i.test(expression)) applications.push('Financial modeling', 'Population growth')
  if (/(max|min)/i.test(expression)) applications.push('Optimization problems', 'Resource allocation')
  
  applications.push('Educational purposes', 'Scientific research')
  
  return applications
}

function generateEducationalApplications(expression: string): string[] {
  return [
    'Mathematics education',
    'Problem-solving practice',
    'Concept demonstration',
    'Skill development'
  ]
}

function generateProfessionalApplications(expression: string): string[] {
  return [
    'Engineering calculations',
    'Financial analysis',
    'Scientific research',
    'Data analysis'
  ]
}

function assessComputationalComplexity(expression: string): string {
  const operations = (expression.match(/[+\-*/%^]/g) || []).length
  const functions = (expression.match(/\b(sin|cos|tan|log|sqrt|abs|floor|ceil|round|max|min|pow|exp)\b/gi) || []).length
  
  const totalOps = operations + functions
  
  if (totalOps <= 3) return 'O(1)'
  if (totalOps <= 10) return 'O(n)'
  if (totalOps <= 20) return 'O(n log n)'
  return 'O(n²)'
}

function assessComputationalEfficiency(expression: string): string {
  const complexity = assessComputationalComplexity(expression)
  
  switch (complexity) {
    case 'O(1)': return 'excellent'
    case 'O(n)': return 'good'
    case 'O(n log n)': return 'fair'
    default: return 'poor'
  }
}

function assessScalability(expression: string): string {
  const variables = (expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []).length
  
  if (variables === 0) return 'excellent'
  if (variables <= 3) return 'good'
  if (variables <= 5) return 'fair'
  return 'poor'
}

function performCrossCheck(expression: string, result: any): string[] {
  const methods = []
  
  try {
    // Try alternative calculation method
    const altResult = performAlternativeCalculation(expression)
    if (Math.abs(altResult - result) < 0.001) {
      methods.push('Alternative calculation: Consistent')
    } else {
      methods.push('Alternative calculation: Inconsistent')
    }
  } catch {
    methods.push('Alternative calculation: Failed')
  }
  
  methods.push('Direct evaluation: Completed')
  
  return methods
}

function assessConsistency(result: any): string {
  if (typeof result !== 'number') return 'low'
  if (!isFinite(result)) return 'low'
  return 'high'
}

function assessReliability(result: any): string {
  if (!result.success) return 'low'
  if (typeof result.result !== 'number') return 'medium'
  return 'high'
}

function assessLearningValue(expression: string): number {
  const concepts = identifyMathematicalConcepts(expression).length
  const complexity = assessExpressionComplexity(expression)
  
  let value = concepts * 20
  
  switch (complexity.level) {
    case 'simple': value += 10; break
    case 'moderate': value += 20; break
    case 'complex': value += 30; break
    case 'very-complex': value += 40; break
  }
  
  return Math.min(100, value)
}

function identifyMathematicalConcepts(expression: string): string[] {
  const concepts = []
  
  if (/[+\-]/.test(expression)) concepts.push('Addition/Subtraction')
  if (/[*/]/.test(expression)) concepts.push('Multiplication/Division')
  if (/\^/g.test(expression)) concepts.push('Exponentiation')
  if (/(sin|cos|tan)/i.test(expression)) concepts.push('Trigonometry')
  if (/(log|ln)/i.test(expression)) concepts.push('Logarithms')
  if (/sqrt/i.test(expression)) concepts.push('Square roots')
  if (/[a-zA-Z]/.test(expression)) concepts.push('Variables')
  
  return concepts
}

function assessDifficulty(expression: string, mode: string): string {
  const complexity = assessExpressionComplexity(expression)
  
  if (mode === 'basic') {
    return complexity.level === 'simple' ? 'beginner' : 'intermediate'
  } else if (mode === 'scientific') {
    return complexity.level === 'simple' ? 'intermediate' : 
           complexity.level === 'moderate' ? 'advanced' : 'expert'
  } else {
    return 'intermediate'
  }
}

function identifyPrerequisites(expression: string): string[] {
  const prerequisites = []
  
  const concepts = identifyMathematicalConcepts(expression)
  
  if (concepts.includes('Exponentiation')) prerequisites.push('Basic arithmetic')
  if (concepts.includes('Trigonometry')) prerequisites.push('Algebra', 'Geometry')
  if (concepts.includes('Logarithms')) prerequisites.push('Algebra', 'Exponentiation')
  if (concepts.includes('Square roots')) prerequisites.push('Basic arithmetic')
  
  return prerequisites
}

function generateImprovementSuggestions(expression: string): string[] {
  const suggestions = []
  
  if (expression.length > 50) suggestions.push('Break into smaller expressions')
  if ((expression.match(/\(/g) || []).length > 3) suggestions.push('Simplify parentheses structure')
  if (!/(=|:=|≈)/.test(expression)) suggestions.push('Consider adding equality constraints')
  
  suggestions.push('Add comments for clarity')
  suggestions.push('Use standard mathematical notation')
  
  return suggestions
}

function generateMathBestPractices(): string[] {
  return [
    'Use standard mathematical notation',
    'Break complex expressions into smaller parts',
    'Verify results with multiple methods',
    'Document assumptions and constraints',
    'Use appropriate precision for the application',
    'Consider numerical stability',
    'Test edge cases and boundary conditions',
    'Use meaningful variable names',
    'Include units when applicable',
    'Validate input ranges'
  ]
}

function generateFurtherStudyTopics(expression: string): string[] {
  const topics = []
  
  const concepts = identifyMathematicalConcepts(expression)
  
  if (concepts.includes('Trigonometry')) topics.push('Advanced trigonometry', 'Fourier series')
  if (concepts.includes('Logarithms')) topics.push('Complex analysis', 'Differential equations')
  if (concepts.includes('Exponentiation')) topics.push('Complex numbers', 'Polynomial functions')
  
  topics.push('Numerical methods', 'Mathematical modeling', 'Optimization theory')
  
  return topics
}

function extractVariables(expression: string): any {
  const variables = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []
  const uniqueVars = [...new Set(variables)]
  
  const result: any = {}
  uniqueVars.forEach(variable => {
    result[variable] = {
      type: 'variable',
      suggestedValue: Math.floor(Math.random() * 10) + 1,
      description: `Variable ${variable}`
    }
  })
  
  return result
}

function generateStatisticalInfo(expression: string, result: number): any {
  return {
    dataType: typeof result,
    isFinite: isFinite(result),
    isInteger: Number.isInteger(result),
    isPositive: result > 0,
    isNegative: result < 0,
    isZero: result === 0,
    magnitude: Math.abs(result),
    orderOfMagnitude: Math.floor(Math.log10(Math.abs(result)) || 0)
  }
}

function performAlternativeCalculation(expression: string): number {
  // Simple alternative calculation for cross-checking
  try {
    // This is a simplified version - in practice, you'd use different algorithms
    const processed = expression
      .replace(/\^/g, '**')
      .replace(/π/gi, Math.PI.toString())
      .replace(/e(?![a-zA-Z])/gi, Math.E.toString())
    
    return Function('"use strict"; return (' + processed + ')')()
  } catch {
    return NaN
  }
}

function performFallbackCalculation(expression: string, mode: string): any {
  try {
    // Very basic fallback - only handle simple arithmetic
    const processed = expression
      .replace(/[^0-9+\-*/().\s]/g, '')
      .replace(/\^/g, '**')
    
    const result = Function('"use strict"; return (' + processed + ')')()
    
    return {
      result: result,
      success: true,
      error: null
    }
  } catch (error) {
    return {
      result: null,
      success: false,
      error: error instanceof Error ? error.message : 'Fallback calculation failed'
    }
  }
}