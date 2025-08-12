'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Calculator } from 'lucide-react'

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [age, setAge] = useState<{
    years: number
    months: number
    days: number
    totalDays: number
    totalHours: number
    totalMinutes: number
    totalSeconds: number
  } | null>(null)

  useEffect(() => {
    // Set current date as default
    const today = new Date().toISOString().split('T')[0]
    setCurrentDate(today)
  }, [])

  const calculateAge = () => {
    if (!birthDate || !currentDate) return

    const birth = new Date(birthDate)
    const current = new Date(currentDate)

    if (birth > current) {
      alert('Birth date cannot be in the future!')
      return
    }

    let years = current.getFullYear() - birth.getFullYear()
    let months = current.getMonth() - birth.getMonth()
    let days = current.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(current.getFullYear(), current.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    const totalDays = Math.floor((current.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    const totalHours = totalDays * 24
    const totalMinutes = totalHours * 60
    const totalSeconds = totalMinutes * 60

    setAge({
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds
    })
  }

  const clearForm = () => {
    setBirthDate('')
    const today = new Date().toISOString().split('T')[0]
    setCurrentDate(today)
    setAge(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Age Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate your exact age in years, months, days, and more
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calculate Your Age</CardTitle>
            <CardDescription>
              Enter your birth date and optionally a target date to calculate age
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date of Birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={currentDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentDate">Target Date (optional)</Label>
                <Input
                  id="currentDate"
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateAge} disabled={!birthDate}>
                <Calendar className="w-4 h-4 mr-2" />
                Calculate Age
              </Button>
              <Button variant="outline" onClick={clearForm}>
                Clear
              </Button>
            </div>

            {age && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-4">Your Age Details:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{age.years}</div>
                    <div className="text-sm text-muted-foreground">Years</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{age.months}</div>
                    <div className="text-sm text-muted-foreground">Months</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{age.days}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{age.totalDays}</div>
                    <div className="text-sm text-muted-foreground">Total Days</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-primary">{age.totalHours.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-primary">{age.totalMinutes.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-primary">{age.totalSeconds.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Seconds</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Age Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Calculate your exact age in years, months, and days</p>
              <p>• See total time elapsed in days, hours, minutes, and seconds</p>
              <p>• Compare age between any two dates</p>
              <p>• Useful for calculating anniversaries, service periods, and more</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}