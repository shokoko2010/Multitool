'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ExternalLink, TrendingUp, TrendingDown, Minus, Globe, Mail, Link } from 'lucide-react'
import { toast } from 'sonner'

interface Backlink {
  url: string
  domain: string
  type: 'dofollow' | 'nofollow'
  anchorText: string
  firstSeen: string
  lastSeen: string
  status: 'active' | 'broken' | 'redirected'
  authority: number
  traffic: number
}

export default function BacklinkChecker() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')

  const checkBacklinks = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsChecking(true)
    try {
      // Simulate backlink checking process
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      // Mock backlinks data
      const mockBacklinks: Backlink[] = [
        {
          url: 'https://example-article.com/your-topic',
          domain: 'example-article.com',
          type: 'dofollow',
          anchorText: 'great resource',
          firstSeen: '2024-01-15',
          lastSeen: new Date().toISOString().split('T')[0],
          status: 'active',
          authority: Math.floor(Math.random() * 50) + 30,
          traffic: Math.floor(Math.random() * 10000) + 1000
        },
        {
          url: 'https://blog-site.com/guide-to-topic',
          domain: 'blog-site.com',
          type: 'dofollow',
          anchorText: 'comprehensive guide',
          firstSeen: '2024-02-20',
          lastSeen: new Date().toISOString().split('T')[0],
          status: 'active',
          authority: Math.floor(Math.random() * 40) + 20,
          traffic: Math.floor(Math.random() * 8000) + 800
        },
        {
          url: 'https://news-portal.com/latest-news',
          domain: 'news-portal.com',
          type: 'nofollow',
          anchorText: 'read more',
          firstSeen: '2024-03-10',
          lastSeen: new Date().toISOString().split('T')[0],
          status: 'active',
          authority: Math.floor(Math.random() * 60) + 40,
          traffic: Math.floor(Math.random() * 15000) + 2000
        },
        {
          url: 'https://forum-discussion.com/topic-thread',
          domain: 'forum-discussion.com',
          type: 'dofollow',
          anchorText: 'helpful information',
          firstSeen: '2024-01-05',
          lastSeen: new Date().toISOString().split('T')[0],
          status: 'redirected',
          authority: Math.floor(Math.random() * 30) + 15,
          traffic: Math.floor(Math.random() * 5000) + 500
        },
        {
          url: 'https://broken-link.com/page',
          domain: 'broken-link.com',
          type: 'dofollow',
          anchorText: 'useful content',
          firstSeen: '2024-02-01',
          lastSeen: '2024-02-15',
          status: 'broken',
          authority: Math.floor(Math.random() * 25) + 10,
          traffic: Math.floor(Math.random() * 3000) + 300
        },
        {
          url: 'https://authority-site.com/recommended-resources',
          domain: 'authority-site.com',
          type: 'dofollow',
          anchorText: 'recommended reading',
          firstSeen: '2023-12-10',
          lastSeen: new Date().toISOString().split('T')[0],
          status: 'active',
          authority: Math.floor(Math.random() * 70) + 50,
          traffic: Math.floor(Math.random() * 20000) + 5000
        }
      ]
      
      setBacklinks(mockBacklinks)
      toast.success('Backlinks checked successfully!')
    } catch (error) {
      toast.error('Failed to check backlinks')
    } finally {
      setIsChecking(false)
    }
  }

  const getAuthorityBadge = (authority: number) => {
    if (authority >= 70) return <Badge variant="secondary" className="bg-green-100 text-green-800">High</Badge>
    if (authority >= 40) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
    return <Badge variant="secondary" className="bg-red-100 text-red-800">Low</Badge>
  }

  const getTypeBadge = (type: string) => {
    return type === 'dofollow' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">Dofollow</Badge>
      : <Badge variant="outline">Nofollow</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
      case 'broken':
        return <Badge variant="destructive">Broken</Badge>
      case 'redirected':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Redirected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const filteredBacklinks = selectedTab === 'all' 
    ? backlinks 
    : backlinks.filter(link => {
        if (selectedTab === 'dofollow') return link.type === 'dofollow'
        if (selectedTab === 'nofollow') return link.type === 'nofollow'
        if (selectedTab === 'active') return link.status === 'active'
        if (selectedTab === 'broken') return link.status === 'broken'
        return true
      })

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backlink Checker</h1>
        <p className="text-muted-foreground">
          Analyze and monitor backlinks pointing to your website
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>Enter the website URL to check backlinks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={checkBacklinks}
                disabled={isChecking || !websiteUrl.trim()}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Backlinks'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backlink Analysis</CardTitle>
            <CardDescription>Overview of your backlink profile</CardDescription>
          </CardHeader>
          <CardContent>
            {isChecking ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Checking backlinks...</span>
              </div>
            ) : backlinks.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{backlinks.length}</div>
                    <div className="text-sm text-muted-foreground">Total Backlinks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {backlinks.filter(link => link.type === 'dofollow').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Dofollow</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {backlinks.filter(link => link.type === 'nofollow').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Nofollow</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {backlinks.filter(link => link.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {backlinks.filter(link => link.status === 'broken').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Broken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(backlinks.reduce((acc, link) => acc + link.authority, 0) / backlinks.length)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Authority</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No backlink analysis yet</p>
                <p className="text-sm mt-2">Enter a URL and click check to see backlink data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backlink Details</CardTitle>
            <CardDescription>Detailed information about each backlink</CardDescription>
          </CardHeader>
          <CardContent>
            {isChecking ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Checking backlinks...</span>
              </div>
            ) : backlinks.length > 0 ? (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All ({backlinks.length})</TabsTrigger>
                  <TabsTrigger value="dofollow">Dofollow ({backlinks.filter(l => l.type === 'dofollow').length})</TabsTrigger>
                  <TabsTrigger value="nofollow">Nofollow ({backlinks.filter(l => l.type === 'nofollow').length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({backlinks.filter(l => l.status === 'active').length})</TabsTrigger>
                  <TabsTrigger value="broken">Broken ({backlinks.filter(l => l.status === 'broken').length})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredBacklinks.map((backlink, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-sm truncate">{backlink.url}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">{backlink.domain}</span>
                              {getTypeBadge(backlink.type)}
                              {getStatusBadge(backlink.status)}
                              {getAuthorityBadge(backlink.authority)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Anchor: <span className="text-foreground font-medium">"{backlink.anchorText}"</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {backlink.traffic.toLocaleString()} visits/month
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                DA {backlink.authority}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button 
                            onClick={() => openUrl(backlink.url)}
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
                <p>No backlinks to display</p>
                <p className="text-sm mt-2">Enter a URL and click check to see backlink details</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backlink Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Healthy Profile</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mix of dofollow and nofollow links</li>
                  <li>• Links from authoritative domains</li>
                  <li>• Natural anchor text variation</li>
                  <li>• Regular link acquisition</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-yellow-600">⚠ Areas for Improvement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fix broken links promptly</li>
                  <li>• Diversify anchor text</li>
                  <li>• Get links from higher authority sites</li>
                  <li>• Monitor link quality regularly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}