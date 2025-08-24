'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Hash, Copy, RefreshCw, Calculator } from 'lucide-react'

interface ConversionResult {
  number: string
  roman: string
  isValid: boolean
  error?: string
}

interface ConversionHistory {
  id: string
  fromType: 'number' | 'roman'
  fromValue: string
  result: ConversionResult
  timestamp: Date
}

export default function RomanNumeralConverter() {
  const [numberInput, setNumberInput] = useState<string>('')
  const [romanInput, setRomanInput] = useState<string>('')
  const [activeInput, setActiveInput] = useState<'number' | 'roman'>('number')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])

  const romanNumerals: { [key: string]: number } = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
  }

  const subtractivePairs: { [key: string]: number } = {
    'IV': 4, 'IX': 9, 'XL': 40, 'XC': 90, 'CD': 400, 'CM': 900
  }

  const numberToRoman = (num: number): string => {
    if (num < 1 || num > 3999) {
      throw new Error('Number must be between 1 and 3999')
    }

    const romanNumerals = [
      { value: 1000, symbol: 'M' },
      { value: 900, symbol: 'CM' },
      { value: 500, symbol: 'D' },
      { value: 400, symbol: 'CD' },
      { value: 100, symbol: 'C' },
      { value: 90, symbol: 'XC' },
      { value: 50, symbol: 'L' },
      { value: 40, symbol: 'XL' },
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' }
    ]

    let result = ''
    for (const numeral of romanNumerals) {
      while (num >= numeral.value) {
        result += numeral.symbol
        num -= numeral.value
      }
    }
    return result
  }

  const romanToNumber = (roman: string): number => {
    if (!roman) {
      throw new Error('Please enter a Roman numeral')
    }

    const romanUpper = roman.toUpperCase()
    let total = 0
    let i = 0

    // Check for invalid characters
    for (const char of romanUpper) {
      if (!romanNumerals[char]) {
        throw new Error(`Invalid Roman numeral character: ${char}`)
      }
    }

    while (i < romanUpper.length) {
      // Check for subtractive pairs first
      if (i + 1 < romanUpper.length) {
        const twoChar = romanUpper.substring(i, i + 2)
        if (subtractivePairs[twoChar]) {
          total += subtractivePairs[twoChar]
          i += 2
          continue
        }
      }

      // Single character
      const char = romanUpper[i]
      if (!romanNumerals[char]) {
        throw new Error(`Invalid Roman numeral: ${char}`)
      }
      total += romanNumerals[char]
      i++
    }

    return total
  }

  const validateRoman = (roman: string): boolean => {
    if (!roman) return false

    const romanUpper = roman.toUpperCase()
    
    // Check for invalid characters
    for (const char of romanUpper) {
      if (!romanNumerals[char]) {
        return false
      }
    }

    // Basic validation rules
    const invalidPatterns = [
      'IIII', 'VV', 'XXXX', 'LL', 'CCCC', 'DD', 'MMMM',
      'VX', 'VL', 'VC', 'VD', 'VM',
      'LC', 'LD', 'LM',
      'DM'
    ]

    for (const pattern of invalidPatterns) {
      if (romanUpper.includes(pattern)) {
        return false
      }
    }

    return true
  }

  const convertFromNumber = () => {
    if (!numberInput.trim()) {
      setResult({
        number: '',
        roman: '',
        isValid: false,
        error: 'Please enter a number'
      })
      return
    }

    const num = parseInt(numberInput, 10)
    
    if (isNaN(num)) {
      setResult({
        number: numberInput,
        roman: '',
        isValid: false,
        error: 'Invalid number'
      })
      return
    }

    if (num < 1 || num > 3999) {
      setResult({
        number: numberInput,
        roman: '',
        isValid: false,
        error: 'Number must be between 1 and 3999'
      })
      return
    }

    try {
      const roman = numberToRoman(num)
      const conversionResult: ConversionResult = {
        number: num.toString(),
        roman,
        isValid: true
      }
      setResult(conversionResult)
      setRomanInput(roman)
      addToHistory('number', numberInput, conversionResult)
    } catch (error) {
      setResult({
        number: numberInput,
        roman: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const convertFromRoman = () => {
    if (!romanInput.trim()) {
      setResult({
        number: '',
        roman: '',
        isValid: false,
        error: 'Please enter a Roman numeral'
      })
      return
    }

    if (!validateRoman(romanInput)) {
      setResult({
        number: '',
        roman: romanInput,
        isValid: false,
        error: 'Invalid Roman numeral'
      })
      return
    }

    try {
      const num = romanToNumber(romanInput)
      const conversionResult: ConversionResult = {
        number: num.toString(),
        roman: romanInput.toUpperCase(),
        isValid: true
      }
      setResult(conversionResult)
      setNumberInput(num.toString())
      addToHistory('roman', romanInput, conversionResult)
    } catch (error) {
      setResult({
        number: '',
        roman: romanInput,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const addToHistory = (fromType: 'number' | 'roman', fromValue: string, conversionResult: ConversionResult) => {
    const historyItem: ConversionHistory = {
      id: Date.now().toString(),
      fromType,
      fromValue,
      result: conversionResult,
      timestamp: new Date()
    }
    
    setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setNumberInput('')
    setRomanInput('')
    setResult(null)
  }

  const generateRandomNumber = () => {
    const randomNumber = Math.floor(Math.random() * 3999) + 1
    setNumberInput(randomNumber.toString())
    setActiveInput('number')
    
    try {
      const roman = numberToRoman(randomNumber)
      const conversionResult: ConversionResult = {
        number: randomNumber.toString(),
        roman,
        isValid: true
      }
      setResult(conversionResult)
      setRomanInput(roman)
      addToHistory('number', randomNumber.toString(), conversionResult)
    } catch (error) {
      setResult({
        number: randomNumber.toString(),
        roman: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    if (activeInput === 'number') convertFromNumber()
    else if (activeInput === 'roman') convertFromRoman()
  }, [numberInput, romanInput, activeInput])

  const getRomanNumeralInfo = (symbol: string) => {
    const info = {
      'I': { value: 1, description: 'One' },
      'V': { value: 5, description: 'Five' },
      'X': { value: 10, description: 'Ten' },
      'L': { value: 50, description: 'Fifty' },
      'C': { value: 100, description: 'One hundred' },
      'D': { value: 500, description: 'Five hundred' },
      'M': { value: 1000, description: 'One thousand' }
    }
    return info[symbol as keyof typeof info]
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Roman Numeral Converter</h1>
        <p className="text-muted-foreground">Convert between numbers and Roman numerals (1-3999)</p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Roman Numeral Converter
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={generateRandomNumber}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Random
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Convert between Arabic numbers and Roman numerals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="number">Number (1-3999)</Label>
                  <Input
                    id="number"
                    type="number"
                    value={numberInput}
                    onChange={(e) => {
                      setNumberInput(e.target.value)
                      setActiveInput('number')
                    }}
                    placeholder="Enter number"
                    min="1"
                    max="3999"
                    onFocus={() => setActiveInput('number')}
                  />
                  <div className="text-xs text-muted-foreground">
                    Range: 1 to 3999
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roman">Roman Numeral</Label>
                  <Input
                    id="roman"
                    value={romanInput}
                    onChange={(e) => {
                      setRomanInput(e.target.value)
                      setActiveInput('roman')
                    }}
                    placeholder="Enter Roman numeral"
                    onFocus={() => setActiveInput('roman')}
                  />
                  <div className="text-xs text-muted-foreground">
                    Valid characters: I, V, X, L, C, D, M
                  </div>
                </div>
              </div>

              {result && (
                <div className={`p-4 rounded-lg ${result.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {result.isValid ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <Calculator className="h-4 w-4" />
                        <span className="font-medium">Conversion Results</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Number:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{result.number}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.number)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Roman Numeral:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{result.roman}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.roman)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-800">
                      <Hash className="h-4 w-4" />
                      <span className="font-medium">Error: {result.error}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Roman Numeral Symbols</CardTitle>
                <CardDescription>
                  Basic Roman numeral symbols and their values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(romanNumerals).map((symbol) => {
                    const info = getRomanNumeralInfo(symbol)
                    return (
                      <div key={symbol} className="p-3 border rounded-lg text-center">
                        <div className="text-2xl font-bold">{symbol}</div>
                        <div className="text-lg">{info.value}</div>
                        <div className="text-sm text-muted-foreground">{info.description}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subtractive Notation</CardTitle>
                <CardDescription>
                  Special combinations used in Roman numerals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(subtractivePairs).map(([roman, value]) => (
                    <div key={roman} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{roman}</span>
                      <span className="text-lg">{value}</span>
                    </div>
                  ))}
                  <div className="text-sm text-muted-foreground mt-3">
                    These combinations are used to avoid writing four identical symbols in a row.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Roman Numeral Rules</CardTitle>
              <CardDescription>
                Important rules for reading and writing Roman numerals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Basic Rules</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Read from left to right</li>
                    <li>• Symbols are added together</li>
                    <li>• Larger symbols before smaller = add</li>
                    <li>• Smaller symbols before larger = subtract</li>
                    <li>• No symbol should repeat more than 3 times</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Examples</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• VI = 5 + 1 = 6</li>
                    <li>• IV = 5 - 1 = 4</li>
                    <li>• IX = 10 - 1 = 9</li>
                    <li>• XL = 50 - 10 = 40</li>
                    <li>• CM = 1000 - 100 = 900</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Invalid Patterns</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• IIII (should be IV)</li>
                    <li>• VV (should be X)</li>
                    <li>• VX (invalid combination)</li>
                    <li>• LL (should be C)</li>
                    <li>• DM (invalid combination)</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Modern Usage</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Clock faces (hours)</li>
                    <li>• Book chapters and volumes</li>
                    <li>• Monarchs and popes</li>
                    <li>• Building cornerstones</li>
                    <li>• Formal documents and events</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Roman Numerals</CardTitle>
              <CardDescription>
                Frequently used Roman numerals and their values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { number: 1, roman: 'I' },
                  { number: 5, roman: 'V' },
                  { number: 10, roman: 'X' },
                  { number: 25, roman: 'XXV' },
                  { number: 50, roman: 'L' },
                  { number: 100, roman: 'C' },
                  { number: 500, roman: 'D' },
                  { number: 1000, roman: 'M' },
                  { number: 2023, roman: 'MMXXIII' },
                  { number: 2024, roman: 'MMXXIV' },
                  { number: 3999, roman: 'MMMCMXCIX' },
                  { number: 100, roman: 'C' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg text-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      setNumberInput(item.number.toString())
                      setRomanInput(item.roman)
                      setResult({
                        number: item.number.toString(),
                        roman: item.roman,
                        isValid: true
                      })
                    }}
                  >
                    <div className="text-lg font-bold">{item.roman}</div>
                    <div className="text-sm text-muted-foreground">{item.number}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion History</CardTitle>
              <CardDescription>
                Your recent Roman numeral conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversion history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {conversionHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.fromType === 'number' ? 'Number' : 'Roman'}: {item.fromValue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.result.number} ↔ {item.result.roman}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {item.fromType === 'number' ? '→ Roman' : '→ Number'}
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