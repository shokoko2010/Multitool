'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Calculator, DollarSign, TrendingUp, Users, Calendar, Target, PiggyBank, AlertTriangle } from 'lucide-react'

interface RetirementInputs {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyContribution: number
  expectedReturn: number
  retirementIncome: number
  inflationRate: number
}

interface RetirementResults {
  totalSavings: number
  totalContributions: number
  totalInterest: number
  monthlyRetirementIncome: number
  yearsInRetirement: number
  savingsGoal: number
  onTrack: boolean
  shortfall: number
  projectedAge: number
}

export default function RetirementCalculator() {
  const [inputs, setInputs] = useState<RetirementInputs>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    expectedReturn: 7,
    retirementIncome: 5000,
    inflationRate: 3
  })

  const [results, setResults] = useState<RetirementResults | null>(null)
  const [projectionData, setProjectionData] = useState<Array<{age: number, savings: number}>>([])

  const calculateRetirement = () => {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge
    const monthsToRetirement = yearsToRetirement * 12
    const monthlyReturn = inputs.expectedReturn / 100 / 12
    const monthlyInflation = inputs.inflationRate / 100 / 12

    // Calculate future value of current savings
    const futureCurrentSavings = inputs.currentSavings * Math.pow(1 + monthlyReturn, monthsToRetirement)

    // Calculate future value of monthly contributions
    const futureContributions = inputs.monthlyContribution * 
      (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn

    const totalSavings = futureCurrentSavings + futureContributions
    const totalContributions = inputs.monthlyContribution * monthsToRetirement
    const totalInterest = totalSavings - totalContributions

    // Calculate retirement income needs adjusted for inflation
    const retirementIncomeNeeded = inputs.retirementIncome * Math.pow(1 + monthlyInflation, monthsToRetirement)

    // Calculate how many years the savings will last
    const annualWithdrawalRate = 0.04 // 4% rule
    const annualIncome = totalSavings * annualWithdrawalRate
    const monthlyRetirementIncome = annualIncome / 12

    // Calculate savings goal needed for desired retirement income
    const savingsGoal = retirementIncomeNeeded * 12 / annualWithdrawalRate

    // Generate projection data
    const projection = []
    let currentSavings = inputs.currentSavings
    for (let age = inputs.currentAge; age <= inputs.retirementAge + 30; age++) {
      if (age <= inputs.retirementAge) {
        currentSavings = currentSavings * (1 + inputs.expectedReturn / 100) + inputs.monthlyContribution * 12
      } else {
        currentSavings = currentSavings * (1 + inputs.expectedReturn / 100) - retirementIncomeNeeded * 12
      }
      projection.push({ age, savings: Math.max(0, currentSavings) })
    }

    const onTrack = totalSavings >= savingsGoal
    const shortfall = Math.max(0, savingsGoal - totalSavings)

    const retirementResults: RetirementResults = {
      totalSavings,
      totalContributions,
      totalInterest,
      monthlyRetirementIncome,
      yearsInRetirement: 30, // Standard projection
      savingsGoal,
      onTrack,
      shortfall,
      projectedAge: inputs.retirementAge
    }

    setResults(retirementResults)
    setProjectionData(projection)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (rate: number): string => {
    return `${rate.toFixed(1)}%`
  }

  const updateInput = (field: keyof RetirementInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Retirement Calculator</h1>
        <p className="text-muted-foreground">
          Plan your retirement savings and see if you're on track to meet your goals
        </p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Retirement Planning
              </CardTitle>
              <CardDescription>
                Enter your current financial information and retirement goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentAge">Current Age</Label>
                    <Input
                      id="currentAge"
                      type="number"
                      value={inputs.currentAge}
                      onChange={(e) => updateInput('currentAge', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="retirementAge">Retirement Age</Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      value={inputs.retirementAge}
                      onChange={(e) => updateInput('retirementAge', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentSavings">Current Savings</Label>
                    <Input
                      id="currentSavings"
                      type="number"
                      value={inputs.currentSavings}
                      onChange={(e) => updateInput('currentSavings', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={inputs.monthlyContribution}
                      onChange={(e) => updateInput('monthlyContribution', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
                    <Input
                      id="expectedReturn"
                      type="number"
                      step="0.1"
                      value={inputs.expectedReturn}
                      onChange={(e) => updateInput('expectedReturn', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="retirementIncome">Desired Monthly Retirement Income</Label>
                    <Input
                      id="retirementIncome"
                      type="number"
                      value={inputs.retirementIncome}
                      onChange={(e) => updateInput('retirementIncome', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inflationRate">Expected Inflation Rate (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      value={inputs.inflationRate}
                      onChange={(e) => updateInput('inflationRate', e.target.value)}
                    />
                  </div>

                  <Button onClick={calculateRetirement} className="w-full">
                    Calculate Retirement Plan
                  </Button>
                </div>

                <div className="space-y-4">
                  {results && (
                    <div className="space-y-4">
                      <div className={`text-center p-4 rounded-lg ${results.onTrack ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {results.onTrack ? <Target className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
                          <span className={`text-lg font-semibold ${results.onTrack ? 'text-green-600' : 'text-red-600'}`}>
                            {results.onTrack ? 'On Track!' : 'Shortfall Detected'}
                          </span>
                        </div>
                        <p className="text-sm">
                          {results.onTrack 
                            ? 'You are on track to meet your retirement goals'
                            : `You need ${formatCurrency(results.shortfall)} more to reach your goal`
                          }
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Years to Retirement</Label>
                          <div className="text-lg font-semibold">{inputs.retirementAge - inputs.currentAge} years</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Projected Savings</Label>
                          <div className="text-lg font-semibold">{formatCurrency(results.totalSavings)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Total Contributions</Label>
                          <div className="text-lg font-semibold">{formatCurrency(results.totalContributions)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Total Interest</Label>
                          <div className="text-lg font-semibold">{formatCurrency(results.totalInterest)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Monthly Retirement Income</Label>
                          <div className="text-lg font-semibold">{formatCurrency(results.monthlyRetirementIncome)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Savings Goal</Label>
                          <div className="text-lg font-semibold">{formatCurrency(results.savingsGoal)}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Progress to Goal</Label>
                          <Label className="text-sm font-medium">
                            {formatPercent((results.totalSavings / results.savingsGoal) * 100)}
                          </Label>
                        </div>
                        <Progress 
                          value={(results.totalSavings / results.savingsGoal) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-600">Current Age</div>
                          <div className="text-lg font-bold">{inputs.currentAge}</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-600">Retirement Age</div>
                          <div className="text-lg font-bold">{inputs.retirementAge}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection" className="space-y-6">
          {projectionData.length > 0 && results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Retirement Projection
                </CardTitle>
                <CardDescription>
                  Visual projection of your retirement savings over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{inputs.currentAge}</div>
                      <div className="text-sm text-muted-foreground">Current Age</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{inputs.retirementAge}</div>
                      <div className="text-sm text-muted-foreground">Retirement Age</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(results.totalSavings)}</div>
                      <div className="text-sm text-muted-foreground">Projected Savings</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Projection Timeline</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {projectionData.filter((_, index) => index % 5 === 0 || index === projectionData.length - 1).map((data) => (
                      <div key={data.age} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-16 text-sm font-medium">Age {data.age}</div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            data.age < inputs.retirementAge ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {data.age < inputs.retirementAge ? 'Working' : 'Retired'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(data.savings)}</div>
                          {data.age === inputs.retirementAge && (
                            <div className="text-xs text-muted-foreground">Retirement starts</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="text-sm space-y-1">
                    <li>• You'll contribute {formatCurrency(results.totalContributions)} over {inputs.retirementAge - inputs.currentAge} years</li>
                    <li>• Your investments will generate {formatCurrency(results.totalInterest)} in returns</li>
                    <li>• At retirement, you'll have {formatCurrency(results.monthlyRetirementIncome)} monthly income</li>
                    <li>• This is based on a {formatPercent(inputs.expectedReturn)} annual return and {formatPercent(inputs.inflationRate)} inflation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {projectionData.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Calculate your retirement plan first to see the projection</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Scenarios</CardTitle>
          <CardDescription>Try these common retirement planning scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setInputs({
                  currentAge: 25,
                  retirementAge: 65,
                  currentSavings: 10000,
                  monthlyContribution: 800,
                  expectedReturn: 7,
                  retirementIncome: 4000,
                  inflationRate: 3
                })
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Young Professional
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputs({
                  currentAge: 35,
                  retirementAge: 65,
                  currentSavings: 50000,
                  monthlyContribution: 1500,
                  expectedReturn: 7,
                  retirementIncome: 6000,
                  inflationRate: 3
                })
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Mid-Career
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputs({
                  currentAge: 45,
                  retirementAge: 65,
                  currentSavings: 200000,
                  monthlyContribution: 2500,
                  expectedReturn: 6,
                  retirementIncome: 8000,
                  inflationRate: 3
                })
              }}
            >
              <Target className="h-4 w-4 mr-2" />
              Late Career
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}