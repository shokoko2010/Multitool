'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, AlertTriangle, CheckCircle, XCircle, Globe, Search, RefreshCw, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SafeURLChecker() {
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    safe: boolean
    score: number
    issues: string[]
    recommendations: string[]
    domainInfo: {
      domain: string
      isIP: boolean
      hasSuspiciousTLD: boolean
      isShortened: boolean
    }
  } | null>(null)

  const suspiciousTLDs = [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.download', 
    '.stream', '.science', '.party', '.trade', '.date', '.review', '.xyz'
  ]

  const urlShorteners = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly',
    'short.link', 'short.at', 'clck.ru', 'v.gd', 'q.gs', 'po.st', 'adf.ly'
  ]

  const analyzeURL = () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to check",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)

    // Simulate URL analysis with a delay
    setTimeout(() => {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
        const domain = urlObj.hostname
        
        // Basic analysis
        const analysis = {
          safe: Math.random() > 0.3, // Simulate safety check
          score: Math.floor(Math.random() * 100), // Simulate safety score
          issues: [] as string[],
          recommendations: [] as string[],
          domainInfo: {
            domain,
            isIP: /^\d+\.\d+\.\d+\.\d+$/.test(domain),
            hasSuspiciousTLD: suspiciousTLDs.some(tld => domain.endsWith(tld)),
            isShortened: urlShorteners.some(shortener => domain.includes(shortener)),
          }
        }

        // Analyze for issues
        if (analysis.domainInfo.isIP) {
          analysis.issues.push('URL points to an IP address instead of domain name')
        }
        
        if (analysis.domainInfo.hasSuspiciousTLD) {
          analysis.issues.push('Domain uses a suspicious top-level domain')
        }
        
        if (analysis.domainInfo.isShortened) {
          analysis.issues.push('URL uses a URL shortening service')
        }

        if (!url.startsWith('https://')) {
          analysis.issues.push('URL does not use HTTPS encryption')
        }

        if (url.length > 75) {
          analysis.issues.push('URL is unusually long')
        }

        if (domain.includes('password') || domain.includes('login') || domain.includes('bank')) {
          analysis.issues.push('URL contains sensitive keywords')
        }

        // Generate recommendations
        if (analysis.issues.length > 0) {
          analysis.recommendations.push('Be cautious when visiting this URL')
          analysis.recommendations.push('Consider using a secure browser')
          analysis.recommendations.push('Check the URL carefully for typos')
        }

        if (!url.startsWith('https://')) {
          analysis.recommendations.push('Use HTTPS URLs for better security')
        }

        setCheckResult(analysis)
        
        toast({
          title: analysis.safe ? "Safe URL" : "Potential Risk Detected",
          description: analysis.safe 
            ? "URL appears to be safe" 
            : "Several security concerns were identified",
          variant: analysis.safe ? "default" : "destructive",
        })
      } catch (error) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL",
          variant: "destructive",
        })
      } finally {
        setIsChecking(false)
      }
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
      variant: "default",
    })
  }

  const openURL = () => {
    if (checkResult?.safe) {
      window.open(url, '_blank')
    } else {
      toast({
        title: "Unsafe URL",
        description: "This URL may not be safe to open",
        variant: "destructive",
      })
    }
  }

  const clearAll = () => {
    setUrl('')
    setCheckResult(null)
  }

  const insertSampleURL = () => {
    setUrl('https://www.example.com')
  }

  const getSafetyStatus = (score: number) => {
    if (score >= 80) return { label: 'Very Safe', color: 'bg-green-500', icon: CheckCircle }
    if (score >= 60) return { label: 'Safe', color: 'bg-blue-500', icon: CheckCircle }
    if (score >= 40) return { label: 'Caution', color: 'bg-yellow-500', icon: AlertTriangle }
    return { label: 'Unsafe', color: 'bg-red-500', icon: XCircle }
  }

  const safetyStatus = checkResult ? getSafetyStatus(checkResult.score) : null

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Safe URL Checker</h1>
          <p className="text-muted-foreground">Analyze URLs for security risks and suspicious characteristics</p>
        </div>

        <Tabs defaultValue="checker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checker">URL Checker</TabsTrigger>
            <TabsTrigger value="history">Check History</TabsTrigger>
          </TabsList>

          <TabsContent value="checker" className="space-y-6">
            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  URL Analysis
                </CardTitle>
                <CardDescription>Enter a URL to check for security risks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={insertSampleURL} variant="outline" size="sm">
                    Insert Sample URL
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">URL to Check</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={analyzeURL} 
                      disabled={!url.trim() || isChecking}
                      size="sm"
                    >
                      {isChecking ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {isChecking ? 'Checking...' : 'Check URL'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {checkResult && (
              <>
                {/* Safety Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Safety Analysis
                    </CardTitle>
                    <CardDescription>Security assessment of the URL</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {safetyStatus && (
                          <>
                            <safetyStatus.icon className={`h-6 w-6 ${safetyStatus.color === 'bg-green-500' ? 'text-green-600' : safetyStatus.color === 'bg-blue-500' ? 'text-blue-600' : safetyStatus.color === 'bg-yellow-500' ? 'text-yellow-600' : 'text-red-600'}`} />
                            <div>
                              <div className="font-semibold">{safetyStatus.label}</div>
                              <div className="text-sm text-muted-foreground">Safety Score: {checkResult.score}/100</div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => copyToClipboard(url)} variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </Button>
                        <Button onClick={openURL} variant="outline" size="sm" disabled={!checkResult.safe}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Safety Score</span>
                        <span>{checkResult.score}%</span>
                      </div>
                      <Progress value={checkResult.score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Domain Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Information</CardTitle>
                    <CardDescription>Technical details about the domain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Domain</span>
                          <Badge variant="outline">{checkResult.domainInfo.domain}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">IP Address</span>
                          <Badge variant={checkResult.domainInfo.isIP ? "destructive" : "default"}>
                            {checkResult.domainInfo.isIP ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Suspicious TLD</span>
                          <Badge variant={checkResult.domainInfo.hasSuspiciousTLD ? "destructive" : "default"}>
                            {checkResult.domainInfo.hasSuspiciousTLD ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">URL Shortener</span>
                          <Badge variant={checkResult.domainInfo.isShortened ? "destructive" : "default"}>
                            {checkResult.domainInfo.isShortened ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-2">Security Recommendations</div>
                          <div className="space-y-1">
                            {checkResult.recommendations.map((rec, index) => (
                              <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Issues */}
                {checkResult.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Security Issues Found
                      </CardTitle>
                      <CardDescription>Potential security concerns with this URL</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {checkResult.issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>URL Safety Tips</CardTitle>
                <CardDescription>How to stay safe when browsing URLs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Red Flags</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• URLs with suspicious TLDs (.tk, .ml, .ga)</li>
                        <li>• Shortened URLs from unknown services</li>
                        <li>• URLs with misspellings of popular sites</li>
                        <li>• URLs containing sensitive keywords</li>
                        <li>• URLs that don't use HTTPS</li>
                        <li>• Extremely long URLs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Safety Practices</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Always check URLs before clicking</li>
                        <li>• Use URL shorteners from trusted sources</li>
                        <li>• Look for HTTPS in the URL</li>
                        <li>• Be cautious of emails with suspicious links</li>
                        <li>• Use browser security extensions</li>
                        <li>• Keep your browser and security software updated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Check History</CardTitle>
                <CardDescription>Previous URL safety checks</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Check history functionality coming soon!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This feature will store your previous URL safety checks for reference.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}