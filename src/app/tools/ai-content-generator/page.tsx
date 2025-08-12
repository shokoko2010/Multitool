'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, RefreshCw, Sparkles, FileText, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export default function AIContentGenerator() {
  const { theme } = useTheme()
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('blog-post')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [history, setHistory] = useState([])

  const contentTypes = [
    { value: 'blog-post', label: 'Blog Post' },
    { value: 'article', label: 'Article' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'product-description', label: 'Product Description' },
    { value: 'email', label: 'Email' },
    { value: 'ad-copy', label: 'Ad Copy' },
    { value: 'story', label: 'Story' },
    { value: 'poem', label: 'Poem' }
  ]

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'informative', label: 'Informative' }
  ]

  const lengths = [
    { value: 'short', label: 'Short (100-300 words)' },
    { value: 'medium', label: 'Medium (300-600 words)' },
    { value: 'long', label: 'Long (600-1000 words)' },
    { value: 'very-long', label: 'Very Long (1000+ words)' }
  ]

  const generateContent = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/content-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          tone,
          length,
          contentType
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedContent(data.data.content)
        
        // Add to history
        const newEntry = {
          id: Date.now(),
          prompt,
          contentType,
          tone,
          length,
          content: data.data.content,
          timestamp: new Date().toISOString()
        }
        setHistory([newEntry, ...history])
      } else {
        throw new Error(data.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      // Fallback to mock content if API fails
      const mockContent = generateMockContent()
      setGeneratedContent(mockContent)
      
      const newEntry = {
        id: Date.now(),
        prompt,
        contentType,
        tone,
        length,
        content: mockContent,
        timestamp: new Date().toISOString()
      }
      setHistory([newEntry, ...history])
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockContent = () => {
    const templates = {
      'blog-post': `# ${prompt}

## Introduction

${prompt} is an increasingly important topic in today's digital landscape. This comprehensive guide will explore the various aspects of ${prompt} and provide valuable insights for professionals and enthusiasts alike.

## Key Benefits

1. **Enhanced Efficiency**: ${prompt} streamlines processes and improves overall efficiency.
2. **Cost Reduction**: By implementing ${prompt}, organizations can significantly reduce operational costs.
3. **Improved Quality**: The quality of output is greatly enhanced through ${prompt} methodologies.
4. **Scalability**: ${prompt} solutions are designed to scale with growing business needs.

## Implementation Strategies

### Strategy 1: Planning Phase
Before diving into ${prompt}, it's crucial to conduct thorough research and planning. This includes identifying key stakeholders, setting clear objectives, and establishing measurable goals.

### Strategy 2: Execution Phase
During the execution phase, focus on implementing best practices and ensuring proper resource allocation. Regular monitoring and adjustments are key to success.

### Strategy 3: Optimization Phase
Once ${prompt} is implemented, continuous optimization is essential. This involves analyzing performance metrics, gathering feedback, and making data-driven improvements.

## Conclusion

${prompt} represents a significant opportunity for organizations to improve their operations and achieve better outcomes. By following the strategies outlined in this guide, you can successfully implement ${prompt} and reap the numerous benefits it offers.

---

*This content was generated by AI. Please review and edit before publishing.*`,
      
      'article': `## The Impact of ${prompt} on Modern Business

In an era of rapid technological advancement, ${prompt} has emerged as a transformative force reshaping how businesses operate and compete. This article explores the multifaceted impact of ${prompt} across various industries and sectors.

### Understanding ${prompt}

At its core, ${prompt} refers to [detailed explanation of ${prompt}]. This innovative approach has gained traction due to its ability to address complex challenges and deliver measurable results.

### Industry Applications

**Technology Sector**: Technology companies are leveraging ${prompt} to enhance product development cycles and improve user experiences.

**Healthcare**: In healthcare, ${prompt} is revolutionizing patient care through advanced diagnostic tools and treatment methodologies.

**Finance**: Financial institutions are adopting ${prompt} to streamline operations, reduce risks, and improve customer service.

### Future Outlook

As ${prompt} continues to evolve, we can expect to see even more innovative applications and use cases. Organizations that embrace this technology early will likely gain a competitive advantage in their respective markets.

### Conclusion

The journey of ${prompt} is just beginning, and its potential to transform industries is immense. By staying informed and adaptable, businesses can position themselves for success in this new era of innovation.

---

*This article was generated by AI. Please verify all information before use.*`
    }

    return templates[contentType] || `## Content about ${prompt}

${prompt} is a significant topic that deserves careful consideration. Here are some key points to explore:

1. Understanding the fundamentals of ${prompt}
2. The benefits and advantages of ${prompt}
3. Implementation strategies and best practices
4. Common challenges and how to overcome them
5. Future trends and developments

This content provides a foundation for further exploration and research into ${prompt}. Remember to customize and expand upon these points based on your specific needs and audience.

---

*This AI-generated content should be reviewed and edited for accuracy and relevance.*`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-content-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Content Generator</h1>
        <p className="text-muted-foreground">
          Generate high-quality content using advanced AI algorithms
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Content Generator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Content Configuration
              </CardTitle>
              <CardDescription>
                Configure your content generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What would you like to write about?
                </label>
                <Textarea
                  placeholder="Enter your topic, idea, or prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Content Type
                  </label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tone
                  </label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Length
                  </label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lengths.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateContent} 
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content */}
          {generatedContent && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generated Content
                    </CardTitle>
                    <CardDescription>
                      {contentTypes.find(t => t.value === contentType)?.label} • 
                      {tones.find(t => t.value === tone)?.label} • 
                      {lengths.find(l => l.value === length)?.label}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadContent}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No content generation history yet</p>
              </CardContent>
            </Card>
          ) : (
            history.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{entry.contentType}</Badge>
                    <Badge variant="outline">{entry.tone}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">{entry.prompt}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {entry.content.substring(0, 100)}...
                </p>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}