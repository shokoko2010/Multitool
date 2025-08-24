'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Gift, Copy, Download } from 'lucide-react'

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  nextBirthday: Date
  daysUntilBirthday: number
  isBirthday: boolean
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState<string>('')
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null)
  const [calculationHistory, setCalculationHistory] = useState<Array<{
    id: string
    birthDate: string
    targetDate: string
    result: AgeResult
    timestamp: Date
  }>>([])

  const calculateAge = () => {
    if (!birthDate) return

    const birth = new Date(birthDate)
    const target = new Date(targetDate)
    
    if (birth > target) {
      alert('Birth date cannot be in the future!')
      return
    }

    // Calculate age
    let years = target.getFullYear() - birth.getFullYear()
    let months = target.getMonth() - birth.getMonth()
    let days = target.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    // Calculate total values
    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    const totalHours = totalDays * 24
    const totalMinutes = totalHours * 60
    const totalSeconds = totalMinutes * 60

    // Calculate next birthday
    let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < target) {
      nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate())
    }

    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
    const isBirthday = daysUntilBirthday === 0

    const result: AgeResult = {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBirthday,
      daysUntilBirthday,
      isBirthday
    }

    setAgeResult(result)

    // Add to history
    const historyItem = {
      id: Date.now().toString(),
      birthDate,
      targetDate,
      result,
      timestamp: new Date()
    }
    
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Birth Date', 'Target Date', 'Age', 'Total Days'],
      ...calculationHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.birthDate,
        item.targetDate,
        `${item.result.years}y ${item.result.months}m ${item.result.days}d`,
        item.result.totalDays.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `age-calculator-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const setToday = () => {
    setTargetDate(new Date().toISOString().split('T')[0])
  }

  useEffect(() => {
    if (birthDate) {
      calculateAge()
    }
  }, [birthDate, targetDate])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Age Calculator</h1>
        <p className="text-muted-foreground">Calculate your exact age in years, months, days, and more</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Input
            </CardTitle>
            <CardDescription>
              Enter your birth date and optionally a target date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <div className="flex gap-2">
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
                <Button variant="outline" onClick={setToday}>
                  Today
                </Button>
              </div>
            </div>

            <Button onClick={calculateAge} className="w-full" disabled={!birthDate}>
              Calculate Age
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Age Details
            </CardTitle>
            <CardDescription>
              Your age breakdown and interesting facts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ageResult ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {ageResult.years}
                  </div>
                  <div className="text-muted-foreground">Years Old</div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold">{ageResult.years}</div>
                    <div className="text-sm text-muted-foreground">Years</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{ageResult.months}</div>
                    <div className="text-sm text-muted-foreground">Months</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{ageResult.days}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Days:</span>
                    <Badge variant="outline">{ageResult.totalDays.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Hours:</span>
                    <Badge variant="outline">{ageResult.totalHours.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Minutes:</span>
                    <Badge variant="outline">{ageResult.totalMinutes.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Seconds:</span>
                    <Badge variant="outline">{ageResult.totalSeconds.toLocaleString()}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <span className="font-medium">Next Birthday:</span>
                  </div>
                  <div className="text-sm">
                    {ageResult.nextBirthday.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {ageResult.isBirthday ? (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500">
                      🎉 Happy Birthday!
                    </Badge>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {ageResult.daysUntilBirthday} days to go
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(
                    `Age: ${ageResult.years} years, ${ageResult.months} months, ${ageResult.days} days`
                  )}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Age
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Enter your birth date to calculate your age
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {calculationHistory.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Calculation History
              <Button
                variant="outline"
                size="sm"
                onClick={exportHistory}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardTitle>
            <CardDescription>
              Your recent age calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {calculationHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {formatDate(item.birthDate)} → {formatDate(item.targetDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.result.years}y {item.result.months}m {item.result.days}d
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {item.result.totalDays} days
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}