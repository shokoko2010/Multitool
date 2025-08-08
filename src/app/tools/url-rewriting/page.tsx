'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, ExternalLink, Hash, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface RewriteRule {
  pattern: string
  replacement: string
  flags: string[]
  description: string
}

export default function URLRewritingTool() {
  const [inputUrl, setInputUrl] = useState('')
  const [outputUrl, setOutputUrl] = useState('')
  const [rewriteRules, setRewriteRules] = useState<RewriteRule[]>([
    {
      pattern: '^/old-page/(.*)$',
      replacement: '/new-page/$1',
      flags: ['L'],
      description: 'Redirect old page URLs to new page URLs'
    },
    {
      pattern: '^/products/([0-9]+)/?$',
      replacement: '/product?id=$1',
      flags: ['L'],
      description: 'Convert product URLs to query string format'
    },
    {
      pattern: '^/category/(.*)/page/([0-9]+)/?$',
      replacement: '/category/$1?page=$2',
      flags: ['L'],
      description: 'Handle pagination in category URLs'
    }
  ])
  const [isRewriting, setIsRewriting] = useState(false)
  const [selectedTab, setSelectedTab] = useState('basic')

  const rewriteUrl = async () => {
    if (!inputUrl.trim()) {
      toast.error('Please enter a URL to rewrite')
      return
    }

    setIsRewriting(true)
    try {
      // Simulate URL rewriting process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Apply rewrite rules to the URL
      let rewrittenUrl = inputUrl
      
      rewriteRules.forEach(rule => {
        const regex = new RegExp(rule.pattern, rule.flags.join(''))
        rewrittenUrl = rewrittenUrl.replace(regex, rule.replacement)
      })
      
      setOutputUrl(rewrittenUrl)
      toast.success('URL rewritten successfully!')
    } catch (error) {
      toast.error('Failed to rewrite URL')
    } finally {
      setIsRewriting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    const content = `# URL Rewriting Rules\n\n${rewriteRules.map((rule, index) => 
      `## Rule ${index + 1}\n` +
      `Pattern: ${rule.pattern}\n` +
      `Replacement: ${rule.replacement}\n` +
      `Flags: ${rule.flags.join(', ')}\n` +
      `Description: ${rule.description}\n\n`
    ).join('')}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'url-rewriting-rules.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Rules downloaded!')
  }

  const addRule = () => {
    setRewriteRules([...rewriteRules, {
      pattern: '',
      replacement: '',
      flags: ['L'],
      description: ''
    }])
  }

  const removeRule = (index: number) => {
    if (rewriteRules.length > 1) {
      setRewriteRules(rewriteRules.filter((_, i) => i !== index))
    }
  }

  const updateRule = (index: number, field: keyof RewriteRule, value: string | string[]) => {
    const updatedRules = [...rewriteRules]
    updatedRules[index] = { ...updatedRules[index], [field]: value }
    setRewriteRules(updatedRules)
  }

  const testRule = (rule: RewriteRule, url: string) => {
    try {
      const regex = new RegExp(rule.pattern, rule.flags.join(''))
      const result = url.replace(regex, rule.replacement)
      return result
    } catch (error) {
      return 'Invalid regex pattern'
    }
  }

  const flags = [
    { value: 'L', label: 'Last - Stop processing rules' },
    { value: 'R', label: 'Redirect - Redirect to new URL' },
    { value: 'NC', label: 'No Case - Case insensitive' },
    { value: 'QSA', label: 'Query String Append - Preserve query string' },
    { value: 'F', label: 'Forbidden - Return 403 error' },
    { value: 'G', label: 'Gone - Return 410 error' }
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Rewriting Tool</h1>
        <p className="text-muted-foreground">
          Create and test URL rewriting rules for clean, SEO-friendly URLs
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>URL Rewriter</CardTitle>
            <CardDescription>Enter a URL to apply rewriting rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Input URL *</label>
                <Input
                  placeholder="https://example.com/old-page/some-content"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={rewriteUrl}
                disabled={isRewriting || !inputUrl.trim()}
                className="w-full"
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rewriting URL...
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 mr-2" />
                    Rewrite URL
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {outputUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Rewritten URL</CardTitle>
              <CardDescription>Your URL after applying rewrite rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Output URL</label>
                  <div className="flex items-center gap-2">
                    <Input value={outputUrl} readOnly className="flex-1" />
                    <Button 
                      onClick={() => copyToClipboard(outputUrl)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => window.open(outputUrl, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => setOutputUrl('')} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={downloadAsFile} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Rules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rewrite Rules</CardTitle>
            <CardDescription>Configure URL rewriting rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Rewriting Rules</h4>
                <Button onClick={addRule} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
              
              <div className="space-y-4">
                {rewriteRules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium">Rule {index + 1}</h5>
                      {rewriteRules.length > 1 && (
                        <Button 
                          onClick={() => removeRule(index)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Pattern *</label>
                      <Input
                        placeholder="^/old-page/(.*)$"
                        value={rule.pattern}
                        onChange={(e) => updateRule(index, 'pattern', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Replacement *</label>
                      <Input
                        placeholder="/new-page/$1"
                        value={rule.replacement}
                        onChange={(e) => updateRule(index, 'replacement', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Flags</label>
                      <div className="flex flex-wrap gap-2">
                        {flags.map(flag => (
                          <Badge 
                            key={flag.value}
                            variant={rule.flags.includes(flag.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const updatedFlags = rule.flags.includes(flag.value)
                                ? rule.flags.filter(f => f !== flag.value)
                                : [...rule.flags, flag.value]
                              updateRule(index, 'flags', updatedFlags)
                            }}
                          >
                            {flag.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <Input
                        placeholder="Describe what this rule does"
                        value={rule.description}
                        onChange={(e) => updateRule(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    {inputUrl && (
                      <div>
                        <label className="text-sm font-medium mb-1 block">Test Result</label>
                        <div className="p-2 bg-muted rounded text-sm font-mono">
                          {testRule(rule, inputUrl)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Rewrite Patterns</CardTitle>
            <CardDescription>Popular URL rewriting patterns and examples</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="seo">SEO Friendly</TabsTrigger>
                <TabsTrigger value="redirects">Redirects</TabsTrigger>
                <TabsTrigger value="cleanup">Cleanup</TabsTrigger>
              </TabsList>
              
              <TabsContent value="seo" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">Remove .php Extension</h5>
                    <div className="text-sm font-mono mb-2">
                      RewriteRule ^(.+)\.php$ /$1 [L,R=301]
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Removes .php extensions from URLs
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">Add WWW Prefix</h5>
                    <div className="text-sm font-mono mb-2">
                      RewriteCond %{HTTP_HOST} ^example.com$ [NC]
                      RewriteRule ^(.*)$ https://www.example.com/$1 [L,R=301]
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Redirects to www version
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">Force HTTPS</h5>
                    <div className="text-sm font-mono mb-2">
                      RewriteCond %{HTTPS} off
                      RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Forces HTTPS redirection
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">Remove Trailing Slash</h5>
                    <div className="text-sm font-mono mb-2">
                      RewriteRule ^(.+)/$ /$1 [L,R=301]
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Removes trailing slashes
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="redirects" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">301 Redirect</h5>
                    <div className="text-sm font-mono mb-2">
                      Redirect 301 /old-page.html /new-page.html
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Permanent redirect
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">302 Redirect</h5>
                    <div className="text-sm font-mono mb-2">
                      Redirect 302 /temp-page /permanent-page
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Temporary redirect
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cleanup" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">Remove Index.php</h5>
                    <div className="text-sm font-mono mb-2">
                      RewriteCond %{THE_REQUEST} /index\.php [NC]
                      RewriteRule ^(.*)index\.php(/(.*))?$ /$2 [NC,L,R=301]
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Removes index.php from URLs
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium mb-2">Remove Double Slashes</h5>
                    <div className="text-sm font-mono mb-2">
                      RewriteCond %{REQUEST_URI} ^/+([^/]+)
                      RewriteRule ^ /%1 [R=301,L]
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Removes multiple slashes
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}