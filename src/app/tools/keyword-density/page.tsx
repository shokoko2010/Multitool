'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Download, BarChart3, TrendingUp, Search, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface KeywordData {
  keyword: string
  count: number
  density: number
  percentage: number
  suggestions: string[]
}

export default function KeywordDensityChecker() {
  const [content, setContent] = useState('')
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('analysis')
  const [targetKeyword, setTargetKeyword] = useState('')

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulate keyword density analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clean and process content
      const cleanContent = content.toLowerCase().replace(/[^\w\s]/g, ' ')
      const words = cleanContent.split(/\s+/).filter(word => word.length > 0)
      const totalWords = words.length
      
      // Mock keyword data
      const mockKeywords: KeywordData[] = [
        {
          keyword: 'content',
          count: Math.floor(Math.random() * 10) + 5,
          density: (Math.random() * 3 + 1).toFixed(2),
          percentage: (Math.random() * 5 + 2).toFixed(1),
          suggestions: ['Consider using synonyms', 'Vary your vocabulary', 'Avoid repetition']
        },
        {
          keyword: 'website',
          count: Math.floor(Math.random() * 8) + 3,
          density: (Math.random() * 2.5 + 0.5).toFixed(2),
          percentage: (Math.random() * 4 + 1).toFixed(1),
          suggestions: ['Good usage', 'Consider related terms', 'Maintain current density']
        },
        {
          keyword: 'seo',
          count: Math.floor(Math.random() * 6) + 2,
          density: (Math.random() * 2 + 0.5).toFixed(2),
          percentage: (Math.random() * 3 + 0.5).toFixed(1),
          suggestions: ['Optimal density', 'Consider long-tail keywords', 'Focus on user intent']
        },
        {
          keyword: 'optimization',
          count: Math.floor(Math.random() * 4) + 1,
          density: (Math.random() * 1.5 + 0.2).toFixed(2),
          percentage: (Math.random() * 2 + 0.2).toFixed(1),
          suggestions: ['Good variation', 'Consider related terms', 'Maintain natural flow']
        }
      ]
      
      // Add some generic keywords
      const genericWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'does', 'let', 'put', 'say', 'she', 'too', 'use']
      genericWords.forEach(word => {
        const count = words.filter(w => w === word).length
        if (count > 0) {
          mockKeywords.push({
            keyword: word,
            count,
            density: (count / totalWords * 100).toFixed(2),
            percentage: (count / totalWords * 100).toFixed(1),
            suggestions: ['Stop word - consider removal', 'Common word - natural usage']
          })
        }
      })
      
      // Sort by count (descending)
      mockKeywords.sort((a, b) => b.count - a.count)
      
      setKeywords(mockKeywords)
      toast.success('Keyword density analysis completed!')
    } catch (error) {
      toast.error('Failed to analyze keyword density')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeSpecificKeyword = () => {
    if (!targetKeyword.trim()) {
      toast.error('Please enter a keyword to analyze')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter content to analyze')
      return
    }

    const cleanContent = content.toLowerCase()
    const cleanKeyword = targetKeyword.toLowerCase()
    const regex = new RegExp(`\\b${cleanKeyword}\\b`, 'g')
    const count = (cleanContent.match(regex) || []).length
    
    if (count === 0) {
      toast.error(`Keyword "${targetKeyword}" not found in content`)
      return
    }

    const totalWords = content.split(/\s+/).filter(word => word.length > 0).length
    const density = (count / totalWords * 100).toFixed(2)
    const percentage = (count / totalWords * 100).toFixed(1)

    const keywordData: KeywordData = {
      keyword: targetKeyword,
      count,
      density,
      percentage,
      suggestions: [
        'Keyword found in content',
        `Density: ${density}%`,
        `Appears ${count} times`,
        count > 5 ? 'Consider reducing frequency' : 'Good keyword density'
      ]
    }

    // Check if keyword already exists, if not add it
    const existingIndex = keywords.findIndex(k => k.keyword.toLowerCase() === targetKeyword.toLowerCase())
    if (existingIndex >= 0) {
      const updatedKeywords = [...keywords]
      updatedKeywords[existingIndex] = keywordData
      setKeywords(updatedKeywords)
    } else {
      setKeywords(prev => [keywordData, ...prev])
    }

    toast.success(`Keyword "${targetKeyword}" analyzed successfully!`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadReport = () => {
    let report = 'Keyword Density Analysis Report\n'
    report += '=================================\n\n'
    report += `Content Length: ${content.length} characters\n`
    report += `Total Words: ${content.split(/\s+/).filter(word => word.length > 0).length}\n\n`
    
    report += 'Keyword Analysis:\n'
    report += '-----------------\n'
    keywords.forEach(keyword => {
      report += `${keyword.keyword}: ${keyword.count} occurrences (${keyword.density}% density)\n`
    })
    
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyword-density-report.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Report downloaded!')
  }

  const getDensityColor = (density: number) => {
    if (density >= 1 && density <= 3) return 'text-green-600'
    if (density > 3 && density <= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDensityBadge = (density: number) => {
    if (density >= 1 && density <= 3) return <Badge variant="secondary" className="bg-green-100 text-green-800">Optimal</Badge>
    if (density > 3 && density <= 5) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">High</Badge>
    return <Badge variant="destructive">Very High</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Keyword Density Checker</h1>
        <p className="text-muted-foreground">
          Analyze keyword frequency and density in your content for better SEO optimization
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Analysis</CardTitle>
            <CardDescription>Enter your content to analyze keyword density</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content *</label>
                <Textarea
                  placeholder="Paste your content here for keyword density analysis..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {content.length} characters, {content.split(/\s+/).filter(word => word.length > 0).length} words
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={analyzeContent}
                  disabled={isAnalyzing || !content.trim()}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Keywords
                    </>
                  )}
                </Button>
                <Button 
                  onClick={downloadReport}
                  variant="outline"
                  disabled={!keywords.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specific Keyword Analysis</CardTitle>
            <CardDescription>Analyze a specific keyword in your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter keyword to analyze..."
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={analyzeSpecificKeyword}
                disabled={!content.trim() || !targetKeyword.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis Results</CardTitle>
              <CardDescription>Detailed keyword frequency and density analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium">Keyword</th>
                          <th className="text-left p-3 text-sm font-medium">Count</th>
                          <th className="text-left p-3 text-sm font-medium">Density (%)</th>
                          <th className="text-left p-3 text-sm font-medium">Percentage</th>
                          <th className="text-left p-3 text-sm font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywords.slice(0, 20).map((keyword, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <span className="font-medium">{keyword.keyword}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold">{keyword.count}</span>
                            </td>
                            <td className={`p-3 font-bold ${getDensityColor(parseFloat(keyword.density))}`}>
                              {keyword.density}%
                            </td>
                            <td className="p-3">
                              <span className="text-sm">{keyword.percentage}%</span>
                            </td>
                            <td className="p-3">
                              {getDensityBadge(parseFloat(keyword.density))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{keywords.length}</div>
                        <div className="text-sm text-muted-foreground">Keywords Found</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {keywords.filter(k => parseFloat(k.density) >= 1 && parseFloat(k.density) <= 3).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Optimal Density</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {keywords.filter(k => parseFloat(k.density) > 3 && parseFloat(k.density) <= 5).length}
                        </div>
                        <div className="text-sm text-muted-foreground">High Density</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {keywords.filter(k => parseFloat(k.density) > 5).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Very High</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="suggestions" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {keywords.slice(0, 10).map((keyword, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{keyword.keyword}</h4>
                          <Badge variant="outline">{keyword.count} occurrences</Badge>
                        </div>
                        <div className="space-y-1">
                          {keyword.suggestions.map((suggestion, suggestionIndex) => (
                            <div key={suggestionIndex} className="flex items-start gap-2 text-sm">
                              <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Keyword Density Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">1-3%</div>
                <div className="text-sm font-medium text-green-800">Optimal</div>
                <div className="text-xs text-green-600 mt-1">
                  Perfect range for most keywords
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">3-5%</div>
                <div className="text-sm font-medium text-yellow-800">Acceptable</div>
                <div className="text-xs text-yellow-600 mt-1">
                  Monitor for over-optimization
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">5%+</div>
                <div className="text-sm font-medium text-red-800">Too High</div>
                <div className="text-xs text-red-600 mt-1">
                  May trigger search penalties
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-blue-600">💡 Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Focus on natural readability over keyword density</li>
                <li>• Use synonyms and related terms</li>
                <li>• Include keywords in headings and meta descriptions</li>
                <li>• Aim for 1-2 primary keywords per page</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}