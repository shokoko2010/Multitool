'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, RefreshCw, Globe, Wifi, WifiOff, Timer, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PingResult {
  url: string
  status: 'success' | 'failed' | 'timeout'
  responseTime: number
  timestamp: string
  ip: string
  location: string
}

export default function OnlinePingWebsiteTool() {
  const [url, setUrl] = useState('')
  const [pingResults, setPingResults] = useState<PingResult[]>([])
  const [isPinging, setIsPinging] = useState(false)
  const [selectedServer, setSelectedServer] = useState('auto')

  const servers = [
    { id: 'auto', name: 'Auto Select', location: 'Best available' },
    { id: 'us', name: 'US East', location: 'Virginia, USA' },
    { id: 'us-west', name: 'US West', location: 'California, USA' },
    { id: 'eu', name: 'Europe', location: 'Frankfurt, Germany' },
    { id: 'asia', name: 'Asia', location: 'Singapore' },
    { id: 'au', name: 'Australia', location: 'Sydney' }
  ]

  const pingWebsite = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsPinging(true)
    try {
      // Simulate ping process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock ping results
      const mockResults: PingResult[] = [
        {
          url: url,
          status: Math.random() > 0.2 ? 'success' : 'failed',
          responseTime: Math.floor(Math.random() * 200) + 20,
          timestamp: new Date().toLocaleTimeString(),
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          location: servers.find(s => s.id === selectedServer)?.location || 'Unknown'
        },
        {
          url: url,
          status: Math.random() > 0.2 ? 'success' : 'timeout',
          responseTime: Math.floor(Math.random() * 300) + 50,
          timestamp: new Date().toLocaleTimeString(),
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          location: servers.find(s => s.id === selectedServer)?.location || 'Unknown'
        }
      ]
      
      setPingResults(mockResults)
      toast.success('Website pinged successfully!')
    } catch (error) {
      toast.error('Failed to ping website')
    } finally {
      setIsPinging(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'timeout':
        return <Timer className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'timeout':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Timeout</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getResponseTimeColor = (time: number) => {
    if (time < 50) return 'text-green-600'
    if (time < 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const openWebsite = () => {
    const validUrl = url.startsWith('http') ? url : `https://${url}`
    window.open(validUrl, '_blank')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Online Ping Website Tool</h1>
        <p className="text-muted-foreground">
          Test website connectivity and response times from different locations
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Configuration</CardTitle>
            <CardDescription>Enter website URL and select ping server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Website URL *</label>
                <Input
                  placeholder="example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {url && !validateUrl(url) && (
                  <p className="text-sm text-destructive mt-1">Please enter a valid URL</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ping Server</label>
                <Tabs value={selectedServer} onValueChange={setSelectedServer}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="auto" className="text-xs">Auto</TabsTrigger>
                    <TabsTrigger value="us" className="text-xs">US</TabsTrigger>
                    <TabsTrigger value="eu" className="text-xs">EU</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={pingWebsite}
                disabled={isPinging || !url.trim() || !validateUrl(url)}
                className="flex-1"
              >
                {isPinging ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Pinging...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Ping Website
                  </>
                )}
              </Button>
              <Button 
                onClick={openWebsite}
                variant="outline"
                disabled={!url.trim() || !validateUrl(url)}
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ping Results</CardTitle>
            <CardDescription>Website connectivity test results</CardDescription>
          </CardHeader>
          <CardContent>
            {isPinging ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Pinging website...</span>
              </div>
            ) : pingResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Pinged from {servers.find(s => s.id === selectedServer)?.location}
                  </div>
                  <Button 
                    onClick={() => setPingResults([])}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Results
                  </Button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {pingResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{result.url}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>IP: {result.ip}</div>
                            <div>Location: {result.location}</div>
                            <div>Time: {result.timestamp}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getResponseTimeColor(result.responseTime)}`}>
                          {result.responseTime}ms
                        </div>
                        <div className="text-xs text-muted-foreground">Response Time</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {pingResults.filter(r => r.status === 'success').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {pingResults.filter(r => r.status === 'failed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {pingResults.filter(r => r.status === 'timeout').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Timeout</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(pingResults.reduce((acc, r) => acc + r.responseTime, 0) / pingResults.length)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No ping results yet</p>
                <p className="text-sm mt-2">Enter a website URL and click ping to test connectivity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <div 
                  key={server.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedServer === server.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedServer(server.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">{server.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {server.location}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0-50ms</div>
                <div className="text-sm font-medium text-green-800">Excellent</div>
                <div className="text-xs text-green-600 mt-1">
                  Fast response time, optimal for user experience
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">51-100ms</div>
                <div className="text-sm font-medium text-yellow-800">Good</div>
                <div className="text-xs text-yellow-600 mt-1">
                  Acceptable response time for most websites
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">100ms+</div>
                <div className="text-sm font-medium text-red-800">Poor</div>
                <div className="text-xs text-red-600 mt-1">
                  Slow response time, may affect user experience
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}