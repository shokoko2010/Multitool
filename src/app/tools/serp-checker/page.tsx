"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Search, 
  Target, 
  MapPin, 
  Globe, 
  Calendar, 
  BarChart3, 
  ArrowUp,
  ArrowDown,
  Minus,
  Copy,
  Download,
  RefreshCw,
  Eye,
  Star,
  Clock,
  Award
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SERPResult {
  keyword: string
  position: number
  previousPosition: number
  change: 'up' | 'down' | 'same'
  url: string
  title: string
  description: string
  searchVolume: number
  competition: 'low' | 'medium' | 'high'
  lastChecked: string
}

interface SERPAnalysis {
  totalKeywords: number
  averagePosition: number
  topRankings: number
  improvedKeywords: number
  declinedKeywords: number
  stableKeywords: number
  topCompetitors: Array<{
    name: string
    url: string
    keywords: number
  }>
}

const searchEngines = [
  { value: 'google', label: 'Google' },
  { value: 'bing', label: 'Bing' },
  { value: 'yahoo', label: 'Yahoo' },
  { value: 'duckduckgo', label: 'DuckDuckGo' },
]

const countries = [
  { value: 'us', label: 'United States', flag: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'ca', label: 'Canada', flag: '🇨🇦' },
  { value: 'au', label: 'Australia', flag: '🇦🇺' },
  { value: 'de', label: 'Germany', flag: '🇩🇪' },
  { value: 'fr', label: 'France', flag: '🇫🇷' },
  { value: 'es', label: 'Spain', flag: '🇪🇸' },
  { value: 'it', label: 'Italy', flag: '🇮🇹' },
  { value: 'jp', label: 'Japan', flag: '🇯🇵' },
  { value: 'br', label: 'Brazil', flag: '🇧🇷' },
]

export default function SERPChecker() {
  const [keywords, setKeywords] = useState('')
  const [searchEngine, setSearchEngine] = useState('google')
  const [country, setCountry] = useState('us')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<SERPResult[]>([])
  const [analysis, setAnalysis] = useState<SERPAnalysis | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [copied, setCopied] = useState(false)

  const checkSERP = async () => {
    if (!keywords.trim()) return

    setIsChecking(true)
    
    // Simulate SERP analysis with realistic data
    await new Promise(resolve => setTimeout(resolve, 3000))

    const mockResults: SERPResult[] = [
      {
        keyword: 'seo tools online',
        position: 3,
        previousPosition: 5,
        change: 'up',
        url: 'https://yourdomain.com/seo-tools',
        title: 'Free SEO Tools Online - Website Analysis & Optimization',
        description: 'Comprehensive suite of free SEO tools for website analysis, keyword research, and optimization. Improve your search rankings today.',
        searchVolume: 2400,
        competition: 'high',
        lastChecked: new Date().toISOString()
      },
      {
        keyword: 'keyword position checker',
        position: 7,
        previousPosition: 7,
        change: 'same',
        url: 'https://yourdomain.com/tools/serp-checker',
        title: 'SERP Checker - Track Keyword Rankings Free',
        description: 'Track your keyword positions in search results with our free SERP checker. Monitor rankings across multiple search engines.',
        searchVolume: 890,
        competition: 'medium',
        lastChecked: new Date().toISOString()
      },
      {
        keyword: 'free seo analyzer',
        position: 12,
        previousPosition: 8,
        change: 'down',
        url: 'https://yourdomain.com/tools/seo-analyzer',
        title: 'Free SEO Analyzer - Website Analysis Tool',
        description: 'Analyze your website SEO with our free analyzer. Get comprehensive reports on technical SEO, content, and backlinks.',
        searchVolume: 1200,
        competition: 'medium',
        lastChecked: new Date().toISOString()
      },
      {
        keyword: 'meta tag generator',
        position: 2,
        previousPosition: 2,
        change: 'same',
        url: 'https://yourdomain.com/tools/meta-tag-generator',
        title: 'Meta Tag Generator - Create SEO Meta Tags',
        description: 'Generate SEO-optimized meta tags for better search rankings. Free online meta tag generator with preview.',
        searchVolume: 1800,
        competition: 'high',
        lastChecked: new Date().toISOString()
      },
      {
        keyword: 'backlink checker tool',
        position: 15,
        previousPosition: 18,
        change: 'up',
        url: 'https://yourdomain.com/tools/backlink-checker',
        title: 'Backlink Checker - Analyze Backlink Profile',
        description: 'Free backlink checker tool to analyze your website backlink profile. Monitor backlinks and find linking opportunities.',
        searchVolume: 650,
        competition: 'medium',
        lastChecked: new Date().toISOString()
      }
    ]

    const mockAnalysis: SERPAnalysis = {
      totalKeywords: mockResults.length,
      averagePosition: 7.8,
      topRankings: 1,
      improvedKeywords: 2,
      declinedKeywords: 1,
      stableKeywords: 2,
      topCompetitors: [
        { name: 'semrush.com', url: 'https://semrush.com', keywords: 234 },
        { name: 'ahrefs.com', url: 'https://ahrefs.com', keywords: 189 },
        { name: 'moz.com', url: 'https://moz.com', keywords: 156 },
        { name: 'searchenginejournal.com', url: 'https://searchenginejournal.com', keywords: 98 }
      ]
    }

    setResults(mockResults)
    setAnalysis(mockAnalysis)
    setIsChecking(false)
  }

  const copyResults = async () => {
    if (!results.length) return
    
    const text = `SERP Analysis Results
Search Engine: ${searchEngine}
Location: ${country}
Total Keywords Checked: ${results.length}

Keyword Rankings:
${results.map(result => 
  `${result.keyword}: Position ${result.position} (${result.change === 'up' ? '↑' : result.change === 'down' ? '↓' : '→'} ${result.previousPosition})`
).join('\n')}

Average Position: ${analysis?.averagePosition || 0}
Improved Keywords: ${analysis?.improvedKeywords || 0}
Declined Keywords: ${analysis?.declinedKeywords || 0}

Generated by SERP Checker`
    
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getPositionIcon = (change: string) => {
    switch (change) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 font-bold'
    if (position <= 10) return 'text-blue-600 font-semibold'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="text-sm px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            SEO Analytics
          </Badge>
          <h1 className="text-4xl font-bold mb-4">SERP Checker</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your keyword rankings across search engines. Monitor your SEO performance and competitor positions with detailed analytics.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Check Keyword Rankings
            </CardTitle>
            <CardDescription>
              Enter keywords to track their positions in search results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Keywords</label>
              <Textarea
                placeholder="Enter one keyword per line..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter one keyword per line for best results
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Engine</label>
                <Select value={searchEngine} onValueChange={setSearchEngine}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {searchEngines.map((engine) => (
                      <SelectItem key={engine.value} value={engine.value}>
                        {engine.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.flag} {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Location (Optional)</label>
                <Input
                  placeholder="City, Region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              onClick={checkSERP} 
              disabled={!keywords.trim() || isChecking}
              className="w-full"
              size="lg"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking Rankings...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Check SERP Rankings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Overview Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ranking Overview</CardTitle>
                <CardDescription>
                  Summary of your keyword performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{analysis.totalKeywords}</div>
                    <div className="text-sm text-muted-foreground">Total Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysis.averagePosition.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avg Position</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysis.improvedKeywords}</div>
                    <div className="text-sm text-muted-foreground">Improved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analysis.declinedKeywords}</div>
                    <div className="text-sm text-muted-foreground">Declined</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{analysis.stableKeywords}</div>
                    <div className="text-sm text-muted-foreground">Stable</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="rankings" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rankings">Rankings ({results.length})</TabsTrigger>
                <TabsTrigger value="competitors">Top Competitors</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="rankings">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Rankings</CardTitle>
                    <CardDescription>
                      Current positions for your tracked keywords
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{result.keyword}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  Position <span className={`font-semibold ${getPositionColor(result.position)}`}>{result.position}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="w-4 h-4" />
                                  Volume: {result.searchVolume.toLocaleString()}
                                </span>
                                <Badge className={getCompetitionColor(result.competition)}>
                                  {result.competition} competition
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPositionIcon(result.change)}
                              <span className="text-sm font-medium">
                                {result.change === 'up' ? '↑' : result.change === 'down' ? '↓' : '→'} {result.previousPosition}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-muted-foreground">Title:</span>
                                <p className="text-sm font-medium">{result.title}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">URL:</span>
                                <p className="text-sm text-blue-600 truncate">{result.url}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Description:</span>
                                <p className="text-sm text-muted-foreground">{result.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Competitors</CardTitle>
                    <CardDescription>
                      Competitors ranking for your target keywords
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.topCompetitors.map((competitor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Award className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{competitor.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {competitor.keywords} overlapping keywords
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Analyze
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Results</CardTitle>
                    <CardDescription>
                      Export your SERP analysis for reporting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={copyResults}
                        variant="outline"
                        className="h-auto p-4"
                      >
                        <div className="text-center">
                          <Copy className="w-8 h-8 mx-auto mb-2" />
                          <div className="font-medium">Copy to Clipboard</div>
                          <div className="text-xs text-muted-foreground">
                            Copy ranking data
                          </div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="h-auto p-4"
                        disabled
                      >
                        <div className="text-center">
                          <Download className="w-8 h-8 mx-auto mb-2" />
                          <div className="font-medium">Download CSV</div>
                          <div className="text-xs text-muted-foreground">
                            Export as spreadsheet
                          </div>
                        </div>
                      </Button>
                    </div>
                    
                    {copied && (
                      <div className="text-center text-sm text-green-600">
                        ✓ Results copied to clipboard!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Features Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Why Use SERP Checker?</CardTitle>
            <CardDescription>
              Powerful features to track your SEO performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Get up-to-date keyword positions across multiple search engines
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Competitor Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor competitor rankings and identify opportunities
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Multi-Region</h3>
                <p className="text-sm text-muted-foreground">
                  Track rankings in different countries and languages
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Historical Data</h3>
                <p className="text-sm text-muted-foreground">
                  Track ranking changes over time and identify trends
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}