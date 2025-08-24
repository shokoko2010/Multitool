'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, FileText, Globe, Calendar, Clock } from 'lucide-react'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  urls: SitemapUrl[]
  stats: {
    totalUrls: number
    uniqueUrls: Set<string>
    withLastMod: number
    withChangeFreq: number
    withPriority: number
  }
}

export default function XmlSitemapValidator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateSitemap = (xmlContent: string): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    const urls: SitemapUrl[] = []
    const uniqueUrls = new Set<string>()
    
    // Basic XML structure validation
    if (!xmlContent.includes('<?xml')) {
      errors.push('Missing XML declaration')
    }
    
    if (!xmlContent.includes('<urlset')) {
      errors.push('Missing urlset element')
    }
    
    if (!xmlContent.includes('</urlset>')) {
      errors.push('Missing closing urlset element')
    }
    
    // Extract URLs
    const urlRegex = /<url>([\s\S]*?)<\/url>/g
    let match
    while ((match = urlRegex.exec(xmlContent)) !== null) {
      const urlContent = match[1]
      const url: SitemapUrl = { loc: '' }
      
      // Extract location
      const locMatch = urlContent.match(/<loc>(.*?)<\/loc>/)
      if (locMatch) {
        url.loc = locMatch[1].trim()
        uniqueUrls.add(url.loc)
      } else {
        errors.push('URL missing required loc element')
        continue
      }
      
      // Extract last modification date
      const lastmodMatch = urlContent.match(/<lastmod>(.*?)<\/lastmod>/)
      if (lastmodMatch) {
        url.lastmod = lastmodMatch[1].trim()
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\+\d{2}:\d{2})?)?$/.test(url.lastmod)) {
          warnings.push(`Invalid date format for URL: ${url.loc}`)
        }
      }
      
      // Extract change frequency
      const changefreqMatch = urlContent.match(/<changefreq>(.*?)<\/changefreq>/)
      if (changefreqMatch) {
        url.changefreq = changefreqMatch[1].trim()
        const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
        if (!validFreqs.includes(url.changefreq)) {
          warnings.push(`Invalid changefreq value for URL: ${url.loc}`)
        }
      }
      
      // Extract priority
      const priorityMatch = urlContent.match(/<priority>(.*?)<\/priority>/)
      if (priorityMatch) {
        url.priority = priorityMatch[1].trim()
        const priority = parseFloat(url.priority)
        if (isNaN(priority) || priority < 0 || priority > 1) {
          warnings.push(`Invalid priority value for URL: ${url.loc}`)
        }
      }
      
      urls.push(url)
    }
    
    // Check for duplicate URLs
    if (urls.length !== uniqueUrls.size) {
      warnings.push('Duplicate URLs found in sitemap')
    }
    
    // Check sitemap size
    if (urls.length > 50000) {
      errors.push('Sitemap exceeds 50,000 URLs limit')
    } else if (urls.length > 1000) {
      warnings.push('Sitemap contains over 1,000 URLs - consider splitting')
    }
    
    // Check file size (rough estimate)
    const fileSizeKB = xmlContent.length / 1024
    if (fileSizeKB > 10240) { // 10MB
      errors.push('Sitemap exceeds 10MB size limit')
    } else if (fileSizeKB > 5120) { // 5MB
      warnings.push('Sitemap is over 5MB - consider compressing')
    }
    
    // Calculate statistics
    const stats = {
      totalUrls: urls.length,
      uniqueUrls,
      withLastMod: urls.filter(u => u.lastmod).length,
      withChangeFreq: urls.filter(u => u.changefreq).length,
      withPriority: urls.filter(u => u.priority).length
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      urls,
      stats
    }
  }

  const handleValidate = async () => {
    if (!input.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 500))
      const validation = validateSitemap(input)
      setResult(validation)
    } catch (error) {
      setResult({
        isValid: false,
        errors: ['Failed to validate sitemap: ' + (error as Error).message],
        warnings: [],
        urls: [],
        stats: {
          totalUrls: 0,
          uniqueUrls: new Set(),
          withLastMod: 0,
          withChangeFreq: 0,
          withPriority: 0
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadExample = () => {
    setInput(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2024-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <lastmod>2024-01-14T10:30:00+00:00</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            XML Sitemap Validator
          </CardTitle>
          <CardDescription>
            Validate XML sitemaps for SEO compliance, check for errors, and analyze URL statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sitemap-input">XML Sitemap Content</Label>
              <Textarea
                id="sitemap-input"
                placeholder="Paste your XML sitemap content here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-48 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleValidate} disabled={!input.trim() || isLoading} className="flex-1">
                {isLoading ? 'Validating...' : 'Validate Sitemap'}
              </Button>
              <Button onClick={loadExample} variant="outline">
                Load Example
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-6">
              {/* Validation Summary */}
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                {result.isValid ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {result.isValid ? 'Sitemap is Valid' : 'Sitemap has Issues'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.errors.length} errors, {result.warnings.length} warnings
                  </p>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <strong>Errors:</strong>
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm">• {error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <strong>Warnings:</strong>
                      {result.warnings.map((warning, index) => (
                        <div key={index} className="text-sm">• {warning}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sitemap Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.totalUrls}</div>
                      <div className="text-sm text-muted-foreground">Total URLs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.uniqueUrls.size}</div>
                      <div className="text-sm text-muted-foreground">Unique URLs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.withLastMod}</div>
                      <div className="text-sm text-muted-foreground">With LastMod</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.withPriority}</div>
                      <div className="text-sm text-muted-foreground">With Priority</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* URL List */}
              {result.urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">URLs ({result.urls.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {result.urls.map((url, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <Globe className="h-4 w-4 mt-0.5 text-blue-500" />
                            <a 
                              href={url.loc} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-mono hover:underline break-all"
                            >
                              {url.loc}
                            </a>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {url.lastmod && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {url.lastmod}
                              </Badge>
                            )}
                            {url.changefreq && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {url.changefreq}
                              </Badge>
                            )}
                            {url.priority && (
                              <Badge variant="outline" className="text-xs">
                                Priority: {url.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}