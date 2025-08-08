'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Shield, Globe, Clock, BarChart3, Eye } from 'lucide-react'

export default function SuspiciousDomainChecker() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const checkSuspiciousDomain = async () => {
    if (!domain) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      // Simulate API call to check suspicious domain
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock results for demonstration
      const mockResults = {
        domain: domain,
        checkedAt: new Date().toISOString(),
        overallRisk: 'medium',
        domainAge: {
          days: 45,
          status: 'new',
          risk: 'medium'
        },
        reputation: {
          score: 65,
          status: 'moderate',
          factors: [
            'Recently registered',
            'No DNS records',
            'Anonymous registration',
            'No website content'
          ]
        },
        technicalAnalysis: {
          dnsHealth: {
            status: 'poor',
            mxRecords: false,
            spfRecord: false,
            dkimRecord: false,
            dmarcRecord: false,
            nsRecords: ['ns1.example.com', 'ns2.example.com']
          },
          sslCertificate: {
            status: 'valid',
            issuer: "Let's Encrypt",
            validFrom: '2024-01-01T00:00:00Z',
            validTo: '2024-04-01T00:00:00Z',
            isSelfSigned: false
          },
          websiteContent: {
            status: 'minimal',
            hasContent: false,
            redirects: 0,
            responseTime: 150
          }
        },
        threatIntelligence: {
          malware: false,
          phishing: false,
          spam: false,
          botnet: false,
          compromised: false,
          suspiciousPatterns: [
            'Domain name contains numbers',
            'Registration is anonymous',
            'No legitimate contact information'
          ]
        },
        reputationSources: {
          virusTotal: {
            malicious: 2,
            harmless: 45,
            suspicious: 3,
            timeout: 0
          },
          urlVoid: {
            detectedBy: 3,
            notDetectedBy: 12,
            suspicious: true
          },
          hybridAnalysis: {
            detected: false,
            analysisDate: '2024-01-20T10:30:00Z'
          }
        },
        recommendations: [
          'Verify domain registration details',
          'Check for legitimate contact information',
          'Monitor for suspicious activity',
          'Consider additional security measures'
        ],
        lastUpdated: new Date().toISOString()
      }

      setResults(mockResults)
    } catch (err) {
      setError('Failed to analyze domain. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>
      case 'medium':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case 'low':
        return <Badge variant="secondary">Low Risk</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'valid':
      case 'present':
        return <Shield className="h-4 w-4 text-green-500" />
      case 'poor':
      case 'missing':
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'moderate':
      case 'minimal':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Suspicious Domain Checker
          </CardTitle>
          <CardDescription>
            Analyze domains for suspicious characteristics, potential threats, and 
            risk indicators. Helps identify phishing sites, malware domains, and 
            other potentially harmful websites.
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
            <Button onClick={checkSuspiciousDomain} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Domain'}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
                <TabsTrigger value="reputation">Reputation</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {getRiskBadge(results.overallRisk)}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {results.overallRisk.charAt(0).toUpperCase() + results.overallRisk.slice(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Overall Risk</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{results.reputation.score}</div>
                      <div className="text-xs text-muted-foreground">Reputation Score</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{results.domainAge.days}</div>
                      <div className="text-xs text-muted-foreground">Domain Age (days)</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {results.technicalAnalysis.websiteContent.responseTime}ms
                      </div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Domain Characteristics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Domain Age</span>
                            <Badge variant={results.domainAge.risk === 'high' ? 'destructive' : 'secondary'}>
                              {results.domainAge.days} days ({results.domainAge.status})
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Reputation Score</span>
                            <span className="font-medium">{results.reputation.score}/100</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Risk Factors</h4>
                        <div className="space-y-1">
                          {results.reputation.factors.map((factor: string, index: number) => (
                            <div key={index} className="text-sm text-red-600 flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3" />
                              {factor}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        DNS Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Overall Status</span>
                        {getStatusIcon(results.technicalAnalysis.dnsHealth.status)}
                        <Badge variant={results.technicalAnalysis.dnsHealth.status === 'good' ? 'default' : 'destructive'}>
                          {results.technicalAnalysis.dnsHealth.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>MX Records</span>
                          <Badge variant={results.technicalAnalysis.dnsHealth.mxRecords ? 'default' : 'destructive'}>
                            {results.technicalAnalysis.dnsHealth.mxRecords ? 'Present' : 'Missing'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>SPF Record</span>
                          <Badge variant={results.technicalAnalysis.dnsHealth.spfRecord ? 'default' : 'destructive'}>
                            {results.technicalAnalysis.dnsHealth.spfRecord ? 'Present' : 'Missing'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>DKIM Record</span>
                          <Badge variant={results.technicalAnalysis.dnsHealth.dkimRecord ? 'default' : 'destructive'}>
                            {results.technicalAnalysis.dnsHealth.dkimRecord ? 'Present' : 'Missing'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>DMARC Record</span>
                          <Badge variant={results.technicalAnalysis.dnsHealth.dmarcRecord ? 'default' : 'destructive'}>
                            {results.technicalAnalysis.dnsHealth.dmarcRecord ? 'Present' : 'Missing'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        SSL Certificate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status</span>
                        {getStatusIcon(results.technicalAnalysis.sslCertificate.status)}
                        <Badge variant="default">Valid</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Issuer</span>
                          <span className="font-medium">{results.technicalAnalysis.sslCertificate.issuer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valid From</span>
                          <span className="font-medium">
                            {new Date(results.technicalAnalysis.sslCertificate.validFrom).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valid To</span>
                          <span className="font-medium">
                            {new Date(results.technicalAnalysis.sslCertificate.validTo).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Website Content Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {results.technicalAnalysis.websiteContent.hasContent ? 'Yes' : 'No'}
                        </div>
                        <div className="text-sm text-muted-foreground">Has Content</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {results.technicalAnalysis.websiteContent.redirects}
                        </div>
                        <div className="text-sm text-muted-foreground">Redirects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {results.technicalAnalysis.websiteContent.responseTime}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Response Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="threats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Threat Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Threat Detection</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Malware</span>
                            <Badge variant={results.threatIntelligence.malware ? 'destructive' : 'default'}>
                              {results.threatIntelligence.malware ? 'Detected' : 'Clean'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Phishing</span>
                            <Badge variant={results.threatIntelligence.phishing ? 'destructive' : 'default'}>
                              {results.threatIntelligence.phishing ? 'Detected' : 'Clean'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Spam</span>
                            <Badge variant={results.threatIntelligence.spam ? 'destructive' : 'default'}>
                              {results.threatIntelligence.spam ? 'Detected' : 'Clean'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Botnet</span>
                            <Badge variant={results.threatIntelligence.botnet ? 'destructive' : 'default'}>
                              {results.threatIntelligence.botnet ? 'Detected' : 'Clean'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Suspicious Patterns</h4>
                        <div className="space-y-1">
                          {results.threatIntelligence.suspiciousPatterns.map((pattern: string, index: number) => (
                            <div key={index} className="text-sm text-red-600 flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3" />
                              {pattern}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reputation Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">VirusTotal</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Malicious</span>
                            <span className="font-medium text-red-600">{results.reputationSources.virusTotal.malicious}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Harmless</span>
                            <span className="font-medium text-green-600">{results.reputationSources.virusTotal.harmless}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Suspicious</span>
                            <span className="font-medium text-yellow-600">{results.reputationSources.virusTotal.suspicious}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">URLVoid</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Detected by</span>
                            <span className="font-medium text-red-600">{results.reputationSources.urlVoid.detectedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Not detected by</span>
                            <span className="font-medium text-green-600">{results.reputationSources.urlVoid.notDetectedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Suspicious</span>
                            <Badge variant={results.reputationSources.urlVoid.suspicious ? 'destructive' : 'default'}>
                              {results.reputationSources.urlVoid.suspicious ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Hybrid Analysis</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Detected</span>
                            <Badge variant={results.reputationSources.hybridAnalysis.detected ? 'destructive' : 'default'}>
                              {results.reputationSources.hybridAnalysis.detected ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Analysis Date</span>
                            <span className="font-medium">
                              {new Date(results.reputationSources.hybridAnalysis.analysisDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reputation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Reputation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Reputation Score</span>
                          <span className="text-lg font-bold">{results.reputation.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              results.reputation.score >= 80 ? 'bg-green-500' :
                              results.reputation.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${results.reputation.score}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Reputation Status</h4>
                          <Badge variant="secondary">{results.reputation.status}</Badge>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Risk Level</h4>
                          {getRiskBadge(results.overallRisk)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Recommendations
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
                    <CardTitle className="text-lg">Action Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Immediate Actions:</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Verify domain registration details</li>
                          <li>• Check for legitimate contact information</li>
                          <li>• Review DNS configuration</li>
                          <li>• Monitor for suspicious activity</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Long-term Measures:</h5>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• Implement proper email authentication</li>
                          <li>• Regular security audits</li>
                          <li>• Monitor reputation scores</li>
                          <li>• Consider domain reputation services</li>
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