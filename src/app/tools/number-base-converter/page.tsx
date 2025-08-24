'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Calculator, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConversionResult {
  base: number
  value: string
  isValid: boolean
}

export default function NumberBaseConverter() {
  const [inputValue, setInputValue] = useState('')
  const [inputBase, setInputBase] = useState(10)
  const [results, setResults] = useState<ConversionResult[]>([])
  const [history, setHistory] = useState<string[]>([])
  const { toast } = useToast()

  const bases = [
    { value: 2, label: 'Binary (Base 2)', description: '0-1' },
    { value: 8, label: 'Octal (Base 8)', description: '0-7' },
    { value: 10, label: 'Decimal (Base 10)', description: '0-9' },
    { value: 16, label: 'Hexadecimal (Base 16)', description: '0-9, A-F' },
    { value: 32, label: 'Base 32', description: 'A-Z, 2-7' },
    { value: 36, label: 'Base 36', description: '0-9, A-Z' },
    { value: 64, label: 'Base 64', description: 'A-Z, a-z, 0-9, +, /' }
  ]

  const targetBases = [2, 8, 10, 16, 32, 36, 64]

  const isValidForBase = (value: string, base: number): boolean => {
    if (!value.trim()) return false
    
    const cleanValue = value.trim().toUpperCase()
    
    switch (base) {
      case 2:
        return /^[01]+$/.test(cleanValue)
      case 8:
        return /^[0-7]+$/.test(cleanValue)
      case 10:
        return /^[0-9]+$/.test(cleanValue)
      case 16:
        return /^[0-9A-F]+$/.test(cleanValue)
      case 32:
        return /^[A-Z2-7]+$/.test(cleanValue)
      case 36:
        return /^[0-9A-Z]+$/.test(cleanValue)
      case 64:
        return /^[A-Z0-9+/]+$/.test(cleanValue)
      default:
        return false
    }
  }

  const parseValue = (value: string, base: number): number => {
    try {
      const cleanValue = value.trim().toUpperCase()
      return parseInt(cleanValue, base)
    } catch {
      return NaN
    }
  }

  const convertToBase = (decimalValue: number, targetBase: number): string => {
    if (isNaN(decimalValue)) return 'Invalid'
    
    switch (targetBase) {
      case 2:
        return decimalValue.toString(2)
      case 8:
        return decimalValue.toString(8)
      case 10:
        return decimalValue.toString(10)
      case 16:
        return decimalValue.toString(16).toUpperCase()
      case 32:
        return decimalValue.toString(32).toUpperCase()
      case 36:
        return decimalValue.toString(36).toUpperCase()
      case 64:
        return btoa(String.fromCharCode(decimalValue)).replace(/=/g, '')
      default:
        return 'Unsupported'
    }
  }

  const handleConvert = () => {
    if (!inputValue.trim()) return

    const isValid = isValidForBase(inputValue, inputBase)
    
    if (!isValid) {
      toast({
        title: "Invalid Input",
        description: `The value is not valid for base ${inputBase}`,
        variant: "destructive"
      })
      return
    }

    const decimalValue = parseValue(inputValue, inputBase)
    
    if (isNaN(decimalValue)) {
      toast({
        title: "Conversion Error",
        description: "Unable to parse the input value",
        variant: "destructive"
      })
      return
    }

    const conversionResults = targetBases.map(base => ({
      base,
      value: convertToBase(decimalValue, base),
      isValid: true
    }))

    setResults(conversionResults)

    // Add to history
    const historyEntry = `${inputValue} (Base ${inputBase}) = ${decimalValue} (Base 10)`
    setHistory(prev => [historyEntry, ...prev.slice(0, 9)])
  }

  const handleClear = () => {
    setInputValue('')
    setResults([])
  }

  const swapBases = () => {
    if (results.length > 0) {
      const targetResult = results.find(r => r.base === inputBase)
      if (targetResult && targetResult.isValid) {
        setInputValue(targetResult.value)
        // Find a different base to convert to
        const otherBases = targetBases.filter(b => b !== inputBase)
        if (otherBases.length > 0) {
          setInputBase(otherBases[0])
        }
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Value has been copied to clipboard",
    })
  }

  const downloadResults = () => {
    if (results.length === 0) return

    const content = `Number Base Conversion Results
================================

Original Value: ${inputValue} (Base ${inputBase})

Conversions:
${results.map(result => 
  `Base ${result.base}: ${result.value}`
).join('\n')}

Generated on: ${new Date().toLocaleString()}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'number-base-conversion.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getBaseName = (base: number): string => {
    const baseInfo = bases.find(b => b.value === base)
    return baseInfo?.label || `Base ${base}`
  }

  const getBaseDescription = (base: number): string => {
    const baseInfo = bases.find(b => b.value === base)
    return baseInfo?.description || ''
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Number Base Converter
          </CardTitle>
          <CardDescription>
            Convert numbers between different bases including binary, octal, decimal, hexadecimal, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="input-value">Input Value:</Label>
                <Input
                  id="input-value"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter number..."
                  onKeyPress={(e) => e.key === 'Enter' && handleConvert()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="input-base">Input Base:</Label>
                <Select value={inputBase.toString()} onValueChange={(value) => setInputBase(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bases.map((base) => (
                      <SelectItem key={base.value} value={base.value.toString()}>
                        <div>
                          <div className="font-medium">{base.label}</div>
                          <div className="text-xs text-muted-foreground">{base.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleConvert} className="flex-1" disabled={!inputValue.trim()}>
                  Convert
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Conversion Results</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={swapBases}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Swap
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResults}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result) => (
                    <Card key={result.base}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {getBaseName(result.base)}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.value)}
                            disabled={!result.isValid}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="text-sm">
                          {getBaseDescription(result.base)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.isValid ? (
                          <div className="space-y-2">
                            <div className="font-mono text-lg bg-muted p-3 rounded break-all">
                              {result.value}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {result.value.length} characters
                              </Badge>
                              {result.base === inputBase && (
                                <Badge variant="secondary">Original</Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            Invalid conversion
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion History</CardTitle>
                <CardDescription className="text-sm">Recent conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {history.length > 0 ? (
                    history.map((entry, index) => (
                      <div
                        key={index}
                        className="p-2 bg-muted rounded text-sm font-mono cursor-pointer hover:bg-muted/80"
                        onClick={() => copyToClipboard(entry)}
                      >
                        {entry}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No conversions yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Base System Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bases.map((base) => (
                    <div key={base.value} className="space-y-1">
                      <div className="font-medium">{base.label}</div>
                      <div className="text-sm text-muted-foreground">
                        Characters: {base.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Example: {convertToBase(42, base.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enter a number and select its base (2-64)</li>
                <li>• Click Convert to see the number in all supported bases</li>
                <li>• Use the Swap button to quickly reverse the conversion</li>
                <li>• Click on any result to copy it to clipboard</li>
                <li>• Supported bases: Binary (2), Octal (8), Decimal (10), Hexadecimal (16), Base 32, Base 36, Base 64</li>
                <li>• The converter validates input to ensure it's valid for the selected base</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}