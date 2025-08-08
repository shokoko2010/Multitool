'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Ruler, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DistanceConverterTool() {
  const [meters, setMeters] = useState('')
  const [kilometers, setKilometers] = useState('')
  const [centimeters, setCentimeters] = useState('')
  const [millimeters, setMillimeters] = useState('')
  const [miles, setMiles] = useState('')
  const [yards, setYards] = useState('')
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')
  const [nauticalMiles, setNauticalMiles] = useState('')
  const [astronomicalUnits, setAstronomicalUnits] = useState('')
  const [lightYears, setLightYears] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [inputUnit, setInputUnit] = useState('meters')
  const { toast } = useToast()

  useEffect(() => {
    if (inputValue) {
      convertFromInput()
    } else {
      clearAll()
    }
  }, [inputValue, inputUnit])

  const metersToKilometers = (m: number) => m / 1000
  const metersToCentimeters = (m: number) => m * 100
  const metersToMillimeters = (m: number) => m * 1000
  const metersToMiles = (m: number) => m / 1609.344
  const metersToYards = (m: number) => m * 1.09361
  const metersToFeet = (m: number) => m * 3.28084
  const metersToInches = (m: number) => m * 39.3701
  const metersToNauticalMiles = (m: number) => m / 1852
  const metersToAstronomicalUnits = (m: number) => m / 149597870700
  const metersToLightYears = (m: number) => m / 9460730472580800

  const kilometersToMeters = (k: number) => k * 1000
  const milesToMeters = (mi: number) => mi * 1609.344
  const yardsToMeters = (y: number) => y / 1.09361
  const feetToMeters = (ft: number) => ft / 3.28084
  const inchesToMeters = (inch: number) => inch / 39.3701
  const nauticalMilesToMeters = (nm: number) => nm * 1852
  const astronomicalUnitsToMeters = (au: number) => au * 149597870700
  const lightYearsToMeters = (ly: number) => ly * 9460730472580800

  const convertFromInput = () => {
    const value = parseFloat(inputValue)
    if (isNaN(value)) {
      clearAll()
      return
    }

    let metersValue: number

    switch (inputUnit) {
      case 'meters':
        metersValue = value
        break
      case 'kilometers':
        metersValue = kilometersToMeters(value)
        break
      case 'miles':
        metersValue = milesToMeters(value)
        break
      case 'yards':
        metersValue = yardsToMeters(value)
        break
      case 'feet':
        metersValue = feetToMeters(value)
        break
      case 'inches':
        metersValue = inchesToMeters(value)
        break
      case 'nautical-miles':
        metersValue = nauticalMilesToMeters(value)
        break
      case 'astronomical-units':
        metersValue = astronomicalUnitsToMeters(value)
        break
      case 'light-years':
        metersValue = lightYearsToMeters(value)
        break
      default:
        metersValue = value
    }

    setMeters(metersValue.toFixed(6))
    setKilometers(metersToKilometers(metersValue).toFixed(6))
    setCentimeters(metersToCentimeters(metersValue).toFixed(6))
    setMillimeters(metersToMillimeters(metersValue).toFixed(6))
    setMiles(metersToMiles(metersValue).toFixed(6))
    setYards(metersToYards(metersValue).toFixed(6))
    setFeet(metersToFeet(metersValue).toFixed(6))
    setInches(metersToInches(metersValue).toFixed(6))
    setNauticalMiles(metersToNauticalMiles(metersValue).toFixed(6))
    setAstronomicalUnits(metersToAstronomicalUnits(metersValue).toFixed(12))
    setLightYears(metersToLightYears(metersValue).toFixed(15))
  }

  const clearAll = () => {
    setMeters('')
    setKilometers('')
    setCentimeters('')
    setMillimeters('')
    setMiles('')
    setYards('')
    setFeet('')
    setInches('')
    setNauticalMiles('')
    setAstronomicalUnits('')
    setLightYears('')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const loadSampleValues = () => {
    setInputValue('1000')
    setInputUnit('meters')
  }

  const getDistanceCategory = (distance: number) => {
    if (distance < 1) return { category: 'Small', emoji: '🔍', color: 'text-blue-600' }
    if (distance < 1000) return { category: 'Medium', emoji: '🚶', color: 'text-green-600' }
    if (distance < 1000000) return { category: 'Large', emoji: '🚗', color: 'text-orange-600' }
    if (distance < 1000000000) return { category: 'Very Large', emoji: '✈️', color: 'text-red-600' }
    return { category: 'Astronomical', emoji: '🌌', color: 'text-purple-600' }
  }

  const distanceData = [
    { unit: 'Meters', symbol: 'm', value: meters, description: 'SI unit of length' },
    { unit: 'Kilometers', symbol: 'km', value: kilometers, description: '1000 meters' },
    { unit: 'Centimeters', symbol: 'cm', value: centimeters, description: '1/100 of a meter' },
    { unit: 'Millimeters', symbol: 'mm', value: millimeters, description: '1/1000 of a meter' },
    { unit: 'Miles', symbol: 'mi', value: miles, description: 'Imperial unit of distance' },
    { unit: 'Yards', symbol: 'yd', value: yards, description: 'Imperial unit of distance' },
    { unit: 'Feet', symbol: 'ft', value: feet, description: 'Imperial unit of distance' },
    { unit: 'Inches', symbol: 'in', value: inches, description: 'Imperial unit of distance' },
    { unit: 'Nautical Miles', symbol: 'nmi', value: nauticalMiles, description: 'Marine navigation unit' },
    { unit: 'Astronomical Units', symbol: 'AU', value: astronomicalUnits, description: 'Distance from Earth to Sun' },
    { unit: 'Light Years', symbol: 'ly', value: lightYears, description: 'Distance light travels in one year' }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Distance Converter</h1>
        <p className="text-muted-foreground">
          Convert distances between different units
        </p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Distance Converter</TabsTrigger>
          <TabsTrigger value="reference">Distance Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter" className="space-y-6">
          {/* Quick Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Quick Conversion
              </CardTitle>
              <CardDescription>
                Enter a distance value and select the unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Distance Value</Label>
                  <Input
                    type="number"
                    placeholder="Enter distance"
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
                    <option value="meters">Meters (m)</option>
                    <option value="kilometers">Kilometers (km)</option>
                    <option value="miles">Miles (mi)</option>
                    <option value="yards">Yards (yd)</option>
                    <option value="feet">Feet (ft)</option>
                    <option value="inches">Inches (in)</option>
                    <option value="nautical-miles">Nautical Miles (nmi)</option>
                    <option value="astronomical-units">Astronomical Units (AU)</option>
                    <option value="light-years">Light Years (ly)</option>
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

          {/* Distance Display */}
          {meters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Distance Conversions
                </CardTitle>
                <CardDescription>
                  All distance units converted from your input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {distanceData.map((distance, index) => {
                    const numValue = parseFloat(distance.value) || 0
                    const category = getDistanceCategory(numValue)
                    
                    return (
                      <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{distance.unit}</div>
                            <div className="text-sm text-muted-foreground">{distance.description}</div>
                          </div>
                          <div className="text-xl">{category.emoji}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`text-xl font-bold ${category.color}`}>
                            {distance.value}
                          </div>
                          <div className="font-mono text-sm">{distance.symbol}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.category}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(`${distance.value} ${distance.symbol}`, `${distance.unit} distance`)}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversion Formulas */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Formulas</CardTitle>
              <CardDescription>
                Mathematical formulas for distance conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Metric Conversions</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Kilometers to Meters:</strong> m = km × 1000</div>
                    <div><strong>Meters to Kilometers:</strong> km = m ÷ 1000</div>
                    <div><strong>Centimeters to Meters:</strong> m = cm ÷ 100</div>
                    <div><strong>Meters to Centimeters:</strong> cm = m × 100</div>
                    <div><strong>Millimeters to Meters:</strong> m = mm ÷ 1000</div>
                    <div><strong>Meters to Millimeters:</strong> mm = m × 1000</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Imperial Conversions</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Miles to Meters:</strong> m = mi × 1609.344</div>
                    <div><strong>Yards to Meters:</strong> m = yd × 0.9144</div>
                    <div><strong>Feet to Meters:</strong> m = ft × 0.3048</div>
                    <div><strong>Inches to Meters:</strong> m = in × 0.0254</div>
                    <div><strong>Nautical Miles to Meters:</strong> m = nmi × 1852</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reference" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distance Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Common Distance Reference</CardTitle>
                <CardDescription>
                  Real-world distance examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { distance: 0.001, unit: '1 mm', desc: 'Thickness of a credit card' },
                    { distance: 0.01, unit: '1 cm', desc: 'Width of a fingernail' },
                    { distance: 0.1, unit: '10 cm', desc: 'Length of a dollar bill' },
                    { distance: 1, unit: '1 m', desc: 'Height of a doorknob from floor' },
                    { distance: 10, unit: '10 m', desc: 'Length of a standard bus' },
                    { distance: 100, unit: '100 m', desc: 'Length of a football field' },
                    { distance: 1000, unit: '1 km', desc: 'Distance walked in 10-15 minutes' },
                    { distance: 10000, unit: '10 km', desc: 'Marathon distance (26.2 km)' },
                    { distance: 40075, unit: '40,075 km', desc: 'Earth\'s equatorial circumference' },
                    { distance: 149597870.7, unit: '1 AU', desc: 'Average Earth-Sun distance' },
                    { distance: 9.461e15, unit: '1 light year', desc: 'Distance light travels in one year' }
                  ].map((ref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{ref.desc}</div>
                        <div className="text-sm text-muted-foreground">{ref.unit}</div>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {ref.distance} m
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Measurement Systems */}
            <Card>
              <CardHeader>
                <CardTitle>Measurement Systems</CardTitle>
                <CardDescription>
                  Different measurement systems and their uses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Metric System</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Decimal-based system used worldwide. Units are related by powers of 10. Standard units: meter (length), gram (mass), liter (volume).
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Imperial/US Customary</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Used primarily in the United States. Units have historical origins and complex relationships. Standard units: inch, foot, yard, mile.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Maritime Units</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Nautical mile based on the Earth's circumference. 1 nautical mile = 1 minute of latitude. Used in navigation and aviation.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Astronomical Units</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Used for measuring vast cosmic distances. Light years and astronomical units help comprehend the scale of the universe.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distance in Daily Life */}
          <Card>
            <CardHeader>
              <CardTitle>Distance in Daily Life</CardTitle>
              <CardDescription>
                Distance ranges for various activities and scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { category: 'Human Scale', range: '0.1 - 2 m', examples: ['Step length', 'Room height', 'Door width'] },
                  { category: 'Urban', range: '0.1 - 50 km', examples: ['City blocks', 'Urban commuting', 'Marathon'] },
                  { category: 'Geographic', range: '10 - 1000 km', examples: ['State distances', 'Country sizes', 'Flight distances'] },
                  { category: 'Planetary', range: '1000 - 40000 km', examples: ['Earth circumference', 'Moon distance', 'Satellite orbits'] },
                  { category: 'Solar System', range: '0.1 - 100 AU', examples: ['Planet orbits', 'Asteroid belt', 'Kuiper belt'] },
                  { category: 'Interstellar', range: '1 - 1000 light years', examples: ['Nearby stars', 'Galactic center', 'Star clusters'] }
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

          {/* Fun Distance Facts */}
          <Card>
            <CardHeader>
              <CardTitle>Interesting Distance Facts</CardTitle>
              <CardDescription>
                  Fascinating facts about distances and measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { fact: 'A light year is a unit of distance, not time', detail: 'It\'s the distance light travels in one year (about 9.46 trillion kilometers)' },
                  { fact: 'The meter was originally defined', detail: 'As one ten-millionth of the distance from the equator to the North Pole' },
                  { fact: 'Your fingerprint is about 1 cm long', detail: 'Human fingerprints are typically 8-10 cm in perimeter' },
                  { fact: 'The Earth\'s circumference', detail: 'Is about 40,075 km at the equator and 40,008 km around the poles' },
                  { fact: 'A marathon is 42.195 km', detail: 'The distance was standardized in 1921 based on the 1908 Olympic course' },
                  { fact: 'The speed of light', detail: 'Is exactly 299,792,458 meters per second in vacuum' }
                ].map((fact, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="font-semibold">{fact.fact}</div>
                    <div className="text-sm text-muted-foreground">{fact.detail}</div>
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