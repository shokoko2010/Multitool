'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface SearchResult {
  keyword: string
  position: number
  url: string
  searchVolume: number
  competition: 'low' | 'medium' | 'high'
  trend: 'up' | 'down' | 'stable'
  lastChecked: string
}

export default function KeywordPositionChecker() {
  const [keyword, setKeyword] = useState('')
  const [domain, setDomain] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSearchEngine, setSelectedSearchEngine] = useState('google')

  const searchEngines = [
    { id: 'google', name: 'Google', icon: 'G' },
    { id: 'bing', name: 'Bing', icon: 'B' },
    { id: 'yahoo', name: 'Yahoo', icon: 'Y' }
  ]

  const checkKeywordPosition = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword')
      return
    }

    if (!domain.trim()) {
      toast.error('Please enter your domain')
      return
    }

    setIsSearching(true)
    try {
      // Simulate search process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          keyword: keyword.toLowerCase(),
          position: Math.floor(Math.random() * 50) + 1,
          url: domain,
          searchVolume: Math.floor(Math.random() * 10000) + 1000,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          lastChecked: new Date().toLocaleDateString()
        },
        {
          keyword: `${keyword} tutorial`,
          position: Math.floor(Math.random() * 100) + 1,
          url: domain,
          searchVolume: Math.floor(Math.random() * 5000) + 500,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          lastChecked: new Date().toLocaleDateString()
        },
        {
          keyword: `${keyword} guide`,
          position: Math.floor(Math.random() * 100) + 1,
          url: domain,
          searchVolume: Math.floor(Math.random() * 3000) + 300,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          lastChecked: new Date().toLocaleDateString()
        },
        {
          keyword: `how to ${keyword}`,
          position: Math.floor(Math.random() * 100) + 1,
          url: domain,
          searchVolume: Math.floor(Math.random() * 8000) + 800,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          lastChecked: new Date().toLocaleDateString()
        }
      ]
      
      setSearchResults(mockResults)
      toast.success('Keyword positions checked successfully!')
    } catch (error) {
      toast.error('Failed to check keyword positions')
    } finally {
      setIsSearching(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getCompetitionBadge = (competition: string) => {
    switch (competition) {
      case 'low':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'high':
        return <Badge variant="destructive">High</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPositionColor = (position: number) => {
    if (position <= 10) return 'text-green-600 font-bold'
    if (position <= 30) return 'text-yellow-600 font-semibold'
    return 'text-red-600'
  }

  const openSearch = (keyword: string, engine: string) => {
    const searchUrl = engine === 'google' 
      ? `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
      : engine === 'bing'
      ? `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`
      : `https://search.yahoo.com/search?p=${encodeURIComponent(keyword)}`
    
    window.open(searchUrl, '_blank')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Keyword Position Checker</h1>
        <p className="text-muted-foreground">
          Check your website's ranking position for specific keywords across search engines
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Configuration</CardTitle>
            <CardDescription>Enter the keyword and domain to check positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Keyword *</label>
                <Input
                  placeholder="Enter keyword to check position"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Domain *</label>
                <Input
                  placeholder="yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Search Engine</label>
              <Tabs value={selectedSearchEngine} onValueChange={setSelectedSearchEngine}>
                <TabsList className="grid w-full grid-cols-3">
                  {searchEngines.map((engine) => (
                    <TabsTrigger key={engine.id} value={engine.id} className="text-xs">
                      {engine.icon} {engine.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            <Button 
              onClick={checkKeywordPosition}
              disabled={isSearching || !keyword.trim() || !domain.trim()}
              className="w-full mt-4"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Positions...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check Keyword Positions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Your keyword positions will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Checking keyword positions...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {searchResults.length} keyword variations found
                  </div>
                  <Badge variant="outline">
                    {searchEngines.find(e => e.id === selectedSearchEngine)?.name}
                  </Badge>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">Keyword</th>
                        <th className="text-left p-3 text-sm font-medium">Position</th>
                        <th className="text-left p-3 text-sm font-medium">Search Volume</th>
                        <th className="text-left p-3 text-sm font-medium">Competition</th>
                        <th className="text-left p-3 text-sm font-medium">Trend</th>
                        <th className="text-left p-3 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((result, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium text-sm">{result.keyword}</div>
                            <div className="text-xs text-muted-foreground">{result.url}</div>
                          </td>
                          <td className="p-3">
                            <div className={`text-lg font-bold ${getPositionColor(result.position)}`}>
                              #{result.position}
                            </div>
                            <div className="text-xs text-muted-foreground">Page {Math.ceil(result.position / 10)}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">{result.searchVolume.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">monthly searches</div>
                          </td>
                          <td className="p-3">
                            {getCompetitionBadge(result.competition)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(result.trend)}
                              <span className="text-sm capitalize">{result.trend}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Button 
                              onClick={() => openSearch(result.keyword, selectedSearchEngine)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {searchResults.filter(r => r.position <= 10).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Top 10</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {searchResults.filter(r => r.position > 10 && r.position <= 30).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Top 30</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {searchResults.filter(r => r.position > 30).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Below 30</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(searchResults.reduce((acc, r) => acc + (r.position <= 30 ? 1 : 0), 0) / searchResults.length * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No search results yet</p>
                <p className="text-sm mt-2">Enter a keyword and domain to check positions</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Good Positions (1-10)</h4>
                <p className="text-sm text-muted-foreground">
                  Your website is easily visible on the first page of search results. These positions typically receive the most clicks.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-yellow-600">⚠ Fair Positions (11-30)</h4>
                <p className="text-sm text-muted-foreground">
                  Your website is on the first page but may not be as visible. Consider optimizing further for better rankings.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">✗ Poor Positions (31+)</h4>
                <p className="text-sm text-muted-foreground">
                  Your website is not on the first page. Focus on SEO improvements to improve visibility and traffic.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">📊 Trend Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor the trend indicators to understand if your rankings are improving, declining, or staying stable over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}