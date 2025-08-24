'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, DollarSign, Percent, Calendar, TrendingUp, Home, Car, GraduationCap } from 'lucide-react'

interface LoanDetails {
  loanAmount: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  loanType: string
}

interface AmortizationSchedule {
  month: number
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

export default function LoanCalculatorAdvanced() {
  const [loanAmount, setLoanAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [loanType, setLoanType] = useState('mortgage')
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null)
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationSchedule[]>([])
  const [error, setError] = useState('')

  const calculateLoan = () => {
    if (!loanAmount || !interestRate || !loanTerm) {
      setError('Please fill in all fields')
      return
    }

    const principal = parseFloat(loanAmount)
    const annualRate = parseFloat(interestRate)
    const years = parseInt(loanTerm)

    if (principal <= 0 || annualRate <= 0 || years <= 0) {
      setError('Please enter valid positive numbers')
      return
    }

    setError('')

    // Calculate monthly payment
    const monthlyRate = annualRate / 100 / 12
    const numberOfPayments = years * 12
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const totalPayment = monthlyPayment * numberOfPayments
    const totalInterest = totalPayment - principal

    const details: LoanDetails = {
      loanAmount: principal,
      interestRate: annualRate,
      loanTerm: years,
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanType
    }

    setLoanDetails(details)

    // Generate amortization schedule
    const schedule: AmortizationSchedule[] = []
    let remainingBalance = principal

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance)
      })
    }

    setAmortizationSchedule(schedule)
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

  const getLoanIcon = (type: string) => {
    switch (type) {
      case 'mortgage': return <Home className="h-5 w-5" />
      case 'auto': return <Car className="h-5 w-5" />
      case 'student': return <GraduationCap className="h-5 w-5" />
      default: return <DollarSign className="h-5 w-5" />
    }
  }

  const getLoanTypeName = (type: string): string => {
    switch (type) {
      case 'mortgage': return 'Mortgage Loan'
      case 'auto': return 'Auto Loan'
      case 'student': return 'Student Loan'
      case 'personal': return 'Personal Loan'
      default: return 'Loan'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Loan Calculator</h1>
        <p className="text-muted-foreground">
          Calculate loan payments, interest, and generate amortization schedules
        </p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Loan Calculator
              </CardTitle>
              <CardDescription>
                Enter loan details to calculate monthly payments and total interest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="loanType">Loan Type</Label>
                    <Select value={loanType} onValueChange={setLoanType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mortgage">Mortgage Loan</SelectItem>
                        <SelectItem value="auto">Auto Loan</SelectItem>
                        <SelectItem value="student">Student Loan</SelectItem>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="loanAmount">Loan Amount</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="Enter loan amount"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      placeholder="Enter interest rate"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      placeholder="Enter loan term in years"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                    />
                  </div>

                  <Button onClick={calculateLoan} className="w-full">
                    Calculate Loan
                  </Button>

                  {error && <p className="text-red-500">{error}</p>}
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <Label className="text-sm font-medium text-muted-foreground">Loan Type</Label>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {getLoanIcon(loanType)}
                      <span className="text-lg font-semibold">{getLoanTypeName(loanType)}</span>
                    </div>
                  </div>

                  {loanDetails && (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Monthly Payment</Label>
                        <div className="text-3xl font-bold text-primary">
                          {formatCurrency(loanDetails.monthlyPayment)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Loan Amount</Label>
                          <div className="text-lg font-semibold">{formatCurrency(loanDetails.loanAmount)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Interest Rate</Label>
                          <div className="text-lg font-semibold">{formatPercent(loanDetails.interestRate)}</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Loan Term</Label>
                          <div className="text-lg font-semibold">{loanDetails.loanTerm} years</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Total Payment</Label>
                          <div className="text-lg font-semibold">{formatCurrency(loanDetails.totalPayment)}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-destructive/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-muted-foreground">Total Interest</Label>
                          <div className="text-lg font-semibold text-destructive">
                            {formatCurrency(loanDetails.totalInterest)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatPercent((loanDetails.totalInterest / loanDetails.totalPayment) * 100)} of total payment
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          {amortizationSchedule.length > 0 && loanDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Amortization Schedule
                </CardTitle>
                <CardDescription>
                  Detailed payment schedule showing principal and interest breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Payments:</span> {amortizationSchedule.length}
                    </div>
                    <div>
                      <span className="font-medium">Monthly Payment:</span> {formatCurrency(loanDetails.monthlyPayment)}
                    </div>
                    <div>
                      <span className="font-medium">Total Interest:</span> {formatCurrency(loanDetails.totalInterest)}
                    </div>
                    <div>
                      <span className="font-medium">Total Cost:</span> {formatCurrency(loanDetails.totalPayment)}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-gray-300 px-4 py-2 text-left">Month</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Payment</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Principal</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Interest</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.slice(0, 12).map((payment) => (
                        <tr key={payment.month}>
                          <td className="border border-gray-300 px-4 py-2">{payment.month}</td>
                          <td className="border border-gray-300 px-4 py-2">{formatCurrency(payment.payment)}</td>
                          <td className="border border-gray-300 px-4 py-2">{formatCurrency(payment.principal)}</td>
                          <td className="border border-gray-300 px-4 py-2">{formatCurrency(payment.interest)}</td>
                          <td className="border border-gray-300 px-4 py-2">{formatCurrency(payment.remainingBalance)}</td>
                        </tr>
                      ))}
                      {amortizationSchedule.length > 12 && (
                        <tr>
                          <td colSpan={5} className="border border-gray-300 px-4 py-2 text-center text-muted-foreground">
                            ... showing first 12 months of {amortizationSchedule.length} total payments
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {amortizationSchedule.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Calculate a loan first to see the amortization schedule</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Loan Examples</CardTitle>
          <CardDescription>Try these common loan scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setLoanType('mortgage')
                setLoanAmount('300000')
                setInterestRate('4.5')
                setLoanTerm('30')
              }}
            >
              <Home className="h-4 w-4 mr-2" />
              $300K Mortgage
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLoanType('auto')
                setLoanAmount('25000')
                setInterestRate('5.5')
                setLoanTerm('5')
              }}
            >
              <Car className="h-4 w-4 mr-2" />
              $25K Auto Loan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLoanType('student')
                setLoanAmount('50000')
                setInterestRate('6.8')
                setLoanTerm('10')
              }}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              $50K Student Loan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}