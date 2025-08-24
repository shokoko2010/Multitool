'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Percent, Calculator, Copy, Download, TrendingUp, TrendingDown } from 'lucide-react'

interface PercentageCalculation {
  result: number
  formula: string
  explanation: string
}

interface CalculationHistory {
  id: string
  type: string
  inputs: { [key: string]: number }
  result: number
  timestamp: Date
}

export default function PercentageCalculator() {
  const [calculationType, setCalculationType] = useState<string>('find-percentage')
  const [inputs, setInputs] = useState<{ [key: string]: string }>({
    value: '',
    total: '',
    percentage: '',
    part: '',
    whole: '',
    original: '',
    change: '',
    new: ''
  })
  const [result, setResult] = useState<PercentageCalculation | null>(null)
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([])

  const calculate = () => {
    let calcResult: PercentageCalculation | null = null
    let historyInputs: { [key: string]: number } = {}

    switch (calculationType) {
      case 'find-percentage':
        const value = parseFloat(inputs.value)
        const total = parseFloat(inputs.total)
        if (!isNaN(value) && !isNaN(total) && total !== 0) {
          const percentage = (value / total) * 100
          calcResult = {
            result: percentage,
            formula: `(value ÷ total) × 100`,
            explanation: `${value} is ${percentage.toFixed(2)}% of ${total}`
          }
          historyInputs = { value, total }
        }
        break

      case 'find-value':
        const percentage2 = parseFloat(inputs.percentage)
        const total2 = parseFloat(inputs.total)
        if (!isNaN(percentage2) && !isNaN(total2)) {
          const value2 = (percentage2 / 100) * total2
          calcResult = {
            result: value2,
            formula: `(percentage ÷ 100) × total`,
            explanation: `${percentage2}% of ${total2} is ${value2.toFixed(2)}`
          }
          historyInputs = { percentage: percentage2, total: total2 }
        }
        break

      case 'percentage-change':
        const original = parseFloat(inputs.original)
        const newValue = parseFloat(inputs.new)
        if (!isNaN(original) && !isNaN(newValue) && original !== 0) {
          const change = ((newValue - original) / original) * 100
          calcResult = {
            result: change,
            formula: `((new - original) ÷ original) × 100`,
            explanation: `Change from ${original} to ${newValue} is ${change.toFixed(2)}%`
          }
          historyInputs = { original, new: newValue }
        }
        break

      case 'percentage-difference':
        const value1 = parseFloat(inputs.part)
        const value2 = parseFloat(inputs.whole)
        if (!isNaN(value1) && !isNaN(value2) && (value1 + value2) !== 0) {
          const difference = Math.abs(value1 - value2)
          const average = (value1 + value2) / 2
          const percentageDiff = (difference / average) * 100
          calcResult = {
            result: percentageDiff,
            formula: `(|value1 - value2| ÷ ((value1 + value2) ÷ 2)) × 100`,
            explanation: `Percentage difference between ${value1} and ${value2} is ${percentageDiff.toFixed(2)}%`
          }
          historyInputs = { part: value1, whole: value2 }
        }
        break

      case 'increase-decrease':
        const original2 = parseFloat(inputs.original)
        const change2 = parseFloat(inputs.change)
        if (!isNaN(original2) && !isNaN(change2)) {
          const result2 = original2 + (original2 * change2 / 100)
          calcResult = {
            result: result2,
            formula: `original + (original × change ÷ 100)`,
            explanation: `${original2} ${change2 >= 0 ? 'increased' : 'decreased'} by ${Math.abs(change2)}% is ${result2.toFixed(2)}`
          }
          historyInputs = { original: original2, change: change2 }
        }
        break
    }

    setResult(calcResult)

    if (calcResult) {
      const historyItem: CalculationHistory = {
        id: Date.now().toString(),
        type: calculationType,
        inputs: historyInputs,
        result: calcResult.result,
        timestamp: new Date()
      }
      
      setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)])
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Type', 'Inputs', 'Result'],
      ...calculationHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.type,
        Object.entries(item.inputs).map(([key, value]) => `${key}: ${value}`).join(', '),
        item.result.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `percentage-calculator-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearInputs = () => {
    setInputs({
      value: '',
      total: '',
      percentage: '',
      part: '',
      whole: '',
      original: '',
      change: '',
      new: ''
    })
    setResult(null)
  }

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    calculate()
  }, [inputs, calculationType])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getCalculationTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      'find-percentage': 'Find Percentage',
      'find-value': 'Find Value',
      'percentage-change': 'Percentage Change',
      'percentage-difference': 'Percentage Difference',
      'increase-decrease': 'Increase/Decrease'
    }
    return names[type] || type
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Percentage Calculator</h1>
        <p className="text-muted-foreground">Calculate percentages, percentage changes, and more</p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Percentage Calculator
              </CardTitle>
              <CardDescription>
                Select calculation type and enter values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calculation Type</Label>
                  <select
                    value={calculationType}
                    onChange={(e) => setCalculationType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="find-percentage">What percentage is X of Y?</option>
                    <option value="find-value">What is X% of Y?</option>
                    <option value="percentage-change">Percentage change from X to Y</option>
                    <option value="percentage-difference">Percentage difference between X and Y</option>
                    <option value="increase-decrease">Increase/Decrease X by Y%</option>
                  </select>
                </div>
              </div>

              <Separator />

              {calculationType === 'find-percentage' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">What percentage is X of Y?</h3>
                    <p className="text-sm text-muted-foreground">Calculate what percentage one number is of another</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="value">Value (X)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={inputs.value}
                        onChange={(e) => handleInputChange('value', e.target.value)}
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total">Total (Y)</Label>
                      <Input
                        id="total"
                        type="number"
                        value={inputs.total}
                        onChange={(e) => handleInputChange('total', e.target.value)}
                        placeholder="Enter total"
                      />
                    </div>
                  </div>
                </div>
              )}

              {calculationType === 'find-value' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">What is X% of Y?</h3>
                    <p className="text-sm text-muted-foreground">Calculate the value of a percentage</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Percentage (X)</Label>
                      <Input
                        id="percentage"
                        type="number"
                        value={inputs.percentage}
                        onChange={(e) => handleInputChange('percentage', e.target.value)}
                        placeholder="Enter percentage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total2">Total (Y)</Label>
                      <Input
                        id="total2"
                        type="number"
                        value={inputs.total}
                        onChange={(e) => handleInputChange('total', e.target.value)}
                        placeholder="Enter total"
                      />
                    </div>
                  </div>
                </div>
              )}

              {calculationType === 'percentage-change' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Percentage Change</h3>
                    <p className="text-sm text-muted-foreground">Calculate percentage change from original to new value</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="original">Original Value</Label>
                      <Input
                        id="original"
                        type="number"
                        value={inputs.original}
                        onChange={(e) => handleInputChange('original', e.target.value)}
                        placeholder="Enter original value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">New Value</Label>
                      <Input
                        id="new"
                        type="number"
                        value={inputs.new}
                        onChange={(e) => handleInputChange('new', e.target.value)}
                        placeholder="Enter new value"
                      />
                    </div>
                  </div>
                </div>
              )}

              {calculationType === 'percentage-difference' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Percentage Difference</h3>
                    <p className="text-sm text-muted-foreground">Calculate percentage difference between two values</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="part">Value 1</Label>
                      <Input
                        id="part"
                        type="number"
                        value={inputs.part}
                        onChange={(e) => handleInputChange('part', e.target.value)}
                        placeholder="Enter first value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whole">Value 2</Label>
                      <Input
                        id="whole"
                        type="number"
                        value={inputs.whole}
                        onChange={(e) => handleInputChange('whole', e.target.value)}
                        placeholder="Enter second value"
                      />
                    </div>
                  </div>
                </div>
              )}

              {calculationType === 'increase-decrease' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Increase/Decrease by Percentage</h3>
                    <p className="text-sm text-muted-foreground">Calculate value after percentage increase or decrease</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="original2">Original Value</Label>
                      <Input
                        id="original2"
                        type="number"
                        value={inputs.original}
                        onChange={(e) => handleInputChange('original', e.target.value)}
                        placeholder="Enter original value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="change">Percentage Change</Label>
                      <Input
                        id="change"
                        type="number"
                        value={inputs.change}
                        onChange={(e) => handleInputChange('change', e.target.value)}
                        placeholder="Enter percentage (use negative for decrease)"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={calculate} className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                <Button variant="outline" onClick={clearInputs}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  Your calculation result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {result.result.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {result.explanation}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Formula:</span>
                    <Badge variant="outline">{result.formula}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <Badge variant="outline">{getCalculationTypeName(calculationType)}</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(
                      `${result.result.toFixed(2)}% - ${result.explanation}`
                    )}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Common Percentage Calculations</CardTitle>
              <CardDescription>
                Quick reference for common percentage calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-medium">Tips</div>
                  <div className="text-sm text-muted-foreground">
                    • 10% = divide by 10<br/>
                    • 25% = divide by 4<br/>
                    • 50% = divide by 2<br/>
                    • 75% = multiply by 0.75<br/>
                    • 100% = same value
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Common Uses</div>
                  <div className="text-sm text-muted-foreground">
                    • Sales tax calculations<br/>
                    • Discount percentages<br/>
                    • Interest rates<br/>
                    • Grade calculations<br/>
                    • Statistics and data
                  </div>
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
                Your recent percentage calculations
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
                          {getCalculationTypeName(item.type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Object.entries(item.inputs).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {item.result.toFixed(2)}%
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