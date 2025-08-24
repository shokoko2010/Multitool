'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Calendar, Clock, RefreshCw, Info } from 'lucide-react'

interface CronExpression {
  minute: string
  hour: string
  day: string
  month: string
  weekday: string
}

interface CronPreset {
  name: string
  description: string
  expression: CronExpression
}

export default function CronExpressionGenerator() {
  const [cronExpression, setCronExpression] = useState<CronExpression>({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*'
  })
  const [generatedExpression, setGeneratedExpression] = useState('* * * * *')
  const [nextRuns, setNextRuns] = useState<string[]>([])
  const [description, setDescription] = useState('')

  const cronPresets: CronPreset[] = [
    {
      name: 'Every Minute',
      description: 'Runs every minute',
      expression: { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' }
    },
    {
      name: 'Every Hour',
      description: 'Runs at the start of every hour',
      expression: { minute: '0', hour: '*', day: '*', month: '*', weekday: '*' }
    },
    {
      name: 'Every Day at Midnight',
      description: 'Runs every day at 12:00 AM',
      expression: { minute: '0', hour: '0', day: '*', month: '*', weekday: '*' }
    },
    {
      name: 'Every Day at Noon',
      description: 'Runs every day at 12:00 PM',
      expression: { minute: '0', hour: '12', day: '*', month: '*', weekday: '*' }
    },
    {
      name: 'Every Monday',
      description: 'Runs every Monday at midnight',
      expression: { minute: '0', hour: '0', day: '*', month: '*', weekday: '1' }
    },
    {
      name: 'Every Weekday',
      description: 'Runs Monday through Friday at 9:00 AM',
      expression: { minute: '0', hour: '9', day: '*', month: '*', weekday: '1-5' }
    },
    {
      name: 'Every Weekend',
      description: 'Runs Saturday and Sunday at 10:00 AM',
      expression: { minute: '0', hour: '10', day: '*', month: '*', weekday: '6,0' }
    },
    {
      name: 'Every Month',
      description: 'Runs on the 1st of every month at midnight',
      expression: { minute: '0', hour: '0', day: '1', month: '*', weekday: '*' }
    },
    {
      name: 'Every Quarter',
      description: 'Runs on the 1st of January, April, July, October at midnight',
      expression: { minute: '0', hour: '0', day: '1', month: '1,4,7,10', weekday: '*' }
    },
    {
      name: 'Every Year',
      description: 'Runs on January 1st at midnight',
      expression: { minute: '0', hour: '0', day: '1', month: '1', weekday: '*' }
    }
  ]

  const updateCronField = (field: keyof CronExpression, value: string) => {
    const newExpression = { ...cronExpression, [field]: value }
    setCronExpression(newExpression)
    generateExpression(newExpression)
  }

  const generateExpression = (expression: CronExpression) => {
    const expr = `${expression.minute} ${expression.hour} ${expression.day} ${expression.month} ${expression.weekday}`
    setGeneratedExpression(expr)
    generateDescription(expression)
    generateNextRuns(expression)
  }

  const generateDescription = (expression: CronExpression) => {
    let desc = 'Runs '

    // Minute
    if (expression.minute === '*') {
      desc += 'every minute'
    } else if (expression.minute.includes('*/')) {
      const interval = expression.minute.split('/')[1]
      desc += `every ${interval} minute${interval !== '1' ? 's' : ''}`
    } else if (expression.minute.includes('-')) {
      const [start, end] = expression.minute.split('-')
      desc += `from minute ${start} to ${end}`
    } else if (expression.minute.includes(',')) {
      const minutes = expression.minute.split(',')
      desc += `at minutes ${minutes.join(', ')}`
    } else {
      desc += `at minute ${expression.minute}`
    }

    // Hour
    if (expression.hour !== '*') {
      if (expression.hour.includes('*/')) {
        const interval = expression.hour.split('/')[1]
        desc += `, every ${interval} hour${interval !== '1' ? 's' : ''}`
      } else if (expression.hour.includes('-')) {
        const [start, end] = expression.hour.split('-')
        desc += `, between hours ${start} and ${end}`
      } else if (expression.hour.includes(',')) {
        const hours = expression.hour.split(',')
        desc += `, at hours ${hours.join(', ')}`
      } else {
        desc += `, at hour ${expression.hour}`
      }
    }

    // Day
    if (expression.day !== '*') {
      if (expression.day.includes('*/')) {
        const interval = expression.day.split('/')[1]
        desc += `, every ${interval} day${interval !== '1' ? 's' : ''} of the month`
      } else if (expression.day.includes('L')) {
        desc += ', on the last day of the month'
      } else if (expression.day.includes('W')) {
        const dayNum = expression.day.replace('W', '')
        desc += `, on the nearest weekday to the ${dayNum}${getOrdinalSuffix(dayNum)} of the month`
      } else if (expression.day.includes('-')) {
        const [start, end] = expression.day.split('-')
        desc += `, from the ${start}${getOrdinalSuffix(start)} to the ${end}${getOrdinalSuffix(end)} of the month`
      } else if (expression.day.includes(',')) {
        const days = expression.day.split(',')
        desc += `, on the ${days.map(d => d + getOrdinalSuffix(d)).join(', ')} of the month`
      } else {
        desc += `, on the ${expression.day}${getOrdinalSuffix(expression.day)} of the month`
      }
    }

    // Month
    if (expression.month !== '*') {
      const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      if (expression.month.includes('*/')) {
        const interval = expression.month.split('/')[1]
        desc += `, every ${interval} month${interval !== '1' ? 's' : ''}`
      } else if (expression.month.includes('-')) {
        const [start, end] = expression.month.split('-')
        desc += `, from ${monthNames[parseInt(start)]} to ${monthNames[parseInt(end)]}`
      } else if (expression.month.includes(',')) {
        const months = expression.month.split(',')
        desc += `, in ${months.map(m => monthNames[parseInt(m)]).join(', ')}`
      } else {
        desc += `, in ${monthNames[parseInt(expression.month)]}`
      }
    }

    // Weekday
    if (expression.weekday !== '*') {
      const weekdayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      if (expression.weekday.includes('*/')) {
        const interval = expression.weekday.split('/')[1]
        desc += `, every ${interval} day of the week`
      } else if (expression.weekday.includes('-')) {
        const [start, end] = expression.weekday.split('-')
        desc += `, from ${weekdayNames[parseInt(start)]} to ${weekdayNames[parseInt(end)]}`
      } else if (expression.weekday.includes(',')) {
        const weekdays = expression.weekday.split(',')
        desc += `, on ${weekdays.map(w => weekdayNames[parseInt(w)]).join(', ')}`
      } else if (expression.weekday.includes('L')) {
        const dayNum = expression.weekday.replace('L', '')
        desc += `, on the last ${weekdayNames[parseInt(dayNum)]} of the month`
      } else {
        desc += `, on ${weekdayNames[parseInt(expression.weekday)]}`
      }
    }

    setDescription(desc)
  }

  const generateNextRuns = (expression: CronExpression) => {
    const runs = []
    const now = new Date()
    
    // Simple simulation of next 5 run times
    for (let i = 0; i < 5; i++) {
      const nextRun = new Date(now.getTime() + (i + 1) * 60000) // Start with 1 minute intervals
      runs.push(nextRun.toLocaleString())
    }
    
    setNextRuns(runs)
  }

  const getOrdinalSuffix = (num: string) => {
    const n = parseInt(num)
    if (n > 3 && n < 21) return 'th'
    switch (n % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  const applyPreset = (preset: CronPreset) => {
    setCronExpression(preset.expression)
    generateExpression(preset.expression)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedExpression)
  }

  const getFieldDescription = (field: keyof CronExpression) => {
    const descriptions = {
      minute: 'Minute (0-59)',
      hour: 'Hour (0-23)',
      day: 'Day of month (1-31)',
      month: 'Month (1-12)',
      weekday: 'Day of week (0-6, 0=Sunday)'
    }
    return descriptions[field]
  }

  const getFieldExamples = (field: keyof CronExpression) => {
    const examples = {
      minute: ['*', '0', '*/15', '0,15,30,45', '0-10'],
      hour: ['*', '0', '9-17', '0,6,12,18', '*/2'],
      day: ['*', '1', '1-15', 'L', '1,15,L', '*/5'],
      month: ['*', '1', '1,4,7,10', '*/3', '6-12'],
      weekday: ['*', '1', '1-5', '6,0', '*/2', '2L']
    }
    return examples[field]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cron Expression Generator</h1>
          <p className="text-muted-foreground">
            Create and test cron expressions with ease
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expression Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Expression Builder
              </CardTitle>
              <CardDescription>
                Build your cron expression field by field
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(cronExpression).map(([field, value]) => (
                <div key={field} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.charAt(0).toUpperCase() + field.slice(1)} - {getFieldDescription(field as keyof CronExpression)}
                  </Label>
                  <Input
                    value={value}
                    onChange={(e) => updateCronField(field as keyof CronExpression, e.target.value)}
                    placeholder={getFieldDescription(field as keyof CronExpression)}
                    className="font-mono"
                  />
                  <div className="text-xs text-gray-500">
                    Examples: {getFieldExamples(field as keyof CronExpression).join(', ')}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Generated Expression</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedExpression}
                      readOnly
                      className="font-mono bg-gray-50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Common Presets
              </CardTitle>
              <CardDescription>
                Quick start with common cron patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {cronPresets.map((preset, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{preset.name}</h4>
                      <Badge variant="outline" className="text-xs font-mono">
                        {Object.values(preset.expression).join(' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{preset.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Expression Details
              </CardTitle>
              <CardDescription>
                Human-readable description and next run times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  {description || 'Generate an expression to see the description'}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Next 5 Run Times</Label>
                <div className="space-y-1">
                  {nextRuns.length > 0 ? (
                    nextRuns.map((run, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{run}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Generate an expression to see next run times
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Cron Format Reference</Label>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><code className="bg-gray-100 px-1 rounded">*</code> - Any value</div>
                  <div><code className="bg-gray-100 px-1 rounded">,</code> - Value list separator</div>
                  <div><code className="bg-gray-100 px-1 rounded">-</code> - Range of values</div>
                  <div><code className="bg-gray-100 px-1 rounded">/</code> - Step values</div>
                  <div><code className="bg-gray-100 px-1 rounded">L</code> - Last day of month/weekday</div>
                  <div><code className="bg-gray-100 px-1 rounded">W</code> - Nearest weekday</div>
                </div>
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  This tool generates cron expressions in the standard 5-field format: minute hour day month weekday
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Advanced Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Complex Schedules</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">0 9 * * 1-5</div>
                    <div className="text-gray-600">Weekdays at 9:00 AM</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">0 2 * * 6,0</div>
                    <div className="text-gray-600">Weekends at 2:00 AM</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">0 0 1 * *</div>
                    <div className="text-gray-600">First day of each month</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">0 0 L * *</div>
                    <div className="text-gray-600">Last day of each month</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Special Characters</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">*/15 * * * *</div>
                    <div className="text-gray-600">Every 15 minutes</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">0 9-17 * * 1-5</div>
                    <div className="text-gray-600">Every hour 9 AM-5 PM on weekdays</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">0 0 1,15 * *</div>
                    <div className="text-gray-600">1st and 15th of each month</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-mono text-xs mb-1">0 0 1W * *</div>
                    <div className="text-gray-600">First weekday of each month</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}