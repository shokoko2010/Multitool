'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GeneratedNumber {
  value: number
  timestamp: Date
  range: [number, number]
}

export default function RandomNumberGeneratorTool() {
  const [min, setMin] = useState([1])
  const [max, setMax] = useState([100])
  const [count, setCount] = useState([1])
  const [generatedNumbers, setGeneratedNumbers] = useState<GeneratedNumber[]>([])
  const [allowDuplicates, setAllowDuplicates] = useState(true)
  const [decimalPlaces, setDecimalPlaces] = useState([0])
  const [distribution, setDistribution] = useState('uniform')
  const [history, setHistory] = useState<GeneratedNumber[]>([])
  const { toast } = useToast()

  const generateRandomNumber = useCallback((minVal: number, maxVal: number, decimals: number): number => {
    const range = maxVal - minVal
    const randomValue = Math.random() * range + minVal
    return Number(randomValue.toFixed(decimals))
  }, [])

  const generateMultipleNumbers = useCallback(() => {
    const minVal = min[0]
    const maxVal = max[0]
    const countVal = count[0]
    const decimals = decimalPlaces[0]
    
    if (minVal >= maxVal) {
      toast({
        title: "Invalid Range",
        description: "Minimum value must be less than maximum value",
        variant: "destructive"
      })
      return
    }

    const newNumbers: GeneratedNumber[] = []
    const usedNumbers = new Set<number>()

    for (let i = 0; i < countVal; i++) {
      let randomNum: number
      
      if (distribution === 'normal') {
        // Box-Muller transform for normal distribution
        const u1 = Math.random()
        const u2 = Math.random()
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        randomNum = Number(((z0 + 5) / 10 * (maxVal - minVal) + minVal).toFixed(decimals))
        
        // Clamp to range
        randomNum = Math.max(minVal, Math.min(maxVal, randomNum))
      } else {
        randomNum = generateRandomNumber(minVal, maxVal, decimals)
      }

      if (!allowDuplicates && usedNumbers.has(randomNum)) {
        i-- // Try again for unique number
        continue
      }

      usedNumbers.add(randomNum)
      newNumbers.push({
        value: randomNum,
        timestamp: new Date(),
        range: [minVal, maxVal]
      })
    }

    setGeneratedNumbers(newNumbers)
    setHistory(prev => [...newNumbers, ...prev.slice(0, 19)]) // Keep last 20
  }, [min, max, count, allowDuplicates, decimalPlaces, distribution, generateRandomNumber, toast])

  const generateDiceRoll = () => {
    const sides = [4, 6, 8, 10, 12, 20]
    const randomSide = sides[Math.floor(Math.random() * sides.length)]
    const result = Math.floor(Math.random() * randomSide) + 1
    
    const newNumber: GeneratedNumber = {
      value: result,
      timestamp: new Date(),
      range: [1, randomSide]
    }

    setGeneratedNumbers([newNumber])
    setHistory(prev => [newNumber, ...prev.slice(0, 19)])
  }

  const generateCoinFlip = () => {
    const result = Math.random() < 0.5 ? 0 : 1 // 0 = Heads, 1 = Tails
    
    const newNumber: GeneratedNumber = {
      value: result,
      timestamp: new Date(),
      range: [0, 1]
    }

    setGeneratedNumbers([newNumber])
    setHistory(prev => [newNumber, ...prev.slice(0, 19)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Number has been copied to clipboard",
    })
  }

  const copyAllNumbers = () => {
    const numbersText = generatedNumbers.map(num => num.value.toString()).join(', ')
    copyToClipboard(numbersText)
  }

  const clearAll = () => {
    setGeneratedNumbers([])
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const getDiceIcon = (sides: number) => {
    switch (sides) {
      case 4: return <Dice1 className="h-6 w-6" />
      case 6: return <Dice2 className="h-6 w-6" />
      case 8: return <Dice3 className="h-6 w-6" />
      case 10: return <Dice4 className="h-6 w-6" />
      case 12: return <Dice5 className="h-6 w-6" />
      case 20: return <Dice6 className="h-6 w-6" />
      default: return <Dice1 className="h-6 w-6" />
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dice1 className="h-6 w-6" />
            Random Number Generator
          </CardTitle>
          <CardDescription>
            Generate random numbers with customizable ranges and distributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Tabs defaultValue="custom" className="w-full">
              <TabsList>
                <TabsTrigger value="custom">Custom Range</TabsTrigger>
                <TabsTrigger value="dice">Dice Roll</TabsTrigger>
                <TabsTrigger value="coin">Coin Flip</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="custom" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Minimum Value: {min[0]}</Label>
                      <Slider
                        value={min}
                        onValueChange={setMin}
                        max={1000}
                        min={-1000}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Value: {max[0]}</Label>
                      <Slider
                        value={max}
                        onValueChange={setMax}
                        max={1000}
                        min={-1000}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Count: {count[0]}</Label>
                      <Slider
                        value={count}
                        onValueChange={setCount}
                        max={100}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Decimal Places: {decimalPlaces[0]}</Label>
                      <Slider
                        value={decimalPlaces}
                        onValueChange={setDecimalPlaces}
                        max={10}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Distribution:</Label>
                      <Select value={distribution} onValueChange={setDistribution}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uniform">Uniform Distribution</SelectItem>
                          <SelectItem value="normal">Normal Distribution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow-duplicates"
                        checked={allowDuplicates}
                        onCheckedChange={(checked) => setAllowDuplicates(checked as boolean)}
                      />
                      <Label htmlFor="allow-duplicates" className="text-sm">
                        Allow Duplicate Numbers
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button onClick={generateMultipleNumbers} className="w-full">
                      Generate Numbers
                    </Button>
                    <Button variant="outline" onClick={clearAll} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Results
                    </Button>
                  </div>
                </div>

                {/* Generated Numbers */}
                {generatedNumbers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Generated Numbers</CardTitle>
                        <Button variant="outline" size="sm" onClick={copyAllNumbers}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {generatedNumbers.map((num, index) => (
                          <div
                            key={index}
                            className="p-4 bg-muted rounded-lg text-center cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={() => copyToClipboard(num.value.toString())}
                          >
                            <div className="text-2xl font-bold">{num.value}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(num.timestamp)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="dice" className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">
                    {generatedNumbers.length > 0 ? getDiceIcon(generatedNumbers[0].range[1]) : '🎲'}
                  </div>
                  
                  {generatedNumbers.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">{generatedNumbers[0].value}</div>
                      <div className="text-sm text-muted-foreground">
                        d{generatedNumbers[0].range[1]} rolled at {formatDate(generatedNumbers[0].timestamp)}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <Button onClick={generateDiceRoll}>
                      Roll Dice
                    </Button>
                    {generatedNumbers.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(generatedNumbers[0].value.toString())}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dice Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {[4, 6, 8, 10, 12, 20].map((sides) => (
                        <div key={sides} className="text-center space-y-2">
                          <div className="text-2xl">{getDiceIcon(sides)}</div>
                          <div className="font-medium">d{sides}</div>
                          <div className="text-sm text-muted-foreground">
                            1-{sides}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coin" className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">
                    {generatedNumbers.length > 0 ? (generatedNumbers[0].value === 0 ? '🪙' : '🪙') : '🪙'}
                  </div>
                  
                  {generatedNumbers.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">
                        {generatedNumbers[0].value === 0 ? 'Heads' : 'Tails'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Flipped at {formatDate(generatedNumbers[0].timestamp)}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <Button onClick={generateCoinFlip}>
                      Flip Coin
                    </Button>
                    {generatedNumbers.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(generatedNumbers[0].value === 0 ? 'Heads' : 'Tails')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About Coin Flips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Probability:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Heads: 50% chance</li>
                          <li>• Tails: 50% chance</li>
                          <li>• Edge: ~0.0001% chance</li>
                          <li>• Each flip is independent</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Uses:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Decision making</li>
                          <li>• Games of chance</li>
                          <li>• Random selections</li>
                          <li>• Probability demonstrations</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generation History</CardTitle>
                    <CardDescription className="text-sm">
                      Last 20 generated numbers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {history.length > 0 ? (
                        history.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded cursor-pointer hover:bg-muted/80"
                               onClick={() => copyToClipboard(item.value.toString())}>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{item.value}</Badge>
                              <div className="text-sm text-muted-foreground">
                                Range: {item.range[0]} - {item.range[1]}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(item.timestamp)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No numbers generated yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Statistics */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{history.length}</div>
                      <div className="text-sm text-muted-foreground">Total Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(history.reduce((sum, item) => sum + item.value, 0) / history.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.min(...history.map(item => item.value))}
                      </div>
                      <div className="text-sm text-muted-foreground">Minimum Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.max(...history.map(item => item.value))}
                      </div>
                      <div className="text-sm text-muted-foreground">Maximum Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use Custom Range to generate numbers within specific bounds</li>
                <li>• Adjust decimal places for floating-point precision</li>
                <li>• Choose between uniform and normal distribution</li>
                <li>• Generate multiple numbers at once</li>
                <li>• Use Dice Roll for traditional dice rolling</li>
                <li>• Use Coin Flip for simple binary choices</li>
                <li>• View generation history and statistics</li>
                <li>• Click any number to copy it to clipboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}