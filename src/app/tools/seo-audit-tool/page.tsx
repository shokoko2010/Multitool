"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Globe, 
  TrendingUp, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  Info,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface SEOAnalysis {
  url: string
  title: string
  description: string
  h1: string
  h2: string
  h3: string
  wordCount: number
  readabilityScore: number
  loadingTime: number
  mobileFriendly: boolean
  https: boolean
  sitemap: boolean
  robots: boolean
  metaDescription: boolean
  canonicalUrl: boolean
  openGraph: boolean
  twitterCard: boolean
  structuredData: boolean
  issues: string[]
  recommendations: string[]
}

export default function SEOAuditTool() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)

  const handleAnalyze = async () => {
    if (!url) return
    
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockAnalysis: SEOAnalysis = {
        url,
        title: 'Example Website Title',
        description: 'This is a meta description for the website',
        h1: 'Main Heading',
        h2: 'Subheading 1',
        h3: 'Subheading 2',
        wordCount: 1250,
        readabilityScore: 68,
        loadingTime: 2.3,
        mobileFriendly: true,
        https: true,
        sitemap: true,
        robots: true,
        metaDescription: true,
        canonicalUrl: true,
        openGraph: true,
        twitterCard: true,
        structuredData: false,
        issues: [
          'Missing structured data',
          'Image alt text could be improved',
          'Some headings are too long'
        ],
        recommendations: [
          'Add structured data markup',
          'Improve image alt text',
          'Optimize heading lengths'
        ]
      }
      
      setAnalysis(mockAnalysis)
      setIsLoading(false)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number, label: string) => {
    const color = score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'
    return (
      <Badge variant={color} className="text-sm">
        {label}: {score}%
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="text-4xl font-bold mb-4">SEO Analyzer</h1>
        <p className="text-muted-foreground text-lg">
          Analyze websites for SEO optimization and get actionable recommendations
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Analyze Website
          </CardTitle>
          <CardDescription>
            Enter a website URL to perform comprehensive SEO analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAnalyze} 
                disabled={!url || isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SEO Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round((analysis.readabilityScore + (analysis.mobileFriendly ? 100 : 0) + (analysis.https ? 100 : 0)) / 3)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analysis.wordCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Word Count</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analysis.loadingTime}s
                  </div>
                  <div className="text-sm text-muted-foreground">Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analysis.readabilityScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Readability</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Technical SEO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>HTTPS</span>
                  {analysis.https ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Mobile Friendly</span>
                  {analysis.mobileFriendly ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Sitemap</span>
                  {analysis.sitemap ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Robots.txt</span>
                  {analysis.robots ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Meta Description</span>
                  {analysis.metaDescription ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Canonical URL</span>
                  {analysis.canonicalUrl ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Social Media Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Open Graph</span>
                  {analysis.openGraph ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Twitter Card</span>
                  {analysis.twitterCard ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Features */}
      {!analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comprehensive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get detailed analysis of website SEO including technical, content, and off-page factors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Actionable Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive specific recommendations to improve your search engine rankings and visibility.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Real-time Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get instant analysis results with up-to-date SEO best practices and algorithm updates.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}