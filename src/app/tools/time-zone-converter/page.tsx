'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Globe, Copy, RefreshCw } from 'lucide-react'

interface TimeZone {
  id: string
  name: string
  offset: string
  cities: string[]
}

interface TimeConversion {
  sourceTime: string
  sourceZone: string
  targetTime: string
  targetZone: string
  offset: string
  isDaylightSaving: boolean
}

interface FavoriteZone {
  id: string
  name: string
  addedAt: Date
}

export default function TimeZoneConverter() {
  const [sourceTime, setSourceTime] = useState<string>(new Date().toTimeString().slice(0, 5))
  const [sourceZone, setSourceZone] = useState<string>('America/New_York')
  const [targetZone, setTargetZone] = useState<string>('Europe/London')
  const [conversion, setConversion] = useState<TimeConversion | null>(null)
  const [favoriteZones, setFavoriteZones] = useState<FavoriteZone[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  const timeZones: TimeZone[] = [
    { id: 'America/New_York', name: 'Eastern Time', offset: 'UTC-5', cities: ['New York', 'Washington DC', 'Miami'] },
    { id: 'America/Chicago', name: 'Central Time', offset: 'UTC-6', cities: ['Chicago', 'Houston', 'Dallas'] },
    { id: 'America/Denver', name: 'Mountain Time', offset: 'UTC-7', cities: ['Denver', 'Phoenix', 'Salt Lake City'] },
    { id: 'America/Los_Angeles', name: 'Pacific Time', offset: 'UTC-8', cities: ['Los Angeles', 'San Francisco', 'Seattle'] },
    { id: 'America/Anchorage', name: 'Alaska Time', offset: 'UTC-9', cities: ['Anchorage', 'Fairbanks'] },
    { id: 'Pacific/Honolulu', name: 'Hawaii Time', offset: 'UTC-10', cities: ['Honolulu', 'Hilo'] },
    { id: 'Europe/London', name: 'Greenwich Mean Time', offset: 'UTC+0', cities: ['London', 'Dublin', 'Lisbon'] },
    { id: 'Europe/Paris', name: 'Central European Time', offset: 'UTC+1', cities: ['Paris', 'Berlin', 'Rome'] },
    { id: 'Europe/Helsinki', name: 'Eastern European Time', offset: 'UTC+2', cities: ['Helsinki', 'Athens', 'Bucharest'] },
    { id: 'Europe/Moscow', name: 'Moscow Time', offset: 'UTC+3', cities: ['Moscow', 'St. Petersburg'] },
    { id: 'Asia/Dubai', name: 'Gulf Standard Time', offset: 'UTC+4', cities: ['Dubai', 'Abu Dhabi', 'Muscat'] },
    { id: 'Asia/Kolkata', name: 'Indian Standard Time', offset: 'UTC+5:30', cities: ['Mumbai', 'Delhi', 'Bangalore'] },
    { id: 'Asia/Shanghai', name: 'China Standard Time', offset: 'UTC+8', cities: ['Beijing', 'Shanghai', 'Hong Kong'] },
    { id: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+9', cities: ['Tokyo', 'Osaka', 'Kyoto'] },
    { id: 'Australia/Sydney', name: 'Australian Eastern Time', offset: 'UTC+10', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
    { id: 'Pacific/Auckland', name: 'New Zealand Time', offset: 'UTC+12', cities: ['Auckland', 'Wellington'] },
    { id: 'America/Sao_Paulo', name: 'Brasília Time', offset: 'UTC-3', cities: ['São Paulo', 'Rio de Janeiro'] },
    { id: 'America/Mexico_City', name: 'Central Standard Time', offset: 'UTC-6', cities: ['Mexico City', 'Guadalajara'] },
    { id: 'Asia/Singapore', name: 'Singapore Time', offset: 'UTC+8', cities: ['Singapore', 'Kuala Lumpur'] },
    { id: 'Asia/Seoul', name: 'Korea Standard Time', offset: 'UTC+9', cities: ['Seoul', 'Busan'] }
  ]

  const convertTime = () => {
    if (!sourceTime) return

    const [hours, minutes] = sourceTime.split(':').map(Number)
    const sourceDate = new Date()
    sourceDate.setHours(hours, minutes, 0, 0)

    // Get timezone offsets (simplified for demo)
    const sourceOffset = getTimezoneOffset(sourceZone)
    const targetOffset = getTimezoneOffset(targetZone)

    // Calculate target time
    const sourceTotalMinutes = hours * 60 + minutes
    const targetTotalMinutes = sourceTotalMinutes + (targetOffset - sourceOffset)
    
    let targetHours = Math.floor(targetTotalMinutes / 60)
    let targetMinutes = targetTotalMinutes % 60

    // Handle day overflow
    if (targetHours >= 24) {
      targetHours -= 24
    } else if (targetHours < 0) {
      targetHours += 24
    }

    const targetTimeStr = `${targetHours.toString().padStart(2, '0')}:${targetMinutes.toString().padStart(2, '0')}`
    const offsetDiff = targetOffset - sourceOffset
    const offsetStr = offsetDiff >= 0 ? `+${offsetDiff}` : `${offsetDiff}`

    const result: TimeConversion = {
      sourceTime: sourceTime,
      sourceZone: sourceZone,
      targetTime: targetTimeStr,
      targetZone: targetZone,
      offset: offsetStr,
      isDaylightSaving: isDaylightSavingTime(sourceDate)
    }

    setConversion(result)
  }

  const getTimezoneOffset = (zoneId: string): number => {
    const zone = timeZones.find(tz => tz.id === zoneId)
    if (!zone) return 0

    const offsetStr = zone.offset.replace('UTC', '')
    const [hours, minutes] = offsetStr.split(':').map(Number)
    return hours * 60 + (minutes || 0)
  }

  const isDaylightSavingTime = (date: Date): boolean => {
    // Simplified DST check (Northern Hemisphere: March-November)
    const month = date.getMonth()
    return month >= 2 && month <= 10
  }

  const addToFavorites = (zoneId: string) => {
    const zone = timeZones.find(tz => tz.id === zoneId)
    if (!zone) return

    const exists = favoriteZones.some(fav => fav.id === zoneId)
    if (!exists) {
      const favorite: FavoriteZone = {
        id: zoneId,
        name: zone.name,
        addedAt: new Date()
      }
      setFavoriteZones(prev => [...prev, favorite].slice(0, 10))
    }
  }

  const removeFromFavorites = (zoneId: string) => {
    setFavoriteZones(prev => prev.filter(fav => fav.id !== zoneId))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const swapZones = () => {
    setSourceZone(targetZone)
    setTargetZone(sourceZone)
  }

  const setCurrentTimeAsSource = () => {
    const now = new Date()
    setSourceTime(now.toTimeString().slice(0, 5))
  }

  useEffect(() => {
    convertTime()
  }, [sourceTime, sourceZone, targetZone])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const getZoneInfo = (zoneId: string) => {
    return timeZones.find(tz => tz.id === zoneId)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Time Zone Converter</h1>
        <p className="text-muted-foreground">Convert time between different time zones worldwide</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Conversion
              </CardTitle>
              <CardDescription>
                Convert time between different time zones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceTime">Source Time</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sourceTime"
                      type="time"
                      value={sourceTime}
                      onChange={(e) => setSourceTime(e.target.value)}
                    />
                    <Button variant="outline" onClick={setCurrentTimeAsSource}>
                      Now
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceZone">Source Time Zone</Label>
                  <Select value={sourceZone} onValueChange={setSourceZone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({zone.offset})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={swapZones}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Swap
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetZone">Target Time Zone</Label>
                  <Select value={targetZone} onValueChange={setTargetZone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({zone.offset})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Converted Time</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {conversion ? formatTime(conversion.targetTime) : '--:--'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {conversion && `${conversion.offset} hours`}
                    </div>
                  </div>
                </div>
              </div>

              {conversion && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(
                      `${formatTime(conversion.sourceTime)} ${getZoneInfo(conversion.sourceZone)?.name} = ${formatTime(conversion.targetTime)} ${getZoneInfo(conversion.targetZone)?.name}`
                    )}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Result
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addToFavorites(sourceZone)}
                    disabled={favoriteZones.some(fav => fav.id === sourceZone)}
                  >
                    Add Source to Favorites
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addToFavorites(targetZone)}
                    disabled={favoriteZones.some(fav => fav.id === targetZone)}
                  >
                    Add Target to Favorites
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Current World Times
              </CardTitle>
              <CardDescription>
                Current time in major cities around the world
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeZones.slice(0, 9).map((zone) => {
                  const offset = getTimezoneOffset(zone.id)
                  const localMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
                  const zoneMinutes = localMinutes + offset
                  let zoneHours = Math.floor(zoneMinutes / 60)
                  const zoneMins = zoneMinutes % 60

                  if (zoneHours >= 24) zoneHours -= 24
                  if (zoneHours < 0) zoneHours += 24

                  const zoneTime = `${zoneHours.toString().padStart(2, '0')}:${zoneMins.toString().padStart(2, '0')}`

                  return (
                    <div key={zone.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-lg font-semibold">{formatTime(zoneTime)}</div>
                      <div className="text-sm text-muted-foreground">{zone.offset}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {zone.cities[0]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Time Zones</CardTitle>
              <CardDescription>
                Quick access to your frequently used time zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteZones.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No favorite zones yet
                </div>
              ) : (
                <div className="space-y-2">
                  {favoriteZones.map((favorite) => {
                    const zone = timeZones.find(tz => tz.id === favorite.id)
                    if (!zone) return null

                    const offset = getTimezoneOffset(zone.id)
                    const localMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
                    const zoneMinutes = localMinutes + offset
                    let zoneHours = Math.floor(zoneMinutes / 60)
                    const zoneMins = zoneMinutes % 60

                    if (zoneHours >= 24) zoneHours -= 24
                    if (zoneHours < 0) zoneHours += 24

                    const zoneTime = `${zoneHours.toString().padStart(2, '0')}:${zoneMins.toString().padStart(2, '0')}`

                    return (
                      <div key={favorite.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{zone.name}</div>
                          <div className="text-xs text-muted-foreground">{zone.offset}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatTime(zoneTime)}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromFavorites(favorite.id)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
              <CardDescription>
                Common time zone conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>EST → GMT:</span>
                  <Badge variant="outline">+5 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span>PST → EST:</span>
                  <Badge variant="outline">+3 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span>GMT → CET:</span>
                  <Badge variant="outline">+1 hour</Badge>
                </div>
                <div className="flex justify-between">
                  <span>EST → JST:</span>
                  <Badge variant="outline">+14 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span>GMT → IST:</span>
                  <Badge variant="outline">+5:30 hours</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}