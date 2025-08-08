'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, MapPin, Globe, Server, Clock, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface IPLookupResult {
  ip: string
  country: string
  countryCode: string
  region: string
  city: string
  zip: string
  latitude: number
  longitude: number
  isp: string
  org: string
  asn: string
  timezone: string
  isProxy: boolean
  isTor: boolean
  threatLevel: 'low' | 'medium' | 'high'
}

export default function IPLookupTool() {
  const [ipAddress, setIpAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IPLookupResult | null>(null)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const performIPLookup = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter an IP address')
      return
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    if (!ipRegex.test(ipAddress)) {
      setError('Please enter a valid IP address (IPv4 or IPv6)')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Simulate IP lookup - in a real app, this would call an IP geolocation API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock IP lookup data for demonstration
      const mockResult: IPLookupResult = {
        ip: ipAddress,
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        zip: '94102',
        latitude: 37.7749,
        longitude: -122.4194,
        isp: 'Cloudflare, Inc.',
        org: 'Cloudflare, Inc.',
        asn: 'AS13335',
        timezone: 'America/Los_Angeles',
        isProxy: false,
        isTor: false,
        threatLevel: 'low'
      }

      setResult(mockResult)
    } catch (err) {
      setError('Failed to perform IP lookup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The information has been copied to your clipboard.",
    })
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCurrentIP = async () => {
    try {
      setLoading(true)
      // In a real app, this would call an API to get the current IP
      const mockIP = '8.8.8.8'
      setIpAddress(mockIP)
      await performIPLookup()
    } catch (err) {
      setError('Failed to get current IP address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>IP Lookup Tool</span>
          </CardTitle>
          <CardDescription>
            Get detailed information about any IP address including geolocation, ISP, and threat intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="8.8.8.8 or 2001:4860:4860::8888"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performIPLookup()}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={performIPLookup} 
                disabled={loading}
                className="px-6"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">Lookup</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={getCurrentIP}
                disabled={loading}
              >
                My IP
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

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">IP Address</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                    {result.ip}
                  </code>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(result.ip)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                  <p className="font-medium">{result.country}</p>
                  <Badge variant="outline">{result.countryCode}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                  <p>{result.region}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">City</Label>
                <p className="flex items-center space-x-2">
                  <span>{result.city}</span>
                  <span className="text-sm text-muted-foreground">ZIP: {result.zip}</span>
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Coordinates</Label>
                <p className="font-mono text-sm">
                  {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ISP Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>ISP & Network</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">ISP</Label>
                <p>{result.isp}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                <p>{result.org}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">ASN</Label>
                <p className="font-mono">{result.asn}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Timezone</Label>
                <p className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{result.timezone}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Security Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Threat Level</Label>
                <Badge className={getThreatColor(result.threatLevel)}>
                  {result.threatLevel.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${result.isProxy ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span>Proxy: {result.isProxy ? 'Detected' : 'Not Detected'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${result.isTor ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span>TOR: {result.isTor ? 'Detected' : 'Not Detected'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Location Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Map would be displayed here</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.latitude.toFixed(2)}, {result.longitude.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About IP Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            IP lookup provides detailed information about any IP address, including geographical location, 
            ISP information, and security threat intelligence. This tool is essential for network analysis, 
            security auditing, and understanding your website traffic.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">What information can you get?</h4>
            <ul className="space-y-1 text-sm">
              <li>• Geolocation: Country, region, city, and coordinates</li>
              <li>• ISP Information: Internet service provider and organization</li>
              <li>• Network Details: ASN, timezone, and technical information</li>
              <li>• Security Analysis: Threat level, proxy detection, and TOR detection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}