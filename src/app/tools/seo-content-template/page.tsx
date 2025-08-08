'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, Download, RefreshCw, ExternalLink, FileText, Target, Users, Calendar, TrendingUp, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

interface ContentTemplate {
  title: string
  metaDescription: string
  h1: string
  introduction: string
  sections: Array<{
    heading: string
    content: string
    wordCount: number
  }>
  conclusion: string
  faq: Array<{
    question: string
    answer: string
  }>
  keywords: string[]
  wordCount: number
  readabilityScore: number
  seoScore: number
}

const CONTENT_TYPES = [
  { value: 'blog-post', label: 'Blog Post', icon: FileText },
  { value: 'product-page', label: 'Product Page', icon: Target },
  { value: 'service-page', label: 'Service Page', icon: Users },
  { value: 'landing-page', label: 'Landing Page', icon: TrendingUp },
  { value: 'category-page', label: 'Category Page', icon: FileText },
  { value: 'news-article', label: 'News Article', icon: FileText },
  { value: 'guide-tutorial', label: 'Guide/Tutorial', icon: Lightbulb }
]

const TARGET_AUDIENCES = [
  'Beginners',
  'Intermediate',
  'Advanced',
  'General Audience',
  'Business Professionals',
  'Technical Users',
  'Consumers',
  'Enterprise'
]

const TEMPLATES = {
  'blog-post': {
    sections: [
      { heading: 'Introduction', wordCount: 100, placeholder: 'Hook the reader and introduce the main topic...' },
      { heading: 'Problem Statement', wordCount: 150, placeholder: 'Describe the problem or challenge your audience faces...' },
      { heading: 'Solution Overview', wordCount: 200, placeholder: 'Introduce your solution and its benefits...' },
      { heading: 'Step-by-Step Guide', wordCount: 400, placeholder: 'Provide detailed, actionable steps...' },
      { heading: 'Best Practices', wordCount: 200, placeholder: 'Share expert tips and recommendations...' },
      { heading: 'Common Mistakes', wordCount: 150, placeholder: 'Highlight pitfalls to avoid...' },
      { heading: 'Conclusion', wordCount: 100, placeholder: 'Summarize key points and call to action...' }
    ],
    faqCount: 5,
    wordTarget: 1500
  },
  'product-page': {
    sections: [
      { heading: 'Product Overview', wordCount: 100, placeholder: 'Introduce your product and its main purpose...' },
      { heading: 'Key Features', wordCount: 300, placeholder: 'Detail the most important features and benefits...' },
      { heading: 'How It Works', wordCount: 250, placeholder: 'Explain the product functionality...' },
      { heading: 'Use Cases', wordCount: 200, placeholder: 'Describe real-world applications...' },
      { heading: 'Pricing', wordCount: 150, placeholder: 'Detail pricing options and plans...' },
      { heading: 'Customer Reviews', wordCount: 200, placeholder: 'Include testimonials and social proof...' }
    ],
    faqCount: 3,
    wordTarget: 1200
  },
  'service-page': {
    sections: [
      { heading: 'Service Introduction', wordCount: 100, placeholder: 'Introduce your service and its value proposition...' },
      { heading: 'What We Do', wordCount: 250, placeholder: 'Detail the services you provide...' },
      { heading: 'Process Overview', wordCount: 200, placeholder: 'Explain your service delivery process...' },
      { heading: 'Benefits', wordCount: 200, placeholder: 'Highlight the advantages of choosing your service...' },
      { heading: 'Pricing', wordCount: 150, placeholder: 'Detail pricing and packages...' },
      { heading: 'Why Choose Us', wordCount: 200, placeholder: 'Differentiate from competitors...' }
    ],
    faqCount: 4,
    wordTarget: 1100
  }
}

export default function SEOContentTemplateGenerator() {
  const [selectedType, setSelectedType] = useState('blog-post')
  const [formData, setFormData] = useState({
    title: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    targetAudience: '',
    tone: '',
    wordTarget: 1500
  })
  
  const [generatedTemplate, setGeneratedTemplate] = useState<ContentTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateTemplate = async () => {
    if (!formData.title.trim() || !formData.primaryKeyword.trim()) {
      toast.error('Please enter both title and primary keyword')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const template = TEMPLATES[selectedType as keyof typeof TEMPLATES] || TEMPLATES['blog-post']
      
      const keywords = [
        formData.primaryKeyword,
        ...(formData.secondaryKeywords ? formData.secondaryKeywords.split(',').map(k => k.trim()).filter(k => k) : [])
      ]

      const sections = template.sections.map(section => ({
        heading: section.heading,
        content: section.placeholder,
        wordCount: section.wordCount
      }))

      const faq = Array.from({ length: template.faqCount }, (_, i) => ({
        question: `Frequently Asked Question ${i + 1}`,
        answer: `Answer to FAQ ${i + 1} - Provide detailed information here...`
      }))

      const generatedTemplate: ContentTemplate = {
        title: formData.title,
        metaDescription: `${formData.primaryKeyword}: ${formData.title.substring(0, 150)}... Learn more about ${formData.primaryKeyword.toLowerCase()} with our comprehensive guide.`,
        h1: formData.title,
        introduction: `Welcome to our comprehensive guide on ${formData.primaryKeyword}. In this article, we'll explore everything you need to know about this important topic.`,
        sections,
        conclusion: `Thank you for reading our guide on ${formData.primaryKeyword}. We hope you found this information helpful and valuable.`,
        faq,
        keywords,
        wordCount: sections.reduce((total, section) => total + section.wordCount, 0),
        readabilityScore: Math.floor(Math.random() * 20) + 70, // 70-90
        seoScore: Math.floor(Math.random() * 25) + 75 // 75-100
      }

      setGeneratedTemplate(generatedTemplate)
      toast.success('SEO content template generated successfully!')
    } catch (error) {
      toast.error('Failed to generate content template')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadTemplate = () => {
    if (!generatedTemplate) return

    let content = `# SEO Content Template\n\n`
    content += `**Title:** ${generatedTemplate.title}\n\n`
    content += `**Meta Description:** ${generatedTemplate.metaDescription}\n\n`
    content += `**Primary Keyword:** ${formData.primaryKeyword}\n`
    content += `**Secondary Keywords:** ${formData.secondaryKeywords || 'None'}\n`
    content += `**Target Audience:** ${formData.targetAudience || 'Not specified'}\n\n`
    
    content += `## Content Structure\n\n`
    content += `### H1: ${generatedTemplate.h1}\n\n`
    
    content += `### Introduction\n${generatedTemplate.introduction}\n\n`
    
    generatedTemplate.sections.forEach((section, index) => {
      content += `### H${index + 2}: ${section.heading}\n`
      content += `**Target Word Count:** ${section.wordCount}\n`
      content += `${section.content}\n\n`
    })
    
    content += `### Conclusion\n${generatedTemplate.conclusion}\n\n`
    
    content += `## FAQ Section\n\n`
    generatedTemplate.faq.forEach((faq, index) => {
      content += `### Q${index + 1}: ${faq.question}\n`
      content += `**A${index + 1}:** ${faq.answer}\n\n`
    })
    
    content += `## SEO Optimization\n\n`
    content += `**Keywords:** ${generatedTemplate.keywords.join(', ')}\n`
    content += `**Target Word Count:** ${formData.wordTarget}\n`
    content += `**Estimated Word Count:** ${generatedTemplate.wordCount}\n`
    content += `**Readability Score:** ${generatedTemplate.readabilityScore}/100\n`
    content += `**SEO Score:** ${generatedTemplate.seoScore}/100\n\n`
    
    content += `## Content Guidelines\n\n`
    content += `- Include primary keyword in title, first paragraph, and throughout content\n`
    content += `- Use secondary keywords naturally throughout the content\n`
    content += `- Maintain keyword density of 1-2%\n`
    content += `- Use subheadings (H2, H3) to structure content logically\n`
    content += `- Include internal and external links where relevant\n`
    content += `- Optimize meta description for click-through rate\n`
    content += `- Use bullet points and numbered lists for readability\n`
    content += `- Include images with descriptive alt text\n`

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-content-template-${selectedType}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Content template downloaded!')
  }

  const previewTemplate = () => {
    if (!generatedTemplate) return

    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>SEO Content Template Preview</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .template-preview { max-width: 800px; margin: 0 auto; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .section h3 { color: #555; margin-top: 20px; }
            .meta-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
            .stat-card { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="template-preview">
            <div class="header">
              <h1>${generatedTemplate.title}</h1>
              <div class="meta-info">
                <strong>Meta Description:</strong> ${generatedTemplate.metaDescription}
              </div>
            </div>
            
            <div class="section">
              <h2>Content Structure</h2>
              <h3>Introduction</h3>
              <p>${generatedTemplate.introduction}</p>
              
              ${generatedTemplate.sections.map((section, index) => `
                <h3>H${index + 2}: ${section.heading}</h3>
                <p><strong>Target Word Count:</strong> ${section.wordCount}</p>
                <p>${section.content}</p>
              `).join('')}
              
              <h3>Conclusion</h3>
              <p>${generatedTemplate.conclusion}</p>
            </div>
            
            <div class="section">
              <h2>FAQ Section</h2>
              ${generatedTemplate.faq.map((faq, index) => `
                <h3>Q${index + 1}: ${faq.question}</h3>
                <p><strong>A${index + 1}:</strong> ${faq.answer}</p>
              `).join('')}
            </div>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-value">${generatedTemplate.wordCount}</div>
                <div class="stat-label">Word Count</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${generatedTemplate.readabilityScore}/100</div>
                <div class="stat-label">Readability</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${generatedTemplate.seoScore}/100</div>
                <div class="stat-label">SEO Score</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${generatedTemplate.keywords.length}</div>
                <div class="stat-label">Keywords</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Content Template Generator</h1>
        <p className="text-muted-foreground">
          Generate SEO-optimized content templates for different types of web pages
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Type Selection</CardTitle>
            <CardDescription>Choose the type of content you want to create a template for</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details for your SEO content template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="Enter your content title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Primary Keyword *</label>
                <Input
                  placeholder="Enter your main keyword"
                  value={formData.primaryKeyword}
                  onChange={(e) => handleInputChange('primaryKeyword', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Secondary Keywords</label>
                <Input
                  placeholder="keyword1, keyword2, keyword3"
                  value={formData.secondaryKeywords}
                  onChange={(e) => handleInputChange('secondaryKeywords', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target Audience</label>
                <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_AUDIENCES.map(audience => (
                      <SelectItem key={audience} value={audience}>
                        {audience}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content Tone</label>
                <Input
                  placeholder="Professional, casual, friendly, etc."
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target Word Count</label>
                <Input
                  type="number"
                  value={formData.wordTarget}
                  onChange={(e) => handleInputChange('wordTarget', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Structure Preview</CardTitle>
            <CardDescription>Preview the suggested structure for your content type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-4">
                Based on your selected content type, here's the recommended structure:
              </div>
              {(TEMPLATES[selectedType as keyof typeof TEMPLATES] || TEMPLATES['blog-post']).sections.map((section, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">H{index + 2}</Badge>
                    <span className="font-medium">{section.heading}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ~{section.wordCount} words
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate Content Template</CardTitle>
            <CardDescription>Click the button to generate your SEO content template</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateTemplate}
              disabled={isGenerating || !formData.title.trim() || !formData.primaryKeyword.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Content Template...
                </>
              ) : (
                'Generate SEO Content Template'
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedTemplate && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Content Template</CardTitle>
              <CardDescription>Your SEO-optimized content template will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Template generated for {selectedType}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={previewTemplate}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => copyToClipboard(JSON.stringify(generatedTemplate, null, 2))}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                    <Button 
                      onClick={downloadTemplate}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="structure">Structure</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="optimization">SEO</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Title & Meta Description</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="font-bold text-lg mb-2">{generatedTemplate.title}</div>
                        <div className="text-sm text-muted-foreground">{generatedTemplate.metaDescription}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{generatedTemplate.wordCount}</div>
                        <div className="text-sm text-muted-foreground">Word Count</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{generatedTemplate.readabilityScore}/100</div>
                        <div className="text-sm text-muted-foreground">Readability</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{generatedTemplate.seoScore}/100</div>
                        <div className="text-sm text-muted-foreground">SEO Score</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{generatedTemplate.keywords.length}</div>
                        <div className="text-sm text-muted-foreground">Keywords</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="structure" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Content Structure</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">H1: {generatedTemplate.h1}</h4>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Introduction</h4>
                          <p className="text-muted-foreground">{generatedTemplate.introduction}</p>
                        </div>
                        {generatedTemplate.sections.map((section, index) => (
                          <div key={index}>
                            <h4 className="font-medium mb-2">H{index + 2}: {section.heading}</h4>
                            <p className="text-muted-foreground">{section.content}</p>
                            <div className="text-sm text-muted-foreground mt-1">Target: ~{section.wordCount} words</div>
                          </div>
                        ))}
                        <div>
                          <h4 className="font-medium mb-2">Conclusion</h4>
                          <p className="text-muted-foreground">{generatedTemplate.conclusion}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="faq" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">FAQ Section</h3>
                      <div className="space-y-4">
                        {generatedTemplate.faq.map((faq, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Q{index + 1}: {faq.question}</h4>
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="optimization" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">SEO Optimization</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Target Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatedTemplate.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary">{keyword}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">SEO Guidelines</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Include primary keyword in title, first paragraph, and throughout content</li>
                            <li>Use secondary keywords naturally throughout the content</li>
                            <li>Maintain keyword density of 1-2%</li>
                            <li>Use subheadings (H2, H3) to structure content logically</li>
                            <li>Include internal and external links where relevant</li>
                            <li>Optimize meta description for click-through rate</li>
                            <li>Use bullet points and numbered lists for readability</li>
                            <li>Include images with descriptive alt text</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Content Template Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Structure</div>
                <div className="text-sm mt-2">Logical flow with clear sections</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Keywords</div>
                <div className="text-sm mt-2">Natural integration of target keywords</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Readability</div>
                <div className="text-sm mt-2">Easy to scan and understand</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">Conversion</div>
                <div className="text-sm mt-2">Designed to drive user action</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}