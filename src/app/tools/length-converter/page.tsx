'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RotateCcw, ArrowRightLeft } from 'lucide-react'

const lengthUnits = [
  { value: 'mm', name: 'Millimeter (mm)', factor: 1 },
  { value: 'cm', name: 'Centimeter (cm)', factor: 10 },
  { value: 'm', name: 'Meter (m)', factor: 1000 },
  { value: 'km', name: 'Kilometer (km)', factor: 1000000 },
  { value: 'in', name: 'Inch (in)', factor: 25.4 },
  { value: 'ft', name: 'Foot (ft)', factor: 304.8 },
  { value: 'yd', name: 'Yard (yd)', factor: 914.4 },
  { value: 'mi', name: 'Mile (mi)', factor: 1609344 },
  { value: 'nmi', name: 'Nautical Mile (nmi)', factor: 1852000 },
  { value: 'µm', name: 'Micrometer (µm)', factor: 0.001 },
  { value: 'nm', name: 'Nanometer (nm)', factor: 0.000001 },
  { value: 'pm', name: 'Picometer (pm)', factor: 0.000000001 },
  { value: 'Å', name: 'Angstrom (Å)', factor: 0.0000001 },
]

export default function LengthConverter() {
  const [fromValue, setFromValue] = useState('')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [result, setResult] = useState('')

  const convertLength = () => {
    if (!fromValue) return

    const value = parseFloat(fromValue)
    if (isNaN(value)) return

    const fromFactor = lengthUnits.find(u => u.value === fromUnit)?.factor || 1
    const toFactor = lengthUnits.find(u => u.value === toUnit)?.factor || 1

    // Convert to millimeters first, then to target unit
    const mmValue = value * fromFactor
    const resultValue = mmValue / toFactor

    setResult(resultValue.toString())
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    if (result) {
      setFromValue(result)
      setResult(fromValue)
    }
  }

  const clearAll = () => {
    setFromValue('')
    setResult('')
  }

  const handleFromValueChange = (value: string) => {
    setFromValue(value)
    if (value) {
      // Auto-convert on input change
      setTimeout(() => {
        const valueElement = document.getElementById('fromValue') as HTMLInputElement
        if (valueElement) {
          valueElement.value = value
          convertLength()
        }
      }, 100)
    } else {
      setResult('')
    }
  }

  const getUnitName = (value: string) => {
    return lengthUnits.find(u => u.value === value)?.name || value
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Length Converter</h1>
          <p className="text-muted-foreground">
            Convert between different length units
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Length Conversion</CardTitle>
            <CardDescription>
              Enter a value and select units to convert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Unit */}
            <div className="space-y-2">
              <Label htmlFor="fromValue">From</Label>
              <div className="flex gap-2">
                <Input
                  id="fromValue"
                  type="number"
                  value={fromValue}
                  onChange={(e) => handleFromValueChange(e.target.value)}
                  placeholder="Enter value"
                  step="any"
                  className="flex-1"
                />
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengthUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {getUnitName(fromUnit)}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={swapUnits}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Swap
              </Button>
            </div>

            {/* To Unit */}
            <div className="space-y-2">
              <Label htmlFor="toValue">To</Label>
              <div className="flex gap-2">
                <Input
                  id="toValue"
                  value={result}
                  readOnly
                  placeholder="Result"
                  className="flex-1 bg-muted"
                />
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengthUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {getUnitName(toUnit)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={convertLength} disabled={!fromValue}>
                Convert
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Conversion Formula */}
            {result && fromValue && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Conversion Formula</h4>
                <p className="text-sm text-muted-foreground">
                  1 {fromUnit} = {(lengthUnits.find(u => u.value === fromUnit)?.factor || 1) / (lengthUnits.find(u => u.value === toUnit)?.factor || 1)} {toUnit}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {fromValue} {fromUnit} = {result} {toUnit}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Conversions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Common Length Conversions</CardTitle>
            <CardDescription>
              Quick reference for common length conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div><strong>Metric:</strong></div>
                <div>• 1 km = 1000 m</div>
                <div>• 1 m = 100 cm</div>
                <div>• 1 cm = 10 mm</div>
                <div>• 1 m = 1000 mm</div>
              </div>
              <div>
                <div><strong>Imperial:</strong></div>
                <div>• 1 ft = 12 in</div>
                <div>• 1 yd = 3 ft</div>
                <div>• 1 mi = 1760 yd</div>
                <div>• 1 mi = 5280 ft</div>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <div><strong>Cross-System:</strong></div>
              <div>• 1 in = 2.54 cm</div>
              <div>• 1 ft = 0.3048 m</div>
              <div>• 1 yd = 0.9144 m</div>
              <div>• 1 mi = 1.60934 km</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}