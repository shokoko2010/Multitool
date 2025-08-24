'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, TrendingUp, DollarSign, PieChart, AlertTriangle } from 'lucide-react'

interface FinancialResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  payoffDate: string
  amortizationSchedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
}

interface InvestmentResult {
  futureValue: number
  totalDeposits: number
  totalInterest: number
  growthChart: Array<{
    year: number
    value: number
    deposits: number
    interest: number
  }>
}

interface BudgetResult {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRate: number
  categories: Array<{
    name: string
    amount: number
    percentage: number
    color: string
  }>
  recommendations: string[]
}

export default function FinancialCalculator() {
  const [activeTab, setActiveTab] = useState('loan')
  const [loanData, setLoanData] = useState({
    principal: '',
    interestRate: '',
    loanTerm: '',
    startDate: ''
  })
  const [investmentData, setInvestmentData] = useState({
    initialAmount: '',
    monthlyContribution: '',
    annualReturn: '',
    years: ''
  })
  const [budgetData, setBudgetData] = useState({
    income: '',
    housing: '',
    food: '',
    transportation: '',
    utilities: '',
    entertainment: '',
    healthcare: '',
    savings: '',
    other: ''
  })

  const [loanResult, setLoanResult] = useState<FinancialResult | null>(null)
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null)
  const [budgetResult, setBudgetResult] = useState<BudgetResult | null>(null)

  const calculateLoan = () => {
    const principal = parseFloat(loanData.principal)
    const annualRate = parseFloat(loanData.interestRate) / 100
    const years = parseFloat(loanData.loanTerm)
    
    if (!principal || !annualRate || !years) return

    const monthlyRate = annualRate / 12
    const numPayments = years * 12
    
    // Calculate monthly payment using loan formula
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1)
    
    const totalPayment = monthlyPayment * numPayments
    const totalInterest = totalPayment - principal
    
    // Generate amortization schedule
    const amortizationSchedule = []
    let balance = principal
    
    for (let month = 1; month <= numPayments; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment
      
      amortizationSchedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      })
    }
    
    // Calculate payoff date
    const startDate = new Date(loanData.startDate || new Date())
    const payoffDate = new Date(startDate)
    payoffDate.setMonth(payoffDate.getMonth() + numPayments)
    
    setLoanResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      payoffDate: payoffDate.toLocaleDateString(),
      amortizationSchedule
    })
  }

  const calculateInvestment = () => {
    const initialAmount = parseFloat(investmentData.initialAmount) || 0
    const monthlyContribution = parseFloat(investmentData.monthlyContribution) || 0
    const annualReturn = parseFloat(investmentData.annualReturn) / 100
    const years = parseFloat(investmentData.years)
    
    if (!years || annualReturn === 0) return

    const monthlyRate = annualReturn / 12
    const months = years * 12
    
    // Calculate future value with compound interest
    let futureValue = initialAmount
    const growthChart = []
    
    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        for (let month = 1; month <= 12; month++) {
          futureValue = futureValue * (1 + monthlyRate) + monthlyContribution
        }
      }
      
      const totalDeposits = initialAmount + (monthlyContribution * 12 * year)
      const totalInterest = futureValue - totalDeposits
      
      growthChart.push({
        year,
        value: futureValue,
        deposits: totalDeposits,
        interest: totalInterest
      })
    }
    
    const totalDeposits = initialAmount + (monthlyContribution * 12 * years)
    const totalInterest = futureValue - totalDeposits
    
    setInvestmentResult({
      futureValue,
      totalDeposits,
      totalInterest,
      growthChart
    })
  }

  const calculateBudget = () => {
    const income = parseFloat(budgetData.income)
    const expenses = {
      housing: parseFloat(budgetData.housing) || 0,
      food: parseFloat(budgetData.food) || 0,
      transportation: parseFloat(budgetData.transportation) || 0,
      utilities: parseFloat(budgetData.utilities) || 0,
      entertainment: parseFloat(budgetData.entertainment) || 0,
      healthcare: parseFloat(budgetData.healthcare) || 0,
      savings: parseFloat(budgetData.savings) || 0,
      other: parseFloat(budgetData.other) || 0
    }
    
    if (!income) return

    const totalExpenses = Object.values(expenses).reduce((sum, amount) => sum + amount, 0)
    const netIncome = income - totalExpenses
    const savingsRate = ((income - totalExpenses + expenses.savings) / income) * 100
    
    const categories = [
      { name: 'Housing', amount: expenses.housing, percentage: (expenses.housing / income) * 100, color: '#3B82F6' },
      { name: 'Food', amount: expenses.food, percentage: (expenses.food / income) * 100, color: '#10B981' },
      { name: 'Transportation', amount: expenses.transportation, percentage: (expenses.transportation / income) * 100, color: '#F59E0B' },
      { name: 'Utilities', amount: expenses.utilities, percentage: (expenses.utilities / income) * 100, color: '#EF4444' },
      { name: 'Entertainment', amount: expenses.entertainment, percentage: (expenses.entertainment / income) * 100, color: '#8B5CF6' },
      { name: 'Healthcare', amount: expenses.healthcare, percentage: (expenses.healthcare / income) * 100, color: '#06B6D4' },
      { name: 'Savings', amount: expenses.savings, percentage: (expenses.savings / income) * 100, color: '#84CC16' },
      { name: 'Other', amount: expenses.other, percentage: (expenses.other / income) * 100, color: '#6B7280' }
    ]
    
    const recommendations = generateBudgetRecommendations(categories, income, netIncome)
    
    setBudgetResult({
      totalIncome: income,
      totalExpenses,
      netIncome,
      savingsRate,
      categories,
      recommendations
    })
  }

  const generateBudgetRecommendations = (categories: any[], income: number, netIncome: number): string[] => {
    const recommendations: string[] = []
    
    // Housing recommendation
    const housingPercentage = categories.find(c => c.name === 'Housing')?.percentage || 0
    if (housingPercentage > 30) {
      recommendations.push('Consider reducing housing costs to stay within the recommended 30% of income')
    }
    
    // Savings recommendation
    const savingsPercentage = categories.find(c => c.name === 'Savings')?.percentage || 0
    if (savingsPercentage < 20) {
      recommendations.push('Aim to save at least 20% of your income for long-term financial health')
    }
    
    // Net income recommendation
    if (netIncome < 0) {
      recommendations.push('Your expenses exceed your income. Consider reducing expenses or increasing income')
    } else if (netIncome < income * 0.1) {
      recommendations.push('Your net income is low. Look for opportunities to reduce expenses')
    }
    
    // Food recommendation
    const foodPercentage = categories.find(c => c.name === 'Food')?.percentage || 0
    if (foodPercentage > 15) {
      recommendations.push('Consider meal planning to reduce food expenses')
    }
    
    // Transportation recommendation
    const transportPercentage = categories.find(c => c.name === 'Transportation')?.percentage || 0
    if (transportPercentage > 15) {
      recommendations.push('Look for ways to reduce transportation costs (public transit, carpooling)')
    }
    
    return recommendations
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Calculator</h1>
        <p className="text-muted-foreground">
          Comprehensive financial planning tools for loans, investments, and budgeting
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loan">Loan Calculator</TabsTrigger>
          <TabsTrigger value="investment">Investment Calculator</TabsTrigger>
          <TabsTrigger value="budget">Budget Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="loan" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Loan Details
                </CardTitle>
                <CardDescription>
                  Enter loan information to calculate payments and schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Loan Amount</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={loanData.principal}
                    onChange={(e) => setLoanData(prev => ({ ...prev, principal: e.target.value }))}
                    placeholder="200000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={loanData.interestRate}
                    onChange={(e) => setLoanData(prev => ({ ...prev, interestRate: e.target.value }))}
                    placeholder="4.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Loan Term (years)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanData.loanTerm}
                    onChange={(e) => setLoanData(prev => ({ ...prev, loanTerm: e.target.value }))}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={loanData.startDate}
                    onChange={(e) => setLoanData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <Button onClick={calculateLoan} className="w-full">
                  Calculate Loan
                </Button>
              </CardContent>
            </Card>

            {loanResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Loan Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(loanResult.monthlyPayment)}</div>
                        <div className="text-sm text-muted-foreground">Monthly Payment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(loanResult.totalPayment)}</div>
                        <div className="text-sm text-muted-foreground">Total Payment</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">{formatCurrency(loanResult.totalInterest)}</div>
                        <div className="text-sm text-muted-foreground">Total Interest</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{loanResult.payoffDate}</div>
                        <div className="text-sm text-muted-foreground">Payoff Date</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">First 12 Payments</h4>
                      <div className="space-y-1 text-sm">
                        {loanResult.amortizationSchedule.slice(0, 12).map((payment) => (
                          <div key={payment.month} className="flex justify-between">
                            <span>Month {payment.month}</span>
                            <span>{formatCurrency(payment.payment)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="investment" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Details
                </CardTitle>
                <CardDescription>
                  Calculate investment growth with compound interest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initialAmount">Initial Investment</Label>
                  <Input
                    id="initialAmount"
                    type="number"
                    value={investmentData.initialAmount}
                    onChange={(e) => setInvestmentData(prev => ({ ...prev, initialAmount: e.target.value }))}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={investmentData.monthlyContribution}
                    onChange={(e) => setInvestmentData(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualReturn">Annual Return (%)</Label>
                  <Input
                    id="annualReturn"
                    type="number"
                    step="0.01"
                    value={investmentData.annualReturn}
                    onChange={(e) => setInvestmentData(prev => ({ ...prev, annualReturn: e.target.value }))}
                    placeholder="7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">Investment Period (years)</Label>
                  <Input
                    id="years"
                    type="number"
                    value={investmentData.years}
                    onChange={(e) => setInvestmentData(prev => ({ ...prev, years: e.target.value }))}
                    placeholder="20"
                  />
                </div>
                <Button onClick={calculateInvestment} className="w-full">
                  Calculate Investment
                </Button>
              </CardContent>
            </Card>

            {investmentResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{formatCurrency(investmentResult.futureValue)}</div>
                      <div className="text-sm text-muted-foreground">Future Value</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold">{formatCurrency(investmentResult.totalDeposits)}</div>
                        <div className="text-sm text-muted-foreground">Total Deposits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{formatCurrency(investmentResult.totalInterest)}</div>
                        <div className="text-sm text-muted-foreground">Total Interest</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Growth Projection</h4>
                      <div className="space-y-1 text-sm">
                        {investmentResult.growthChart.filter((_, i) => i % 5 === 0).map((year) => (
                          <div key={year.year} className="flex justify-between">
                            <span>Year {year.year}</span>
                            <span>{formatCurrency(year.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Budget Details
                </CardTitle>
                <CardDescription>
                  Enter your income and expenses to analyze your budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income</Label>
                  <Input
                    id="income"
                    type="number"
                    value={budgetData.income}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, income: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="housing">Housing</Label>
                    <Input
                      id="housing"
                      type="number"
                      value={budgetData.housing}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, housing: e.target.value }))}
                      placeholder="1500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="food">Food</Label>
                    <Input
                      id="food"
                      type="number"
                      value={budgetData.food}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, food: e.target.value }))}
                      placeholder="600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transportation">Transportation</Label>
                    <Input
                      id="transportation"
                      type="number"
                      value={budgetData.transportation}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, transportation: e.target.value }))}
                      placeholder="400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="utilities">Utilities</Label>
                    <Input
                      id="utilities"
                      type="number"
                      value={budgetData.utilities}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, utilities: e.target.value }))}
                      placeholder="200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entertainment">Entertainment</Label>
                    <Input
                      id="entertainment"
                      type="number"
                      value={budgetData.entertainment}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, entertainment: e.target.value }))}
                      placeholder="300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="healthcare">Healthcare</Label>
                    <Input
                      id="healthcare"
                      type="number"
                      value={budgetData.healthcare}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, healthcare: e.target.value }))}
                      placeholder="250"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="savings">Savings</Label>
                    <Input
                      id="savings"
                      type="number"
                      value={budgetData.savings}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, savings: e.target.value }))}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other">Other</Label>
                    <Input
                      id="other"
                      type="number"
                      value={budgetData.other}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, other: e.target.value }))}
                      placeholder="250"
                    />
                  </div>
                </div>
                <Button onClick={calculateBudget} className="w-full">
                  Analyze Budget
                </Button>
              </CardContent>
            </Card>

            {budgetResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(budgetResult.totalIncome)}</div>
                        <div className="text-sm text-muted-foreground">Total Income</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(budgetResult.totalExpenses)}</div>
                        <div className="text-sm text-muted-foreground">Total Expenses</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${budgetResult.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(budgetResult.netIncome)}
                      </div>
                      <div className="text-sm text-muted-foreground">Net Income</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{formatPercentage(budgetResult.savingsRate)}</div>
                      <div className="text-sm text-muted-foreground">Savings Rate</div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Expense Breakdown</h4>
                      <div className="space-y-2">
                        {budgetResult.categories.map((category) => (
                          <div key={category.name} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{formatCurrency(category.amount)}</div>
                              <div className="text-xs text-muted-foreground">{formatPercentage(category.percentage)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {budgetResult.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Recommendations
                        </h4>
                        <div className="space-y-1">
                          {budgetResult.recommendations.map((rec, index) => (
                            <div key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                              • {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}