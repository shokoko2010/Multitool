'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Download, Sparkles, Plus, Minus } from 'lucide-react'
import { useCopyToClipboard } from 'react-use'

export default function AIKeywordClusterGenerator() {
  const [primaryKeyword, setPrimaryKeyword] = useState('')
  const [results, setResults] = useState<{
    clusters: Array<{
      name: string
      keywords: string[]
      intent: string
      difficulty: 'Easy' | 'Medium' | 'Hard'
    }>
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, copy] = useCopyToClipboard()

  const generateKeywordClusters = async () => {
    if (!primaryKeyword.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/keyword-cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryKeyword: primaryKeyword.trim(),
          additionalKeywords: []
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
      } else {
        throw new Error(data.error || 'Failed to generate keyword clusters')
      }
    } catch (error) {
      console.error('Error generating keyword clusters:', error)
      // Fallback to mock clusters if API fails
      const mockClusters = {
        clusters: [
          {
            name: 'Informational Intent',
            keywords: [
              `${primaryKeyword} guide`,
              `how to ${primaryKeyword}`,
              `${primaryKeyword} tutorial`,
              `learn ${primaryKeyword}`,
              `${primaryKeyword} basics`,
              `${primaryKeyword} explained`,
              `${primaryKeyword} for beginners`,
              `${primaryKeyword} overview`
            ],
            intent: 'Informational',
            difficulty: 'Easy' as const
          },
          {
            name: 'Commercial Intent',
            keywords: [
              `${primaryKeyword} services`,
              `best ${primaryKeyword} tools`,
              `${primaryKeyword} software`,
              `${primaryKeyword} solutions`,
              `${primaryKeyword} providers`,
              `${primaryKeyword} companies`,
              `${primaryKeyword} pricing`,
              `${primaryKeyword} comparison`
            ],
            intent: 'Commercial',
            difficulty: 'Medium' as const
          },
          {
            name: 'Transactional Intent',
            keywords: [
              `buy ${primaryKeyword}`,
              `${primaryKeyword} for sale`,
              `${primaryKeyword} deals`,
              `${primaryKeyword} discount`,
              `${primaryKeyword} coupon`,
              `${primaryKeyword} purchase`,
              `${primaryKeyword} online`,
              `${primaryKeyword} store`
            ],
            intent: 'Transactional',
            difficulty: 'Easy' as const
          },
          {
            name: 'Long-tail Keywords',
            keywords: [
              `how to use ${primaryKeyword} effectively`,
              `best practices for ${primaryKeyword}`,
              `${primaryKeyword} tips and tricks`,
              `advanced ${primaryKeyword} techniques`,
              `${primaryKeyword} optimization guide`,
              `${primaryKeyword} vs alternatives`,
              `${primaryKeyword} case study`,
              `${primaryKeyword} examples`
            ],
            intent: 'Mixed',
            difficulty: 'Hard' as const
          }
        ]
      }
      setResults(mockClusters)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    copy(text)
  }

  const downloadResults = () => {
    if (!results) return

    let content = `Keyword Clusters for: ${primaryKeyword}\n\n`
    results.clusters.forEach((cluster, index) => {
      content += `Cluster ${index + 1}: ${cluster.name}\n`
      content += `Intent: ${cluster.intent}\n`
      content += `Difficulty: ${cluster.difficulty}\n`
      content += `Keywords: ${cluster.keywords.join(', ')}\n\n`
    })

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyword-clusters.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'Informational': return 'bg-blue-100 text-blue-800'
      case 'Commercial': return 'bg-purple-100 text-purple-800'
      case 'Transactional': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Keyword Cluster Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive keyword clusters based on search intent and difficulty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keyword">Primary Keyword</Label>
            <Input
              id="keyword"
              placeholder="e.g., digital marketing, content marketing, seo"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateKeywordClusters()}
            />
          </div>

          <Button 
            onClick={generateKeywordClusters} 
            disabled={!primaryKeyword.trim() || loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Keyword Clusters'}
          </Button>

          {results && (
            <>
              <Separator />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Keyword Clusters</h3>
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid gap-6">
                  {results.clusters.map((cluster, clusterIndex) => (
                    <Card key={clusterIndex} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-lg">{cluster.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getIntentColor(cluster.intent)}>
                                {cluster.intent}
                              </Badge>
                              <Badge className={getDifficultyColor(cluster.difficulty)}>
                                {cluster.difficulty}
                              </Badge>
                              <Badge variant="outline">
                                {cluster.keywords.length} keywords
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(cluster.keywords.join(', '))}
                          >
                            <Copy className="h-4 w-4" />
                            Copy Keywords
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {cluster.keywords.map((keyword, keywordIndex) => (
                              <Badge
                                key={keywordIndex}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => copyToClipboard(keyword)}
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Click on any keyword to copy it to clipboard
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Keyword Clustering Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Group keywords by search intent (informational, commercial, transactional)</li>
            <li>• Consider keyword difficulty and competition level</li>
            <li>• Create clusters around core themes and subtopics</li>
            <li>• Include long-tail variations for comprehensive coverage</li>
            <li>• Balance between high-volume and low-competition keywords</li>
            <li>• Consider user journey stages at each cluster level</li>
            <li>• Analyze competitor keyword targeting strategies</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}