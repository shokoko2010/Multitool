'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Globe, MapPin, Download, Upload, Copy, BarChart3, Clock } from 'lucide-react'

export default function BulkGEOIPLocator() {
  const [inputText, setInputText] = useState('')
  const [ips, setIps] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parseIPs = (text: string) => {
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g
    const foundIPs = text.match(ipRegex) || []
    return foundIPs.filter((ip, index, self) => self.indexOf(ip) === index)
  }

  const analyzeIPs = async () => {
    if (!inputText.trim()) {
      setError('Please enter text containing IP addresses')
      return
    }

    const parsedIPs = parseIPs(inputText)
    if (parsedIPs.length === 0) {
      setError('No valid IP addresses found in the input')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      // Simulate API call for each IP
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockResults = parsedIPs.map((ip, index) => ({
        id: index + 1,
        ip: ip,
        country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Japan', 'Australia'][Math.floor(Math.random() * 6)],
        countryCode: ['US', 'CA', 'GB', 'DE', 'JP', 'AU'][Math.floor(Math.random() * 6)],
        region: ['California', 'Ontario', 'England', 'Bavaria', 'Tokyo', 'New South Wales'][Math.floor(Math.random() * 6)],
        city: ['San Francisco', 'Toronto', 'London', 'Munich', 'Tokyo', 'Sydney'][Math.floor(Math.random() * 6)],
        latitude: (Math.random() * 180 - 90).toFixed(6),
        longitude: (Math.random() * 360 - 180).toFixed(6),
        isp: ['Cloudflare', 'Amazon AWS', 'Google Cloud', 'Microsoft Azure', 'DigitalOcean', 'OVH'][Math.floor(Math.random() * 6)],
        organization: ['Cloudflare, Inc.', 'Amazon.com, Inc.', 'Google LLC', 'Microsoft Corporation', 'DigitalOcean, LLC', 'OVH SAS'][Math.floor(Math.random() * 6)],
        asn: `AS${Math.floor(Math.random() * 50000) + 1000}`,
        asname: ['CLOUDFLARENET', 'AMAZON-02', 'GOOGLE', 'MICROSOFT-CORP-MSN-AS-BLOCK', 'DIGITALOCEAN-ASN', 'OVH'][Math.floor(Math.random() * 6)],
        timezone: ['America/Los_Angeles', 'America/Toronto', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'][Math.floor(Math.random() * 6)],
        zipCode: Math.floor(Math.random() * 90000 + 10000).toString(),
        isProxy: Math.random() > 0.8,
        isTor: Math.random() > 0.95,
        threatLevel: Math.random() > 0.7 ? 'Low' : Math.random() > 0.4 ? 'Medium' : 'High',
        lastUpdated: new Date().toISOString()
      }))

      setResults(mockResults)
      setIps(parsedIPs)
    } catch (err) {
      setError('Failed to analyze IP addresses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResults = (format: 'csv' | 'json') => {
    if (results.length === 0) return

    if (format === 'csv') {
      const headers = ['IP', 'Country', 'Region', 'City', 'ISP', 'Organization', 'ASN', 'Threat Level']
      const csvContent = [
        headers.join(','),
        ...results.map(result => [
          result.ip,
          result.country,
          result.region,
          result.city,
          result.isp,
          result.organization,
          result.asn,
          result.threatLevel
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'geo-ip-analysis.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      const jsonContent = JSON.stringify(results, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'geo-ip-analysis.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getCountryStats = () => {
    const countryCount: Record<string, number> = {}
    results.forEach(result => {
      countryCount[result.country] = (countryCount[result.country] || 0) + 1
    })
    return Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  }

  const getThreatStats = () => {
    const threatCount: Record<string, number> = {}
    results.forEach(result => {
      threatCount[result.threatLevel] = (threatCount[result.threatLevel] || 0) + 1
    })
    return Object.entries(threatCount)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Bulk GEO IP Locator
          </CardTitle>
          <CardDescription>
            Analyze multiple IP addresses to get geographical location, ISP information, 
            and threat intelligence data. Supports CSV, JSON, and text input formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter IP Addresses</label>
            <Textarea
              placeholder="Paste text containing IP addresses, or enter one IP per line:

192.168.1.1
10.0.0.1
172.16.0.1

Or paste text from logs, emails, or any source:"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Found {parseIPs(inputText).length} unique IP addresses
            </p>
          </div>
          
          <Button onClick={analyzeIPs} disabled={loading} className="w-full">
            {loading ? 'Analyzing...' : 'Analyze IP Addresses'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{results.length}</div>
                    <div className="text-xs text-muted-foreground">IPs Analyzed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {getCountryStats().reduce((sum, [, count]) => sum + count, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Countries</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {results.filter(r => r.isProxy).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Proxies</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {results.filter(r => r.isTor).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Tor Nodes</div>
                  </CardContent>
                </Card>
              </div>

              {/* Export Options */}
              <div className="flex gap-2">
                <Button onClick={() => downloadResults('csv')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
                <Button onClick={() => downloadResults('json')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </div>

              <Tabs defaultValue="results" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="statistics">Statistics</TabsTrigger>
                  <TabsTrigger value="threat">Threat Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="results" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <div className="bg-gray-50 p-2 border-b sticky top-0 z-10">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600">
                        <div className="col-span-1">IP</div>
                        <div className="col-span-2">Country</div>
                        <div className="col-span-2">Region</div>
                        <div className="col-span-2">City</div>
                        <div className="col-span-2">ISP</div>
                        <div className="col-span-1">ASN</div>
                        <div className="col-span-1">Threat</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                    </div>
                    <div className="divide-y">
                      {results.map((result) => (
                        <div key={result.id} className="grid grid-cols-12 gap-2 p-2 hover:bg-gray-50">
                          <div className="col-span-1 font-mono text-sm">{result.ip}</div>
                          <div className="col-span-2">
                            <Badge variant="outline">{result.countryCode}</Badge>
                            <span className="text-sm ml-1">{result.country}</span>
                          </div>
                          <div className="col-span-2 text-sm">{result.region}</div>
                          <div className="col-span-2 text-sm">{result.city}</div>
                          <div className="col-span-2 text-sm">{result.isp}</div>
                          <div className="col-span-1 font-mono text-sm">{result.asn}</div>
                          <div className="col-span-1">
                            <Badge 
                              variant={
                                result.threatLevel === 'High' ? 'destructive' : 
                                result.threatLevel === 'Medium' ? 'default' : 'secondary'
                              }
                            >
                              {result.threatLevel}
                            </Badge>
                          </div>
                          <div className="col-span-1 flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(result.ip)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="statistics" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Geographic Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {getCountryStats().map(([country, count]) => (
                            <div key={country} className="flex justify-between items-center">
                              <span className="text-sm">{country}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(count / results.length) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          ISP Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {results.slice(0, 5).map((result, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{result.isp}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${20 * (index + 1)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">1</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="threat" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Threat Level Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getThreatStats().map(([level, count]) => (
                            <div key={level} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{level} Risk</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      level === 'High' ? 'bg-red-500' : 
                                      level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${(count / results.length) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Security Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Proxy Servers</span>
                          <Badge variant={results.filter(r => r.isProxy).length > 0 ? 'destructive' : 'default'}>
                            {results.filter(r => r.isProxy).length} found
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tor Nodes</span>
                          <Badge variant={results.filter(r => r.isTor).length > 0 ? 'destructive' : 'default'}>
                            {results.filter(r => r.isTor).length} found
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">High Risk IPs</span>
                          <Badge variant="destructive">
                            {results.filter(r => r.threatLevel === 'High').length} found
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Overall Security Score</span>
                          <Badge variant="secondary">
                            {Math.round((results.filter(r => r.threatLevel === 'Low').length / results.length) * 100)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}