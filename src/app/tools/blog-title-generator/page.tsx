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
import { Copy, Download, FileText, Sparkles, Loader2 } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface TitleRequest {
  topic: string
  keywords: string
  tone: string
  targetAudience: string
}

interface TitleResponse {
  titles: string[]
  suggestions: string[]
}

export default function BlogTitleGenerator() {
  const [request, setRequest] = useState<TitleRequest>({
    topic: '',
    keywords: '',
    tone: 'professional',
    targetAudience: 'general'
  })
  const [response, setResponse] = useState<TitleResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { trackUsage } = useToolAccess('blog-title-generator')

  const generateTitles = async () => {
    if (!request.topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage
      await trackUsage()

      // Simulate API call with generated titles
      await new Promise(resolve => setTimeout(resolve, 1500))

      const generatedTitles = generateBlogTitles(request)
      const suggestions = generateTitleSuggestions(request)

      setResponse({
        titles: generatedTitles,
        suggestions: suggestions
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const generateBlogTitles = (req: TitleRequest): string[] => {
    const topic = req.topic.toLowerCase()
    const keywords = req.keywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k)
    const toneMap = {
      professional: ['Ultimate Guide', 'Complete Guide', 'Expert Tips', 'Professional Insights'],
      casual: ['Easy Ways', 'Simple Guide', 'Fun Ways', 'Cool Tips'],
      friendly: ['Helpful Guide', 'Friendly Tips', 'Easy Guide', 'Practical Advice'],
      formal: ['Comprehensive Analysis', 'Detailed Examination', 'Formal Guide', 'Professional Overview'],
      humorous: ['Funny Ways', 'Hilarious Guide', 'Laugh-Out-Loud Tips', 'Comedy Guide'],
      inspirational: ['Inspiring Guide', 'Motivational Tips', 'Life-Changing Ways', 'Empowering Guide']
    }

    const audienceMap = {
      general: ['Everyone', 'All Readers', 'General Audience'],
      beginners: ['Beginners', 'Newbies', 'Starters'],
      experts: ['Experts', 'Professionals', 'Advanced Users'],
      business: ['Business Owners', 'Entrepreneurs', 'Companies']
    }

    const tonePrefixes = toneMap[req.tone as keyof typeof toneMap] || toneMap.professional
    const audienceRefs = audienceMap[req.targetAudience as keyof typeof audienceMap] || audienceMap.general

    const templates = [
      `${tonePrefixes[0]} to ${topic}`,
      `How to ${topic}: ${tonePrefixes[1]} for ${audienceRefs[0]}`,
      `${topic} 101: ${tonePrefixes[2]} ${audienceRefs[1]} Need to Know`,
      `The Complete ${topic} ${tonePrefixes[3]}`,
      `${topic} Made Easy: ${tonePrefixes[0]} for Success`,
      `Mastering ${topic}: ${tonePrefixes[1]} and Tricks`,
      `${topic} Explained: ${tonePrefixes[2]} for ${audienceRefs[2]}`,
      `Your Ultimate ${topic} ${tonePrefixes[3]}`
    ]

    if (keywords.length > 0) {
      templates.push(
        `${keywords[0]} and ${topic}: ${tonePrefixes[0]}`,
        `The Role of ${keywords[0]} in ${topic}`,
        `${topic} with ${keywords[0]}: ${tonePrefixes[1]}`
      )
    }

    return templates.slice(0, 8)
  }

  const generateTitleSuggestions = (req: TitleRequest): string[] => {
    return [
      "Use numbers in titles for better engagement (e.g., '7 Ways to...')",
      "Include power words like 'Ultimate', 'Complete', 'Essential'",
      "Make titles specific and actionable",
      "Keep titles under 60 characters for SEO",
      "Use questions to engage readers",
      "Include your main keyword naturally"
    ]
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadTitles = () => {
    if (response?.titles) {
      const content = response.titles.join('\n')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'blog-titles.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setRequest({
      topic: '',
      keywords: '',
      tone: 'professional',
      targetAudience: 'general'
    })
    setResponse(null)
    setError(null)
  }

  return (
    <ToolLayout
      toolId="blog-title-generator"
      toolName="Blog Title Generator"
      toolDescription="Generate engaging blog titles that attract readers"
      toolCategory="Content Tools"
      toolIcon={<Sparkles className="w-8 h-8" />}
      action={{
        label: "Generate Titles",
        onClick: generateTitles,
        loading: loading,
        disabled: !request.topic.trim()
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Title Requirements</CardTitle>
            <CardDescription>
              Tell us about your blog post to generate perfect titles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Main Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Digital Marketing, Healthy Cooking, JavaScript Programming"
                value={request.topic}
                onChange={(e) => setRequest(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (optional)</Label>
              <Input
                id="keywords"
                placeholder="e.g., SEO, content, engagement (comma separated)"
                value={request.keywords}
                onChange={(e) => setRequest(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={request.targetAudience} onValueChange={(value) => setRequest(prev => ({ ...prev, targetAudience: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Audience</SelectItem>
                    <SelectItem value="beginners">Beginners</SelectItem>
                    <SelectItem value="experts">Experts</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button variant="outline" onClick={clearAll} disabled={!request.topic && !response}>
              Clear All
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Titles</CardTitle>
            <CardDescription>
              Click on any title to copy it to clipboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating titles...</p>
              </div>
            ) : response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    <FileText className="w-3 h-3 mr-1" />
                    {response.titles.length} titles generated
                  </Badge>
                  <Button variant="outline" size="sm" onClick={downloadTitles}>
                    <Download className="w-4 h-4 mr-1" />
                    Download All
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {response.titles.map((title, index) => (
                    <div 
                      key={index}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => copyToClipboard(title)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium flex-1">{title}</p>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(title)
                        }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {title.length} characters
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to generate titles</h3>
                <p className="text-muted-foreground">
                  Enter your blog topic above and click "Generate Titles" to create engaging titles
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      {response?.suggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Title Writing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {response.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}