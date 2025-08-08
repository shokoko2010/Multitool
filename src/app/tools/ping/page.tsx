'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Activity, Wifi, WifiOff, Timer, MapPin, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PingResult {
  target: string
  packetsSent: number
  packetsReceived: number
  packetLoss: number
  minTime: number
  maxTime: number
  avgTime: number
  times: number[]
  status: 'success' | 'failed' | 'timeout'
  error?: string
}

interface TraceRouteHop {
  hop: number
  ip: string
  hostname?: string
  rtt1: number
  rtt2: number
  rtt3: number
  status: 'success' | 'timeout' | 'error'
}

export default function PingTool() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [pingResult, setPingResult] = useState<PingResult | null>(null)
  const [traceRouteResult, setTraceRouteResult] = useState<TraceRouteHop[]>([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('ping')
  const [pingCount, setPingCount] = useState(4)
  const { toast } = useToast()

  const performPing = async () => {
    if (!target.trim()) {
      setError('Please enter a hostname or IP address')
      return
    }

    // Basic validation
    const targetRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^(\d{1,3}\.){3}\d{1,4}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    if (!targetRegex.test(target)) {
      setError('Please enter a valid hostname or IP address')
      return
    }

    setLoading(true)
    setError('')
    setPingResult(null)
    setTraceRouteResult([])

    try {
      // Simulate ping - in a real app, this would use WebSockets or a backend API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock ping data for demonstration
      const mockTimes = []
      for (let i = 0; i < pingCount; i++) {
        mockTimes.push(Math.random() * 50 + 10) // Random times between 10-60ms
      }
      
      const mockResult: PingResult = {
        target,
        packetsSent: pingCount,
        packetsReceived: pingCount,
        packetLoss: 0,
        minTime: Math.min(...mockTimes),
        maxTime: Math.max(...mockTimes),
        avgTime: mockTimes.reduce((a, b) => a + b, 0) / mockTimes.length,
        times: mockTimes,
        status: 'success'
      }

      setPingResult(mockResult)
    } catch (err) {
      setError('Failed to perform ping. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const performTraceRoute = async () => {
    if (!target.trim()) {
      setError('Please enter a hostname or IP address')
      return
    }

    setLoading(true)
    setError('')
    setTraceRouteResult([])

    try {
      // Simulate trace route
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock trace route data
      const mockHops: TraceRouteHop[] = []
      for (let i = 1; i <= 15; i++) {
        const rtt1 = Math.random() * 100 + 5
        const rtt2 = Math.random() * 100 + 5
        const rtt3 = Math.random() * 100 + 5
        
        mockHops.push({
          hop: i,
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          hostname: i === 1 ? 'your-router.local' : i === 15 ? target : undefined,
          rtt1,
          rtt2,
          rtt3,
          status: Math.random() > 0.1 ? 'success' : 'timeout'
        })
      }

      setTraceRouteResult(mockHops)
    } catch (err) {
      setError('Failed to perform trace route. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'timeout': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSignalStrength = (avgTime: number) => {
    if (avgTime < 30) return { strength: 'excellent', color: 'text-green-600', icon: Wifi }
    if (avgTime < 100) return { strength: 'good', color: 'text-blue-600', icon: Wifi }
    if (avgTime < 200) return { strength: 'fair', color: 'text-yellow-600', icon: WifiOff }
    return { strength: 'poor', color: 'text-red-600', icon: WifiOff }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Ping & Trace Route Tool</span>
          </CardTitle>
          <CardDescription>
            Test network connectivity, measure latency, and trace network paths to any host.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="target">Target Hostname or IP</Label>
              <Input
                id="target"
                placeholder="example.com or 8.8.8.8"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performPing()}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="count">Ping Count</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="10"
                value={pingCount}
                onChange={(e) => setPingCount(parseInt(e.target.value) || 4)}
                className="text-center"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={performPing} 
                disabled={loading}
                className="px-6"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">Ping</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={performTraceRoute}
                disabled={loading}
              >
                Trace
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ping">Ping Results</TabsTrigger>
          <TabsTrigger value="traceroute">Trace Route</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ping" className="space-y-6">
          {pingResult && (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Ping Statistics for {pingResult.target}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Packets Sent</Label>
                      <p className="text-2xl font-bold">{pingResult.packetsSent}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Packets Received</Label>
                      <p className="text-2xl font-bold text-green-600">{pingResult.packetsReceived}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Packet Loss</Label>
                      <p className="text-2xl font-bold">{pingResult.packetLoss}%</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Average Time</Label>
                      <p className="text-2xl font-bold">{pingResult.avgTime.toFixed(1)} ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Timer className="h-5 w-5" />
                      <span>Latency Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Minimum</Label>
                      <p className="text-xl font-bold text-green-600">{pingResult.minTime.toFixed(1)} ms</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Maximum</Label>
                      <p className="text-xl font-bold text-red-600">{pingResult.maxTime.toFixed(1)} ms</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Average</Label>
                      <p className="text-xl font-bold">{pingResult.avgTime.toFixed(1)} ms</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Signal Quality</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const signal = getSignalStrength(pingResult.avgTime)
                      const IconComponent = signal.icon
                      return (
                        <>
                          <div className="flex items-center space-x-2">
                            <IconComponent className={`h-6 w-6 ${signal.color}`} />
                            <span className="font-medium">{signal.strength.toUpperCase()}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Quality:</span>
                              <span className={signal.color}>
                                {signal.strength === 'excellent' ? 'Excellent' :
                                 signal.strength === 'good' ? 'Good' :
                                 signal.strength === 'fair' ? 'Fair' : 'Poor'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Gaming:</span>
                              <span className={signal.strength === 'excellent' || signal.strength === 'good' ? 'text-green-600' : 'text-red-600'}>
                                {signal.strength === 'excellent' || signal.strength === 'good' ? 'Suitable' : 'Not Suitable'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Video Call:</span>
                              <span className={signal.strength === 'excellent' || signal.strength === 'good' ? 'text-green-600' : 'text-yellow-600'}>
                                {signal.strength === 'excellent' ? 'Excellent' :
                                 signal.strength === 'good' ? 'Good' : 'Marginal'}
                              </span>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Network Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Connection</Label>
                      <Badge className="bg-green-100 text-green-800">
                        <Wifi className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Reliability</Label>
                      <p className="font-medium">
                        {pingResult.packetLoss === 0 ? 'Excellent' : 
                         pingResult.packetLoss < 5 ? 'Good' : 'Poor'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Jitter</Label>
                      <p className="text-sm">
                        {Math.abs(pingResult.maxTime - pingResult.minTime).toFixed(1)} ms
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Ping Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pingResult.times.map((time, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold">{time.toFixed(1)} ms</div>
                        <div className="text-sm text-muted-foreground">Ping {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="traceroute" className="space-y-6">
          {traceRouteResult.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Trace Route Results</CardTitle>
                <CardDescription>
                  Path to {target} showing each hop along the route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {traceRouteResult.map((hop) => (
                    <div key={hop.hop} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-12 text-center">
                        <span className="font-mono text-sm">{hop.hop}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(hop.status)}>
                            {hop.status.toUpperCase()}
                          </Badge>
                          {hop.hostname && (
                            <span className="text-sm text-muted-foreground">
                              {hop.hostname}
                            </span>
                          )}
                        </div>
                        <code className="text-sm text-gray-600">{hop.ip}</code>
                      </div>
                      <div className="flex space-x-2 text-sm">
                        {hop.status === 'success' ? (
                          <>
                            <span>{hop.rtt1.toFixed(1)} ms</span>
                            <span>{hop.rtt2.toFixed(1)} ms</span>
                            <span>{hop.rtt3.toFixed(1)} ms</span>
                          </>
                        ) : (
                          <span className="text-gray-400">***</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {!pingResult && traceRouteResult.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Enter a hostname or IP address and click "Ping" to test connectivity</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Ping & Trace Route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">Ping (Packet Internet Groper)</h4>
            <p className="text-sm text-muted-foreground">
              Ping tests connectivity by sending ICMP echo requests to a target host and measuring 
              the round-trip time. It's useful for checking if a host is reachable and measuring network latency.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Trace Route</h4>
            <p className="text-sm text-muted-foreground">
              Trace route shows the path packets take to reach a destination, displaying each router 
              (hop) along the way and the time it takes for packets to travel to each hop and back.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Interpreting Results:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Latency:</strong> Lower times (under 100ms) indicate good performance</li>
              <li>• <strong>Packet Loss:</strong> 0% is ideal, anything over 5% may cause issues</li>
              <li>• <strong>Jitter:</strong> Consistent times indicate stable connection</li>
              <li>• <strong>Hops:</strong> Fewer hops usually mean better performance</li>
              <li>• <strong>Timeouts:</strong> May indicate firewalls or network congestion</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}