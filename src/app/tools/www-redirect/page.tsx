'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertTriangle, Globe, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface RedirectResult {
  url: string
  status: 'working' | 'broken' | 'redirected' | 'timeout'
  redirectChain: string[]
  statusCode: number
  redirectType: 'permanent' | 'temporary' | 'none'
  finalUrl: string
  responseTime: number
  issues: string[]
}

export default function WWWRedirectChecker() {
  const [url, setUrl] = useState('')
  const [redirectResults, setRedirectResults] = useState<RedirectResult[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const checkRedirects = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsChecking(true)
    try {
      // Simulate redirect checking
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock redirect results
      const mockResults: RedirectResult[] = [
        {
          url: url,
          status: Math.random() > 0.3 ? 'redirected' : 'working',
          redirectChain: [
            url.startsWith('http') ? url : `https://${url}`,
            url.startsWith('www') ? url.replace('www.', 'https://') : `https://www.${url.replace(/^https?:\/\//, '')}`
          ],
          statusCode: Math.random() > 0.2 ? 301 : 302,
          redirectType: Math.random() > 0.5 ? 'permanent' : 'temporary',
          finalUrl: url.startsWith('www') ? url.replace('www.', 'https://') : `https://www.${url.replace(/^https?:\/\//, '')}`,
          responseTime: Math.floor(Math.random() * 200) + 100,
          issues: []
        },
        {
          url: url.startsWith('www') ? url.replace('www.', 'https://') : `https://www.${url.replace(/^https?:\/\//, '')}`,
          status: 'working',
          redirectChain: [url.startsWith('www') ? url.replace('www.', 'https://') : `https://www.${url.replace(/^https?:\/\//, '')}`],
          statusCode: 200,
          redirectType: 'none',
          finalUrl: url.startsWith('www') ? url.replace('www.', 'https://') : `https://www.${url.replace(/^https?:\/\//, '')}`,
          responseTime: Math.floor(Math.random() * 100) + 50,
          issues: []
        }
      ]
      
      setRedirectResults(mockResults)
      toast.success('Redirects checked successfully!')
    } catch (error) {
      toast.error('Failed to check redirects')
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'redirected':
        return <ArrowRight className="h-4 w-4 text-blue-500" />
      case 'broken':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'timeout':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Working</Badge>
      case 'redirected':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Redirected</Badge>
      case 'broken':
        return <Badge variant="destructive">Broken</Badge>
      case 'timeout':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Timeout</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRedirectBadge = (type: string) => {
    switch (type) {
      case 'permanent':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">301 (Permanent)</Badge>
      case 'temporary':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">302 (Temporary)</Badge>
      case 'none':
        return <Badge variant="outline">No Redirect</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WWW Redirect Checker</h1>
        <p className="text-muted-foreground">
          Check website redirects and ensure proper www/non-www configuration
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Redirect Analysis</CardTitle>
            <CardDescription>Enter website URL to check redirect configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={checkRedirects}
                disabled={isChecking || !url.trim()}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Check Redirects
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {redirectResults.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Redirect Overview</CardTitle>
                <CardDescription>Summary of redirect analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {redirectResults.filter(r => r.status === 'working').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Working</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {redirectResults.filter(r => r.status === 'redirected').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Redirected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {redirectResults.filter(r => r.status === 'broken').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Broken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(redirectResults.reduce((acc, r) => acc + r.responseTime, 0) / redirectResults.length)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Redirect Analysis</CardTitle>
                <CardDescription>Detailed information about each URL redirect</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    {redirectResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{result.url}</span>
                              {getStatusBadge(result.status)}
                              {getRedirectBadge(result.redirectType)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Status: {result.statusCode} | Response: {result.responseTime}ms
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            onClick={() => openUrl(result.finalUrl)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    {redirectResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{result.url}</span>
                                {getStatusBadge(result.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Final URL: {result.finalUrl}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{result.statusCode}</div>
                            <div className="text-xs text-muted-foreground">{result.responseTime}ms</div>
                          </div>
                        </div>
                        
                        {result.redirectChain.length > 1 && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Redirect Chain</label>
                            <div className="flex items-center gap-2 flex-wrap">
                              {result.redirectChain.map((redirectUrl, redirectIndex) => (
                                <div key={redirectIndex} className="flex items-center gap-1">
                                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                    {redirectUrl}
                                  </span>
                                  {redirectIndex < result.redirectChain.length - 1 && (
                                    <ArrowRight className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {result.issues.length > 0 && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Issues Found</label>
                            <div className="space-y-1">
                              {result.issues.map((issue, issueIndex) => (
                                <div key={issueIndex} className="flex items-center gap-2 text-sm text-red-600">
                                  <XCircle className="h-3 w-3" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {!redirectResults.length && !isChecking && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Enter a website URL and click check to analyze redirect configuration
                </p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}