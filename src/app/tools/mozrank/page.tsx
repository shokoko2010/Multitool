'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ExternalLink, TrendingUp, TrendingDown, Minus, BarChart3, Globe, Link, Users } from 'lucide-react'
import { toast } from 'sonner'

interface MozrankData {
  domain: string
  mozrank: number
  mozrankScore: string
  links: {
    totalLinks: number
    externalLinks: number
    internalLinks: number
    linkingDomains: number
    eduLinks: number
    govLinks: number
  }
  history: {
    date: string
    mozrank: number
    change: number
  }[]
  recommendations: string[]
  lastUpdated: string
}

export default function MozrankChecker() {
  const [domain, setDomain] = useState('')
  const [mozrankData, setMozrankData] = useState<MozrankData | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const checkMozrank = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain name')
      return
    }

    setIsChecking(true)
    try {
      // Simulate Mozrank checking
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Mock Mozrank data
      const mockData: MozrankData = {
        domain: domain,
        mozrank: Math.random() * 8 + 1,
        mozrankScore: (Math.random() * 10).toFixed(1),
        links: {
          totalLinks: Math.floor(Math.random() * 10000) + 1000,
          externalLinks: Math.floor(Math.random() * 8000) + 800,
          internalLinks: Math.floor(Math.random() * 2000) + 200,
          linkingDomains: Math.floor(Math.random() * 500) + 50,
          eduLinks: Math.floor(Math.random() * 50) + 5,
          govLinks: Math.floor(Math.random() * 30) + 3
        },
        history: [
          { date: '2024-01-15', mozrank: 4.2, change: 0.1 },
          { date: '2023-10-20', mozrank: 4.1, change: -0.2 },
          { date: '2023-07-25', mozrank: 4.3, change: 0.3 },
          { date: '2023-04-30', mozrank: 4.0, change: 0.0 },
          { date: '2023-01-15', mozrank: 4.0, change: 0.2 }
        ],
        recommendations: [
          'Build more high-quality backlinks',
          'Improve internal linking structure',
          'Focus on .edu and .gov link building',
          'Create shareable content',
          'Fix broken links'
        ],
        lastUpdated: new Date().toISOString()
      }
      
      setMozrankData(mockData)
      toast.success('Mozrank data retrieved successfully!')
    } catch (error) {
      toast.error('Failed to check Mozrank')
    } finally {
      setIsChecking(false)
    }
  }

  const getMozrankColor = (mozrank: number) => {
    if (mozrank >= 6) return 'text-green-600'
    if (mozrank >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMozrankBadge = (mozrank: number) => {
    if (mozrank >= 6) return <Badge variant="secondary" className="bg-green-100 text-green-800">Excellent</Badge>
    if (mozrank >= 4) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Good</Badge>
    if (mozrank >= 2) return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Fair</Badge>
    return <Badge variant="destructive">Poor</Badge>
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const openInMoz = () => {
    if (mozrankData) {
      window.open(`https://moz.com/researchtools/ose/links?site=${encodeURIComponent(mozrankData.domain)}`, '_blank')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mozrank Checker</h1>
        <p className="text-muted-foreground">
          Check Mozrank score, backlink data, and domain authority metrics
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mozrank Analysis</CardTitle>
            <CardDescription>Enter domain name to check Mozrank and backlink data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={checkMozrank}
                disabled={isChecking || !domain.trim()}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Check Mozrank
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {mozrankData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Mozrank Overview</CardTitle>
                <CardDescription>Domain authority and Mozrank metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Mozrank Score</div>
                    <div className={`text-6xl font-bold ${getMozrankColor(mozrankData.mozrank)}`}>
                      {mozrankData.mozrank.toFixed(2)}
                    </div>
                    <div className="flex justify-center items-center gap-2 mt-2">
                      {getMozrankBadge(mozrankData.mozrank)}
                      <Badge variant="outline">
                        Score: {mozrankData.mozrankScore}/10
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={openInMoz} variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in Moz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backlink Analysis</CardTitle>
                <CardDescription>Detailed backlink and linking domain data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Link className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {mozrankData.links.totalLinks.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Links</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Globe className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {mozrankData.links.externalLinks.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">External Links</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {mozrankData.links.linkingDomains.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Linking Domains</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-red-500">.edu</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {mozrankData.links.eduLinks}
                    </div>
                    <div className="text-sm text-muted-foreground">Edu Links</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-blue-600">.gov</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {mozrankData.links.govLinks}
                    </div>
                    <div className="text-sm text-muted-foreground">Gov Links</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Link className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {mozrankData.links.internalLinks.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Internal Links</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mozrank History</CardTitle>
                <CardDescription>Historical Mozrank changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">Date</th>
                        <th className="text-left p-3 text-sm font-medium">Mozrank</th>
                        <th className="text-left p-3 text-sm font-medium">Change</th>
                        <th className="text-left p-3 text-sm font-medium">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mozrankData.history.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">{record.date}</td>
                          <td className="p-3 font-medium">{record.mozrank.toFixed(2)}</td>
                          <td className={`p-3 font-medium ${record.change > 0 ? 'text-green-600' : record.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {record.change > 0 ? '+' : ''}{record.change.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {getTrendIcon(record.change)}
                              <span className="text-sm capitalize">
                                {record.change > 0 ? 'increased' : record.change < 0 ? 'decreased' : 'stable'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Recommendations</CardTitle>
                <CardDescription>Suggestions to improve Mozrank and domain authority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mozrankData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!mozrankData && !isChecking && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Enter a domain name and click check to see Mozrank and backlink data
                </p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}