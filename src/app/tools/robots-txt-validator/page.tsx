'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, FileText, Bot, Globe, Ban, Search } from 'lucide-react'

interface RobotsRule {
  userAgent: string
  directives: Array<{
    type: 'allow' | 'disallow' | 'crawl-delay' | 'sitemap'
    value: string
  }>
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  rules: RobotsRule[]
  sitemaps: string[]
  stats: {
    totalRules: number
    userAgents: string[]
    disallowCount: number
    allowCount: number
  }
}

export default function RobotsTxtValidator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateRobotsTxt = (content: string): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    const rules: RobotsRule[] = []
    const sitemaps: string[] = []
    const userAgents = new Set<string>()
    
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'))
    
    let currentRule: RobotsRule | null = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      const originalLine = lines[i]
      
      if (line.startsWith('user-agent:')) {
        // Start new rule group
        const userAgent = line.substring('user-agent:'.length).trim()
        if (!userAgent) {
          errors.push(`Line ${i + 1}: User-agent cannot be empty`)
          continue
        }
        
        currentRule = {
          userAgent,
          directives: []
        }
        rules.push(currentRule)
        userAgents.add(userAgent)
      } else if (line.startsWith('disallow:')) {
        const value = originalLine.substring('disallow:'.length).trim()
        if (!currentRule) {
          errors.push(`Line ${i + 1}: Disallow directive without User-agent`)
          continue
        }
        currentRule.directives.push({ type: 'disallow', value })
      } else if (line.startsWith('allow:')) {
        const value = originalLine.substring('allow:'.length).trim()
        if (!currentRule) {
          errors.push(`Line ${i + 1}: Allow directive without User-agent`)
          continue
        }
        currentRule.directives.push({ type: 'allow', value })
      } else if (line.startsWith('crawl-delay:')) {
        const value = originalLine.substring('crawl-delay:'.length).trim()
        if (!currentRule) {
          errors.push(`Line ${i + 1}: Crawl-delay directive without User-agent`)
          continue
        }
        currentRule.directives.push({ type: 'crawl-delay', value })
        // Validate crawl-delay value
        const delay = parseFloat(value)
        if (isNaN(delay) || delay < 0) {
          warnings.push(`Line ${i + 1}: Invalid crawl-delay value: ${value}`)
        }
      } else if (line.startsWith('sitemap:')) {
        const sitemap = originalLine.substring('sitemap:'.length).trim()
        if (!sitemap) {
          errors.push(`Line ${i + 1}: Sitemap URL cannot be empty`)
          continue
        }
        if (!sitemap.startsWith('http://') && !sitemap.startsWith('https://')) {
          warnings.push(`Line ${i + 1}: Sitemap URL should start with http:// or https://`)
        }
        sitemaps.push(sitemap)
      } else {
        warnings.push(`Line ${i + 1}: Unrecognized directive: ${originalLine}`)
      }
    }
    
    // Check for common issues
    if (rules.length === 0) {
      warnings.push('No rules found - consider adding at least a basic User-agent directive')
    }
    
    // Check for wildcard user-agent
    if (!userAgents.has('*')) {
      warnings.push('No wildcard (*) User-agent found - consider adding one for general bots')
    }
    
    // Check for sitemap
    if (sitemaps.length === 0) {
      warnings.push('No sitemap specified - consider adding a Sitemap directive')
    }
    
    // Calculate statistics
    let disallowCount = 0
    let allowCount = 0
    
    rules.forEach(rule => {
      rule.directives.forEach(directive => {
        if (directive.type === 'disallow') disallowCount++
        if (directive.type === 'allow') allowCount++
      })
    })
    
    const stats = {
      totalRules: rules.length,
      userAgents: Array.from(userAgents),
      disallowCount,
      allowCount
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rules,
      sitemaps,
      stats
    }
  }

  const handleValidate = async () => {
    if (!input.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 500))
      const validation = validateRobotsTxt(input)
      setResult(validation)
    } catch (error) {
      setResult({
        isValid: false,
        errors: ['Failed to validate robots.txt: ' + (error as Error).message],
        warnings: [],
        rules: [],
        sitemaps: [],
        stats: {
          totalRules: 0,
          userAgents: [],
          disallowCount: 0,
          allowCount: 0
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadExample = () => {
    setInput(`User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/

User-agent: Googlebot
Disallow: /temp/
Crawl-delay: 1

User-agent: Bingbot
Disallow: /search/

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-pages.xml`)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Robots.txt Validator
          </CardTitle>
          <CardDescription>
            Validate robots.txt files for syntax errors, check SEO best practices, and analyze crawling rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="robots-input">Robots.txt Content</Label>
              <Textarea
                id="robots-input"
                placeholder="Paste your robots.txt content here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-48 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleValidate} disabled={!input.trim() || isLoading} className="flex-1">
                {isLoading ? 'Validating...' : 'Validate Robots.txt'}
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
                    {result.isValid ? 'Robots.txt is Valid' : 'Robots.txt has Issues'}
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
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.totalRules}</div>
                      <div className="text-sm text-muted-foreground">Rule Groups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.userAgents.length}</div>
                      <div className="text-sm text-muted-foreground">User Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.disallowCount}</div>
                      <div className="text-sm text-muted-foreground">Disallow Rules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.stats.allowCount}</div>
                      <div className="text-sm text-muted-foreground">Allow Rules</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sitemaps */}
              {result.sitemaps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Sitemaps ({result.sitemaps.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.sitemaps.map((sitemap, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <Search className="h-4 w-4 text-blue-500" />
                          <a 
                            href={sitemap} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-mono hover:underline break-all"
                          >
                            {sitemap}
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rules */}
              {result.rules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Crawling Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {result.rules.map((rule, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Bot className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">User-agent: {rule.userAgent}</span>
                          </div>
                          <div className="space-y-2">
                            {rule.directives.map((directive, dirIndex) => (
                              <div key={dirIndex} className="flex items-center gap-2 text-sm">
                                {directive.type === 'disallow' ? (
                                  <Ban className="h-3 w-3 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {directive.type.toUpperCase()}: {directive.value}
                                </span>
                              </div>
                            ))}
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