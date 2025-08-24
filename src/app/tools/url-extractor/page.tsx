'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Download, ExternalLink, Filter, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface URLInfo {
  url: string
  domain: string
  isValid: boolean
  type: 'http' | 'https' | 'ftp' | 'mailto' | 'tel' | 'other'
}

export default function URLExtractor() {
  const [input, setInput] = useState('')
  const [urls, setUrls] = useState<URLInfo[]>([])
  const [filter, setFilter] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['http', 'https', 'ftp', 'mailto', 'tel', 'other'])
  const [showValidOnly, setShowValidOnly] = useState(false)
  const [uniqueDomains, setUniqueDomains] = useState<string[]>([])
  const { toast } = useToast()

  const urlRegex = /(https?:\/\/[^\s]+)|(ftp?:\/\/[^\s]+)|(mailto:[^\s]+)|(tel:[^\s]+)|(www\.[^\s]+\.[^\s]+)/g

  const extractURLs = (text: string): URLInfo[] => {
    const matches = text.match(urlRegex)
    if (!matches) return []

    return matches.map(match => {
      let url = match
      let type: URLInfo['type'] = 'other'
      let domain = ''
      let isValid = false

      // Normalize URL
      if (url.startsWith('www.')) {
        url = 'https://' + url
      }

      // Determine type
      if (url.startsWith('https://')) {
        type = 'https'
      } else if (url.startsWith('http://')) {
        type = 'http'
      } else if (url.startsWith('ftp://')) {
        type = 'ftp'
      } else if (url.startsWith('mailto:')) {
        type = 'mailto'
      } else if (url.startsWith('tel:')) {
        type = 'tel'
      }

      // Extract domain
      try {
        const urlObj = new URL(url)
        domain = urlObj.hostname
        isValid = true
      } catch {
        // Try to extract domain from invalid URLs
        const domainMatch = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/)
        if (domainMatch) {
          domain = domainMatch[1]
        }
      }

      return { url, domain, isValid, type }
    })
  }

  const handleExtract = () => {
    if (!input.trim()) return

    const extractedUrls = extractURLs(input)
    setUrls(extractedUrls)

    // Extract unique domains
    const domains = [...new Set(extractedUrls.map(u => u.domain).filter(d => d))]
    setUniqueDomains(domains)
  }

  const handleClear = () => {
    setInput('')
    setUrls([])
    setFilter('')
    setUniqueDomains([])
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to clipboard",
    })
  }

  const downloadURLs = () => {
    const content = filteredUrls.map(u => u.url).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted-urls.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    const headers = ['URL', 'Domain', 'Type', 'Valid']
    const rows = filteredUrls.map(u => [u.url, u.domain, u.type, u.isValid.toString()])
    const content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted-urls.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const openURL = (url: string) => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
  }

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes(prev => [...prev, type])
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== type))
    }
  }

  const filteredUrls = urls.filter(url => {
    const matchesFilter = !filter || 
      url.url.toLowerCase().includes(filter.toLowerCase()) ||
      url.domain.toLowerCase().includes(filter.toLowerCase())
    
    const matchesType = selectedTypes.includes(url.type)
    
    const matchesValidity = !showValidOnly || url.isValid

    return matchesFilter && matchesType && matchesValidity
  })

  const urlStats = {
    total: urls.length,
    valid: urls.filter(u => u.isValid).length,
    invalid: urls.filter(u => !u.isValid).length,
    uniqueDomains: uniqueDomains.length,
    byType: {
      http: urls.filter(u => u.type === 'http').length,
      https: urls.filter(u => u.type === 'https').length,
      ftp: urls.filter(u => u.type === 'ftp').length,
      mailto: urls.filter(u => u.type === 'mailto').length,
      tel: urls.filter(u => u.type === 'tel').length,
      other: urls.filter(u => u.type === 'other').length
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      http: 'bg-yellow-100 text-yellow-800',
      https: 'bg-green-100 text-green-800',
      ftp: 'bg-blue-100 text-blue-800',
      mailto: 'bg-purple-100 text-purple-800',
      tel: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>URL Extractor</CardTitle>
          <CardDescription>
            Extract and analyze URLs from text content with advanced filtering and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleExtract} disabled={!input.trim()}>
                  Extract URLs
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                {urls.length > 0 && (
                  <>
                    <Button variant="outline" onClick={downloadURLs}>
                      <Download className="h-4 w-4 mr-2" />
                      Download TXT
                    </Button>
                    <Button variant="outline" onClick={downloadCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </>
                )}
              </div>
              
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your text content here to extract URLs..."
                className="min-h-32"
              />
            </div>

            {urls.length > 0 && (
              <>
                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extraction Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{urlStats.total}</div>
                        <div className="text-sm text-muted-foreground">Total URLs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{urlStats.valid}</div>
                        <div className="text-sm text-muted-foreground">Valid URLs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{urlStats.invalid}</div>
                        <div className="text-sm text-muted-foreground">Invalid URLs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{urlStats.uniqueDomains}</div>
                        <div className="text-sm text-muted-foreground">Unique Domains</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <Label htmlFor="search">Search URLs:</Label>
                        <Input
                          id="search"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          placeholder="Filter by URL or domain..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="valid-only"
                          checked={showValidOnly}
                          onCheckedChange={(checked) => setShowValidOnly(checked as boolean)}
                        />
                        <Label htmlFor="valid-only">Valid URLs only</Label>
                      </div>
                    </div>

                    <div>
                      <Label>URL Types:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(urlStats.byType).map(([type, count]) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                            />
                            <Label htmlFor={`type-${type}`} className="flex items-center gap-1">
                              <Badge className={getTypeColor(type)}>{type.toUpperCase()}</Badge>
                              <span className="text-sm">({count})</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                <Tabs defaultValue="urls" className="w-full">
                  <TabsList>
                    <TabsTrigger value="urls">Extracted URLs ({filteredUrls.length})</TabsTrigger>
                    <TabsTrigger value="domains">Unique Domains ({uniqueDomains.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="urls" className="space-y-4">
                    {filteredUrls.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredUrls.map((urlInfo, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getTypeColor(urlInfo.type)}>
                                    {urlInfo.type.toUpperCase()}
                                  </Badge>
                                  {urlInfo.isValid ? (
                                    <Badge variant="outline" className="text-green-600">Valid</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-red-600">Invalid</Badge>
                                  )}
                                </div>
                                <div className="font-mono text-sm break-all mb-1">
                                  {urlInfo.url}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Domain: {urlInfo.domain || 'N/A'}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(urlInfo.url)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                {urlInfo.isValid && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openURL(urlInfo.url)}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No URLs match the current filters
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="domains" className="space-y-4">
                    {uniqueDomains.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {uniqueDomains.map((domain, index) => {
                          const domainUrls = urls.filter(u => u.domain === domain)
                          return (
                            <Card key={index} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono text-sm break-all">
                                    {domain}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {domainUrls.length} URL{domainUrls.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(domain)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No domains found
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}