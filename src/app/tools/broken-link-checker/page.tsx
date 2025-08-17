'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Link, Search, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface LinkCheckResult {
  url: string
  status: 'pending' | 'checking' | 'valid' | 'broken' | 'error'
  statusCode?: number
  error?: string
  loadTime?: number
  finalUrl?: string
}

export default function BrokenLinkChecker() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<LinkCheckResult[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [checkProgress, setCheckProgress] = useState(0)
  const [maxConcurrent, setMaxConcurrent] = useState(5)
  const [timeout, setTimeout] = useState(10000)
  const { trackUsage } = useToolAccess('broken-link-checker')

  const extractUrls = (text: string): string[] => {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
    const matches = text.match(urlRegex) || []
    
    // Remove duplicates and normalize URLs
    const uniqueUrls = [...new Set(matches)]
    return uniqueUrls.map(url => {
      // Remove trailing slashes for consistency
      return url.replace(/\/$/, '')
    })
  }

  const checkUrl = async (url: string): Promise<LinkCheckResult> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const startTime = Date.now()
      
      // Use a proxy approach to avoid CORS issues
      const response = await fetch(`/api/tools/broken-link-checker/check?url=${encodeURIComponent(url)}`, {
        signal: controller.signal,
        method: 'GET'
      })
      
      clearTimeout(timeoutId)
      const loadTime = Date.now() - startTime

      const data = await response.json()
      
      return {
        url,
        status: data.statusCode >= 200 && data.statusCode < 400 ? 'valid' : 'broken',
        statusCode: data.statusCode,
        loadTime,
        finalUrl: data.finalUrl || url
      }
    } catch (error) {
      return {
        url,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const checkLinks = async () => {
    if (!input.trim()) return

    const urls = extractUrls(input)
    if (urls.length === 0) {
      alert('No URLs found in the input text')
      return
    }

    setIsChecking(true)
    setCheckProgress(0)
    trackUsage()

    // Initialize results
    const initialResults: LinkCheckResult[] = urls.map(url => ({
      url,
      status: 'pending'
    }))
    setResults(initialResults)

    // Process URLs in batches
    const batchSize = maxConcurrent
    let processed = 0

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (url) => {
        // Update status to checking
        setResults(prev => prev.map(r => 
          r.url === url ? { ...r, status: 'checking' } : r
        ))

        const result = await checkUrl(url)
        processed++
        setCheckProgress((processed / urls.length) * 100)
        
        return result
      })

      const batchResults = await Promise.all(batchPromises)
      
      // Update results with batch results
      setResults(prev => {
        const newResults = [...prev]
        batchResults.forEach(result => {
          const index = newResults.findIndex(r => r.url === result.url)
          if (index !== -1) {
            newResults[index] = result
          }
        })
        return newResults
      })
    }

    setIsChecking(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResults = () => {
    const validLinks = results.filter(r => r.status === 'valid')
    const brokenLinks = results.filter(r => r.status === 'broken' || r.status === 'error')
    
    const report = `Broken Link Checker Report
Generated: ${new Date().toLocaleString()}

Summary:
- Total links checked: ${results.length}
- Valid links: ${validLinks.length}
- Broken links: ${brokenLinks.length}

Valid Links:
${validLinks.map(link => `- ${link.url} (${link.statusCode}) - ${link.loadTime}ms`).join('\n')}

Broken Links:
${brokenLinks.map(link => `- ${link.url} - ${link.error || `Status: ${link.statusCode}`}`).join('\n')}
`

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'broken-links-report.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setResults([])
    setCheckProgress(0)
  }

  const loadSampleData = () => {
    const sampleText = `Here are some example links to test:

Valid links:
https://www.google.com
https://www.github.com
https://www.wikipedia.org

Potentially broken links:
https://this-domain-does-not-exist-12345.com
https://example.com/nonexistent-page-404

Mixed content:
Check out this article: https://www.example.com/article
Visit our homepage: https://www.example.com
Download the file: https://www.example.com/file.pdf`

    setInput(sampleText)
    trackUsage()
  }

  const getStatusIcon = (status: LinkCheckResult['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'broken':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      default:
        return <Link className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (result: LinkCheckResult) => {
    switch (result.status) {
      case 'valid':
        return <Badge variant="outline" className="text-green-600 border-green-200">Valid ({result.statusCode})</Badge>
      case 'broken':
        return <Badge variant="outline" className="text-red-600 border-red-200">Broken ({result.statusCode})</Badge>
      case 'error':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Error</Badge>
      case 'checking':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Checking...</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const validLinks = results.filter(r => r.status === 'valid')
  const brokenLinks = results.filter(r => r.status === 'broken' || r.status === 'error')

  return (
    <ToolLayout
      toolId="broken-link-checker"
      toolName="Broken Link Checker"
      toolDescription="Check URLs for validity and identify broken links in your content"
      toolCategory="SEO Tools"
      toolIcon={<Search className="w-8 h-8" />}
      action={{
        label: "Check Links",
        onClick: checkLinks,
        loading: isChecking,
        disabled: !input.trim() || isChecking
      }}
    >
      <div className="space-y-6">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Checker Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-concurrent">Max Concurrent Requests</Label>
                <Input
                  id="max-concurrent"
                  type="number"
                  min="1"
                  max="20"
                  value={maxConcurrent}
                  onChange={(e) => setMaxConcurrent(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1000"
                  max="60000"
                  value={timeout}
                  onChange={(e) => setTimeout(Math.max(1000, Math.min(60000, parseInt(e.target.value) || 10000)))}
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadSampleData}>
                    <FileText className="w-4 h-4 mr-1" />
                    Load Sample
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll} disabled={isChecking}>
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">Input Text</TabsTrigger>
            <TabsTrigger value="results">Check Results</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Text with URLs</CardTitle>
                <CardDescription>
                  Paste your content containing URLs to check for broken links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste your text here... The tool will automatically extract and check all URLs found in the text.

Example:
Visit https://www.example.com for more information.
Check out https://www.google.com and https://github.com."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={10}
                    className="resize-none"
                  />
                </div>

                {input && (
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      <Link className="w-3 h-3 mr-1" />
                      {extractUrls(input).length} URLs found
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Link Check Results</CardTitle>
                <CardDescription>
                  Status of each URL found in your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isChecking && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Checking links...</span>
                      <span className="text-sm font-medium">{Math.round(checkProgress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${checkProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(result.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">{result.url}</h4>
                                {getStatusBadge(result)}
                              </div>
                              {result.loadTime && (
                                <p className="text-xs text-muted-foreground">
                                  Load time: {result.loadTime}ms
                                </p>
                              )}
                              {result.error && (
                                <p className="text-xs text-red-600">
                                  Error: {result.error}
                                </p>
                              )}
                              {result.finalUrl && result.finalUrl !== result.url && (
                                <p className="text-xs text-blue-600">
                                  Redirected to: {result.finalUrl}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(result.url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.url)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.length === 0 && !isChecking && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No results yet</h3>
                    <p className="text-muted-foreground">
                      Enter some text with URLs and click "Check Links" to start
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Valid Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{validLinks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Broken Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{brokenLinks.length}</div>
                </CardContent>
              </Card>
            </div>

            {brokenLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Broken Links Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {brokenLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium truncate flex-1">{link.url}</span>
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {link.error || `Status ${link.statusCode}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Export Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadResults} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Full Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">About Broken Link Checking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Why Check Links?</h4>
                  <p className="text-muted-foreground">
                    Broken links hurt user experience, SEO rankings, and site credibility. Regular checking helps maintain link quality.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Common Issues</h4>
                  <p className="text-muted-foreground">
                    404 errors, domain expiration, server downtime, incorrect URLs, and moved content are common causes of broken links.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Best Practices</h4>
                  <p className="text-muted-foreground">
                    Check links regularly, use permanent redirects when moving content, and monitor external link quality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Batch Processing</h4>
                  <p className="text-muted-foreground">
                    Check multiple URLs simultaneously with configurable concurrency limits.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Detailed Results</h4>
                  <p className="text-muted-foreground">
                    Get status codes, load times, error messages, and redirect information for each URL.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Export Reports</h4>
                  <p className="text-muted-foreground">
                    Generate comprehensive reports with summaries and detailed breakdowns for documentation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  )
}