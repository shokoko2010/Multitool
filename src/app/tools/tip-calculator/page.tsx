'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, DollarSign, Users, Copy, Download } from 'lucide-react'

interface TipCalculation {
  billAmount: number
  tipPercentage: number
  tipAmount: number
  totalAmount: number
  perPerson: number
  tipPerPerson: number
  totalPerPerson: number
}

interface CalculationHistory {
  id: string
  billAmount: number
  tipPercentage: number
  people: number
  result: TipCalculation
  timestamp: Date
}

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState<string>('100')
  const [tipPercentage, setTipPercentage] = useState<string>('15')
  const [people, setPeople] = useState<string>('1')
  const [customTip, setCustomTip] = useState<string>('')
  const [calculation, setCalculation] = useState<TipCalculation | null>(null)
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([])

  const quickTipPercentages = [10, 15, 18, 20, 25]

  const calculateTip = () => {
    const bill = parseFloat(billAmount)
    const tip = customTip ? parseFloat(customTip) : parseFloat(tipPercentage)
    const numPeople = parseInt(people)

    if (isNaN(bill) || isNaN(tip) || isNaN(numPeople) || bill <= 0 || tip < 0 || numPeople <= 0) {
      return
    }

    const tipAmount = bill * (tip / 100)
    const totalAmount = bill + tipAmount
    const perPerson = totalAmount / numPeople
    const tipPerPerson = tipAmount / numPeople
    const totalPerPerson = perPerson

    const result: TipCalculation = {
      billAmount: bill,
      tipPercentage: tip,
      tipAmount,
      totalAmount,
      perPerson,
      tipPerPerson,
      totalPerPerson
    }

    setCalculation(result)

    // Add to history
    const historyItem: CalculationHistory = {
      id: Date.now().toString(),
      billAmount: bill,
      tipPercentage: tip,
      people: numPeople,
      result,
      timestamp: new Date()
    }
    
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const setQuickTip = (percentage: number) => {
    setTipPercentage(percentage.toString())
    setCustomTip('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Bill Amount', 'Tip %', 'People', 'Tip Amount', 'Total', 'Per Person'],
      ...calculationHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.billAmount.toFixed(2),
        item.tipPercentage.toFixed(1) + '%',
        item.people.toString(),
        item.result.tipAmount.toFixed(2),
        item.result.totalAmount.toFixed(2),
        item.result.perPerson.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tip-calculator-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    calculateTip()
  }, [billAmount, tipPercentage, people, customTip])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getTipSuggestion = (service: string) => {
    const suggestions: Record<string, number> = {
      'excellent': 20,
      'good': 18,
      'average': 15,
      'poor': 10,
      'delivery': 15,
      'takeout': 10,
      'bar': 15,
      'haircut': 20,
      'taxi': 15,
      'hotel': 20
    }
    return suggestions[service] || 15
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tip Calculator</h1>
        <p className="text-muted-foreground">Calculate tips and split bills with ease</p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Bill Details
                </CardTitle>
                <CardDescription>
                  Enter your bill information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billAmount">Bill Amount</Label>
                  <Input
                    id="billAmount"
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="people">Number of People</Label>
                  <Input
                    id="people"
                    type="number"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    placeholder="1"
                    min="1"
                    step="1"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Tip Percentage</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {quickTipPercentages.map((percentage) => (
                      <Button
                        key={percentage}
                        variant={tipPercentage === percentage.toString() && !customTip ? "default" : "outline"}
                        size="sm"
                        onClick={() => setQuickTip(percentage)}
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Custom %"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={() => setCustomTip('')}>
                      Clear
                    </Button>
                  </div>
                </div>

                <Button onClick={calculateTip} className="w-full">
                  Calculate Tip
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Breakdown
                </CardTitle>
                <CardDescription>
                  Your tip calculation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calculation ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(calculation.totalAmount)}
                      </div>
                      <div className="text-muted-foreground">Total Amount</div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Bill Amount:</span>
                        <span className="font-medium">{formatCurrency(calculation.billAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tip ({calculation.tipPercentage}%):</span>
                        <span className="font-medium">{formatCurrency(calculation.tipAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(calculation.totalAmount)}</span>
                      </div>
                    </div>

                    {parseInt(people) > 1 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">Per Person ({people} people)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bill per person:</span>
                            <span>{formatCurrency(calculation.billAmount / parseInt(people))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tip per person:</span>
                            <span>{formatCurrency(calculation.tipPerPerson)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total per person:</span>
                            <span>{formatCurrency(calculation.totalPerPerson)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(
                        `Total: ${formatCurrency(calculation.totalAmount)}\n` +
                        `Tip: ${formatCurrency(calculation.tipAmount)} (${calculation.tipPercentage}%)\n` +
                        (parseInt(people) > 1 ? `Per person: ${formatCurrency(calculation.totalPerPerson)}` : '')
                      )}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Results
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter bill details to calculate
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tip Guidelines by Service</CardTitle>
              <CardDescription>
                Recommended tip percentages for different services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { service: 'Restaurant', type: 'good' },
                  { service: 'Delivery', type: 'delivery' },
                  { service: 'Takeout', type: 'takeout' },
                  { service: 'Bar', type: 'bar' },
                  { service: 'Haircut', type: 'haircut' },
                  { service: 'Taxi', type: 'taxi' },
                  { service: 'Hotel', type: 'hotel' },
                  { service: 'Excellent Service', type: 'excellent' },
                  { service: 'Average Service', type: 'average' },
                  { service: 'Poor Service', type: 'poor' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setQuickTip(getTipSuggestion(item.type))}
                  >
                    <div className="font-medium text-sm">{item.service}</div>
                    <div className="text-lg font-bold text-primary">
                      {getTipSuggestion(item.type)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tip Math</CardTitle>
              <CardDescription>
                Mental math shortcuts for calculating tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">10% Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Move decimal point one place left<br/>
                    Example: $45.00 → $4.50
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">15% Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Calculate 10%, then add half<br/>
                    Example: $45.00 → $4.50 + $2.25 = $6.75
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">20% Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Double the 10% amount<br/>
                    Example: $45.00 → $4.50 × 2 = $9.00
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">25% Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Divide by 4<br/>
                    Example: $45.00 ÷ 4 = $11.25
                  </p>
                </div>
              </div>
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
                Your recent tip calculations
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
                          {formatCurrency(item.billAmount)} with {item.tipPercentage}% tip
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.people} {item.people === 1 ? 'person' : 'people'} • {formatCurrency(item.result.totalAmount)} total
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {formatCurrency(item.result.perPerson)} per person
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