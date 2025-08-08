'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function BacklinkMaker() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [backlinks, setBacklinks] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  const platforms = [
    { id: 'all', name: 'All Platforms', description: 'Generate backlinks from all available platforms' },
    { id: 'social', name: 'Social Media', description: 'Social media backlinks' },
    { id: 'directories', name: 'Directories', description: 'Web directory listings' },
    { id: 'forums', name: 'Forums', description: 'Forum profile backlinks' },
    { id: 'blogs', name: 'Blogs', description: 'Blog comment backlinks' }
  ]

  const generateBacklinks = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsGenerating(true)
    try {
      // Simulate backlink generation process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock backlinks (in real app, this would use actual APIs)
      const mockBacklinks = [
        `https://example-directory.com/listing?url=${encodeURIComponent(websiteUrl)}`,
        `https://social-profile.com/profile?url=${encodeURIComponent(websiteUrl)}`,
        `https://forum-site.com/profile?url=${encodeURIComponent(websiteUrl)}`,
        `https://blog-comments.com/comment?url=${encodeURIComponent(websiteUrl)}`,
        `https://web-directory.com/add?url=${encodeURIComponent(websiteUrl)}`,
        `https://social-bookmark.com/bookmark?url=${encodeURIComponent(websiteUrl)}`,
        `https://article-directory.com/submit?url=${encodeURIComponent(websiteUrl)}`,
        `https://local-business.com/list?url=${encodeURIComponent(websiteUrl)}`,
        `https://forum-post.com/post?url=${encodeURIComponent(websiteUrl)}`,
        `https://blog-guest.com/guest?url=${encodeURIComponent(websiteUrl)}`
      ]
      
      setBacklinks(mockBacklinks)
      toast.success('Backlinks generated successfully!')
    } catch (error) {
      toast.error('Failed to generate backlinks')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    const content = backlinks.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backlinks.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backlinks downloaded!')
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank')
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backlink Maker</h1>
        <p className="text-muted-foreground">
          Generate high-quality backlinks to improve your website's SEO and search rankings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Information</CardTitle>
            <CardDescription>Enter your website URL to generate backlinks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Website URL</label>
                <Input
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
              {websiteUrl && !validateUrl(websiteUrl) && (
                <p className="text-sm text-destructive">Please enter a valid URL</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backlink Platform</CardTitle>
            <CardDescription>Choose the type of platforms for backlink generation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <TabsList className="grid w-full grid-cols-5">
                {platforms.map((platform) => (
                  <TabsTrigger key={platform.id} value={platform.id} className="text-xs">
                    {platform.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">{platforms.find(p => p.id === selectedPlatform)?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {platforms.find(p => p.id === selectedPlatform)?.description}
                </p>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate Backlinks</CardTitle>
            <CardDescription>Click the button to start generating backlinks</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateBacklinks}
              disabled={isGenerating || !websiteUrl.trim() || !validateUrl(websiteUrl)}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Backlinks...
                </>
              ) : (
                'Generate Backlinks'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Backlinks</CardTitle>
            <CardDescription>Your backlinks will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Generating backlinks...</span>
              </div>
            ) : backlinks.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {backlinks.length} backlinks generated
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={downloadAsFile}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                    <Button 
                      onClick={() => setBacklinks([])}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {backlinks.map((backlink, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <div className="truncate text-sm">
                          {backlink}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button 
                          onClick={() => copyToClipboard(backlink)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => openInNewTab(backlink)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <Badge variant="secondary">
                    Quality: High
                  </Badge>
                  <Badge variant="outline">
                    DA: 20-50
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No backlinks generated yet</p>
                <p className="text-sm mt-2">Generate backlinks to see them here</p>
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
                <h4 className="font-semibold">✓ Quality Over Quantity</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on getting backlinks from high-quality, relevant websites rather than many low-quality ones.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">✓ Natural Link Building</h4>
                <p className="text-sm text-muted-foreground">
                  Build backlinks naturally over time to avoid search engine penalties.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">✓ Diverse Anchor Text</h4>
                <p className="text-sm text-muted-foreground">
                  Use varied anchor text when building backlinks for better SEO results.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">✓ Monitor Results</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly check your backlinks and their impact on your search rankings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}