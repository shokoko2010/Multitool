'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Pill, Calculator, AlertTriangle, Info } from 'lucide-react'

interface DosageResult {
  calculatedDose: number
  frequency: string
  duration: string
  totalDose: number
  instructions: string[]
  warnings: string[]
  considerations: string[]
}

interface Medication {
  name: string
  type: 'tablet' | 'liquid' | 'injection'
  standardDose: number
  unit: string
  maxDailyDose: number
  considerations: string[]
}

const medications: Medication[] = [
  {
    name: 'Acetaminophen (Tylenol)',
    type: 'tablet',
    standardDose: 500,
    unit: 'mg',
    maxDailyDose: 4000,
    considerations: [
      'Do not exceed 4000mg in 24 hours',
      'Avoid with alcohol consumption',
      'Consult doctor if you have liver disease'
    ]
  },
  {
    name: 'Ibuprofen (Advil)',
    type: 'tablet',
    standardDose: 200,
    unit: 'mg',
    maxDailyDose: 1200,
    considerations: [
      'Take with food to reduce stomach irritation',
      'Do not exceed 1200mg in 24 hours without prescription',
      'Avoid if you have stomach ulcers'
    ]
  },
  {
    name: 'Amoxicillin',
    type: 'capsule',
    standardDose: 500,
    unit: 'mg',
    maxDailyDose: 3000,
    considerations: [
      'Complete full course of treatment',
      'Take with or without food',
      'May reduce effectiveness of birth control pills'
    ]
  },
  {
    name: 'Lisinopril',
    type: 'tablet',
    standardDose: 10,
    unit: 'mg',
    maxDailyDose: 40,
    considerations: [
      'May cause dizziness',
      'Monitor blood pressure regularly',
      'Avoid during pregnancy'
    ]
  },
  {
    name: 'Metformin',
    type: 'tablet',
    standardDose: 500,
    unit: 'mg',
    maxDailyDose: 2000,
    considerations: [
      'Take with meals',
      'Monitor blood sugar levels',
      'May cause gastrointestinal side effects'
    ]
  }
]

export default function MedicalDosageCalculator() {
  const [selectedMed, setSelectedMed] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [age, setAge] = useState<string>('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [condition, setCondition] = useState<string>('')
  const [result, setResult] = useState<DosageResult | null>(null)

  const calculateDosage = () => {
    if (!selectedMed || !weight || !age) return

    const medication = medications.find(med => med.name === selectedMed)
    if (!medication) return

    const weightNum = parseFloat(weight)
    const ageNum = parseInt(age)

    // Convert weight to kg if in lbs
    const weightKg = weightUnit === 'lbs' ? weightNum * 0.453592 : weightNum

    // Basic dosage calculation based on weight and age
    let calculatedDose = medication.standardDose

    // Adjust for weight (simplified calculation)
    if (weightKg < 50) {
      calculatedDose *= 0.8
    } else if (weightKg > 100) {
      calculatedDose *= 1.2
    }

    // Adjust for age
    if (ageNum < 18) {
      calculatedDose *= 0.7
    } else if (ageNum > 65) {
      calculatedDose *= 0.9
    }

    // Round to nearest standard dose
    calculatedDose = Math.round(calculatedDose / 100) * 100

    // Calculate frequency and duration based on condition
    const frequency = getFrequency(medication.name, condition)
    const duration = getDuration(medication.name, condition)
    const totalDose = calculatedDose * getDailyFrequency(frequency) * parseInt(duration.split(' ')[0])

    const instructions = getInstructions(medication.name, calculatedDose, frequency, duration)
    const warnings = getWarnings(medication.name, ageNum, weightKg)
    const considerations = [...medication.considerations, ...getConditionConsiderations(condition)]

    setResult({
      calculatedDose,
      frequency,
      duration,
      totalDose,
      instructions,
      warnings,
      considerations
    })
  }

  const getFrequency = (medName: string, condition: string): string => {
    if (medName.includes('Acetaminophen') || medName.includes('Ibuprofen')) {
      return 'Every 4-6 hours'
    } else if (medName.includes('Amoxicillin')) {
      return 'Every 8 hours'
    } else if (medName.includes('Lisinopril') || medName.includes('Metformin')) {
      return 'Twice daily'
    }
    return 'Once daily'
  }

  const getDuration = (medName: string, condition: string): string => {
    if (medName.includes('Amoxicillin')) {
      return '7-10 days'
    } else if (medName.includes('Acetaminophen') || medName.includes('Ibuprofen')) {
      return 'As needed'
    } else if (condition.includes('chronic')) {
      return 'Long-term'
    }
    return '14 days'
  }

  const getDailyFrequency = (frequency: string): number => {
    if (frequency.includes('4-6')) return 4
    if (frequency.includes('8')) return 3
    if (frequency.includes('Twice')) return 2
    return 1
  }

  const getInstructions = (medName: string, dose: number, frequency: string, duration: string): string[] => {
    const baseInstructions = [
      `Take ${dose}${medications.find(m => m.name === medName)?.unit} ${frequency.toLowerCase()}`,
      `Duration: ${duration}`
    ]

    if (medName.includes('Ibuprofen')) {
      baseInstructions.push('Take with food or milk')
    } else if (medName.includes('Metformin')) {
      baseInstructions.push('Take with meals')
    } else if (medName.includes('Amoxicillin')) {
      baseInstructions.push('Complete full course even if feeling better')
    }

    return baseInstructions
  }

  const getWarnings = (medName: string, age: number, weight: number): string[] => {
    const warnings: string[] = []

    if (age < 18) {
      warnings.push('Consult pediatrician for children under 18')
    }

    if (age > 65) {
      warnings.push('Elderly patients may require dose adjustment')
    }

    if (weight < 40) {
      warnings.push('Low body weight may require dose adjustment')
    }

    if (medName.includes('Acetaminophen')) {
      warnings.push('Do not take with other acetaminophen-containing products')
    }

    if (medName.includes('Ibuprofen')) {
      warnings.push('May increase risk of heart attack or stroke')
    }

    return warnings
  }

  const getConditionConsiderations = (condition: string): string[] => {
    const considerations: string[] = []

    if (condition.toLowerCase().includes('liver')) {
      considerations.push('Monitor liver function tests')
    }

    if (condition.toLowerCase().includes('kidney')) {
      considerations.push('Monitor kidney function')
    }

    if (condition.toLowerCase().includes('heart')) {
      considerations.push('Monitor blood pressure and heart rate')
    }

    if (condition.toLowerCase().includes('diabetes')) {
      considerations.push('Monitor blood glucose levels')
    }

    return considerations
  }

  const getMedication = (name: string): Medication | undefined => {
    return medications.find(med => med.name === name)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Medical Dosage Calculator</h1>
        <p className="text-muted-foreground">
          Calculate medication dosages based on patient characteristics and medical conditions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Enter patient details to calculate appropriate dosage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Medication</Label>
              <Select value={selectedMed} onValueChange={setSelectedMed}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((med) => (
                    <SelectItem key={med.name} value={med.name}>
                      {med.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <div className="flex gap-2">
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                  />
                  <Select value={weightUnit} onValueChange={(value: 'kg' | 'lbs') => setWeightUnit(value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Medical Condition (optional)</Label>
              <Input
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g., hypertension, diabetes"
              />
            </div>

            <Button onClick={calculateDosage} className="w-full">
              Calculate Dosage
            </Button>
          </CardContent>
        </Card>

        {result && selectedMed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Dosage Recommendation
              </CardTitle>
              <CardDescription>
                Based on patient profile and medication guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.calculatedDose}{getMedication(selectedMed)?.unit}</div>
                    <div className="text-sm text-muted-foreground">Per Dose</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.frequency}</div>
                    <div className="text-sm text-muted-foreground">Frequency</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold">Duration: {result.duration}</div>
                  <div className="text-sm text-muted-foreground">
                    Total: {result.totalDose}{getMedication(selectedMed)?.unit}
                  </div>
                </div>

                <Tabs defaultValue="instructions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="warnings">Warnings</TabsTrigger>
                    <TabsTrigger value="considerations">Considerations</TabsTrigger>
                  </TabsList>
                  <TabsContent value="instructions" className="space-y-2">
                    {result.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Info className="h-3 w-3 text-blue-500 mt-0.5" />
                        {instruction}
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="warnings" className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                        {warning}
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="considerations" className="space-y-2">
                    {result.considerations.map((consideration, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Info className="h-3 w-3 text-green-500 mt-0.5" />
                        {consideration}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Alert className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Medical Disclaimer</AlertTitle>
        <AlertDescription>
          This calculator provides general dosage information only. It is not a substitute for professional medical advice. 
          Always consult with a qualified healthcare provider before taking any medication. Dosage requirements may vary 
          based on individual patient factors, medical history, and other medications.
        </AlertDescription>
      </Alert>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {medications.map((med) => (
              <div key={med.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{med.name}</h4>
                  <Badge variant="outline">{med.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Standard dose: {med.standardDose}{med.unit}</div>
                  <div>Max daily: {med.maxDailyDose}{med.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}