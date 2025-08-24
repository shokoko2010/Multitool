'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Shield, 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lock,
  Unlock,
  Calendar,
  Fingerprint,
  Server,
  Wifi
} from 'lucide-react'

interface SSLCertificate {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  serialNumber: string
  fingerprint: string
  version: number
  signatureAlgorithm: string
  keyAlgorithm: string
  keyStrength: number
  sans: string[]
}

interface SSLSecurityInfo {
  domain: string
  isValid: boolean
  isValidHostname: boolean
  daysUntilExpiry: number
  isExpired: boolean
  isSelfSigned: boolean
  protocol: string
  cipherSuite: string
  certificate: SSLCertificate
  securityIssues: string[]
  recommendations: string[]
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
}

interface SecurityTest {
  name: string
  passed: boolean
  description: string
  importance: 'high' | 'medium' | 'low'
}

export default function SSLSecurityChecker() {
  const [domain, setDomain] = useState<string>('')
  const [securityInfo, setSecurityInfo] = useState<SSLSecurityInfo | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const checkSSL = async () => {
    if (!domain) return

    setIsLoading(true)
    
    try {
      // Simulate SSL check (in real implementation, this would make actual API calls)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock SSL security data
      const mockCert: SSLCertificate = {
        subject: `CN=${domain}`,
        issuer: 'CN=Let\'s Encrypt Authority X3, O=Let\'s Encrypt, C=US',
        validFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        serialNumber: '1234567890ABCDEF1234567890ABCDEF',
        fingerprint: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
        version: 3,
        signatureAlgorithm: 'SHA256-RSA',
        keyAlgorithm: 'RSA',
        keyStrength: 2048,
        sans: [domain, `www.${domain}`, `mail.${domain}`]
      }

      const daysUntilExpiry = Math.ceil(
        (new Date(mockCert.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const securityIssues: string[] = []
      const recommendations: string[] = []

      // Check for security issues
      if (mockCert.keyStrength < 2048) {
        securityIssues.push('Weak key strength detected')
        recommendations.push('Upgrade to at least 2048-bit RSA keys')
      }

      if (daysUntilExpiry < 30) {
        securityIssues.push('Certificate expiring soon')
        recommendations.push('Renew certificate before expiration')
      }

      if (daysUntilExpiry < 0) {
        securityIssues.push('Certificate has expired')
        recommendations.push('Renew certificate immediately')
      }

      // Determine grade
      let grade: SSLSecurityInfo['grade'] = 'A+'
      if (securityIssues.length > 0) grade = 'B'
      if (daysUntilExpiry < 30) grade = 'C'
      if (daysUntilExpiry < 0) grade = 'F'

      const securityInfo: SSLSecurityInfo = {
        domain,
        isValid: daysUntilExpiry > 0,
        isValidHostname: true,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        isSelfSigned: false,
        protocol: 'TLS 1.3',
        cipherSuite: 'TLS_AES_256_GCM_SHA384',
        certificate: mockCert,
        securityIssues,
        recommendations,
        grade
      }

      setSecurityInfo(securityInfo)
    } catch (error) {
      console.error('SSL check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100'
      case 'B':
        return 'text-blue-600 bg-blue-100'
      case 'C':
        return 'text-yellow-600 bg-yellow-100'
      case 'D':
        return 'text-orange-600 bg-orange-100'
      case 'F':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'B':
        return <Shield className="h-5 w-5 text-blue-500" />
      case 'C':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'D':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'F':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  const securityTests: SecurityTest[] = [
    {
      name: 'Certificate Validity',
      passed: securityInfo?.isValid || false,
      description: 'Certificate is valid and not expired',
      importance: 'high'
    },
    {
      name: 'Hostname Match',
      passed: securityInfo?.isValidHostname || false,
      description: 'Certificate matches the requested hostname',
      importance: 'high'
    },
    {
      name: 'Strong Encryption',
      passed: securityInfo?.protocol === 'TLS 1.3' || false,
      description: 'Uses modern TLS 1.3 protocol',
      importance: 'high'
    },
    {
      name: 'Key Strength',
      passed: (securityInfo?.certificate.keyStrength || 0) >= 2048,
      description: 'Certificate uses strong cryptographic keys',
      importance: 'medium'
    },
    {
      name: 'Not Self-Signed',
      passed: !securityInfo?.isSelfSigned,
      description: 'Certificate is issued by a trusted CA',
      importance: 'medium'
    }
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SSL/TLS Security Checker</h1>
        <p className="text-muted-foreground">
          Analyze SSL/TLS certificate security and configuration for any domain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Check
          </CardTitle>
          <CardDescription>
            Enter a domain name to check its SSL/TLS security configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1"
            />
            <Button onClick={checkSSL} disabled={isLoading || !domain}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Check SSL
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {securityInfo && (
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Security Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getGradeColor(securityInfo.grade)}`}>
                  {getGradeIcon(securityInfo.grade)}
                  <span className="text-2xl font-bold">{securityInfo.grade}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <div className="flex items-center gap-1">
                      {securityInfo.isValid ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span>{securityInfo.isValid ? 'Valid' : 'Invalid'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires in:</span>
                    <span className={securityInfo.daysUntilExpiry < 30 ? 'text-red-600' : ''}>
                      {securityInfo.daysUntilExpiry} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span>{securityInfo.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cipher:</span>
                    <span className="text-xs">{securityInfo.cipherSuite}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Security Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {test.passed ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> : 
                        <XCircle className="h-5 w-5 text-red-500" />
                      }
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">{test.description}</div>
                      </div>
                    </div>
                    <Badge variant={test.importance === 'high' ? 'destructive' : test.importance === 'medium' ? 'default' : 'secondary'}>
                      {test.importance}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {securityInfo && (
        <Tabs defaultValue="certificate" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="certificate">Certificate</TabsTrigger>
            <TabsTrigger value="security">Security Issues</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="details">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="certificate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <div className="text-sm text-muted-foreground">{securityInfo.certificate.subject}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Issuer</Label>
                      <div className="text-sm text-muted-foreground">{securityInfo.certificate.issuer}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Valid From</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(securityInfo.certificate.validFrom).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Valid To</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(securityInfo.certificate.validTo).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Serial Number</Label>
                      <div className="text-sm text-muted-foreground font-mono">
                        {securityInfo.certificate.serialNumber}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Signature Algorithm</Label>
                      <div className="text-sm text-muted-foreground">
                        {securityInfo.certificate.signatureAlgorithm}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Key Algorithm</Label>
                      <div className="text-sm text-muted-foreground">
                        {securityInfo.certificate.keyAlgorithm} ({securityInfo.certificate.keyStrength} bits)
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Subject Alternative Names</Label>
                      <div className="text-sm text-muted-foreground">
                        {securityInfo.certificate.sans.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {securityInfo.securityIssues.length > 0 ? (
                  <div className="space-y-3">
                    {securityInfo.securityIssues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-800">{issue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-green-600 font-medium">No security issues detected!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your SSL/TLS configuration appears to be secure.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityInfo.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">{recommendation}</div>
                      </div>
                    </div>
                  ))}
                  
                  {securityInfo.recommendations.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-green-600 font-medium">No additional recommendations needed</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your SSL/TLS configuration follows best practices.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="fingerprint">
                    <AccordionTrigger>Certificate Fingerprint</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                        {securityInfo.certificate.fingerprint}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="cipher">
                    <AccordionTrigger>Cipher Suite Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <div><strong>Protocol:</strong> {securityInfo.protocol}</div>
                        <div><strong>Cipher Suite:</strong> {securityInfo.cipherSuite}</div>
                        <div><strong>Key Exchange:</strong> ECDHE</div>
                        <div><strong>Authentication:</strong> RSA</div>
                        <div><strong>Bulk Cipher:</strong> AES_256_GCM</div>
                        <div><strong>Message Authentication:</strong> SHA384</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="chain">
                    <AccordionTrigger>Certificate Chain</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">End Entity Certificate</div>
                          <div className="text-sm text-muted-foreground">{securityInfo.certificate.subject}</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Intermediate Certificate</div>
                          <div className="text-sm text-muted-foreground">CN=Let's Encrypt Authority X3</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Root Certificate</div>
                          <div className="text-sm text-muted-foreground">CN=DST Root CA X3</div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>SSL/TLS Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Certificate Management</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use certificates from trusted CAs</li>
                <li>• Renew certificates before expiration</li>
                <li>• Monitor certificate expiry dates</li>
                <li>• Use strong cryptographic keys (2048+ bits)</li>
                <li>• Include all necessary domains in SAN</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Protocol Configuration</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use TLS 1.3 when possible</li>
                <li>• Disable SSLv2, SSLv3, TLS 1.0, TLS 1.1</li>
                <li>• Use strong cipher suites</li>
                <li>• Enable HSTS for web applications</li>
                <li>• Implement certificate transparency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}