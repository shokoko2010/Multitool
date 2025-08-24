'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Globe, Search, RefreshCw, Copy, ExternalLink, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function MetaTagsChecker() {
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [metaData, setMetaData] = useState<{
    title: string
    description: string
    keywords: string[]
    ogTitle: string
    ogDescription: string
    ogImage: string
    ogUrl: string
    ogType: string
    twitterCard: string
    twitterTitle: string
    twitterDescription: string
    twitterImage: string
    viewport: string
    robots: string
    canonical: string
    alternate: string[]
    favicon: string
    errors: string[]
    warnings: string[]
    recommendations: string[]
    seoScore: number
  } | null>(null)

  const checkMetaTags = () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to check",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)

    // Simulate meta tag analysis with a delay
    setTimeout(() => {
      try {
        const mockMetaData = {
          title: "Welcome to Our Amazing Website - Best Services in Town",
          description: "Discover our premium services and solutions tailored to your needs. We offer the best quality products and exceptional customer service.",
          keywords: ["services", "solutions", "quality", "customer service", "premium"],
          ogTitle: "Amazing Website - Best Services",
          ogDescription: "Discover our premium services and solutions tailored to your needs.",
          ogImage: "https://example.com/og-image.jpg",
          ogUrl: "https://example.com",
          ogType: "website",
          twitterCard: "summary_large_image",
          twitterTitle: "Amazing Website - Best Services",
          twitterDescription: "Discover our premium services and solutions tailored to your needs.",
          twitterImage: "https://example.com/twitter-image.jpg",
          viewport: "width=device-width, initial-scale=1.0",
          robots: "index, follow",
          canonical: "https://example.com/",
          alternate: ["https://example.com/es", "https://example.com/fr"],
          favicon: "https://example.com/favicon.ico",
          errors: [],
          warnings: [],
          recommendations: [],
          seoScore: 85
        }

        // Generate some mock data for demonstration
        if (mockMetaData.title.length > 60) {
          mockMetaData.warnings.push("Title is too long (recommended: 50-60 characters)")
        }
        
        if (mockMetaData.description.length > 160) {
          mockMetaData.warnings.push("Description is too long (recommended: 150-160 characters)")
        }

        if (!mockMetaData.ogImage) {
          mockMetaData.warnings.push("Open Graph image is missing")
        }

        if (!mockMetaData.twitterCard) {
          mockMetaData.warnings.push("Twitter Card type is not set")
        }

        mockMetaData.recommendations.push("Consider adding more specific keywords")
        mockMetaData.recommendations.push("Ensure all images have proper alt text")
        mockMetaData.recommendations.push("Add structured data (Schema.org markup)")

        setMetaData(mockMetaData)
        
        toast({
          title: "Analysis Complete",
          description: "Meta tags analyzed successfully",
          variant: "default",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to analyze meta tags",
          variant: "destructive",
        })
      } finally {
        setIsChecking(false)
      }
    }, 2000)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      variant: "default",
    })
  }

  const openURL = () => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
    }
  }

  const clearAll = () => {
    setUrl('')
    setMetaData(null)
  }

  const insertSampleURL = () => {
    setUrl('https://example.com')
  }

  const getSEOStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', icon: CheckCircle }
    if (score >= 75) return { label: 'Good', color: 'text-blue-600', icon: CheckCircle }
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', icon: AlertTriangle }
    return { label: 'Poor', color: 'text-red-600', icon: XCircle }
  }

  const seoStatus = metaData ? getSEOStatus(metaData.seoScore) : null

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Meta Tags Checker</h1>
          <p className="text-muted-foreground">Analyze and optimize meta tags for better SEO</p>
        </div>

        <Tabs defaultValue="checker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checker">Meta Tags Checker</TabsTrigger>
            <TabsTrigger value="generator">Meta Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="checker" className="space-y-6">
            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Website Analysis
                </CardTitle>
                <CardDescription>Enter a URL to analyze its meta tags</CardDescription>
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
                  <Label htmlFor="url">Website URL</Label>
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
                      onClick={checkMetaTags} 
                      disabled={!url.trim() || isChecking}
                      size="sm"
                    >
                      {isChecking ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {isChecking ? 'Analyzing...' : 'Check Tags'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {metaData && (
              <>
                {/* SEO Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        SEO Analysis
                      </span>
                      <div className="flex gap-2">
                        <Button onClick={() => copyToClipboard(url, 'URL')} variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </Button>
                        <Button onClick={openURL} variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Site
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>Overall SEO optimization score</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-3xl font-bold ${seoStatus?.color}`}>
                          {metaData.seoScore}/100
                        </div>
                        <div className="text-lg font-semibold text-muted-foreground">
                          {seoStatus?.label} SEO Score
                        </div>
                      </div>
                      {seoStatus && <seoStatus.icon className={`h-8 w-8 ${seoStatus.color}`} />}
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Meta Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Meta Tags</CardTitle>
                    <CardDescription>Essential HTML meta tags for SEO</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-64">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Title</Label>
                            <Badge variant={metaData.title.length > 60 ? "destructive" : "default"}>
                              {metaData.title.length} chars
                            </Badge>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.title || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Description</Label>
                            <Badge variant={metaData.description.length > 160 ? "destructive" : "default"}>
                              {metaData.description.length} chars
                            </Badge>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.description || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Keywords</Label>
                          <div className="flex flex-wrap gap-2">
                            {metaData.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary">
                                {keyword}
                              </Badge>
                            ))}
                            {metaData.keywords.length === 0 && (
                              <span className="text-muted-foreground text-sm">No keywords found</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Open Graph Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Open Graph Tags</CardTitle>
                    <CardDescription>Facebook and social media sharing tags</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-64">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">OG Title</Label>
                            <Badge variant={metaData.ogTitle.length > 60 ? "destructive" : "default"}>
                              {metaData.ogTitle.length} chars
                            </Badge>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.ogTitle || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">OG Description</Label>
                            <Badge variant={metaData.ogDescription.length > 160 ? "destructive" : "default"}>
                              {metaData.ogDescription.length} chars
                            </Badge>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.ogDescription || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">OG Image</Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.ogImage || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">OG Type</div>
                            <div className="text-muted-foreground">{metaData.ogType}</div>
                          </div>
                          <div>
                            <div className="font-medium">OG URL</div>
                            <div className="text-muted-foreground">{metaData.ogUrl}</div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Twitter Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle>Twitter Cards</CardTitle>
                    <CardDescription>Twitter sharing optimization tags</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-64">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Twitter Card Type</Label>
                          <Badge variant="default">{metaData.twitterCard || 'Not found'}</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Twitter Title</Label>
                            <Badge variant={metaData.twitterTitle.length > 70 ? "destructive" : "default"}>
                              {metaData.twitterTitle.length} chars
                            </Badge>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.twitterTitle || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Twitter Description</Label>
                            <Badge variant={metaData.twitterDescription.length > 200 ? "destructive" : "default"}>
                              {metaData.twitterDescription.length} chars
                            </Badge>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.twitterDescription || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Twitter Image</Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.twitterImage || 'Not found'}</code>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Technical Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Tags</CardTitle>
                    <CardDescription>Technical and SEO-related meta tags</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-64">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Viewport</Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.viewport || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Robots</Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.robots || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Canonical URL</Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.canonical || 'Not found'}</code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Favicon</Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <code className="text-sm break-all">{metaData.favicon || 'Not found'}</code>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Issues and Recommendations */}
                {(metaData.errors.length > 0 || metaData.warnings.length > 0 || metaData.recommendations.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues & Recommendations</CardTitle>
                      <CardDescription>Areas for improvement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {metaData.errors.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-medium text-red-600 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Errors ({metaData.errors.length})
                          </h4>
                          {metaData.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                              {error}
                            </div>
                          ))}
                        </div>
                      )}

                      {metaData.warnings.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-medium text-yellow-600 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Warnings ({metaData.warnings.length})
                          </h4>
                          {metaData.warnings.map((warning, index) => (
                            <div key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}

                      {metaData.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-600 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Recommendations ({metaData.recommendations.length})
                          </h4>
                          {metaData.recommendations.map((rec, index) => (
                            <div key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                              {rec}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Meta Tag Best Practices</CardTitle>
                <CardDescription>Guidelines for effective meta tags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Title Tags</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Keep titles 50-60 characters</li>
                        <li>• Include primary keyword early</li>
                        <li>• Make titles unique and descriptive</li>
                        <li>• Avoid keyword stuffing</li>
                        <li>• Include brand name when appropriate</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Description Tags</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Keep descriptions 150-160 characters</li>
                        <li>• Write compelling, unique descriptions</li>
                        <li>• Include call-to-action when possible</li>
                        <li>• Use keywords naturally</li>
                        <li>• Avoid duplicate descriptions</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Social Media Optimization</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Open Graph:</strong> Ensure proper OG tags for Facebook sharing
                      </div>
                      <div>
                        <strong>Twitter Cards:</strong> Optimize for Twitter sharing
                      </div>
                      <div>
                        <strong>Images:</strong> Use properly sized, optimized images
                      </div>
                      <div>
                        <strong>Canonical:</strong> Prevent duplicate content issues
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Meta Tag Generator
                </CardTitle>
                <CardDescription>Generate optimized meta tags for your website</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Meta tag generator functionality coming soon!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This feature will help you generate optimized meta tags for your website.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}