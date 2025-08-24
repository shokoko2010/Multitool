'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRightLeft, 
  Calculator, 
  Ruler, 
  Weight,
  Thermometer,
  Clock,
  Speed,
  Volume,
  Square,
  DollarSign,
  Copy,
  SwapHorizontal
} from 'lucide-react'

interface ConversionUnit {
  name: string
  symbol: string
  factor: number
  category: string
}

interface ConversionCategory {
  id: string
  name: string
  icon: React.ReactNode
  units: ConversionUnit[]
}

const conversionCategories: ConversionCategory[] = [
  {
    id: 'length',
    name: 'Length',
    icon: <Ruler className="h-5 w-5" />,
    units: [
      { name: 'Meter', symbol: 'm', factor: 1, category: 'length' },
      { name: 'Kilometer', symbol: 'km', factor: 1000, category: 'length' },
      { name: 'Centimeter', symbol: 'cm', factor: 0.01, category: 'length' },
      { name: 'Millimeter', symbol: 'mm', factor: 0.001, category: 'length' },
      { name: 'Mile', symbol: 'mi', factor: 1609.34, category: 'length' },
      { name: 'Yard', symbol: 'yd', factor: 0.9144, category: 'length' },
      { name: 'Foot', symbol: 'ft', factor: 0.3048, category: 'length' },
      { name: 'Inch', symbol: 'in', factor: 0.0254, category: 'length' }
    ]
  },
  {
    id: 'weight',
    name: 'Weight',
    icon: <Weight className="h-5 w-5" />,
    units: [
      { name: 'Kilogram', symbol: 'kg', factor: 1, category: 'weight' },
      { name: 'Gram', symbol: 'g', factor: 0.001, category: 'weight' },
      { name: 'Milligram', symbol: 'mg', factor: 0.000001, category: 'weight' },
      { name: 'Pound', symbol: 'lb', factor: 0.453592, category: 'weight' },
      { name: 'Ounce', symbol: 'oz', factor: 0.0283495, category: 'weight' },
      { name: 'Stone', symbol: 'st', factor: 6.35029, category: 'weight' },
      { name: 'Ton', symbol: 't', factor: 1000, category: 'weight' },
      { name: 'Carat', symbol: 'ct', factor: 0.0002, category: 'weight' }
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: <Thermometer className="h-5 w-5" />,
    units: [
      { name: 'Celsius', symbol: '°C', factor: 1, category: 'temperature' },
      { name: 'Fahrenheit', symbol: '°F', factor: 1, category: 'temperature' },
      { name: 'Kelvin', symbol: 'K', factor: 1, category: 'temperature' }
    ]
  },
  {
    id: 'time',
    name: 'Time',
    icon: <Clock className="h-5 w-5" />,
    units: [
      { name: 'Second', symbol: 's', factor: 1, category: 'time' },
      { name: 'Minute', symbol: 'min', factor: 60, category: 'time' },
      { name: 'Hour', symbol: 'h', factor: 3600, category: 'time' },
      { name: 'Day', symbol: 'd', factor: 86400, category: 'time' },
      { name: 'Week', symbol: 'week', factor: 604800, category: 'time' },
      { name: 'Month', symbol: 'month', factor: 2592000, category: 'time' },
      { name: 'Year', symbol: 'year', factor: 31536000, category: 'time' },
      { name: 'Decade', symbol: 'decade', factor: 315360000, category: 'time' }
    ]
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: <Speed className="h-5 w-5" />,
    units: [
      { name: 'Meter per Second', symbol: 'm/s', factor: 1, category: 'speed' },
      { name: 'Kilometer per Hour', symbol: 'km/h', factor: 0.277778, category: 'speed' },
      { name: 'Mile per Hour', symbol: 'mph', factor: 0.44704, category: 'speed' },
      { name: 'Knot', symbol: 'kn', factor: 0.514444, category: 'speed' },
      { name: 'Foot per Second', symbol: 'ft/s', factor: 0.3048, category: 'speed' }
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: <Volume className="h-5 w-5" />,
    units: [
      { name: 'Liter', symbol: 'L', factor: 1, category: 'volume' },
      { name: 'Milliliter', symbol: 'mL', factor: 0.001, category: 'volume' },
      { name: 'Cubic Meter', symbol: 'm³', factor: 1000, category: 'volume' },
      { name: 'Gallon', symbol: 'gal', factor: 3.78541, category: 'volume' },
      { name: 'Quart', symbol: 'qt', factor: 0.946353, category: 'volume' },
      { name: 'Pint', symbol: 'pt', factor: 0.473176, category: 'volume' },
      { name: 'Cup', symbol: 'cup', factor: 0.236588, category: 'volume' },
      { name: 'Fluid Ounce', symbol: 'fl oz', factor: 0.0295735, category: 'volume' }
    ]
  },
  {
    id: 'area',
    name: 'Area',
    icon: <Square className="h-5 w-5" />,
    units: [
      { name: 'Square Meter', symbol: 'm²', factor: 1, category: 'area' },
      { name: 'Square Kilometer', symbol: 'km²', factor: 1000000, category: 'area' },
      { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001, category: 'area' },
      { name: 'Square Mile', symbol: 'mi²', factor: 2589988, category: 'area' },
      { name: 'Acre', symbol: 'ac', factor: 4046.86, category: 'area' },
      { name: 'Hectare', symbol: 'ha', factor: 10000, category: 'area' },
      { name: 'Square Foot', symbol: 'ft²', factor: 0.092903, category: 'area' },
      { name: 'Square Inch', symbol: 'in²', factor: 0.00064516, category: 'area' }
    ]
  },
  {
    id: 'currency',
    name: 'Currency',
    icon: <DollarSign className="h-5 w-5" />,
    units: [
      { name: 'US Dollar', symbol: 'USD', factor: 1, category: 'currency' },
      { name: 'Euro', symbol: 'EUR', factor: 0.92, category: 'currency' },
      { name: 'British Pound', symbol: 'GBP', factor: 0.79, category: 'currency' },
      { name: 'Japanese Yen', symbol: 'JPY', factor: 149.5, category: 'currency' },
      { name: 'Canadian Dollar', symbol: 'CAD', factor: 1.35, category: 'currency' },
      { name: 'Australian Dollar', symbol: 'AUD', factor: 1.52, category: 'currency' },
      { name: 'Swiss Franc', symbol: 'CHF', factor: 0.88, category: 'currency' },
      { name: 'Chinese Yuan', symbol: 'CNY', factor: 7.23, category: 'currency' }
    ]
  }
]

interface ConversionHistory {
  id: string
  fromValue: number
  fromUnit: string
  toValue: number
  toUnit: string
  category: string
  timestamp: Date
}

export default function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState('length')
  const [fromValue, setFromValue] = useState('')
  const [toValue, setToValue] = useState('')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const currentCategory = conversionCategories.find(cat => cat.id === activeCategory)
  const fromUnitObj = currentCategory?.units.find(unit => unit.symbol === fromUnit)
  const toUnitObj = currentCategory?.units.find(unit => unit.symbol === toUnit)

  const convertValue = (value: number, from: ConversionUnit, to: ConversionUnit): number => {
    if (activeCategory === 'temperature') {
      // Special handling for temperature conversions
      if (from.symbol === '°C' && to.symbol === '°F') {
        return (value * 9/5) + 32
      } else if (from.symbol === '°F' && to.symbol === '°C') {
        return (value - 32) * 5/9
      } else if (from.symbol === '°C' && to.symbol === 'K') {
        return value + 273.15
      } else if (from.symbol === 'K' && to.symbol === '°C') {
        return value - 273.15
      } else if (from.symbol === '°F' && to.symbol === 'K') {
        return (value - 32) * 5/9 + 273.15
      } else if (from.symbol === 'K' && to.symbol === '°F') {
        return (value - 273.15) * 9/5 + 32
      }
      return value
    } else if (activeCategory === 'currency') {
      // For currency, use the exchange rates
      const usdValue = value / from.factor
      return usdValue * to.factor
    } else {
      // For all other units, use the factor-based conversion
      const baseValue = value * from.factor
      return baseValue / to.factor
    }
  }

  const handleFromValueChange = (value: string) => {
    setFromValue(value)
    
    if (!value.trim()) {
      setToValue('')
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      return
    }

    if (fromUnitObj && toUnitObj) {
      const result = convertValue(numValue, fromUnitObj, toUnitObj)
      setToValue(result.toFixed(6).replace(/\.?0+$/, ''))
      setError(null)
    }
  }

  const handleToValueChange = (value: string) => {
    setToValue(value)
    
    if (!value.trim()) {
      setFromValue('')
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      return
    }

    if (fromUnitObj && toUnitObj) {
      const result = convertValue(numValue, toUnitObj, fromUnitObj)
      setFromValue(result.toFixed(6).replace(/\.?0+$/, ''))
      setError(null)
    }
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    
    if (fromValue && toValue) {
      setFromValue(toValue)
      setToValue(fromValue)
    }
  }

  const addToHistory = () => {
    if (!fromValue || !toValue || !fromUnitObj || !toUnitObj) return

    const historyItem: ConversionHistory = {
      id: Math.random().toString(36).substr(2, 9),
      fromValue: parseFloat(fromValue),
      fromUnit: fromUnit,
      toValue: parseFloat(toValue),
      toUnit: toUnit,
      category: activeCategory,
      timestamp: new Date()
    }

    setConversionHistory(prev => [historyItem, ...prev.slice(0, 19)])
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    const category = conversionCategories.find(cat => cat.id === categoryId)
    if (category && category.units.length >= 2) {
      setFromUnit(category.units[0].symbol)
      setToUnit(category.units[1].symbol)
      setFromValue('')
      setToValue('')
      setError(null)
    }
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      useGrouping: true
    })
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Unit Converter
          </CardTitle>
          <CardDescription>
            Convert between different units of measurement across multiple categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {conversionCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                {category.icon}
                <span className="text-xs">{category.name}</span>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={fromValue}
                    onChange={(e) => handleFromValueChange(e.target.value)}
                    placeholder="Enter value"
                    className="flex-1"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[80px]"
                  >
                    {currentCategory?.units.map((unit) => (
                      <option key={unit.symbol} value={unit.symbol}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                {fromUnitObj && (
                  <div className="text-sm text-muted-foreground">
                    {fromUnitObj.name}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={swapUnits}>
                  <SwapHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={toValue}
                    onChange={(e) => handleToValueChange(e.target.value)}
                    placeholder="Result"
                    className="flex-1"
                  />
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[80px]"
                  >
                    {currentCategory?.units.map((unit) => (
                      <option key={unit.symbol} value={unit.symbol}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                {toUnitObj && (
                  <div className="text-sm text-muted-foreground">
                    {toUnitObj.name}
                  </div>
                )}
              </div>

              {fromValue && toValue && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addToHistory} className="flex-1">
                    Save to History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`${fromValue} ${fromUnit} = ${toValue} ${toUnit}`, 'result')}
                  >
                    {copied === 'result' ? 'Copied!' : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Conversion Formula</Label>
                <Card>
                  <CardContent className="p-4">
                    {currentCategory && fromUnitObj && toUnitObj && (
                      <div className="text-sm space-y-2">
                        <div className="font-medium">
                          1 {fromUnitObj.symbol} = {formatNumber(convertValue(1, fromUnitObj, toUnitObj))} {toUnitObj.symbol}
                        </div>
                        <div className="font-medium">
                          1 {toUnitObj.symbol} = {formatNumber(convertValue(1, toUnitObj, fromUnitObj))} {fromUnitObj.symbol}
                        </div>
                        {activeCategory === 'temperature' && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Temperature conversions use special formulas
                          </div>
                        )}
                        {activeCategory === 'currency' && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Exchange rates are for demonstration only
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>All Units in {currentCategory?.name}</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {currentCategory?.units.map((unit) => (
                    <div key={unit.symbol} className="p-2 border rounded text-sm">
                      <div className="font-medium">{unit.symbol}</div>
                      <div className="text-xs text-muted-foreground">{unit.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {fromValue && toValue && (
                <div className="space-y-2">
                  <Label>Quick Copy</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(fromValue, 'from')}
                    >
                      {copied === 'from' ? 'Copied!' : `Copy ${fromValue}`}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(toValue, 'to')}
                    >
                      {copied === 'to' ? 'Copied!' : `Copy ${toValue}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="common">Common Conversions</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Conversion History</h3>
                {conversionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversion history yet</p>
                    <p className="text-sm text-muted-foreground">Your conversions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {conversionHistory.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">
                                {formatNumber(item.fromValue)} {item.fromUnit} = {formatNumber(item.toValue)} {item.toUnit}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.timestamp.toLocaleString()}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="common" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Common Conversions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Length</div>
                      <div className="space-y-1 text-sm">
                        <div>1 foot = 12 inches</div>
                        <div>1 yard = 3 feet</div>
                        <div>1 mile = 1.609 kilometers</div>
                        <div>1 meter = 3.281 feet</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Weight</div>
                      <div className="space-y-1 text-sm">
                        <div>1 pound = 16 ounces</div>
                        <div>1 kilogram = 2.205 pounds</div>
                        <div>1 stone = 14 pounds</div>
                        <div>1 ton = 2000 pounds</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Volume</div>
                      <div className="space-y-1 text-sm">
                        <div>1 gallon = 4 quarts</div>
                        <div>1 quart = 2 pints</div>
                        <div>1 pint = 2 cups</div>
                        <div>1 liter = 1.057 quarts</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Temperature</div>
                      <div className="space-y-1 text-sm">
                        <div>Water freezes: 0°C = 32°F</div>
                        <div>Water boils: 100°C = 212°F</div>
                        <div>Room temperature: ~20°C = 68°F</div>
                        <div>Body temperature: 37°C = 98.6°F</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}