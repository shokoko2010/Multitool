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
import { Calculator, TrendingUp, DollarSign, Calendar, Copy, Download } from 'lucide-react'

interface LoanCalculation {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  amortizationSchedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
}

interface LoanHistory {
  id: string
  loanAmount: number
  interestRate: number
  loanTerm: number
  result: LoanCalculation
  timestamp: Date
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('100000')
  const [interestRate, setInterestRate] = useState<string>('5.5')
  const [loanTerm, setLoanTerm] = useState<string>('30')
  const [loanType, setLoanType] = useState<string>('fixed')
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null)
  const [calculationHistory, setCalculationHistory] = useState<LoanHistory[]>([])

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount)
    const annualRate = parseFloat(interestRate) / 100
    const years = parseInt(loanTerm)

    if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate < 0 || years <= 0) {
      return
    }

    const monthlyRate = annualRate / 12
    const numPayments = years * 12

    let monthlyPayment: number
    if (loanType === 'fixed') {
      // Fixed rate mortgage calculation
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                      (Math.pow(1 + monthlyRate, numPayments) - 1)
    } else {
      // Adjustable rate - use initial rate for calculation
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                      (Math.pow(1 + monthlyRate, numPayments) - 1)
    }

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

    const result: LoanCalculation = {
      monthlyPayment,
      totalPayment,
      totalInterest,
      amortizationSchedule
    }

    setCalculation(result)

    // Add to history
    const historyItem: LoanHistory = {
      id: Date.now().toString(),
      loanAmount: principal,
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
      ['Date', 'Loan Amount', 'Interest Rate', 'Term (years)', 'Monthly Payment', 'Total Interest'],
      ...calculationHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.loanAmount.toFixed(2),
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
    a.download = `loan-calculator-history-${new Date().toISOString().split('T')[0]}.csv`
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
    calculateLoan()
  }, [loanAmount, interestRate, loanTerm, loanType])

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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Loan Calculator</h1>
        <p className="text-muted-foreground">Calculate loan payments, interest, and amortization schedules</p>
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
                  <Calculator className="h-5 w-5" />
                  Loan Details
                </CardTitle>
                <CardDescription>
                  Enter your loan information to calculate payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="100000"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="5.5"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Loan Term (years)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    placeholder="30"
                    min="1"
                    max="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select value={loanType} onValueChange={setLoanType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="adjustable">Adjustable Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateLoan} className="w-full">
                  Calculate Loan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Loan Summary
                </CardTitle>
                <CardDescription>
                  Your loan calculation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calculation ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {formatCurrency(calculation.monthlyPayment)}
                      </div>
                      <div className="text-muted-foreground">Monthly Payment</div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Loan Amount:
                        </span>
                        <Badge variant="outline">{formatCurrency(parseFloat(loanAmount))}</Badge>
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
                    Enter loan details to calculate
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                  Calculate a loan to see the amortization schedule
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
                Your recent loan calculations
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
                          {formatCurrency(item.loanAmount)} at {item.interestRate}% for {item.loanTerm} years
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