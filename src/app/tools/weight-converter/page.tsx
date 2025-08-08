'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Scale, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function WeightConverterTool() {
  const [kilograms, setKilograms] = useState('')
  const [grams, setGrams] = useState('')
  const [milligrams, setMilligrams] = useState('')
  const [metricTons, setMetricTons] = useState('')
  const [pounds, setPounds] = useState('')
  const [ounces, setOunces] = useState('')
  const [stones, setStones] = useState('')
  const [usTons, setUsTons] = useState('')
  const [imperialTons, setImperialTons] = useState('')
  const [carats, setCarats] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [inputUnit, setInputUnit] = useState('kilograms')
  const { toast } = useToast()

  useEffect(() => {
    if (inputValue) {
      convertFromInput()
    } else {
      clearAll()
    }
  }, [inputValue, inputUnit])

  const kilogramsToGrams = (kg: number) => kg * 1000
  const kilogramsToMilligrams = (kg: number) => kg * 1000000
  const kilogramsToMetricTons = (kg: number) => kg / 1000
  const kilogramsToPounds = (kg: number) => kg * 2.20462
  const kilogramsToOunces = (kg: number) => kg * 35.274
  const kilogramsToStones = (kg: number) => kg * 0.157473
  const kilogramsToUsTons = (kg: number) => kg / 907.185
  const kilogramsToImperialTons = (kg: number) => kg / 1016.05
  const kilogramsToCarats = (kg: number) => kg * 5000

  const gramsToKilograms = (g: number) => g / 1000
  const poundsToKilograms = (lb: number) => lb / 2.20462
  const ouncesToKilograms = (oz: number) => oz / 35.274
  const stonesToKilograms = (st: number) => st / 0.157473
  const usTonsToKilograms = (ton: number) => ton * 907.185
  const imperialTonsToKilograms = (ton: number) => ton * 1016.05
  const caratsToKilograms = (ct: number) => ct / 5000

  const convertFromInput = () => {
    const value = parseFloat(inputValue)
    if (isNaN(value)) {
      clearAll()
      return
    }

    let kilogramsValue: number

    switch (inputUnit) {
      case 'kilograms':
        kilogramsValue = value
        break
      case 'grams':
        kilogramsValue = gramsToKilograms(value)
        break
      case 'milligrams':
        kilogramsValue = value / 1000000
        break
      case 'metric-tons':
        kilogramsValue = value * 1000
        break
      case 'pounds':
        kilogramsValue = poundsToKilograms(value)
        break
      case 'ounces':
        kilogramsValue = ouncesToKilograms(value)
        break
      case 'stones':
        kilogramsValue = stonesToKilograms(value)
        break
      case 'us-tons':
        kilogramsValue = usTonsToKilograms(value)
        break
      case 'imperial-tons':
        kilogramsValue = imperialTonsToKilograms(value)
        break
      case 'carats':
        kilogramsValue = caratsToKilograms(value)
        break
      default:
        kilogramsValue = value
    }

    setKilograms(kilogramsValue.toFixed(6))
    setGrams(kilogramsToGrams(kilogramsValue).toFixed(6))
    setMilligrams(kilogramsToMilligrams(kilogramsValue).toFixed(6))
    setMetricTons(kilogramsToMetricTons(kilogramsValue).toFixed(6))
    setPounds(kilogramsToPounds(kilogramsValue).toFixed(6))
    setOunces(kilogramsToOunces(kilogramsValue).toFixed(6))
    setStones(kilogramsToStones(kilogramsValue).toFixed(6))
    setUsTons(kilogramsToUsTons(kilogramsValue).toFixed(6))
    setImperialTons(kilogramsToImperialTons(kilogramsValue).toFixed(6))
    setCarats(kilogramsToCarats(kilogramsValue).toFixed(6))
  }

  const clearAll = () => {
    setKilograms('')
    setGrams('')
    setMilligrams('')
    setMetricTons('')
    setPounds('')
    setOunces('')
    setStones('')
    setUsTons('')
    setImperialTons('')
    setCarats('')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const loadSampleValues = () => {
    setInputValue('1')
    setInputUnit('kilograms')
  }

  const getWeightCategory = (weightKg: number) => {
    if (weightKg < 0.001) return { category: 'Microscopic', emoji: '🔬', color: 'text-purple-600' }
    if (weightKg < 1) return { category: 'Light', emoji: '🍃', color: 'text-green-600' }
    if (weightKg < 100) return { category: 'Everyday', emoji: '📦', color: 'text-blue-600' }
    if (weightKg < 1000) return { category: 'Heavy', emoji: '🏋️', color: 'text-orange-600' }
    if (weightKg < 1000000) return { category: 'Very Heavy', emoji: '🚛', color: 'text-red-600' }
    return { category: 'Massive', emoji: '🏔️', color: 'text-red-700' }
  }

  const weightData = [
    { unit: 'Kilograms', symbol: 'kg', value: kilograms, description: 'SI unit of mass' },
    { unit: 'Grams', symbol: 'g', value: grams, description: '1/1000 of a kilogram' },
    { unit: 'Milligrams', symbol: 'mg', value: milligrams, description: '1/1000 of a gram' },
    { unit: 'Metric Tons', symbol: 't', value: metricTons, description: '1000 kilograms' },
    { unit: 'Pounds', symbol: 'lb', value: pounds, description: 'Imperial unit of mass' },
    { unit: 'Ounces', symbol: 'oz', value: ounces, description: '1/16 of a pound' },
    { unit: 'Stones', symbol: 'st', value: stones, description: '14 pounds, used in UK' },
    { unit: 'US Tons', symbol: 'ton', value: usTons, description: '2000 pounds, US customary' },
    { unit: 'Imperial Tons', symbol: 'long ton', value: imperialTons, description: '2240 pounds, British' },
    { unit: 'Carats', symbol: 'ct', value: carats, description: 'Unit for gemstones and pearls' }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Weight Converter</h1>
        <p className="text-muted-foreground">
          Convert weights between different units
        </p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Weight Converter</TabsTrigger>
          <TabsTrigger value="reference">Weight Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter" className="space-y-6">
          {/* Quick Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Quick Conversion
              </CardTitle>
              <CardDescription>
                Enter a weight value and select the unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Weight Value</Label>
                  <Input
                    type="number"
                    placeholder="Enter weight"
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
                    <option value="kilograms">Kilograms (kg)</option>
                    <option value="grams">Grams (g)</option>
                    <option value="milligrams">Milligrams (mg)</option>
                    <option value="metric-tons">Metric Tons (t)</option>
                    <option value="pounds">Pounds (lb)</option>
                    <option value="ounces">Ounces (oz)</option>
                    <option value="stones">Stones (st)</option>
                    <option value="us-tons">US Tons (ton)</option>
                    <option value="imperial-tons">Imperial Tons (long ton)</option>
                    <option value="carats">Carats (ct)</option>
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

          {/* Weight Display */}
          {kilograms && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Weight Conversions
                </CardTitle>
                <CardDescription>
                  All weight units converted from your input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weightData.map((weight, index) => {
                    const numValue = parseFloat(weight.value) || 0
                    const category = getWeightCategory(numValue)
                    
                    return (
                      <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{weight.unit}</div>
                            <div className="text-sm text-muted-foreground">{weight.description}</div>
                          </div>
                          <div className="text-xl">{category.emoji}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`text-xl font-bold ${category.color}`}>
                            {weight.value}
                          </div>
                          <div className="font-mono text-sm">{weight.symbol}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.category}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(`${weight.value} ${weight.symbol}`, `${weight.unit} weight`)}
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
                Mathematical formulas for weight conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Metric Conversions</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Kilograms to Grams:</strong> g = kg × 1000</div>
                    <div><strong>Grams to Kilograms:</strong> kg = g ÷ 1000</div>
                    <div><strong>Kilograms to Milligrams:</strong> mg = kg × 1,000,000</div>
                    <div><strong>Metric Tons to Kilograms:</strong> kg = t × 1000</div>
                    <div><strong>Kilograms to Metric Tons:</strong> t = kg ÷ 1000</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Imperial Conversions</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Pounds to Kilograms:</strong> kg = lb ÷ 2.20462</div>
                    <div><strong>Kilograms to Pounds:</strong> lb = kg × 2.20462</div>
                    <div><strong>Ounces to Pounds:</strong> lb = oz ÷ 16</div>
                    <div><strong>Stones to Pounds:</strong> lb = st × 14</div>
                    <div><strong>US Tons to Pounds:</strong> lb = ton × 2000</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reference" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Common Weight Reference</CardTitle>
                <CardDescription>
                  Real-world weight examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { weight: 0.000001, unit: '1 mg', desc: 'Grain of sand' },
                    { weight: 0.001, unit: '1 g', desc: 'Paperclip' },
                    { weight: 0.015, unit: '15 g', desc: 'Sheet of A4 paper' },
                    { weight: 0.050, unit: '50 g', desc: 'Egg' },
                    { weight: 0.100, unit: '100 g', desc: 'Bar of soap' },
                    { weight: 0.250, unit: '250 g', desc: 'Cup of flour' },
                    { weight: 0.500, unit: '500 g', desc: 'Loaf of bread' },
                    { weight: 1, unit: '1 kg', desc: 'Liter of water' },
                    { weight: 5, unit: '5 kg', desc: 'Bowling ball' },
                    { weight: 10, unit: '10 kg', desc: 'Large bag of dog food' },
                    { weight: 50, unit: '50 kg', desc: 'Average adult weight' },
                    { weight: 70, unit: '70 kg', desc: 'Heavy suitcase' },
                    { weight: 1000, unit: '1 ton', desc: 'Small car' },
                    { weight: 50000, unit: '50 tons', desc: 'Adult elephant' },
                    { weight: 70000000000, unit: '70 billion tons', desc: 'Great Pyramid of Giza' }
                  ].map((ref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{ref.desc}</div>
                        <div className="text-sm text-muted-foreground">{ref.unit}</div>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {ref.weight} kg
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Measurement Systems */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Measurement Systems</CardTitle>
                <CardDescription>
                  Different systems and their applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Metric System</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Decimal-based system used worldwide. Units related by powers of 10. Standard unit: kilogram (kg). Used in science, medicine, and most countries.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Imperial/US Customary</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Used primarily in the United States. Units: pound (lb), ounce (oz), ton. Complex relationships (16 oz = 1 lb, 2000 lb = 1 US ton).
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">British Imperial</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Used historically in British Commonwealth. Units: stone (14 lb), hundredweight (112 lb), ton (2240 lb). Still used in UK for body weight.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Specialized Units</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Carats for gemstones (0.2 g), Troy ounces for precious metals (31.1035 g), Metric tons for large quantities (1000 kg).
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weight in Daily Life */}
          <Card>
            <CardHeader>
              <CardTitle>Weight in Daily Life</CardTitle>
              <CardDescription>
                Weight ranges for various objects and scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { category: 'Small Objects', range: '1 mg - 100 g', examples: ['Jewelry', 'Coins', 'Stationery'] },
                  { category: 'Food Items', range: '50 g - 5 kg', examples: ['Fruits', 'Vegetables', 'Packaged goods'] },
                  { category: 'Personal Items', range: '100 g - 20 kg', examples: ['Laptops', 'Backpacks', 'Shoes'] },
                  { category: 'Household', range: '1 kg - 50 kg', examples: ['Appliances', 'Furniture', 'Tools'] },
                  { category: 'Vehicles', range: '500 kg - 5000 kg', examples: ['Motorcycles', 'Cars', 'Trucks'] },
                  { category: 'Industrial', range: '1 ton - 1000 tons', examples: ['Machinery', 'Construction materials', 'Ships'] }
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

          {/* Interesting Weight Facts */}
          <Card>
            <CardHeader>
              <CardTitle>Interesting Weight Facts</CardTitle>
              <CardDescription>
                  Fascinating facts about weights and measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { fact: 'The kilogram is defined by Planck\'s constant', detail: 'Since 2019, the kilogram is defined by fixing the Planck constant at 6.62607015×10⁻³⁴ J⋅s' },
                  { fact: 'A carat is 200 milligrams', detail: 'Originally based on the weight of a carob seed, now standardized at 0.2 grams' },
                  { fact: 'Troy ounces are heavier', detail: 'A troy ounce (31.1035 g) is heavier than a regular ounce (28.3495 g)' },
                  { fact: 'The Earth\'s mass', detail: 'Is approximately 5.972 × 10²⁴ kilograms (5.972 sextillion kg)' },
                  { fact: 'Weight vs Mass', detail: 'Weight is force (mass × gravity), while mass is the amount of matter in an object' },
                  { fact: 'Standard paper weight', detail: 'Standard copy paper is 80 gsm (grams per square meter)' }
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