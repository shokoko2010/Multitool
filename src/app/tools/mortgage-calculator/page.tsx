'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, Home, DollarSign, Calendar, Copy, Download, TrendingUp } from 'lucide-react'

interface MortgageCalculation {
  loanAmount: number
  downPayment: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  totalPropertyCost: number
  amortizationSchedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
}

interface CalculationHistory {
  id: string
  homePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  result: MortgageCalculation
  timestamp: Date
}

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState<string>('300000')
  const [downPayment, setDownPayment] = useState<string>('60000')
  const [downPaymentType, setDownPaymentType] = useState<string>('amount')
  const [interestRate, setInterestRate] = useState<string>('6.5')
  const [loanTerm, setLoanTerm] = useState<string>('30')
  const [propertyTax, setPropertyTax] = useState<string>('3000')
  const [homeInsurance, setHomeInsurance] = useState<string>('1200')
  const [pmi, setPmi] = useState<string>('0')
  const [includeExtra, setIncludeExtra] = useState<boolean>(false)
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null)
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([])

  const calculateMortgage = () => {
    const price = parseFloat(homePrice)
    const dp = parseFloat(downPayment)
    const rate = parseFloat(interestRate) / 100 / 12 // Monthly rate
    const years = parseInt(loanTerm)
    const months = years * 12

    if (isNaN(price) || isNaN(dp) || isNaN(rate) || isNaN(years) || 
        price <= 0 || dp < 0 || rate < 0 || years <= 0) {
      return
    }

    // Calculate down payment amount
    let downPaymentAmount: number
    if (downPaymentType === 'percentage') {
      downPaymentAmount = price * (dp / 100)
    } else {
      downPaymentAmount = dp
    }

    // Ensure down payment doesn't exceed home price
    downPaymentAmount = Math.min(downPaymentAmount, price)

    const loanAmount = price - downPaymentAmount

    // Calculate monthly payment (P&I)
    const monthlyPayment = loanAmount * (rate * Math.pow(1 + rate, months)) / 
                          (Math.pow(1 + rate, months) - 1)

    const totalPayment = monthlyPayment * months
    const totalInterest = totalPayment - loanAmount
    const totalPropertyCost = price + totalInterest

    // Generate amortization schedule
    const amortizationSchedule = []
    let balance = loanAmount

    for (let month = 1; month <= months; month++) {
      const interestPayment = balance * rate
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

    const result: MortgageCalculation = {
      loanAmount,
      downPayment: downPaymentAmount,
      interestRate: parseFloat(interestRate),
      loanTerm: years,
      monthlyPayment,
      totalPayment,
      totalInterest,
      totalPropertyCost,
      amortizationSchedule
    }

    setCalculation(result)

    // Add to history
    const historyItem: CalculationHistory = {
      id: Date.now().toString(),
      homePrice: price,
      downPayment: downPaymentAmount,
      interestRate: parseFloat(interestRate),
      loanTerm: years,
      result,
      timestamp: new Date()
    }
    
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Home Price', 'Down Payment', 'Interest Rate', 'Term', 'Monthly Payment', 'Total Interest'],
      ...calculationHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.homePrice.toFixed(2),
        item.downPayment.toFixed(2),
        item.interestRate.toFixed(2) + '%',
        item.loanTerm.toString(),
        item.result.monthlyPayment.toFixed(2),
        item.result.totalInterest.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mortgage-calculator-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAmortizationSchedule = () => {
    if (!calculation) return

    const csvContent = [
      ['Month', 'Payment', 'Principal', 'Interest', 'Balance'],
      ...calculation.amortizationSchedule.map(item => [
        item.month.toString(),
        item.payment.toFixed(2),
        item.principal.toFixed(2),
        item.interest.toFixed(2),
        item.balance.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `amortization-schedule-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    calculateMortgage()
  }, [homePrice, downPayment, downPaymentType, interestRate, loanTerm, propertyTax, homeInsurance, pmi, includeExtra])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const calculateAffordability = (annualIncome: number, monthlyDebts: number = 0) => {
    if (!calculation) return null
    
    // 28/36 rule: 28% of income for housing, 36% total debt
    const maxHousingPayment = (annualIncome / 12) * 0.28
    const maxTotalDebtPayment = (annualIncome / 12) * 0.36 - monthlyDebts
    
    const affordablePayment = Math.min(maxHousingPayment, maxTotalDebtPayment)
    const canAfford = calculation.monthlyPayment <= affordablePayment
    
    return {
      affordablePayment,
      canAfford,
      maxHousingPayment,
      maxTotalDebtPayment
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mortgage Calculator</h1>
        <p className="text-muted-foreground">Calculate mortgage payments, affordability, and amortization schedules</p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="schedule">Amortization</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
                <CardDescription>
                  Enter your home and loan information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="homePrice">Home Price</Label>
                  <Input
                    id="homePrice"
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(e.target.value)}
                    placeholder="300000"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Down Payment</Label>
                  <div className="flex gap-2">
                    <Select value={downPaymentType} onValueChange={setDownPaymentType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">$</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      placeholder={downPaymentType === 'percentage' ? '20' : '60000'}
                      min="0"
                      max={downPaymentType === 'percentage' ? "100" : undefined}
                      step={downPaymentType === 'percentage' ? "0.1" : "1000"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="6.5"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Loan Term (years)</Label>
                  <Select value={loanTerm} onValueChange={setLoanTerm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="25">25 years</SelectItem>
                      <SelectItem value="30">30 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateMortgage} className="w-full">
                  Calculate Mortgage
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
                <CardDescription>
                  Your mortgage calculation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calculation ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {formatCurrency(calculation.monthlyPayment)}
                      </div>
                      <div className="text-muted-foreground">Monthly Payment (P&I)</div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Home Price:
                        </span>
                        <Badge variant="outline">{formatCurrency(parseFloat(homePrice))}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Down Payment:</span>
                        <Badge variant="outline">{formatCurrency(calculation.downPayment)}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Loan Amount:</span>
                        <Badge variant="outline">{formatCurrency(calculation.loanAmount)}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Interest Rate:
                        </span>
                        <Badge variant="outline">{interestRate}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Loan Term:
                        </span>
                        <Badge variant="outline">{loanTerm} years</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Payment:</span>
                        <span className="font-semibold">{formatCurrency(calculation.totalPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Interest:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(calculation.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Property Cost:</span>
                        <span className="font-semibold">{formatCurrency(calculation.totalPropertyCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest as % of Total:</span>
                        <span className="font-semibold">
                          {((calculation.totalInterest / calculation.totalPayment) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(
                        `Monthly Payment: ${formatCurrency(calculation.monthlyPayment)}\n` +
                        `Total Payment: ${formatCurrency(calculation.totalPayment)}\n` +
                        `Total Interest: ${formatCurrency(calculation.totalInterest)}`
                      )}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Results
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter property details to calculate
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {calculation && (
            <Card>
              <CardHeader>
                <CardTitle>Affordability Analysis</CardTitle>
                <CardDescription>
                  Check if this mortgage fits your budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income</Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      placeholder="75000"
                      onChange={(e) => {
                        const income = parseFloat(e.target.value) || 0
                        const affordability = calculateAffordability(income)
                        if (affordability) {
                          // You can display affordability results here
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyDebts">Monthly Debts</Label>
                    <Input
                      id="monthlyDebts"
                      type="number"
                      placeholder="500"
                      onChange={(e) => {
                        const income = 75000 // Default or get from input
                        const debts = parseFloat(e.target.value) || 0
                        const affordability = calculateAffordability(income, debts)
                        if (affordability) {
                          // You can display affordability results here
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>28/36 Rule</Label>
                    <div className="text-sm text-muted-foreground">
                      Max 28% of income for housing<br/>
                      Max 36% total debt payments
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Mortgage Tips</CardTitle>
              <CardDescription>
                Important considerations for home buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Down Payment</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 20% avoids PMI (Private Mortgage Insurance)</li>
                    <li>• Higher down payment = lower monthly payment</li>
                    <li>• Consider first-time home buyer programs</li>
                    <li>• Don't empty your savings account</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Interest Rates</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Fixed rates provide payment stability</li>
                    <li>• Adjustable rates may start lower</li>
                    <li>• Shop around for best rates</li>
                    <li>• Consider points to lower rate</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Loan Terms</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 30-year: lower payments, more interest</li>
                    <li>• 15-year: higher payments, less interest</li>
                    <li>• Consider your long-term plans</li>
                    <li>• Balance payment comfort with interest cost</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Additional Costs</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Property taxes and insurance</li>
                    <li>• HOA fees and maintenance</li>
                    <li>• Closing costs (2-5% of loan)</li>
                    <li>• Emergency fund for repairs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Amortization Schedule
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportAmortizationSchedule}
                  disabled={!calculation}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Detailed payment breakdown over the life of the loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculation ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">Payment</th>
                        <th className="text-right p-2">Principal</th>
                        <th className="text-right p-2">Interest</th>
                        <th className="text-right p-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculation.amortizationSchedule.slice(0, 12).map((payment) => (
                        <tr key={payment.month} className="border-b">
                          <td className="p-2">{payment.month}</td>
                          <td className="text-right p-2">{formatCurrency(payment.payment)}</td>
                          <td className="text-right p-2">{formatCurrency(payment.principal)}</td>
                          <td className="text-right p-2">{formatCurrency(payment.interest)}</td>
                          <td className="text-right p-2">{formatCurrency(payment.balance)}</td>
                        </tr>
                      ))}
                      {calculation.amortizationSchedule.length > 12 && (
                        <tr>
                          <td colSpan={5} className="text-center p-4 text-muted-foreground">
                            ... {calculation.amortizationSchedule.length - 12} more payments ...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Calculate a mortgage to see the amortization schedule
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Calculation History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHistory}
                  disabled={calculationHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Your recent mortgage calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculationHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No calculation history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {calculationHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {formatCurrency(item.homePrice)} at {item.interestRate}% for {item.loanTerm} years
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Monthly: {formatCurrency(item.result.monthlyPayment)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {formatCurrency(item.result.totalInterest)} interest
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}