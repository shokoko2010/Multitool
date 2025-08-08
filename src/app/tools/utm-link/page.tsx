'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link, Copy, ExternalLink, RefreshCw, BarChart3, Target } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function UTMLinkGenerator() {
  const [utmData, setUtmData] = useState({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
    url: 'https://example.com'
  })
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState('')
  const { toast } = useToast()

  const utmTemplates = [
    {
      name: 'Social Media Campaign',
      source: 'facebook',
      medium: 'social',
      campaign: 'summer_sale_2024',
      term: '',
      content: 'ad_group_1'
    },
    {
      name: 'Email Newsletter',
      source: 'newsletter',
      medium: 'email',
      campaign: 'weekly_digest',
      term: '',
      content: 'issue_123'
    },
    {
      name: 'Google Ads',
      source: 'google',
      medium: 'cpc',
      campaign: 'brand_keywords',
      term: 'brand_name',
      content: 'top_ad'
    },
    {
      name: 'Blog Post',
      source: 'blog',
      medium: 'organic',
      campaign: 'content_marketing',
      term: 'seo_keywords',
      content: 'article_link'
    }
  ]

  const commonSources = [
    'google', 'facebook', 'twitter', 'linkedin', 'instagram', 'youtube',
    'newsletter', 'email', 'organic', 'referral', 'direct', 'social'
  ]

  const commonMediums = [
    'cpc', 'cpm', 'organic', 'social', 'email', 'referral', 'affiliate',
    'display', 'video', 'search', 'ppc', 'banner'
  ]

  const generateUTMUrl = () => {
    const { source, medium, campaign, term, content, url } = utmData
    
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a base URL",
        variant: "destructive",
      })
      return
    }

    if (!source.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign source",
        variant: "destructive",
      })
      return
    }

    if (!medium.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign medium",
        variant: "destructive",
      })
      return
    }

    if (!campaign.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign name",
        variant: "destructive",
      })
      return
    }

    const params = new URLSearchParams()
    
    if (source) params.append('utm_source', source)
    if (medium) params.append('utm_medium', medium)
    if (campaign) params.append('utm_campaign', campaign)
    if (term) params.append('utm_term', term)
    if (content) params.append('utm_content', content)

    const utmUrl = `${url}?${params.toString()}`
    setGeneratedUrl(utmUrl)
    
    toast({
      title: "Success!",
      description: "UTM URL generated successfully",
      variant: "default",
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      variant: "default",
    })
    
    setTimeout(() => setCopied(''), 2000)
  }

  const applyTemplate = (template: any) => {
    setUtmData({
      ...utmData,
      source: template.source,
      medium: template.medium,
      campaign: template.campaign,
      term: template.term,
      content: template.content
    })
  }

  const clearAll = () => {
    setUtmData({
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
      url: 'https://example.com'
    })
    setGeneratedUrl('')
    setCopied('')
  }

  const openUrl = () => {
    if (generatedUrl) {
      window.open(generatedUrl, '_blank')
    }
  }

  const parseUTM = (url: string) => {
    try {
      const urlObj = new URL(url)
      const params = new URLSearchParams(urlObj.search)
      
      return {
        url: urlObj.origin + urlObj.pathname,
        source: params.get('utm_source') || '',
        medium: params.get('utm_medium') || '',
        campaign: params.get('utm_campaign') || '',
        term: params.get('utm_term') || '',
        content: params.get('utm_content') || ''
      }
    } catch {
      return null
    }
  }

  const handleUTMInput = (field: string, value: string) => {
    setUtmData({ ...utmData, [field]: value })
    setCopied('')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">UTM Link Generator</h1>
          <p className="text-muted-foreground">Create UTM parameters for tracking marketing campaigns</p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate UTM</TabsTrigger>
            <TabsTrigger value="analyze">Analyse UTM</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Templates
                </CardTitle>
                <CardDescription>Start with pre-configured UTM templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {utmTemplates.map((template, index) => (
                    <Button
                      key={index}
                      onClick={() => applyTemplate(template)}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Base URL */}
            <Card>
              <CardHeader>
                <CardTitle>Base URL</CardTitle>
                <CardDescription>The destination URL for your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Destination URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={utmData.url}
                    onChange={(e) => handleUTMInput('url', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* UTM Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>UTM Parameters</CardTitle>
                <CardDescription>Configure your campaign tracking parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">utm_source *</Label>
                    <Select value={utmData.source} onValueChange={(value) => handleUTMInput('source', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source.charAt(0).toUpperCase() + source.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="e.g., google, facebook"
                      value={utmData.source}
                      onChange={(e) => handleUTMInput('source', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medium">utm_medium *</Label>
                    <Select value={utmData.medium} onValueChange={(value) => handleUTMInput('medium', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMediums.map((medium) => (
                          <SelectItem key={medium} value={medium}>
                            {medium.charAt(0).toUpperCase() + medium.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="e.g., cpc, social, email"
                      value={utmData.medium}
                      onChange={(e) => handleUTMInput('medium', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaign">utm_campaign *</Label>
                    <Input
                      id="campaign"
                      placeholder="e.g., summer_sale_2024"
                      value={utmData.campaign}
                      onChange={(e) => handleUTMInput('campaign', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term">utm_term</Label>
                    <Input
                      id="term"
                      placeholder="e.g., brand_keywords"
                      value={utmData.term}
                      onChange={(e) => handleUTMInput('term', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="content">utm_content</Label>
                    <Input
                      id="content"
                      placeholder="e.g., ad_group_1, banner_ad"
                      value={utmData.content}
                      onChange={(e) => handleUTMInput('content', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateUTMUrl} className="flex-1">
                    <Link className="h-4 w-4 mr-2" />
                    Generate UTM URL
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated URL */}
            {generatedUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Generated UTM URL
                    </span>
                    <div className="flex gap-2">
                      <Button onClick={openUrl} variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(generatedUrl, 'URL')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'URL'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Your tracking URL with UTM parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-32">
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm break-all">{generatedUrl}</code>
                    </div>
                  </ScrollArea>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Source: {utmData.source || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Medium: {utmData.medium || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Campaign: {utmData.campaign || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Term: {utmData.term || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Content: {utmData.content || 'N/A'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analyze UTM URL
                </CardTitle>
                <CardDescription>Parse existing UTM URLs to see their parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    UTM analysis functionality coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This feature will allow you to paste UTM URLs and see their parsed parameters.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>About UTM Parameters</CardTitle>
            <CardDescription>Understanding UTM tracking parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">What are UTM Parameters?</h4>
                  <p className="text-sm text-muted-foreground">
                    UTM (Urchin Tracking Module) parameters are tags you add to URLs to track the effectiveness 
                    of your marketing campaigns in Google Analytics and other analytics platforms.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">The 5 UTM Parameters</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>utm_source:</strong> Where the traffic comes from</li>
                    <li>• <strong>utm_medium:</strong> The type of traffic (organic, paid, social)</li>
                    <li>• <strong>utm_campaign:</strong> The specific campaign name</li>
                    <li>• <strong>utm_term:</strong> Paid search keywords</li>
                    <li>• <strong>utm_content:</strong> Identifies what specifically was clicked</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use lowercase and underscores for consistency</li>
                  <li>• Keep campaign names descriptive but concise</li>
                  <li>• Use consistent naming across all campaigns</li>
                  <li>• Test your UTM URLs before launching campaigns</li>
                  <li>• Use URL shorteners for cleaner sharing (but keep the original for tracking)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}