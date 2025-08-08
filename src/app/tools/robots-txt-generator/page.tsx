'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Rule {
  userAgent: string
  disallow: string[]
  allow: string[]
  crawlDelay: string
}

export default function RobotsTxtGenerator() {
  const [domain, setDomain] = useState('')
  const [rules, setRules] = useState<Rule[]>([
    {
      userAgent: '*',
      disallow: ['/admin/', '/private/', '/tmp/'],
      allow: ['/public/'],
      crawlDelay: ''
    }
  ])
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const userAgents = [
    { id: '*', name: 'All User Agents' },
    { id: 'Googlebot', name: 'Google' },
    { id: 'Bingbot', name: 'Bing' },
    { id: 'Slurp', name: 'Yahoo' },
    { id: 'DuckDuckBot', name: 'DuckDuckGo' },
    { id: 'Baiduspider', name: 'Baidu' }
  ]

  const addRule = () => {
    setRules([...rules, {
      userAgent: '*',
      disallow: [],
      allow: [],
      crawlDelay: ''
    }])
  }

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index))
    }
  }

  const updateRule = (index: number, field: keyof Rule, value: string | string[]) => {
    const updatedRules = [...rules]
    updatedRules[index] = { ...updatedRules[index], [field]: value }
    setRules(updatedRules)
  }

  const addDisallow = (ruleIndex: number, path: string) => {
    if (!path.trim()) return
    const updatedRules = [...rules]
    updatedRules[ruleIndex].disallow = [...updatedRules[ruleIndex].disallow, path]
    setRules(updatedRules)
  }

  const removeDisallow = (ruleIndex: number, pathIndex: number) => {
    const updatedRules = [...rules]
    updatedRules[ruleIndex].disallow = updatedRules[ruleIndex].disallow.filter((_, i) => i !== pathIndex)
    setRules(updatedRules)
  }

  const addAllow = (ruleIndex: number, path: string) => {
    if (!path.trim()) return
    const updatedRules = [...rules]
    updatedRules[ruleIndex].allow = [...updatedRules[ruleIndex].allow, path]
    setRules(updatedRules)
  }

  const removeAllow = (ruleIndex: number, pathIndex: number) => {
    const updatedRules = [...rules]
    updatedRules[ruleIndex].allow = updatedRules[ruleIndex].allow.filter((_, i) => i !== pathIndex)
    setRules(updatedRules)
  }

  const generateRobotsTxt = async () => {
    if (!domain.trim()) {
      toast.error('Please enter your domain')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let content = `# robots.txt for ${domain}\n`
      content += `# Generated on ${new Date().toLocaleDateString()}\n\n`
      
      rules.forEach((rule, index) => {
        content += `User-agent: ${rule.userAgent}\n`
        
        rule.disallow.forEach(path => {
          content += `Disallow: ${path}\n`
        })
        
        rule.allow.forEach(path => {
          content += `Allow: ${path}\n`
        })
        
        if (rule.crawlDelay) {
          content += `Crawl-delay: ${rule.crawlDelay}\n`
        }
        
        content += '\n'
      })
      
      // Add sitemap if domain is provided
      if (domain) {
        content += `Sitemap: https://${domain}/sitemap.xml\n`
      }
      
      setGeneratedContent(content)
      toast.success('robots.txt generated successfully!')
    } catch (error) {
      toast.error('Failed to generate robots.txt')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'robots.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('robots.txt downloaded!')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Robots.txt Generator</h1>
        <p className="text-muted-foreground">
          Generate robots.txt files to control search engine crawling behavior
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Information</CardTitle>
            <CardDescription>Enter your domain name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Domain *</label>
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crawling Rules</CardTitle>
            <CardDescription>Configure rules for search engine crawlers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">User Agent Rules</h4>
                <Button onClick={addRule} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
              
              {rules.map((rule, ruleIndex) => (
                <div key={ruleIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">User Agent</label>
                      <select
                        value={rule.userAgent}
                        onChange={(e) => updateRule(ruleIndex, 'userAgent', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        {userAgents.map(ua => (
                          <option key={ua.id} value={ua.id}>{ua.name}</option>
                        ))}
                      </select>
                    </div>
                    {rules.length > 1 && (
                      <Button
                        onClick={() => removeRule(ruleIndex)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Disallow Paths</label>
                      <div className="space-y-2">
                        {rule.disallow.map((path, pathIndex) => (
                          <div key={pathIndex} className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {path}
                            </Badge>
                            <Button
                              onClick={() => removeDisallow(ruleIndex, pathIndex)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="/private/"
                            value=""
                            onChange={(e) => {
                              if (e.key === 'Enter') {
                                addDisallow(ruleIndex, e.target.value)
                                e.target.value = ''
                              }
                            }}
                            className="flex-1 text-sm"
                          />
                          <Button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="/private/"]`) as HTMLInputElement
                              if (input?.value.trim()) {
                                addDisallow(ruleIndex, input.value.trim())
                                input.value = ''
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Allow Paths</label>
                      <div className="space-y-2">
                        {rule.allow.map((path, pathIndex) => (
                          <div key={pathIndex} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {path}
                            </Badge>
                            <Button
                              onClick={() => removeAllow(ruleIndex, pathIndex)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="/public/"
                            value=""
                            onChange={(e) => {
                              if (e.key === 'Enter') {
                                addAllow(ruleIndex, e.target.value)
                                e.target.value = ''
                              }
                            }}
                            className="flex-1 text-sm"
                          />
                          <Button
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="/public/"]`) as HTMLInputElement
                              if (input?.value.trim()) {
                                addAllow(ruleIndex, input.value.trim())
                                input.value = ''
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Crawl Delay (seconds)</label>
                    <Input
                      placeholder="1"
                      value={rule.crawlDelay}
                      onChange={(e) => updateRule(ruleIndex, 'crawlDelay', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate robots.txt</CardTitle>
            <CardDescription>Click the button to generate your robots.txt file</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateRobotsTxt}
              disabled={isGenerating || !domain.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating robots.txt...
                </>
              ) : (
                'Generate robots.txt'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated robots.txt</CardTitle>
            <CardDescription>Your robots.txt content will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Generating robots.txt...</span>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    robots.txt generated for {domain}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => copyToClipboard(generatedContent)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      onClick={downloadAsFile}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {generatedContent}
                  </pre>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
                      <div className="text-sm text-muted-foreground">User Agents</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {rules.reduce((acc, rule) => acc + rule.disallow.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Disallowed Paths</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {rules.reduce((acc, rule) => acc + rule.allow.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Allowed Paths</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {rules.filter(rule => rule.crawlDelay).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Crawl Delays</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No robots.txt generated yet</p>
                <p className="text-sm mt-2">Configure your rules and click generate to see the result</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Do</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use specific user agents for different search engines</li>
                  <li>• Disallow sensitive areas like admin panels</li>
                  <li>• Allow public content to be crawled</li>
                  <li>• Include a sitemap URL</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">✗ Don't</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Block important content that should be indexed</li>
                  <li>• Use wildcards excessively</li>
                  <li>• Forget to test your robots.txt</li>
                  <li>• Block CSS and JavaScript files</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}