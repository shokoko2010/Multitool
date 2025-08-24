'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Binary, Hash, Copy, RefreshCw, Calculator } from 'lucide-react'

interface ConversionResult {
  decimal: string
  binary: string
  octal: string
  hexadecimal: string
  isValid: boolean
  error?: string
}

interface ConversionHistory {
  id: string
  fromType: string
  fromValue: string
  result: ConversionResult
  timestamp: Date
}

export default function BinaryConverter() {
  const [decimalInput, setDecimalInput] = useState<string>('')
  const [binaryInput, setBinaryInput] = useState<string>('')
  const [octalInput, setOctalInput] = useState<string>('')
  const [hexInput, setHexInput] = useState<string>('')
  const [activeInput, setActiveInput] = useState<string>('decimal')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])

  const validateAndConvert = (value: string, fromType: string): ConversionResult => {
    if (!value.trim()) {
      return {
        decimal: '',
        binary: '',
        octal: '',
        hexadecimal: '',
        isValid: false,
        error: 'Please enter a value'
      }
    }

    try {
      let decimalValue: number

      switch (fromType) {
        case 'decimal':
          decimalValue = parseInt(value, 10)
          if (isNaN(decimalValue)) {
            throw new Error('Invalid decimal number')
          }
          break
        case 'binary':
          if (!/^[01]+$/.test(value)) {
            throw new Error('Binary numbers can only contain 0s and 1s')
          }
          decimalValue = parseInt(value, 2)
          if (isNaN(decimalValue)) {
            throw new Error('Invalid binary number')
          }
          break
        case 'octal':
          if (!/^[0-7]+$/.test(value)) {
            throw new Error('Octal numbers can only contain digits 0-7')
          }
          decimalValue = parseInt(value, 8)
          if (isNaN(decimalValue)) {
            throw new Error('Invalid octal number')
          }
          break
        case 'hexadecimal':
          if (!/^[0-9A-Fa-f]+$/.test(value)) {
            throw new Error('Hexadecimal numbers can only contain digits 0-9 and letters A-F')
          }
          decimalValue = parseInt(value, 16)
          if (isNaN(decimalValue)) {
            throw new Error('Invalid hexadecimal number')
          }
          break
        default:
          throw new Error('Unknown conversion type')
      }

      // Limit to reasonable range to prevent overflow
      if (decimalValue > Number.MAX_SAFE_INTEGER || decimalValue < Number.MIN_SAFE_INTEGER) {
        throw new Error('Number is too large or too small')
      }

      return {
        decimal: decimalValue.toString(),
        binary: decimalValue.toString(2),
        octal: decimalValue.toString(8),
        hexadecimal: decimalValue.toString(16).toUpperCase(),
        isValid: true
      }
    } catch (error) {
      return {
        decimal: '',
        binary: '',
        octal: '',
        hexadecimal: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const convertFromDecimal = () => {
    const conversionResult = validateAndConvert(decimalInput, 'decimal')
    setResult(conversionResult)
    
    if (conversionResult.isValid) {
      // Update other inputs
      setBinaryInput(conversionResult.binary)
      setOctalInput(conversionResult.octal)
      setHexInput(conversionResult.hexadecimal)
      
      addToHistory('decimal', decimalInput, conversionResult)
    }
  }

  const convertFromBinary = () => {
    const conversionResult = validateAndConvert(binaryInput, 'binary')
    setResult(conversionResult)
    
    if (conversionResult.isValid) {
      // Update other inputs
      setDecimalInput(conversionResult.decimal)
      setOctalInput(conversionResult.octal)
      setHexInput(conversionResult.hexadecimal)
      
      addToHistory('binary', binaryInput, conversionResult)
    }
  }

  const convertFromOctal = () => {
    const conversionResult = validateAndConvert(octalInput, 'octal')
    setResult(conversionResult)
    
    if (conversionResult.isValid) {
      // Update other inputs
      setDecimalInput(conversionResult.decimal)
      setBinaryInput(conversionResult.binary)
      setHexInput(conversionResult.hexadecimal)
      
      addToHistory('octal', octalInput, conversionResult)
    }
  }

  const convertFromHex = () => {
    const conversionResult = validateAndConvert(hexInput, 'hexadecimal')
    setResult(conversionResult)
    
    if (conversionResult.isValid) {
      // Update other inputs
      setDecimalInput(conversionResult.decimal)
      setBinaryInput(conversionResult.binary)
      setOctalInput(conversionResult.octal)
      
      addToHistory('hexadecimal', hexInput, conversionResult)
    }
  }

  const addToHistory = (fromType: string, fromValue: string, conversionResult: ConversionResult) => {
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
    setDecimalInput('')
    setBinaryInput('')
    setOctalInput('')
    setHexInput('')
    setResult(null)
  }

  const generateRandomNumber = () => {
    const randomDecimal = Math.floor(Math.random() * 1000) + 1
    setDecimalInput(randomDecimal.toString())
    setActiveInput('decimal')
    
    const conversionResult = validateAndConvert(randomDecimal.toString(), 'decimal')
    setResult(conversionResult)
    
    // Update other inputs
    setBinaryInput(conversionResult.binary)
    setOctalInput(conversionResult.octal)
    setHexInput(conversionResult.hexadecimal)
    
    addToHistory('decimal', randomDecimal.toString(), conversionResult)
  }

  useEffect(() => {
    if (activeInput === 'decimal') convertFromDecimal()
    else if (activeInput === 'binary') convertFromBinary()
    else if (activeInput === 'octal') convertFromOctal()
    else if (activeInput === 'hexadecimal') convertFromHex()
  }, [decimalInput, binaryInput, octalInput, hexInput, activeInput])

  const formatNumber = (num: string, type: string) => {
    if (!num) return ''
    
    switch (type) {
      case 'binary':
        return num.replace(/(.{4})/g, '$1 ').trim()
      case 'octal':
        return num.replace(/(.{3})/g, '$1 ').trim()
      case 'hexadecimal':
        return num.replace(/(.{2})/g, '$1 ').trim()
      default:
        return num.replace(/(.{3})/g, '$1,').trim()
    }
  }

  const getNumberSystemInfo = (type: string) => {
    const info = {
      decimal: { base: 10, digits: '0-9', name: 'Decimal' },
      binary: { base: 2, digits: '0-1', name: 'Binary' },
      octal: { base: 8, digits: '0-7', name: 'Octal' },
      hexadecimal: { base: 16, digits: '0-9, A-F', name: 'Hexadecimal' }
    }
    return info[type as keyof typeof info]
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Number Base Converter</h1>
        <p className="text-muted-foreground">Convert between decimal, binary, octal, and hexadecimal number systems</p>
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
                  <Binary className="h-5 w-5" />
                  Number Base Converter
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
                Enter a number in any base to see it converted to other bases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimal">Decimal (Base 10)</Label>
                    <Input
                      id="decimal"
                      value={decimalInput}
                      onChange={(e) => {
                        setDecimalInput(e.target.value)
                        setActiveInput('decimal')
                      }}
                      placeholder="Enter decimal number"
                      onFocus={() => setActiveInput('decimal')}
                    />
                    <div className="text-xs text-muted-foreground">
                      Digits: 0-9
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="binary">Binary (Base 2)</Label>
                    <Input
                      id="binary"
                      value={binaryInput}
                      onChange={(e) => {
                        setBinaryInput(e.target.value)
                        setActiveInput('binary')
                      }}
                      placeholder="Enter binary number"
                      onFocus={() => setActiveInput('binary')}
                    />
                    <div className="text-xs text-muted-foreground">
                      Digits: 0-1
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="octal">Octal (Base 8)</Label>
                    <Input
                      id="octal"
                      value={octalInput}
                      onChange={(e) => {
                        setOctalInput(e.target.value)
                        setActiveInput('octal')
                      }}
                      placeholder="Enter octal number"
                      onFocus={() => setActiveInput('octal')}
                    />
                    <div className="text-xs text-muted-foreground">
                      Digits: 0-7
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hexadecimal">Hexadecimal (Base 16)</Label>
                    <Input
                      id="hexadecimal"
                      value={hexInput}
                      onChange={(e) => {
                        setHexInput(e.target.value)
                        setActiveInput('hexadecimal')
                      }}
                      placeholder="Enter hexadecimal number"
                      onFocus={() => setActiveInput('hexadecimal')}
                    />
                    <div className="text-xs text-muted-foreground">
                      Digits: 0-9, A-F
                    </div>
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
                            <span className="text-sm font-medium">Decimal:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{formatNumber(result.decimal, 'decimal')}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.decimal)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Binary:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{formatNumber(result.binary, 'binary')}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.binary)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Octal:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{formatNumber(result.octal, 'octal')}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.octal)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Hexadecimal:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{formatNumber(result.hexadecimal, 'hexadecimal')}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.hexadecimal)}
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
                <CardTitle>Number System Information</CardTitle>
                <CardDescription>
                  Learn about different number bases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries({
                    decimal: 'Everyday counting system',
                    binary: 'Used in computing and digital systems',
                    octal: 'Sometimes used in computing',
                    hexadecimal: 'Commonly used in programming'
                  }).map(([system, description]) => {
                    const info = getNumberSystemInfo(system)
                    return (
                      <div key={system} className="p-3 border rounded-lg">
                        <div className="font-medium capitalize">{system} (Base {info.base})</div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Valid digits: {info.digits}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
                <CardDescription>
                  Common number conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium">Decimal 0-15 in different bases:</div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="font-medium">Dec</div>
                    <div className="font-medium">Bin</div>
                    <div className="font-medium">Oct</div>
                    <div className="font-medium">Hex</div>
                  </div>
                  {Array.from({ length: 16 }, (_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs">
                      <div>{i}</div>
                      <div>{i.toString(2).padStart(4, '0')}</div>
                      <div>{i.toString(8)}</div>
                      <div>{i.toString(16).toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Tips</CardTitle>
              <CardDescription>
                Helpful tips for number base conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Binary to Decimal</h4>
                  <p className="text-sm text-muted-foreground">
                    Multiply each bit by 2 raised to its position power (from right, starting at 0) and sum the results.
                    Example: 1101 = 1×8 + 1×4 + 0×2 + 1×1 = 13
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Decimal to Binary</h4>
                  <p className="text-sm text-muted-foreground">
                    Divide by 2 repeatedly and keep track of remainders. Read remainders from bottom to top.
                    Example: 13 → 1101 (remainders: 1, 0, 1, 1)
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Hex to Binary</h4>
                  <p className="text-sm text-muted-foreground">
                    Convert each hex digit to 4-bit binary. Example: A3 = 1010 0011
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Binary to Hex</h4>
                  <p className="text-sm text-muted-foreground">
                    Group binary digits in sets of 4 (from right), convert each group to hex.
                    Example: 10100011 = 1010 0011 = A3
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion History</CardTitle>
              <CardDescription>
                Your recent number base conversions
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
                          {item.fromType}: {item.fromValue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Dec: {item.result.decimal} • Bin: {formatNumber(item.result.binary, 'binary')} • 
                          Oct: {item.result.octal} • Hex: {item.result.hexadecimal}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {item.fromType}
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