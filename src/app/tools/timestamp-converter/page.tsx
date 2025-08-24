'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, Copy, RefreshCw } from 'lucide-react'

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('')
  const [dateString, setDateString] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [currentTimestamp, setCurrentTimestamp] = useState('')

  useEffect(() => {
    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateCurrentTime = () => {
    const now = new Date()
    setCurrentTime(now.toLocaleString())
    setCurrentTimestamp(Math.floor(now.getTime() / 1000).toString())
  }

  const timestampToDate = () => {
    if (!timestamp) return
    
    const ts = parseInt(timestamp)
    if (isNaN(ts)) {
      setDateString('Invalid timestamp')
      return
    }

    const date = new Date(ts * 1000)
    setDateString(date.toLocaleString())
  }

  const dateToTimestamp = () => {
    if (!dateString) return
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      setTimestamp('Invalid date')
      return
    }

    setTimestamp(Math.floor(date.getTime() / 1000).toString())
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const useCurrentTime = () => {
    setTimestamp(currentTimestamp)
    setDateString(currentTime)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Timestamp Converter</h1>
          <p className="text-muted-foreground">
            Convert between Unix timestamps and human-readable dates
          </p>
        </div>

        {/* Current Time Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Human Readable</Label>
                <div className="flex items-center gap-2">
                  <Input value={currentTime} readOnly className="flex-1" />
                  <Button 
                    onClick={() => copyToClipboard(currentTime)} 
                    variant="outline" 
                    size="icon"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unix Timestamp</Label>
                <div className="flex items-center gap-2">
                  <Input value={currentTimestamp} readOnly className="flex-1" />
                  <Button 
                    onClick={() => copyToClipboard(currentTimestamp)} 
                    variant="outline" 
                    size="icon"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button onClick={useCurrentTime} className="w-full mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Use Current Time
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timestamp to Date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timestamp to Date
              </CardTitle>
              <CardDescription>
                Convert Unix timestamp to human-readable format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timestamp">Unix Timestamp</Label>
                <Input
                  id="timestamp"
                  placeholder="Enter timestamp (e.g., 1634567890)"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                />
              </div>
              
              <Button onClick={timestampToDate} className="w-full">
                Convert to Date
              </Button>

              {dateString && (
                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="flex items-center gap-2">
                    <Input value={dateString} readOnly className="flex-1" />
                    <Button 
                      onClick={() => copyToClipboard(dateString)} 
                      variant="outline" 
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date to Timestamp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date to Timestamp
              </CardTitle>
              <CardDescription>
                Convert human-readable date to Unix timestamp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateString">Date String</Label>
                <Input
                  id="dateString"
                  placeholder="Enter date (e.g., MM/DD/YYYY HH:MM:SS)"
                  value={dateString}
                  onChange={(e) => setDateString(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Format: MM/DD/YYYY HH:MM:SS or any valid date string
                </p>
              </div>
              
              <Button onClick={dateToTimestamp} className="w-full">
                Convert to Timestamp
              </Button>

              {timestamp && (
                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="flex items-center gap-2">
                    <Input value={timestamp} readOnly className="flex-1" />
                    <Button 
                      onClick={() => copyToClipboard(timestamp)} 
                      variant="outline" 
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Unix Timestamps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What is a Unix Timestamp?</h4>
                <p className="text-sm text-muted-foreground">
                  A Unix timestamp (also known as Epoch time) is the number of seconds that have 
                  elapsed since January 1, 1970, at 00:00:00 UTC.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Common Formats</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Seconds (10 digits)</Badge>
                  <Badge variant="secondary">Milliseconds (13 digits)</Badge>
                  <Badge variant="secondary">Microseconds (16 digits)</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Database storage and queries</li>
                  <li>• API communication and timestamps</li>
                  <li>• Logging and debugging</li>
                  <li>• Scheduling and time-based operations</li>
                  <li>• Data synchronization between systems</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Examples</h4>
                <div className="text-sm space-y-1">
                  <p><code>1634567890</code> = October 18, 2021, 12:38:10 PM UTC</p>
                  <p><code>1609459200</code> = January 1, 2021, 12:00:00 AM UTC</p>
                  <p><code>1672531200</code> = January 1, 2023, 12:00:00 AM UTC</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}