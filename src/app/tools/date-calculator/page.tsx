'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Calendar, RotateCcw, Calculator } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface Operation {
  value: string
  label: string
  description: string
}

interface CalculationResult {
  operation: string
  result: {
    date?: string
    days?: number
    weeks?: number
    months?: number
    years?: number
    weekday?: string
    isWeekend?: boolean
    isLeapYear?: boolean
    dayOfYear?: number
    weekOfYear?: number
    quarter?: number
  }
  details: {
    calculation: string
    formatted: {
      iso: string
      local: string
      utc: string
    }
    timezone: string
  }
}

export default function DateCalculator() {
  const [operation, setOperation] = useState('add')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [years, setYears] = useState(0)
  const [months, setMonths] = useState(0)
  const [days, setDays] = useState(0)
  const [weeks, setWeeks] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operations, setOperations] = useState<Operation[]>([])
  
  const { trackUsage } = useToolAccess('date-calculator')

  useEffect(() => {
    // Load available operations
    fetchOperations()
    
    // Set current date as default
    const now = new Date()
    setStartDate(now.toISOString().slice(0, 16))
  }, [])

  useEffect(() => {
    // Clear result when operation changes
    setResult(null)
    setError(null)
  }, [operation])

  const fetchOperations = async () => {
    try {
      const response = await fetch('/api/time-tools/date-calculator')
      const data = await response.json()
      setOperations(data.operations)
    } catch (err) {
      console.error('Failed to load operations:', err)
    }
  }

  const handleCalculate = async () => {
    // Validate based on operation
    if (operation === 'add' || operation === 'subtract' || operation === 'weekday') {
      if (!startDate) {
        setError('Start date is required for this operation')
        return
      }
    }
    
    if (operation === 'difference' || operation === 'days_between') {
      if (!startDate || !endDate) {
        setError('Both start and end dates are required for this operation')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before calculating
      await trackUsage()

      const requestBody: any = {
        operation,
        startDate: operation !== 'difference' && operation !== 'days_between' ? startDate : undefined,
        endDate: operation === 'difference' || operation === 'days_between' ? endDate : undefined,
        years: years !== 0 ? years : undefined,
        months: months !== 0 ? months : undefined,
        days: days !== 0 ? days : undefined,
        weeks: weeks !== 0 ? weeks : undefined,
        hours: hours !== 0 ? hours : undefined,
        minutes: minutes !== 0 ? minutes : undefined,
        seconds: seconds !== 0 ? seconds : undefined
      }

      const response = await fetch('/api/time-tools/date-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate date')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResult = () => {
    if (result) {
      const content = `Date Calculation Result
Operation: ${result.operation}
Calculation: ${result.details.calculation}

Result:`
      
      if (result.result.date) {
        content += `\nDate: ${result.result.date}`
      }
      if (result.result.days !== undefined) {
        content += `\nDays: ${result.result.days}`
      }
      if (result.result.weeks !== undefined) {
        content += `\nWeeks: ${result.result.weeks}`
      }
      if (result.result.months !== undefined) {
        content += `\nMonths: ${result.result.months}`
      }
      if (result.result.years !== undefined) {
        content += `\nYears: ${result.result.years}`
      }
      if (result.result.weekday) {
        content += `\nWeekday: ${result.result.weekday}`
      }
      if (result.result.isWeekend !== undefined) {
        content += `\nIs Weekend: ${result.result.isWeekend}`
      }
      if (result.result.isLeapYear !== undefined) {
        content += `\nIs Leap Year: ${result.result.isLeapYear}`
      }
      if (result.result.dayOfYear !== undefined) {
        content += `\nDay of Year: ${result.result.dayOfYear}`
      }
      if (result.result.weekOfYear !== undefined) {
        content += `\nWeek of Year: ${result.result.weekOfYear}`
      }
      if (result.result.quarter !== undefined) {
        content += `\nQuarter: ${result.result.quarter}`
      }

      content += `\n\nFormatted:
ISO: ${result.details.formatted.iso}
Local: ${result.details.formatted.local}
UTC: ${result.details.formatted.utc}
Timezone: ${result.details.timezone}`
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'date-calculation.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setResult(null)
    setError(null)
    setYears(0)
    setMonths(0)
    setDays(0)
    setWeeks(0)
    setHours(0)
    setMinutes(0)
    setSeconds(0)
  }

  const getCurrentDate = () => {
    const now = new Date()
    setStartDate(now.toISOString().slice(0, 16))
  }

  const getCurrentEndDate = () => {
    const now = new Date()
    setEndDate(now.toISOString().slice(0, 16))
  }

  const renderOperationInputs = () => {
    switch (operation) {
      case 'add':
      case 'subtract':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label htmlFor="years">Years</Label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="months">Months</Label>
                <Input
                  id="months"
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">Days</Label>
                <Input
                  id="days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeks">Weeks</Label>
                <Input
                  id="weeks"
                  type="number"
                  value={weeks}
                  onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seconds">Seconds</Label>
                <Input
                  id="seconds"
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
          </div>
        )
      
      case 'difference':
      case 'days_between':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="flex gap-2">
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={getCurrentEndDate}>
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <ToolLayout
      toolId="date-calculator"
      toolName="Date Calculator"
      toolDescription="Calculate date differences, add/subtract time, and get date information"
      toolCategory="Time Tools"
      toolIcon={<Calculator className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Date Calculation Settings</CardTitle>
            <CardDescription>
              Configure your date calculation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operation Selection */}
            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  {operations.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      <div>
                        <div className="font-medium">{op.label}</div>
                        <div className="text-xs text-muted-foreground">{op.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="flex gap-2">
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={getCurrentDate}>
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Operation-specific inputs */}
            {renderOperationInputs()}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleCalculate}
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Calculate'}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
            <CardDescription>
              Your date calculation will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calculator className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Calculating...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Main Results */}
                <div className="space-y-3">
                  {result.result.date && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-1">Result Date</div>
                      <div className="text-lg font-mono font-semibold text-blue-900">
                        {new Date(result.result.date).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {result.result.days !== undefined && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800 mb-1">Days</div>
                      <div className="text-lg font-mono font-semibold text-green-900">
                        {result.result.days}
                      </div>
                    </div>
                  )}
                  
                  {result.result.weeks !== undefined && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-sm font-medium text-purple-800 mb-1">Weeks</div>
                      <div className="text-lg font-mono font-semibold text-purple-900">
                        {result.result.weeks}
                      </div>
                    </div>
                  )}
                  
                  {result.result.months !== undefined && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-sm font-medium text-orange-800 mb-1">Months</div>
                      <div className="text-lg font-mono font-semibold text-orange-900">
                        {result.result.months}
                      </div>
                    </div>
                  )}
                  
                  {result.result.years !== undefined && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800 mb-1">Years</div>
                      <div className="text-lg font-mono font-semibold text-red-900">
                        {result.result.years}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="space-y-2">
                  {result.result.weekday && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Weekday:</span>
                      <span>{result.result.weekday}</span>
                    </div>
                  )}
                  
                  {result.result.isWeekend !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Is Weekend:</span>
                      <Badge variant={result.result.isWeekend ? "destructive" : "secondary"}>
                        {result.result.isWeekend ? "Yes" : "No"}
                      </Badge>
                    </div>
                  )}
                  
                  {result.result.isLeapYear !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Is Leap Year:</span>
                      <Badge variant={result.result.isLeapYear ? "default" : "secondary"}>
                        {result.result.isLeapYear ? "Yes" : "No"}
                      </Badge>
                    </div>
                  )}
                  
                  {result.result.dayOfYear !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Day of Year:</span>
                      <span>{result.result.dayOfYear}</span>
                    </div>
                  )}
                  
                  {result.result.weekOfYear !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Week of Year:</span>
                      <span>{result.result.weekOfYear}</span>
                    </div>
                  )}
                  
                  {result.result.quarter !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Quarter:</span>
                      <span>Q{result.result.quarter}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.details.calculation)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResult}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to calculate</h3>
                <p className="text-muted-foreground">
                  Select an operation and enter dates to perform calculations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Date Calculation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📅 Available Operations</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Add Time - Add years, months, days, etc.</li>
                <li>• Subtract Time - Subtract time periods</li>
                <li>• Date Difference - Calculate time between dates</li>
                <li>• Days Between - Exact day count</li>
                <li>• Weekday Info - Get date details</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔢 Calculation Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Supports years, months, days, weeks</li>
                <li>• Includes hours, minutes, seconds</li>
                <li>• Provides weekday and leap year info</li>
                <li>• Shows day of year and quarter</li>
                <li>• All calculations timezone-aware</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}