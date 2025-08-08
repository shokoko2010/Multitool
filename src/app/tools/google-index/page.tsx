'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Search, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'

export default function GoogleIndexChecker() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const checkGoogleIndex = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate URL
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      
      // Simulate API call to check Google index status
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock results for demonstration
      const mockResults = {
        url: urlObj.href,
        googleIndexed: true,
        bingIndexed: true,
        yahooIndexed: false,
        duckduckgoIndexed: true,
        lastChecked: new Date().toISOString(),
        indexDate: '2024-01-15T10:30:00Z',
        cacheStatus: 'Available',
        canonicalUrl: urlObj.href,
        indexCount: 156,
        crawlErrors: [],
        sitemapStatus: 'Submitted',
        robotsTxtStatus: 'Found',
        lastCrawled: '2024-01-20T14:22:00Z',
        crawlFrequency: 'Daily',
        indexability: 'Fully Indexable',
        searchResults: {
          google: {
            position: 12,
            url: urlObj.href,
            title: 'Example Website - Welcome',
            description: 'A comprehensive platform offering 150+ online tools for developers...',
            lastUpdated: '2024-01-20'
          },
          bing: {
            position: 8,
            url: urlObj.href,
            title: 'Multi-Tool Platform - 150+ Online Tools',
            description: 'Free, fast, and secure online tools for developers and digital professionals...',
            lastUpdated: '2024-01-19'
          }
        },
        technicalDetails: {
          httpStatus: 200,
          contentLength: '45.2 KB',
          contentType: 'text/html',
          lastModified: '2024-01-20T14:20:00Z',
          redirectChain: [],
          canonicalTag: true,
          metaRobots: 'index, follow',
          noindexTags: false,
          schemaMarkup: true,
          openGraphTags: true,
          twitterCards: true
        }
      }

      setResults(mockResults)
    } catch (err) {
      setError('Failed to check Google index status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatIndexDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Google Index Checker
          </CardTitle>
          <CardDescription>
            Check if your website pages are indexed by Google and other search engines. 
            Get detailed information about index status and search visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter URL (e.g., example.com/page)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={checkGoogleIndex} disabled={loading}>
              {loading ? 'Checking...' : 'Check Index Status'}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engines">Search Engines</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="search">Search Results</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {results.googleIndexed ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {results.googleIndexed ? 'Indexed' : 'Not Indexed'}
                      </div>
                      <div className="text-sm text-muted-foreground">Google</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {results.bingIndexed ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {results.bingIndexed ? 'Indexed' : 'Not Indexed'}
                      </div>
                      <div className="text-sm text-muted-foreground">Bing</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {results.indexability === 'Fully Indexable' ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {results.indexability}
                      </div>
                      <div className="text-sm text-muted-foreground">Indexability</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {results.indexCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Pages Indexed</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Index Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Index Date</span>
                      <span className="font-medium">{formatIndexDate(results.indexDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cache Status</span>
                      <Badge variant={results.cacheStatus === 'Available' ? 'default' : 'destructive'}>
                        {results.cacheStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Canonical URL</span>
                      <span className="font-medium text-blue-600">{results.canonicalUrl}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Crawl Frequency</span>
                      <Badge variant="secondary">{results.crawlFrequency}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="engines" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Search Engine Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Google</span>
                        {results.googleIndexed ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Indexed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Indexed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bing</span>
                        {results.bingIndexed ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Indexed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Indexed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Yahoo</span>
                        {results.yahooIndexed ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Indexed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Indexed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">DuckDuckGo</span>
                        {results.duckduckgoIndexed ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Indexed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Indexed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SEO Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sitemap Status</span>
                        <Badge variant="default">{results.sitemapStatus}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">robots.txt Status</span>
                        <Badge variant="default">{results.robotsTxtStatus}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Crawl Errors</span>
                        <Badge variant={results.crawlErrors.length === 0 ? 'default' : 'destructive'}>
                          {results.crawlErrors.length} errors
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Crawled</span>
                        <span className="font-medium">
                          {new Date(results.lastCrawled).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">HTTP Status</span>
                          <span className="font-medium">{results.technicalDetails.httpStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Content Length</span>
                          <span className="font-medium">{results.technicalDetails.contentLength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Content Type</span>
                          <span className="font-medium">{results.technicalDetails.contentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Modified</span>
                          <span className="font-medium">
                            {new Date(results.technicalDetails.lastModified).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Canonical Tag</span>
                          <Badge variant={results.technicalDetails.canonicalTag ? 'default' : 'destructive'}>
                            {results.technicalDetails.canonicalTag ? 'Present' : 'Missing'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Meta Robots</span>
                          <span className="font-medium">{results.technicalDetails.metaRobots}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Noindex Tags</span>
                          <Badge variant={results.technicalDetails.noindexTags ? 'destructive' : 'default'}>
                            {results.technicalDetails.noindexTags ? 'Found' : 'Not Found'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Schema Markup</span>
                          <Badge variant={results.technicalDetails.schemaMarkup ? 'default' : 'destructive'}>
                            {results.technicalDetails.schemaMarkup ? 'Present' : 'Missing'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="search" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Search Engine Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.searchResults.google && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Google Search Results
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-600">Position: #{results.searchResults.google.position}</span>
                            <span className="text-xs text-gray-500">
                              Updated: {results.searchResults.google.lastUpdated}
                            </span>
                          </div>
                          <p className="font-medium text-sm mb-1">{results.searchResults.google.title}</p>
                          <p className="text-sm text-gray-600">{results.searchResults.google.description}</p>
                          <p className="text-xs text-blue-600 mt-2">{results.searchResults.google.url}</p>
                        </div>
                      </div>
                    )}
                    
                    {results.searchResults.bing && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Bing Search Results
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-600">Position: #{results.searchResults.bing.position}</span>
                            <span className="text-xs text-gray-500">
                              Updated: {results.searchResults.bing.lastUpdated}
                            </span>
                          </div>
                          <p className="font-medium text-sm mb-1">{results.searchResults.bing.title}</p>
                          <p className="text-sm text-gray-600">{results.searchResults.bing.description}</p>
                          <p className="text-xs text-blue-600 mt-2">{results.searchResults.bing.url}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}