'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Clock, Calendar, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TimestampConverterTool() {
  const [unixTimestamp, setUnixTimestamp] = useState('')
  const [isoDate, setIsoDate] = useState('')
  const [readableDate, setReadableDate] = useState('')
  const [relativeTime, setRelativeTime] = useState('')
  const [inputTimestamp, setInputTimestamp] = useState('')
  const [inputType, setInputType] = useState('unix')
  const [timezone, setTimezone] = useState('local')
  const { toast } = useToast()

  useEffect(() => {
    if (inputTimestamp) {
      convertTimestamp()
    } else {
      clearAll()
    }
  }, [inputTimestamp, inputType, timezone])

  const convertTimestamp = () => {
    const timestamp = inputTimestamp.trim()
    
    if (!timestamp) {
      clearAll()
      return
    }

    try {
      let date: Date
      
      if (inputType === 'unix') {
        // Unix timestamp (seconds or milliseconds)
        const numTimestamp = parseInt(timestamp)
        if (isNaN(numTimestamp)) {
          throw new Error('Invalid timestamp')
        }
        
        // Check if it's in milliseconds (typically 13 digits)
        date = numTimestamp > 1000000000000 ? 
          new Date(numTimestamp) : 
          new Date(numTimestamp * 1000)
      } else if (inputType === 'iso') {
        // ISO format date string
        date = new Date(timestamp)
      } else {
        // Natural language date
        date = new Date(timestamp)
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }

      // Convert to Unix timestamp
      const unixSeconds = Math.floor(date.getTime() / 1000)
      const unixMs = date.getTime()
      
      // Format ISO string
      const iso = date.toISOString()
      
      // Format readable date
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone === 'utc' ? 'UTC' : undefined
      }
      const readable = date.toLocaleString('en-US', options)
      
      // Calculate relative time
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHour = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHour / 24)
      const diffWeek = Math.floor(diffDay / 7)
      const diffMonth = Math.floor(diffDay / 30)
      const diffYear = Math.floor(diffDay / 365)

      let relative = ''
      if (diffYear > 0) {
        relative = `${diffYear} year${diffYear > 1 ? 's' : ''} ago`
      } else if (diffMonth > 0) {
        relative = `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
      } else if (diffWeek > 0) {
        relative = `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`
      } else if (diffDay > 0) {
        relative = `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
      } else if (diffHour > 0) {
        relative = `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
      } else if (diffMin > 0) {
        relative = `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
      } else if (diffSec > 0) {
        relative = `${diffSec} second${diffSec > 1 ? 's' : ''} ago`
      } else if (diffMs < 0) {
        const futureDiffSec = Math.floor(Math.abs(diffMs) / 1000)
        relative = `in ${futureDiffSec} second${futureDiffSec > 1 ? 's' : ''}`
      } else {
        relative = 'just now'
      }

      setUnixTimestamp(unixSeconds.toString())
      setIsoDate(iso)
      setReadableDate(readable)
      setRelativeTime(relative)
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Invalid timestamp or date format",
        variant: "destructive",
      })
      clearAll()
    }
  }

  const clearAll = () => {
    setUnixTimestamp('')
    setIsoDate('')
    setReadableDate('')
    setRelativeTime('')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const loadSampleValues = () => {
    const now = Math.floor(Date.now() / 1000)
    setInputTimestamp(now.toString())
    setInputType('unix')
  }

  const getCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000)
    setInputTimestamp(now.toString())
    setInputType('unix')
  }

  const getTimestampInfo = () => {
    if (!unixTimestamp) return null
    
    const timestamp = parseInt(unixTimestamp)
    const date = new Date(timestamp * 1000)
    
    return {
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayOfYear: Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24),
      weekOfYear: Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24 / 7),
      isLeapYear: new Date(date.getFullYear(), 1, 29).getDate() === 29,
      daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }
  }

  const timestampInfo = getTimestampInfo()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Timestamp Converter</h1>
        <p className="text-muted-foreground">
          Convert between Unix timestamps, ISO dates, and human-readable formats
        </p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Timestamp Converter</TabsTrigger>
          <TabsTrigger value="reference">Timestamp Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter" className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timestamp Input
              </CardTitle>
              <CardDescription>
                Enter a timestamp or date to convert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Timestamp Value</Label>
                  <Input
                    type="text"
                    placeholder="Enter timestamp or date"
                    value={inputTimestamp}
                    onChange={(e) => setInputTimestamp(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Input Type</Label>
                  <select 
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="unix">Unix Timestamp</option>
                    <option value="iso">ISO Date String</option>
                    <option value="natural">Natural Language</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="local">Local Time</option>
                    <option value="utc">UTC</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={loadSampleValues} variant="outline" className="flex-1">
                  Load Sample
                </Button>
                <Button onClick={getCurrentTimestamp} variant="outline" className="flex-1">
                  Current Time
                </Button>
                <Button onClick={clearAll} variant="outline" className="flex-1">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Results */}
          {(unixTimestamp || isoDate || readableDate) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Unix Timestamp */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Unix Timestamp
                  </CardTitle>
                  <CardDescription>
                    Unix timestamp in seconds since January 1, 1970
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seconds</Label>
                    <div className="relative">
                      <Input
                        value={unixTimestamp}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => copyToClipboard(unixTimestamp, 'Unix Timestamp (seconds)')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {unixTimestamp && (
                    <div className="space-y-2">
                      <Label>Milliseconds</Label>
                      <div className="relative">
                        <Input
                          value={(parseInt(unixTimestamp) * 1000).toString()}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                          onClick={() => copyToClipboard((parseInt(unixTimestamp) * 1000).toString(), 'Unix Timestamp (milliseconds)')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ISO Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    ISO Date Format
                  </CardTitle>
                  <CardDescription>
                    ISO 8601 standard date format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ISO String</Label>
                    <div className="relative">
                      <Input
                        value={isoDate}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => copyToClipboard(isoDate, 'ISO Date')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Human Readable</Label>
                    <div className="relative">
                      <Input
                        value={readableDate}
                        readOnly
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => copyToClipboard(readableDate, 'Human Readable Date')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Relative Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Relative Time
                  </CardTitle>
                  <CardDescription>
                    Time relative to now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Relative Expression</Label>
                    <div className="relative">
                      <Input
                        value={relativeTime}
                        readOnly
                        className="text-lg"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => copyToClipboard(relativeTime, 'Relative Time')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              {timestampInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Extra details about the timestamp
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Day of Week</div>
                        <div>{timestampInfo.dayOfWeek}</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Day of Year</div>
                        <div>{timestampInfo.dayOfYear}</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Week of Year</div>
                        <div>{timestampInfo.weekOfYear}</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Leap Year</div>
                        <div>{timestampInfo.isLeapYear ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reference" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unix Timestamp Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Unix Timestamp Reference</CardTitle>
                <CardDescription>
                  Important Unix timestamps and their meanings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { timestamp: 0, date: 'January 1, 1970', desc: 'Unix Epoch (start of Unix time)' },
                    { timestamp: 1000000000, date: 'September 9, 2001', desc: 'Billisecond 1000000000' },
                    { timestamp: 1234567890, date: 'February 13, 2009', desc: 'Interesting sequential timestamp' },
                    { timestamp: 1417392000, date: 'December 1, 2014', desc: 'First public release of React' },
                    { timestamp: 1609459200, date: 'January 1, 2021', desc: 'Start of the 2020s' },
                    { timestamp: 1640995200, date: 'January 1, 2022', desc: 'Start of the 2022' },
                    { timestamp: 1672531200, date: 'January 1, 2023', desc: 'Start of the 2023' },
                    { timestamp: 1704067200, date: 'January 1, 2024', desc: 'Start of the 2024' },
                    { timestamp: 253402300799, date: 'November 20, 2286', desc: 'Maximum 32-bit signed timestamp' },
                    { timestamp: 4294967295, date: 'February 7, 2106', desc: 'Maximum 32-bit unsigned timestamp' }
                  ].map((ref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{ref.desc}</div>
                        <div className="text-sm text-muted-foreground">{ref.date}</div>
                      </div>
                      <div className="text-sm font-mono text-blue-600">
                        {ref.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timestamp Formats */}
            <Card>
              <CardHeader>
                <CardTitle>Timestamp Formats</CardTitle>
                <CardDescription>
                  Different timestamp formats and their uses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Unix Timestamp</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Seconds or milliseconds since January 1, 1970 (Unix Epoch). Used in programming, logging, and system timekeeping.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">ISO 8601</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      International standard format: YYYY-MM-DDTHH:mm:ss.sssZ. Unambiguous and sortable. Used in web APIs and data interchange.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">RFC 2822</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Email standard format: Day, DD Mon YYYY HH:mm:ss ±HHmm. Used in email headers and some web applications.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Relative Time</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Human-readable expressions like "2 hours ago" or "in 3 days". Used in social media and user interfaces.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Timestamp Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Common Timestamp Patterns</CardTitle>
              <CardDescription>
                Useful patterns and conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { pattern: 'Current timestamp', code: 'Math.floor(Date.now() / 1000)', language: 'JavaScript' },
                  { pattern: 'ISO to Unix', code: 'Math.floor(new Date("2024-01-01").getTime() / 1000)', language: 'JavaScript' },
                  { pattern: 'Unix to ISO', code: 'new Date(1704067200 * 1000).toISOString()', language: 'JavaScript' },
                  { pattern: 'Get current time in milliseconds', code: 'Date.now()', language: 'JavaScript' },
                  { pattern: 'Format timestamp', code: 'new Date(timestamp * 1000).toLocaleString()', language: 'JavaScript' },
                  { pattern: 'Check if timestamp is future', code: 'timestamp > Math.floor(Date.now() / 1000)', language: 'JavaScript' }
                ].map((pattern, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="font-semibold">{pattern.pattern}</div>
                    <div className="text-sm font-mono bg-gray-900 text-green-400 p-2 rounded">
                      {pattern.code}
                    </div>
                    <div className="text-xs text-muted-foreground">{pattern.language}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timestamp Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamp Use Cases</CardTitle>
              <CardDescription>
                Common applications and scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { category: 'Web Development', examples: ['API responses', 'Database records', 'Session management'] },
                  { category: 'Logging', examples: ['Application logs', 'System events', 'Error tracking'] },
                  { category: 'Data Analysis', examples: ['Time series data', 'Event tracking', 'Performance metrics'] },
                  { category: 'Security', examples: ['Authentication tokens', 'Password resets', 'Access logs'] },
                  { category: 'Scheduling', examples: ['Cron jobs', 'Task queues', 'Reminders'] },
                  { category: 'Blockchain', examples: ['Block timestamps', 'Transaction times', 'Smart contracts'] }
                ].map((useCase, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="font-semibold">{useCase.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {useCase.examples.join(', ')}
                    </div>
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