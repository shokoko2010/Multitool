'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Globe, Clock, RotateCcw, SwapHorizontal } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface TimezoneData {
  timezones: string[]
  popular: string[]
}

interface ConversionResult {
  sourceTime: string
  targetTime: string
  sourceTimezone: string
  targetTimezone: string
  sourceOffset: string
  targetOffset: string
  timeDifference: string
  formatted: {
    source: {
      iso: string
      local: string
      utc: string
    }
    target: {
      iso: string
      local: string
      utc: string
    }
  }
}

export default function TimezoneConverter() {
  const [sourceTimezone, setSourceTimezone] = useState('UTC')
  const [targetTimezone, setTargetTimezone] = useState('EST')
  const [datetime, setDatetime] = useState('')
  const [format, setFormat] = useState('local')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timezones, setTimezones] = useState<TimezoneData>({ timezones: [], popular: [] })
  
  const { trackUsage } = useToolAccess('timezone-converter')

  useEffect(() => {
    // Load available timezones
    fetchTimezones()
    
    // Set current datetime as default
    const now = new Date()
    setDatetime(now.toISOString().slice(0, 16))
  }, [])

  const fetchTimezones = async () => {
    try {
      const response = await fetch('/api/time-tools/timezone-converter')
      const data = await response.json()
      setTimezones(data)
    } catch (err) {
      console.error('Failed to load timezones:', err)
    }
  }

  const handleConvert = async () => {
    if (!sourceTimezone || !targetTimezone || !datetime) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before converting
      await trackUsage()

      const response = await fetch('/api/time-tools/timezone-converter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceTimezone,
          targetTimezone,
          datetime: new Date(datetime).toISOString(),
          format
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert timezone')
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

  const swapTimezones = () => {
    setSourceTimezone(targetTimezone)
    setTargetTimezone(sourceTimezone)
    setResult(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResult = () => {
    if (result) {
      const content = `Timezone Conversion Result
Source Time: ${result.sourceTime} (${result.sourceTimezone} ${result.sourceOffset})
Target Time: ${result.targetTime} (${result.targetTimezone} ${result.targetOffset})
Time Difference: ${result.timeDifference}

Detailed Information:
Source (ISO): ${result.formatted.source.iso}
Source (Local): ${result.formatted.source.local}
Source (UTC): ${result.formatted.source.utc}

Target (ISO): ${result.formatted.target.iso}
Target (Local): ${result.formatted.target.local}
Target (UTC): ${result.formatted.target.utc}`
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'timezone-conversion.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setResult(null)
    setError(null)
    const now = new Date()
    setDatetime(now.toISOString().slice(0, 16))
  }

  const getCurrentTime = () => {
    const now = new Date()
    setDatetime(now.toISOString().slice(0, 16))
  }

  return (
    <ToolLayout
      toolId="timezone-converter"
      toolName="Timezone Converter"
      toolDescription="Convert time between different timezones worldwide"
      toolCategory="Time Tools"
      toolIcon={<Globe className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Time Conversion Settings</CardTitle>
            <CardDescription>
              Configure source and target timezones for conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Source Timezone */}
            <div className="space-y-2">
              <Label htmlFor="source-timezone">From Timezone</Label>
              <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source timezone" />
                </SelectTrigger>
                <SelectContent>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="p-2 text-sm font-medium text-muted-foreground">Popular Timezones</div>
                    {timezones.popular.map((tz) => (
                      <SelectItem key={`source-${tz}`} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                    <div className="p-2 text-sm font-medium text-muted-foreground mt-2">All Timezones</div>
                    {timezones.timezones.map((tz) => (
                      <SelectItem key={`source-${tz}`} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Target Timezone */}
            <div className="space-y-2">
              <Label htmlFor="target-timezone">To Timezone</Label>
              <div className="flex gap-2">
                <Select value={targetTimezone} onValueChange={setTargetTimezone} className="flex-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select target timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="p-2 text-sm font-medium text-muted-foreground">Popular Timezones</div>
                      {timezones.popular.map((tz) => (
                        <SelectItem key={`target-${tz}`} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                      <div className="p-2 text-sm font-medium text-muted-foreground mt-2">All Timezones</div>
                      {timezones.timezones.map((tz) => (
                        <SelectItem key={`target-${tz}`} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={swapTimezones}>
                  <SwapHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <Label htmlFor="datetime">Date and Time</Label>
              <div className="flex gap-2">
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={getCurrentTime}>
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label htmlFor="format">Output Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iso">ISO Format</SelectItem>
                  <SelectItem value="local">Local Format</SelectItem>
                  <SelectItem value="utc">UTC Format</SelectItem>
                  <SelectItem value="time">Time Only</SelectItem>
                  <SelectItem value="date">Date Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleConvert}
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Converting...' : 'Convert Timezone'}
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
            <CardTitle>Conversion Result</CardTitle>
            <CardDescription>
              Your timezone conversion will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Converting timezone...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Main Results */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {result.sourceTimezone}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.sourceOffset}
                      </Badge>
                    </div>
                    <div className="text-lg font-mono font-semibold text-blue-900">
                      {result.sourceTime}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {result.targetTimezone}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.targetOffset}
                      </Badge>
                    </div>
                    <div className="text-lg font-mono font-semibold text-green-900">
                      {result.targetTime}
                    </div>
                  </div>
                </div>

                {/* Time Difference */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="text-sm text-purple-800">
                    <span className="font-medium">Time Difference:</span> {result.timeDifference}
                  </p>
                </div>

                {/* Detailed Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Detailed Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="font-medium text-blue-800">Source Timezone</div>
                      <div className="space-y-1 text-muted-foreground">
                        <div><span className="font-medium">ISO:</span> {result.formatted.source.iso}</div>
                        <div><span className="font-medium">Local:</span> {result.formatted.source.local}</div>
                        <div><span className="font-medium">UTC:</span> {result.formatted.source.utc}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-green-800">Target Timezone</div>
                      <div className="space-y-1 text-muted-foreground">
                        <div><span className="font-medium">ISO:</span> {result.formatted.target.iso}</div>
                        <div><span className="font-medium">Local:</span> {result.formatted.target.local}</div>
                        <div><span className="font-medium">UTC:</span> {result.formatted.target.utc}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.targetTime)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Result
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResult}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to convert time</h3>
                <p className="text-muted-foreground">
                  Select timezones and enter a time to convert between different time zones
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Timezone Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🌍 Popular Timezones</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• UTC - Coordinated Universal Time</li>
                <li>• EST/EDT - Eastern Time (US)</li>
                <li>• CST/CDT - Central Time (US)</li>
                <li>• MST/MDT - Mountain Time (US)</li>
                <li>• PST/PDT - Pacific Time (US)</li>
                <li>• GMT - Greenwich Mean Time</li>
                <li>• CET/CEST - Central European Time</li>
                <li>• JST - Japan Standard Time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏰ Timezone Tips</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Daylight Saving Time (DST) is automatically handled</li>
                <li>• Use the swap button to quickly reverse conversion</li>
                <li>• Current time button sets to your local time</li>
                <li>• All conversions use IANA timezone standards</li>
                <li>• Results include UTC offset information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}