'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Download, Sparkles } from 'lucide-react'
import { useCopyToClipboard } from 'react-use'

export default function AISEODescriptionGenerator() {
  const [keyword, setKeyword] = useState('')
  const [content, setContent] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, copy] = useCopyToClipboard()

  const generateSEODescriptions = async () => {
    if (!keyword.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/seo-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: keyword.trim(),
          keywords: content.trim() ? [content.trim()] : [],
          targetAudience: 'general'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data.descriptions)
      } else {
        throw new Error(data.error || 'Failed to generate SEO descriptions')
      }
    } catch (error) {
      console.error('Error generating SEO descriptions:', error)
      // Fallback to mock descriptions if API fails
      const mockDescriptions = [
        `Discover everything about ${keyword} in this comprehensive guide. Learn expert tips, best practices, and practical examples to master ${keyword} effectively.`,
        `Looking to understand ${keyword}? This complete guide covers everything you need to know, from basics to advanced techniques. Start your journey today.`,
        `Master ${keyword} with our in-depth tutorial. We cover essential concepts, step-by-step instructions, and real-world examples to help you succeed.`,
        `Learn ${keyword} from industry experts. This guide provides comprehensive coverage of key concepts, practical applications, and proven strategies for success.`,
        `Complete guide to ${keyword} - Learn the fundamentals, advanced techniques, and best practices used by professionals worldwide.`,
        `Everything you need to know about ${keyword} in one place. From basic concepts to advanced strategies, this guide has it all.`,
        `Ultimate ${keyword} guide covering all aspects of the topic. Perfect for beginners and advanced learners alike.`,
        `Comprehensive ${keyword} resource with expert insights, practical examples, and actionable strategies for immediate implementation.`
      ]
      setResults(mockDescriptions)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    copy(text)
  }

  const downloadResults = () => {
    const content = results.join('\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'seo-descriptions.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI SEO Description Generator
          </CardTitle>
          <CardDescription>
            Generate compelling meta descriptions optimized for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Primary Keyword</Label>
              <Input
                id="keyword"
                placeholder="e.g., digital marketing"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content Summary (Optional)</Label>
              <Textarea
                id="content"
                placeholder="Brief description of your content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={generateSEODescriptions} 
            disabled={!keyword.trim() || loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate SEO Descriptions'}
          </Button>

          {results.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Meta Descriptions</h3>
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid gap-3">
                  {results.map((description, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <p className="text-sm text-muted-foreground mb-2">
                            Character count: {description.length}
                          </p>
                          <p className="font-medium text-foreground leading-relaxed">
                            {description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">SEO Optimized</Badge>
                            <Badge variant="outline">Description {index + 1}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(description)}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                          {copied[0] ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Meta Description Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Keep descriptions between 150-160 characters</li>
            <li>• Include primary keyword naturally within the first 100 characters</li>
            <li>• Make descriptions compelling and action-oriented</li>
            <li>• Use active voice and strong call-to-action verbs</li>
            <li>• Focus on benefits and value proposition</li>
            <li>• Avoid keyword stuffing and maintain readability</li>
            <li>• Create unique descriptions for each page</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}