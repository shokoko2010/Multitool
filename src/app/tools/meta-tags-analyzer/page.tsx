'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ExternalLink, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

interface MetaTag {
  name: string
  content: string
  type: 'basic' | 'og' | 'twitter' | 'other'
  status: 'good' | 'warning' | 'error' | 'missing'
  recommendation?: string
}

export default function MetaTagsAnalyzer() {
  const [url, setUrl] = useState('')
  const [metaTags, setMetaTags] = useState<MetaTag[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState({
    totalTags: 0,
    goodTags: 0,
    warningTags: 0,
    errorTags: 0,
    missingTags: 0,
    score: 0
  })

  const analyzeMetaTags = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulate analysis process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock meta tags for demonstration
      const mockTags: MetaTag[] = [
        {
          name: 'title',
          content: 'Welcome to Example Website',
          type: 'basic',
          status: 'good',
          recommendation: 'Good length and descriptive'
        },
        {
          name: 'description',
          content: 'This is a brief description of the website content.',
          type: 'basic',
          status: 'warning',
          recommendation: 'Description should be between 150-160 characters'
        },
        {
          name: 'keywords',
          content: 'example, website, demo',
          type: 'basic',
          status: 'warning',
          recommendation: 'Keywords are less important for SEO now'
        },
        {
          name: 'author',
          content: 'John Doe',
          type: 'basic',
          status: 'good'
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0',
          type: 'basic',
          status: 'good'
        },
        {
          name: 'robots',
          content: 'index,follow',
          type: 'basic',
          status: 'good'
        },
        {
          name: 'og:title',
          content: 'Welcome to Example Website',
          type: 'og',
          status: 'good'
        },
        {
          name: 'og:description',
          content: 'This is a brief description of the website content.',
          type: 'og',
          status: 'warning'
        },
        {
          name: 'og:type',
          content: 'website',
          type: 'og',
          status: 'good'
        },
        {
          name: 'og:url',
          content: 'https://example.com',
          type: 'og',
          status: 'good'
        },
        {
          name: 'twitter:card',
          content: 'summary',
          type: 'twitter',
          status: 'good'
        },
        {
          name: 'twitter:title',
          content: 'Welcome to Example Website',
          type: 'twitter',
          status: 'good'
        },
        {
          name: 'twitter:description',
          content: 'This is a brief description of the website content.',
          type: 'twitter',
          status: 'warning'
        },
        {
          name: 'canonical',
          content: '',
          type: 'other',
          status: 'missing',
          recommendation: 'Add canonical URL to avoid duplicate content issues'
        }
      ]
      
      setMetaTags(mockTags)
      
      // Calculate analysis results
      const results = {
        totalTags: mockTags.length,
        goodTags: mockTags.filter(tag => tag.status === 'good').length,
        warningTags: mockTags.filter(tag => tag.status === 'warning').length,
        errorTags: mockTags.filter(tag => tag.status === 'error').length,
        missingTags: mockTags.filter(tag => tag.status === 'missing').length,
        score: Math.round((mockTags.filter(tag => tag.status === 'good').length / mockTags.length) * 100)
      }
      
      setAnalysisResults(results)
      toast.success('Meta tags analyzed successfully!')
    } catch (error) {
      toast.error('Failed to analyze meta tags')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Good</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const openUrl = () => {
    window.open(url, '_blank')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meta Tags Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze and optimize meta tags for better SEO and social media performance
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>Enter the URL of the website you want to analyze</CardDescription>
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
                onClick={analyzeMetaTags}
                disabled={isAnalyzing || !url.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
              <Button 
                onClick={openUrl}
                variant="outline"
                disabled={!url.trim()}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Overall analysis of the website's meta tags</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Analyzing meta tags...</span>
              </div>
            ) : metaTags.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysisResults.totalTags}</div>
                    <div className="text-sm text-muted-foreground">Total Tags</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysisResults.goodTags}</div>
                    <div className="text-sm text-muted-foreground">Good</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{analysisResults.warningTags}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analysisResults.errorTags}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analysisResults.missingTags}</div>
                    <div className="text-sm text-muted-foreground">Missing</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(analysisResults.score)}`}>
                      {analysisResults.score}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysisResults.score}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No analysis results yet</p>
                <p className="text-sm mt-2">Enter a URL and click analyze to see results</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meta Tags Details</CardTitle>
            <CardDescription>Detailed analysis of each meta tag</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Analyzing meta tags...</span>
              </div>
            ) : metaTags.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All ({metaTags.length})</TabsTrigger>
                  <TabsTrigger value="basic">Basic ({metaTags.filter(t => t.type === 'basic').length})</TabsTrigger>
                  <TabsTrigger value="og">Open Graph ({metaTags.filter(t => t.type === 'og').length})</TabsTrigger>
                  <TabsTrigger value="twitter">Twitter ({metaTags.filter(t => t.type === 'twitter').length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {metaTags.map((tag, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getStatusIcon(tag.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{tag.name}</span>
                              {getStatusBadge(tag.status)}
                            </div>
                            <div className="text-sm text-muted-foreground break-all">
                              {tag.content || '<empty>'}
                            </div>
                            {tag.recommendation && (
                              <div className="text-xs text-yellow-600 mt-1">
                                💡 {tag.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="basic" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {metaTags.filter(tag => tag.type === 'basic').map((tag, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getStatusIcon(tag.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{tag.name}</span>
                              {getStatusBadge(tag.status)}
                            </div>
                            <div className="text-sm text-muted-foreground break-all">
                              {tag.content || '<empty>'}
                            </div>
                            {tag.recommendation && (
                              <div className="text-xs text-yellow-600 mt-1">
                                💡 {tag.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="og" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {metaTags.filter(tag => tag.type === 'og').map((tag, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getStatusIcon(tag.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{tag.name}</span>
                              {getStatusBadge(tag.status)}
                            </div>
                            <div className="text-sm text-muted-foreground break-all">
                              {tag.content || '<empty>'}
                            </div>
                            {tag.recommendation && (
                              <div className="text-xs text-yellow-600 mt-1">
                                💡 {tag.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="twitter" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {metaTags.filter(tag => tag.type === 'twitter').map((tag, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getStatusIcon(tag.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{tag.name}</span>
                              {getStatusBadge(tag.status)}
                            </div>
                            <div className="text-sm text-muted-foreground break-all">
                              {tag.content || '<empty>'}
                            </div>
                            {tag.recommendation && (
                              <div className="text-xs text-yellow-600 mt-1">
                                💡 {tag.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No meta tags to analyze</p>
                <p className="text-sm mt-2">Enter a URL and click analyze to see detailed results</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep title under 60 characters</li>
                  <li>• Description should be 150-160 characters</li>
                  <li>• Use unique titles and descriptions</li>
                  <li>• Include relevant keywords naturally</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">💡 Optimization Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Add Open Graph tags for social sharing</li>
                  <li>• Include Twitter Card tags</li>
                  <li>• Use canonical URLs to avoid duplicates</li>
                  <li>• Ensure mobile optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}