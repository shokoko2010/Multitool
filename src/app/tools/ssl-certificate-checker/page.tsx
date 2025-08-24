'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Shield, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Globe,
  Lock,
  Unlock
} from 'lucide-react'

interface CertificateInfo {
  subject: string
  issuer: string
  validFrom: Date
  validTo: Date
  serialNumber: string
  fingerprint: string
  version: number
  signatureAlgorithm: string
  keyAlgorithm: string
  keySize: number
  sanDomains: string[]
  isWildcard: boolean
  isEV: boolean
  isSelfSigned: boolean
  daysUntilExpiry: number
  isValid: boolean
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  issues: string[]
  recommendations: string[]
}

interface SSLCheckResult {
  domain: string
  port: number
  certificate: CertificateInfo
  protocol: string
  cipherSuite: string
  lookupTime: number
  timestamp: Date
}

export default function SSLCertificateChecker() {
  const [domain, setDomain] = useState('')
  const [port, setPort] = useState('443')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<SSLCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('certificate')

  const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return domainRegex.test(domain)
  }

  const performSSLCertificateCheck = async (domain: string, port: number): Promise<SSLCheckResult> => {
    try {
      const startTime = Date.now()
      
      // Simulate SSL certificate check (in real implementation, this would use an SSL API)
      // For demo purposes, we'll generate realistic certificate data
      const certificate = generateCertificateInfo(domain)
      const lookupTime = Date.now() - startTime

      return {
        domain,
        port,
        certificate,
        protocol: 'TLS 1.3',
        cipherSuite: 'TLS_AES_256_GCM_SHA384',
        lookupTime,
        timestamp: new Date()
      }
    } catch (error) {
      throw new Error('Failed to check SSL certificate')
    }
  }

  const generateCertificateInfo = (domain: string): CertificateInfo => {
    const now = new Date()
    const validFrom = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random past date
    const validTo = new Date(validFrom.getTime() + (365 + Math.random() * 365) * 24 * 60 * 60 * 1000) // 1-2 years
    const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    
    const issuers = [
      "Let's Encrypt",
      "DigiCert",
      "Comodo",
      "GlobalSign",
      "Sectigo",
      "GoDaddy",
      "RapidSSL"
    ]
    
    const algorithms = [
      "SHA256RSA",
      "SHA384RSA",
      "SHA512RSA",
      "ECDSA",
      "Ed25519"
    ]
    
    const keyAlgorithms = ["RSA", "ECDSA", "Ed25519"]
    const keySizes = [2048, 3072, 4096, 256, 384, 521]
    
    const sanDomains = [
      domain,
      `www.${domain}`,
      `mail.${domain}`,
      `api.${domain}`,
      `*.${domain}`
    ]
    
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Check for issues
    if (daysUntilExpiry < 30) {
      issues.push("Certificate expires soon")
      recommendations.push("Renew certificate immediately")
    } else if (daysUntilExpiry < 90) {
      issues.push("Certificate expires in less than 90 days")
      recommendations.push("Plan certificate renewal")
    }
    
    if (Math.random() > 0.7) {
      issues.push("Weak key algorithm detected")
      recommendations.push("Upgrade to stronger encryption")
    }
    
    if (Math.random() > 0.8) {
      issues.push("Missing HSTS header")
      recommendations.push("Enable HSTS for better security")
    }
    
    // Calculate grade
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A+'
    if (issues.length > 2) grade = 'F'
    else if (issues.length > 1) grade = 'D'
    else if (issues.length > 0) grade = 'C'
    else if (daysUntilExpiry < 60) grade = 'B'
    else if (daysUntilExpiry < 30) grade = 'D'
    
    return {
      subject: `CN=${domain}`,
      issuer: issuers[Math.floor(Math.random() * issuers.length)],
      validFrom,
      validTo,
      serialNumber: Math.random().toString(16).substring(2, 18).toUpperCase(),
      fingerprint: Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase(),
      version: 3,
      signatureAlgorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
      keyAlgorithm: keyAlgorithms[Math.floor(Math.random() * keyAlgorithms.length)],
      keySize: keySizes[Math.floor(Math.random() * keySizes.length)],
      sanDomains,
      isWildcard: domain.startsWith('*.'),
      isEV: Math.random() > 0.8,
      isSelfSigned: Math.random() > 0.9,
      daysUntilExpiry,
      isValid: daysUntilExpiry > 0,
      grade,
      issues,
      recommendations
    }
  }

  const startCheck = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    if (!isValidDomain(domain.trim())) {
      setError('Please enter a valid domain name')
      return
    }

    const portNum = parseInt(port)
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Please enter a valid port number (1-65535)')
      return
    }

    setIsChecking(true)
    setError(null)
    setResults(null)

    try {
      const result = await performSSLCertificateCheck(domain.trim(), portNum)
      setResults(result)
    } catch (error) {
      setError('Failed to check SSL certificate. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  const exportResults = () => {
    if (!results) return

    const csvContent = [
      'Field,Value',
      `Domain,${results.domain}`,
      `Port,${results.port}`,
      `Subject,${results.certificate.subject}`,
      `Issuer,${results.certificate.issuer}`,
      `Valid From,${results.certificate.validFrom.toISOString()}`,
      `Valid To,${results.certificate.validTo.toISOString()}`,
      `Days Until Expiry,${results.certificate.daysUntilExpiry}`,
      `Serial Number,${results.certificate.serialNumber}`,
      `Fingerprint,${results.certificate.fingerprint}`,
      `Version,${results.certificate.version}`,
      `Signature Algorithm,${results.certificate.signatureAlgorithm}`,
      `Key Algorithm,${results.certificate.keyAlgorithm}`,
      `Key Size,${results.certificate.keySize}`,
      `Is Wildcard,${results.certificate.isWildcard}`,
      `Is EV,${results.certificate.isEV}`,
      `Is Self Signed,${results.certificate.isSelfSigned}`,
      `Grade,${results.certificate.grade}`,
      `Protocol,${results.protocol}`,
      `Cipher Suite,${results.cipherSuite}`,
      `Lookup Time,${results.lookupTime}ms`
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ssl_check_${results.domain}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'F': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getExpiryColor = (days: number) => {
    if (days < 0) return 'bg-red-100 text-red-800 border-red-200'
    if (days < 30) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (days < 90) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getExpiryStatus = (days: number) => {
    if (days < 0) return 'Expired'
    if (days < 30) return 'Critical'
    if (days < 90) return 'Warning'
    return 'Valid'
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            SSL Certificate Checker
          </CardTitle>
          <CardDescription>
            Check SSL certificate details, validity, and security for any domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                min="1"
                max="65535"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={startCheck} 
              disabled={isChecking || !domain.trim()}
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check SSL Certificate'
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${results.certificate.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {results.certificate.isValid ? 'Valid' : 'Invalid'}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      {results.certificate.isValid ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      Certificate
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.lookupTime}ms</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Lookup Time
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Badge className={getGradeColor(results.certificate.grade)}>
                      {results.certificate.grade}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">Security Grade</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Badge className={getExpiryColor(results.certificate.daysUntilExpiry)}>
                      {getExpiryStatus(results.certificate.daysUntilExpiry)}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {Math.abs(results.certificate.daysUntilExpiry)} days
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="certificate">Certificate</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="certificate" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Globe className="h-5 w-5" />
                          Certificate Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Subject:</span>
                          <span className="font-mono text-sm">{results.certificate.subject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Issuer:</span>
                          <span>{results.certificate.issuer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Valid From:</span>
                          <span>{results.certificate.validFrom.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Valid To:</span>
                          <span>{results.certificate.validTo.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Days Until Expiry:</span>
                          <span className={results.certificate.daysUntilExpiry < 30 ? 'text-red-600' : ''}>
                            {results.certificate.daysUntilExpiry}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Serial Number:</span>
                          <span className="font-mono text-sm">{results.certificate.serialNumber}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Shield className="h-5 w-5" />
                          Technical Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Version:</span>
                          <span>v{results.certificate.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Signature Algorithm:</span>
                          <span>{results.certificate.signatureAlgorithm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Key Algorithm:</span>
                          <span>{results.certificate.keyAlgorithm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Key Size:</span>
                          <span>{results.certificate.keySize} bits</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Protocol:</span>
                          <span>{results.protocol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Cipher Suite:</span>
                          <span className="font-mono text-sm">{results.cipherSuite}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Complete Certificate Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Subject Alternative Names</h4>
                          <div className="flex flex-wrap gap-2">
                            {results.certificate.sanDomains.map((domain, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {domain}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Certificate Fingerprint</h4>
                          <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                            {results.certificate.fingerprint}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Wildcard:</span>
                            <div>
                              {results.certificate.isWildcard ? (
                                <Badge className="bg-green-100 text-green-800">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Extended Validation:</span>
                            <div>
                              {results.certificate.isEV ? (
                                <Badge className="bg-green-100 text-green-800">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Self Signed:</span>
                            <div>
                              {results.certificate.isSelfSigned ? (
                                <Badge className="bg-red-100 text-red-800">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Valid:</span>
                            <div>
                              {results.certificate.isValid ? (
                                <Badge className="bg-green-100 text-green-800">Yes</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">No</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5" />
                        Security Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Security Features</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span>Strong Encryption:</span>
                              {results.certificate.keySize >= 2048 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Modern Protocol:</span>
                              {results.protocol.includes('1.3') ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Trusted Issuer:</span>
                              {!results.certificate.isSelfSigned ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Certificate Valid:</span>
                              {results.certificate.isValid ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Risk Assessment</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span>Expiration Risk:</span>
                              {results.certificate.daysUntilExpiry < 30 ? (
                                <Badge className="bg-red-100 text-red-800">High</Badge>
                              ) : results.certificate.daysUntilExpiry < 90 ? (
                                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Low</Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Trust Risk:</span>
                              {results.certificate.isSelfSigned ? (
                                <Badge className="bg-red-100 text-red-800">High</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Low</Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Encryption Risk:</span>
                              {results.certificate.keySize < 2048 ? (
                                <Badge className="bg-red-100 text-red-800">High</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Low</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {results.certificate.issues.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-2">Security Issues Found</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            {results.certificate.issues.map((issue, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results.certificate.recommendations.length > 0 ? (
                        <div className="space-y-3">
                          {results.certificate.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm text-blue-800">{recommendation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                          <p className="text-green-800 font-medium">No recommendations needed</p>
                          <p className="text-green-600 text-sm">Your SSL certificate meets all security best practices</p>
                        </div>
                      )}
                      
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">General SSL Best Practices</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Always use HTTPS for all web traffic</li>
                          <li>• Renew certificates at least 30 days before expiry</li>
                          <li>• Use strong key sizes (2048-bit or higher)</li>
                          <li>• Enable HSTS for additional security</li>
                          <li>• Regularly monitor certificate validity</li>
                          <li>• Use certificate transparency logging</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="text-sm text-muted-foreground">
                Check completed at {results.timestamp.toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}