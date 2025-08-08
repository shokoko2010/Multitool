'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, ExternalLink, Globe, Server, MapPin, Wifi, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface IPInfo {
  ip: string
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  organization: string
  asn: string
  ispType: string
  isVPN: boolean
  isProxy: boolean
  isTor: boolean
  threatLevel: 'low' | 'medium' | 'high'
}

interface DomainResult {
  domain: string
  ipAddresses: string[]
  dnsRecords: {
    type: string
    value: string
    ttl: number
  }[]
  ipInfo: IPInfo
  lastUpdated: string
}

export default function DomainToIP() {
  const [domain, setDomain] = useState('')
  const [domainResult, setDomainResult] = useState<DomainResult | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const convertDomainToIP = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain name')
      return
    }

    setIsConverting(true)
    try {
      // Simulate domain to IP conversion
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock domain data
      const mockData: DomainResult = {
        domain: domain,
        ipAddresses: [
          '192.168.1.1',
          '10.0.0.1',
          '172.16.0.1'
        ],
        dnsRecords: [
          { type: 'A', value: '192.168.1.1', ttl: 3600 },
          { type: 'AAAA', value: '2001:db8::1', ttl: 3600 },
          { type: 'MX', value: 'mail.example.com', ttl: 3600 },
          { type: 'NS', value: 'ns1.example.com', ttl: 3600 },
          { type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 }
        ],
        ipInfo: {
          ip: '192.168.1.1',
          country: 'United States',
          region: 'California',
          city: 'San Francisco',
          latitude: 37.7749,
          longitude: -122.4194,
          timezone: 'America/Los_Angeles',
          isp: 'Internet Service Provider Inc.',
          organization: 'Organization Name',
          asn: 'AS12345',
          ispType: 'ISP',
          isVPN: false,
          isProxy: false,
          isTor: false,
          threatLevel: 'low'
        },
        lastUpdated: new Date().toISOString()
      }
      
      setDomainResult(mockData)
      toast.success('Domain converted to IP addresses successfully!')
    } catch (error) {
      toast.error('Failed to convert domain to IP')
    } finally {
      setIsConverting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Low Risk</Badge>
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSecurityBadge = (isSecure: boolean, type: string) => {
    if (isSecure) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Secure</Badge>
    }
    return <Badge variant="destructive">{type}</Badge>
  }

  const openInMaps = () => {
    if (domainResult) {
      const url = `https://www.google.com/maps?q=${domainResult.ipInfo.latitude},${domainResult.ipInfo.longitude}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Domain to IP Converter</h1>
        <p className="text-muted-foreground">
          Convert domain names to IP addresses and get detailed DNS and location information
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Domain Conversion</CardTitle>
            <CardDescription>Enter domain name to convert to IP addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={convertDomainToIP}
                disabled={isConverting || !domain.trim()}
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Convert to IP
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {domainResult && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Domain Information</CardTitle>
                <CardDescription>Basic domain and IP address information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Domain</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xl font-bold">{domainResult.domain}</span>
                      <Button 
                        onClick={() => copyToClipboard(domainResult.domain)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Addresses</label>
                    <div className="grid gap-2 mt-2">
                      {domainResult.ipAddresses.map((ip, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="font-mono">{ip}</span>
                          <Button 
                            onClick={() => copyToClipboard(ip)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DNS Records</CardTitle>
                <CardDescription>DNS records for the domain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-sm font-medium">Type</th>
                        <th className="text-left p-2 text-sm font-medium">Value</th>
                        <th className="text-left p-2 text-sm font-medium">TTL</th>
                        <th className="text-left p-2 text-sm font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domainResult.dnsRecords.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Badge variant="outline">{record.type}</Badge>
                          </td>
                          <td className="p-2 font-mono text-sm">
                            {record.value}
                          </td>
                          <td className="p-2 text-sm">
                            {record.ttl}s
                          </td>
                          <td className="p-2">
                            <Button 
                              onClick={() => copyToClipboard(record.value)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IP Location Information</CardTitle>
                <CardTitle>Detailed information about the primary IP address</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-bold">{domainResult.ipInfo.ip}</span>
                          <Button 
                            onClick={() => copyToClipboard(domainResult.ipInfo.ip)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{domainResult.ipInfo.country}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Region</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-4 w-4 text-green-500" />
                          <span>{domainResult.ipInfo.region}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Server className="h-4 w-4 text-purple-500" />
                          <span>{domainResult.ipInfo.city}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                        <div className="font-mono text-sm mt-1">{domainResult.ipInfo.latitude}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                        <div className="font-mono text-sm mt-1">{domainResult.ipInfo.longitude}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={openInMaps} variant="outline" className="flex-1">
                        <MapPin className="h-4 w-4 mr-2" />
                        View on Map
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(`${domainResult.ipInfo.latitude},${domainResult.ipInfo.longitude}`)}
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">ISP</label>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-medium">{domainResult.ipInfo.isp}</span>
                          <Button 
                            onClick={() => copyToClipboard(domainResult.ipInfo.isp)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Organization</label>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-medium">{domainResult.ipInfo.organization}</span>
                          <Button 
                            onClick={() => copyToClipboard(domainResult.ipInfo.organization)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">VPN Status</label>
                        <div className="mt-2">
                          {getSecurityBadge(domainResult.ipInfo.isVPN, domainResult.ipInfo.isVPN ? 'VPN Detected' : 'No VPN')}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Proxy Status</label>
                        <div className="mt-2">
                          {getSecurityBadge(domainResult.ipInfo.isProxy, domainResult.ipInfo.isProxy ? 'Proxy Detected' : 'No Proxy')}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tor Status</label>
                        <div className="mt-2">
                          {getSecurityBadge(domainResult.ipInfo.isTor, domainResult.ipInfo.isTor ? 'Tor Detected' : 'No Tor')}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Threat Level</label>
                      <div className="mt-2">
                        {getThreatBadge(domainResult.ipInfo.threatLevel)}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Security Summary</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        The domain resolves to {domainResult.ipAddresses.length} IP address(es). 
                        The primary IP appears to be hosted by {domainResult.ipInfo.isp} in {domainResult.ipInfo.city}, {domainResult.ipInfo.region}.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {!domainResult && !isConverting && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Enter a domain name and click convert to see IP addresses and DNS information
                </p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}