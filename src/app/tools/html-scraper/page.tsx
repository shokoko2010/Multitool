'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Globe, Download, Copy, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

interface ScrapedData {
  title: string
  description: string
  keywords: string[]
  links: string[]
  images: string[]
  headings: { level: number; text: string }[]
  paragraphs: string[]
  tables: string[][]
  forms: { action: string; method: string; inputs: string[] }[]
  metadata: { [key: string]: string }
  rawHtml: string
  extractedText: string
}

export default function HtmlScraper() {
  const [url, setUrl] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [options, setOptions] = useState({
    extractLinks: true,
    extractImages: true,
    extractHeadings: true,
    extractParagraphs: true,
    extractTables: true,
    extractForms: true,
    extractMetadata: true,
    cleanText: true,
    limitResults: 100
  })

  const scrapeUrl = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setIsScraping(true)
    setError(null)
    setSuccess(false)
    setScrapedData(null)

    try {
      // Validate URL
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('URL must start with http:// or https://')
      }

      // Simulate scraping with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock scraped data for demonstration
      const mockData: ScrapedData = {
        title: 'Example Website Title',
        description: 'This is a sample description extracted from the webpage.',
        keywords: ['web scraping', 'html parser', 'data extraction'],
        links: [
          'https://example.com/page1',
          'https://example.com/page2',
          'https://example.com/about'
        ],
        images: [
          'https://via.placeholder.com/150',
          'https://via.placeholder.com/300',
          'https://via.placeholder.com/200'
        ],
        headings: [
          { level: 1, text: 'Main Title' },
          { level: 2, text: 'Section Title' },
          { level: 3, text: 'Subsection Title' }
        ],
        paragraphs: [
          'This is the first paragraph extracted from the webpage.',
          'This is the second paragraph with more content.',
          'A third paragraph to demonstrate the extraction functionality.'
        ],
        tables: [
          ['Header 1', 'Header 2', 'Header 3'],
          ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
          ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
        ],
        forms: [
          {
            action: '/submit-form',
            method: 'POST',
            inputs: ['name', 'email', 'message']
          }
        ],
        metadata: {
          'author': 'John Doe',
          'viewport': 'width=device-width, initial-scale=1.0',
          'robots': 'index, follow'
        },
        rawHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Example Website</title>\n    <meta name="description" content="Sample description">\n</head>\n<body>\n    <h1>Main Title</h1>\n    <p>Sample paragraph content.</p>\n</body>\n</html>',
        extractedText: 'Main Title Sample paragraph content.'
      }

      setScrapedData(mockData)
      setSuccess(true)

    } catch (err) {
      setError(`Scraping failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsScraping(false)
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
    let filename = `scraped_data.${format}`

    switch (format) {
      case 'json':
        content = JSON.stringify(scrapedData, null, 2)
        break
      case 'csv':
        content = 'Type,Content\n'
        if (options.extractLinks) {
          scrapedData.links.forEach(link => content += `Link,${link}\n`)
        }
        if (options.extractImages) {
          scrapedData.images.forEach(img => content += `Image,${img}\n`)
        }
        if (options.extractParagraphs) {
          scrapedData.paragraphs.forEach(p => content += `Paragraph,"${p}"\n`)
        }
        break
      case 'txt':
        content = '=== WEB SCRAPING RESULTS ===\n\n'
        content += `Title: ${scrapedData.title}\n`
        content += `Description: ${scrapedData.description}\n\n`
        
        if (options.extractLinks) {
          content += '=== LINKS ===\n'
          scrapedData.links.forEach((link, i) => content += `${i + 1}. ${link}\n`)
          content += '\n'
        }
        
        if (options.extractImages) {
          content += '=== IMAGES ===\n'
          scrapedData.images.forEach((img, i) => content += `${i + 1}. ${img}\n`)
          content += '\n'
        }
        
        if (options.extractParagraphs) {
          content += '=== PARAGRAPHS ===\n'
          scrapedData.paragraphs.forEach((p, i) => content += `${i + 1}. ${p}\n`)
          content += '\n'
        }
        
        if (options.extractHeadings) {
          content += '=== HEADINGS ===\n'
          scrapedData.headings.forEach(h => content += `H${h.level}: ${h.text}\n`)
          content += '\n'
        }
        
        if (options.extractTables) {
          content += '=== TABLES ===\n'
          scrapedData.tables.forEach((table, i) => {
            content += `Table ${i + 1}:\n`
            table.forEach((row: string[]) => content += `  ${row.join(', ')}\n`)
            content += '\n'
          })
        }
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openUrl = () => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              HTML Scraper
            </CardTitle>
            <CardDescription>
              Extract data from web pages including text, links, images, and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={openUrl}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Extraction Options</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extract-links"
                        checked={options.extractLinks}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, extractLinks: checked as boolean }))
                        }
                      />
                      <Label htmlFor="extract-links" className="text-sm">Extract Links</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extract-images"
                        checked={options.extractImages}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, extractImages: checked as boolean }))
                        }
                      />
                      <Label htmlFor="extract-images" className="text-sm">Extract Images</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extract-headings"
                        checked={options.extractHeadings}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, extractHeadings: checked as boolean }))
                        }
                      />
                      <Label htmlFor="extract-headings" className="text-sm">Extract Headings</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extract-paragraphs"
                        checked={options.extractParagraphs}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, extractParagraphs: checked as boolean }))
                        }
                      />
                      <Label htmlFor="extract-paragraphs" className="text-sm">Extract Paragraphs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extract-tables"
                        checked={options.extractTables}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, extractTables: checked as boolean }))
                        }
                      />
                      <Label htmlFor="extract-tables" className="text-sm">Extract Tables</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extract-forms"
                        checked={options.extractForms}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, extractForms: checked as boolean }))
                        }
                      />
                      <Label htmlFor="extract-forms" className="text-sm">Extract Forms</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extract-metadata"
                        checked={options.extractMetadata}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, extractMetadata: checked as boolean }))
                        }
                      />
                      <Label htmlFor="extract-metadata" className="text-sm">Extract Metadata</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="limit">Results Limit</Label>
                  <Select value={options.limitResults.toString()} onValueChange={(value) => 
                    setOptions(prev => ({ ...prev, limitResults: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 items</SelectItem>
                      <SelectItem value="100">100 items</SelectItem>
                      <SelectItem value="200">200 items</SelectItem>
                      <SelectItem value="500">500 items</SelectItem>
                      <SelectItem value="1000">1000 items</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-4">
                    <Button
                      onClick={scrapeUrl}
                      disabled={isScraping || !url}
                      className="w-full"
                    >
                      {isScraping ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Scraping...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          Scrape Website
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {success && scrapedData && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 text-sm">Website scraped successfully!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scraped Results</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadData('json')}>
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadData('csv')}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadData('txt')}>
                    <Download className="h-4 w-4 mr-1" />
                    TXT
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="links">Links</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{scrapedData.title}</div>
                        <div className="text-sm text-muted-foreground">Title</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{scrapedData.paragraphs.length}</div>
                        <div className="text-sm text-muted-foreground">Paragraphs</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{scrapedData.links.length}</div>
                        <div className="text-sm text-muted-foreground">Links</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{scrapedData.images.length}</div>
                        <div className="text-sm text-muted-foreground">Images</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{scrapedData.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {scrapedData.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Headings</h4>
                    <div className="space-y-2">
                      {scrapedData.headings.map((heading, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">H{heading.level}</Badge>
                          <span>{heading.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Paragraphs</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {scrapedData.paragraphs.map((paragraph, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {paragraph}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="links" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Extracted Links ({scrapedData.links.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {scrapedData.links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-mono">{link}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(link)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Images ({scrapedData.images.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scrapedData.images.map((image, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Scraped image ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x200'
                            }}
                          />
                          <div className="p-2">
                            <p className="text-xs text-muted-foreground truncate">{image}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => copyToClipboard(image)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy URL
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="structure" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tables ({scrapedData.tables.length})</h4>
                    <div className="space-y-4">
                      {scrapedData.tables.map((table, index) => (
                        <div key={index}>
                          <h5 className="text-sm font-medium mb-2">Table {index + 1}</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                              <thead>
                                <tr>
                                  {(table[0] as string[])?.map((header, cellIndex) => (
                                    <th key={cellIndex} className="border border-gray-300 p-2 bg-gray-50 text-left">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(table.slice(1) as string[][]).map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                      <td key={cellIndex} className="border border-gray-300 p-2">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Forms ({scrapedData.forms.length})</h4>
                    <div className="space-y-4">
                      {scrapedData.forms.map((form, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Action:</span>
                                <p className="text-muted-foreground">{form.action}</p>
                              </div>
                              <div>
                                <span className="font-medium">Method:</span>
                                <p className="text-muted-foreground">{form.method}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium">Inputs:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {form.inputs.map((input, inputIndex) => (
                                  <Badge key={inputIndex} variant="outline" className="text-xs">
                                    {input}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Page Metadata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(scrapedData.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium text-sm">{key}:</span>
                          <span className="text-sm text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Content Extraction:</strong> Extract titles, descriptions, keywords, and text content
            </div>
            <div>
              <strong>Media Collection:</strong> Gather links to images and other media files
            </div>
            <div>
              <strong>Structure Analysis:</strong> Parse HTML structure including headings, tables, and forms
            </div>
            <div>
              <strong>Metadata Extraction:</strong> Extract meta tags and page metadata
            </div>
            <div>
              <strong>Export Options:</strong> Download results in JSON, CSV, or plain text format
            </div>
            <div>
              <strong>Customizable:</strong> Choose what data to extract and set result limits
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}