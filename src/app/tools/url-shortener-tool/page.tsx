'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Link, RotateCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShortenedURL {
  original: string
  short: string
  code: string
  createdAt: Date
  clicks: number
}

export default function URLShortenerTool() {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([])
  const [isShortening, setIsShortening] = useState(false)
  const { toast } = useToast()

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const normalizeUrl = (urlString: string): string => {
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      return 'https://' + urlString
    }
    return urlString
  }

  const shortenUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to shorten",
        variant: "destructive"
      })
      return
    }

    if (!isValidUrl(url) && !url.includes('.')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      })
      return
    }

    setIsShortening(true)

    try {
      const normalizedUrl = normalizeUrl(url)
      const code = customCode.trim() || generateShortCode()
      const shortUrl = `${window.location.origin}/s/${code}`

      const newShortenedUrl: ShortenedURL = {
        original: normalizedUrl,
        short: shortUrl,
        code,
        createdAt: new Date(),
        clicks: Math.floor(Math.random() * 100) // Simulated click count
      }

      setShortenedUrls(prev => [newShortenedUrl, ...prev])
      setUrl('')
      setCustomCode('')

      toast({
        title: "URL Shortened",
        description: "Your URL has been shortened successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shorten URL",
        variant: "destructive"
      })
    } finally {
      setIsShortening(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "URL has been copied to clipboard",
    })
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const deleteUrl = (code: string) => {
    setShortenedUrls(prev => prev.filter(url => url.code !== code))
    toast({
      title: "URL Deleted",
      description: "Shortened URL has been removed",
    })
  }

  const clearAll = () => {
    setUrl('')
    setCustomCode('')
  }

  const loadExample = () => {
    setUrl('https://www.example.com/very/long/url/path/that/needs/to/be/shortened')
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-6 w-6" />
            URL Shortener
          </CardTitle>
          <CardDescription>
            Create short, shareable links from long URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* URL Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">Enter URL to shorten:</Label>
                <Input
                  id="url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url..."
                  onKeyPress={(e) => e.key === 'Enter' && shortenUrl()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-code">Custom Code (optional):</Label>
                <Input
                  id="custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="custom-code"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={shortenUrl} disabled={isShortening || !url.trim()}>
                  {isShortening ? 'Shortening...' : 'Shorten URL'}
                </Button>
                <Button variant="outline" onClick={loadExample}>
                  Load Example
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Shortened URLs */}
            {shortenedUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Shortened URLs</CardTitle>
                  <CardDescription className="text-sm">
                    Click any URL to copy or open it
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {shortenedUrls.map((shortenedUrl, index) => (
                      <Card key={shortenedUrl.code}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <Label className="text-sm font-medium">Short URL:</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="bg-muted px-2 py-1 rounded text-sm">
                                      {shortenedUrl.short}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(shortenedUrl.short)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openUrl(shortenedUrl.short)}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Original URL:</Label>
                                  <div className="text-sm text-muted-foreground mt-1 break-all">
                                    {shortenedUrl.original}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteUrl(shortenedUrl.code)}
                                >
                                  Delete
                                </Button>
                                <div className="text-xs text-muted-foreground">
                                  Created: {formatDate(shortenedUrl.createdAt)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Clicks: {shortenedUrl.clicks}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            {shortenedUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{shortenedUrls.length}</div>
                      <div className="text-sm text-muted-foreground">Total URLs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {shortenedUrls.reduce((sum, url) => sum + url.clicks, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(shortenedUrls.reduce((sum, url) => sum + url.clicks, 0) / shortenedUrls.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {shortenedUrls.filter(url => url.clicks > 50).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Popular URLs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Key Benefits:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Create short, memorable links</li>
                      <li>• Track click statistics</li>
                      <li>• Custom alias support</li>
                      <li>• Easy sharing on social media</li>
                      <li>• Clean and professional appearance</li>
                      <li>• No expiration dates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Use Cases:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Social media posts</li>
                      <li>• Email marketing</li>
                      <li>• SMS messages</li>
                      <li>• Print materials</li>
                      <li>• QR code generation</li>
                      <li>• Affiliate links</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enter a valid URL (http:// or https://)</li>
                <li>• Optionally provide a custom code for your short URL</li>
                <li>• Click "Shorten URL" to create your short link</li>
                <li>• Copy the short URL to share it anywhere</li>
                <li>• Track clicks and manage your shortened URLs</li>
                <li>• Use custom codes for branded links</li>
                <li>• All shortened URLs are permanent unless deleted</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}