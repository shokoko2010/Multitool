'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Globe, Calendar, User, Building, MapPin, Copy, ExternalLink, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WhoisRecord {
  domain: string
  registrar: string
  registrarUrl: string
  creationDate: string
  expirationDate: string
  updatedDate: string
  nameServers: string[]
  status: string[]
  registrant: {
    name: string
    organization: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
    email: string
  }
  admin: {
    name: string
    organization: string
    phone: string
    email: string
  }
  tech: {
    name: string
    organization: string
    phone: string
    email: string
  }
  billing: {
    name: string
    organization: string
    phone: string
    email: string
  }
  dnssec: string
  privacy: boolean
  domainAge: number
  daysToExpiration: number
}

export default function WhoisLookupTool() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [whoisResult, setWhoisResult] = useState<WhoisRecord | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  const performWhoisLookup = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!domainRegex.test(domain)) {
      setError('Please enter a valid domain name')
      return
    }

    setLoading(true)
    setError('')
    setWhoisResult(null)

    try {
      // Simulate Whois lookup - in a real app, this would call a Whois API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock Whois data for demonstration
      const mockResult: WhoisRecord = {
        domain,
        registrar: 'GoDaddy.com, LLC',
        registrarUrl: 'https://www.godaddy.com',
        creationDate: '2020-01-15T10:30:00Z',
        expirationDate: '2025-01-15T10:30:00Z',
        updatedDate: '2024-01-10T14:22:00Z',
        nameServers: [
          'ns1.cloudflare.com',
          'ns2.cloudflare.com',
          'ns3.cloudflare.com',
          'ns4.cloudflare.com'
        ],
        status: ['clientTransferProhibited', 'clientUpdateProhibited'],
        registrant: {
          name: 'John Doe',
          organization: 'Example Inc.',
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94102',
          country: 'US',
          phone: '+1.555.123.4567',
          email: 'john.doe@example.com'
        },
        admin: {
          name: 'Jane Smith',
          organization: 'Example Inc.',
          phone: '+1.555.123.4568',
          email: 'jane.smith@example.com'
        },
        tech: {
          name: 'Tech Support',
          organization: 'Cloudflare Inc.',
          phone: '+1.555.123.4569',
          email: 'support@cloudflare.com'
        },
        billing: {
          name: 'Billing Department',
          organization: 'Example Inc.',
          phone: '+1.555.123.4570',
          email: 'billing@example.com'
        },
        dnssec: 'unsigned',
        privacy: true,
        domainAge: 4,
        daysToExpiration: 380
      }

      setWhoisResult(mockResult)
    } catch (err) {
      setError('Failed to perform Whois lookup. Please try again.')
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

  const getDomainStatus = () => {
    if (!whoisResult) return null
    
    if (whoisResult.daysToExpiration < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', text: 'Expired' }
    } else if (whoisResult.daysToExpiration < 30) {
      return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800', text: 'Ex Soon' }
    } else {
      return { status: 'active', color: 'bg-green-100 text-green-800', text: 'Active' }
    }
  }

  const getPrivacyStatus = () => {
    return whoisResult?.privacy ? {
      status: 'protected',
      color: 'bg-green-100 text-green-800',
      text: 'Privacy Protected'
    } : {
      status: 'public',
      color: 'bg-gray-100 text-gray-800',
      text: 'Public Information'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Whois Lookup Tool</span>
          </CardTitle>
          <CardDescription>
            Get comprehensive domain registration information including registrant details, 
            registration dates, name servers, and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performWhoisLookup()}
              />
            </div>
            <Button 
              onClick={performWhoisLookup} 
              disabled={loading}
              className="px-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Lookup</span>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {whoisResult && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrant">Registrant</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{whoisResult.domainAge}</div>
                  <div className="text-sm text-muted-foreground">Years Old</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{whoisResult.daysToExpiration}</div>
                  <div className="text-sm text-muted-foreground">Days to Expire</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{whoisResult.nameServers.length}</div>
                  <div className="text-sm text-muted-foreground">Name Servers</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{whoisResult.status.length}</div>
                  <div className="text-sm text-muted-foreground">Status Flags</div>
                </CardContent>
              </Card>
            </div>

            {/* Domain Information */}
            <Card>
              <CardHeader>
                <CardTitle>Domain Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Domain</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono text-lg">{whoisResult.domain}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(whoisResult.domain)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Registrar</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span>{whoisResult.registrar}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          asChild
                        >
                          <a href={whoisResult.registrarUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Registration Status</Label>
                      <Badge className={getDomainStatus()?.color}>
                        {getDomainStatus()?.text}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(whoisResult.creationDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Expires</Label>
                      <p className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(whoisResult.expirationDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p>{new Date(whoisResult.updatedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name Servers</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {whoisResult.nameServers.map((ns, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <code className="font-mono text-sm">{ns}</code>
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
              </CardContent>
            </Card>

            {/* Status and Privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {whoisResult.status.map((status, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <Badge className={getPrivacyStatus()?.color}>
                        {getPrivacyStatus()?.text}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {whoisResult.privacy ? 
                          'Personal information is protected by privacy service' : 
                          'Personal information is publicly available'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="registrant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Registrant Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p className="font-medium">{whoisResult.registrant.name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                      <p>{whoisResult.registrant.organization}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="font-mono">{whoisResult.registrant.phone}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="font-mono">{whoisResult.registrant.email}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>{whoisResult.registrant.street}</p>
                    <p>{whoisResult.registrant.city}, {whoisResult.registrant.state} {whoisResult.registrant.postalCode}</p>
                    <p>{whoisResult.registrant.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Administrative Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="font-medium">{whoisResult.admin.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                    <p>{whoisResult.admin.organization}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="font-mono text-sm">{whoisResult.admin.phone}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="font-mono text-sm">{whoisResult.admin.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Billing Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="font-medium">{whoisResult.billing.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                    <p>{whoisResult.billing.organization}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="font-mono text-sm">{whoisResult.billing.phone}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="font-mono text-sm">{whoisResult.billing.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Technical Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="font-medium">{whoisResult.tech.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                  <p>{whoisResult.tech.organization}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="font-mono text-sm">{whoisResult.tech.phone}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-mono text-sm">{whoisResult.tech.email}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">DNSSEC</Label>
                  <Badge variant="outline">{whoisResult.dnssec.toUpperCase()}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raw" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Raw Whois Data</CardTitle>
                <CardDescription>
                  Complete unformatted Whois record data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 font-mono">
                  {`Domain Name: ${whoisResult.domain}
Registrar: ${whoisResult.registrar}
Registrar URL: ${whoisResult.registrarUrl}
Updated Date: ${whoisResult.updatedDate}
Creation Date: ${whoisResult.creationDate}
Registry Expiry Date: ${whoisResult.expirationDate}
Registrar: ${whoisResult.registrar}
Registrar IANA ID: 146
Registrar Abuse Contact Email: abuse@godaddy.com
Registrar Abuse Contact Phone: +1.4806242505
Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited
Domain Status: clientUpdateProhibited https://icann.org/epp#clientUpdateProhibited
Name Server: NS1.CLOUDFLARE.COM
Name Server: NS2.CLOUDFLARE.COM
Name Server: NS3.CLOUDFLARE.COM
Name Server: NS4.CLOUDFLARE.COM
DNSSEC: unsigned
>>> Last update of whois database: 2024-01-15T00:00:00Z <<<

For more information on Whois status codes, please visit https://icann.org/epp

NOTICE: The expiration date displayed in this record is the date the 
registrar's sponsorship of the domain name registration in the registry is 
currently set to expire. This date does not necessarily reflect the expiration 
date of the domain name registrant's agreement with the sponsoring registrar. 
Users may consult the sponsoring registrar's Whois database to view the 
registrar's reported date of expiration for this registration.

Registrar Information:
  Name: GoDaddy.com, LLC
  URL: https://www.godaddy.com
  Abuse Contact: abuse@godaddy.com
  Abuse Contact Phone: +1.4806242505`}
                </pre>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(document.querySelector('pre')?.textContent || '')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Data
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Download as File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Whois Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Whois is a widely used protocol for querying databases that store the registered users 
            or assignees of an Internet resource, such as a domain name, an IP address block, or an autonomous system.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Information Available:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Domain registration and expiration dates</li>
              <li>• Registrant contact information (may be protected)</li>
              <li>• Name server configuration</li>
              <li>• Domain status flags</li>
              <li>• Registrar information</li>
              <li>• DNSSEC status</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Privacy Considerations:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Many registrars offer privacy protection services</li>
              <li>• GDPR and other privacy laws affect data availability</li>
              <li>• Some information may be redacted for privacy</li>
              <li>• Whois data accuracy varies by registrar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}