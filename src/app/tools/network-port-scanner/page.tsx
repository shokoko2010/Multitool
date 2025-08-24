'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Network, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface PortResult {
  port: number
  status: 'open' | 'closed' | 'filtered'
  service?: string
  responseTime?: number
}

interface ScanResult {
  host: string
  ports: PortResult[]
  startTime: Date
  endTime?: Date
  totalPorts: number
  openPorts: number
  closedPorts: number
  filteredPorts: number
}

export default function NetworkPortScanner() {
  const [host, setHost] = useState('')
  const [startPort, setStartPort] = useState('1')
  const [endPort, setEndPort] = useState('1024')
  const [customPorts, setCustomPorts] = useState('')
  const [scanType, setScanType] = useState<'range' | 'common' | 'custom'>('common')
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const commonPorts = [
    { port: 21, service: 'FTP' },
    { port: 22, service: 'SSH' },
    { port: 23, service: 'Telnet' },
    { port: 25, service: 'SMTP' },
    { port: 53, service: 'DNS' },
    { port: 80, service: 'HTTP' },
    { port: 110, service: 'POP3' },
    { port: 143, service: 'IMAP' },
    { port: 443, service: 'HTTPS' },
    { port: 993, service: 'IMAPS' },
    { port: 995, service: 'POP3S' },
    { port: 1433, service: 'MSSQL' },
    { port: 3306, service: 'MySQL' },
    { port: 3389, service: 'RDP' },
    { port: 5432, service: 'PostgreSQL' },
    { port: 5900, service: 'VNC' },
    { port: 6379, service: 'Redis' },
    { port: 8080, service: 'HTTP-Alt' },
    { port: 8443, service: 'HTTPS-Alt' },
    { port: 27017, service: 'MongoDB' }
  ]

  const getServiceName = (port: number): string => {
    const service = commonPorts.find(p => p.port === port)
    return service?.service || 'Unknown'
  }

  const parseCustomPorts = (): number[] => {
    if (!customPorts.trim()) return []
    
    return customPorts
      .split(',')
      .map(p => p.trim())
      .filter(p => p)
      .map(p => parseInt(p))
      .filter(p => !isNaN(p) && p > 0 && p <= 65535)
  }

  const getPortsToScan = (): number[] => {
    switch (scanType) {
      case 'range':
        const start = parseInt(startPort)
        const end = parseInt(endPort)
        if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
          return []
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      
      case 'common':
        return commonPorts.map(p => p.port)
      
      case 'custom':
        return parseCustomPorts()
      
      default:
        return []
    }
  }

  const scanPort = async (host: string, port: number): Promise<PortResult> => {
    try {
      const startTime = Date.now()
      
      // Create a new AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      try {
        const response = await fetch(`http://${host}:${port}`, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        const responseTime = Date.now() - startTime
        return {
          port,
          status: 'open',
          service: getServiceName(port),
          responseTime
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        // Try HTTPS if HTTP fails
        try {
          const httpsController = new AbortController()
          const httpsTimeoutId = setTimeout(() => httpsController.abort(), 3000)
          
          await fetch(`https://${host}:${port}`, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: httpsController.signal
          })
          clearTimeout(httpsTimeoutId)
          
          const responseTime = Date.now() - startTime
          return {
            port,
            status: 'open',
            service: getServiceName(port),
            responseTime
          }
        } catch (httpsError) {
          return {
            port,
            status: 'closed',
            service: getServiceName(port)
          }
        }
      }
    } catch (error) {
      return {
        port,
        status: 'filtered',
        service: getServiceName(port)
      }
    }
  }

  const startScan = async () => {
    if (!host.trim()) {
      setError('Please enter a host or IP address')
      return
    }

    const ports = getPortsToScan()
    if (ports.length === 0) {
      setError('Please specify valid ports to scan')
      return
    }

    setIsScanning(true)
    setError(null)
    setResults(null)

    try {
      const startTime = new Date()
      const portResults: PortResult[] = []
      
      // Scan ports in batches to avoid overwhelming the browser
      const batchSize = 10
      for (let i = 0; i < ports.length; i += batchSize) {
        const batch = ports.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(port => scanPort(host, port))
        )
        portResults.push(...batchResults)
        
        // Update progress
        setResults({
          host,
          ports: [...portResults],
          startTime,
          totalPorts: ports.length,
          openPorts: portResults.filter(p => p.status === 'open').length,
          closedPorts: portResults.filter(p => p.status === 'closed').length,
          filteredPorts: portResults.filter(p => p.status === 'filtered').length
        })
      }

      setResults({
        host,
        ports: portResults,
        startTime,
        endTime: new Date(),
        totalPorts: ports.length,
        openPorts: portResults.filter(p => p.status === 'open').length,
        closedPorts: portResults.filter(p => p.status === 'closed').length,
        filteredPorts: portResults.filter(p => p.status === 'filtered').length
      })
    } catch (error) {
      setError('Failed to scan ports. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      'Port,Status,Service,Response Time (ms)',
      ...results.ports.map(p => 
        `${p.port},${p.status},${p.service || 'N/A'},${p.responseTime || 'N/A'}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `port_scan_${results.host}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'filtered': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <AlertTriangle className="h-4 w-4" />
      case 'filtered': return <Shield className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6" />
            Network Port Scanner
          </CardTitle>
          <CardDescription>
            Scan network ports to identify open, closed, and filtered ports on a target host
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
              <Label htmlFor="host">Host or IP Address</Label>
              <Input
                id="host"
                placeholder="example.com or 192.168.1.1"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Scan Type</Label>
              <Tabs value={scanType} onValueChange={(value) => setScanType(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="common">Common Ports</TabsTrigger>
                  <TabsTrigger value="range">Port Range</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {scanType === 'range' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startPort">Start Port</Label>
                <Input
                  id="startPort"
                  type="number"
                  min="1"
                  max="65535"
                  value={startPort}
                  onChange={(e) => setStartPort(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endPort">End Port</Label>
                <Input
                  id="endPort"
                  type="number"
                  min="1"
                  max="65535"
                  value={endPort}
                  onChange={(e) => setEndPort(e.target.value)}
                />
              </div>
            </div>
          )}

          {scanType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customPorts">Custom Ports (comma-separated)</Label>
              <Textarea
                id="customPorts"
                placeholder="80, 443, 8080, 8443, 3306, 5432"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={startScan} 
              disabled={isScanning || !host.trim()}
              className="flex-1"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Start Scan'
              )}
            </Button>
            
            {results && (
              <Button variant="outline" onClick={exportResults}>
                Export Results
              </Button>
            )}
          </div>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.totalPorts}</div>
                    <div className="text-sm text-muted-foreground">Total Ports</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{results.openPorts}</div>
                    <div className="text-sm text-muted-foreground">Open</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">{results.closedPorts}</div>
                    <div className="text-sm text-muted-foreground">Closed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{results.filteredPorts}</div>
                    <div className="text-sm text-muted-foreground">Filtered</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Scan Results</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                    <div className="col-span-1">Port</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-4">Service</div>
                    <div className="col-span-3">Response Time</div>
                    <div className="col-span-2">Security</div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {results.ports
                      .sort((a, b) => a.port - b.port)
                      .map((result, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t text-sm">
                          <div className="col-span-1 font-medium">{result.port}</div>
                          <div className="col-span-2">
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(result.status)}
                            >
                              {getStatusIcon(result.status)}
                              <span className="ml-1">{result.status}</span>
                            </Badge>
                          </div>
                          <div className="col-span-4">{result.service}</div>
                          <div className="col-span-3">
                            {result.responseTime ? `${result.responseTime}ms` : 'N/A'}
                          </div>
                          <div className="col-span-2">
                            {result.status === 'open' && (
                              <Badge variant="destructive" className="text-xs">
                                Vulnerable
                              </Badge>
                            )}
                            {result.status === 'closed' && (
                              <Badge variant="secondary" className="text-xs">
                                Secure
                              </Badge>
                            )}
                            {result.status === 'filtered' && (
                              <Badge variant="outline" className="text-xs">
                                Protected
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {results.endTime && (
                <div className="text-sm text-muted-foreground">
                  Scan completed in {Math.round((results.endTime.getTime() - results.startTime.getTime()) / 1000)} seconds
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}