'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dice1, Copy, RotateCcw } from 'lucide-react'

export default function RandomNumberGenerator() {
  const [minValue, setMinValue] = useState('1')
  const [maxValue, setMaxValue] = useState('100')
  const [count, setCount] = useState('1')
  const [allowDuplicates, setAllowDuplicates] = useState(true)
  const [sortResults, setSortResults] = useState(false)
  const [results, setResults] = useState<number[]>([])
  const [format, setFormat] = useState('numbers')

  const generateRandomNumbers = () => {
    const min = parseInt(minValue)
    const max = parseInt(maxValue)
    const numCount = parseInt(count)

    if (isNaN(min) || isNaN(max) || isNaN(numCount)) return
    if (min > max) return
    if (!allowDuplicates && numCount > (max - min + 1)) return

    const newResults: number[] = []
    const usedNumbers = new Set<number>()

    while (newResults.length < numCount) {
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
      
      if (allowDuplicates || !usedNumbers.has(randomNum)) {
        newResults.push(randomNum)
        if (!allowDuplicates) {
          usedNumbers.add(randomNum)
        }
      }
    }

    if (sortResults) {
      newResults.sort((a, b) => a - b)
    }

    setResults(newResults)
  }

  const copyToClipboard = () => {
    let textToCopy = ''
    
    switch (format) {
      case 'numbers':
        textToCopy = results.join(', ')
        break
      case 'csv':
        textToCopy = results.join(',')
        break
      case 'json':
        textToCopy = JSON.stringify(results, null, 2)
        break
      case 'lines':
        textToCopy = results.join('\n')
        break
    }
    
    navigator.clipboard.writeText(textToCopy)
  }

  const clearResults = () => {
    setResults([])
  }

  const resetAll = () => {
    setMinValue('1')
    setMaxValue('100')
    setCount('1')
    setAllowDuplicates(true)
    setSortResults(false)
    setResults([])
    setFormat('numbers')
  }

  const getStats = () => {
    if (results.length === 0) return null

    const sum = results.reduce((a, b) => a + b, 0)
    const avg = sum / results.length
    const min = Math.min(...results)
    const max = Math.max(...results)

    return { sum, avg, min, max }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Dice1 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Random Number Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate random numbers within a specified range
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Generator Settings</CardTitle>
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
                    placeholder="Enter minimum"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">Maximum Value</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    placeholder="Enter maximum"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">How many numbers?</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="Enter count"
                  min="1"
                  max="1000"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowDuplicates"
                    checked={allowDuplicates}
                    onChange={(e) => setAllowDuplicates(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="allowDuplicates">Allow duplicate numbers</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sortResults"
                    checked={sortResults}
                    onChange={(e) => setSortResults(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="sortResults">Sort results</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numbers">Comma Separated</SelectItem>
                    <SelectItem value="csv">CSV Format</SelectItem>
                    <SelectItem value="json">JSON Format</SelectItem>
                    <SelectItem value="lines">Line by Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateRandomNumbers}>
                  <Dice1 className="w-4 h-4 mr-2" />
                  Generate
                </Button>
                <Button variant="outline" onClick={resetAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Numbers</CardTitle>
              <CardDescription>
                Your random numbers will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">
                      {results.length} number{results.length !== 1 ? 's' : ''} generated
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearResults}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
                    {format === 'json' ? (
                      <pre className="text-sm font-mono">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    ) : format === 'lines' ? (
                      <div className="text-sm font-mono">
                        {results.map((num, index) => (
                          <div key={index}>{num}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm font-mono break-all">
                        {results.join(format === 'csv' ? ',' : ', ')}
                      </div>
                    )}
                  </div>

                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">{stats.min}</div>
                        <div className="text-xs text-muted-foreground">Minimum</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">{stats.max}</div>
                        <div className="text-xs text-muted-foreground">Maximum</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">{stats.avg.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Average</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">{stats.sum}</div>
                        <div className="text-xs text-muted-foreground">Sum</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Dice1 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Generate" to create random numbers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Presets */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
            <CardDescription>
              Common random number generation presets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMinValue('1')
                  setMaxValue('6')
                  setCount('1')
                }}
              >
                Dice Roll (1-6)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMinValue('1')
                  setMaxValue('100')
                  setCount('1')
                }}
              >
                Percentage (1-100)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMinValue('0')
                  setMaxValue('1')
                  setCount('1')
                }}
              >
                Binary (0-1)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMinValue('1')
                  setMaxValue('52')
                  setCount('5')
                  setAllowDuplicates(false)
                }}
              >
                Lottery Numbers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}