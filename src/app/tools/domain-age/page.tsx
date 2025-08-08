'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Globe, Building, MapPin, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DomainInfo {
  domain: string
  registrar: string
  registrationDate: string
  expirationDate: string
  age: {
    years: number
    months: number
    days: number
  }
  status: 'active' | 'expired' | 'pending' | 'transfer' | 'redemption'
  nameServers: string[]
  dnsSec: boolean
  privacy: boolean
  updatedDate: string
  creationDate: string
  adminContact: {
    name: string
    organization: string
    email: string
  }
  techContact: {
    name: string
    organization: string
    email: string
  }
  billingContact: {
    name: string
    organization: string
    email: string
  }
}

export default function DomainAgeChecker() {
  const [domain, setDomain] = useState('')
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const checkDomainAge = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain name')
      return
    }

    setIsChecking(true)
    try {
      // Simulate domain age checking
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Mock domain data
      const mockData: DomainInfo = {
        domain: domain,
        registrar: 'GoDaddy.com, LLC',
        registrationDate: '2019-03-15T10:30:00Z',
        expirationDate: '2025-03-15T10:30:00Z',
        age: {
          years: 5,
          months: 2,
          days: 10
        },
        status: 'active',
        nameServers: [
          'ns1.example.com',
          'ns2.example.com',
          'ns3.example.com',
          'ns4.example.com'
        ],
        dnsSec: true,
        privacy: true,
        updatedDate: '2024-01-20T14:25:00Z',
        creationDate: '2019-03-15T10:30:00Z',
        adminContact: {
          name: 'John Doe',
          organization: 'Example Inc.',
          email: 'admin@example.com'
        },
        techContact: {
          name: 'Jane Smith',
          organization: 'Example Inc.',
          email: 'tech@example.com'
        },
        billingContact: {
          name: 'Bob Johnson',
          organization: 'Example Inc.',
          email: 'billing@example.com'
        }
      }
      
      setDomainInfo(mockData)
      toast.success('Domain information retrieved successfully!')
    } catch (error) {
      toast.error('Failed to check domain information')
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'transfer':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Transfer</Badge>
      case 'redemption':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Redemption</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFeatureBadge = (enabled: boolean) => {
    return enabled 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
      : <Badge variant="outline">Disabled</Badge>
  }

  const calculateDaysLeft = (expirationDate: string) => {
    const today = new Date()
    const expiration = new Date(expirationDate)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const openInWhois = () => {
    if (domainInfo) {
      window.open(`https://whois.domaintools.com/${encodeURIComponent(domainInfo.domain)}`, '_blank')
    }
  }

  const openInRegistrar = () => {
    if (domainInfo) {
      window.open(`https://www.godaddy.com/whois/result/${encodeURIComponent(domainInfo.domain)}`, '_blank')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Domain Age Checker</h1>
        <p className="text-muted-foreground">
          Check domain registration date, age, and comprehensive domain information
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Domain Information</CardTitle>
            <CardDescription>Enter domain name to check registration details and age</CardDescription>
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
                onClick={checkDomainAge}
                disabled={isChecking || !domain.trim()}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Check Domain
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {domainInfo && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Domain Overview</CardTitle>
                <CardDescription>Basic domain information and age</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Domain</label>
                      <div className="text-xl font-bold">{domainInfo.domain}</div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(domainInfo.status)}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registrar</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-blue-500" />
                        <span>{domainInfo.registrar}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Domain Age</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-lg">{domainInfo.age.years} years</span>
                        <span>{domainInfo.age.months} months</span>
                        <span>{domainInfo.age.days} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                      <div className="font-mono text-sm mt-1">
                        {new Date(domainInfo.registrationDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Expiration Date</label>
                      <div className="font-mono text-sm mt-1">
                        {new Date(domainInfo.expirationDate).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {calculateDaysLeft(domainInfo.expirationDate)} days remaining
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Features</CardTitle>
                <CardDescription>Security and privacy settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">DNSSEC</label>
                    <div className="mt-2">
                      {getFeatureBadge(domainInfo.dnsSec)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Privacy Protection</label>
                    <div className="mt-2">
                      {getFeatureBadge(domainInfo.privacy)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name Servers</label>
                    <div className="mt-2">
                      <Badge variant="outline">{domainInfo.nameServers.length} configured</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Domain contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="tech">Technical</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="admin" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <div className="font-medium">{domainInfo.adminContact.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Organization</label>
                        <div className="font-medium">{domainInfo.adminContact.organization}</div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="font-mono text-sm">{domainInfo.adminContact.email}</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tech" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <div className="font-medium">{domainInfo.techContact.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Organization</label>
                        <div className="font-medium">{domainInfo.techContact.organization}</div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="font-mono text-sm">{domainInfo.techContact.email}</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="billing" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <div className="font-medium">{domainInfo.billingContact.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Organization</label>
                        <div className="font-medium">{domainInfo.billingContact.organization}</div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="font-mono text-sm">{domainInfo.billingContact.email}</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Name Servers</CardTitle>
                <CardDescription>Configured DNS name servers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {domainInfo.nameServers.map((ns, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="font-mono text-sm">{ns}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Tools</CardTitle>
                <CardDescription>View domain information on external services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button onClick={openInWhois} variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Whois
                  </Button>
                  <Button onClick={openInRegistrar} variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Registrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!domainInfo && !isChecking && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Enter a domain name and click check to see registration details and age
                </p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}