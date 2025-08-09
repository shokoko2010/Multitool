import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Share2, Star, Heart, Zap, Shield, Globe, TrendingUp, Brain, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface ToolPageProps {
  params: {
    tool: string
  }
}

// Tool definitions - in a real app this would come from a database or API
const tools: Record<string, any> = {
  'seo-analyzer': {
    name: 'SEO Analyzer',
    title: 'SEO Analyzer - Free Online SEO Analysis Tool',
    description: 'Comprehensive website SEO analysis tool that checks your site for technical SEO issues, content optimization, and ranking factors.',
    category: 'SEO Tools',
    icon: TrendingUp,
    keywords: ['seo analyzer', 'website seo', 'seo checker', 'seo audit', 'seo analysis'],
    features: [
      'Technical SEO analysis',
      'Content optimization suggestions',
      'Mobile-friendliness check',
      'Page speed analysis',
      'Backlink analysis',
      'Keyword research',
      'Competitor analysis'
    ],
    steps: [
      'Enter your website URL',
      'Select analysis options',
      'Click "Analyze SEO"',
      'Review comprehensive report',
      'Download optimization recommendations'
    ]
  },
  'ai-content-generator': {
    name: 'AI Content Generator',
    title: 'AI Content Generator - Create High-Quality Content',
    description: 'Generate high-quality, engaging content using advanced AI algorithms. Perfect for blog posts, articles, and marketing copy.',
    category: 'AI Tools',
    icon: Brain,
    keywords: ['ai content generator', 'content creation', 'ai writing', 'text generation', 'content marketing'],
    features: [
      'AI-powered content generation',
      'Multiple content types',
      'Customizable tone and style',
      'SEO optimization',
      'Plagiarism-free content',
      'Multiple language support'
    ],
    steps: [
      'Choose content type',
      'Select tone and style',
      'Enter topic or keywords',
      'Set content length',
      'Generate content',
      'Review and edit'
    ]
  },
  'ai-code-reviewer': {
    name: 'AI Code Reviewer',
    title: 'AI Code Reviewer - Intelligent Code Quality Analysis',
    description: 'AI-powered code review tool that analyzes code quality, detects bugs, and provides optimization suggestions for multiple programming languages.',
    category: 'Development Tools',
    icon: Brain,
    keywords: ['ai code reviewer', 'code analysis', 'code quality', 'bug detection', 'code optimization', 'static analysis', 'programming tools'],
    features: [
      'Multi-language support (JavaScript, Python, Java, etc.)',
      'AI-powered bug detection',
      'Code quality scoring',
      'Performance optimization suggestions',
      'Security vulnerability analysis',
      'Maintainability recommendations',
      'Export analysis reports'
    ],
    steps: [
      'Select your programming language',
      'Paste your code into the editor',
      'Click "Analyze Code"',
      'Review the AI-generated analysis',
      'Apply suggested improvements'
    ]
  },
  'serp-checker': {
    name: 'SERP Checker',
    title: 'SERP Checker - Track Keyword Rankings in Search Results',
    description: 'Monitor your keyword positions across search engines with detailed analytics and competitor tracking.',
    category: 'SEO Tools',
    icon: TrendingUp,
    keywords: ['serp checker', 'keyword position tracker', 'ranking checker', 'seo monitoring', 'keyword rankings', 'search position tracker', 'competitor analysis'],
    features: [
      'Multi-search engine support (Google, Bing, Yahoo)',
      'Real-time ranking tracking',
      'Competitor analysis',
      'Historical position data',
      'Country and location targeting',
      'Search volume and competition metrics',
      'Export functionality'
    ],
    steps: [
      'Enter your target keywords',
      'Select search engine and location',
      'Click "Check SERP Rankings"',
      'Review detailed ranking analysis',
      'Monitor competitor positions'
    ]
  },
  'data-visualization': {
    name: 'Data Visualization Tool',
    title: 'Data Visualization Tool - Create Charts and Graphs from Data',
    description: 'Transform your data into beautiful, interactive charts and graphs with multiple chart types and customization options.',
    category: 'Data Analysis',
    icon: BarChart3,
    keywords: ['data visualization', 'chart generator', 'graph maker', 'data analysis', 'chart creation', 'csv to chart', 'interactive charts'],
    features: [
      'Multiple chart types (bar, line, pie, doughnut, area, scatter)',
      'CSV data import and parsing',
      'Customizable color palettes',
      'Interactive chart generation',
      'Code export functionality',
      'Sample datasets included',
      'Professional styling options'
    ],
    steps: [
      'Paste your CSV data or use a sample',
      'Select chart type and styling options',
      'Click "Generate Chart"',
      'Customize chart appearance',
      'Export or share your visualization'
    ]
  }
}

export function generateMetadata({ params }: ToolPageProps) {
  const tool = tools[params.tool]
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.'
    }
  }

  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: tool.title,
      description: tool.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: tool.title,
      description: tool.description,
    },
  }
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = tools[params.tool]

  if (!tool) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-primary">
            Tools
          </Link>
          <span>/</span>
          <span className="text-foreground">{tool.name}</span>
        </div>

        {/* Hero Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">{tool.category}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-muted-foreground ml-1">(4.5)</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {tool.name}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="px-8">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Using Tool
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  <Heart className="w-4 h-4 mr-2" />
                  Save Tool
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tool Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant="outline">Web Application</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Privacy</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Speed</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Fast
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/tools/keyword-density" className="block text-sm hover:text-primary">
                    Keyword Density Checker
                  </Link>
                  <Link href="/tools/meta-tag-generator" className="block text-sm hover:text-primary">
                    Meta Tag Generator
                  </Link>
                  <Link href="/tools/backlink-checker" className="block text-sm hover:text-primary">
                    Backlink Checker
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tool.features.map((feature: string, index: number) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature}</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced functionality to help you achieve your goals efficiently.
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">How to Use</h2>
          <Card>
            <CardHeader>
              <CardTitle>Simple 3-Step Process</CardTitle>
              <CardDescription>
                Get started with our tool in just a few simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {tool.steps.map((step: string, index: number) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <h3 className="font-semibold mb-2">Step {index + 1}</h3>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Why Choose This Tool?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Secure & Private</h3>
              </div>
              <p className="text-muted-foreground">
                All processing happens locally in your browser. We don't collect or store any of your data.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Lightning Fast</h3>
              </div>
              <p className="text-muted-foreground">
                Optimized for performance with instant results and minimal loading times.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Cross-Platform</h3>
              </div>
              <p className="text-muted-foreground">
                Works perfectly on desktop, tablet, and mobile devices. No installation required.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Free Forever</h3>
              </div>
              <p className="text-muted-foreground">
                Completely free to use with no hidden costs or premium features behind paywalls.
              </p>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our tools to get their work done faster and more efficiently.
          </p>
          <Button size="lg" className="px-8">
            <Zap className="w-4 h-4 mr-2" />
            Start Using {tool.name}
          </Button>
        </section>
      </div>
    </div>
  )
}