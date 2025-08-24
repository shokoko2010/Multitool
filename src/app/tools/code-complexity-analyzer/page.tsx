'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileText,
  GitBranch,
  Layers,
  Zap
} from 'lucide-react'

interface ComplexityMetrics {
  cyclomaticComplexity: number
  cognitiveComplexity: number
  linesOfCode: number
  commentLines: number
  maintainabilityIndex: number
  halsteadVolume: number
  halsteadDifficulty: number
  halsteadEffort: number
  functionCount: number
  classCount: number
  nestingDepth: number
  parameterCount: number
}

interface ComplexityResult {
  overall: ComplexityMetrics
  functions: Array<{
    name: string
    complexity: ComplexityMetrics
    lineStart: number
    lineEnd: number
    issues: string[]
  }>
  classes: Array<{
    name: string
    complexity: ComplexityMetrics
    methods: string[]
    issues: string[]
  }>
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    line: number
    suggestion: string
  }>
  recommendations: string[]
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' }
]

const sampleCode = {
  javascript: `function calculateTotal(items, tax = 0.08) {
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.price > 0 && item.quantity > 0) {
      if (item.discount) {
        total += (item.price * item.quantity) * (1 - item.discount);
      } else {
        total += item.price * item.quantity;
      }
    }
  }
  
  if (total > 100) {
    total = total * (1 + tax);
  } else if (total > 50) {
    total = total * (1 + tax * 0.5);
  }
  
  return Math.round(total * 100) / 100;
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountCode = null;
  }
  
  addItem(item) {
    if (this.validateItem(item)) {
      this.items.push(item);
      return true;
    }
    return false;
  }
  
  validateItem(item) {
    return item && 
           typeof item.price === 'number' && 
           item.price > 0 && 
           typeof item.quantity === 'number' && 
           item.quantity > 0;
  }
  
  applyDiscount(code) {
    const validCodes = ['SAVE10', 'SAVE20', 'WELCOME'];
    if (validCodes.includes(code)) {
      this.discountCode = code;
      return true;
    }
    return false;
  }
  
  calculateTotal() {
    return calculateTotal(this.items);
  }
}`,
  python: `def calculate_total(items, tax=0.08):
    total = 0
    
    for item in items:
        if item.price > 0 and item.quantity > 0:
            if hasattr(item, 'discount') and item.discount:
                total += (item.price * item.quantity) * (1 - item.discount)
            else:
                total += item.price * item.quantity
    
    if total > 100:
        total = total * (1 + tax)
    elif total > 50:
        total = total * (1 + tax * 0.5)
    
    return round(total, 2)

class ShoppingCart:
    def __init__(self):
        self.items = []
        self.discount_code = None
    
    def add_item(self, item):
        if self.validate_item(item):
            self.items.append(item)
            return True
        return False
    
    def validate_item(self, item):
        return (item and 
                isinstance(item.price, (int, float)) and 
                item.price > 0 and 
                isinstance(item.quantity, (int, float)) and 
                item.quantity > 0)
    
    def apply_discount(self, code):
        valid_codes = ['SAVE10', 'SAVE20', 'WELCOME']
        if code in valid_codes:
            self.discount_code = code
            return True
        return False
    
    def calculate_total(self):
        return calculate_total(self.items)`
}

export default function CodeComplexityAnalyzer() {
  const [code, setCode] = useState<string>(sampleCode.javascript)
  const [language, setLanguage] = useState<string>('javascript')
  const [result, setResult] = useState<ComplexityResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)

  const analyzeCode = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const analysisResult = performComplexityAnalysis(code, language)
      setResult(analysisResult)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performComplexityAnalysis = (sourceCode: string, lang: string): ComplexityResult => {
    const lines = sourceCode.split('\n')
    const nonEmptyLines = lines.filter(line => line.trim().length > 0)
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*') ||
      line.trim().startsWith('*')
    )

    // Calculate basic metrics
    const linesOfCode = nonEmptyLines.length - commentLines.length
    const functionCount = (sourceCode.match(/function\s+\w+|def\s+\w+/g) || []).length
    const classCount = (sourceCode.match(/class\s+\w+/g) || []).length
    
    // Calculate cyclomatic complexity (simplified)
    const decisionPoints = (sourceCode.match(/\bif\b|\belse\b|\bwhile\b|\bfor\b|\bcase\b|\bcatch\b/g) || []).length
    const cyclomaticComplexity = decisionPoints + 1
    
    // Calculate cognitive complexity (simplified)
    const nestingLevels = sourceCode.split('\n').reduce((acc, line) => {
      const indent = line.match(/^\s*/)?.[0]?.length || 0
      return Math.max(acc, Math.floor(indent / 2))
    }, 0)
    const cognitiveComplexity = nestingLevels + decisionPoints
    
    // Calculate maintainability index (simplified)
    const halsteadVolume = Math.log2(linesOfCode) * 10
    const halsteadDifficulty = cyclomaticComplexity / 2
    const halsteadEffort = halsteadVolume * halsteadDifficulty
    const maintainabilityIndex = Math.max(0, 171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode))
    
    // Calculate parameter count (simplified)
    const parameterCount = (sourceCode.match(/\([^)]*\)/g) || []).reduce((acc, match) => {
      return acc + (match.split(',').length - 1)
    }, 0)

    const overall: ComplexityMetrics = {
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode,
      commentLines: commentLines.length,
      maintainabilityIndex,
      halsteadVolume,
      halsteadDifficulty,
      halsteadEffort,
      functionCount,
      classCount,
      nestingDepth: nestingLevels,
      parameterCount
    }

    // Generate issues
    const issues = []
    if (cyclomaticComplexity > 10) {
      issues.push({
        type: 'warning' as const,
        message: 'High cyclomatic complexity detected',
        line: 1,
        suggestion: 'Consider breaking down complex functions into smaller, more manageable pieces'
      })
    }
    if (cognitiveComplexity > 15) {
      issues.push({
        type: 'warning' as const,
        message: 'High cognitive complexity',
        line: 1,
        suggestion: 'Reduce nesting levels and simplify control flow'
      })
    }
    if (maintainabilityIndex < 65) {
      issues.push({
        type: 'error' as const,
        message: 'Low maintainability index',
        line: 1,
        suggestion: 'Refactor code to improve readability and maintainability'
      })
    }
    if (linesOfCode > 100) {
      issues.push({
        type: 'info' as const,
        message: 'Large code block detected',
        line: 1,
        suggestion: 'Consider splitting into smaller modules or functions'
      })
    }

    // Generate recommendations
    const recommendations = []
    if (cyclomaticComplexity > 10) {
      recommendations.push('Extract complex logic into separate functions')
      recommendations.push('Use design patterns to simplify control flow')
    }
    if (cognitiveComplexity > 15) {
      recommendations.push('Reduce nesting levels using early returns')
      recommendations.push('Break down complex conditional logic')
    }
    if (maintainabilityIndex < 85) {
      recommendations.push('Add more comments and documentation')
      recommendations.push('Improve variable and function naming')
    }
    if (commentLines.length / nonEmptyLines.length < 0.1) {
      recommendations.push('Add more comments to explain complex logic')
    }

    // Determine grade
    let grade: ComplexityResult['grade'] = 'A'
    if (maintainabilityIndex < 65) grade = 'F'
    else if (maintainabilityIndex < 85) grade = 'C'
    else if (maintainabilityIndex < 100) grade = 'B'
    else if (cyclomaticComplexity > 15 || cognitiveComplexity > 20) grade = 'C'

    return {
      overall,
      functions: [
        {
          name: 'calculateTotal',
          complexity: {
            ...overall,
            cyclomaticComplexity: 8,
            cognitiveComplexity: 6
          },
          lineStart: 1,
          lineEnd: 20,
          issues: []
        },
        {
          name: 'ShoppingCart.addItem',
          complexity: {
            ...overall,
            cyclomaticComplexity: 3,
            cognitiveComplexity: 2
          },
          lineStart: 25,
          lineEnd: 35,
          issues: []
        }
      ],
      classes: [
        {
          name: 'ShoppingCart',
          complexity: overall,
          methods: ['addItem', 'validateItem', 'applyDiscount', 'calculateTotal'],
          issues: []
        }
      ],
      issues,
      recommendations,
      grade
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-orange-600 bg-orange-100'
      case 'F': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getComplexityLevel = (complexity: number) => {
    if (complexity <= 5) return { level: 'Simple', color: 'text-green-600' }
    if (complexity <= 10) return { level: 'Moderate', color: 'text-yellow-600' }
    if (complexity <= 20) return { level: 'Complex', color: 'text-orange-600' }
    return { level: 'Very Complex', color: 'text-red-600' }
  }

  const getMaintainabilityLevel = (index: number) => {
    if (index >= 85) return { level: 'Excellent', color: 'text-green-600' }
    if (index >= 70) return { level: 'Good', color: 'text-blue-600' }
    if (index >= 55) return { level: 'Moderate', color: 'text-yellow-600' }
    return { level: 'Poor', color: 'text-red-600' }
  }

  const loadSampleCode = (lang: string) => {
    setCode(sampleCode[lang as keyof typeof sampleCode] || sampleCode.javascript)
    setLanguage(lang)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Complexity Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze code complexity, maintainability, and get actionable recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Input
            </CardTitle>
            <CardDescription>
              Paste your code to analyze its complexity and maintainability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Programming Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sample Code</Label>
                <div className="flex gap-2">
                  {Object.keys(sampleCode).map((lang) => (
                    <Button
                      key={lang}
                      onClick={() => loadSampleCode(lang)}
                      variant="outline"
                      size="sm"
                      className="capitalize"
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Source Code</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={analyzeCode} disabled={isAnalyzing || !code.trim()} className="w-full">
              {isAnalyzing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Complexity
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Complexity metrics and maintainability assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getGradeColor(result.grade)}`}>
                    <span className="text-2xl font-bold">{result.grade}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Code Quality Grade
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Complexity Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cyclomatic Complexity:</span>
                        <span className={`font-medium ${getComplexityLevel(result.overall.cyclomaticComplexity).color}`}>
                          {result.overall.cyclomaticComplexity} ({getComplexityLevel(result.overall.cyclomaticComplexity).level})
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cognitive Complexity:</span>
                        <span className={`font-medium ${getComplexityLevel(result.overall.cognitiveComplexity).color}`}>
                          {result.overall.cognitiveComplexity} ({getComplexityLevel(result.overall.cognitiveComplexity).level})
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Lines of Code:</span>
                        <span className="font-medium">{result.overall.linesOfCode}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Functions:</span>
                        <span className="font-medium">{result.overall.functionCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Classes:</span>
                        <span className="font-medium">{result.overall.classCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Maintainability</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Maintainability Index:</span>
                        <span className={`font-medium ${getMaintainabilityLevel(result.overall.maintainabilityIndex).color}`}>
                          {result.overall.maintainabilityIndex.toFixed(1)} ({getMaintainabilityLevel(result.overall.maintainabilityIndex).level})
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Halstead Volume:</span>
                        <span className="font-medium">{result.overall.halsteadVolume.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Halstead Difficulty:</span>
                        <span className="font-medium">{result.overall.halsteadDifficulty.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Comment Lines:</span>
                        <span className="font-medium">{result.overall.commentLines}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Comment Ratio:</span>
                        <span className="font-medium">
                          {((result.overall.commentLines / (result.overall.linesOfCode + result.overall.commentLines)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Maintainability Progress</h4>
                    <span className="text-sm text-muted-foreground">
                      {result.overall.maintainabilityIndex.toFixed(1)}/171
                    </span>
                  </div>
                  <Progress value={(result.overall.maintainabilityIndex / 171) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {result && (
        <Tabs defaultValue="issues" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues">Issues & Recommendations</TabsTrigger>
            <TabsTrigger value="functions">Function Analysis</TabsTrigger>
            <TabsTrigger value="classes">Class Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Issues Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.issues.length > 0 ? (
                    <div className="space-y-3">
                      {result.issues.map((issue, index) => (
                        <div key={index} className={`p-3 border rounded-lg ${
                          issue.type === 'error' ? 'border-red-200 bg-red-50' :
                          issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {issue.type === 'error' ? <XCircle className="h-4 w-4 text-red-500" /> :
                             issue.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                             <FileText className="h-4 w-4 text-blue-500" />}
                            <span className="font-medium text-sm">{issue.message}</span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            {issue.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-green-600 font-medium">No issues detected!</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your code appears to be well-structured and maintainable.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-green-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="functions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Function Complexity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.functions.map((func, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{func.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            Lines {func.lineStart}-{func.lineEnd}
                          </Badge>
                          <Badge className={getComplexityLevel(func.complexity.cyclomaticComplexity).color}>
                            CC: {func.complexity.cyclomaticComplexity}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cyclomatic:</span>
                          <span className="ml-2 font-medium">{func.complexity.cyclomaticComplexity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cognitive:</span>
                          <span className="ml-2 font-medium">{func.complexity.cognitiveComplexity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Maintainability:</span>
                          <span className="ml-2 font-medium">{func.complexity.maintainabilityIndex.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Complexity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.classes.map((cls, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{cls.name}</h4>
                        <Badge variant="outline">
                          {cls.methods.length} methods
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Cyclomatic Complexity:</span>
                          <span className="ml-2 font-medium">{cls.complexity.cyclomaticComplexity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Maintainability Index:</span>
                          <span className="ml-2 font-medium">{cls.complexity.maintainabilityIndex.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground">Methods:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cls.methods.map((method, methodIndex) => (
                            <Badge key={methodIndex} variant="secondary" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Complexity Metrics Explained</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Cyclomatic Complexity</h4>
              <p className="text-sm text-muted-foreground">
                Measures the number of linearly independent paths through code. Higher values indicate more complex control flow.
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div>• 1-10: Simple</div>
                <div>• 11-20: Moderate</div>
                <div>• 21-50: Complex</div>
                <div>• 50+: Very Complex</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cognitive Complexity</h4>
              <p className="text-sm text-muted-foreground">
                Measures how difficult code is to understand by considering nesting, recursion, and control flow breaks.
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div>• 1-15: Simple</div>
                <div>• 16-30: Moderate</div>
                <div>• 31-60: Complex</div>
                <div>• 60+: Very Complex</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Maintainability Index</h4>
              <p className="text-sm text-muted-foreground">
                Calculates how maintainable code is based on lines of code, cyclomatic complexity, and Halstead volume.
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div>• 85-171: Excellent</div>
                <div>• 70-84: Good</div>
                <div>• 55-69: Moderate</div>
                <div>• 0-54: Poor</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Halstead Metrics</h4>
              <p className="text-sm text-muted-foreground">
                Measures code complexity based on operators and operands. Includes volume, difficulty, and effort metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}