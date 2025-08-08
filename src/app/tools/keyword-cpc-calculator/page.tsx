'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Search, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface KeywordData {
  keyword: string
  cpc: number
  searchVolume: number
  competition: 'low' | 'medium' | 'high'
  trend: 'up' | 'down' | 'stable'
  suggestedBid: number
  monthlySpend: number
}

export default function KeywordCpcCalculator() {
  const [keyword, setKeyword] = useState('')
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('us')

  const regions = [
    { id: 'us', name: 'United States', currency: '$' },
    { id: 'uk', name: 'United Kingdom', currency: '£' },
    { id: 'ca', name: 'Canada', currency: 'C$' },
    { id: 'au', name: 'Australia', currency: 'A$' },
    { id: 'de', name: 'Germany', currency: '€' },
    { id: 'fr', name: 'France', currency: '€' },
    { id: 'jp', name: 'Japan', currency: '¥' }
  ]

  const calculateKeywordCPC = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword')
      return
    }

    setIsCalculating(true)
    try {
      // Simulate calculation process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock keyword data
      const mockKeywords: KeywordData[] = [
        {
          keyword: keyword.toLowerCase(),
          cpc: Math.random() * 5 + 0.5,
          searchVolume: Math.floor(Math.random() * 10000) + 1000,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          suggestedBid: Math.random() * 6 + 1,
          monthlySpend: (Math.random() * 5 + 0.5) * 1000
        },
        {
          keyword: `${keyword} tutorial`,
          cpc: Math.random() * 4 + 0.3,
          searchVolume: Math.floor(Math.random() * 5000) + 500,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          suggestedBid: Math.random() * 5 + 0.8,
          monthlySpend: (Math.random() * 4 + 0.3) * 1000
        },
        {
          keyword: `${keyword} guide`,
          cpc: Math.random() * 3.5 + 0.2,
          searchVolume: Math.floor(Math.random() * 3000) + 300,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          suggestedBid: Math.random() * 4 + 0.5,
          monthlySpend: (Math.random() * 3.5 + 0.2) * 1000
        },
        {
          keyword: `how to ${keyword}`,
          cpc: Math.random() * 6 + 1,
          searchVolume: Math.floor(Math.random() * 8000) + 800,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          suggestedBid: Math.random() * 7 + 1.5,
          monthlySpend: (Math.random() * 6 + 1) * 1000
        },
        {
          keyword: `${keyword} tips`,
          cpc: Math.random() * 2.5 + 0.1,
          searchVolume: Math.floor(Math.random() * 2000) + 200,
          competition: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          suggestedBid: Math.random() * 3 + 0.2,
          monthlySpend: (Math.random() * 2.5 + 0.1) * 1000
        }
      ]
      
      setKeywords(mockKeywords)
      toast.success('Keyword CPC calculated successfully!')
    } catch (error) {
      toast.error('Failed to calculate keyword CPC')
    } finally {
      setIsCalculating(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable':
        return <BarChart3 className="h-4 w-4 text-gray-500" />
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

  const formatCurrency = (amount: number) => {
    const region = regions.find(r => r.id === selectedRegion)
    const currency = region?.currency || '$'
    return `${currency}${amount.toFixed(2)}`
  }

  const getTotalStats = () => {
    if (keywords.length === 0) return null
    
    const totalVolume = keywords.reduce((acc, k) => acc + k.searchVolume, 0)
    const avgCPC = keywords.reduce((acc, k) => acc + k.cpc, 0) / keywords.length
    const totalSpend = keywords.reduce((acc, k) => acc + k.monthlySpend, 0)
    const highCompetition = keywords.filter(k => k.competition === 'high').length
    
    return {
      totalVolume,
      avgCPC,
      totalSpend,
      highCompetition
    }
  }

  const stats = getTotalStats()

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Keyword CPC Calculator</h1>
        <p className="text-muted-foreground">
          Calculate CPC costs and estimate advertising expenses for keywords
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Keyword Analysis</CardTitle>
            <CardDescription>Enter keywords to calculate CPC and advertising costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Keyword *</label>
                <Input
                  placeholder="Enter keyword to analyze"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Tabs value={selectedRegion} onValueChange={setSelectedRegion}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="us" className="text-xs">US</TabsTrigger>
                    <TabsTrigger value="uk" className="text-xs">UK</TabsTrigger>
                    <TabsTrigger value="ca" className="text-xs">CA</TabsTrigger>
                    <TabsTrigger value="au" className="text-xs">AU</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <Button 
              onClick={calculateKeywordCPC}
              disabled={isCalculating || !keyword.trim()}
              className="w-full mt-4"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating CPC...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Calculate Keyword CPC
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>Overview of keyword performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalVolume.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Search Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.avgCPC)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average CPC</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.totalSpend)}
                  </div>
                  <div className="text-sm text-muted-foreground">Monthly Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.highCompetition}</div>
                  <div className="text-sm text-muted-foreground">High Competition</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Keyword Details</CardTitle>
            <CardDescription>Detailed CPC analysis for each keyword variation</CardDescription>
          </CardHeader>
          <CardContent>
            {isCalculating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Calculating keyword CPC...</span>
              </div>
            ) : keywords.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">Keyword</th>
                        <th className="text-left p-3 text-sm font-medium">CPC</th>
                        <th className="text-left p-3 text-sm font-medium">Search Volume</th>
                        <th className="text-left p-3 text-sm font-medium">Competition</th>
                        <th className="text-left p-3 text-sm font-medium">Trend</th>
                        <th className="text-left p-3 text-sm font-medium">Suggested Bid</th>
                        <th className="text-left p-3 text-sm font-medium">Monthly Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((keywordData, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium text-sm">{keywordData.keyword}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(keywordData.cpc)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">{keywordData.searchVolume.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">monthly</div>
                          </td>
                          <td className="p-3">
                            {getCompetitionBadge(keywordData.competition)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(keywordData.trend)}
                              <span className="text-sm capitalize">{keywordData.trend}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium">
                              {formatCurrency(keywordData.suggestedBid)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium">
                              {formatCurrency(keywordData.monthlySpend)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No keyword data yet</p>
                <p className="text-sm mt-2">Enter a keyword and click calculate to see CPC analysis</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advertising Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">💰 Budget Planning</h4>
                <p className="text-sm text-muted-foreground">
                  Based on the analysis, consider these budget recommendations:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Start with lower bids for testing</li>
                  <li>• Allocate more budget to high-volume keywords</li>
                  <li>• Monitor competition levels closely</li>
                  <li>• Set daily limits to control spending</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">📊 Optimization Tips</h4>
                <p className="text-sm text-muted-foreground">
                  Maximize your advertising ROI with these strategies:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Focus on keywords with good search volume</li>
                  <li>• Target low to medium competition keywords</li>
                  <li>• Use negative keywords to reduce costs</li>
                  <li>• A/B test ad copy regularly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}