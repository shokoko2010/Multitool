'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Globe, Server, ExternalLink, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ReverseIPResult {
  ip: string
  domains: string[]
  totalDomains: number
  hostingProvider: string
  location: string
  riskLevel: 'low' | 'medium' | 'high'
  categories: string[]
}

interface DomainDetail {
  domain: string
  registrar: string
  creationDate: string
  expirationDate: string
  nameServers: string[]
  status: string[]
}

export default function ReverseIPLookupTool() {
  const [ipAddress, setIpAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReverseIPResult | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<DomainDetail | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('lookup')
  const { toast } = useToast()

  const performReverseIPLookup = async () => {
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
    setSelectedDomain(null)

    try {
      // Simulate reverse IP lookup - in a real app, this would call a reverse IP API
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Mock reverse IP data for demonstration
      const mockResult: ReverseIPResult = {
        ip: ipAddress,
        domains: [
          'example.com',
          'blog.example.com', 
          'shop.example.com',
          'api.example.com',
          'cdn.example.com',
          'mail.example.com',
          'www.example.org',
          'secure.example.net'
        ],
        totalDomains: 8,
        hostingProvider: 'Cloudflare, Inc.',
        location: 'San Francisco, California, US',
        riskLevel: 'low',
        categories: ['Web Hosting', 'CDN', 'Email Services']
      }

      setResult(mockResult)
    } catch (err) {
      setError('Failed to perform reverse IP lookup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDomainDetails = async (domain: string) => {
    setLoading(true)
    try {
      // Simulate domain details lookup
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockDetail: DomainDetail = {
        domain,
        registrar: 'GoDaddy.com, LLC',
        creationDate: '2020-01-15',
        expirationDate: '2025-01-15',
        nameServers: [
          'ns1.cloudflare.com',
          'ns2.cloudflare.com',
          'ns3.cloudflare.com',
          'ns4.cloudflare.com'
        ],
        status: ['clientTransferProhibited', 'clientUpdateProhibited']
      }

      setSelectedDomain(mockDetail)
    } catch (err) {
      setError('Failed to fetch domain details.')
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

  const getCurrentIP = async () => {
    try {
      setLoading(true)
      // In a real app, this would call an API to get the current IP
      const mockIP = '8.8.8.8'
      setIpAddress(mockIP)
      await performReverseIPLookup()
    } catch (err) {
      setError('Failed to get current IP address')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Reverse IP Lookup Tool</span>
          </CardTitle>
          <CardDescription>
            Discover all domain names hosted on the same IP address. Useful for identifying shared hosting, 
            finding related websites, and security research.
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
                onKeyPress={(e) => e.key === 'Enter' && performReverseIPLookup()}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={performReverseIPLookup} 
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lookup">Results</TabsTrigger>
            <TabsTrigger value="details">Domain Details</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lookup" className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Summary for {result.ip}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Domains</Label>
                    <p className="text-2xl font-bold">{result.totalDomains}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Hosting Provider</Label>
                    <p className="font-medium">{result.hostingProvider}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Risk Level</Label>
                    <Badge className={getRiskColor(result.riskLevel)}>
                      {result.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Domain List */}
            <Card>
              <CardHeader>
                <CardTitle>Domains Found ({result.domains.length})</CardTitle>
                <CardDescription>
                  Click on any domain to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.domains.map((domain, index) => (
                    <div 
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => getDomainDetails(domain)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium truncate">{domain}</h4>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(domain)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Domain</Badge>
                        <span className="text-xs text-muted-foreground">
                          Click for details
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {selectedDomain ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Domain Details: {selectedDomain.domain}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Registrar</Label>
                        <p className="font-medium">{selectedDomain.registrar}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                        <p>{selectedDomain.creationDate}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Expiration Date</Label>
                        <p>{selectedDomain.expirationDate}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name Servers</Label>
                        <div className="space-y-1 mt-2">
                          {selectedDomain.nameServers.map((ns, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {ns}
                              </code>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(ns)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedDomain.status.map((status, index) => (
                            <Badge key={index} variant="outline">
                              {status}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => window.open(`https://whois.icann.org/en/lookup?name=${selectedDomain.domain}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Full Whois
                    </Button>
                    <Button variant="outline" onClick={() => copyToClipboard(selectedDomain.domain)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Domain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Select a domain from the results to view detailed information</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hosting Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Provider</Label>
                    <p className="font-medium">{result.hostingProvider}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p>{result.location}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categories</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Risk Assessment</Label>
                    <div className="mt-2">
                      <Badge className={getRiskColor(result.riskLevel)}>
                        {result.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Domain Count</Label>
                    <p>{result.totalDomains} domains found</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Hosting Type</Label>
                    <p>
                      {result.totalDomains > 5 ? 'Shared Hosting' : 
                       result.totalDomains > 1 ? 'Semi-Dedicated' : 'Dedicated'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What This Means</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Shared Hosting Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Multiple domains on the same IP typically indicates shared hosting. 
                    This is common for small to medium websites.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Security Implications</h4>
                  <p className="text-sm text-muted-foreground">
                    Shared hosting can pose security risks if one site is compromised. 
                    Consider the risk level when assessing website security.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">SEO Considerations</h4>
                  <p className="text-sm text-muted-foreground">
                    Search engines may associate sites on the same IP. This can be 
                    both positive and negative depending on the neighborhood quality.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Reverse IP Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Reverse IP lookup reveals all domain names hosted on a specific IP address. 
            This technique is valuable for competitive analysis, security research, and understanding 
            the hosting infrastructure of websites.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Common Use Cases:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Competitive Analysis:</strong> Find related websites and competitors</li>
              <li>• <strong>Security Research:</strong> Identify potential attack surfaces</li>
              <li>• <strong>SEO Analysis:</strong> Understand website neighborhoods</li>
              <li>• <strong>Hosting Research:</strong> Determine hosting providers and infrastructure</li>
              <li>• <strong>Domain Portfolio Analysis:</strong> Discover all sites owned by same entity</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Limitations:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Some hosts use virtual hosting and may not reveal all domains</li>
              <li>• Results may be incomplete due to privacy protections</li>
              <li>• Cloud hosting providers may show thousands of domains</li>
              <li>• Accuracy depends on the data source and DNS configuration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}