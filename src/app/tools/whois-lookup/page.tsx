'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Globe, Calendar, Shield, Building, Mail } from 'lucide-react'

interface WHOISRecord {
  field: string
  value: string
  type: 'general' | 'contact' | 'technical' | 'dates' | 'nameservers'
}

interface WHOISResult {
  domain: string
  records: WHOISRecord[]
  rawOutput: string
  lookupTime: number
  timestamp: Date
}

export default function WHOISLookup() {
  const [domain, setDomain] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [results, setResults] = useState<WHOISResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('structured')

  const performWHOISLookup = async (domain: string): Promise<WHOISResult> => {
    try {
      const startTime = Date.now()
      
      // Simulate WHOIS lookup (in real implementation, this would use a WHOIS API)
      // For demo purposes, we'll generate realistic WHOIS data
      const records = generateWHOISRecords(domain)
      const rawOutput = generateRawWHOISOutput(domain)
      const lookupTime = Date.now() - startTime

      return {
        domain,
        records,
        rawOutput,
        lookupTime,
        timestamp: new Date()
      }
    } catch (error) {
      throw new Error('Failed to perform WHOIS lookup')
    }
  }

  const generateWHOISRecords = (domain: string): WHOISRecord[] => {
    const records: WHOISRecord[] = []
    
    // General information
    records.push(
      { field: 'Domain Name', value: domain, type: 'general' },
      { field: 'Registry Domain ID', value: 'D123456789-' + domain.toUpperCase(), type: 'general' },
      { field: 'Registrar WHOIS Server', value: 'whois.example.com', type: 'general' },
      { field: 'Registrar URL', value: 'https://www.example.com', type: 'general' },
      { field: 'Updated Date', value: '2024-01-15T10:30:00Z', type: 'dates' },
      { field: 'Creation Date', value: '2020-03-10T14:22:00Z', type: 'dates' },
      { field: 'Registry Expiry Date', value: '2025-03-10T14:22:00Z', type: 'dates' },
      { field: 'Registrar', value: 'Example Registrar Inc.', type: 'general' },
      { field: 'Registrar IANA ID', value: '1234', type: 'general' },
      { field: 'Registrar Abuse Contact Email', value: 'abuse@example.com', type: 'contact' },
      { field: 'Registrar Abuse Contact Phone', value: '+1.5555555555', type: 'contact' }
    )

    // Registrant information
    records.push(
      { field: 'Registrant Name', value: 'John Doe', type: 'contact' },
      { field: 'Registrant Organization', value: 'Example Company', type: 'contact' },
      { field: 'Registrant Street', value: '123 Main Street', type: 'contact' },
      { field: 'Registrant City', value: 'San Francisco', type: 'contact' },
      { field: 'Registrant State/Province', value: 'CA', type: 'contact' },
      { field: 'Registrant Postal Code', value: '94105', type: 'contact' },
      { field: 'Registrant Country', value: 'US', type: 'contact' },
      { field: 'Registrant Phone', value: '+1.5551234567', type: 'contact' },
      { field: 'Registrant Phone Ext', value: '', type: 'contact' },
      { field: 'Registrant Fax', value: '+1.5551234568', type: 'contact' },
      { field: 'Registrant Fax Ext', value: '', type: 'contact' },
      { field: 'Registrant Email', value: 'john.doe@example.com', type: 'contact' }
    )

    // Administrative contact
    records.push(
      { field: 'Admin Name', value: 'Jane Smith', type: 'contact' },
      { field: 'Admin Organization', value: 'Example Company', type: 'contact' },
      { field: 'Admin Street', value: '123 Main Street', type: 'contact' },
      { field: 'Admin City', value: 'San Francisco', type: 'contact' },
      { field: 'Admin State/Province', value: 'CA', type: 'contact' },
      { field: 'Admin Postal Code', value: '94105', type: 'contact' },
      { field: 'Admin Country', value: 'US', type: 'contact' },
      { field: 'Admin Phone', value: '+1.5551234567', type: 'contact' },
      { field: 'Admin Phone Ext', value: '', type: 'contact' },
      { field: 'Admin Fax', value: '+1.5551234568', type: 'contact' },
      { field: 'Admin Fax Ext', value: '', type: 'contact' },
      { field: 'Admin Email', value: 'jane.smith@example.com', type: 'contact' }
    )

    // Technical contact
    records.push(
      { field: 'Tech Name', value: 'Bob Johnson', type: 'technical' },
      { field: 'Tech Organization', value: 'Example Company', type: 'technical' },
      { field: 'Tech Street', value: '123 Main Street', type: 'technical' },
      { field: 'Tech City', value: 'San Francisco', type: 'technical' },
      { field: 'Tech State/Province', value: 'CA', type: 'technical' },
      { field: 'Tech Postal Code', value: '94105', type: 'technical' },
      { field: 'Tech Country', value: 'US', type: 'technical' },
      { field: 'Tech Phone', value: '+1.5551234567', type: 'technical' },
      { field: 'Tech Phone Ext', value: '', type: 'technical' },
      { field: 'Tech Fax', value: '+1.5551234568', type: 'technical' },
      { field: 'Tech Fax Ext', value: '', type: 'technical' },
      { field: 'Tech Email', value: 'bob.johnson@example.com', type: 'technical' }
    )

    // Name servers
    records.push(
      { field: 'Name Server', value: 'ns1.example.com', type: 'nameservers' },
      { field: 'Name Server', value: 'ns2.example.com', type: 'nameservers' },
      { field: 'Name Server', value: 'ns3.example.com', type: 'nameservers' },
      { field: 'Name Server', value: 'ns4.example.com', type: 'nameservers' },
      { field: 'DNSSEC', value: 'unsigned', type: 'technical' }
    )

    return records
  }

  const generateRawWHOISOutput = (domain: string): string => {
    return `Domain Name: ${domain}
Registry Domain ID: D123456789-${domain.toUpperCase()}
Registrar WHOIS Server: whois.example.com
Registrar URL: https://www.example.com
Updated Date: 2024-01-15T10:30:00Z
Creation Date: 2020-03-10T14:22:00Z
Registry Expiry Date: 2025-03-10T14:22:00Z
Registrar: Example Registrar Inc.
Registrar IANA ID: 1234
Registrar Abuse Contact Email: abuse@example.com
Registrar Abuse Contact Phone: +1.5555555555

Registrant Name: John Doe
Registrant Organization: Example Company
Registrant Street: 123 Main Street
Registrant City: San Francisco
Registrant State/Province: CA
Registrant Postal Code: 94105
Registrant Country: US
Registrant Phone: +1.5551234567
Registrant Fax: +1.5551234568
Registrant Email: john.doe@example.com

Admin Name: Jane Smith
Admin Organization: Example Company
Admin Street: 123 Main Street
Admin City: San Francisco
Admin State/Province: CA
Admin Postal Code: 94105
Admin Country: US
Admin Phone: +1.5551234567
Admin Fax: +1.5551234568
Admin Email: jane.smith@example.com

Tech Name: Bob Johnson
Tech Organization: Example Company
Tech Street: 123 Main Street
Tech City: San Francisco
Tech State/Province: CA
Tech Postal Code: 94105
Tech Country: US
Tech Phone: +1.5551234567
Tech Fax: +1.5551234568
Tech Email: bob.johnson@example.com

Name Server: ns1.example.com
Name Server: ns2.example.com
Name Server: ns3.example.com
Name Server: ns4.example.com
DNSSEC: unsigned`
  }

  const startLookup = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setIsLookingUp(true)
    setError(null)
    setResults(null)

    try {
      const result = await performWHOISLookup(domain.trim())
      setResults(result)
    } catch (error) {
      setError('Failed to perform WHOIS lookup. Please try again.')
    } finally {
      setIsLookingUp(false)
    }
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      'Field,Value,Type',
      ...results.records.map(r => 
        `"${r.field}","${r.value}","${r.type}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whois_${results.domain}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-100 text-blue-800 border-blue-200',
      'contact': 'bg-green-100 text-green-800 border-green-200',
      'technical': 'bg-orange-100 text-orange-800 border-orange-200',
      'dates': 'bg-purple-100 text-purple-800 border-purple-200',
      'nameservers': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'general': return <Globe className="h-4 w-4" />
      case 'contact': return <Building className="h-4 w-4" />
      case 'technical': return <Shield className="h-4 w-4" />
      case 'dates': return <Calendar className="h-4 w-4" />
      case 'nameservers': return <Mail className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getRecordsByType = (type: string) => {
    return results?.records.filter(r => r.type === type) || []
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            WHOIS Lookup
          </CardTitle>
          <CardDescription>
            Query WHOIS information for any domain name to get registration details, contact information, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={startLookup} 
              disabled={isLookingUp || !domain.trim()}
              className="flex-1"
            >
              {isLookingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                'Lookup WHOIS Information'
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.records.length}</div>
                    <div className="text-sm text-muted-foreground">Records Found</div>
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
                    <div className="text-2xl font-bold text-purple-600">{results.domain}</div>
                    <div className="text-sm text-muted-foreground">Domain</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="structured">Structured View</TabsTrigger>
                  <TabsTrigger value="raw">Raw Output</TabsTrigger>
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  <TabsTrigger value="technical">Technical Info</TabsTrigger>
                </TabsList>

                <TabsContent value="structured" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">All WHOIS Records</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-6">Value</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-1">Security</div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {results.records.map((record, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t text-sm">
                            <div className="col-span-3 font-medium">{record.field}</div>
                            <div className="col-span-6 font-mono text-xs break-all">{record.value}</div>
                            <div className="col-span-2">
                              <Badge 
                                variant="outline" 
                                className={getRecordTypeColor(record.type)}
                              >
                                {getRecordTypeIcon(record.type)}
                                <span className="ml-1">{record.type}</span>
                              </Badge>
                            </div>
                            <div className="col-span-1">
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3" />
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="raw" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Raw WHOIS Output</h3>
                    <Textarea
                      value={results.rawOutput}
                      readOnly
                      rows={20}
                      className="font-mono text-xs"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    {['contact'].map(type => (
                      <div key={type} className="space-y-2">
                        <h4 className="font-medium capitalize">{type} Information</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                            <div className="col-span-3">Field</div>
                            <div className="col-span-9">Value</div>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {getRecordsByType(type).map((record, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t text-sm">
                                <div className="col-span-3 font-medium">{record.field}</div>
                                <div className="col-span-9 font-mono text-xs break-all">{record.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="technical" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Technical Information</h3>
                    {['technical', 'dates', 'nameservers'].map(type => (
                      <div key={type} className="space-y-2">
                        <h4 className="font-medium capitalize">{type} Information</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                            <div className="col-span-3">Field</div>
                            <div className="col-span-9">Value</div>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {getRecordsByType(type).map((record, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t text-sm">
                                <div className="col-span-3 font-medium">{record.field}</div>
                                <div className="col-span-9 font-mono text-xs break-all">{record.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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