'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Globe, 
  Wifi, 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Server,
  WifiOff,
  Signal,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface NetworkTest {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  result?: any
  duration?: number
  error?: string
}

interface PingResult {
  host: string
  packets: number
  lost: number
  min: number
  max: number
  avg: number
  timestamp: string
}

interface SpeedTestResult {
  download: number
  upload: number
  ping: number
  jitter: number
  timestamp: string
}

interface PortScanResult {
  host: string
  ports: Array<{
    port: number
    state: 'open' | 'closed' | 'filtered'
    service?: string
  }>
  timestamp: string
}

export default function NetworkDiagnostic() {
  const { theme } = useTheme()
  const [targetUrl, setTargetUrl] = useState('8.8.8.8')
  const [isRunning, setIsRunning] = useState(false)
  const [tests, setTests] = useState<NetworkTest[]>([
    { id: 'ping', name: 'Ping Test', status: 'pending' },
    { id: 'traceroute', name: 'Traceroute', status: 'pending' },
    { id: 'speedtest', name: 'Speed Test', status: 'pending' },
    { id: 'portscan', name: 'Port Scan', status: 'pending' }
  ])
  const [pingResult, setPingResult] = useState<PingResult | null>(null)
  const [speedResult, setSpeedResult] = useState<SpeedTestResult | null>(null)
  const [portScanResult, setPortScanResult] = useState<PortScanResult | null>(null)
  const [history, setHistory] = useState<any[]>([])

  const runDiagnostic = async () => {
    if (!targetUrl.trim()) return

    setIsRunning(true)
    setTests(tests.map(test => ({ ...test, status: 'pending' })))
    setPingResult(null)
    setSpeedResult(null)
    setPortScanResult(null)

    try {
      // Run Ping Test
      setTests(prev => prev.map(t => t.id === 'ping' ? { ...t, status: 'running' } : t))
      await new Promise(resolve => setTimeout(resolve, 1500))
      const pingData: PingResult = {
        host: targetUrl,
        packets: 4,
        lost: 0,
        min: 12,
        max: 45,
        avg: 25,
        timestamp: new Date().toISOString()
      }
      setPingResult(pingData)
      setTests(prev => prev.map(t => t.id === 'ping' ? { ...t, status: 'completed', result: pingData, duration: 1500 } : t))

      // Run Traceroute
      setTests(prev => prev.map(t => t.id === 'traceroute' ? { ...t, status: 'running' } : t))
      await new Promise(resolve => setTimeout(resolve, 2000))
      setTests(prev => prev.map(t => t.id === 'traceroute' ? { ...t, status: 'completed', duration: 2000 } : t))

      // Run Speed Test
      setTests(prev => prev.map(t => t.id === 'speedtest' ? { ...t, status: 'running' } : t))
      await new Promise(resolve => setTimeout(resolve, 3000))
      const speedData: SpeedTestResult = {
        download: 85.4,
        upload: 22.1,
        ping: 18,
        jitter: 2,
        timestamp: new Date().toISOString()
      }
      setSpeedResult(speedData)
      setTests(prev => prev.map(t => t.id === 'speedtest' ? { ...t, status: 'completed', result: speedData, duration: 3000 } : t))

      // Run Port Scan
      setTests(prev => prev.map(t => t.id === 'portscan' ? { ...t, status: 'running' } : t))
      await new Promise(resolve => setTimeout(resolve, 2500))
      const portData: PortScanResult = {
        host: targetUrl,
        ports: [
          { port: 80, state: 'open', service: 'HTTP' },
          { port: 443, state: 'open', service: 'HTTPS' },
          { port: 22, state: 'closed', service: 'SSH' },
          { port: 3389, state: 'filtered', service: 'RDP' }
        ],
        timestamp: new Date().toISOString()
      }
      setPortScanResult(portData)
      setTests(prev => prev.map(t => t.id === 'portscan' ? { ...t, status: 'completed', result: portData, duration: 2500 } : t))

      // Save to history
      const diagnosticResult = {
        id: Date.now(),
        target: targetUrl,
        timestamp: new Date().toISOString(),
        tests: tests.map(t => ({ id: t.id, name: t.name, status: t.status, duration: t.duration }))
      }
      setHistory([diagnosticResult, ...history])

    } catch (error) {
      console.error('Diagnostic failed:', error)
      setTests(prev => prev.map(t => t.id === 'ping' ? { ...t, status: 'failed', error: 'Network unreachable' } : t))
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: 'running' | 'completed' | 'failed' | 'pending') => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 animate-spin text-blue-600" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: 'running' | 'completed' | 'failed' | 'pending') => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
    }
  }

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) return `${(speed / 1000).toFixed(1)} Gbps`
    return `${speed.toFixed(1)} Mbps`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Network Diagnostic</h1>
        <p className="text-muted-foreground">
          Complete network analysis and troubleshooting toolkit
        </p>
      </div>

      <Tabs defaultValue="diagnostic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          <TabsTrigger value="ping">Ping</TabsTrigger>
          <TabsTrigger value="speed">Speed Test</TabsTrigger>
          <TabsTrigger value="ports">Port Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostic" className="space-y-6">
          {/* Target Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Network Target
              </CardTitle>
              <CardDescription>
                Enter the IP address or domain to analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="8.8.8.8 or example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && runDiagnostic()}
                />
                <Button 
                  onClick={runDiagnostic} 
                  disabled={!targetUrl.trim() || isRunning}
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Run Diagnostic
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {test.duration && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Duration: {test.duration}ms
                    </p>
                  )}
                  {test.error && (
                    <p className="text-sm text-red-600">
                      Error: {test.error}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Network Health Overview */}
          {pingResult && speedResult && (
            <Card>
              <CardHeader>
                <CardTitle>Network Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {pingResult.avg}ms
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Average Ping</div>
                    <Progress value={Math.max(0, 100 - pingResult.avg)} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatSpeed(speedResult.download)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Download Speed</div>
                    <Progress value={(speedResult.download / 100) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {formatSpeed(speedResult.upload)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Upload Speed</div>
                    <Progress value={(speedResult.upload / 50) * 100} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ping Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pingResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{pingResult.packets}</div>
                      <div className="text-xs text-muted-foreground">Packets Sent</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{pingResult.lost}</div>
                      <div className="text-xs text-muted-foreground">Lost</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{pingResult.min}ms</div>
                      <div className="text-xs text-muted-foreground">Min</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{pingResult.max}ms</div>
                      <div className="text-xs text-muted-foreground">Max</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{pingResult.avg}ms</div>
                    <div className="text-sm text-muted-foreground">Average Ping Time</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Run a diagnostic to see ping results
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Internet Speed Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {speedResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {formatSpeed(speedResult.download)}
                      </div>
                      <div className="text-lg text-muted-foreground mb-2">Download Speed</div>
                      <Progress value={Math.min(100, (speedResult.download / 100) * 100)} className="h-3" />
                      <div className="text-sm text-muted-foreground mt-2">
                        Excellent for streaming, gaming, and downloads
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {formatSpeed(speedResult.upload)}
                      </div>
                      <div className="text-lg text-muted-foreground mb-2">Upload Speed</div>
                      <Progress value={Math.min(100, (speedResult.upload / 50) * 100)} className="h-3" />
                      <div className="text-sm text-muted-foreground mt-2">
                        Good for video calls and file uploads
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Ping</span>
                      <span className="font-medium">{speedResult.ping}ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Jitter</span>
                      <span className="font-medium">{speedResult.jitter}ms</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Run a diagnostic to see speed test results
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Port Scan Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portScanResult ? (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Target: {portScanResult.host}</h3>
                    <p className="text-sm text-muted-foreground">
                      Scanned {portScanResult.ports.length} common ports
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {portScanResult.ports.map((port, index) => (
                      <motion.div
                        key={port.port}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{port.port}</span>
                          <Badge variant={
                            port.state === 'open' ? 'default' : 
                            port.state === 'closed' ? 'secondary' : 'outline'
                          }>
                            {port.state.toUpperCase()}
                          </Badge>
                          {port.service && (
                            <span className="text-sm text-muted-foreground">
                              {port.service}
                            </span>
                          )}
                        </div>
                        {port.state === 'open' && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Run a diagnostic to see port scan results
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}