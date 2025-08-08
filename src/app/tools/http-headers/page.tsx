'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Globe, Shield, Server, Clock, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface HTTPHeaders {
  url: string
  status: number
  statusText: string
  headers: Record<string, string>
  responseTime: number
  contentType: string
  contentLength: number
  server: string
  location?: string
  security: {
    https: boolean
    strictTransportSecurity: boolean
    xFrameOptions: string
    xContentTypeOptions: string
    xXssProtection: string
    referrerPolicy: string
    contentSecurityPolicy?: string
  }
  caching: {
    cacheControl: string
    expires?: string
    lastModified?: string
  }
}

interface SecurityAnalysis {
  https: boolean
  hsts: boolean
  csp: boolean
  xfo: boolean
  xcto: boolean
  xxp: boolean
  referrerPolicy: boolean
  secureCookies: boolean
  totalScore: number
  recommendations: string[]
}

export default function HTTPHeadersTool() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [headersResult, setHeadersResult] = useState<HTTPHeaders | null>(null)
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('headers')
  const { toast } = useToast()

  const performHeadersCheck = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Basic URL validation
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    try {
      new URL(normalizedUrl)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    setError('')
    setHeadersResult(null)
    setSecurityAnalysis(null)

    try {
      // Simulate HTTP headers check - in a real app, this would fetch the actual headers
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock headers data for demonstration
      const mockResult: HTTPHeaders = {
        url: normalizedUrl,
        status: 200,
        statusText: 'OK',
        headers: {
          'Server': 'nginx/1.18.0',
          'Date': 'Wed, 15 Jan 2024 10:30:00 GMT',
          'Content-Type': 'text/html; charset=UTF-8',
          'Content-Length': '15876',
          'Connection': 'keep-alive',
          'X-Powered-By': 'PHP/7.4.33',
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Cache-Control': 'public, max-age=3600',
          'Last-Modified': 'Wed, 10 Jan 2024 14:22:00 GMT',
          'Expires': 'Wed, 15 Jan 2024 11:30:00 GMT',
          'Set-Cookie': 'session_id=abc123; Secure; HttpOnly; SameSite=Strict'
        },
        responseTime: 245,
        contentType: 'text/html',
        contentLength: 15876,
        server: 'nginx/1.18.0',
        location: undefined,
        security: {
          https: normalizedUrl.startsWith('https'),
          strictTransportSecurity: true,
          xFrameOptions: 'DENY',
          xContentTypeOptions: 'nosniff',
          xXssProtection: '1; mode=block',
          referrerPolicy: 'strict-origin-when-cross-origin',
          contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
        },
        caching: {
          cacheControl: 'public, max-age=3600',
          expires: 'Wed, 15 Jan 2024 11:30:00 GMT',
          lastModified: 'Wed, 10 Jan 2024 14:22:00 GMT'
        }
      }

      // Generate security analysis
      const analysis: SecurityAnalysis = {
        https: mockResult.security.https,
        hsts: mockResult.security.strictTransportSecurity,
        csp: !!mockResult.security.contentSecurityPolicy,
        xfo: !!mockResult.security.xFrameOptions,
        xcto: !!mockResult.security.xContentTypeOptions,
        xxp: !!mockResult.security.xXssProtection,
        referrerPolicy: !!mockResult.security.referrerPolicy,
        secureCookies: mockResult.headers['Set-Cookie']?.includes('Secure') || false,
        totalScore: 0,
        recommendations: []
      }

      // Calculate security score
      let score = 0
      if (analysis.https) score += 20
      if (analysis.hsts) score += 15
      if (analysis.csp) score += 15
      if (analysis.xfo) score += 10
      if (analysis.xcto) score += 10
      if (analysis.xxp) score += 10
      if (analysis.referrerPolicy) score += 10
      if (analysis.secureCookies) score += 10
      analysis.totalScore = score

      // Generate recommendations
      if (!analysis.https) analysis.recommendations.push('Implement HTTPS encryption')
      if (!analysis.hsts) analysis.recommendations.push('Enable Strict Transport Security (HSTS)')
      if (!analysis.csp) analysis.recommendations.push('Implement Content Security Policy (CSP)')
      if (!analysis.xfo) analysis.recommendations.push('Set X-Frame-Options to prevent clickjacking')
      if (!analysis.xcto) analysis.recommendations.push('Enable X-Content-Type-Options')
      if (!analysis.xxp) analysis.recommendations.push('Enable XSS Protection')
      if (!analysis.referrerPolicy) analysis.recommendations.push('Set Referrer Policy')
      if (!analysis.secureCookies) analysis.recommendations.push('Use Secure and HttpOnly flags for cookies')

      setHeadersResult(mockResult)
      setSecurityAnalysis(analysis)
    } catch (err) {
      setError('Failed to fetch HTTP headers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The header information has been copied to your clipboard.",
    })
  }

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (score >= 60) return { level: 'Good', color: 'bg-blue-100 text-blue-800' }
    if (score >= 40) return { level: 'Fair', color: 'bg-yellow-100 text-yellow-800' }
    return { level: 'Poor', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>HTTP Headers Lookup</span>
          </CardTitle>
          <CardDescription>
            Analyze HTTP headers, security headers, and server configuration for any website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performHeadersCheck()}
              />
            </div>
            <Button 
              onClick={performHeadersCheck} 
              disabled={loading}
              className="px-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Check Headers</span>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {headersResult && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="caching">Caching</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="headers" className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Response Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status Code</Label>
                    <p className="text-2xl font-bold">{headersResult.status}</p>
                    <Badge variant="outline">{headersResult.statusText}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Response Time</Label>
                    <p className="text-2xl font-bold">{headersResult.responseTime} ms</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Content Type</Label>
                    <p className="font-medium">{headersResult.contentType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Content Length</Label>
                    <p className="font-medium">{headersResult.contentLength.toLocaleString()} bytes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Server Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Server</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono">{headersResult.server}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(headersResult.server)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="font-mono text-sm">{headersResult.headers['Date']}</p>
                </div>
              </CardContent>
            </Card>

            {/* All Headers */}
            <Card>
              <CardHeader>
                <CardTitle>Complete HTTP Headers</CardTitle>
                <CardDescription>
                  All headers returned by the server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Object.entries(headersResult.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <code className="font-mono text-sm font-medium">{key}:</code>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm truncate max-w-xs">{value}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(`${key}: ${value}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(JSON.stringify(headersResult.headers, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Headers
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Browser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Headers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Strict Transport Security</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {headersResult.security.strictTransportSecurity ? (
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge variant="outline">Not Found</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.headers['Strict-Transport-Security'] || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">X-Frame-Options</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {headersResult.security.xFrameOptions ? (
                        <Badge className="bg-green-100 text-green-800">{headersResult.security.xFrameOptions}</Badge>
                      ) : (
                        <Badge variant="outline">Not Found</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.headers['X-Frame-Options'] || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">X-Content-Type-Options</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {headersResult.security.xContentTypeOptions ? (
                        <Badge className="bg-green-100 text-green-800">{headersResult.security.xContentTypeOptions}</Badge>
                      ) : (
                        <Badge variant="outline">Not Found</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.headers['X-Content-Type-Options'] || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">X-XSS-Protection</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {headersResult.security.xXssProtection ? (
                        <Badge className="bg-green-100 text-green-800">{headersResult.security.xXssProtection}</Badge>
                      ) : (
                        <Badge variant="outline">Not Found</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.headers['X-XSS-Protection'] || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Content Security Policy</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {headersResult.security.contentSecurityPolicy ? (
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge variant="outline">Not Found</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.headers['Content-Security-Policy'] || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Referrer Policy</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {headersResult.security.referrerPolicy ? (
                        <Badge className="bg-green-100 text-green-800">{headersResult.security.referrerPolicy}</Badge>
                      ) : (
                        <Badge variant="outline">Not Found</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.headers['Referrer-Policy'] || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caching" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Caching Headers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cache-Control</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {headersResult.caching.cacheControl}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(headersResult.caching.cacheControl)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {headersResult.caching.expires && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expires</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {headersResult.caching.expires}
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.caching.expires)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {headersResult.caching.lastModified && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last-Modified</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {headersResult.caching.lastModified}
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(headersResult.caching.lastModified)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getSecurityLevel(securityAnalysis?.totalScore || 0).color}`}>
                      {securityAnalysis?.totalScore || 0}/100
                    </div>
                    <Badge className={getSecurityLevel(securityAnalysis?.totalScore || 0).color}>
                      {getSecurityLevel(securityAnalysis?.totalScore || 0).level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Security Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>HTTPS:</span>
                        <span className={securityAnalysis?.https ? 'text-green-600' : 'text-red-600'}>
                          {securityAnalysis?.https ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>HSTS:</span>
                        <span className={securityAnalysis?.hsts ? 'text-green-600' : 'text-red-600'}>
                          {securityAnalysis?.hsts ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>CSP:</span>
                        <span className={securityAnalysis?.csp ? 'text-green-600' : 'text-red-600'}>
                          {securityAnalysis?.csp ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>X-Frame-Options:</span>
                        <span className={securityAnalysis?.xfo ? 'text-green-600' : 'text-red-600'}>
                          {securityAnalysis?.xfo ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {securityAnalysis?.recommendations.length ? (
                    <ul className="space-y-2 text-sm">
                      {securityAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <Shield className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-green-600">Excellent security configuration!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About HTTP Headers Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            HTTP headers contain important information about website configuration, security settings, 
            caching policies, and server details. Analyzing these headers helps identify security issues 
            and performance optimization opportunities.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Key Security Headers:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Strict-Transport-Security:</strong> Enforces HTTPS connections</li>
              <li>• <strong>Content-Security-Policy:</strong> Prevents XSS and data injection attacks</li>
              <li>• <strong>X-Frame-Options:</strong> Prevents clickjacking attacks</li>
              <li>• <strong>X-Content-Type-Options:</strong> Prevents MIME type sniffing</li>
              <li>• <strong>X-XSS-Protection:</strong> Enables browser XSS filtering</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Performance Headers:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Cache-Control:</strong> Controls browser caching behavior</li>
              <li>• <strong>Expires:</strong> Specifies when content expires</li>
              <li>• <strong>Last-Modified:</strong> Shows when content was last changed</li>
              <li>• <strong>ETag:</strong> Content identifier for caching validation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}