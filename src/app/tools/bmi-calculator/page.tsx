'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Heart, AlertTriangle, CheckCircle } from 'lucide-react'

interface BMIResult {
  bmi: number
  category: string
  status: 'underweight' | 'normal' | 'overweight' | 'obese'
  idealWeight: { min: number; max: number }
  healthRisks: string[]
  recommendations: string[]
}

export default function BMICalculator() {
  const [weight, setWeight] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [age, setAge] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [result, setResult] = useState<BMIResult | null>(null)

  const calculateBMI = () => {
    if (!weight || !height) return

    let weightNum = parseFloat(weight)
    let heightNum = parseFloat(height)

    if (unit === 'imperial') {
      // Convert imperial to metric
      weightNum = weightNum * 0.453592 // lbs to kg
      heightNum = heightNum * 0.0254 // inches to meters
    }

    const bmi = weightNum / (heightNum * heightNum)
    const category = getBMICategory(bmi)
    const status = getBMIStatus(bmi)
    const idealWeight = calculateIdealWeight(heightNum, unit)
    const healthRisks = getHealthRisks(status)
    const recommendations = getRecommendations(status, age ? parseInt(age) : null)

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      status,
      idealWeight,
      healthRisks,
      recommendations
    })
  }

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal weight'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }

  const getBMIStatus = (bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' => {
    if (bmi < 18.5) return 'underweight'
    if (bmi < 25) return 'normal'
    if (bmi < 30) return 'overweight'
    return 'obese'
  }

  const calculateIdealWeight = (height: number, unit: 'metric' | 'imperial') => {
    // Using BMI formula for ideal weight (BMI 18.5 to 24.9)
    const minWeight = 18.5 * height * height
    const maxWeight = 24.9 * height * height

    if (unit === 'imperial') {
      return {
        min: Math.round(minWeight * 2.20462),
        max: Math.round(maxWeight * 2.20462)
      }
    }

    return {
      min: Math.round(minWeight),
      max: Math.round(maxWeight)
    }
  }

  const getHealthRisks = (status: string): string[] => {
    const risks: Record<string, string[]> = {
      underweight: [
        'Malnutrition',
        'Vitamin deficiencies',
        'Anemia',
        'Osteoporosis',
        'Weakened immune system',
        'Fertility issues'
      ],
      normal: [
        'Low risk of weight-related health problems'
      ],
      overweight: [
        'Type 2 diabetes',
        'Heart disease',
        'High blood pressure',
        'Stroke risk',
        'Joint problems',
        'Sleep apnea'
      ],
      obese: [
        'Severe heart disease',
        'Type 2 diabetes',
        'High blood pressure',
        'Stroke',
        'Certain cancers',
        'Breathing problems',
        'Joint problems',
        'Gallbladder disease'
      ]
    }

    return risks[status] || []
  }

  const getRecommendations = (status: string, age: number | null): string[] => {
    const baseRecommendations: Record<string, string[]> = {
      underweight: [
        'Increase calorie intake with nutrient-dense foods',
        'Eat frequent small meals throughout the day',
        'Include protein-rich foods in every meal',
        'Consider strength training to build muscle mass',
        'Consult with a healthcare provider or nutritionist'
      ],
      normal: [
        'Maintain current weight with balanced diet',
        'Engage in regular physical activity',
        'Continue healthy eating habits',
        'Schedule regular health check-ups'
      ],
      overweight: [
        'Adopt a balanced, calorie-controlled diet',
        'Increase physical activity to 150+ minutes per week',
        'Reduce portion sizes',
        'Limit processed foods and sugary drinks',
        'Consider consulting a dietitian'
      ],
      obese: [
        'Seek medical guidance for weight management',
        'Consider working with a healthcare team',
        'Gradual weight loss through diet and exercise',
        'Monitor health conditions regularly',
        'Consider medical interventions if recommended'
      ]
    }

    const recommendations = baseRecommendations[status] || []

    if (age && age >= 65) {
      recommendations.push('Focus on maintaining muscle mass through protein intake and resistance training')
    }

    return recommendations
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'underweight': return 'bg-blue-100 text-blue-800'
      case 'normal': return 'bg-green-100 text-green-800'
      case 'overweight': return 'bg-yellow-100 text-yellow-800'
      case 'obese': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'underweight': return <AlertTriangle className="h-4 w-4" />
      case 'normal': return <CheckCircle className="h-4 w-4" />
      case 'overweight': return <AlertTriangle className="h-4 w-4" />
      case 'obese': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BMI Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your Body Mass Index and get personalized health recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Calculate Your BMI
            </CardTitle>
            <CardDescription>
              Enter your measurements to calculate your Body Mass Index
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Measurement System</Label>
              <Select value={unit} onValueChange={(value: 'metric' | 'imperial') => setUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={unit === 'metric' ? '70' : '154'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height ({unit === 'metric' ? 'cm' : 'inches'})</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={unit === 'metric' ? '175' : '69'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender (optional)</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calculateBMI} className="w-full">
              Calculate BMI
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Your BMI Results</CardTitle>
              <CardDescription>
                Based on your measurements and health guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">{result.bmi}</div>
                  <Badge className={getStatusColor(result.status)}>
                    {getStatusIcon(result.status)}
                    <span className="ml-2">{result.category}</span>
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Ideal Weight Range</h4>
                  <p className="text-sm text-muted-foreground">
                    {unit === 'metric' ? 
                      `${result.idealWeight.min} kg - ${result.idealWeight.max} kg` :
                      `${result.idealWeight.min} lbs - ${result.idealWeight.max} lbs`
                    }
                  </p>
                </div>

                <Tabs defaultValue="risks" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="risks">Health Risks</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>
                  <TabsContent value="risks" className="space-y-3">
                    <div className="space-y-2">
                      {result.healthRisks.map((risk, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Heart className="h-3 w-3 text-red-500" />
                          {risk}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="recommendations" className="space-y-3">
                    <div className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About BMI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">What is BMI?</h4>
              <p className="text-sm text-muted-foreground">
                Body Mass Index (BMI) is a measure of body fat based on height and weight. 
                It's a screening tool that can help identify potential weight problems in adults.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">BMI Categories</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Underweight:</span>
                  <span>BMI &lt; 18.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Normal weight:</span>
                  <span>BMI 18.5 - 24.9</span>
                </div>
                <div className="flex justify-between">
                  <span>Overweight:</span>
                  <span>BMI 25 - 29.9</span>
                </div>
                <div className="flex justify-between">
                  <span>Obese:</span>
                  <span>BMI ≥ 30</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> BMI is a screening tool and does not directly measure body fat or health. 
              Factors like muscle mass, bone density, and overall body composition are not considered. 
              Always consult with a healthcare provider for personalized health advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}