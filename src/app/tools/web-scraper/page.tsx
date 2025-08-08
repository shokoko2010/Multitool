'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, ExternalLink, Loader2, Globe, FileText, Code } from 'lucide-react'

interface ScrapedData {
  title: string
  description: string
  headings: { level: number; text: string }[]
  links: { text: string; href: string }[]
  images: { src: string; alt: string }[]
  paragraphs: string[]
  metadata: { [key: string]: string }
}

export default function WebScraper() {
  const [url, setUrl] = useState('')
  const [selector, setSelector] = useState('')
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [rawHtml, setRawHtml] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [extractType, setExtractType] = useState<'full' | 'selector'>('full')

  const scrapeWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Using CORS proxy to avoid CORS issues
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()

      if (data.contents) {
        const html = data.contents
        setRawHtml(html)

        if (extractType === 'full') {
          const parsedData = parseFullHtml(html)
          setScrapedData(parsedData)
        } else {
          const selectedData = extractBySelector(html, selector)
          setScrapedData({
            title: '',
            description: '',
            headings: [],
            links: [],
            images: [],
            paragraphs: [selectedData],
            metadata: {}
          })
        }
      } else {
        throw new Error('Failed to fetch website content')
      }
    } catch (err) {
      setError('Failed to scrape website: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const parseFullHtml = (html: string): ScrapedData => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const title = doc.querySelector('title')?.textContent || ''
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    
    const headings: { level: number; text: string }[] = []
    for (let i = 1; i <= 6; i++) {
      const elements = doc.querySelectorAll(`h${i}`)
      elements.forEach(el => {
        headings.push({ level: i, text: el.textContent || '' })
      })
    }

    const links: { text: string; href: string }[] = []
    doc.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href')
      if (href && href.startsWith('http')) {
        links.push({ text: el.textContent || '', href })
      }
    })

    const images: { src: string; alt: string }[] = []
    doc.querySelectorAll('img[src]').forEach(el => {
      const src = el.getAttribute('src')
      const alt = el.getAttribute('alt') || ''
      if (src) {
        images.push({ src, alt })
      }
    })

    const paragraphs: string[] = []
    doc.querySelectorAll('p').forEach(el => {
      const text = el.textContent
      if (text && text.trim().length > 10) {
        paragraphs.push(text.trim())
      }
    })

    const metadata: { [key: string]: string } = {}
    doc.querySelectorAll('meta').forEach(el => {
      const name = el.getAttribute('name') || el.getAttribute('property')
      const content = el.getAttribute('content')
      if (name && content) {
        metadata[name] = content
      }
    })

    return {
      title,
      description,
      headings: headings.sort((a, b) => a.level - b.level),
      links: links.slice(0, 20), // Limit to first 20 links
      images: images.slice(0, 10), // Limit to first 10 images
      paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
      metadata
    }
  }

  const extractBySelector = (html: string, selector: string): string => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const element = doc.querySelector(selector)
      return element?.textContent || 'No elements found'
    } catch {
      return 'Invalid selector'
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadData = (format: 'json' | 'csv' | 'txt') => {
    if (!scrapedData) return

    let content = ''
    let filename = `scraped-data.${format}`

    if (format === 'json') {
      content = JSON.stringify(scrapedData, null, 2)
    } else if (format === 'csv') {
      content = 'Type,Content\n'
      content += `Title,${scrapedData.title}\n`
      content += `Description,${scrapedData.description}\n`
      scrapedData.headings.forEach(h => {
        content += `Heading H${h.level},"${h.text}"\n`
      })
      scrapedData.paragraphs.forEach((p, i) => {
        content += `Paragraph ${i + 1},"${p}"\n`
      })
    } else if (format === 'txt') {
      content = `Website Scraping Results\n`
      content += `========================\n\n`
      content += `Title: ${scrapedData.title}\n`
      content += `Description: ${scrapedData.description}\n\n`
      
      content += `Headings:\n`
      scrapedData.headings.forEach(h => {
        content += `${'  '.repeat(h.level - 1)}- ${h.text}\n`
      })
      
      content += `\nParagraphs:\n`
      scrapedData.paragraphs.forEach((p, i) => {
        content += `Paragraph ${i + 1}: ${p}\n`
      })
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSampleUrl = () => {
    setUrl('https://example.com')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Web Scraper</h1>
        <p className="text-muted-foreground">
          Extract content from websites and analyze their structure
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Scrape Website
            </CardTitle>
            <CardDescription>
              Enter a URL to extract content and analyze the website structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Extraction Type</label>
              <Select value={extractType} onValueChange={(value: 'full' | 'selector') => setExtractType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Page Analysis</SelectItem>
                  <SelectItem value="selector">Custom Selector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {extractType === 'selector' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">CSS Selector</label>
                <Input
                  placeholder="e.g., .content, div#main, p"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Examples: .content, div#main, p, h1, .article
                </p>
              </div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={scrapeWebsite} 
                disabled={isLoading || !url.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Scrape Website
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={loadSampleUrl}>
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {scrapedData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scraped Content</CardTitle>
                  <CardDescription>
                    Extracted data from {url}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(JSON.stringify(scrapedData, null, 2))}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                  </Button>
                  <Select onValueChange={(value: 'json' | 'csv' | 'txt') => downloadData(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Download" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="txt">TXT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="raw">Raw HTML</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Title</h4>
                      <p className="text-sm bg-muted p-3 rounded">{scrapedData.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm bg-muted p-3 rounded">{scrapedData.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{scrapedData.headings.length}</div>
                      <div className="text-sm text-muted-foreground">Headings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{scrapedData.links.length}</div>
                      <div className="text-sm text-muted-foreground">Links</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{scrapedData.images.length}</div>
                      <div className="text-sm text-muted-foreground">Images</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{scrapedData.paragraphs.length}</div>
                      <div className="text-sm text-muted-foreground">Paragraphs</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="structure" className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Headings Structure</h4>
                    <div className="space-y-2">
                      {scrapedData.headings.map((heading, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">H{heading.level}</Badge>
                          <span className="text-sm">{heading.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">External Links</h4>
                    <div className="space-y-2">
                      {scrapedData.links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{link.text}</span>
                          <Button size="sm" variant="ghost" onClick={() => window.open(link.href, '_blank')}>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Content Paragraphs</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {scrapedData.paragraphs.map((paragraph, index) => (
                        <div key={index} className="bg-muted p-3 rounded text-sm">
                          {paragraph}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {scrapedData.images.map((image, index) => (
                        <div key={index} className="text-center">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-20 object-cover rounded border"
                            loading="lazy"
                          />
                          <p className="text-xs text-muted-foreground mt-1 truncate">{image.alt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="raw" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Raw HTML</h4>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(rawHtml)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                      <code>{rawHtml.substring(0, 5000)}...</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {rawHtml && !scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Raw HTML
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">HTML Content</h4>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(rawHtml)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                  <code>{rawHtml.substring(0, 5000)}...</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}