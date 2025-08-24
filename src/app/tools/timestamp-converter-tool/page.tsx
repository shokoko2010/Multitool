'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Clock, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TimestampResult {
  format: string
  value: string
  description: string
}

export default function TimestampConverterTool() {
  const [timestamp, setTimestamp] = useState('')
  const [dateString, setDateString] = useState('')
  const [results, setResults] = useState<TimestampResult[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [currentTimezone, setCurrentTimezone] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Get user's timezone
    setCurrentTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)

    return () => clearInterval(timer)
  }, [])

  const isValidTimestamp = (ts: string): boolean => {
    const num = parseInt(ts)
    return !isNaN(num) && num > 0
  }

  const isValidDateString = (dateStr: string): boolean => {
    return !isNaN(new Date(dateStr).getTime())
  }

  const convertTimestamp = (ts: string): TimestampResult[] => {
    const timestampNum = parseInt(ts)
    const date = new Date(timestampNum * 1000) // Convert seconds to milliseconds
    
    return [
      {
        format: 'ISO 8601',
        value: date.toISOString(),
        description: 'Standard international format'
      },
      {
        format: 'Local Date',
        value: date.toLocaleDateString(),
        description: 'Date in local format'
      },
      {
        format: 'Local Time',
        value: date.toLocaleTimeString(),
        description: 'Time in local format'
      },
      {
        format: 'Local DateTime',
        value: date.toLocaleString(),
        description: 'Date and time in local format'
      },
      {
        format: 'UTC',
        value: date.toUTCString(),
        description: 'Coordinated Universal Time'
      },
      {
        format: 'Unix Timestamp (ms)',
        value: date.getTime().toString(),
        description: 'Milliseconds since epoch'
      },
      {
        format: 'Unix Timestamp (s)',
        value: Math.floor(date.getTime() / 1000).toString(),
        description: 'Seconds since epoch'
      },
      {
        format: 'RFC 2822',
        value: date.toUTCString().replace('GMT', '+0000'),
        description: 'Email date format'
      },
      {
        format: 'Year-Month-Day',
        value: date.toISOString().split('T')[0],
        description: 'YYYY-MM-DD format'
      },
      {
        format: 'Time 24h',
        value: date.toTimeString().split(' ')[0],
        description: '24-hour format HH:MM:SS'
      }
    ]
  }

  const convertDateString = (dateStr: string): TimestampResult[] => {
    const date = new Date(dateStr)
    
    return [
      {
        format: 'Unix Timestamp (s)',
        value: Math.floor(date.getTime() / 1000).toString(),
        description: 'Seconds since epoch'
      },
      {
        format: 'Unix Timestamp (ms)',
        value: date.getTime().toString(),
        description: 'Milliseconds since epoch'
      },
      {
        format: 'ISO 8601',
        value: date.toISOString(),
        description: 'Standard international format'
      },
      {
        format: 'UTC',
        value: date.toUTCString(),
        description: 'Coordinated Universal Time'
      },
      {
        format: 'Local DateTime',
        value: date.toLocaleString(),
        description: 'Date and time in local format'
      },
      {
        format: 'RFC 2822',
        value: date.toUTCString().replace('GMT', '+0000'),
        description: 'Email date format'
      }
    ]
  }

  const handleTimestampConvert = () => {
    if (!isValidTimestamp(timestamp)) {
      toast({
        title: "Invalid Timestamp",
        description: "Please enter a valid Unix timestamp",
        variant: "destructive"
      })
      return
    }

    const conversionResults = convertTimestamp(timestamp)
    setResults(conversionResults)
  }

  const handleDateConvert = () => {
    if (!isValidDateString(dateString)) {
      toast({
        title: "Invalid Date",
        description: "Please enter a valid date string",
        variant: "destructive"
      })
      return
    }

    const conversionResults = convertDateString(dateString)
    setResults(conversionResults)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Value has been copied to clipboard",
    })
  }

  const downloadResults = () => {
    if (results.length === 0) return

    const content = `Timestamp Conversion Results
============================

Input: ${timestamp || dateString}

Converted Values:
${results.map(result => 
  `${result.format}:
  ${result.value}
  Description: ${result.description}`
).join('\n\n')}

Current Time: ${currentTime.toLocaleString()}
Timezone: ${currentTimezone}

Generated on: ${new Date().toLocaleString()}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'timestamp-conversion-results.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setTimestamp('')
    setDateString('')
    setResults([])
  }

  const setCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000)
    setTimestamp(now.toString())
    handleTimestampConvert()
  }

  const setCurrentDate = () => {
    const now = new Date().toISOString()
    setDateString(now)
    handleDateConvert()
  }

  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Timestamp Converter
          </CardTitle>
          <CardDescription>
            Convert between Unix timestamps and human-readable date formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Time Display */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentTime.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">
                    Timezone: {currentTimezone}
                  </div>
                  <div className="flex justify-center gap-4">
                    <Badge variant="outline">
                      Unix: {Math.floor(currentTime.getTime() / 1000)}
                    </Badge>
                    <Badge variant="outline">
                      Unix (ms): {currentTime.getTime()}
                    </Badge>
                    <Badge variant="outline">
                      ISO: {currentTime.toISOString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Tabs */}
            <Tabs defaultValue="timestamp" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timestamp">Timestamp to Date</TabsTrigger>
                <TabsTrigger value="date">Date to Timestamp</TabsTrigger>
              </TabsList>

              <TabsContent value="timestamp" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleTimestampConvert} disabled={!timestamp.trim()}>
                      Convert Timestamp
                    </Button>
                    <Button variant="outline" onClick={setCurrentTimestamp}>
                      Use Current Time
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    {results.length > 0 && (
                      <Button variant="outline" onClick={downloadResults}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timestamp">Unix Timestamp (seconds):</Label>
                    <Input
                      id="timestamp"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g., 1634567890"
                      type="number"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="date" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleDateConvert} disabled={!dateString.trim()}>
                      Convert Date
                    </Button>
                    <Button variant="outline" onClick={setCurrentDate}>
                      Use Current Date
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    {results.length > 0 && (
                      <Button variant="outline" onClick={downloadResults}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-string">Date String:</Label>
                    <Input
                      id="date-string"
                      value={dateString}
                      onChange={(e) => setDateString(e.target.value)}
                      placeholder="e.g., 2021-10-19T12:34:56Z or Oct 19, 2021"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conversion Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{result.format}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="text-sm">
                          {result.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="font-mono text-sm bg-muted p-3 rounded break-all">
                            {result.value}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {result.value.length} characters
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Common Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Timestamps</CardTitle>
                <CardDescription>
                  Click any timestamp to convert it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTimestamp('0')
                      handleTimestampConvert()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">Unix Epoch</div>
                    <div className="text-xs text-muted-foreground">January 1, 1970</div>
                    <div className="text-xs font-mono">0</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTimestamp('1000000000')
                      handleTimestampConvert()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">Billion Second</div>
                    <div className="text-xs text-muted-foreground">September 9, 2001</div>
                    <div className="text-xs font-mono">1000000000</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTimestamp('1234567890')
                      handleTimestampConvert()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">Sequential</div>
                    <div className="text-xs text-muted-foreground">February 13, 2009</div>
                    <div className="text-xs font-mono">1234567890</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTimestamp('1609459200')
                      handleTimestampConvert()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">2021 Start</div>
                    <div className="text-xs text-muted-foreground">January 1, 2021</div>
                    <div className="text-xs font-mono">1609459200</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTimestamp('1640995200')
                      handleTimestampConvert()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">2022 Start</div>
                    <div className="text-xs text-muted-foreground">January 1, 2022</div>
                    <div className="text-xs font-mono">1640995200</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTimestamp('1672531200')
                      handleTimestampConvert()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">2023 Start</div>
                    <div className="text-xs text-muted-foreground">January 1, 2023</div>
                    <div className="text-xs font-mono">1672531200</div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Format Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timestamp Format Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Unix Timestamp</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Seconds since January 1, 1970 (Unix Epoch)</li>
                      <li>• Also known as POSIX time or Epoch time</li>
                      <li>• Commonly used in programming and databases</li>
                      <li>• Timezone independent (always UTC)</li>
                      <li>• Example: 1634567890</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Date Formats</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>ISO 8601:</strong> 2021-10-19T12:34:56Z</li>
                      <li>• <strong>RFC 2822:</strong> Tue, 19 Oct 2021 12:34:56 GMT</li>
                      <li>• <strong>Local:</strong> User's timezone format</li>
                      <li>• <strong>UTC:</strong> Coordinated Universal Time</li>
                      <li>• <strong>Milliseconds:</strong> 1634567890000</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Convert Unix timestamps to readable dates and vice versa</li>
                <li>• Use "Current Time" to get real-time conversion values</li>
                <li>• Click on common timestamps for quick examples</li>
                <li>• Copy any converted value with the copy button</li>
                <li>• Results include multiple formats for different use cases</li>
                <li>• Supports both seconds and milliseconds timestamps</li>
                <li>• All times are displayed in your local timezone</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}