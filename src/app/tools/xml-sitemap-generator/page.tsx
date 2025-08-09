'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, Plus, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: string
}

class XmlSitemapGenerator {
  static [key: string]: any;
}

export default function XmlSitemapGeneratorTool() {
  const [domain, setDomain] = useState('')
  const [urls, setUrls] = useState<SitemapUrl[]>([
    {
      loc: '',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    }
  ])
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('xml')

  const changeFrequencies = [
    { value: 'always', label: 'Always' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'never', label: 'Never' }
  ]

  const addUrl = () => {
    setUrls([...urls, {
      loc: '',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    }])
  }

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index))
    }
  }

  const updateUrl = (index: number, field: keyof SitemapUrl, value: string) => {
    const updatedUrls = [...urls]
    updatedUrls[index] = { ...updatedUrls[index], [field]: value }
    setUrls(updatedUrls)
  }

  const generateSitemap = async () => {
    if (!domain.trim()) {
      toast.error('Please enter your domain')
      return
    }

    if (urls.some(url => !url.loc.trim())) {
      toast.error('Please fill in all URL fields')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (selectedFormat === 'xml') {
        let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`
        xmlContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
        
        urls.forEach(url => {
          xmlContent += `  <url>\n`
          xmlContent += `    <loc>https://${domain}${url.loc}</loc>\n`
          xmlContent += `    <lastmod>${url.lastmod}</lastmod>\n`
          xmlContent += `    <changefreq>${url.changefreq}</changefreq>\n`
          xmlContent += `    <priority>${url.priority}</priority>\n`
          xmlContent += `  </url>\n`
        })
        
        xmlContent += `</urlset>\n`
        setGeneratedContent(xmlContent)
      } else {
        // Generate sitemap.txt
        let txtContent = `# Sitemap for ${domain}\n`
        txtContent += `# Generated on ${new Date().toLocaleDateString()}\n\n`
        
        urls.forEach(url => {
          txtContent += `https://${domain}${url.loc}\n`
        })
        
        setGeneratedContent(txtContent)
      }
      
      toast.success('Sitemap generated successfully!')
    } catch (error) {
      toast.error('Failed to generate sitemap')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    const filename = selectedFormat === 'xml' ? 'sitemap.xml' : 'sitemap.txt'
    const blob = new Blob([generatedContent], { type: selectedFormat === 'xml' ? 'application/xml' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`${filename} downloaded!`)
  }

  const openInNewTab = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent], { type: selectedFormat === 'xml' ? 'application/xml' : 'text/plain' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">XML Sitemap Generator</h1>
        <p className="text-muted-foreground">
          Generate XML and text sitemaps to help search engines crawl your website
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
            <CardTitle>Sitemap Format</CardTitle>
            <CardDescription>Choose the sitemap format</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedFormat} onValueChange={setSelectedFormat}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="xml">XML Sitemap</TabsTrigger>
                <TabsTrigger value="txt">Text Sitemap</TabsTrigger>
              </TabsList>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">
                  {selectedFormat === 'xml' ? 'XML Sitemap' : 'Text Sitemap'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedFormat === 'xml' 
                    ? 'XML sitemap format for search engines like Google, Bing, and Yahoo'
                    : 'Simple text sitemap format for basic website indexing'
                  }
                </p>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL List</CardTitle>
            <CardDescription>Add URLs to include in your sitemap</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Website URLs</h4>
                <Button onClick={addUrl} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
              
              {urls.map((url, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">URL Path *</label>
                      <Input
                        placeholder="/"
                        value={url.loc}
                        onChange={(e) => updateUrl(index, 'loc', e.target.value)}
                      />
                    </div>
                    {urls.length > 1 && (
                      <Button
                        onClick={() => removeUrl(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Modified</label>
                      <Input
                        type="date"
                        value={url.lastmod}
                        onChange={(e) => updateUrl(index, 'lastmod', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Change Frequency</label>
                      <select
                        value={url.changefreq}
                        onChange={(e) => updateUrl(index, 'changefreq', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        {changeFrequencies.map(freq => (
                          <option key={freq.value} value={freq.value}>{freq.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Priority (0.0-1.0)</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={url.priority}
                        onChange={(e) => updateUrl(index, 'priority', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate Sitemap</CardTitle>
            <CardDescription>Click the button to generate your sitemap</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateSitemap}
              disabled={isGenerating || !domain.trim() || urls.some(url => !url.loc.trim())}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating sitemap...
                </>
              ) : (
                'Generate Sitemap'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Sitemap</CardTitle>
            <CardDescription>Your sitemap content will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Generating sitemap...</span>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {selectedFormat === 'xml' ? 'XML' : 'Text'} sitemap generated for {domain}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={openInNewTab}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
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
                      <div className="text-2xl font-bold text-blue-600">{urls.length}</div>
                      <div className="text-sm text-muted-foreground">URLs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {urls.filter(url => url.priority === '1.0').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Priority 1.0</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {urls.filter(url => url.changefreq === 'daily').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Daily Updates</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedFormat === 'xml' ? 'XML' : 'TXT'}
                      </div>
                      <div className="text-sm text-muted-foreground">Format</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No sitemap generated yet</p>
                <p className="text-sm mt-2">Add URLs and click generate to see your sitemap</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sitemap Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">📋 Submit to Search Engines</h4>
                <p className="text-sm text-muted-foreground">
                  After generating your sitemap, submit it to search engines:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Google Search Console</li>
                  <li>• Bing Webmaster Tools</li>
                  <li>• Yandex Webmaster</li>
                  <li>• Add to robots.txt</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">💡 Best Practices</h4>
                <p className="text-sm text-muted-foreground">
                  Tips for effective sitemaps:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Keep under 50,000 URLs</li>
                  <li>• File size under 50MB</li>
                  <li>• Update regularly</li>
                  <li>• Use proper priorities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}