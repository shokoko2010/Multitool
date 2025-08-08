'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, AlertTriangle, CheckCircle, XCircle, Globe, Mail, Server, Clock } from 'lucide-react'

export default function BlacklistLookup() {
  const [domain, setDomain] = useState('')
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const checkBlacklist = async () => {
    const target = domain || ip
    if (!target) {
      setError('Please enter a domain name or IP address')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      // Simulate API call to check blacklists
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Mock results for demonstration
      const mockResults = {
        target: target,
        targetType: domain ? 'domain' : 'ip',
        checkedAt: new Date().toISOString(),
        overallStatus: 'clean',
        blacklists: {
          spamhaus: {
            status: 'clean',
            url: 'https://www.spamhaus.org/',
            description: 'Spamhaus Block List (SBL) - Email spam protection'
          },
          sorbs: {
            status: 'clean',
            url: 'https://www.sorbs.net/',
            description: 'Spam and Open Relay Blocking System'
          },
          spamcop: {
            status: 'listed',
            url: 'https://spamcop.net/',
            description: 'SpamCop Blocking List',
            listedSince: '2024-01-15T10:30:00Z',
            reason: 'Reported for sending spam emails'
          },
          barracuda: {
            status: 'clean',
            url: 'https://www.barracudacentral.org/',
            description: 'Barracuda Reputation Block List'
          },
          senderbase: {
            status: 'clean',
            url: 'https://www.senderbase.org/',
            description: 'SenderScore Reputation Authority'
          },
          multirbl: {
            status: 'listed',
            url: 'https://multirbl.valli.org/',
            description: 'Multi-RBL Check',
            listedSince: '2024-01-10T14:22:00Z',
            reason: 'Detected in multiple blacklists'
          },
          uribl: {
            status: 'clean',
            url: 'https://uribl.com/',
            description: 'URI Blacklist'
          },
          SURBL: {
            status: 'clean',
            url: 'https://www.surbl.org/',
            description: 'Spam URI Realtime Block Lists'
          }
        },
        summary: {
          totalChecked: 8,
          cleanCount: 6,
          listedCount: 2,
          riskLevel: 'medium'
        },
        recommendations: [
          'Monitor your email sending practices',
          'Check your email server for open relays',
          'Implement proper authentication (SPF, DKIM, DMARC)',
          'Regularly check blacklist status'
        ],
        lastUpdated: new Date().toISOString()
      }

      setResults(mockResults)
    } catch (err) {
      setError('Failed to check blacklist status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'listed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clean':
        return <Badge variant="default" className="bg-green-100 text-green-800">Clean</Badge>
      case 'listed':
        return <Badge variant="destructive">Listed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatListedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blacklist Lookup
          </CardTitle>
          <CardDescription>
            Check if your domain or IP address is listed on major spam and security blacklists. 
            Being blacklisted can affect email deliverability and website reputation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain Name</label>
              <Input
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">IP Address</label>
              <Input
                type="text"
                placeholder="192.168.1.1"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <Button onClick={checkBlacklist} disabled={loading} className="w-full">
            {loading ? 'Checking...' : 'Check Blacklists'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="blacklists">Blacklists</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {results.overallStatus === 'clean' ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {results.overallStatus === 'clean' ? 'Clean' : 'Listed'}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Status</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {results.summary.cleanCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Clean Lists</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {results.summary.listedCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Blacklisted</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Blacklist Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Checked</span>
                          <span className="font-medium">{results.summary.totalChecked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Risk Level</span>
                          <Badge 
                            variant={
                              results.summary.riskLevel === 'high' ? 'destructive' : 
                              results.summary.riskLevel === 'medium' ? 'default' : 'secondary'
                            }
                          >
                            {results.summary.riskLevel.charAt(0).toUpperCase() + results.summary.riskLevel.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target</span>
                          <span className="font-medium text-blue-600">{results.target}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Type</span>
                          <Badge variant="outline">{results.targetType}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="blacklists" className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(results.blacklists).map(([name, data]: [string, any]) => (
                    <Card key={name}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(data.status)}
                              <h4 className="font-medium capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</h4>
                              {getStatusBadge(data.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{data.description}</p>
                            {data.status === 'listed' && (
                              <div className="text-xs text-red-600 space-y-1">
                                <p>Listed since: {formatListedDate(data.listedSince)}</p>
                                <p>Reason: {data.reason}</p>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(data.url, '_blank')}
                          >
                            Visit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">If Listed:</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Contact the blacklist provider</li>
                          <li>• Fix the underlying issue</li>
                          <li>• Request removal</li>
                          <li>• Monitor for re-listing</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Prevention:</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Maintain good email practices</li>
                          <li>• Use authentication protocols</li>
                          <li>• Monitor server security</li>
                          <li>• Regular reputation checks</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target</span>
                          <span className="font-medium">{results.target}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Type</span>
                          <span className="font-medium">{results.targetType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Checked At</span>
                          <span className="font-medium">
                            {new Date(results.checkedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Updated</span>
                          <span className="font-medium">
                            {new Date(results.lastUpdated).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Blacklists Checked</span>
                          <span className="font-medium">{results.summary.totalChecked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Clean Lists</span>
                          <span className="font-medium text-green-600">{results.summary.cleanCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Listed Lists</span>
                          <span className="font-medium text-red-600">{results.summary.listedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Risk Level</span>
                          <Badge variant="secondary">{results.summary.riskLevel}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Blacklist Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Email Blacklists:</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Spamhaus Block List (SBL)</li>
                          <li>• SpamCop Blocking List</li>
                          <li>• Barracuda Reputation Block List</li>
                          <li>• SenderScore Reputation Authority</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Security Blacklists:</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Spam and Open Relay Blocking System</li>
                          <li>• Multi-RBL Check</li>
                          <li>• URI Blacklist</li>
                          <li>• Spam URI Realtime Block Lists</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}