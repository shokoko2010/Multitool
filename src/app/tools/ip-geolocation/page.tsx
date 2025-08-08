'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, RefreshCw, MapPin, Globe, Wifi, Server, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GeolocationData {
  ip: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  offset: string
  isp: string
  org: string
  as: string
  query: string
  status: string
  message?: string
}

export default function IPLocation() {
  const [currentIP, setCurrentIP] = useState('')
  const [targetIP, setTargetIP] = useState('')
  const [geolocationData, setGeolocationData] = useState<GeolocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentIP = async () => {
    setLoading(true)
    try {
      // Using ipify API to get current IP
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setCurrentIP(data.ip)
      setTargetIP(data.ip)
      
      // Get geolocation for current IP
      await getGeolocation(data.ip)
    } catch (error) {
      setError('Unable to get your current IP address')
      toast({
        title: "IP detection failed",
        description: "Unable to detect your current IP address",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getGeolocation = async (ip: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Using ip-api.com for geolocation (free tier)
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,offset,isp,org,as,query`)
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data = await response.json()
      
      if (data.status === 'fail') {
        throw new Error(data.message || 'Invalid IP address')
      }
      
      setGeolocationData(data)
      
      toast({
        title: "Location found",
        description: `Geolocation data retrieved for ${ip}`
      })
    } catch (error) {
      setError('Unable to get geolocation data for this IP address')
      toast({
        title: "Geolocation failed",
        description: "Unable to retrieve location information",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const lookupIP = () => {
    if (!targetIP.trim()) {
      toast({
        title: "Missing IP",
        description: "Please enter an IP address to lookup",
        variant: "destructive"
      })
      return
    }
    
    getGeolocation(targetIP)
  }

  const copyIP = () => {
    navigator.clipboard.writeText(currentIP)
    toast({
      title: "Copied to clipboard",
      description: "Your IP address has been copied to clipboard"
    })
  }

  const copyLocation = () => {
    if (!geolocationData) return

    const locationText = `IP Geolocation Report
IP Address: ${geolocationData.ip}
Country: ${geolocationData.country} (${geolocationData.countryCode})
Region: ${geolocationData.regionName}, ${geolocationData.region}
City: ${geolocationData.city}
ZIP: ${geolocationData.zip}
Coordinates: ${geolocationData.lat}, ${geolocationData.lon}
Timezone: ${geolocationData.timezone} (UTC${geolocationData.offset})
ISP: ${geolocationData.isp}
Organization: ${geolocationData.org}
AS: ${geolocationData.as}`

    navigator.clipboard.writeText(locationText)
    toast({
      title: "Copied to clipboard",
      description: "Geolocation information has been copied to clipboard"
    })
  }

  const downloadReport = () => {
    if (!geolocationData) return

    const content = `IP Geolocation Report
Generated: ${new Date().toLocaleString()}

IP Address: ${geolocationData.ip}
Country: ${geolocationData.country} (${geolocationData.countryCode})
Region: ${geolocationData.regionName}, ${geolocationData.region}
City: ${geolocationData.city}
ZIP Code: ${geolocationData.zip}
Latitude: ${geolocationData.lat}
Longitude: ${geolocationData.lon}
Timezone: ${geolocationData.timezone} (UTC${geolocationData.offset})
ISP: ${geolocationData.isp}
Organization: ${geolocationData.org}
AS Number: ${geolocationData.as}
Network Query: ${geolocationData.query}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ip-geolocation-${geolocationData.ip}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "IP geolocation report download has started"
    })
  }

  const validateIP = (ip: string): boolean => {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  useEffect(() => {
    getCurrentIP()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">IP Geolocation</h1>
        <p className="text-muted-foreground">
          Get detailed geolocation information for any IP address including location, ISP, and network details
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Network Tool</Badge>
          <Badge variant="outline">Geolocation</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>IP Lookup</CardTitle>
            <CardDescription>
              Enter an IP address to get detailed geolocation information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-ip">Your Current IP</Label>
              <div className="flex gap-2">
                <Input
                  id="current-ip"
                  value={currentIP}
                  readOnly
                  className="font-mono"
                  placeholder="Loading..."
                />
                <Button onClick={copyIP} variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-ip">Lookup IP Address</Label>
              <div className="flex gap-2">
                <Input
                  id="target-ip"
                  value={targetIP}
                  onChange={(e) => setTargetIP(e.target.value)}
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  className="font-mono"
                />
                <Button 
                  onClick={lookupIP} 
                  disabled={loading || !validateIP(targetIP)}
                  variant="outline"
                  size="sm"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                </Button>
              </div>
              {!validateIP(targetIP) && targetIP && (
                <p className="text-sm text-red-600">Please enter a valid IP address</p>
              )}
            </div>

            <Button onClick={getCurrentIP} disabled={loading} className="w-full">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {loading ? "Getting Current IP..." : "Use My IP"}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geolocation Results</CardTitle>
            <CardDescription>
              Detailed location and network information for the IP address
            </CardDescription>
          </CardHeader>
          <CardContent>
            {geolocationData ? (
              <div className="space-y-4">
                <Tabs defaultValue="location" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                  </TabsList>

                  <TabsContent value="location" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Location</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Country:</strong> {geolocationData.country}</div>
                          <div><strong>Region:</strong> {geolocationData.regionName}, {geolocationData.region}</div>
                          <div><strong>City:</strong> {geolocationData.city}</div>
                          <div><strong>ZIP:</strong> {geolocationData.zip}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">Coordinates</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Latitude:</strong> {geolocationData.lat}</div>
                          <div><strong>Longitude:</strong> {geolocationData.lon}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-purple-800">Timezone</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Timezone:</strong> {geolocationData.timezone}</div>
                          <div><strong>UTC Offset:</strong> {geolocationData.offset}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="network" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Wifi className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold text-orange-800">ISP Information</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>ISP:</strong> {geolocationData.isp}</div>
                          <div><strong>Organization:</strong> {geolocationData.org}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-800">Network Details</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>AS:</strong> {geolocationData.as}</div>
                          <div><strong>IP:</strong> {geolocationData.ip}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-800">Technical Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>IP Address:</span>
                          <span className="font-mono">{geolocationData.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Country Code:</span>
                          <span>{geolocationData.countryCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Region Code:</span>
                          <span>{geolocationData.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ZIP Code:</span>
                          <span>{geolocationData.zip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Latitude:</span>
                          <span>{geolocationData.lat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Longitude:</span>
                          <span>{geolocationData.lon}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timezone:</span>
                          <span>{geolocationData.timezone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>UTC Offset:</span>
                          <span>{geolocationData.offset}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button onClick={copyLocation} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Info
                  </Button>
                  <Button onClick={downloadReport} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No location data</h3>
                <p className="text-muted-foreground">
                  Enter an IP address and click lookup to see geolocation information
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About IP Geolocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">What is IP Geolocation?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                IP geolocation is the mapping of an IP address to the geographic location of the internet 
                server used to determine that address. It provides approximate location data based on 
                IP address ranges assigned to ISPs and organizations.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Country and regional information</li>
                <li>• City and postal code data</li>
                <li>• ISP and organization details</li>
                <li>• Timezone and offset information</li>
                <li>• Approximate coordinates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Accuracy & Limitations</h4>
              <p className="text-sm text-muted-foreground mb-3">
                IP geolocation provides approximate location data and has inherent limitations. 
                Accuracy varies by IP address type and location.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• City accuracy: 50-80% for most IPs</li>
                <li>• Country accuracy: 95-99%</li>
                <li>• Mobile IPs may show location of ISP</li>
                <li>• VPN/proxy IPs may show different location</li>
                <li>• Static IPs often show accurate location</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add Label component
const Label = ({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium ${className || ''}`}>
    {children}
  </label>
)