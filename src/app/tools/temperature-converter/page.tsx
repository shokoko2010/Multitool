'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Thermometer, Calculator } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TemperatureConverterTool() {
  const [celsius, setCelsius] = useState('')
  const [fahrenheit, setFahrenheit] = useState('')
  const [kelvin, setKelvin] = useState('')
  const [rankine, setRankine] = useState('')
  const [reaumur, setReaumur] = useState('')
  const [romer, setRomer] = useState('')
  const [delisle, setDelisle] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [inputUnit, setInputUnit] = useState('celsius')
  const { toast } = useToast()

  useEffect(() => {
    if (inputValue) {
      convertFromInput()
    } else {
      clearAll()
    }
  }, [inputValue, inputUnit])

  const celsiusToFahrenheit = (c: number) => (c * 9/5) + 32
  const celsiusToKelvin = (c: number) => c + 273.15
  const celsiusToRankine = (c: number) => (c + 273.15) * 9/5
  const celsiusToReaumur = (c: number) => c * 4/5
  const celsiusToRomer = (c: number) => (c * 21/40) + 7.5
  const celsiusToDelisle = (c: number) => (100 - c) * 3/2

  const fahrenheitToCelsius = (f: number) => (f - 32) * 5/9
  const kelvinToCelsius = (k: number) => k - 273.15
  const rankineToCelsius = (r: number) => (r - 491.67) * 5/9
  const reaumurToCelsius = (r: number) => r * 5/4
  const romerToCelsius = (r: number) => (r - 7.5) * 40/21
  const delisleToCelsius = (d: number) => (100 - d) * 2/3

  const convertFromInput = () => {
    const value = parseFloat(inputValue)
    if (isNaN(value)) {
      clearAll()
      return
    }

    let celsiusValue: number

    switch (inputUnit) {
      case 'celsius':
        celsiusValue = value
        break
      case 'fahrenheit':
        celsiusValue = fahrenheitToCelsius(value)
        break
      case 'kelvin':
        celsiusValue = kelvinToCelsius(value)
        break
      case 'rankine':
        celsiusValue = rankineToCelsius(value)
        break
      case 'reaumur':
        celsiusValue = reaumurToCelsius(value)
        break
      case 'romer':
        celsiusValue = romerToCelsius(value)
        break
      case 'delisle':
        celsiusValue = delisleToCelsius(value)
        break
      default:
        celsiusValue = value
    }

    setCelsius(celsiusValue.toFixed(2))
    setFahrenheit(celsiusToFahrenheit(celsiusValue).toFixed(2))
    setKelvin(celsiusToKelvin(celsiusValue).toFixed(2))
    setRankine(celsiusToRankine(celsiusValue).toFixed(2))
    setReaumur(celsiusToReaumur(celsiusValue).toFixed(2))
    setRomer(celsiusToRomer(celsiusValue).toFixed(2))
    setDelisle(celsiusToDelisle(celsiusValue).toFixed(2))
  }

  const clearAll = () => {
    setCelsius('')
    setFahrenheit('')
    setKelvin('')
    setRankine('')
    setReaumur('')
    setRomer('')
    setDelisle('')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const loadSampleValues = () => {
    setInputValue('25')
    setInputUnit('celsius')
  }

  const getTemperatureColor = (tempC: number) => {
    if (tempC <= 0) return 'text-blue-600'
    if (tempC <= 10) return 'text-blue-500'
    if (tempC <= 20) return 'text-green-600'
    if (tempC <= 30) return 'text-orange-500'
    if (tempC <= 40) return 'text-red-500'
    return 'text-red-700'
  }

  const getTemperatureEmoji = (tempC: number) => {
    if (tempC <= 0) return '🥶'
    if (tempC <= 10) return '❄️'
    if (tempC <= 20) return '😊'
    if (tempC <= 30) return '😎'
    if (tempC <= 40) return '🥵'
    return '🔥'
  }

  const temperatureData = [
    { unit: 'Celsius', symbol: '°C', value: celsius, description: 'Metric unit of temperature' },
    { unit: 'Fahrenheit', symbol: '°F', value: fahrenheit, description: 'Imperial unit of temperature' },
    { unit: 'Kelvin', symbol: 'K', value: kelvin, description: 'Absolute temperature scale' },
    { unit: 'Rankine', symbol: '°R', value: rankine, description: 'Absolute temperature scale in imperial units' },
    { unit: 'Réaumur', symbol: '°Ré', value: reaumur, description: 'Historical temperature scale' },
    { unit: 'Rømer', symbol: '°Rø', value: romer, description: 'Historical temperature scale' },
    { unit: 'Delisle', symbol: '°De', value: delisle, description: 'Historical temperature scale' }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Temperature Converter</h1>
        <p className="text-muted-foreground">
          Convert temperatures between different scales
        </p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Temperature Converter</TabsTrigger>
          <TabsTrigger value="reference">Temperature Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter" className="space-y-6">
          {/* Quick Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Quick Conversion
              </CardTitle>
              <CardDescription>
                Enter a temperature value and select the unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Temperature Value</Label>
                  <Input
                    type="number"
                    placeholder="Enter temperature"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>From Unit</Label>
                  <select 
                    value={inputUnit}
                    onChange={(e) => setInputUnit(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="kelvin">Kelvin (K)</option>
                    <option value="rankine">Rankine (°R)</option>
                    <option value="reaumur">Réaumur (°Ré)</option>
                    <option value="romer">Rømer (°Rø)</option>
                    <option value="delisle">Delisle (°De)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex gap-2">
                    <Button onClick={loadSampleValues} variant="outline" className="flex-1">
                      Load Sample
                    </Button>
                    <Button onClick={clearAll} variant="outline" className="flex-1">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Display */}
          {celsius && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Temperature Conversions
                </CardTitle>
                <CardDescription>
                  All temperature scales converted from your input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {temperatureData.map((temp, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{temp.unit}</div>
                          <div className="text-sm text-muted-foreground">{temp.description}</div>
                        </div>
                        <div className="text-2xl">{getTemperatureEmoji(parseFloat(temp.value) || 0)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${getTemperatureColor(parseFloat(temp.value) || 0)}`}>
                          {temp.value}
                        </div>
                        <div className="font-mono">{temp.symbol}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${temp.value} ${temp.symbol}`, `${temp.unit} temperature`)}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversion Formulas */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Formulas</CardTitle>
              <CardDescription>
                Mathematical formulas for temperature conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Celsius Conversions</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Fahrenheit:</strong> °F = (°C × 9/5) + 32</div>
                    <div><strong>Kelvin:</strong> K = °C + 273.15</div>
                    <div><strong>Rankine:</strong> °R = (°C + 273.15) × 9/5</div>
                    <div><strong>Réaumur:</strong> °Ré = °C × 4/5</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Reverse Conversions</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Celsius from °F:</strong> °C = (°F - 32) × 5/9</div>
                    <div><strong>Celsius from K:</strong> °C = K - 273.15</div>
                    <div><strong>Celsius from °R:</strong> °C = (°R - 491.67) × 5/9</div>
                    <div><strong>Celsius from °Ré:</strong> °C = °Ré × 5/4</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reference" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Common Temperature Reference</CardTitle>
                <CardDescription>
                  Real-world temperature examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { temp: -273.15, celsius: 'Absolute Zero', desc: 'Theoretical lowest temperature' },
                    { temp: -89.2, celsius: 'Coldest recorded (Antarctica)', desc: 'Vostok Station, 1983' },
                    { temp: -40, celsius: 'Equal point', desc: '-40°C = -40°F' },
                    { temp: 0, celsius: 'Freezing point of water', desc: 'At standard atmospheric pressure' },
                    { temp: 10, celsius: 'Cool day', desc: 'Comfortable spring temperature' },
                    { temp: 20, celsius: 'Room temperature', desc: 'Standard indoor temperature' },
                    { temp: 37, celsius: 'Human body temperature', desc: 'Normal body temperature' },
                    { temp: 100, celsius: 'Boiling point of water', desc: 'At standard atmospheric pressure' },
                    { temp: 154, celsius: 'Melting point of lead', desc: 'Lead melts at this temperature' },
                    { temp: 1000, celsius: 'Red heat', desc: 'Metal appears red hot' },
                    { temp: 5778, celsius: 'Surface temperature of Sun', desc: 'Effective temperature' }
                  ].map((ref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{ref.celsius}</div>
                        <div className="text-sm text-muted-foreground">{ref.desc}</div>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {ref.temp}°C
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Temperature Scales */}
            <Card>
              <CardHeader>
                <CardTitle>Temperature Scales</CardTitle>
                <CardDescription>
                  Different temperature scales and their properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Celsius (°C)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Metric scale where 0°C is freezing point of water and 100°C is boiling point at standard atmospheric pressure. Most commonly used scale worldwide.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Fahrenheit (°F)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Imperial scale where 32°F is freezing point of water and 212°F is boiling point at standard atmospheric pressure. Primarily used in the United States.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Kelvin (K)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Absolute temperature scale where 0K is absolute zero (the lowest possible temperature). Used in scientific calculations and has no negative values.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Other Historical Scales</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Rankine, Réaumur, Rømer, and Delisle are historical temperature scales that are rarely used today but are interesting from a historical perspective.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practical Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Temperature in Daily Life</CardTitle>
              <CardDescription>
                Temperature ranges for various applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { category: 'Cooking', range: '60-250°C', examples: ['Baking', 'Grilling', 'Slow cooking'] },
                  { category: 'Weather', range: '-40 to 50°C', examples: ['Winter', 'Summer', 'Extreme weather'] },
                  { category: 'Human Comfort', range: '18-24°C', examples: ['Room temperature', 'Office climate'] },
                  { category: 'Medical', range: '35-42°C', examples: ['Body temperature', 'Fever range'] },
                  { category: 'Industrial', range: '-200 to 1500°C', examples: ['Cryogenics', 'Metalworking'] },
                  { category: 'Electronics', range: '-40 to 85°C', examples: ['Operating range', 'Storage conditions'] }
                ].map((app, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="font-semibold">{app.category}</div>
                    <div className="text-sm text-blue-600 font-mono">{app.range}</div>
                    <div className="text-sm text-muted-foreground">
                      {app.examples.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}