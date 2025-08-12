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

export default function AISEOTitleGenerator() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, copy] = useCopyToClipboard()

  const generateSEOTitles = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/seo-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: input.trim(),
          keywords: [],
          targetAudience: 'general'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data.titles)
      } else {
        throw new Error(data.error || 'Failed to generate SEO titles')
      }
    } catch (error) {
      console.error('Error generating SEO titles:', error)
      // Fallback to mock titles if API fails
      const mockTitles = [
        `${input} - Complete Guide 2024 | Expert Tips`,
        `How to ${input}: Step-by-Step Tutorial`,
        `${input}: Ultimate Guide for Beginners`,
        `Learn ${input} - Best Practices & Examples`,
        `${input} Explained - Simple Guide`,
        `Master ${input} - Advanced Techniques`,
        `${input} Tutorial - From Zero to Hero`,
        `The Complete ${input} Handbook 2024`
      ]
      setResults(mockTitles)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    copy(text)
  }

  const downloadResults = () => {
    const content = results.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'seo-titles.txt'
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
            AI SEO Title Generator
          </CardTitle>
          <CardDescription>
            Generate compelling SEO-optimized titles for your content using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keyword">Enter Keyword or Topic</Label>
            <Input
              id="keyword"
              placeholder="e.g., digital marketing, machine learning, web development"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateSEOTitles()}
            />
          </div>

          <Button 
            onClick={generateSEOTitles} 
            disabled={!input.trim() || loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate SEO Titles'}
          </Button>

          {results.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated SEO Titles</h3>
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid gap-3">
                  {results.map((title, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-foreground">{title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">SEO Optimized</Badge>
                            <Badge variant="outline">Title {index + 1}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(title)}
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
          <CardTitle>SEO Title Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Keep titles under 60 characters for better display</li>
            <li>• Include your primary keyword within the first 3-5 words</li>
            <li>• Make titles compelling and click-worthy</li>
            <li>• Use power words like "Ultimate", "Complete", "Guide", "Tips"</li>
            <li>• Add current year for freshness (2024)</li>
            <li>• Consider your target audience and search intent</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}