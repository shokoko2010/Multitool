'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function MetaTagGenerator() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    author: '',
    copyright: '',
    language: 'en',
    robots: 'index,follow',
    ogType: 'website',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogUrl: '',
    ogSiteName: '',
    twitterCard: 'summary',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: ''
  })

  const [generatedTags, setGeneratedTags] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateMetaTags = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a page title')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const tags = [
        // Basic Meta Tags
        `<meta charset="UTF-8">`,
        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        formData.title ? `<title>${formData.title}</title>` : '',
        formData.description ? `<meta name="description" content="${formData.description}">` : '',
        formData.keywords ? `<meta name="keywords" content="${formData.keywords}">` : '',
        formData.author ? `<meta name="author" content="${formData.author}">` : '',
        formData.copyright ? `<meta name="copyright" content="${formData.copyright}">` : '',
        formData.language ? `<meta name="language" content="${formData.language}">` : '',
        formData.robots ? `<meta name="robots" content="${formData.robots}">` : '',
        
        // Open Graph Tags
        formData.ogType ? `<meta property="og:type" content="${formData.ogType}">` : '',
        formData.ogTitle || formData.title ? `<meta property="og:title" content="${formData.ogTitle || formData.title}">` : '',
        formData.ogDescription || formData.description ? `<meta property="og:description" content="${formData.ogDescription || formData.description}">` : '',
        formData.ogImage ? `<meta property="og:image" content="${formData.ogImage}">` : '',
        formData.ogUrl ? `<meta property="og:url" content="${formData.ogUrl}">` : '',
        formData.ogSiteName || formData.title ? `<meta property="og:site_name" content="${formData.ogSiteName || formData.title}">` : '',
        
        // Twitter Card Tags
        formData.twitterCard ? `<meta name="twitter:card" content="${formData.twitterCard}">` : '',
        formData.twitterTitle || formData.title ? `<meta name="twitter:title" content="${formData.twitterTitle || formData.title}">` : '',
        formData.twitterDescription || formData.description ? `<meta name="twitter:description" content="${formData.twitterDescription || formData.description}">` : '',
        formData.twitterImage ? `<meta name="twitter:image" content="${formData.twitterImage}">` : '',
        
        // Canonical URL
        formData.canonicalUrl ? `<link rel="canonical" href="${formData.canonicalUrl}">` : ''
      ].filter(tag => tag.trim()).join('\n')
      
      setGeneratedTags(tags)
      toast.success('Meta tags generated successfully!')
    } catch (error) {
      toast.error('Failed to generate meta tags')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    const blob = new Blob([generatedTags], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meta-tags.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Meta tags downloaded!')
  }

  const previewTags = () => {
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="${formData.language}">
        <head>
          ${generatedTags}
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .preview-section { margin-bottom: 30px; }
            .preview-section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .tag { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="preview-section">
            <h2>Meta Tags Preview</h2>
            <div>${generatedTags.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meta Tag Generator</h1>
        <p className="text-muted-foreground">
          Generate comprehensive meta tags for better SEO and social media sharing
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Meta Tags</CardTitle>
            <CardDescription>Essential meta tags for all web pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Title *</label>
                <Input
                  placeholder="Enter your page title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Author</label>
                <Input
                  placeholder="Your name or company"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Enter a brief description of your page (150-160 characters recommended)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Keywords</label>
                <Input
                  placeholder="keyword1, keyword2, keyword3"
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Copyright</label>
                <Input
                  placeholder="© 2024 Your Company"
                  value={formData.copyright}
                  onChange={(e) => handleInputChange('copyright', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Input
                  placeholder="en"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Robots</label>
                <Input
                  placeholder="index,follow"
                  value={formData.robots}
                  onChange={(e) => handleInputChange('robots', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Graph Tags</CardTitle>
            <CardDescription>Tags for social media sharing (Facebook, LinkedIn, etc.)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">OG Type</label>
                <Input
                  placeholder="website"
                  value={formData.ogType}
                  onChange={(e) => handleInputChange('ogType', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">OG Title</label>
                <Input
                  placeholder="Leave empty to use page title"
                  value={formData.ogTitle}
                  onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">OG Description</label>
                <Textarea
                  placeholder="Leave empty to use page description"
                  value={formData.ogDescription}
                  onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">OG Image URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.ogImage}
                  onChange={(e) => handleInputChange('ogImage', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">OG URL</label>
                <Input
                  placeholder="https://example.com"
                  value={formData.ogUrl}
                  onChange={(e) => handleInputChange('ogUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">OG Site Name</label>
                <Input
                  placeholder="Leave empty to use page title"
                  value={formData.ogSiteName}
                  onChange={(e) => handleInputChange('ogSiteName', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Twitter Card Tags</CardTitle>
            <CardDescription>Tags for Twitter sharing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Twitter Card Type</label>
                <Input
                  placeholder="summary"
                  value={formData.twitterCard}
                  onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Twitter Title</label>
                <Input
                  placeholder="Leave empty to use page title"
                  value={formData.twitterTitle}
                  onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Twitter Description</label>
                <Textarea
                  placeholder="Leave empty to use page description"
                  value={formData.twitterDescription}
                  onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Twitter Image URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.twitterImage}
                  onChange={(e) => handleInputChange('twitterImage', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Canonical URL</label>
                <Input
                  placeholder="https://example.com"
                  value={formData.canonicalUrl}
                  onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate Meta Tags</CardTitle>
            <CardDescription>Click the button to generate all meta tags</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateMetaTags}
              disabled={isGenerating || !formData.title.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Meta Tags...
                </>
              ) : (
                'Generate Meta Tags'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Meta Tags</CardTitle>
            <CardDescription>Your meta tags will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Generating meta tags...</span>
              </div>
            ) : generatedTags ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {generatedTags.split('\n').filter(tag => tag.trim()).length} meta tags generated
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={previewTags}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => copyToClipboard(generatedTags)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
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
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {generatedTags}
                  </pre>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <Badge variant="secondary">
                    SEO Ready
                  </Badge>
                  <Badge variant="outline">
                    Social Media Optimized
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No meta tags generated yet</p>
                <p className="text-sm mt-2">Fill in the form and click generate to see your meta tags</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}