'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Shield, Calendar, CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SSLCertificate {
  domain: string
  issuer: string
  subject: string
  validFrom: string
  validTo: string
  serialNumber: string
  version: string
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  keySize: number
  fingerprint: string
  san: string[]
  status: 'valid' | 'expired' | 'expiring' | 'invalid' | 'self-signed'
  daysRemaining: number
  hasWeakSignature: boolean
  isTrusted: boolean
  vulnerabilities: string[]
}

interface SSLChain {
  certificate: SSLCertificate
  intermediates: SSLCertificate[]
  chainComplete: boolean
}

export default function SSLLookupTool() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [sslResult, setSslResult] = useState<SSLChain | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('lookup')
  const { toast } = useToast()

  const performSSLCheck = async () => {
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
    setSslResult(null)

    try {
      // Simulate SSL certificate lookup - in a real app, this would call an SSL API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock SSL certificate data for demonstration
      const mockCertificate: SSLCertificate = {
        domain,
        issuer: "Let's Encrypt",
        subject: 'CN=example.com',
        validFrom: '2024-01-15T00:00:00Z',
        validTo: '2024-04-15T23:59:59Z',
        serialNumber: '0x123456789ABCDEF',
        version: '3',
        signatureAlgorithm: 'SHA256WithRSAEncryption',
        publicKeyAlgorithm: 'RSA',
        keySize: 2048,
        fingerprint: 'SHA256:ABC123...DEF456',
        san: ['example.com', 'www.example.com', 'mail.example.com'],
        status: 'valid',
        daysRemaining: 75,
        hasWeakSignature: false,
        isTrusted: true,
        vulnerabilities: []
      }

      const mockIntermediate: SSLCertificate = {
        domain: 'Let\'s Encrypt',
        issuer: 'TrustID x3 Root CA',
        subject: 'CN=R3',
        validFrom: '2020-09-04T00:00:00Z',
        validTo: '2025-09-15T16:00:00Z',
        serialNumber: '0xDEF123...ABC456',
        version: '3',
        signatureAlgorithm: 'SHA256WithRSAEncryption',
        publicKeyAlgorithm: 'RSA',
        keySize: 2048,
        fingerprint: 'SHA256:XYZ789...ABC123',
        san: [],
        status: 'valid',
        daysRemaining: 580,
        hasWeakSignature: false,
        isTrusted: true,
        vulnerabilities: []
      }

      const mockResult: SSLChain = {
        certificate: mockCertificate,
        intermediates: [mockIntermediate],
        chainComplete: true
      }

      setSslResult(mockResult)
    } catch (err) {
      setError('Failed to check SSL certificate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />
      case 'expiring': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'invalid': return <XCircle className="h-4 w-4 text-red-500" />
      case 'self-signed': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'expiring': return 'bg-yellow-100 text-yellow-800'
      case 'invalid': return 'bg-red-100 text-red-800'
      case 'self-signed': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The information has been copied to your clipboard.",
    })
  }

  const checkSSLPort = async (domain: string) => {
    try {
      // In a real implementation, this would actually check the SSL port
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        mode: 'no-cors'
      })
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>SSL Certificate Lookup</span>
          </CardTitle>
          <CardDescription>
            Check SSL/TLS certificate details, validity, security, and chain information for any domain.
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
                onKeyPress={(e) => e.key === 'Enter' && performSSLCheck()}
              />
            </div>
            <Button 
              onClick={performSSLCheck} 
              disabled={loading}
              className="px-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Check SSL</span>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {sslResult && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Certificate</TabsTrigger>
            <TabsTrigger value="chain">Chain</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(sslResult.certificate.status)}
                  <span>SSL Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={getStatusColor(sslResult.certificate.status)}>
                      {sslResult.certificate.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Days Remaining</Label>
                    <p className="text-2xl font-bold">{sslResult.certificate.daysRemaining}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Key Size</Label>
                    <p className="font-medium">{sslResult.certificate.keySize}-bit</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Chain Complete</Label>
                    <p className="font-medium">{sslResult.chainComplete ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Domain</Label>
                    <p className="font-medium">{sslResult.certificate.domain}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Issuer</Label>
                    <p>{sslResult.certificate.issuer}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                    <p className="font-mono text-sm">{sslResult.certificate.subject}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Signature Algorithm</Label>
                    <p className="font-mono text-sm">{sslResult.certificate.signatureAlgorithm}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Validity Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Issued On</Label>
                    <p className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(sslResult.certificate.validFrom).toLocaleDateString()}</span>
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expires On</Label>
                    <p className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(sslResult.certificate.validTo).toLocaleDateString()}</span>
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Serial Number</Label>
                    <p className="font-mono text-xs">{sslResult.certificate.serialNumber}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Alternative Names */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Alternative Names</CardTitle>
                <CardDescription>
                  All domains covered by this SSL certificate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sslResult.certificate.san.map((name, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-mono text-sm">{name}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(name)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Version</Label>
                      <p className="font-mono">{sslResult.certificate.version}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Public Key Algorithm</Label>
                      <p className="font-mono">{sslResult.certificate.publicKeyAlgorithm}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Key Size</Label>
                      <p>{sslResult.certificate.keySize}-bit RSA</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">SHA-1 Fingerprint</Label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                          {sslResult.certificate.fingerprint}
                        </code>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(sslResult.certificate.fingerprint)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Trust Status</Label>
                      <Badge variant={sslResult.certificate.isTrusted ? "default" : "destructive"}>
                        {sslResult.certificate.isTrusted ? 'Trusted' : 'Not Trusted'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(sslResult.certificate, null, 2))}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Full Certificate
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Download PEM
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Chain</CardTitle>
                <CardDescription>
                  The complete certificate chain including root, intermediate, and end-entity certificates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={sslResult.chainComplete ? "default" : "destructive"}>
                    {sslResult.chainComplete ? 'Chain Complete' : 'Chain Incomplete'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {sslResult.intermediates.length} intermediate certificates
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* End Entity Certificate */}
                  <div className="border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-800">End Entity Certificate</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {sslResult.certificate.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sslResult.certificate.domain} • Issued by {sslResult.certificate.issuer}
                    </p>
                  </div>
                  
                  {/* Intermediate Certificates */}
                  {sslResult.intermediates.map((intermediate, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Intermediate Certificate</h4>
                        <Badge variant="outline">
                          Valid
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {intermediate.subject} • Issued by {intermediate.issuer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Overall Security</Label>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-800">
                        GOOD
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Key Strength</Label>
                    <p className="font-medium">{sslResult.certificate.keySize}-bit RSA</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Signature Algorithm</Label>
                    <p className="font-mono text-sm">{sslResult.certificate.signatureAlgorithm}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Weak Signature</Label>
                    <Badge variant={sslResult.certificate.hasWeakSignature ? "destructive" : "default"}>
                      {sslResult.certificate.hasWeakSignature ? 'Detected' : 'None'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  {sslResult.certificate.vulnerabilities.length > 0 ? (
                    <div className="space-y-2">
                      {sslResult.certificate.vulnerabilities.map((vuln, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{vuln}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <p className="text-green-600 font-medium">No vulnerabilities detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Best Practices</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Renew certificates before expiration (30+ days recommended)</li>
                    <li>• Use 2048-bit or stronger RSA keys</li>
                    <li>• Implement certificate transparency monitoring</li>
                    <li>• Use HSTS headers for enhanced security</li>
                    <li>• Regularly update SSL/TLS protocols</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Monitoring</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Set up expiration alerts</li>
                    <li>• Monitor certificate revocation status</li>
                    <li>• Check for weak cipher suites</li>
                    <li>• Verify chain completeness regularly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About SSL Certificate Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            SSL certificate lookup provides detailed information about website security certificates, 
            including validity, chain information, security assessment, and expiration monitoring.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Key Information Provided:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Certificate validity and expiration dates</li>
              <li>• Issuer and subject information</li>
              <li>• Public key strength and algorithm</li>
              <li>• Certificate chain completeness</li>
              <li>• Security vulnerabilities and best practices</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Why This Matters:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Security:</strong> Identifies weak or compromised certificates</li>
              <li>• <strong>Trust:</strong> Verifies certificate authority legitimacy</li>
              <li>• <strong>Compliance:</strong> Ensures SSL/TLS best practices</li>
              <li>• <strong>SEO:</strong> HTTPS is a Google ranking factor</li>
              <li>• <strong>User Experience:</strong> Prevents browser security warnings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}