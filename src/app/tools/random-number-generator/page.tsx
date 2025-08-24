'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dice1, Copy, Download, RefreshCw, Hash } from 'lucide-react'

interface RandomNumber {
  value: number
  timestamp: Date
  min: number
  max: number
}

interface RandomGenerationHistory {
  id: string
  type: string
  result: number | number[]
  settings: { [key: string]: any }
  timestamp: Date
}

export default function RandomNumberGenerator() {
  const [minValue, setMinValue] = useState<string>('1')
  const [maxValue, setMaxValue] = useState<string>('100')
  const [count, setCount] = useState<string>('1')
  const [decimalPlaces, setDecimalPlaces] = useState<string>('0')
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true)
  const [currentNumber, setCurrentNumber] = useState<RandomNumber | null>(null)
  const [multipleNumbers, setMultipleNumbers] = useState<number[]>([])
  const [generationHistory, setGenerationHistory] = useState<RandomGenerationHistory[]>([])

  const generateRandomNumber = () => {
    const min = parseFloat(minValue)
    const max = parseFloat(maxValue)
    const decimals = parseInt(decimalPlaces)

    if (isNaN(min) || isNaN(max) || isNaN(decimals) || min >= max) {
      return
    }

    const randomValue = Math.random() * (max - min) + min
    const roundedValue = decimals > 0 ? 
      parseFloat(randomValue.toFixed(decimals)) : 
      Math.round(randomValue)

    const result: RandomNumber = {
      value: roundedValue,
      timestamp: new Date(),
      min,
      max
    }

    setCurrentNumber(result)

    // Add to history
    const historyItem: RandomGenerationHistory = {
      id: Date.now().toString(),
      type: 'single',
      result: roundedValue,
      settings: { min, max, decimals },
      timestamp: new Date()
    }
    
    setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const generateMultipleNumbers = () => {
    const min = parseFloat(minValue)
    const max = parseFloat(maxValue)
    const decimals = parseInt(decimalPlaces)
    const numCount = parseInt(count)

    if (isNaN(min) || isNaN(max) || isNaN(decimals) || isNaN(numCount) || 
        min >= max || numCount <= 0 || numCount > 1000) {
      return
    }

    const numbers: number[] = []
    const usedNumbers = new Set<number>()

    for (let i = 0; i < numCount; i++) {
      let randomValue: number
      let attempts = 0
      const maxAttempts = 1000

      do {
        randomValue = Math.random() * (max - min) + min
        randomValue = decimals > 0 ? 
          parseFloat(randomValue.toFixed(decimals)) : 
          Math.round(randomValue)
        attempts++
      } while (!allowDuplicates && usedNumbers.has(randomValue) && attempts < maxAttempts)

      if (attempts >= maxAttempts) {
        // Cannot generate more unique numbers in the range
        break
      }

      numbers.push(randomValue)
      usedNumbers.add(randomValue)
    }

    setMultipleNumbers(numbers)

    // Add to history
    const historyItem: RandomGenerationHistory = {
      id: Date.now().toString(),
      type: 'multiple',
      result: numbers,
      settings: { min, max, decimals, count: numCount, allowDuplicates },
      timestamp: new Date()
    }
    
    setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const generateDiceRoll = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1
    
    const historyItem: RandomGenerationHistory = {
      id: Date.now().toString(),
      type: 'dice',
      result: result,
      settings: { sides },
      timestamp: new Date()
    }
    
    setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)])
    
    return result
  }

  const generateCoinFlip = () => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails'
    
    const historyItem: RandomGenerationHistory = {
      id: Date.now().toString(),
      type: 'coin',
      result: result,
      settings: { type: 'coin' },
      timestamp: new Date()
    }
    
    setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)])
    
    return result
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Type', 'Result', 'Settings'],
      ...generationHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.type,
        Array.isArray(item.result) ? item.result.join(', ') : item.result.toString(),
        Object.entries(item.settings).map(([key, value]) => `${key}: ${value}`).join('; ')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `random-generator-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportNumbers = () => {
    if (multipleNumbers.length === 0) return

    const csvContent = [
      ['Index', 'Random Number'],
      ...multipleNumbers.map((num, index) => [index.toString(), num.toString()])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `random-numbers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setCurrentNumber(null)
    setMultipleNumbers([])
  }

  useEffect(() => {
    generateRandomNumber()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Random Number Generator</h1>
        <p className="text-muted-foreground">Generate random numbers, dice rolls, and more</p>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Number Generator</TabsTrigger>
          <TabsTrigger value="games">Dice & Coin</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Generator Settings
                </CardTitle>
                <CardDescription>
                  Configure your random number generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minValue">Minimum Value</Label>
                    <Input
                      id="minValue"
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxValue">Maximum Value</Label>
                    <Input
                      id="maxValue"
                      type="number"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimalPlaces">Decimal Places</Label>
                    <Input
                      id="decimalPlaces"
                      type="number"
                      value={decimalPlaces}
                      onChange={(e) => setDecimalPlaces(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count">Count (for multiple)</Label>
                    <Input
                      id="count"
                      type="number"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      placeholder="1"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowDuplicates"
                    checked={allowDuplicates}
                    onChange={(e) => setAllowDuplicates(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="allowDuplicates">Allow duplicates</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateRandomNumber} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Single
                  </Button>
                  <Button onClick={generateMultipleNumbers} variant="outline" className="flex-1">
                    Generate Multiple
                  </Button>
                </div>

                <Button variant="outline" onClick={clearAll} className="w-full">
                  Clear Results
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Your generated random numbers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentNumber && (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {formatNumber(currentNumber.value)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Range: {formatNumber(currentNumber.min)} - {formatNumber(currentNumber.max)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Generated: {currentNumber.timestamp.toLocaleTimeString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(currentNumber.value.toString())}
                      className="mt-2"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}

                {multipleNumbers.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Multiple Numbers ({multipleNumbers.length})</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportNumbers}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded p-2">
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-sm">
                        {multipleNumbers.map((num, index) => (
                          <div key={index} className="text-center p-1 bg-muted rounded">
                            {formatNumber(num)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sum: {formatNumber(multipleNumbers.reduce((a, b) => a + b, 0))} | 
                      Average: {formatNumber(multipleNumbers.reduce((a, b) => a + b, 0) / multipleNumbers.length)}
                    </div>
                  </div>
                )}

                {!currentNumber && multipleNumbers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Generate random numbers to see results here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Presets</CardTitle>
              <CardDescription>
                Common random number generation presets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMinValue('1')
                    setMaxValue('6')
                    setDecimalPlaces('0')
                    generateRandomNumber()
                  }}
                >
                  D6 (1-6)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMinValue('1')
                    setMaxValue('100')
                    setDecimalPlaces('0')
                    generateRandomNumber()
                  }}
                >
                  1-100
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMinValue('0')
                    setMaxValue('1')
                    setDecimalPlaces('2')
                    generateRandomNumber()
                  }}
                >
                  0.00-1.00
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMinValue('0000')
                    setMaxValue('9999')
                    setDecimalPlaces('0')
                    generateRandomNumber()
                  }}
                >
                  PIN (4-digit)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dice1 className="h-5 w-5" />
                  Dice Roller
                </CardTitle>
                <CardDescription>
                  Roll virtual dice of different sizes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => generateDiceRoll(4)}
                  >
                    D4
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateDiceRoll(6)}
                  >
                    D6
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateDiceRoll(8)}
                  >
                    D8
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateDiceRoll(10)}
                  >
                    D10
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateDiceRoll(12)}
                  >
                    D12
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateDiceRoll(20)}
                  >
                    D20
                  </Button>
                </div>

                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Last Roll</div>
                  <div className="text-2xl font-bold">
                    {generationHistory.find(h => h.type === 'dice')?.result || '-'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coin Flip</CardTitle>
                <CardDescription>
                  Flip a virtual coin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  size="lg"
                  onClick={generateCoinFlip}
                  className="w-full h-20 text-lg"
                >
                  Flip Coin
                </Button>

                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Last Flip</div>
                  <div className="text-2xl font-bold">
                    {generationHistory.find(h => h.type === 'coin')?.result || '-'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generation History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHistory}
                  disabled={generationHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Your recent random number generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generationHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No generation history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generationHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.type === 'single' && 'Single Number'}
                          {item.type === 'multiple' && `Multiple Numbers (${Array.isArray(item.result) ? item.result.length : 0})`}
                          {item.type === 'dice' && `Dice Roll (D${item.settings.sides})`}
                          {item.type === 'coin' && 'Coin Flip'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(item.result) ? 
                            item.result.slice(0, 5).join(', ') + (item.result.length > 5 ? '...' : '') : 
                            item.result.toString()
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {item.type}
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