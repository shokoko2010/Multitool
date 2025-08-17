'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, Download, FileText, Sparkles } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface ContentRequest {
  prompt: string
  contentType: string
  tone: string
  length: string
}

interface ContentResponse {
  content: string
  title?: string
  wordCount: number
}

export default function AIContentGenerator() {
  const [request, setRequest] = useState<ContentRequest>({
    prompt: '',
    contentType: 'blog-post',
    tone: 'professional',
    length: 'medium'
  })
  const [response, setResponse] = useState<ContentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { trackUsage } = useToolAccess('ai-content-generator')

  const handleGenerate = async () => {
    if (!request.prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before generating content
      await trackUsage()

      const apiResponse = await fetch('/api/tools/ai-content-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await apiResponse.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (response?.content) {
      navigator.clipboard.writeText(response.content)
    }
  }

  const downloadContent = () => {
    if (response?.content) {
      const blob = new Blob([response.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'generated-content.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <ToolLayout
      toolId="ai-content-generator"
      toolName="AI Content Generator"
      toolDescription="Generate high-quality content using AI powered by Z.ai"
      toolCategory="AI Tools"
      toolIcon={<Sparkles className="w-8 h-8" />}
      action={{
        label: "Generate Content",
        onClick: handleGenerate,
        loading: loading,
        disabled: !request.prompt.trim()
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Content Requirements</CardTitle>
            <CardDescription>
              Describe what kind of content you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">What do you want to write about?</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., Write a blog post about the benefits of remote work for employees..."
                value={request.prompt}
                onChange={(e) => setRequest(prev => ({ ...prev, prompt: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={request.contentType} onValueChange={(value) => setRequest(prev => ({ ...prev, contentType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog-post">Blog Post</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="product-description">Product Description</SelectItem>
                    <SelectItem value="ad-copy">Ad Copy</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={request.tone} onValueChange={(value) => setRequest(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={request.length} onValueChange={(value) => setRequest(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (~200 words)</SelectItem>
                    <SelectItem value="medium">Medium (~500 words)</SelectItem>
                    <SelectItem value="long">Long (~1000 words)</SelectItem>
                    <SelectItem value="detailed">Detailed (~1500+ words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating content...</p>
              </div>
            ) : response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <FileText className="w-3 h-3 mr-1" />
                      {request.contentType.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {response.wordCount} words
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadContent}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {response.content}
                  </div>
                </div>

                {response.title && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-1">Suggested Title:</p>
                    <p className="text-sm text-blue-700">{response.title}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to generate content</h3>
                <p className="text-muted-foreground">
                  Enter your requirements above and click "Generate Content" to create AI-powered content
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 Better Prompts</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Be specific about your audience</li>
                <li>• Include key points to cover</li>
                <li>• Mention desired structure</li>
                <li>• Specify keywords if needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Content Best Practices</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Review and edit generated content</li>
                <li>• Add your personal touch</li>
                <li>• Check for accuracy and facts</li>
                <li>• Optimize for your platform</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}