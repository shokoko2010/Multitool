'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, RefreshCw, Copy, Download, AlertCircle, CheckCircle, Plus, Minus } from 'lucide-react'

interface DateCalculation {
  type: string
  result: any
  formula: string
  timestamp: string
}

interface DateRange {
  start: Date | null
  end: Date | null
  duration: number
  weekdays: number
  weekends: number
}

export default function DateCalculator() {
  const [activeTab, setActiveTab] = useState('add-subtract')
  const [date1, setDate1] = useState<string>('')
  const [date2, setDate2] = useState<string>('')
  const [days, setDays] = useState<string>('')
  const [timeUnit, setTimeUnit] = useState<string>('days')
  const [results, setResults] = useState<DateCalculation[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const timeUnits = [
    { value: 'milliseconds', label: 'Milliseconds', factor: 1 },
    { value: 'seconds', label: 'Seconds', factor: 1000 },
    { value: 'minutes', label: 'Minutes', factor: 1000 * 60 },
    { value: 'hours', label: 'Hours', factor: 1000 * 60 * 60 },
    { value: 'days', label: 'Days', factor: 1000 * 60 * 60 * 24 },
    { value: 'weeks', label: 'Weeks', factor: 1000 * 60 * 60 * 24 * 7 },
    { value: 'months', label: 'Months', factor: 1000 * 60 * 60 * 24 * 30 },
    { value: 'years', label: 'Years', factor: 1000 * 60 * 60 * 24 * 365 }
  ]

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const addDaysToDate = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  const subtractDaysFromDate = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() - days)
    return result
  }

  const calculateDateDifference = (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getWeekdaysAndWeekends = (start: Date, end: Date): { weekdays: number, weekends: number } => {
    let weekdays = 0
    let weekends = 0
    const current = new Date(start)
    
    while (current <= end) {
      const day = current.getDay()
      if (day === 0 || day === 6) {
        weekends++
      } else {
        weekdays++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return { weekdays, weekends }
  }

  const addSubtractDates = () => {
    if (!date1) {
      setError('Please select a start date')
      return
    }

    const startDate = parseDate(date1)
    if (!startDate) {
      setError('Invalid start date')
      return
    }

    let resultDate: Date
    let formula: string
    let type: string

    if (date2) {
      // Subtract dates
      const endDate = parseDate(date2)
      if (!endDate) {
        setError('Invalid end date')
        return
      }

      const diff = calculateDateDifference(startDate, endDate)
      resultDate = endDate
      formula = `${formatDate(startDate)} - ${formatDate(endDate)}`
      type = 'difference'
    } else if (days) {
      // Add or subtract days
      const daysNum = parseInt(days)
      if (isNaN(daysNum)) {
        setError('Please enter a valid number of days')
        return
      }

      resultDate = daysNum >= 0 ? addDaysToDate(startDate, daysNum) : subtractDaysFromDate(startDate, Math.abs(daysNum))
      formula = `${formatDate(startDate)} ${daysNum >= 0 ? '+' : '-'} ${Math.abs(daysNum)} day${Math.abs(daysNum) === 1 ? '' : 's'}`
      type = daysNum >= 0 ? 'addition' : 'subtraction'
    } else {
      setError('Please either select an end date or enter number of days')
      return
    }

    const calculation: DateCalculation = {
      type,
      result: resultDate,
      formula,
      timestamp: new Date().toISOString()
    }

    setResults(prev => [calculation, ...prev])
    setSuccess(true)
    setError(null)
  }

  const calculateDateRange = () => {
    if (!date1 || !date2) {
      setError('Please select both start and end dates')
      return
    }

    const startDate = parseDate(date1)
    const endDate = parseDate(date2)

    if (!startDate || !endDate) {
      setError('Invalid date(s)')
      return
    }

    if (startDate > endDate) {
      setError('Start date must be before end date')
      return
    }

    const duration = calculateDateDifference(startDate, endDate)
    const { weekdays, weekends } = getWeekdaysAndWeekends(startDate, endDate)

    const range: DateRange = {
      start: startDate,
      end: endDate,
      duration,
      weekdays,
      weekends
    }

    setDateRange(range)
    setSuccess(true)
    setError(null)
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadResults = () => {
    const content = JSON.stringify(results, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'date_calculations.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearResults = () => {
    setResults([])
    setDateRange(null)
    setSuccess(false)
    setError(null)
  }

  const setCurrentDate = (inputId: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (inputId === 'date1') {
      setDate1(today)
    } else if (inputId === 'date2') {
      setDate2(today)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Calculator
            </CardTitle>
            <CardDescription>
              Perform date calculations including addition, subtraction, and date range analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add-subtract">Add/Subtract</TabsTrigger>
                <TabsTrigger value="difference">Date Difference</TabsTrigger>
                <TabsTrigger value="range">Date Range</TabsTrigger>
              </TabsList>

              <TabsContent value="add-subtract" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <div className="flex gap-2">
                      <Input
                        id="start-date"
                        type="date"
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate('date1')}>
                        Today
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="end-date"
                        type="date"
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate('date2')}>
                        Today
                      </Button>
                    </div>
                  </div>
                </div>

                {!date2 && (
                  <div>
                    <Label htmlFor="days">Number of Days</Label>
                    <Input
                      id="days"
                      type="number"
                      placeholder="Enter positive or negative number"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter positive number to add days, negative to subtract days
                    </p>
                  </div>
                )}

                <Button
                  onClick={addSubtractDates}
                  disabled={!date1}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calculate Date
                </Button>
              </TabsContent>

              <TabsContent value="difference" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diff-date1">First Date</Label>
                    <div className="flex gap-2">
                      <Input
                        id="diff-date1"
                        type="date"
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate('date1')}>
                        Today
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="diff-date2">Second Date</Label>
                    <div className="flex gap-2">
                      <Input
                        id="diff-date2"
                        type="date"
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate('date2')}>
                        Today
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={addSubtractDates}
                  disabled={!date1 || !date2}
                  className="w-full"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Calculate Difference
                </Button>
              </TabsContent>

              <TabsContent value="range" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="range-date1">Start Date</Label>
                    <div className="flex gap-2">
                      <Input
                        id="range-date1"
                        type="date"
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate('date1')}>
                        Today
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="range-date2">End Date</Label>
                    <div className="flex gap-2">
                      <Input
                        id="range-date2"
                        type="date"
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => setCurrentDate('date2')}>
                        Today
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={calculateDateRange}
                  disabled={!date1 || !date2}
                  className="w-full"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Analyze Date Range
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700 text-sm">Calculation completed successfully!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {dateRange && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date Range Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{dateRange.duration}</div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dateRange.weekdays}</div>
                  <div className="text-sm text-muted-foreground">Weekdays</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dateRange.weekends}</div>
                  <div className="text-sm text-muted-foreground">Weekend Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {((dateRange.weekdays / dateRange.duration) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Work %</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div>
                  <strong>Start Date:</strong> {formatDate(dateRange.start)}
                </div>
                <div>
                  <strong>End Date:</strong> {formatDate(dateRange.end)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Calculation Results ({results.length})</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearResults}>
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{result.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(result.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm font-mono bg-gray-50 p-2 rounded mb-2">
                            {result.formula}
                          </div>
                          <div className="text-lg font-medium">
                            {formatDate(result.result)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(result.result)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(formatDate(result.result), index)}
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Date Addition/Subtraction:</strong> Add or subtract days from any date
            </div>
            <div>
              <strong>Date Difference:</strong> Calculate days between two dates
            </div>
            <div>
              <strong>Date Range Analysis:</strong> Weekdays, weekends, work percentage
            </div>
            <div>
              <strong>Quick Date Entry:</strong> Set current date with one click
            </div>
            <div>
              <strong>Export Results:</strong> Download calculations as JSON
            </div>
            <div>
              <strong>Copy to Clipboard:</strong> One-click copy of results
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}