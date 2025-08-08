'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, ExternalLink, MapPin, Wifi, Globe, Server, Clock, Shield } from 'lucide-react'
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
  zip: string
  ispType: string
  isVPN: boolean
  isProxy: boolean
  isTor: boolean
  threatLevel: 'low' | 'medium' | 'high'
  lastUpdated: string
}

export default function MyIPAddress() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('basic')

  useEffect(() => {
    fetchIPInfo()
  }, [])

  const fetchIPInfo = async () => {
    setIsLoading(true)
    try {
      // Simulate IP info fetching
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock IP data
      const mockData: IPInfo = {
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
        zip: '94102',
        ispType: 'ISP',
        isVPN: false,
        isProxy: false,
        isTor: false,
        threatLevel: 'low',
        lastUpdated: new Date().toISOString()
      }
      
      setIpInfo(mockData)
    } catch (error) {
      toast.error('Failed to fetch IP information')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const openInMaps = () => {
    if (ipInfo) {
      const url = `https://www.google.com/maps?q=${ipInfo.latitude},${ipInfo.longitude}`
      window.open(url, '_blank')
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Detecting your IP address...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My IP Address</h1>
        <p className="text-muted-foreground">
          Get detailed information about your current IP address and location
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your IP Information</CardTitle>
            <CardDescription>Basic IP address details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-mono font-bold">{ipInfo?.ip}</span>
                    <Button 
                      onClick={() => copyToClipboard(ipInfo?.ip || '')}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={fetchIPInfo} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{ipInfo?.country}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Region</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span>{ipInfo?.region}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Server className="h-4 w-4 text-purple-500" />
                    <span>{ipInfo?.city}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>{ipInfo?.timezone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ISP Information</CardTitle>
            <CardDescription>Internet Service Provider details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ISP</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-medium">{ipInfo?.isp}</span>
                  <Button 
                    onClick={() => copyToClipboard(ipInfo?.isp || '')}
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
                  <span className="font-medium">{ipInfo?.organization}</span>
                  <Button 
                    onClick={() => copyToClipboard(ipInfo?.organization || '')}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ASN</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-sm">{ipInfo?.asn}</span>
                    <Button 
                      onClick={() => copyToClipboard(ipInfo?.asn || '')}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ISP Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">{ipInfo?.ispType}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ZIP Code</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-sm">{ipInfo?.zip}</span>
                    <Button 
                      onClick={() => copyToClipboard(ipInfo?.zip || '')}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Security</CardTitle>
            <CardDescription>Geographic and security information</CardDescription>
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
                    <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                    <div className="font-mono text-sm mt-1">{ipInfo?.latitude}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                    <div className="font-mono text-sm mt-1">{ipInfo?.longitude}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={openInMaps} variant="outline" className="flex-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                  <Button 
                    onClick={() => copyToClipboard(`${ipInfo?.latitude},${ipInfo?.longitude}`)}
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Threat Level</label>
                    <div className="mt-2">
                      {getThreatBadge(ipInfo?.threatLevel || 'low')}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <div className="text-sm mt-1">
                      {new Date(ipInfo?.lastUpdated || '').toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">VPN Status</label>
                    <div className="mt-2">
                      {getSecurityBadge(ipInfo?.isVPN || false, ipInfo?.isVPN ? 'VPN Detected' : 'No VPN')}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Proxy Status</label>
                    <div className="mt-2">
                      {getSecurityBadge(ipInfo?.isProxy || false, ipInfo?.isProxy ? 'Proxy Detected' : 'No Proxy')}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tor Status</label>
                    <div className="mt-2">
                      {getSecurityBadge(ipInfo?.isTor || false, ipInfo?.isTor ? 'Tor Detected' : 'No Tor')}
                    </div>
                  </div>
                </div>
                
                {ipInfo?.isVPN || ipInfo?.isProxy || ipInfo?.isTor ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Security Notice</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Your connection appears to be routing through {ipInfo?.isVPN ? 'a VPN' : ipInfo?.isProxy ? 'a proxy' : 'Tor'}. 
                      This may affect the accuracy of your location information.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Connection Secure</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your connection appears to be direct and secure. No VPN, proxy, or Tor detected.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About IP Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">🌐 What is an IP Address?</h4>
                <p className="text-sm text-muted-foreground">
                  An IP address is a unique numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">🔒 Privacy Note</h4>
                <p className="text-sm text-muted-foreground">
                  Your IP address can reveal your approximate location and ISP. Use VPNs or proxies to enhance your privacy if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}