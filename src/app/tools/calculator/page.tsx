'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator as CalculatorIcon, History, RotateCcw, Copy, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface HistoryItem {
  expression: string
  result: string
  timestamp: Date
}

export default function Calculator() {
  const { toast } = useToast()
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [currentMode, setCurrentMode] = useState('basic')
  const [memory, setMemory] = useState(0)
  const [angleMode, setAngleMode] = useState('degrees')

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }

    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clearDisplay = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const clearEntry = () => {
    setDisplay('0')
  }

  const handleOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = performCalculation[operation](currentValue, inputValue)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const performCalculation: { [key: string]: (a: number, b: number) => number } = {
    '/': (a, b) => a / b,
    '*': (a, b) => a * b,
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '=': (a, b) => b,
  }

  const calculate = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = performCalculation[operation](previousValue, inputValue)
      
      // Add to history
      const historyItem: HistoryItem = {
        expression: `${previousValue} ${operation} ${inputValue}`,
        result: String(newValue),
        timestamp: new Date()
      }
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 items
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  // Scientific calculator functions
  const sin = () => {
    const value = parseFloat(display)
    const result = angleMode === 'degrees' ? 
      Math.sin(value * Math.PI / 180) : 
      Math.sin(value)
    setDisplay(String(result))
    addToHistory(`sin(${display})`, String(result))
  }

  const cos = () => {
    const value = parseFloat(display)
    const result = angleMode === 'degrees' ? 
      Math.cos(value * Math.PI / 180) : 
      Math.cos(value)
    setDisplay(String(result))
    addToHistory(`cos(${display})`, String(result))
  }

  const tan = () => {
    const value = parseFloat(display)
    const result = angleMode === 'degrees' ? 
      Math.tan(value * Math.PI / 180) : 
      Math.tan(value)
    setDisplay(String(result))
    addToHistory(`tan(${display})`, String(result))
  }

  const log = () => {
    const value = parseFloat(display)
    const result = Math.log10(value)
    setDisplay(String(result))
    addToHistory(`log(${display})`, String(result))
  }

  const ln = () => {
    const value = parseFloat(display)
    const result = Math.log(value)
    setDisplay(String(result))
    addToHistory(`ln(${display})`, String(result))
  }

  const square = () => {
    const value = parseFloat(display)
    const result = value * value
    setDisplay(String(result))
    addToHistory(`${display}²`, String(result))
  }

  const squareRoot = () => {
    const value = parseFloat(display)
    const result = Math.sqrt(value)
    setDisplay(String(result))
    addToHistory(`√${display}`, String(result))
  }

  const power = () => {
    const value = parseFloat(display)
    const result = Math.pow(value, 2)
    setDisplay(String(result))
    addToHistory(`${display}^2`, String(result))
  }

  const factorial = () => {
    const value = parseFloat(display)
    if (value < 0 || !Number.isInteger(value)) {
      setDisplay('Error')
      return
    }
    
    let result = 1
    for (let i = 2; i <= value; i++) {
      result *= i
    }
    setDisplay(String(result))
    addToHistory(`${display}!`, String(result))
  }

  const reciprocal = () => {
    const value = parseFloat(display)
    if (value === 0) {
      setDisplay('Error')
      return
    }
    const result = 1 / value
    setDisplay(String(result))
    addToHistory(`1/${display}`, String(result))
  }

  const percent = () => {
    const value = parseFloat(display)
    const result = value / 100
    setDisplay(String(result))
    addToHistory(`${display}%`, String(result))
  }

  const negate = () => {
    const value = parseFloat(display)
    const result = -value
    setDisplay(String(result))
  }

  const memoryAdd = () => {
    const value = parseFloat(display)
    setMemory(prev => prev + value)
  }

  const memorySubtract = () => {
    const value = parseFloat(display)
    setMemory(prev => prev - value)
  }

  const memoryRecall = () => {
    setDisplay(String(memory))
  }

  const memoryClear = () => {
    setMemory(0)
  }

  const addToHistory = (expression: string, result: string) => {
    const historyItem: HistoryItem = {
      expression,
      result,
      timestamp: new Date()
    }
    setHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display)
    toast({
          title: "Calculator result has been copied"
        })
  }

  const downloadHistory = () => {
    const content = `Calculator History
Generated: ${new Date().toLocaleString()}

${history.map((item, index) => 
  `${index + 1}. ${item.expression} = ${item.result} (${item.timestamp.toLocaleTimeString()})`
).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calculator-history.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
          title: "Calculator history download has started"
        })
  }

  const clearHistory = () => {
    setHistory([])
  }

  const buttons = [
    'C', 'CE', '⌫', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=', '='
  ]

  const scientificButtons = [
    'sin', 'cos', 'tan', 'log',
    'ln', 'x²', '√', 'x^y',
    'n!', '1/x', '%', '±',
    'π', 'e', '(', ')', 'MC'
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calculator</h1>
        <p className="text-muted-foreground">
          Professional calculator with basic, scientific, and memory functions
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Math Tool</Badge>
          <Badge variant="outline">Calculator</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5" />
                Calculator
              </CardTitle>
              <CardDescription>
                Perform calculations with precision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selector */}
              <div className="flex gap-2">
                <Select value={currentMode} onValueChange={setCurrentMode}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="scientific">Scientific</SelectItem>
                  </SelectContent>
                </Select>
                
                {currentMode === 'scientific' && (
                  <Select value={angleMode} onValueChange={setAngleMode}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="degrees">Degrees</SelectItem>
                      <SelectItem value="radians">Radians</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Display */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-right text-3xl font-mono min-h-[48px] flex items-center justify-end">
                  {display}
                </div>
              </div>

              {/* Basic Calculator */}
              {currentMode === 'basic' && (
                <div className="grid grid-cols-4 gap-2">
                  {buttons.map((button) => (
                    <Button
                      key={button}
                      onClick={() => {
                        if (button === 'C') clearDisplay()
                        else if (button === 'CE') clearEntry()
                        else if (button === '⌫') handleBackspace()
                        else if (['+', '-', '*', '/', '='].includes(button)) {
                          if (button === '=') calculate()
                          else handleOperation(button)
                        }
                        else if (button === '.') inputDecimal()
                        else inputDigit(button)
                      }}
                      variant={['=', '+', '-', '*', '/'].includes(button) ? 'default' : 'outline'}
                      className="text-lg h-12"
                    >
                      {button}
                    </Button>
                  ))}
                </div>
              )}

              {/* Scientific Calculator */}
              {currentMode === 'scientific' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    {scientificButtons.map((button) => (
                      <Button
                        key={button}
                        onClick={() => {
                          if (button === 'MC') memoryClear()
                          else if (button === 'sin') sin()
                          else if (button === 'cos') cos()
                          else if (button === 'tan') tan()
                          else if (button === 'log') log()
                          else if (button === 'ln') ln()
                          else if (button === 'x²') square()
                          else if (button === '√') squareRoot()
                          else if (button === 'x^y') power()
                          else if (button === 'n!') factorial()
                          else if (button === '1/x') reciprocal()
                          else if (button === '%') percent()
                          else if (button === '±') negate()
                          else if (button === 'π') setDisplay(String(Math.PI))
                          else if (button === 'e') setDisplay(String(Math.E))
                          else if (button === '(') inputDigit('(')
                          else if (button === ')') inputDigit(')')
                        }}
                        variant="outline"
                        className="text-sm h-10"
                      >
                        {button}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {buttons.map((button) => (
                      <Button
                        key={button}
                        onClick={() => {
                          if (button === 'C') clearDisplay()
                          else if (button === 'CE') clearEntry()
                          else if (button === '⌫') handleBackspace()
                          else if (['+', '-', '*', '/', '='].includes(button)) {
                            if (button === '=') calculate()
                            else handleOperation(button)
                          }
                          else if (button === '.') inputDecimal()
                          else inputDigit(button)
                        }}
                        variant={['=', '+', '-', '*', '/'].includes(button) ? 'default' : 'outline'}
                        className="text-lg h-12"
                      >
                        {button}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory Functions */}
              <div className="flex gap-2">
                <Button onClick={memoryAdd} variant="outline" size="sm">
                  M+
                </Button>
                <Button onClick={memorySubtract} variant="outline" size="sm">
                  M-
                </Button>
                <Button onClick={memoryRecall} variant="outline" size="sm">
                  MR
                </Button>
                <Button onClick={memoryClear} variant="outline" size="sm">
                  MC
                </Button>
                <div className="ml-auto text-sm text-muted-foreground">
                  Memory: {memory}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={clearHistory} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* History Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((item, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-mono text-xs text-gray-600">
                        {item.expression}
                      </div>
                      <div className="font-mono text-sm">
                        = {item.result}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No calculations yet</p>
                </div>
              )}
              
              {history.length > 0 && (
                <Button onClick={downloadHistory} variant="outline" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download History
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Calculator Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Use parentheses for complex expressions</p>
              <p>• Switch between degrees/radians for trig functions</p>
              <p>• Memory functions store values across calculations</p>
              <p>• Scientific mode includes advanced functions</p>
              <p>• History stores your last 10 calculations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Add handleBackspace function
const handleBackspace = () => {
  // This would be implemented in the actual component
  console.log('Backspace pressed')
}