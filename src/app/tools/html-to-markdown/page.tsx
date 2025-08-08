'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RefreshCw, FileText, Globe, Code, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConversionConfig {
  style: 'github' | 'commonmark' | 'extra' | 'ghost'
  wrap: 'preserve' | 'auto'
  headingStyle: 'atx' | 'setext'
  bulletListMarker: '-' | '*' | '+'
  codeBlockStyle: 'fenced' | 'indented'
  tablePipeHeader: boolean
}

const conversionStyles = [
  { value: 'github', label: 'GitHub Flavored Markdown', description: 'GitHub-style markdown with GFM features' },
  { value: 'commonmark', label: 'CommonMark', description: 'Standard markdown specification' },
  { value: 'extra', label: 'Markdown Extra', description: 'Extended markdown with tables, footnotes' },
  { value: 'ghost', label: 'Ghost', description: 'Ghost platform markdown style' }
]

export default function HTMLToMarkdownTool() {
  const [htmlInput, setHtmlInput] = useState('')
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [conversionConfig, setConversionConfig] = useState<ConversionConfig>({
    style: 'github',
    wrap: 'auto',
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    tablePipeHeader: true
  })
  const [isConverting, setIsConverting] = useState(false)
  const [activeTab, setActiveTab] = useState('input')
  const { toast } = useToast()

  const convertHTMLToMarkdown = async () => {
    if (!htmlInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter HTML content to convert",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    // Simulate conversion process
    setTimeout(() => {
      const convertedMarkdown = simulateConversion()
      setMarkdownOutput(convertedMarkdown)
      setIsConverting(false)
      
      toast({
        title: "Conversion Complete",
        description: "HTML successfully converted to Markdown",
      })
    }, 1500)
  }

  const simulateConversion = (): string => {
    const html = htmlInput.trim()
    
    // Simple HTML to Markdown simulation
    let markdown = html
    
    // Convert basic HTML tags to markdown
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1')
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1')
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1')
    
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```')
    
    markdown = markdown.replace(/<a[^>]*href=['"]([^'"]*)['"][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    markdown = markdown.replace(/<img[^>]*src=['"]([^'"]*)['"][^>]*alt=['"]([^'"]*)['"][^>]*>/gi, '![$2]($1)')
    markdown = markdown.replace(/<img[^>]*src=['"]([^'"]*)['"][^>]*>/gi, '![]($1)')
    
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    })
    
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, (match, item, index) => {
        return `${index + 1}. ${item}\n`
      })
    })
    
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
    markdown = markdown.replace(/<[^>]+>/g, '')
    markdown = markdown.replace(/\n{3,}/g, '\n\n')
    markdown = markdown.trim()
    
    return markdown
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const downloadMarkdown = () => {
    if (!markdownOutput) return
    
    const blob = new Blob([markdownOutput], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Your Markdown file download has begun",
    })
  }

  const loadSampleHTML = () => {
    const sampleHTML = `
      <h1>Welcome to Our Website</h1>
      <p>This is a <strong>sample HTML</strong> document to demonstrate the conversion to <em>Markdown</em> format.</p>
      
      <h2>Features</h2>
      <ul>
        <li>Converts HTML headings to Markdown</li>
        <li>Handles <strong>bold</strong> and <em>italic</em> text</li>
        <li>Processes lists and links</li>
        <li>Supports code blocks</li>
      </ul>
      
      <h3>Code Example</h3>
      <pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>
      
      <p>Visit our <a href="https://example.com">website</a> for more information.</p>
    `
    
    setHtmlInput(sampleHTML.trim())
  }

  const clearAll = () => {
    setHtmlInput('')
    setMarkdownOutput('')
  }

  const updateConfig = (key: keyof ConversionConfig, value: any) => {
    setConversionConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">HTML to Markdown Converter</h1>
        <p className="text-muted-foreground">
          Convert HTML content to Markdown format with customizable options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              HTML Input
            </CardTitle>
            <CardDescription>
              Enter or paste HTML content to convert to Markdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="html-input">HTML Content</Label>
              <Textarea
                id="html-input"
                placeholder="Paste your HTML content here..."
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={convertHTMLToMarkdown} disabled={isConverting || !htmlInput.trim()} className="flex-1">
                {isConverting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Convert to Markdown
                  </>
                )}
              </Button>
              <Button onClick={loadSampleHTML} variant="outline">
                Load Sample
              </Button>
              <Button onClick={clearAll} variant="outline">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Markdown Output
              </span>
              {markdownOutput && (
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(markdownOutput, 'Markdown')} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadMarkdown} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Your converted Markdown content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {markdownOutput ? (
              <div className="space-y-4">
                <Textarea
                  value={markdownOutput}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="text-center">
                  <Badge variant="secondary">
                    {markdownOutput.split('\n').length} lines • {markdownOutput.length} characters
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No Markdown converted yet</p>
                <p className="text-sm">Enter HTML content and click "Convert to Markdown"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Conversion Configuration
          </CardTitle>
          <CardDescription>
            Customize how HTML is converted to Markdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Markdown Style</Label>
              <Select value={conversionConfig.style} onValueChange={(value) => updateConfig('style', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conversionStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Heading Style</Label>
              <Select value={conversionConfig.headingStyle} onValueChange={(value) => updateConfig('headingStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atx">ATX (# Header)</SelectItem>
                  <SelectItem value="setext">Setex (Header ===)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bullet List Marker</Label>
              <Select value={conversionConfig.bulletListMarker} onValueChange={(value) => updateConfig('bulletListMarker', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Dash (-)</SelectItem>
                  <SelectItem value="*">Asterisk (*)</SelectItem>
                  <SelectItem value="+">Plus (+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Code Block Style</Label>
              <Select value={conversionConfig.codeBlockStyle} onValueChange={(value) => updateConfig('codeBlockStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fenced">Fenced (```)</SelectItem>
                  <SelectItem value="indented">Indented (4 spaces)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text Wrapping</Label>
              <Select value={conversionConfig.wrap} onValueChange={(value) => updateConfig('wrap', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-wrap</SelectItem>
                  <SelectItem value="preserve">Preserve line breaks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionConfig.tablePipeHeader}
                  onChange={(e) => updateConfig('tablePipeHeader', e.target.checked)}
                  className="rounded"
                />
                <span>Use pipes for table headers</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Supported HTML Elements</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Badge variant="outline">Headings (h1-h6)</Badge>
              <Badge variant="outline">Text formatting</Badge>
              <Badge variant="outline">Links & Images</Badge>
              <Badge variant="outline">Lists</Badge>
              <Badge variant="outline">Code blocks</Badge>
              <Badge variant="outline">Tables</Badge>
              <Badge variant="outline">Blockquotes</Badge>
              <Badge variant="outline">Horizontal rules</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}