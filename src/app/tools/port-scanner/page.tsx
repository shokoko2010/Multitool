'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PortResult {
  port: number
  status: 'open' | 'closed' | 'filtered' | 'testing'
  service?: string
  banner?: string
}

export default function PortScannerTool() {
  const [target, setTarget] = useState('')
  const [ports, setPorts] = useState('80,443,22,21,25,53,110,143,993,995,3389,3306,5432,6379,27017')
  const [results, setResults] = useState<PortResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanSpeed, setScanSpeed] = useState(100)
  const [commonPortsOnly, setCommonPortsOnly] = useState(true)
  const [includeServiceInfo, setIncludeServiceInfo] = useState(true)
  const { toast } = useToast()

  const commonPorts = [
    21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 993, 995, 1723, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017
  ]

  const parsePorts = (portString: string): number[] => {
    if (commonPortsOnly) {
      return commonPorts
    }
    
    return portString
      .split(',')
      .map(p => parseInt(p.trim()))
      .filter(p => !isNaN(p) && p > 0 && p <= 65535)
  }

  const scanPort = async (port: number, targetHost: string): Promise<PortResult> => {
    try {
      // Create a simple TCP connection check
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), scanSpeed)
      
      const response = await fetch(`http://${targetHost}:${port}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        timeout: scanSpeed
      })
      
      clearTimeout(timeoutId)
      
      return {
        port,
        status: 'open',
        service: getServiceName(port),
        banner: includeServiceInfo ? getBanner(port) : undefined
      }
    } catch (error) {
      // Port is likely closed or filtered
      return {
        port,
        status: 'closed',
        service: getServiceName(port),
        banner: includeServiceInfo ? getBanner(port) : undefined
      }
    }
  }

  const getServiceName = (port: number): string => {
    const services: Record<number, string> = {
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S',
      3306: 'MySQL',
      5432: 'PostgreSQL',
      6379: 'Redis',
      27017: 'MongoDB',
      8080: 'HTTP-Alt',
      8443: 'HTTPS-Alt',
      3389: 'RDP'
    }
    return services[port] || 'Unknown'
  }

  const getBanner = (port: number): string => {
    const banners: Record<number, string> = {
      80: 'HTTP/1.1',
      443: 'HTTP/1.1',
      22: 'SSH',
      21: 'FTP',
      25: 'SMTP',
      53: 'DNS'
    }
    return banners[port] || 'No banner available'
  }

  const startScan = async () => {
    if (!target.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a target hostname or IP address",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setResults([])
    setScanProgress(0)

    try {
      const portList = parsePorts(ports)
      const totalPorts = portList.length
      const newResults: PortResult[] = []

      for (let i = 0; i < portList.length; i++) {
        const port = portList[i]
        const result = await scanPort(port, target)
        newResults.push(result)
        
        setScanProgress(((i + 1) / totalPorts) * 100)
        
        // Update results in real-time
        setResults([...newResults])
      }

      setResults(newResults)
      toast({
        title: "Scan Complete",
        description: `Scanned ${totalPorts} ports on ${target}`,
      })
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Failed to complete port scan",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
      setScanProgress(0)
    }
  }

  const stopScan = () => {
    setIsScanning(false)
    setScanProgress(0)
  }

  const copyResults = () => {
    const resultText = results.map(r => 
      `Port ${r.port}: ${r.status.toUpperCase()} (${r.service})`
    ).join('\n')
    
    navigator.clipboard.writeText(resultText)
    toast({
      title: "Copied!",
      description: "Scan results copied to clipboard",
    })
  }

  const getPortIcon = (status: PortResult['status']) => {
    switch (status) {
      case 'open': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'filtered': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />
    }
  }

  const openPorts = results.filter(r => r.status === 'open').length
  const closedPorts = results.filter(r => r.status === 'closed').length
  const filteredPorts = results.filter(r => r.status === 'filtered').length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Port Scanner</h1>
        <p className="text-muted-foreground">
          Scan for open ports on a target host
        </p>
      </div>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Port Scanner</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanner" className="space-y-6">
          {/* Scanner Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Scanner Configuration
              </CardTitle>
              <CardDescription>
                Configure your port scan parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Hostname/IP</Label>
                  <Input
                    placeholder="example.com or 192.168.1.1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Ports to Scan</Label>
                  <Input
                    placeholder="80,443,22,21..."
                    value={ports}
                    onChange={(e) => setPorts(e.target.value)}
                    disabled={commonPortsOnly}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="common-ports"
                    checked={commonPortsOnly}
                    onCheckedChange={(checked) => setCommonPortsOnly(checked as boolean)}
                  />
                  <label htmlFor="common-ports" className="text-sm">
                    Scan only common ports (recommended)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="service-info"
                    checked={includeServiceInfo}
                    onCheckedChange={(checked) => setIncludeServiceInfo(checked as boolean)}
                  />
                  <label htmlFor="service-info" className="text-sm">
                    Include service information
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Scan Speed: {scanSpeed}ms per port</Label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={scanSpeed}
                  onChange={(e) => setScanSpeed(parseInt(e.target.value))}
                  className="w-full"
                  disabled={isScanning}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fast (50ms)</span>
                  <span>Slow (1000ms)</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={startScan} 
                  disabled={isScanning || !target.trim()}
                  className="flex-1"
                >
                  {isScanning ? 'Scanning...' : 'Start Scan'}
                </Button>
                {isScanning && (
                  <Button onClick={stopScan} variant="outline">
                    Stop
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scan Progress */}
          {isScanning && (
            <Card>
              <CardHeader>
                <CardTitle>Scan Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={scanProgress} className="w-full" />
                <div className="text-sm text-muted-foreground">
                  {scanProgress.toFixed(1)}% complete
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results.length > 0 && !isScanning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Scan Results</span>
                  <Button onClick={copyResults} variant="outline" size="sm">
                    Copy Results
                  </Button>
                </CardTitle>
                <CardDescription>
                  Found {openPorts} open, {closedPorts} closed, and {filteredPorts} filtered ports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPortIcon(result)}
                        <div>
                          <div className="font-semibold">Port {result.port}</div>
                          <div className="text-sm text-muted-foreground">{result.service}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'open' ? 'default' : 'secondary'}>
                          {result.status.toUpperCase()}
                        </Badge>
                        {result.banner && (
                          <span className="text-xs text-muted-foreground">
                            {result.banner}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {results.length > 0 && !isScanning && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{openPorts}</div>
                  <div className="text-sm text-muted-foreground">Open Ports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                  <div className="text-2xl font-bold text-red-600">{closedPorts}</div>
                  <div className="text-sm text-muted-foreground">Closed Ports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{filteredPorts}</div>
                  <div className="text-sm text-muted-foreground">Filtered Ports</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Port Scanning</CardTitle>
                <CardDescription>
                  What is port scanning and how it works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold">What is Port Scanning?</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Port scanning is the process of identifying open ports and services on a target host. It's commonly used for network security assessment and inventory management.
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold">Port Status Types</div>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <div><strong>Open:</strong> Port is accessible and accepting connections</div>
                    <div><strong>Closed:</strong> Port is accessible but not accepting connections</div>
                    <div><strong>Filtered:</strong> Port is not accessible due to firewall rules</div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold">Legal Considerations</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Only scan systems you own or have explicit permission to scan. Unauthorized port scanning may be illegal in many jurisdictions.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Ports</CardTitle>
                <CardDescription>
                  Frequently used ports and their services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[
                    { port: 20, service: 'FTP Data', protocol: 'TCP' },
                    { port: 21, service: 'FTP Control', protocol: 'TCP' },
                    { port: 22, service: 'SSH', protocol: 'TCP' },
                    { port: 23, service: 'Telnet', protocol: 'TCP' },
                    { port: 25, service: 'SMTP', protocol: 'TCP' },
                    { port: 53, service: 'DNS', protocol: 'TCP/UDP' },
                    { port: 80, service: 'HTTP', protocol: 'TCP' },
                    { port: 110, service: 'POP3', protocol: 'TCP' },
                    { port: 143, service: 'IMAP', protocol: 'TCP' },
                    { port: 443, service: 'HTTPS', protocol: 'TCP' },
                    { port: 993, service: 'IMAPS', protocol: 'TCP' },
                    { port: 995, service: 'POP3S', protocol: 'TCP' },
                    { port: 3306, service: 'MySQL', protocol: 'TCP' },
                    { port: 3389, service: 'RDP', protocol: 'TCP' },
                    { port: 5432, service: 'PostgreSQL', protocol: 'TCP' },
                    { port: 6379, service: 'Redis', protocol: 'TCP' },
                    { port: 8080, service: 'HTTP Proxy', protocol: 'TCP' },
                    { port: 8443, service: 'HTTPS Alt', protocol: 'TCP' }
                  ].map((portInfo, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="font-mono">:{portInfo.port}</span>
                      <span>{portInfo.service}</span>
                      <span className="text-xs text-muted-foreground">{portInfo.protocol}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
              <CardDescription>
                Important security considerations when using port scanning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Get Permission', description: 'Only scan systems you own or have explicit authorization to scan' },
                  { title: 'Use Proper Speed', description: 'Avoid aggressive scanning that could be detected as an attack' },
                  { title: 'Respect Firewalls', description: 'Stop scanning if you encounter filtered ports repeatedly' },
                  { title: 'Document Findings', description: 'Keep detailed records of your scanning activities and results' },
                  { title: 'Secure Your Network', description: 'Use the results to improve your own network security' },
                  { title: 'Stay Legal', description: 'Comply with all applicable laws and regulations' }
                ].map((practice, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="font-semibold">{practice.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{practice.description}</div>
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