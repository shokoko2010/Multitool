'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Search, TrendingUp, BarChart3, Copy, Download, ExternalLink, Eye } from 'lucide-react'

export default function YouTubeKeywordsExtractor() {
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const extractKeywords = async () => {
    if (!videoUrl) {
      setError('Please enter a YouTube video URL')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      // Simulate API call for keyword extraction
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Mock results for demonstration
      const mockResults = {
        videoUrl: videoUrl,
        videoTitle: 'How to Master YouTube SEO in 2024 | Complete Guide',
        videoId: 'dQw4w9WgXcQ',
        extractedAt: new Date().toISOString(),
        keywords: [
          {
            keyword: 'youtube seo',
            volume: 245000,
            difficulty: 65,
            cpc: 1.25,
            trend: 'up',
            position: 1
          },
          {
            keyword: 'youtube optimization',
            volume: 180000,
            difficulty: 58,
            cpc: 0.95,
            trend: 'stable',
            position: 2
          },
          {
            keyword: 'video seo tips',
            volume: 156000,
            difficulty: 52,
            cpc: 0.85,
            trend: 'up',
            position: 3
          },
          {
            keyword: 'youtube ranking',
            volume: 134000,
            difficulty: 71,
            cpc: 1.45,
            trend: 'up',
            position: 4
          },
          {
            keyword: 'youtube keywords',
            volume: 98000,
            difficulty: 48,
            cpc: 0.75,
            trend: 'stable',
            position: 5
          },
          {
            keyword: 'video marketing',
            volume: 89000,
            difficulty: 63,
            cpc: 1.15,
            trend: 'up',
            position: 6
          },
          {
            keyword: 'youtube algorithm',
            volume: 76000,
            difficulty: 78,
            cpc: 1.85,
            trend: 'stable',
            position: 7
          },
          {
            keyword: 'content strategy',
            volume: 67000,
            difficulty: 55,
            cpc: 0.95,
            trend: 'up',
            position: 8
          },
          {
            keyword: 'video optimization',
            volume: 54000,
            difficulty: 47,
            cpc: 0.65,
            trend: 'stable',
            position: 9
          },
          {
            keyword: 'youtube analytics',
            volume: 43000,
            difficulty: 61,
            cpc: 1.05,
            trend: 'up',
            position: 10
          }
        ],
        suggestedKeywords: [
          'youtube seo tools',
          'video seo checklist',
          'youtube thumbnail optimization',
          'youtube description seo',
          'youtube tags generator',
          'video seo services',
          'youtube seo course',
          'video seo software',
          'youtube seo expert',
          'video seo company'
        ],
        videoStats: {
          views: '2.3M',
          likes: '45K',
          comments: '1.2K',
          publishDate: '2024-01-15',
          duration: '15:42'
        },
        seoAnalysis: {
          titleScore: 85,
          descriptionScore: 78,
          tagsScore: 72,
          overallScore: 78,
          recommendations: [
            'Add more specific keywords to the title',
            'Include long-tail keywords in description',
            'Optimize thumbnail text for SEO',
            'Add timestamps in description',
            'Use relevant hashtags in comments'
          ]
        }
      }

      setResults(mockResults)
    } catch (err) {
      setError('Failed to extract keywords. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadKeywords = (format: 'csv' | 'txt') => {
    if (!results) return

    if (format === 'csv') {
      const csvContent = [
        'Keyword,Volume,Difficulty,CPC,Trend,Position',
        ...results.keywords.map((kw: any) => 
          `${kw.keyword},${kw.volume},${kw.difficulty},${kw.cpc},${kw.trend},${kw.position}`
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'youtube-keywords.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      const txtContent = `YouTube Keywords for: ${results.videoTitle}\n\n` +
        results.keywords.map((kw: any) => 
          `${kw.keyword} (Volume: ${kw.volume.toLocaleString()}, Difficulty: ${kw.difficulty}, CPC: $${kw.cpc})`
        ).join('\n')

      const blob = new Blob([txtContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'youtube-keywords.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty <= 30) return <Badge variant="secondary">Easy</Badge>
    if (difficulty <= 60) return <Badge variant="default">Medium</Badge>
    return <Badge variant="destructive">Hard</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            YouTube Keywords Extractor
          </CardTitle>
          <CardDescription>
            Extract SEO keywords from any YouTube video. Analyze search volume, 
            difficulty, and competition. Get keyword suggestions and SEO insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={extractKeywords} disabled={loading}>
              {loading ? 'Extracting...' : 'Extract Keywords'}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <Tabs defaultValue="keywords" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="analysis">SEO Analysis</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="keywords" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{results.keywords.length}</div>
                      <div className="text-xs text-muted-foreground">Keywords Found</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {results.seoAnalysis.overallScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">SEO Score</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {results.videoStats.views}
                      </div>
                      <div className="text-xs text-muted-foreground">Video Views</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {results.videoStats.duration}
                      </div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extracted Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 mb-2 pb-2 border-b">
                        <div className="col-span-4">Keyword</div>
                        <div className="col-span-2 text-center">Volume</div>
                        <div className="col-span-2 text-center">Difficulty</div>
                        <div className="col-span-2 text-center">CPC</div>
                        <div className="col-span-1 text-center">Trend</div>
                        <div className="col-span-1 text-center">Actions</div>
                      </div>
                      <div className="divide-y">
                        {results.keywords.map((keyword: any, index: number) => (
                          <div key={index} className="grid grid-cols-12 gap-2 py-2">
                            <div className="col-span-4 font-medium">{keyword.keyword}</div>
                            <div className="col-span-2 text-center">
                              {keyword.volume.toLocaleString()}
                            </div>
                            <div className="col-span-2 text-center">
                              {getDifficultyBadge(keyword.difficulty)}
                            </div>
                            <div className="col-span-2 text-center font-medium">
                              ${keyword.cpc}
                            </div>
                            <div className="col-span-1 text-center flex justify-center">
                              {getTrendIcon(keyword.trend)}
                            </div>
                            <div className="col-span-1 flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(keyword.keyword)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="suggestions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Suggested Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {results.suggestedKeywords.map((keyword: string, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium text-sm">{keyword}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(keyword)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Video Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Video Title</span>
                          <span className="font-medium text-sm">{results.videoTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Video ID</span>
                          <span className="font-mono text-sm">{results.videoId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Published</span>
                          <span className="font-medium text-sm">{results.videoStats.publishDate}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Views</span>
                          <span className="font-medium text-sm">{results.videoStats.views}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Likes</span>
                          <span className="font-medium text-sm">{results.videoStats.likes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Comments</span>
                          <span className="font-medium text-sm">{results.videoStats.comments}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SEO Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500 mb-2">
                          {results.seoAnalysis.titleScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Title Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${results.seoAnalysis.titleScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500 mb-2">
                          {results.seoAnalysis.descriptionScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Description Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${results.seoAnalysis.descriptionScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500 mb-2">
                          {results.seoAnalysis.tagsScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Tags Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${results.seoAnalysis.tagsScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Overall SEO Score: {results.seoAnalysis.overallScore}%</h4>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            results.seoAnalysis.overallScore >= 80 ? 'bg-green-500' :
                            results.seoAnalysis.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${results.seoAnalysis.overallScore}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.seoAnalysis.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="export" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={() => downloadKeywords('csv')} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button onClick={() => downloadKeywords('txt')} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download TXT
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Direct Keyword List</label>
                      <Textarea
                        value={results.keywords.map((kw: any) => kw.keyword).join('\n')}
                        readOnly
                        className="font-mono text-xs"
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-12">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Video
                      </Button>
                      <Button variant="outline" className="h-12">
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze Similar Videos
                      </Button>
                    </div>
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