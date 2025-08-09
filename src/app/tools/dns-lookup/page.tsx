'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl: number
  priority?: number
}

export default function DNSLookupTool() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<DNSRecord[]>([])
  const [error, setError] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null)
  const { toast } = useToast()

  const dnsTypes = [
    'A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA', 'PTR', 'SRV', 'CAA', 'TLSA', 'DS'
  ]

  const performDNSLookup = async (type: string = 'ALL') => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setRecords([])

    try {
      // Simulate DNS lookup - in a real app, this would call a DNS API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock DNS data for demonstration
      const mockRecords: DNSRecord[] = []
      
      if (type === 'ALL' || type === 'A') {
        mockRecords.push({
          type: 'A',
          name: domain,
          value: '93.184.216.34',
          ttl: 3600
        })
      }
      
      if (type === 'ALL' || type === 'AAAA') {
        mockRecords.push({
          type: 'AAAA',
          name: domain,
          value: '2606:2800:220:1:248:1893:25c8:1946',
          ttl: 3600
        })
      }
      
      if (type === 'ALL' || type === 'MX') {
        mockRecords.push({
          type: 'MX',
          name: domain,
          value: 'mail.example.com',
          ttl: 3600,
          priority: 10
        })
      }
      
      if (type === 'ALL' || type === 'TXT') {
        mockRecords.push({
          type: 'TXT',
          name: domain,
          value: 'v=spf1 include:_spf.google.com ~all',
          ttl: 3600
        })
      }
      
      if (type === 'ALL' || type === 'NS') {
        mockRecords.push({
          type: 'NS',
          name: domain,
          value: 'ns1.cloudflare.com',
          ttl: 86400
        })
        mockRecords.push({
          type: 'NS',
          name: domain,
          value: 'ns2.cloudflare.com',
          ttl: 86400
        })
      }

      setRecords(mockRecords)
    } catch (err) {
      setError('Failed to perform DNS lookup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The value has been copied to your clipboard.",
    })
  }

  const getRecordColor = (type: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-blue-100 text-blue-800',
      'AAAA': 'bg-green-100 text-green-800',
      'MX': 'bg-purple-100 text-purple-800',
      'TXT': 'bg-yellow-100 text-yellow-800',
      'CNAME': 'bg-pink-100 text-pink-800',
      'NS': 'bg-indigo-100 text-indigo-800',
      'SOA': 'bg-red-100 text-red-800',
      'PTR': 'bg-orange-100 text-orange-800',
      'SRV': 'bg-teal-100 text-teal-800',
      'CAA': 'bg-cyan-100 text-cyan-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>DNS Lookup Tool</span>
          </CardTitle>
          <CardDescription>
            Query DNS records for any domain name. Supports A, AAAA, MX, TXT, CNAME, NS, and more.
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
                onKeyPress={(e) => e.key === 'Enter' && performDNSLookup()}
              />
            </div>
            <Button 
              onClick={() => performDNSLookup()} 
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

      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>DNS Records for {domain}</CardTitle>
            <CardDescription>
              Found {records.length} DNS record{records.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ALL" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="ALL" onClick={() => performDNSLookup('ALL')}>
                  ALL
                </TabsTrigger>
                {dnsTypes.slice(0, 5).map(type => (
                  <TabsTrigger key={type} value={type} onClick={() => performDNSLookup(type)}>
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="ALL" className="space-y-4">
                <div className="space-y-3">
                  {records.map((record, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getRecordColor(record.type)}>
                            {record.type}
                          </Badge>
                          <span className="font-mono text-sm">{record.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">TTL: {record.ttl}s</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(record.value)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {record.value}
                        </code>
                        {record.priority && (
                          <Badge variant="outline">Priority: {record.priority}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {dnsTypes.slice(0, 5).map(type => (
                <TabsContent key={type} value={type}>
                  <div className="space-y-3">
                    {records
                      .filter(record => record.type === type)
                      .map((record, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getRecordColor(record.type)}>
                                {record.type}
                              </Badge>
                              <span className="font-mono text-sm">{record.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">TTL: {record.ttl}s</span>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(record.value)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {record.value}
                            </code>
                            {record.priority && (
                              <Badge variant="outline" className="ml-2">Priority: {record.priority}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {selectedRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Record Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                <p className="font-mono">{selectedRecord.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="font-mono">{selectedRecord.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Value</Label>
                <p className="font-mono">{selectedRecord.value}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">TTL</Label>
                <p>{selectedRecord.ttl} seconds</p>
              </div>
              {selectedRecord.priority && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <p>{selectedRecord.priority}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(selectedRecord.value)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Value
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About DNS Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            DNS (Domain Name System) is the phonebook of the internet. It translates domain names like 
            <code className="bg-gray-100 px-1 rounded">example.com</code> to IP addresses like 
            <code className="bg-gray-100 px-1 rounded">93.184.216.34</code>.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Common DNS Record Types:</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>A:</strong> IPv4 address</li>
              <li><strong>AAAA:</strong> IPv6 address</li>
              <li><strong>MX:</strong> Mail exchange server</li>
              <li><strong>TXT:</strong> Text records for SPF, DKIM, etc.</li>
              <li><strong>CNAME:</strong> Canonical name (alias)</li>
              <li><strong>NS:</strong> Name server</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}