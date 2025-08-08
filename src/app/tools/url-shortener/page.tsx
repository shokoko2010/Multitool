'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, ExternalLink, BarChart3, Clock, QrCode, Link } from 'lucide-react'

interface ShortenedUrl {
  shortUrl: string
  longUrl: string
  clicks: number
  createdAt: string
  qrCode?: string
}

export default function URLShortener() {
  const [longUrl, setLongUrl] = useState('')
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])
  const [customAlias, setCustomAlias] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const generateShortUrl = () => {
    if (!longUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(longUrl)) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')

    // Simulate URL shortening (in a real app, this would call an API)
    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(2, 8)
      const alias = customAlias.trim() || randomId
      const shortUrl = `https://short.ly/${alias}`
      
      const newShortenedUrl: ShortenedUrl = {
        shortUrl,
        longUrl,
        clicks: 0,
        createdAt: new Date().toISOString()
      }

      setShortenedUrls([newShortenedUrl, ...shortenedUrls])
      setLongUrl('')
      setCustomAlias('')
      setIsLoading(false)
    }, 1000)
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const simulateClick = (index: number) => {
    const updatedUrls = [...shortenedUrls]
    updatedUrls[index].clicks += 1
    setShortenedUrls(updatedUrls)
  }

  const generateQRCode = (url: string) => {
    // In a real app, this would generate a QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const loadSampleUrls = () => {
    const sampleUrls: ShortenedUrl[] = [
      {
        shortUrl: 'https://short.ly/abc123',
        longUrl: 'https://www.example.com/very/long/url/that/needs/to/be/shortened',
        clicks: 42,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        shortUrl: 'https://short.ly/def456',
        longUrl: 'https://github.com/user/repository/blob/main/README.md',
        clicks: 18,
        createdAt: '2024-01-14T15:20:00Z'
      }
    ]
    setShortenedUrls(sampleUrls)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Shortener</h1>
        <p className="text-muted-foreground">
          Shorten long URLs and track their performance with analytics
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Shorten URL
            </CardTitle>
            <CardDescription>
              Enter a long URL to create a short, memorable link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Long URL</label>
              <Input
                type="url"
                placeholder="https://example.com/very/long/url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Alias (optional)</label>
              <Input
                placeholder="custom-alias"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for a random alias
              </p>
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button 
              onClick={generateShortUrl} 
              disabled={isLoading || !longUrl.trim()}
              className="w-full"
            >
              {isLoading ? 'Shortening...' : 'Shorten URL'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Links</CardTitle>
            <CardDescription>
              Your shortened URLs and their performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={loadSampleUrls}>
                Load Sample Data
              </Button>
            </div>

            {shortenedUrls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No shortened URLs yet</p>
                <p className="text-sm">Create your first short URL above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shortenedUrls.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.clicks} clicks</Badge>
                          <Badge variant="secondary">{formatDate(item.createdAt)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          {item.longUrl}
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {item.shortUrl}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(item.shortUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => simulateClick(index)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(item.longUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="qr" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="qr">
                          <QrCode className="h-4 w-4 mr-2" />
                          QR Code
                        </TabsTrigger>
                        <TabsTrigger value="stats">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Statistics
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="qr" className="mt-4">
                        <div className="text-center">
                          <img
                            src={generateQRCode(item.shortUrl)}
                            alt="QR Code"
                            className="mx-auto border rounded"
                            style={{ maxWidth: '200px' }}
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Scan to open URL
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="stats" className="mt-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">{item.clicks}</div>
                            <div className="text-sm text-muted-foreground">Total Clicks</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-primary">
                              {Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                            </div>
                            <div className="text-sm text-muted-foreground">Days Active</div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Analytics</h4>
                  <p className="text-sm text-muted-foreground">Track clicks and performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">QR Codes</h4>
                  <p className="text-sm text-muted-foreground">Generate QR codes for your links</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Custom Aliases</h4>
                  <p className="text-sm text-muted-foreground">Create memorable short links</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Copy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Easy Sharing</h4>
                  <p className="text-sm text-muted-foreground">One-click copy functionality</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}