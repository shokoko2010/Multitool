'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Percent, Calculator, RotateCcw } from 'lucide-react'

export default function PercentageCalculator() {
  const [activeTab, setActiveTab] = useState('what-percentage')
  
  // What is X% of Y?
  const [percentage, setPercentage] = useState('')
  const [ofValue, setOfValue] = useState('')
  const [whatPercentageResult, setWhatPercentageResult] = useState('')

  // X is what percentage of Y?
  const [isValue, setIsValue] = useState('')
  const [ofWhatValue, setOfWhatValue] = useState('')
  const [isWhatPercentageResult, setIsWhatPercentageResult] = useState('')

  // Percentage increase/decrease
  const [originalValue, setOriginalValue] = useState('')
  const [newPercentage, setNewPercentage] = useState('')
  const [increaseResult, setIncreaseResult] = useState('')
  const [decreaseResult, setDecreaseResult] = useState('')

  const calculateWhatPercentage = () => {
    if (!percentage || !ofValue) return

    const pct = parseFloat(percentage)
    const ofVal = parseFloat(ofValue)

    if (isNaN(pct) || isNaN(ofVal)) return

    const result = (pct / 100) * ofVal
    setWhatPercentageResult(result.toString())
  }

  const calculateIsWhatPercentage = () => {
    if (!isValue || !ofWhatValue) return

    const isVal = parseFloat(isValue)
    const ofWhatVal = parseFloat(ofWhatValue)

    if (isNaN(isVal) || isNaN(ofWhatVal) || ofWhatVal === 0) return

    const result = (isVal / ofWhatVal) * 100
    setIsWhatPercentageResult(result.toString())
  }

  const calculateIncreaseDecrease = () => {
    if (!originalValue || !newPercentage) return

    const origVal = parseFloat(originalValue)
    const newPct = parseFloat(newPercentage)

    if (isNaN(origVal) || isNaN(newPct)) return

    const increaseResult = origVal + (origVal * newPct / 100)
    const decreaseResult = origVal - (origVal * newPct / 100)

    setIncreaseResult(increaseResult.toString())
    setDecreaseResult(decreaseResult.toString())
  }

  const clearAll = () => {
    setPercentage('')
    setOfValue('')
    setWhatPercentageResult('')
    setIsValue('')
    setOfWhatValue('')
    setIsWhatPercentageResult('')
    setOriginalValue('')
    setNewPercentage('')
    setIncreaseResult('')
    setDecreaseResult('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Percent className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Percentage Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate percentages, percentage changes, and more
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="what-percentage">What is X% of Y?</TabsTrigger>
            <TabsTrigger value="is-what-percentage">X is what % of Y?</TabsTrigger>
            <TabsTrigger value="increase-decrease">Increase/Decrease</TabsTrigger>
          </TabsList>

          <TabsContent value="what-percentage">
            <Card>
              <CardHeader>
                <CardTitle>What is X% of Y?</CardTitle>
                <CardDescription>
                  Calculate the percentage of a number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Percentage (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      placeholder="Enter percentage"
                      step="any"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ofValue">Of Value</Label>
                    <Input
                      id="ofValue"
                      type="number"
                      value={ofValue}
                      onChange={(e) => setOfValue(e.target.value)}
                      placeholder="Enter value"
                      step="any"
                    />
                  </div>
                </div>

                <Button onClick={calculateWhatPercentage} disabled={!percentage || !ofValue}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </Button>

                {whatPercentageResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Result</h4>
                    <p className="text-lg">
                      {percentage}% of {ofValue} = <span className="font-bold text-primary">{whatPercentageResult}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Formula</h4>
                  <p className="text-sm text-muted-foreground">
                    Result = (Percentage ÷ 100) × Value
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Result = ({percentage} ÷ 100) × {ofValue} = {whatPercentageResult}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="is-what-percentage">
            <Card>
              <CardHeader>
                <CardTitle>X is what percentage of Y?</CardTitle>
                <CardDescription>
                  Find what percentage one number is of another
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isValue">Is Value</Label>
                    <Input
                      id="isValue"
                      type="number"
                      value={isValue}
                      onChange={(e) => setIsValue(e.target.value)}
                      placeholder="Enter value"
                      step="any"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ofWhatValue">Of What Value</Label>
                    <Input
                      id="ofWhatValue"
                      type="number"
                      value={ofWhatValue}
                      onChange={(e) => setOfWhatValue(e.target.value)}
                      placeholder="Enter value"
                      step="any"
                    />
                  </div>
                </div>

                <Button onClick={calculateIsWhatPercentage} disabled={!isValue || !ofWhatValue}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </Button>

                {isWhatPercentageResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Result</h4>
                    <p className="text-lg">
                      {isValue} is <span className="font-bold text-primary">{isWhatPercentageResult}%</span> of {ofWhatValue}
                    </p>
                  </div>
                )}

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Formula</h4>
                  <p className="text-sm text-muted-foreground">
                    Percentage = (Value ÷ Total Value) × 100
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Percentage = ({isValue} ÷ {ofWhatValue}) × 100 = {isWhatPercentageResult}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="increase-decrease">
            <Card>
              <CardHeader>
                <CardTitle>Percentage Increase/Decrease</CardTitle>
                <CardDescription>
                  Calculate values after percentage increase or decrease
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalValue">Original Value</Label>
                    <Input
                      id="originalValue"
                      type="number"
                      value={originalValue}
                      onChange={(e) => setOriginalValue(e.target.value)}
                      placeholder="Enter original value"
                      step="any"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPercentage">Percentage (%)</Label>
                    <Input
                      id="newPercentage"
                      type="number"
                      value={newPercentage}
                      onChange={(e) => setNewPercentage(e.target.value)}
                      placeholder="Enter percentage"
                      step="any"
                    />
                  </div>
                </div>

                <Button onClick={calculateIncreaseDecrease} disabled={!originalValue || !newPercentage}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </Button>

                {(increaseResult || decreaseResult) && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Results</h4>
                      <p className="text-lg">
                        After {newPercentage}% increase: <span className="font-bold text-green-600">{increaseResult}</span>
                      </p>
                      <p className="text-lg">
                        After {newPercentage}% decrease: <span className="font-bold text-red-600">{decreaseResult}</span>
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Formulas</h4>
                      <p className="text-sm text-muted-foreground">
                        Increase: New Value = Original + (Original × Percentage ÷ 100)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Decrease: New Value = Original - (Original × Percentage ÷ 100)
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Common Percentage Calculations</CardTitle>
            <CardDescription>
              Quick reference for common percentage calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div><strong>Common Percentages:</strong></div>
                <div>• 10% = 0.10</div>
                <div>• 25% = 0.25</div>
                <div>• 50% = 0.50</div>
                <div>• 75% = 0.75</div>
                <div>• 100% = 1.00</div>
              </div>
              <div>
                <div><strong>Tips:</strong></div>
                <div>• To find 10%, divide by 10</div>
                <div>• To find 25%, divide by 4</div>
                <div>• To find 50%, divide by 2</div>
                <div>• To find 20%, divide by 5</div>
                <div>• To find 5%, divide by 20</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}