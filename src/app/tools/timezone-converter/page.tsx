'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Globe, Clock, Copy, RefreshCw } from 'lucide-react'

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
  { value: 'America/Phoenix', label: 'Phoenix (MST)', offset: -7 },
  { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)', offset: -9 },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)', offset: -10 },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: 5.5 },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 10 },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 12 }
]

export default function TimezoneConverter() {
  const [fromTimezone, setFromTimezone] = useState('UTC')
  const [toTimezone, setToTimezone] = useState('America/New_York')
  const [inputTime, setInputTime] = useState('')
  const [convertedTime, setConvertedTime] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    updateCurrentTime()
    const interval = setInterval(updateCurrentTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateCurrentTime = () => {
    const now = new Date()
    setCurrentTime(now.toLocaleString())
    if (!inputTime) {
      setInputTime(now.toISOString().slice(0, 16))
    }
  }

  const convertTime = () => {
    if (!inputTime) return

    try {
      const date = new Date(inputTime)
      if (isNaN(date.getTime())) {
        setConvertedTime('Invalid date format')
        return
      }

      // Format the converted time
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: toTimezone,
        timeZoneName: 'short'
      }

      const converted = date.toLocaleString('en-US', options)
      setConvertedTime(converted)
    } catch (error) {
      setConvertedTime('Conversion failed')
    }
  }

  const swapTimezones = () => {
    setFromTimezone(toTimezone)
    setToTimezone(fromTimezone)
    setInputTime('')
    setConvertedTime('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const useCurrentTime = () => {
    const now = new Date()
    setInputTime(now.toISOString().slice(0, 16))
  }

  const getTimezoneOffset = (timezone: string) => {
    const tz = timezones.find(t => t.value === timezone)
    return tz ? tz.offset : 0
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Timezone Converter</h1>
          <p className="text-muted-foreground">
            Convert time between different time zones around the world
          </p>
        </div>

        {/* Current Time Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Time (UTC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={currentTime} readOnly className="flex-1" />
              <Button 
                onClick={() => copyToClipboard(currentTime)} 
                variant="outline" 
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={useCurrentTime} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Use Current
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Converter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Time Zone Converter
            </CardTitle>
            <CardDescription>
              Convert time between different time zones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Timezone */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromTimezone">From Timezone</Label>
                  <Select value={fromTimezone} onValueChange={setFromTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="text-xs">
                    UTC{getTimezoneOffset(fromTimezone) >= 0 ? '+' : ''}{getTimezoneOffset(fromTimezone)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inputTime">Date & Time</Label>
                  <Input
                    id="inputTime"
                    type="datetime-local"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                  />
                </div>
              </div>

              {/* To Timezone */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="toTimezone">To Timezone</Label>
                  <Select value={toTimezone} onValueChange={setToTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="text-xs">
                    UTC{getTimezoneOffset(toTimezone) >= 0 ? '+' : ''}{getTimezoneOffset(toTimezone)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Converted Time</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={convertedTime} 
                      readOnly 
                      placeholder="Converted time will appear here" 
                      className="flex-1" 
                    />
                    <Button 
                      onClick={() => copyToClipboard(convertedTime)} 
                      variant="outline" 
                      size="icon"
                      disabled={!convertedTime}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={convertTime} className="flex-1">
                Convert Time
              </Button>
              <Button onClick={swapTimezones} variant="outline">
                Swap Timezones
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timezone Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Timezone Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timezones.map((tz) => (
                <div key={tz.value} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{tz.label}</div>
                    <div className="text-sm text-muted-foreground">{tz.value}</div>
                  </div>
                  <Badge variant="outline">
                    UTC{tz.offset >= 0 ? '+' : ''}{tz.offset}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}