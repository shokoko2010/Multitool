'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ExternalLink, Link, Unlink, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface LinkData {
  url: string
  status: 'working' | 'broken' | 'redirected'
  type: 'internal' | 'external' | 'email' | 'phone'
  anchorText: string
  statusCode?: number
  redirectUrl?: string
  lastChecked: string
}

export default function LinkAnalyzer() {
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState<LinkData[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')

  const analyzeLinks = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulate link analysis process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock link data
      const mockLinks: LinkData[] = [
        {
          url: 'https://example.com/page1',
          status: 'working',
          type: 'internal',
          anchorText: 'Read more about our services',
          statusCode: 200,
          lastChecked: new Date().toISOString().split('T')[0]
        },
        {
          url: 'https://external-site.com/guide',
          status: 'working',
          type: 'external',
          anchorText: 'external resource',
          statusCode: 200,
          lastChecked: new Date().toISOString().split('T')[0]
        },
        {
          url: 'https://broken-example.com/page',
          status: 'broken',
          type: 'external',
          anchorText: 'learn more',
          statusCode: 404,
          lastChecked: new Date().toISOString().split('T')[0]
        },
        {
          url: 'https://example.com/contact',
          status: 'redirected',
          type: 'internal',
          anchorText: 'contact us',
          statusCode: 301,
          redirectUrl: 'https://example.com/contact-page',
          lastChecked: new Date().toISOString().split('T')[0]
        },
        {
          url: 'mailto:support@example.com',
          status: 'working',
          type: 'email',
          anchorText: 'email support',
          lastChecked: new Date().toISOString().split('T')[0]
        },
        {
          url: 'tel:+1234567890',
          status: 'working',
          type: 'phone',
          anchorText: 'call us',
          lastChecked: new Date().toISOString().split('T')[0]
        }
      ]
      
      setLinks(mockLinks)
      toast.success('Links analyzed successfully!')
    } catch (error) {
      toast.error('Failed to analyze links')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'broken':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'redirected':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Working</Badge>
      case 'broken':
        return <Badge variant="destructive">Broken</Badge>
      case 'redirected':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Redirected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'internal':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Internal</Badge>
      case 'external':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">External</Badge>
      case 'email':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Email</Badge>
      case 'phone':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Phone</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const filteredLinks = selectedTab === 'all' 
    ? links 
    : links.filter(link => link.type === selectedTab)

  const getStats = () => {
    if (links.length === 0) return null
    
    return {
      total: links.length,
      working: links.filter(l => l.status === 'working').length,
      broken: links.filter(l => l.status === 'broken').length,
      redirected: links.filter(l => l.status === 'redirected').length,
      internal: links.filter(l => l.type === 'internal').length,
      external: links.filter(l => l.type === 'external').length,
      email: links.filter(l => l.type === 'email').length,
      phone: links.filter(l => l.type === 'phone').length
    }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Link Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze and audit links on your website for broken links and redirect issues
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>Enter the website URL to analyze links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={analyzeLinks}
                disabled={isAnalyzing || !url.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Analyze Links
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Link Statistics</CardTitle>
              <CardDescription>Overview of the analyzed links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.working}</div>
                  <div className="text-sm text-muted-foreground">Working</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.broken}</div>
                  <div className="text-sm text-muted-foreground">Broken</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.redirected}</div>
                  <div className="text-sm text-muted-foreground">Redirected</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.internal}</div>
                  <div className="text-xs text-muted-foreground">Internal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{stats.external}</div>
                  <div className="text-xs text-muted-foreground">External</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.email}</div>
                  <div className="text-xs text-muted-foreground">Email</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{stats.phone}</div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Link Details</CardTitle>
            <CardDescription>Detailed information about each link</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Analyzing links...</span>
              </div>
            ) : links.length > 0 ? (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All ({links.length})</TabsTrigger>
                  <TabsTrigger value="internal">Internal ({stats?.internal})</TabsTrigger>
                  <TabsTrigger value="external">External ({stats?.external})</TabsTrigger>
                  <TabsTrigger value="email">Email ({stats?.email})</TabsTrigger>
                  <TabsTrigger value="phone">Phone ({stats?.phone})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredLinks.map((link, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(link.status)}
                              <span className="font-medium text-sm truncate">{link.url}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(link.status)}
                              {getTypeBadge(link.type)}
                              {link.statusCode && (
                                <Badge variant="outline" className="text-xs">
                                  Status: {link.statusCode}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Anchor: <span className="text-foreground font-medium">"{link.anchorText}"</span>
                            </div>
                            {link.redirectUrl && (
                              <div className="text-xs text-blue-600 mt-1">
                                Redirects to: {link.redirectUrl}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button 
                            onClick={() => openUrl(link.url)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Unlink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No links to analyze</p>
                <p className="text-sm mt-2">Enter a website URL and click analyze to see link details</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link Health Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Healthy Links</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Internal links working properly</li>
                  <li>• External links accessible</li>
                  <li>• Email and phone links functional</li>
                  <li>• Redirects properly configured</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">⚠ Issues Found</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Broken links need fixing</li>
                  <li>• Redirect chains should be simplified</li>
                  <li>• External links should be monitored</li>
                  <li>• Link structure needs optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}