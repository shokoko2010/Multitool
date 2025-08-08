'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, TrendingUp, BarChart3, Globe, Users, Clock, Calculator } from 'lucide-react'

export default function LinkPriceCalculator() {
  const [url, setUrl] = useState('')
  const [domainAuthority, setDomainAuthority] = useState('')
  const [traffic, setTraffic] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const calculateLinkPrice = async () => {
    if (!url || !domainAuthority || !traffic) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      // Simulate API call for calculation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock calculation results
      const mockResults = {
        url: url,
        domainAuthority: parseInt(domainAuthority),
        monthlyTraffic: parseInt(traffic),
        calculationDate: new Date().toISOString(),
        estimatedValue: {
          monthly: 245.67,
          yearly: 2948.04,
          range: {
            low: 180.25,
            high: 320.15
          }
        },
        pricingFactors: {
          domainAuthority: {
            score: parseInt(domainAuthority),
            impact: 'high',
            description: 'Higher DA means better link value'
          },
          traffic: {
            monthly: parseInt(traffic),
            impact: 'high',
            description: 'More traffic increases link value'
          },
          niche: {
            relevance: 85,
            impact: 'medium',
            description: 'Niche relevance affects pricing'
          },
          linkType: {
            type: 'dofollow',
            impact: 'high',
            description: 'Dofollow links are more valuable'
          },
          placement: {
            position: 'content',
            impact: 'high',
            description: 'In-content links are premium'
          }
        },
        marketAnalysis: {
          averagePrice: {
            da_10_20: 50.00,
            da_21_40: 120.00,
            da_41_60: 200.00,
            da_61_80: 350.00,
            da_81_100: 500.00
          },
          competitiveAnalysis: {
            competitors: 156,
            averageCompetitorPrice: 225.50,
            pricePosition: 'above_average'
          },
          trends: {
            marketGrowth: 12.5,
            demandLevel: 'high',
            seasonalAdjustment: 1.0
          }
        },
        recommendations: {
          pricingStrategy: 'premium',
          justification: 'Based on high DA and traffic metrics',
          negotiationTips: [
            'Highlight domain authority metrics',
            'Emphasize traffic quality',
            'Consider long-term partnerships',
            'Offer package deals for multiple links'
          ],
          alternatives: [
            'Consider sponsored content instead',
            'Explore guest posting opportunities',
            'Look for contextual link placements',
            'Negotiate trial period for evaluation'
          ]
        }
      }

      setResults(mockResults)
    } catch (err) {
      setError('Failed to calculate link price. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>
      case 'medium':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>
      case 'low':
        return <Badge variant="secondary">Low Impact</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Link Price Calculator
          </CardTitle>
          <CardDescription>
            Calculate the estimated value of backlinks based on domain authority, 
            traffic, and other SEO metrics. Get market analysis and pricing recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target URL</label>
              <Input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain Authority (1-100)</label>
              <Input
                type="number"
                placeholder="45"
                value={domainAuthority}
                onChange={(e) => setDomainAuthority(e.target.value)}
                min="1"
                max="100"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Traffic</label>
              <Input
                type="number"
                placeholder="10000"
                value={traffic}
                onChange={(e) => setTraffic(e.target.value)}
                min="0"
                className="w-full"
              />
            </div>
          </div>
          
          <Button onClick={calculateLinkPrice} disabled={loading} className="w-full">
            {loading ? 'Calculating...' : 'Calculate Link Value'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <Tabs defaultValue="value" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="value">Estimated Value</TabsTrigger>
                <TabsTrigger value="factors">Pricing Factors</TabsTrigger>
                <TabsTrigger value="market">Market Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="value" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <DollarSign className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results.estimatedValue.monthly)}
                      </div>
                      <div className="text-sm text-muted-foreground">Monthly Value</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results.estimatedValue.yearly)}
                      </div>
                      <div className="text-sm text-muted-foreground">Yearly Value</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results.estimatedValue.range.high)}
                      </div>
                      <div className="text-sm text-muted-foreground">High Estimate</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Value Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Low Estimate</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(results.estimatedValue.range.low)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Most Likely</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(results.estimatedValue.monthly)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">High Estimate</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(results.estimatedValue.range.high)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 via-blue-500 to-red-500 h-2 rounded-full"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="factors" className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(results.pricingFactors).map(([key, factor]: [string, any]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </h4>
                              {getImpactBadge(factor.impact)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                            <div className="text-sm">
                              <span className="text-gray-600">Value: </span>
                              <span className="font-medium">
                                {key === 'domainAuthority' ? factor.score :
                                 key === 'traffic' ? `${factor.monthly.toLocaleString()} visitors/month` :
                                 key === 'niche' ? `${factor.relevance}% relevance` :
                                 key === 'linkType' ? factor.type :
                                 key === 'placement' ? factor.position : factor.value}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="market" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Average Market Prices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">DA 10-20</span>
                          <span className="font-medium">{formatCurrency(results.marketAnalysis.averagePrice.da_10_20)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">DA 21-40</span>
                          <span className="font-medium">{formatCurrency(results.marketAnalysis.averagePrice.da_21_40)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">DA 41-60</span>
                          <span className="font-medium">{formatCurrency(results.marketAnalysis.averagePrice.da_41_60)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">DA 61-80</span>
                          <span className="font-medium">{formatCurrency(results.marketAnalysis.averagePrice.da_61_80)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">DA 81-100</span>
                          <span className="font-medium">{formatCurrency(results.marketAnalysis.averagePrice.da_81_100)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Competitive Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Competitors</span>
                          <span className="font-medium">{results.marketAnalysis.competitiveAnalysis.competitors}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Competitor Price</span>
                          <span className="font-medium">{formatCurrency(results.marketAnalysis.competitiveAnalysis.averageCompetitorPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Your Position</span>
                          <Badge variant={
                            results.marketAnalysis.competitiveAnalysis.pricePosition === 'above_average' ? 'default' :
                            results.marketAnalysis.competitiveAnalysis.pricePosition === 'average' ? 'secondary' : 'destructive'
                          }>
                            {results.marketAnalysis.competitiveAnalysis.pricePosition.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Market Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500 mb-2">
                          +{results.marketAnalysis.trends.marketGrowth}%
                        </div>
                        <div className="text-sm text-muted-foreground">Market Growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500 mb-2">
                          {results.marketAnalysis.trends.demandLevel.toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">Demand Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {results.marketAnalysis.trends.seasonalAdjustment}x
                        </div>
                        <div className="text-sm text-muted-foreground">Seasonal Factor</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Pricing Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Recommended Strategy</span>
                        <Badge variant="default">{results.recommendations.pricingStrategy}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Justification</h4>
                        <p className="text-sm text-gray-600">{results.recommendations.justification}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Negotiation Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.recommendations.negotiationTips.map((tip: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Alternative Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.recommendations.alternatives.map((alternative: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm">{alternative}</p>
                        </div>
                      ))}
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