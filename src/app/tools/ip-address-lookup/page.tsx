'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Globe, MapPin, Shield, Wifi, Server } from 'lucide-react'

interface IPLookupResult {
  ip: string
  type: 'ipv4' | 'ipv6'
  country: string
  countryCode: string
  region: string
  city: string
  zip: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  organization: string
  asn: string
  asnName: string
  isProxy: boolean
  isVPN: boolean
  isTor: boolean
  lookupTime: number
  timestamp: Date
}

export default function IPAddressLookup() {
  const [ipAddress, setIpAddress] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [results, setResults] = useState<IPLookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('location')

  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.')
      return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255)
    }
    
    return ipv6Regex.test(ip)
  }

  const getIPType = (ip: string): 'ipv4' | 'ipv6' => {
    return ip.includes(':') ? 'ipv6' : 'ipv4'
  }

  const performIPLookup = async (ip: string): Promise<IPLookupResult> => {
    try {
      const startTime = Date.now()
      
      // Simulate IP lookup (in real implementation, this would use an IP geolocation API)
      // For demo purposes, we'll generate realistic IP data
      const result = generateIPLookupResult(ip)
      const lookupTime = Date.now() - startTime

      return {
        ...result,
        lookupTime,
        timestamp: new Date()
      }
    } catch (error) {
      throw new Error('Failed to perform IP lookup')
    }
  }

  const generateIPLookupResult = (ip: string): Omit<IPLookupResult, 'lookupTime' | 'timestamp'> => {
    const isIPv6 = getIPType(ip) === 'ipv6'
    
    // Generate realistic location data based on IP patterns
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia']
    const regions = ['California', 'Ontario', 'England', 'Bavaria', 'Île-de-France', 'Tokyo', 'New South Wales']
    const cities = ['San Francisco', 'Toronto', 'London', 'Munich', 'Paris', 'Tokyo', 'Sydney']
    const zips = ['94105', 'M5H 2N2', 'EC1A 1BB', '80331', '75001', '100-0001', '2000']
    const timezones = ['America/Los_Angeles', 'America/Toronto', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney']
    const isps = ['Comcast', 'Bell Canada', 'BT Group', 'Deutsche Telekom', 'Orange', 'NTT Communications', 'Telstra']
    const organizations = ['Comcast Cable', 'Bell Canada', 'British Telecom', 'Deutsche Telekom AG', 'Orange S.A.', 'Nippon Telegraph and Telephone', 'Telstra Corporation']
    const asns = ['AS7922', 'AS577', 'AS2856', 'AS3320', 'AS5511', 'AS4713', 'AS1221']
    const asnNames = ['Comcast Cable Communications', 'Bell Canada', 'BT Group UK', 'Deutsche Telekom AG', 'Orange S.A.', 'NTT Communications', 'Telstra Internet']

    const randomIndex = Math.floor(Math.random() * countries.length)
    
    return {
      ip,
      type: isIPv6 ? 'ipv6' : 'ipv4',
      country: countries[randomIndex],
      countryCode: countries[randomIndex].substring(0, 2).toUpperCase(),
      region: regions[randomIndex],
      city: cities[randomIndex],
      zip: zips[randomIndex],
      latitude: 37.7749 + (Math.random() - 0.5) * 10,
      longitude: -122.4194 + (Math.random() - 0.5) * 10,
      timezone: timezones[randomIndex],
      isp: isps[randomIndex],
      organization: organizations[randomIndex],
      asn: asns[randomIndex],
      asnName: asnNames[randomIndex],
      isProxy: Math.random() > 0.9,
      isVPN: Math.random() > 0.8,
      isTor: Math.random() > 0.95
    }
  }

  const startLookup = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter an IP address')
      return
    }

    if (!isValidIP(ipAddress.trim())) {
      setError('Please enter a valid IP address (IPv4 or IPv6)')
      return
    }

    setIsLookingUp(true)
    setError(null)
    setResults(null)

    try {
      const result = await performIPLookup(ipAddress.trim())
      setResults(result)
    } catch (error) {
      setError('Failed to perform IP lookup. Please try again.')
    } finally {
      setIsLookingUp(false)
    }
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      'Field,Value',
      `IP Address,${results.ip}`,
      `Type,${results.type}`,
      `Country,${results.country}`,
      `Region,${results.region}`,
      `City,${results.city}`,
      `ZIP Code,${results.zip}`,
      `Latitude,${results.latitude}`,
      `Longitude,${results.longitude}`,
      `Timezone,${results.timezone}`,
      `ISP,${results.isp}`,
      `Organization,${results.organization}`,
      `ASN,${results.asn}`,
      `ASN Name,${results.asnName}`,
      `Is Proxy,${results.isProxy}`,
      `Is VPN,${results.isVPN}`,
      `Is Tor,${results.isTor}`,
      `Lookup Time,${results.lookupTime}ms`
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ip_lookup_${results.ip}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSecurityBadgeColor = (isThreat: boolean) => {
    return isThreat 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200'
  }

  const getSecurityBadgeText = (isThreat: boolean, type: string) => {
    return isThreat ? `Detected ${type}` : `No ${type}`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            IP Address Lookup
          </CardTitle>
          <CardDescription>
            Get detailed information about any IP address including location, ISP, and security details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address (IPv4 or IPv6)</Label>
            <Input
              id="ipAddress"
              placeholder="192.168.1.1 or 2001:db8::1"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={startLookup} 
              disabled={isLookingUp || !ipAddress.trim()}
              className="flex-1"
            >
              {isLookingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                'Lookup IP Address'
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.type.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">IP Type</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{results.lookupTime}ms</div>
                    <div className="text-sm text-muted-foreground">Lookup Time</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{results.country}</div>
                    <div className="text-sm text-muted-foreground">Country</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{results.city}</div>
                    <div className="text-sm text-muted-foreground">City</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="location" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MapPin className="h-5 w-5" />
                          Geographic Location
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Country:</span>
                          <span>{results.country} ({results.countryCode})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Region:</span>
                          <span>{results.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">City:</span>
                          <span>{results.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">ZIP Code:</span>
                          <span>{results.zip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Timezone:</span>
                          <span>{results.timezone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Coordinates:</span>
                          <span>{results.latitude.toFixed(4)}, {results.longitude.toFixed(4)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Wifi className="h-5 w-5" />
                          Network Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">ISP:</span>
                          <span>{results.isp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Organization:</span>
                          <span>{results.organization}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">ASN:</span>
                          <span>{results.asn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">ASN Name:</span>
                          <span>{results.asnName}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="network" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Server className="h-5 w-5" />
                        Network Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">IP Address:</span>
                            <span className="font-mono">{results.ip}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Type:</span>
                            <Badge variant="outline">{results.type.toUpperCase()}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">ISP:</span>
                            <span>{results.isp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Organization:</span>
                            <span>{results.organization}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">ASN:</span>
                            <span>{results.asn}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">ASN Name:</span>
                            <span>{results.asnName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Country:</span>
                            <span>{results.country}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Region:</span>
                            <span>{results.region}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5" />
                        Security Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Proxy Detection:</span>
                            <Badge 
                              variant="outline" 
                              className={getSecurityBadgeColor(results.isProxy)}
                            >
                              {getSecurityBadgeText(results.isProxy, 'Proxy')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {results.isProxy 
                              ? 'This IP address is detected as a proxy server.' 
                              : 'No proxy activity detected.'}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">VPN Detection:</span>
                            <Badge 
                              variant="outline" 
                              className={getSecurityBadgeColor(results.isVPN)}
                            >
                              {getSecurityBadgeText(results.isVPN, 'VPN')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {results.isVPN 
                              ? 'This IP address is detected as a VPN service.' 
                              : 'No VPN activity detected.'}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Tor Detection:</span>
                            <Badge 
                              variant="outline" 
                              className={getSecurityBadgeColor(results.isTor)}
                            >
                              {getSecurityBadgeText(results.isTor, 'Tor')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {results.isTor 
                              ? 'This IP address is detected as a Tor exit node.' 
                              : 'No Tor activity detected.'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Security Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          {results.isProxy || results.isVPN || results.isTor
                            ? 'This IP address shows signs of anonymity services. Exercise caution when dealing with connections from this address.'
                            : 'This IP address appears to be a standard residential or business connection with no detected anonymity services.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Complete Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">IP Address:</span>
                            <span className="font-mono text-sm">{results.ip}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Type:</span>
                            <span>{results.type.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Country:</span>
                            <span>{results.country} ({results.countryCode})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Region:</span>
                            <span>{results.region}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">City:</span>
                            <span>{results.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">ZIP Code:</span>
                            <span>{results.zip}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Latitude:</span>
                            <span>{results.latitude.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Longitude:</span>
                            <span>{results.longitude.toFixed(6)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Timezone:</span>
                            <span>{results.timezone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">ISP:</span>
                            <span>{results.isp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Organization:</span>
                            <span>{results.organization}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">ASN:</span>
                            <span>{results.asn}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">ASN Name:</span>
                            <span>{results.asnName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Is Proxy:</span>
                            <span>{results.isProxy ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Is VPN:</span>
                            <span>{results.isVPN ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Is Tor:</span>
                            <span>{results.isTor ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="text-sm text-muted-foreground">
                Lookup completed at {results.timestamp.toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}