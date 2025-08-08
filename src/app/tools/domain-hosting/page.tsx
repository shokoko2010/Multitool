'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Globe, Server, MapPin, Wifi, Shield } from 'lucide-react'

export default function DomainHostingChecker() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const checkDomainHosting = async () => {
    if (!domain) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate API call to check domain hosting information
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data for demonstration
      const mockResult = {
        domain: domain,
        registrar: 'NameSilo, LLC',
        registrarUrl: 'https://www.namesilo.com',
        hostingProvider: 'Cloudflare, Inc.',
        hostingProviderUrl: 'https://www.cloudflare.com',
        nameServers: [
          'ns1.cloudflare.com',
          'ns2.cloudflare.com',
          'ns3.cloudflare.com',
          'ns4.cloudflare.com'
        ],
        ipAddresses: [
          '172.67.70.47',
          '104.21.2.194'
        ],
        location: 'San Francisco, California, USA',
        asNumber: '13335',
        asName: 'CLOUDFLARENET',
        country: 'United States',
        region: 'California',
        city: 'San Francisco',
        organization: 'Cloudflare, Inc.',
        isp: 'Cloudflare, Inc.',
        timezone: 'America/Los_Angeles',
        dnssec: true,
        https: true,
        tlsVersion: 'TLS 1.3',
        cipherSuite: 'TLS_AES_256_GCM_SHA384'
      }

      setResult(mockResult)
    } catch (err) {
      setError('Failed to check domain hosting information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Hosting Checker
          </CardTitle>
          <CardDescription>
            Get detailed information about where a domain is hosted, including registrar, 
            name servers, IP addresses, and hosting provider details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter domain name (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
            />
            <Button onClick={checkDomainHosting} disabled={loading}>
              {loading ? 'Checking...' : 'Check Hosting'}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Domain Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domain Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">Domain</p>
                    <p className="font-medium">{result.domain}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">Registrar</p>
                    <p className="font-medium">{result.registrar}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(result.registrarUrl)}
                    className="mr-2"
                  >
                    Copy Registrar URL
                  </Button>
                </div>
              </div>

              {/* Hosting Provider */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Hosting Provider
                </h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{result.hostingProvider}</p>
                      <p className="text-sm text-blue-700">{result.hostingProviderUrl}</p>
                    </div>
                    <Badge variant="secondary">CDN</Badge>
                  </div>
                </div>
              </div>

              {/* Name Servers */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Name Servers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.nameServers.map((ns: string, index: number) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-md flex items-center justify-between">
                      <code className="text-sm">{ns}</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(ns)}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* IP Addresses */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  IP Addresses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.ipAddresses.map((ip: string, index: number) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-md flex items-center justify-between">
                      <code className="text-sm">{ip}</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(ip)}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-medium">{result.country}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">Region</p>
                    <p className="font-medium">{result.region}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-medium">{result.city}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">Timezone</p>
                    <p className="font-medium">{result.timezone}</p>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Technical Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-medium">{result.organization}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">ISP</p>
                    <p className="font-medium">{result.isp}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">AS Number</p>
                    <p className="font-medium">{result.asNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">AS Name</p>
                    <p className="font-medium">{result.asName}</p>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Security Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">DNSSEC</p>
                    <Badge variant={result.dnssec ? "default" : "destructive"}>
                      {result.dnssec ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">HTTPS</p>
                    <Badge variant={result.https ? "default" : "destructive"}>
                      {result.https ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">TLS Version</p>
                    <p className="font-medium">{result.tlsVersion}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}