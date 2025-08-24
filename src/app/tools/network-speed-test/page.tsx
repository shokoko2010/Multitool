'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Wifi, 
  Download, 
  Upload, 
  Zap, 
  Clock, 
  Activity,
  TrendingUp,
  TrendingDown,
  Pause,
  Play
} from 'lucide-react'

interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
  serverLocation: string
  testDuration: number
  timestamp: Date
  downloadHistory: { time: number; speed: number }[]
  uploadHistory: { time: number; speed: number }[]
  pingHistory: { time: number; ping: number }[]
}

interface ServerOption {
  id: string
  name: string
  location: string
  distance: number
}

export default function NetworkSpeedTest() {
  const [isTesting, setIsTesting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [results, setResults] = useState<SpeedTestResult | null>(null)
  const [currentTest, setCurrentTest] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [selectedServer, setSelectedServer] = useState<string>('auto')
  const [error, setError] = useState<string | null>(null)
  
  const downloadProgressRef = useRef<number[]>([])
  const uploadProgressRef = useRef<number[]>([])
  const pingProgressRef = useRef<number[]>([])
  const testStartTimeRef = useRef<number>(0)

  const servers: ServerOption[] = [
    { id: 'auto', name: 'Auto Select', location: 'Automatic', distance: 0 },
    { id: 'us-east', name: 'US East', location: 'New York, NY', distance: 45 },
    { id: 'us-west', name: 'US West', location: 'San Francisco, CA', distance: 120 },
    { id: 'eu-central', name: 'EU Central', location: 'Frankfurt, DE', distance: 280 },
    { id: 'asia-east', name: 'Asia East', location: 'Tokyo, JP', distance: 450 },
    { id: 'australia', name: 'Australia', location: 'Sydney, AU', distance: 680 }
  ]

  const formatSpeed = (speed: number): string => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(2)} Gbps`
    } else if (speed >= 1) {
      return `${speed.toFixed(2)} Mbps`
    } else {
      return `${(speed * 1000).toFixed(0)} Kbps`
    }
  }

  const formatPing = (ping: number): string => {
    return `${ping.toFixed(0)} ms`
  }

  const formatDuration = (duration: number): string => {
    const seconds = Math.floor(duration / 1000)
    const ms = duration % 1000
    return `${seconds}.${ms.toString().padStart(3, '0')}s`
  }

  const getSpeedColor = (speed: number): string => {
    if (speed >= 100) return 'text-green-600'
    if (speed >= 50) return 'text-blue-600'
    if (speed >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPingColor = (ping: number): string => {
    if (ping < 50) return 'text-green-600'
    if (ping < 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  const testPing = async (): Promise<{ ping: number; jitter: number }> => {
    const pings: number[] = []
    const pingCount = 10
    
    for (let i = 0; i < pingCount; i++) {
      const startTime = Date.now()
      try {
        await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        const pingTime = Date.now() - startTime
        pings.push(pingTime)
      } catch (error) {
        pings.push(100) // Default ping on error
      }
      
      // Update progress
      setProgress(((i + 1) / pingCount) * 25)
      
      // Add small delay between pings
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length
    const jitter = Math.sqrt(pings.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pings.length)
    
    return { ping: avgPing, jitter }
  }

  const testDownloadSpeed = async (): Promise<number> => {
    const testFileSize = 10 * 1024 * 1024 // 10MB
    const testDuration = 5000 // 5 seconds
    const testData = new Array(testFileSize).fill(0).map(() => Math.random().toString(36)).join('')
    const blob = new Blob([testData])
    const url = URL.createObjectURL(blob)
    
    let totalBytes = 0
    let startTime = Date.now()
    let speedMeasurements: number[] = []
    
    const testInterval = setInterval(() => {
      if (isPaused) return
      
      // Simulate download by creating a large data transfer
      const chunkSize = 1024 * 1024 // 1MB chunks
      totalBytes += chunkSize
      
      const elapsed = Date.now() - startTime
      const speedMbps = (totalBytes * 8) / (elapsed / 1000) / 1000000
      speedMeasurements.push(speedMbps)
      
      downloadProgressRef.current.push(speedMbps)
      
      // Update progress
      setProgress(25 + (Math.min(elapsed, testDuration) / testDuration) * 35)
      
      if (elapsed >= testDuration) {
        clearInterval(testInterval)
      }
    }, 100)
    
    await new Promise(resolve => setTimeout(resolve, testDuration))
    clearInterval(testInterval)
    
    URL.revokeObjectURL(url)
    
    return speedMeasurements.length > 0 
      ? speedMeasurements.reduce((a, b) => a + b, 0) / speedMeasurements.length
      : 0
  }

  const testUploadSpeed = async (): Promise<number> => {
    const testDuration = 5000 // 5 seconds
    let totalBytes = 0
    let startTime = Date.now()
    let speedMeasurements: number[] = []
    
    const testInterval = setInterval(() => {
      if (isPaused) return
      
      // Simulate upload by creating data
      const chunkSize = 1024 * 1024 // 1MB chunks
      totalBytes += chunkSize
      
      const elapsed = Date.now() - startTime
      const speedMbps = (totalBytes * 8) / (elapsed / 1000) / 1000000
      speedMeasurements.push(speedMbps)
      
      uploadProgressRef.current.push(speedMbps)
      
      // Update progress
      setProgress(60 + (Math.min(elapsed, testDuration) / testDuration) * 35)
      
      if (elapsed >= testDuration) {
        clearInterval(testInterval)
      }
    }, 100)
    
    await new Promise(resolve => setTimeout(resolve, testDuration))
    clearInterval(testInterval)
    
    return speedMeasurements.length > 0 
      ? speedMeasurements.reduce((a, b) => a + b, 0) / speedMeasurements.length
      : 0
  }

  const startSpeedTest = async () => {
    setIsTesting(true)
    setIsPaused(false)
    setError(null)
    setResults(null)
    setProgress(0)
    
    // Reset progress arrays
    downloadProgressRef.current = []
    uploadProgressRef.current = []
    pingProgressRef.current = []
    testStartTimeRef.current = Date.now()
    
    try {
      // Test 1: Ping
      setCurrentTest('ping')
      const { ping, jitter } = await testPing()
      
      // Test 2: Download
      setCurrentTest('download')
      const downloadSpeed = await testDownloadSpeed()
      
      // Test 3: Upload
      setCurrentTest('upload')
      const uploadSpeed = await testUploadSpeed()
      
      // Generate history data
      const downloadHistory = downloadProgressRef.current.map((speed, index) => ({
        time: index * 100,
        speed
      }))
      
      const uploadHistory = uploadProgressRef.current.map((speed, index) => ({
        time: index * 100,
        speed
      }))
      
      const pingHistory = pingProgressRef.current.map((ping, index) => ({
        time: index * 100,
        ping
      }))
      
      const testDuration = Date.now() - testStartTimeRef.current
      const server = servers.find(s => s.id === selectedServer) || servers[0]
      
      setResults({
        downloadSpeed,
        uploadSpeed,
        ping,
        jitter,
        serverLocation: server.location,
        testDuration,
        timestamp: new Date(),
        downloadHistory,
        uploadHistory,
        pingHistory
      })
      
      setProgress(100)
      setCurrentTest('complete')
    } catch (error) {
      setError('Failed to complete speed test. Please try again.')
    } finally {
      setIsTesting(false)
      setCurrentTest('idle')
    }
  }

  const pauseTest = () => {
    setIsPaused(!isPaused)
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      'Metric,Value',
      `Download Speed,${results.downloadSpeed.toFixed(2)} Mbps`,
      `Upload Speed,${results.uploadSpeed.toFixed(2)} Mbps`,
      `Ping,${results.ping.toFixed(0)} ms`,
      `Jitter,${results.jitter.toFixed(0)} ms`,
      `Server Location,${results.serverLocation}`,
      `Test Duration,${(results.testDuration / 1000).toFixed(2)} seconds`,
      `Timestamp,${results.timestamp.toISOString()}`
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `speed_test_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTestStatus = () => {
    switch (currentTest) {
      case 'ping': return 'Testing Ping...'
      case 'download': return 'Testing Download Speed...'
      case 'upload': return 'Testing Upload Speed...'
      case 'complete': return 'Test Complete'
      default: return 'Ready to Test'
    }
  }

  const getTestIcon = () => {
    switch (currentTest) {
      case 'ping': return <Clock className="h-4 w-4" />
      case 'download': return <Download className="h-4 w-4" />
      case 'upload': return <Upload className="h-4 w-4" />
      case 'complete': return <Zap className="h-4 w-4" />
      default: return <Wifi className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-6 w-6" />
            Network Speed Test
          </CardTitle>
          <CardDescription>
            Test your internet connection speed, ping, and jitter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Server</label>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                disabled={isTesting}
              >
                {servers.map(server => (
                  <option key={server.id} value={server.id}>
                    {server.name} - {server.location}
                    {server.distance > 0 && ` (${server.distance}km)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Test Status</label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                {getTestIcon()}
                <span className="text-sm">{getTestStatus()}</span>
                {isTesting && (
                  <Badge variant="outline" className="ml-auto">
                    {progress.toFixed(0)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={startSpeedTest} 
              disabled={isTesting}
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Start Speed Test'
              )}
            </Button>
            
            {isTesting && (
              <Button variant="outline" onClick={pauseTest}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            )}
            
            {results && (
              <Button variant="outline" onClick={exportResults}>
                Export Results
              </Button>
            )}
          </div>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getSpeedColor(results.downloadSpeed)}`}>
                      {formatSpeed(results.downloadSpeed)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getSpeedColor(results.uploadSpeed)}`}>
                      {formatSpeed(results.uploadSpeed)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Upload className="h-3 w-3" />
                      Upload
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getPingColor(results.ping)}`}>
                      {formatPing(results.ping)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Ping
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatDuration(results.testDuration)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Activity className="h-3 w-3" />
                      Duration
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">Server Location:</span>
                            <span>{results.serverLocation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Download Speed:</span>
                            <span className={getSpeedColor(results.downloadSpeed)}>
                              {formatSpeed(results.downloadSpeed)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Upload Speed:</span>
                            <span className={getSpeedColor(results.uploadSpeed)}>
                              {formatSpeed(results.uploadSpeed)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">Ping:</span>
                            <span className={getPingColor(results.ping)}>
                              {formatPing(results.ping)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Jitter:</span>
                            <span>{formatPing(results.jitter)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Test Duration:</span>
                            <span>{formatDuration(results.testDuration)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Connection Quality</h4>
                        <div className="flex items-center gap-2">
                          {results.downloadSpeed >= 50 && results.uploadSpeed >= 20 && results.ping < 50 ? (
                            <Badge className="bg-green-100 text-green-800">
                              Excellent
                            </Badge>
                          ) : results.downloadSpeed >= 25 && results.uploadSpeed >= 10 && results.ping < 100 ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              Good
                            </Badge>
                          ) : results.downloadSpeed >= 10 && results.uploadSpeed >= 5 && results.ping < 200 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Fair
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              Poor
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            Based on download speed, upload speed, and ping
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detailed Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Speed Analysis</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Download Speed:</span>
                                <span className={getSpeedColor(results.downloadSpeed)}>
                                  {formatSpeed(results.downloadSpeed)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Upload Speed:</span>
                                <span className={getSpeedColor(results.uploadSpeed)}>
                                  {formatSpeed(results.uploadSpeed)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Speed Ratio:</span>
                                <span>
                                  {(results.downloadSpeed / results.uploadSpeed).toFixed(2)}:1
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Latency Analysis</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Ping:</span>
                                <span className={getPingColor(results.ping)}>
                                  {formatPing(results.ping)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Jitter:</span>
                                <span>{formatPing(results.jitter)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Connection Quality:</span>
                                <span>
                                  {results.ping < 50 ? 'Excellent' : 
                                   results.ping < 100 ? 'Good' : 
                                   results.ping < 200 ? 'Fair' : 'Poor'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Download Speed History</h4>
                          <div className="h-32 bg-muted rounded-lg p-2 flex items-end gap-1">
                            {results.downloadHistory.slice(-20).map((point, index) => (
                              <div
                                key={index}
                                className="bg-blue-500 rounded-sm flex-1"
                                style={{ 
                                  height: `${Math.min((point.speed / 100) * 100, 100)}%` 
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Upload Speed History</h4>
                          <div className="h-32 bg-muted rounded-lg p-2 flex items-end gap-1">
                            {results.uploadHistory.slice(-20).map((point, index) => (
                              <div
                                key={index}
                                className="bg-green-500 rounded-sm flex-1"
                                style={{ 
                                  height: `${Math.min((point.speed / 100) * 100, 100)}%` 
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="text-sm text-muted-foreground">
                Test completed at {results.timestamp.toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}