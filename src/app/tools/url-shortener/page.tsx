'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Link2, 
  Copy, 
  ExternalLink, 
  BarChart2, 
  Calendar,
  Settings,
  Trash2,
  Share2
} from 'lucide-react'

interface ShortenedURL {
  id: string
  originalUrl: string
  shortUrl: string
  shortCode: string
  createdAt: Date
  expiresAt?: Date
  clicks: number
  customDomain?: string
  password?: string
  description?: string
  tags: string[]
}

interface URLShortenerStats {
  totalUrls: number
  totalClicks: number
  averageClicks: number
  mostPopular: ShortenedURL | null
}

export default function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [expiryDays, setExpiryDays] = useState('')
  const [password, setPassword] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [isShortening, setIsShortening] = useState(false)
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('create')

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const shortenUrl = async (): Promise<ShortenedURL> => {
    if (!originalUrl.trim()) {
      throw new Error('Please enter a URL to shorten')
    }

    if (!isValidUrl(originalUrl.trim())) {
      throw new Error('Please enter a valid URL')
    }

    const shortCode = customCode.trim() || generateShortCode()
    const baseUrl = customDomain.trim() || 'https://short.ly'
    const shortUrl = `${baseUrl}/${shortCode}`
    
    const expiryDaysNum = parseInt(expiryDays)
    const expiresAt = expiryDaysNum > 0 
      ? new Date(Date.now() + expiryDaysNum * 24 * 60 * 60 * 1000)
      : undefined

    const newUrl: ShortenedURL = {
      id: Math.random().toString(36).substr(2, 9),
      originalUrl: originalUrl.trim(),
      shortUrl,
      shortCode,
      createdAt: new Date(),
      expiresAt,
      clicks: Math.floor(Math.random() * 100), // Simulated clicks
      customDomain: customDomain.trim() || undefined,
      password: password.trim() || undefined,
      description: description.trim() || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    return newUrl
  }

  const handleShorten = async () => {
    setIsShortening(true)
    setError(null)

    try {
      const shortenedUrl = await shortenUrl()
      setShortenedUrls(prev => [shortenedUrl, ...prev])
      setOriginalUrl('')
      setCustomCode('')
      setDescription('')
      setTags('')
      setExpiryDays('')
      setPassword('')
      setCustomDomain('')
      setActiveTab('manage')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to shorten URL')
    } finally {
      setIsShortening(false)
    }
  }

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const deleteUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id))
  }

  const getStats = (): URLShortenerStats => {
    const totalUrls = shortenedUrls.length
    const totalClicks = shortenedUrls.reduce((sum, url) => sum + url.clicks, 0)
    const averageClicks = totalUrls > 0 ? totalClicks / totalUrls : 0
    const mostPopular = shortenedUrls.length > 0 
      ? shortenedUrls.reduce((prev, current) => prev.clicks > current.clicks ? prev : current)
      : null

    return { totalUrls, totalClicks, averageClicks, mostPopular }
  }

  const exportUrls = () => {
    if (shortenedUrls.length === 0) return

    const csvContent = [
      'Original URL,Short URL,Short Code,Created At,Expires At,Clicks,Description,Tags',
      ...shortenedUrls.map(url => 
        `"${url.originalUrl}","${url.shortUrl}","${url.shortCode}","${url.createdAt.toISOString()}","${url.expiresAt?.toISOString() || ''}",${url.clicks},"${url.description || ''}","${url.tags.join(', ')}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shortened_urls_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = getStats()
  const isExpired = (url: ShortenedURL) => url.expiresAt && url.expiresAt < new Date()
  const isExpiringSoon = (url: ShortenedURL) => url.expiresAt && url.expiresAt < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            URL Shortener
          </CardTitle>
          <CardDescription>
            Create short, memorable URLs with tracking and customization options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="create">Create Short URL</TabsTrigger>
              <TabsTrigger value="manage">Manage URLs</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="originalUrl">Original URL</Label>
                  <Input
                    id="originalUrl"
                    placeholder="https://example.com/very/long/url/that/needs/to/be/shortened"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customCode">Custom Code (Optional)</Label>
                    <Input
                      id="customCode"
                      placeholder="my-custom-code"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">Expires In (Days, Optional)</Label>
                    <Input
                      id="expiryDays"
                      type="number"
                      min="1"
                      placeholder="30"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                    <Input
                      id="customDomain"
                      placeholder="https://mydomain.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password Protection (Optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the URL"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="marketing, campaign, social"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleShorten} 
                  disabled={isShortening || !originalUrl.trim()}
                  className="w-full"
                >
                  {isShortening ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Shortening URL...
                    </>
                  ) : (
                    'Shorten URL'
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Shortened URLs</h3>
                {shortenedUrls.length > 0 && (
                  <Button variant="outline" onClick={exportUrls}>
                    Export URLs
                  </Button>
                )}
              </div>

              {shortenedUrls.length === 0 ? (
                <div className="text-center py-8">
                  <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No shortened URLs yet</p>
                  <p className="text-sm text-muted-foreground">Create your first short URL to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shortenedUrls.map((url) => (
                    <Card key={url.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                {url.shortUrl}
                              </div>
                              {url.password && (
                                <Badge variant="outline" className="text-xs">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Protected
                                </Badge>
                              )}
                              {isExpired(url) && (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                              {isExpiringSoon(url) && !isExpired(url) && (
                                <Badge variant="outline" className="text-xs border-yellow-200 text-yellow-800">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              Original: {url.originalUrl}
                            </div>
                            
                            {url.description && (
                              <div className="text-sm">
                                {url.description}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BarChart2 className="h-3 w-3" />
                                {url.clicks} clicks
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created {url.createdAt.toLocaleDateString()}
                              </div>
                              {url.expiresAt && (
                                <div className="flex items-center gap-1">
                                  Expires {url.expiresAt.toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            
                            {url.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {url.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(url.shortUrl, url.id)}
                            >
                              {copiedId === url.id ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(url.originalUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUrl(url.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalUrls}</div>
                    <div className="text-sm text-muted-foreground">Total URLs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalClicks}</div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.averageClicks.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avg Clicks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {shortenedUrls.filter(url => isExpiringSoon(url)).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Expiring Soon</div>
                  </CardContent>
                </Card>
              </div>

              {stats.mostPopular && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Popular URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        {stats.mostPopular.shortUrl}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats.mostPopular.clicks} clicks
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created {stats.mostPopular.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">URL Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {shortenedUrls.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {shortenedUrls
                        .sort((a, b) => b.clicks - a.clicks)
                        .slice(0, 5)
                        .map((url, index) => (
                          <div key={url.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <span className="font-mono text-sm">{url.shortCode}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BarChart2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{url.clicks}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}