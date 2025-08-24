'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, RotateCcw, Calculator } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Unit {
  name: string
  symbol: string
  factor: number
  offset?: number
}

interface UnitCategory {
  name: string
  units: Unit[]
}

const unitCategories: UnitCategory[] = [
  {
    name: 'Length',
    units: [
      { name: 'Meter', symbol: 'm', factor: 1 },
      { name: 'Kilometer', symbol: 'km', factor: 1000 },
      { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { name: 'Mile', symbol: 'mi', factor: 1609.344 },
      { name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { name: 'Inch', symbol: 'in', factor: 0.0254 },
      { name: 'Nautical Mile', symbol: 'nmi', factor: 1852 }
    ]
  },
  {
    name: 'Weight',
    units: [
      { name: 'Kilogram', symbol: 'kg', factor: 1 },
      { name: 'Gram', symbol: 'g', factor: 0.001 },
      { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
      { name: 'Pound', symbol: 'lb', factor: 0.453592 },
      { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
      { name: 'Stone', symbol: 'st', factor: 6.35029 },
      { name: 'Ton', symbol: 't', factor: 1000 },
      { name: 'Metric Ton', symbol: 'mt', factor: 1000 }
    ]
  },
  {
    name: 'Temperature',
    units: [
      { name: 'Celsius', symbol: '°C', factor: 1, offset: 0 },
      { name: 'Fahrenheit', symbol: '°F', factor: 1.8, offset: 32 },
      { name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15 },
      { name: 'Rankine', symbol: '°R', factor: 1.8, offset: 491.67 }
    ]
  },
  {
    name: 'Area',
    units: [
      { name: 'Square Meter', symbol: 'm²', factor: 1 },
      { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
      { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001 },
      { name: 'Square Mile', symbol: 'mi²', factor: 2589988.11 },
      { name: 'Square Yard', symbol: 'yd²', factor: 0.836127 },
      { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
      { name: 'Acre', symbol: 'ac', factor: 4046.86 },
      { name: 'Hectare', symbol: 'ha', factor: 10000 }
    ]
  },
  {
    name: 'Volume',
    units: [
      { name: 'Liter', symbol: 'L', factor: 1 },
      { name: 'Milliliter', symbol: 'mL', factor: 0.001 },
      { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
      { name: 'Gallon', symbol: 'gal', factor: 3.78541 },
      { name: 'Quart', symbol: 'qt', factor: 0.946353 },
      { name: 'Pint', symbol: 'pt', factor: 0.473176 },
      { name: 'Cup', symbol: 'cup', factor: 0.236588 },
      { name: 'Fluid Ounce', symbol: 'fl oz', factor: 0.0295735 }
    ]
  },
  {
    name: 'Speed',
    units: [
      { name: 'Meter per Second', symbol: 'm/s', factor: 1 },
      { name: 'Kilometer per Hour', symbol: 'km/h', factor: 0.277778 },
      { name: 'Mile per Hour', symbol: 'mph', factor: 0.44704 },
      { name: 'Foot per Second', symbol: 'ft/s', factor: 0.3048 },
      { name: 'Knot', symbol: 'kn', factor: 0.514444 },
      { name: 'Mach', symbol: 'M', factor: 343 }
    ]
  },
  {
    name: 'Time',
    units: [
      { name: 'Second', symbol: 's', factor: 1 },
      { name: 'Minute', symbol: 'min', factor: 60 },
      { name: 'Hour', symbol: 'h', factor: 3600 },
      { name: 'Day', symbol: 'd', factor: 86400 },
      { name: 'Week', symbol: 'week', factor: 604800 },
      { name: 'Month', symbol: 'month', factor: 2629746 },
      { name: 'Year', symbol: 'year', factor: 31556952 }
    ]
  },
  {
    name: 'Data Storage',
    units: [
      { name: 'Byte', symbol: 'B', factor: 1 },
      { name: 'Kilobyte', symbol: 'KB', factor: 1024 },
      { name: 'Megabyte', symbol: 'MB', factor: 1048576 },
      { name: 'Gigabyte', symbol: 'GB', factor: 1073741824 },
      { name: 'Terabyte', symbol: 'TB', factor: 1099511627776 },
      { name: 'Petabyte', symbol: 'PB', factor: 1125899906842624 },
      { name: 'Bit', symbol: 'b', factor: 0.125 },
      { name: 'Kilobit', symbol: 'Kb', factor: 128 }
    ]
  }
]

export default function UnitConverterAdvanced() {
  const [selectedCategory, setSelectedCategory] = useState('Length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [fromValue, setFromValue] = useState('')
  const [toValue, setToValue] = useState('')
  const [conversionHistory, setConversionHistory] = useState<string[]>([])
  const { toast } = useToast()

  const getCurrentCategory = (): UnitCategory => {
    return unitCategories.find(cat => cat.name === selectedCategory) || unitCategories[0]
  }

  const convertValue = (value: number, from: Unit, to: Unit): number => {
    if (from.offset !== undefined || to.offset !== undefined) {
      // Temperature conversion
      const celsiusValue = (value - (from.offset || 0)) / from.factor
      return celsiusValue * to.factor + (to.offset || 0)
    } else {
      // Regular unit conversion
      const baseValue = value * from.factor
      return baseValue / to.factor
    }
  }

  const handleConvert = () => {
    if (!fromValue.trim()) return

    const category = getCurrentCategory()
    const from = category.units.find(u => u.symbol === fromUnit)
    const to = category.units.find(u => u.symbol === toUnit)

    if (!from || !to) return

    const inputValue = parseFloat(fromValue)
    if (isNaN(inputValue)) return

    const result = convertValue(inputValue, from, to)
    setToValue(result.toString())

    // Add to history
    const historyEntry = `${inputValue} ${from.symbol} = ${result.toFixed(6)} ${to.symbol}`
    setConversionHistory(prev => [historyEntry, ...prev.slice(0, 9)])
  }

  const handleFromValueChange = (value: string) => {
    setFromValue(value)
    if (value.trim()) {
      const inputValue = parseFloat(value)
      if (!isNaN(inputValue)) {
        const category = getCurrentCategory()
        const from = category.units.find(u => u.symbol === fromUnit)
        const to = category.units.find(u => u.symbol === toUnit)

        if (from && to) {
          const result = convertValue(inputValue, from, to)
          setToValue(result.toString())
        }
      }
    } else {
      setToValue('')
    }
  }

  const handleToValueChange = (value: string) => {
    setToValue(value)
    if (value.trim()) {
      const inputValue = parseFloat(value)
      if (!isNaN(inputValue)) {
        const category = getCurrentCategory()
        const from = category.units.find(u => u.symbol === fromUnit)
        const to = category.units.find(u => u.symbol === toUnit)

        if (from && to) {
          const result = convertValue(inputValue, to, from)
          setFromValue(result.toString())
        }
      }
    } else {
      setFromValue('')
    }
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)
    setToValue(fromValue)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Value has been copied to clipboard",
    })
  }

  const clearAll = () => {
    setFromValue('')
    setToValue('')
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const newCategory = unitCategories.find(cat => cat.name === category)
    if (newCategory && newCategory.units.length >= 2) {
      setFromUnit(newCategory.units[0].symbol)
      setToUnit(newCategory.units[1].symbol)
    }
    setFromValue('')
    setToValue('')
  }

  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1000000) {
      return num.toExponential(2)
    } else if (Math.abs(num) >= 1000) {
      return num.toFixed(2)
    } else if (Math.abs(num) >= 0.01) {
      return num.toFixed(6)
    } else {
      return num.toExponential(2)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Advanced Unit Converter
          </CardTitle>
          <CardDescription>
            Convert between different units of measurement across multiple categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category:</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Converter */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>From:</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getCurrentCategory().units.map((unit) => (
                          <SelectItem key={unit.symbol} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={fromValue}
                      onChange={(e) => handleFromValueChange(e.target.value)}
                      placeholder="Enter value..."
                      type="number"
                      step="any"
                    />
                  </div>

                  <div className="flex justify-center items-center pb-8">
                    <Button variant="outline" onClick={swapUnits}>
                      Swap
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>To:</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getCurrentCategory().units.map((unit) => (
                          <SelectItem key={unit.symbol} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={toValue}
                      onChange={(e) => handleToValueChange(e.target.value)}
                      placeholder="Result..."
                      type="number"
                      step="any"
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={handleConvert} disabled={!fromValue.trim()}>
                    Convert
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  {toValue && (
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(`${fromValue} ${fromUnit} = ${toValue} ${toUnit}`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Table</CardTitle>
                <CardDescription>
                  Quick reference for common conversions in {selectedCategory}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Unit</th>
                        <th className="text-left p-2">Symbol</th>
                        <th className="text-right p-2">Value (Base Unit)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentCategory().units.map((unit) => (
                        <tr key={unit.symbol} className="border-b">
                          <td className="p-2">{unit.name}</td>
                          <td className="p-2 font-mono">{unit.symbol}</td>
                          <td className="p-2 text-right font-mono">
                            {unit.offset !== undefined 
                              ? `${unit.factor}° + ${unit.offset}`
                              : formatNumber(unit.factor)
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {conversionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {conversionHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="p-2 bg-muted rounded text-sm font-mono cursor-pointer hover:bg-muted/80"
                        onClick={() => copyToClipboard(entry)}
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Conversions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Conversions</CardTitle>
                <CardDescription>
                  Click any value for instant conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedCategory === 'Length' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('1')
                          setFromUnit('m')
                          setToUnit('ft')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">1 meter</div>
                        <div className="text-xs text-muted-foreground">to feet</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('1')
                          setFromUnit('mi')
                          setToUnit('km')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">1 mile</div>
                        <div className="text-xs text-muted-foreground">to km</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('1')
                          setFromUnit('in')
                          setToUnit('cm')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">1 inch</div>
                        <div className="text-xs text-muted-foreground">to cm</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('100')
                          setFromUnit('yd')
                          setToUnit('m')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">100 yards</div>
                        <div className="text-xs text-muted-foreground">to meters</div>
                      </Button>
                    </>
                  )}
                  
                  {selectedCategory === 'Weight' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('1')
                          setFromUnit('kg')
                          setToUnit('lb')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">1 kg</div>
                        <div className="text-xs text-muted-foreground">to pounds</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('1')
                          setFromUnit('lb')
                          setToUnit('oz')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">1 pound</div>
                        <div className="text-xs text-muted-foreground">to ounces</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('1')
                          setFromUnit('oz')
                          setToUnit('g')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">1 ounce</div>
                        <div className="text-xs text-muted-foreground">to grams</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('1')
                          setFromUnit('st')
                          setToUnit('kg')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">1 stone</div>
                        <div className="text-xs text-muted-foreground">to kg</div>
                      </Button>
                    </>
                  )}
                  
                  {selectedCategory === 'Temperature' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('0')
                          setFromUnit('°C')
                          setToUnit('°F')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">0°C</div>
                        <div className="text-xs text-muted-foreground">to °F</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('32')
                          setFromUnit('°F')
                          setToUnit('°C')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">32°F</div>
                        <div className="text-xs text-muted-foreground">to °C</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('100')
                          setFromUnit('°C')
                          setToUnit('K')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">100°C</div>
                        <div className="text-xs text-muted-foreground">to Kelvin</div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFromValue('0')
                          setFromUnit('K')
                          setToUnit('°C')
                          handleConvert()
                        }}
                        className="h-auto p-3"
                      >
                        <div className="text-sm">0K</div>
                        <div className="text-xs text-muted-foreground">to °C</div>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Select a category from the dropdown menu</li>
                <li>• Choose your source and target units</li>
                <li>• Enter a value to see instant conversion</li>
                <li>• Use the swap button to reverse the conversion</li>
                <li>• Click quick conversions for common values</li>
                <li>• Copy results to clipboard for easy sharing</li>
                <li>• View recent conversions in the history section</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}