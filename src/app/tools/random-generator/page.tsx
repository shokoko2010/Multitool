'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dice6, Shuffle, RefreshCw, Copy, Download, AlertCircle, CheckCircle, Hash } from 'lucide-react'

interface RandomResult {
  type: string
  value: any
  timestamp: string
}

interface RandomConfig {
  min: number
  max: number
  decimal: boolean
  length: number
  charset: string
  unique: boolean
  count: number
}

export default function RandomGenerator() {
  const [activeTab, setActiveTab] = useState('numbers')
  const [results, setResults] = useState<RandomResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const numberConfig = useState<RandomConfig>({
    min: 1,
    max: 100,
    decimal: false,
    length: 10,
    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    unique: true,
    count: 1
  })

  const stringConfig = useState<RandomConfig>({
    min: 1,
    max: 100,
    decimal: false,
    length: 10,
    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    unique: true,
    count: 1
  })

  const listConfig = useState<RandomConfig>({
    min: 1,
    max: 100,
    decimal: false,
    length: 10,
    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    unique: true,
    count: 1
  })

  const generateRandomNumber = (config: RandomConfig): number => {
    if (config.decimal) {
      return Math.random() * (config.max - config.min) + config.min
    } else {
      return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
    }
  }

  const generateRandomString = (config: RandomConfig): string => {
    let result = ''
    const chars = config.charset
    
    for (let i = 0; i < config.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  }

  const generateRandomList = (config: RandomConfig, inputItems: string[]): any[] => {
    if (!inputItems || inputItems.length === 0) {
      setError('Please enter items for the list')
      return []
    }

    const shuffled = [...inputItems].sort(() => Math.random() - 0.5)
    const count = Math.min(config.count, shuffled.length)
    
    return shuffled.slice(0, count)
  }

  const generateRandomColor = (): string => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const generateRandomDate = (): Date => {
    const start = new Date(2000, 0, 1)
    const end = new Date()
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const generateMultiple = (type: string, config: RandomConfig, inputItems?: string[]) => {
    const newResults: RandomResult[] = []
    
    for (let i = 0; i < config.count; i++) {
      let value: any
      const timestamp = new Date().toISOString()
      
      switch (type) {
        case 'number':
          value = generateRandomNumber(config)
          break
        case 'string':
          value = generateRandomString(config)
          break
        case 'list':
          value = generateRandomList(config, inputItems || [])
          break
        case 'color':
          value = generateRandomColor()
          break
        case 'date':
          value = generateRandomDate()
          break
        case 'uuid':
          value = generateUUID()
          break
        default:
          value = 'Unknown type'
      }
      
      newResults.push({
        type,
        value,
        timestamp
      })
    }
    
    setResults(prev => [...newResults, ...prev])
    setSuccess(true)
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadResults = () => {
    const content = JSON.stringify(results, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'random_results.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearResults = () => {
    setResults([])
    setSuccess(false)
    setError(null)
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice6 className="h-5 w-5" />
              Random Generator
            </CardTitle>
            <CardDescription>
              Generate random numbers, strings, colors, UUIDs, and more with customizable options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="numbers">Numbers</TabsTrigger>
                <TabsTrigger value="strings">Strings</TabsTrigger>
                <TabsTrigger value="lists">Lists</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="dates">Dates</TabsTrigger>
                <TabsTrigger value="uuids">UUIDs</TabsTrigger>
              </TabsList>

              <TabsContent value="numbers" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">Minimum Value</Label>
                    <Input
                      id="min"
                      type="number"
                      value={numberConfig[0].min}
                      onChange={(e) => numberConfig[1]({ ...numberConfig[0], min: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">Maximum Value</Label>
                    <Input
                      id="max"
                      type="number"
                      value={numberConfig[0].max}
                      onChange={(e) => numberConfig[1]({ ...numberConfig[0], max: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="decimal"
                    checked={numberConfig[0].decimal}
                    onCheckedChange={(checked) => 
                      numberConfig[1]({ ...numberConfig[0], decimal: checked as boolean })
                    }
                  />
                  <Label htmlFor="decimal" className="text-sm">Allow Decimal Numbers</Label>
                </div>

                <div>
                  <Label htmlFor="count-num">Number of Results</Label>
                  <Input
                    id="count-num"
                    type="number"
                    min="1"
                    max="100"
                    value={numberConfig[0].count}
                    onChange={(e) => numberConfig[1]({ ...numberConfig[0], count: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <Button
                  onClick={() => generateMultiple('number', numberConfig[0])}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Dice6 className="h-4 w-4 mr-2" />
                      Generate Random Numbers
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="strings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="length">String Length</Label>
                    <Input
                      id="length"
                      type="number"
                      min="1"
                      max="100"
                      value={stringConfig[0].length}
                      onChange={(e) => stringConfig[1]({ ...stringConfig[0], length: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="count-str">Number of Results</Label>
                    <Input
                      id="count-str"
                      type="number"
                      min="1"
                      max="100"
                      value={stringConfig[0].count}
                      onChange={(e) => stringConfig[1]({ ...stringConfig[0], count: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="charset">Character Set</Label>
                  <Select value={stringConfig[0].charset} onValueChange={(value) => 
                    stringConfig[1]({ ...stringConfig[0], charset: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789">
                        Alphanumeric
                      </SelectItem>
                      <SelectItem value="abcdefghijklmnopqrstuvwxyz">
                        Lowercase Letters
                      </SelectItem>
                      <SelectItem value="ABCDEFGHIJKLMNOPQRSTUVWXYZ">
                        Uppercase Letters
                      </SelectItem>
                      <SelectItem value="0123456789">
                        Numbers Only
                      </SelectItem>
                      <SelectItem value="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()">
                        Alphanumeric + Symbols
                      </SelectItem>
                      <SelectItem value="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}|:;'<>,.?/">
                        All Printable Characters
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => generateMultiple('string', stringConfig[0])}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Generate Random Strings
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="lists" className="space-y-4">
                <div>
                  <Label htmlFor="list-items">List Items (one per line)</Label>
                  <Textarea
                    id="list-items"
                    placeholder="Enter items, one per line..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="count-list">Number of Items to Select</Label>
                  <Input
                    id="count-list"
                    type="number"
                    min="1"
                    max="100"
                    value={listConfig[0].count}
                    onChange={(e) => listConfig[1]({ ...listConfig[0], count: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <Button
                  onClick={() => {
                    const inputItems = document.getElementById('list-items')?.textContent?.split('\n').filter(item => item.trim()) || []
                    generateMultiple('list', listConfig[0], inputItems)
                  }}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Shuffle & Select
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <div>
                  <Label htmlFor="count-color">Number of Colors</Label>
                  <Input
                    id="count-color"
                    type="number"
                    min="1"
                    max="50"
                    value={5}
                    onChange={(e) => {}}
                  />
                </div>

                <Button
                  onClick={() => {
                    const count = parseInt((document.getElementById('count-color') as HTMLInputElement)?.value || '5')
                    const config = { ...listConfig[0], count }
                    generateMultiple('color', config)
                  }}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Hash className="h-4 w-4 mr-2" />
                      Generate Random Colors
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <div>
                  <Label htmlFor="count-date">Number of Dates</Label>
                  <Input
                    id="count-date"
                    type="number"
                    min="1"
                    max="50"
                    value={5}
                    onChange={(e) => {}}
                  />
                </div>

                <Button
                  onClick={() => {
                    const count = parseInt((document.getElementById('count-date') as HTMLInputElement)?.value || '5')
                    const config = { ...listConfig[0], count }
                    generateMultiple('date', config)
                  }}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Random Dates
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="uuids" className="space-y-4">
                <div>
                  <Label htmlFor="count-uuid">Number of UUIDs</Label>
                  <Input
                    id="count-uuid"
                    type="number"
                    min="1"
                    max="50"
                    value={5}
                    onChange={(e) => {}}
                  />
                </div>

                <Button
                  onClick={() => {
                    const count = parseInt((document.getElementById('count-uuid') as HTMLInputElement)?.value || '5')
                    const config = { ...listConfig[0], count }
                    generateMultiple('uuid', config)
                  }}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Hash className="h-4 w-4 mr-2" />
                      Generate UUIDs
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && results.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700 text-sm">
                  Generated {results.length} random values!
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Results ({results.length})</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearResults}>
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {results.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{result.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-lg font-mono">
                            {result.type === 'number' ? formatNumber(result.value) :
                             result.type === 'date' ? formatDate(result.value as Date) :
                             result.type === 'color' ? (
                               <div className="flex items-center gap-2">
                                 <div 
                                   className="w-8 h-8 rounded border"
                                   style={{ backgroundColor: result.value }}
                                 />
                                 <span>{result.value}</span>
                               </div>
                             ) : String(result.value)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(String(result.value), index)}
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Random Numbers:</strong> Integers, decimals with custom ranges
            </div>
            <div>
              <strong>Random Strings:</strong> Customizable length and character sets
            </div>
            <div>
              <strong>List Shuffling:</strong> Random selection from custom lists
            </div>
            <div>
              <strong>Random Colors:</strong> Hex color code generation
            </div>
            <div>
              <strong>Random Dates:</strong> Date generation within ranges
            </div>
            <div>
              <strong>UUID Generation:</strong> Standard UUID v4 creation
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}