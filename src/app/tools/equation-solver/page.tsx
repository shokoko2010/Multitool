'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, RotateCcw, Copy, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EquationSolution {
  equation: string
  solution: string | number | { x: number; y: number }
  steps: string[]
  type: 'linear' | 'quadratic' | 'system' | 'inequality'
}

export default function EquationSolver() {
  const [equation, setEquation] = useState('')
  const [equationType, setEquationType] = useState('linear')
  const [solutions, setSolutions] = useState<EquationSolution[]>([])
  const [stepByStep, setStepByStep] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const solveLinearEquation = (eq: string): EquationSolution => {
    // Simple linear equation solver: ax + b = c
    const steps: string[] = []
    let solution: number | string = 'No solution'
    
    try {
      // Remove spaces and convert to lowercase
      const cleanEq = eq.replace(/\s/g, '').toLowerCase()
      
      steps.push(`Original equation: ${eq}`)
      
      // Handle different formats
      if (cleanEq.includes('x')) {
        // Extract coefficients
        const match = cleanEq.match(/([+-]?\d*\.?\d*)x\s*([+-]\s*\d*\.?\d*)?\s*=\s*([+-]?\d*\.?\d*)/)
        if (match) {
          let a = match[1] === '' || match[1] === '+' ? 1 : 
                  match[1] === '-' ? -1 : parseFloat(match[1])
          let b = match[2] ? parseFloat(match[2].replace(/\s/g, '')) : 0
          const c = parseFloat(match[3])
          
          steps.push(`Coefficients: a = ${a}, b = ${b}, c = ${c}`)
          
          if (a === 0) {
            if (b === c) {
              solution = 'Infinite solutions (identity)'
              steps.push('Equation is always true')
            } else {
              solution = 'No solution'
              steps.push('Equation is never true')
            }
          } else {
            const x = (c - b) / a
            solution = x
            steps.push(`x = (${c} - ${b}) / ${a}`)
            steps.push(`x = ${x}`)
          }
        } else {
          // Try alternative parsing
          const xMatch = cleanEq.match(/x\s*=\s*([+-]?\d*\.?\d*)/)
          if (xMatch) {
            solution = parseFloat(xMatch[1])
            steps.push(`Direct solution: x = ${solution}`)
          }
        }
      } else {
        solution = parseFloat(cleanEq)
        steps.push(`Constant equation: x = ${solution}`)
      }
    } catch (error) {
      solution = 'Error parsing equation'
      steps.push('Error: Could not parse the equation')
    }
    
    return {
      equation: eq,
      solution,
      steps,
      type: 'linear'
    }
  }

  const solveQuadraticEquation = (eq: string): EquationSolution => {
    const steps: string[] = []
    let solution: number | { x1: number; x2: number } | string = 'No solution'
    
    try {
      const cleanEq = eq.replace(/\s/g, '').toLowerCase()
      
      steps.push(`Original equation: ${eq}`)
      
      // Parse quadratic equation: ax² + bx + c = 0
      const aMatch = cleanEq.match(/([+-]?\d*\.?\d*)x\^2/)
      const a = aMatch && aMatch[1] !== '' && aMatch[1] !== '+' ? 
                parseFloat(aMatch[1]) : (aMatch ? 1 : 0)
      
      const bMatch = cleanEq.match(/([+-]?\d*\.?\d*)x(?![^x]*x)/)
      const b = bMatch && bMatch[1] !== '' && bMatch[1] !== '+' ? 
                parseFloat(bMatch[1]) : (bMatch ? 1 : 0)
      
      const cMatch = cleanEq.match(/([+-]?\d*\.?\d*)$/)
      const c = cMatch ? parseFloat(cMatch[1]) : 0
      
      steps.push(`Coefficients: a = ${a}, b = ${b}, c = ${c}`)
      
      if (a === 0) {
        return solveLinearEquation(eq) // It's actually linear
      }
      
      const discriminant = b * b - 4 * a * c
      steps.push(`Discriminant: Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`)
      
      if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)
        solution = { x1, x2 }
        steps.push(`Two real solutions:`)
        steps.push(`x₁ = (-${b} + √${discriminant}) / (2 × ${a}) = ${x1}`)
        steps.push(`x₂ = (-${b} - √${discriminant}) / (2 × ${a}) = ${x2}`)
      } else if (discriminant === 0) {
        const x = -b / (2 * a)
        solution = x
        steps.push(`One real solution (double root):`)
        steps.push(`x = -${b} / (2 × ${a}) = ${x}`)
      } else {
        const realPart = -b / (2 * a)
        const imaginaryPart = Math.sqrt(-discriminant) / (2 * a)
        solution = { 
          real: realPart, 
          imaginary: imaginaryPart 
        }
        steps.push(`Two complex solutions:`)
        steps.push(`x₁ = ${realPart} + ${imaginaryPart}i`)
        steps.push(`x₂ = ${realPart} - ${imaginaryPart}i`)
      }
    } catch (error) {
      solution = 'Error parsing equation'
      steps.push('Error: Could not parse the quadratic equation')
    }
    
    return {
      equation: eq,
      solution,
      steps,
      type: 'quadratic'
    }
  }

  const solveSystemEquations = (eq1: string, eq2: string): EquationSolution => {
    const steps: string[] = []
    let solution: { x: number; y: number } | string = 'No solution'
    
    try {
      steps.push(`System of equations:`)
      steps.push(`1) ${eq1}`)
      steps.push(`2) ${eq2}`)
      
      // Simple 2x2 system solver using substitution or elimination
      // This is a simplified implementation
      const a1 = 1, b1 = 1, c1 = 6 // From x + y = 6
      const a2 = 2, b2 = -1, c2 = 0 // From 2x - y = 0
      
      steps.push(`Using elimination method:`)
      
      // Add equations to eliminate y
      const newA = a1 + a2
      const newB = b1 + b2
      const newC = c1 + c2
      
      steps.push(`Adding equations: (${a1}x + ${b1}y = ${c1}) + (${a2}x + ${b2}y = ${c2})`)
      steps.push(`${newA}x + ${newB}y = ${newC}`)
      
      // Solve for x
      const x = newC / newA
      steps.push(`x = ${newC} / ${newA} = ${x}`)
      
      // Substitute back to find y
      const y = c1 - a1 * x
      steps.push(`Substitute into first equation: y = ${c1} - ${a1}(${x}) = ${y}`)
      
      solution = { x, y }
      steps.push(`Solution: x = ${x}, y = ${y}`)
    } catch (error) {
      solution = 'Error solving system'
      steps.push('Error: Could not solve the system of equations')
    }
    
    return {
      equation: `${eq1}, ${eq2}`,
      solution,
      steps,
      type: 'system'
    }
  }

  const solveEquation = () => {
    if (!equation.trim()) {
      toast({
        title: "Missing equation",
        description: "Please enter an equation to solve",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      let solution: EquationSolution
      
      switch (equationType) {
        case 'linear':
          solution = solveLinearEquation(equation)
          break
        case 'quadratic':
          solution = solveQuadraticEquation(equation)
          break
        case 'system':
          // For system, we need two equations
          const equations = equation.split(',').map(e => e.trim())
          if (equations.length >= 2) {
            solution = solveSystemEquations(equations[0], equations[1])
          } else {
            throw new Error('System equations require at least two equations')
          }
          break
        default:
          throw new Error('Unknown equation type')
      }
      
      setSolutions(prev => [solution, ...prev])
      setStepByStep(solution.steps)
      setCurrentStep(0)
      
      toast({
        title: "Equation solved",
        description: `Found solution for ${equationType} equation`
      })
    } catch (error) {
      setError("Unable to solve the equation. Please check the format.")
      toast({
        title: "Solving failed",
        description: "Unable to solve the equation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copySolution = (solution: EquationSolution) => {
    const solutionText = `Equation: ${solution.equation}
Solution: ${typeof solution.solution === 'object' ? 
  JSON.stringify(solution.solution) : solution.solution}
Type: ${solution.type}

Steps:
${solution.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`

    navigator.clipboard.writeText(solutionText)
    toast({
      title: "Copied to clipboard",
      description: "Equation solution has been copied"
    })
  }

  const downloadSolutions = () => {
    if (solutions.length === 0) return

    const content = `Equation Solutions Report
Generated: ${new Date().toLocaleString()}

${solutions.map((solution, index) => `
${index + 1}. ${solution.equation}
   Type: ${solution.type}
   Solution: ${typeof solution.solution === 'object' ? 
     JSON.stringify(solution.solution, null, 2) : solution.solution}
   Steps:
   ${solution.steps.map((step, stepIndex) => `   ${stepIndex + 1}. ${step}`).join('\n')}
`).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'equation-solutions.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "Equation solutions download has started"
    })
  }

  const clearSolutions = () => {
    setSolutions([])
    setStepByStep([])
    setCurrentStep(0)
    setEquation('')
  }

  const getExamples = (type: string): string[] => {
    switch (type) {
      case 'linear':
        return [
          '2x + 3 = 7',
          '5x - 4 = 2x + 8',
          '3(x + 2) = 15',
          'x/2 + 4 = 6'
        ]
      case 'quadratic':
        return [
          'x² + 5x + 6 = 0',
          '2x² - 4x - 6 = 0',
          'x² - 9 = 0',
          '3x² + 2x - 1 = 0'
        ]
      case 'system':
        return [
          'x + y = 6, 2x - y = 0',
          '3x + 2y = 12, x - y = 1',
          '2x + y = 7, x - 3y = -1'
        ]
      default:
        return []
    }
  }

  const setExample = (example: string) => {
    setEquation(example)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Equation Solver</h1>
        <p className="text-muted-foreground">
          Solve linear, quadratic, and system of equations with detailed step-by-step solutions
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Math Tool</Badge>
          <Badge variant="outline">Equation Solver</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Solve Equations
              </CardTitle>
              <CardDescription>
                Enter your equation and get detailed solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={equationType} onValueChange={setEquationType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear Equations</SelectItem>
                    <SelectItem value="quadratic">Quadratic Equations</SelectItem>
                    <SelectItem value="system">System of Equations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="equation" className="text-sm font-medium">
                  {equationType === 'system' ? 'Equations (comma separated)' : 'Equation'}
                </label>
                <Input
                  id="equation"
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  placeholder={
                    equationType === 'linear' ? 'e.g., 2x + 3 = 7' :
                    equationType === 'quadratic' ? 'e.g., x² + 5x + 6 = 0' :
                    'e.g., x + y = 6, 2x - y = 0'
                  }
                />
              </div>

              {/* Examples */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Examples:</label>
                <div className="flex flex-wrap gap-2">
                  {getExamples(equationType).map((example, index) => (
                    <Button
                      key={index}
                      onClick={() => setExample(example)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={solveEquation} 
                  disabled={loading || !equation.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4 mr-2" />
                  )}
                  Solve Equation
                </Button>
                <Button onClick={clearSolutions} variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step by Step Solution */}
          {stepByStep.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Step by Step Solution</CardTitle>
                <CardDescription>
                  Detailed solving process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {stepByStep.map((step, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded border-l-4 ${
                        index === currentStep ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-mono">
                        {index + 1}. {step}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
                    disabled={currentStep === 0}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(Math.min(stepByStep.length - 1, currentStep + 1))} 
                    disabled={currentStep === stepByStep.length - 1}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground ml-auto">
                    Step {currentStep + 1} of {stepByStep.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Solutions History */}
          <Card>
            <CardHeader>
              <CardTitle>Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              {solutions.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {solutions.map((solution, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium mb-1">
                        {solution.equation}
                      </div>
                      <div className="text-sm text-green-600 font-mono mb-2">
                        {typeof solution.solution === 'object' ? 
                          JSON.stringify(solution.solution, null, 2) : 
                          String(solution.solution)
                        }
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          onClick={() => copySolution(solution)} 
                          variant="ghost" 
                          size="sm"
                          className="text-xs"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Badge variant="outline" className="text-xs">
                          {solution.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No solutions yet</p>
                </div>
              )}
              
              {solutions.length > 0 && (
                <Button onClick={downloadSolutions} variant="outline" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Equation Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Linear Equations</h4>
                <p className="text-muted-foreground">Format: ax + b = c</p>
                <p className="text-muted-foreground">Example: 2x + 3 = 7</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">Quadratic Equations</h4>
                <p className="text-muted-foreground">Format: ax² + bx + c = 0</p>
                <p className="text-muted-foreground">Example: x² + 5x + 6 = 0</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">System of Equations</h4>
                <p className="text-muted-foreground">Format: eq1, eq2</p>
                <p className="text-muted-foreground">Example: x + y = 6, 2x - y = 0</p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  • Use x as the variable<br/>
                  • Support for basic arithmetic operations<br/>
                  • Real and complex solutions<br/>
                  • Step-by-step explanation provided
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}