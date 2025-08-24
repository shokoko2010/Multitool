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
import { Calculator, DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Target } from 'lucide-react'

interface InvestmentInputs {
  initialInvestment: number
  monthlyContribution: number
  annualReturn: number
  investmentPeriod: number
  inflationRate: number
  contributionType: 'beginning' | 'end'
}

interface InvestmentResults {
  finalValue: number
  totalContributions: number
  totalInterest: number
  realValue: number
  annualizedReturn: number
  totalReturnPercent: number
  monthlyProjection: Array<{month: number, value: number}>
  yearlyProjection: Array<{year: number, value: number}>
}

export default function InvestmentReturnCalculator() {
  const [inputs, setInputs] = useState<InvestmentInputs>({
    initialInvestment: 10000,
    monthlyContribution: 500,
    annualReturn: 8,
    investmentPeriod: 10,
    inflationRate: 3,
    contributionType: 'end'
  })

  const [results, setResults] = useState<InvestmentResults | null>(null)

  const calculateInvestment = () => {
    const monthlyRate = inputs.annualReturn / 100 / 12
    const monthlyInflation = inputs.inflationRate / 100 / 12
    const totalMonths = inputs.investmentPeriod * 12

    // Calculate future value with monthly contributions
    let finalValue = inputs.initialInvestment * Math.pow(1 + monthlyRate, totalMonths)
    
    if (inputs.contributionType === 'beginning') {
      // Contributions at beginning of period
      finalValue += inputs.monthlyContribution * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate * (1 + monthlyRate)
    } else {
      // Contributions at end of period
      finalValue += inputs.monthlyContribution * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
    }

    const totalContributions = inputs.initialInvestment + (inputs.monthlyContribution * totalMonths)
    const totalInterest = finalValue - totalContributions
    const realValue = finalValue / Math.pow(1 + monthlyInflation, totalMonths)
    const totalReturnPercent = ((finalValue - totalContributions) / totalContributions) * 100
    const annualizedReturn = Math.pow(finalValue / totalContributions, 1 / inputs.investmentPeriod) - 1

    // Generate monthly projection
    const monthlyProjection = []
    let currentValue = inputs.initialInvestment
    
    for (let month = 0; month <= totalMonths; month++) {
      if (month > 0) {
        currentValue = currentValue * (1 + monthlyRate)
        if (inputs.contributionType === 'beginning') {
          currentValue += inputs.monthlyContribution
        }
        currentValue = currentValue * (1 + monthlyRate)
        if (inputs.contributionType === 'end') {
          currentValue += inputs.monthlyContribution
        }
      }
      monthlyProjection.push({ month, value: currentValue })
    }

    // Generate yearly projection
    const yearlyProjection = []
    for (let year = 0; year <= inputs.investmentPeriod; year++) {
      const months = year * 12
      const yearValue = inputs.initialInvestment * Math.pow(1 + monthlyRate, months) +
                       inputs.monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate *
                       (inputs.contributionType === 'beginning' ? (1 + monthlyRate) : 1)
      yearlyProjection.push({ year, value: yearValue })
    }

    const investmentResults: InvestmentResults = {
      finalValue,
      totalContributions,
      totalInterest,
      realValue,
      annualizedReturn: annualizedReturn * 100,
      totalReturnPercent,
      monthlyProjection,
      yearlyProjection
    }

    setResults(investmentResults)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (rate: number): string => {
    return `${rate.toFixed(2)}%`
  }

  const updateInput = (field: keyof InvestmentInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: field === 'contributionType' ? value as 'beginning' | 'end' : parseFloat(value) || 0
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Investment Return Calculator</h1>
        <p className="text-muted-foreground">
          Calculate investment returns, compound interest, and growth projections
        </p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="projection">Growth Chart</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Investment Calculator
              </CardTitle>
              <CardDescription>
                Enter your investment details to calculate potential returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="initialInvestment">Initial Investment</Label>
                    <Input
                      id="initialInvestment"
                      type="number"
                      value={inputs.initialInvestment}
                      onChange={(e) => updateInput('initialInvestment', e.target.value)}
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
                    <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
                    <Input
                      id="annualReturn"
                      type="number"
                      step="0.1"
                      value={inputs.annualReturn}
                      onChange={(e) => updateInput('annualReturn', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="investmentPeriod">Investment Period (Years)</Label>
                    <Input
                      id="investmentPeriod"
                      type="number"
                      value={inputs.investmentPeriod}
                      onChange={(e) => updateInput('investmentPeriod', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inflationRate">Inflation Rate (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      value={inputs.inflationRate}
                      onChange={(e) => updateInput('inflationRate', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contributionType">Contribution Timing</Label>
                    <Select value={inputs.contributionType} onValueChange={(value) => updateInput('contributionType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginning">Beginning of Month</SelectItem>
                        <SelectItem value="end">End of Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={calculateInvestment} className="w-full">
                    Calculate Returns
                  </Button>
                </div>

                <div className="space-y-4">
                  {results && (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Final Investment Value</Label>
                        <div className="text-3xl font-bold text-primary">
                          {formatCurrency(results.finalValue)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Real value: {formatCurrency(results.realValue)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Total Contributions</Label>
                          <div className="text-lg font-semibold">{formatCurrency(results.totalContributions)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Total Interest</Label>
                          <div className="text-lg font-semibold text-green-600">{formatCurrency(results.totalInterest)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Total Return</Label>
                          <div className="text-lg font-semibold">{formatPercent(results.totalReturnPercent)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Annualized Return</Label>
                          <div className="text-lg font-semibold">{formatPercent(results.annualizedReturn)}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Interest vs Principal</Label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Principal ({formatPercent((results.totalContributions / results.finalValue) * 100)})</span>
                            <span>{formatCurrency(results.totalContributions)}</span>
                          </div>
                          <Progress 
                            value={(results.totalContributions / results.finalValue) * 100} 
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span>Interest ({formatPercent((results.totalInterest / results.finalValue) * 100)})</span>
                            <span>{formatCurrency(results.totalInterest)}</span>
                          </div>
                          <Progress 
                            value={(results.totalInterest / results.finalValue) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-600">Investment Period</div>
                          <div className="text-lg font-bold">{inputs.investmentPeriod} years</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-600">Monthly Contribution</div>
                          <div className="text-lg font-bold">{formatCurrency(inputs.monthlyContribution)}</div>
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
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Investment Growth Projection
                </CardTitle>
                <CardDescription>
                  See how your investment grows over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{inputs.investmentPeriod}</div>
                      <div className="text-sm text-muted-foreground">Years</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatPercent(results.annualizedReturn)}</div>
                      <div className="text-sm text-muted-foreground">Annual Return</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(results.finalValue)}</div>
                      <div className="text-sm text-muted-foreground">Final Value</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Yearly Growth</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.yearlyProjection.filter((_, index) => index % 2 === 0 || index === results.yearlyProjection.length - 1).map((data) => (
                      <div key={data.year} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-16 text-sm font-medium">Year {data.year}</div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            data.year === 0 ? 'bg-gray-100 text-gray-800' : 
                            data.year === inputs.investmentPeriod ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {data.year === 0 ? 'Start' : data.year === inputs.investmentPeriod ? 'Final' : 'Growth'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(data.value)}</div>
                          {data.year > 0 && (
                            <div className="text-xs text-muted-foreground">
                              +{formatPercent(((data.value - results.yearlyProjection[data.year - 1].value) / results.yearlyProjection[data.year - 1].value) * 100)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Growth Summary</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Starting investment: {formatCurrency(inputs.initialInvestment)}</li>
                    <li>• Total contributions: {formatCurrency(results.totalContributions - inputs.initialInvestment)}</li>
                    <li>• Interest earned: {formatCurrency(results.totalInterest)}</li>
                    <li>• Final value: {formatCurrency(results.finalValue)}</li>
                    <li>• Real value (adjusted for inflation): {formatCurrency(results.realValue)}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {!results && (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Calculate your investment returns first to see the projection</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Investment Scenarios
              </CardTitle>
              <CardDescription>
                Compare different investment scenarios and strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conservative</CardTitle>
                    <CardDescription className="text-sm">Low risk, steady growth</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Return:</span>
                        <span className="font-medium">5% annually</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk:</span>
                        <span className="text-green-600">Low</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Best for:</span>
                        <span>Risk-averse</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Moderate</CardTitle>
                    <CardDescription className="text-sm">Balanced risk and return</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Return:</span>
                        <span className="font-medium">8% annually</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk:</span>
                        <span className="text-yellow-600">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Best for:</span>
                        <span>Most investors</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Aggressive</CardTitle>
                    <CardDescription className="text-sm">High risk, high return</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Return:</span>
                        <span className="font-medium">12% annually</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk:</span>
                        <span className="text-red-600">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Best for:</span>
                        <span>Risk-tolerant</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Investment Tips</h4>
                <ul className="text-sm space-y-1">
                  <li>• Start investing early to benefit from compound interest</li>
                  <li>• Diversify your investments across different asset classes</li>
                  <li>• Consider your risk tolerance and investment timeline</li>
                  <li>• Regular contributions can significantly boost your returns</li>
                  <li>• Reinvest dividends and interest to maximize growth</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Investment Scenarios</CardTitle>
          <CardDescription>Try these common investment scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setInputs({
                  initialInvestment: 5000,
                  monthlyContribution: 200,
                  annualReturn: 7,
                  investmentPeriod: 20,
                  inflationRate: 3,
                  contributionType: 'end'
                })
              }}
            >
              <Target className="h-4 w-4 mr-2" />
              Long-term Growth
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputs({
                  initialInvestment: 25000,
                  monthlyContribution: 1000,
                  annualReturn: 8,
                  investmentPeriod: 15,
                  inflationRate: 3,
                  contributionType: 'beginning'
                })
              }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Aggressive Saving
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputs({
                  initialInvestment: 100000,
                  monthlyContribution: 0,
                  annualReturn: 6,
                  investmentPeriod: 10,
                  inflationRate: 3,
                  contributionType: 'end'
                })
              }}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Lump Sum Investment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}