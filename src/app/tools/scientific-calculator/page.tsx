'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ScientificCalculator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg')
  const [memory, setMemory] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const { toast } = useToast()

  const evaluateExpression = (expression: string): string => {
    try {
      // Replace mathematical functions and constants
      let expr = expression
        .toLowerCase()
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/asin/g, 'Math.asin')
        .replace(/acos/g, 'Math.acos')
        .replace(/atan/g, 'Math.atan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/cbrt/g, 'Math.cbrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/exp/g, 'Math.exp')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**')
        .replace(/mod/g, '%')

      // Handle angle mode conversion
      if (angleMode === 'deg') {
        expr = expr.replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
        expr = expr.replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
        expr = expr.replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)')
        expr = expr.replace(/Math\.asin\(([^)]+)\)/g, 'Math.asin($1) * 180 / Math.PI')
        expr = expr.replace(/Math\.acos\(([^)]+)\)/g, 'Math.acos($1) * 180 / Math.PI')
        expr = expr.replace(/Math\.atan\(([^)]+)\)/g, 'Math.atan($1) * 180 / Math.PI')
      }

      // Evaluate the expression
      const value = Function('"use strict"; return (' + expr + ')')()
      
      if (isNaN(value) || !isFinite(value)) {
        return 'Error'
      }
      
      return value.toString()
    } catch (error) {
      return 'Error'
    }
  }

  const handleCalculate = () => {
    if (!input.trim()) return
    
    const calcResult = evaluateExpression(input)
    setResult(calcResult)
    
    if (calcResult !== 'Error') {
      const historyEntry = `${input} = ${calcResult}`
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)])
    }
  }

  const handleButtonClick = (value: string) => {
    setInput(prev => prev + value)
  }

  const handleClear = () => {
    setInput('')
    setResult('')
  }

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1))
  }

  const handleMemoryStore = () => {
    if (result && result !== 'Error') {
      setMemory(parseFloat(result))
      toast({
        title: "Memory Stored",
        description: `Value ${result} stored in memory`,
      })
    }
  }

  const handleMemoryRecall = () => {
    setInput(prev => prev + memory.toString())
  }

  const handleMemoryClear = () => {
    setMemory(0)
    toast({
      title: "Memory Cleared",
      description: "Memory has been cleared",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Result has been copied to clipboard",
    })
  }

  const downloadHistory = () => {
    const content = history.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calculator-history.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'log'],
    ['asin', 'acos', 'atan', 'ln'],
    ['sqrt', 'cbrt', '^', 'mod'],
    ['pi', 'e', '(', ')'],
    ['abs', 'exp', '!', '1/x']
  ]

  const numberButtons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+']
  ]

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Scientific Calculator</CardTitle>
          <CardDescription>
            Advanced scientific calculator with trigonometric, logarithmic, and other mathematical functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calculator */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {/* Mode Selection */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="angle-mode">Angle Mode:</Label>
                  <Select value={angleMode} onValueChange={(value: 'deg' | 'rad') => setAngleMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deg">Degrees</SelectItem>
                      <SelectItem value="rad">Radians</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    Memory: {memory}
                  </div>
                </div>

                {/* Display */}
                <div className="space-y-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter expression..."
                    className="text-lg font-mono"
                    onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-mono font-bold">
                      {result}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result)}
                        disabled={!result || result === 'Error'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Memory Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleMemoryStore}>
                    MS
                  </Button>
                  <Button variant="outline" onClick={handleMemoryRecall}>
                    MR
                  </Button>
                  <Button variant="outline" onClick={handleMemoryClear}>
                    MC
                  </Button>
                  <Button variant="outline" onClick={handleBackspace}>
                    ←
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    C
                  </Button>
                </div>

                {/* Scientific Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {scientificButtons.flat().map((btn) => (
                    <Button
                      key={btn}
                      variant="outline"
                      onClick={() => handleButtonClick(btn)}
                      className="font-mono"
                    >
                      {btn}
                    </Button>
                  ))}
                </div>

                {/* Number Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {numberButtons.flat().map((btn) => (
                    <Button
                      key={btn}
                      variant={btn === '=' ? 'default' : 'outline'}
                      onClick={() => btn === '=' ? handleCalculate() : handleButtonClick(btn)}
                      className="font-mono"
                    >
                      {btn}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">History</CardTitle>
                  <div className="flex justify-between items-center">
                    <CardDescription className="text-sm">Recent calculations</CardDescription>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadHistory}
                      disabled={history.length === 0}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {history.length > 0 ? (
                      history.map((entry, index) => (
                        <div
                          key={index}
                          className="p-2 bg-muted rounded text-sm font-mono cursor-pointer hover:bg-muted/80"
                          onClick={() => copyToClipboard(entry.split(' = ')[1] || entry)}
                        >
                          {entry}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No calculations yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">How to use:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Use standard mathematical notation: +, -, *, /, ^ for power</li>
              <li>• Trigonometric functions: sin, cos, tan, asin, acos, atan</li>
              <li>• Logarithmic functions: log (base 10), ln (natural log)</li>
              <li>• Other functions: sqrt, cbrt, abs, exp</li>
              <li>• Constants: pi (π), e (Euler's number)</li>
              <li>• Memory functions: MS (store), MR (recall), MC (clear)</li>
              <li>• Switch between Degrees and Radians for angle calculations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}