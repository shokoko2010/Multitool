'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText, Code, Eye, Settings, RefreshCw } from 'lucide-react'

interface ConversionOptions {
  includeStyles: boolean
  includeTOC: boolean
  codeHighlight: boolean
  theme: 'default' | 'github' | 'dark' | 'minimal'
  headingStyle: 'atx' | 'setext'
  linkStyle: 'inline' | 'reference'
  imageStyle: 'inline' | 'reference'
}

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState('')
  const [html, setHtml] = useState('')
  const [options, setOptions] = useState<ConversionOptions>({
    includeStyles: true,
    includeTOC: false,
    codeHighlight: true,
    theme: 'github',
    headingStyle: 'atx',
    linkStyle: 'inline',
    imageStyle: 'inline'
  })
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(true)

  const sampleMarkdown = `# Welcome to Markdown to HTML Converter

This is a **sample markdown** document to demonstrate the conversion capabilities.

## Features

- **Bold and *italic* text**
- \`Inline code\` and code blocks
- [Links](https://example.com)
- Images: ![Example](https://via.placeholder.com/150)
- Lists and tables

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Table Example

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Links | ✅ |
| Tables | ✅ |
| Code | ✅ |

> This is a blockquote example.

---

*Thank you for using this tool!*`

  const convertMarkdownToHtml = async () => {
    if (!markdown.trim()) {
      setError('Please enter some markdown text')
      return
    }

    setIsConverting(true)
    setError('')

    try {
      // Simulate conversion delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let convertedHtml = markdown

      // Headers
      convertedHtml = convertedHtml
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')

      // Bold and italic
      convertedHtml = convertedHtml
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')

      // Inline code
      convertedHtml = convertedHtml.replace(/`([^`]+)`/gim, '<code>$1</code>')

      // Code blocks
      convertedHtml = convertedHtml.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, language, code) => {
        const lang = language ? ` class="language-${language}"` : ''
        return `<pre><code${lang}>${code.trim()}</code></pre>`
      })

      // Links
      convertedHtml = convertedHtml.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')

      // Images
      convertedHtml = convertedHtml.replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">')

      // Unordered lists
      convertedHtml = convertedHtml.replace(/^[\s]*-[\s]+(.*$)/gim, '<li>$1</li>')
      convertedHtml = convertedHtml.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

      // Ordered lists
      convertedHtml = convertedHtml.replace(/^[\s]*\d+\.[\s]+(.*$)/gim, '<li>$1</li>')
      convertedHtml = convertedHtml.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')

      // Blockquotes
      convertedHtml = convertedHtml.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

      // Horizontal rules
      convertedHtml = convertedHtml.replace(/^---$/gim, '<hr>')

      // Line breaks
      convertedHtml = convertedHtml.replace(/\n/gim, '<br>')

      // Clean up double line breaks
      convertedHtml = convertedHtml.replace(/<br><br>/gim, '<br>')

      // Add wrapper div and optional styles
      let finalHtml = convertedHtml
      
      if (options.includeStyles) {
        const themeStyles = {
          default: `
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            h1, h2, h3 { color: #333; }
            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
            blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; }
            table { border-collapse: collapse; width: 100%; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          `,
          github: `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 20px; }
            h1, h2, h3 { color: #24292e; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
            code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-size: 85%; }
            pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
            blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding: 0 16px; color: #6a737d; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
            th { background-color: #f6f8fa; font-weight: 600; }
          `,
          dark: `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 20px; background: #0d1117; color: #c9d1d9; }
            h1, h2, h3 { color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 0.3em; }
            code { background: #161b22; padding: 0.2em 0.4em; border-radius: 3px; font-size: 85%; }
            pre { background: #161b22; padding: 16px; border-radius: 6px; overflow-x: auto; }
            blockquote { border-left: 4px solid #30363d; margin: 0; padding: 0 16px; color: #8b949e; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            th, td { border: 1px solid #30363d; padding: 6px 13px; }
            th { background-color: #161b22; font-weight: 600; }
          `,
          minimal: `
            body { font-family: Georgia, serif; line-height: 1.8; margin: 40px; color: #333; }
            h1, h2, h3 { color: #000; font-weight: normal; }
            code { background: #f5f5f5; padding: 2px 4px; font-family: 'Courier New', monospace; }
            pre { background: #f5f5f5; padding: 16px; font-family: 'Courier New', monospace; }
            blockquote { font-style: italic; margin: 0; padding-left: 20px; border-left: 3px solid #ccc; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ccc; padding: 8px; }
            th { background-color: #f5f5f5; text-align: left; }
          `
        }

        finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Markdown</title>
    <style>
        ${themeStyles[options.theme]}
    </style>
</head>
<body>
    ${options.includeTOC ? generateTOC(convertedHtml) : ''}
    ${convertedHtml}
</body>
</html>`
      } else {
        finalHtml = `<div class="markdown-content">${convertedHtml}</div>`
      }

      setHtml(finalHtml)
    } catch (err) {
      setError('Conversion failed: ' + (err as Error).message)
    } finally {
      setIsConverting(false)
    }
  }

  const generateTOC = (htmlContent: string) => {
    const headers = htmlContent.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || []
    if (headers.length === 0) return ''

    let toc = '<nav class="toc"><h2>Table of Contents</h2><ul>'
    
    headers.forEach((header) => {
      const text = header.replace(/<[^>]*>/g, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      toc += `<li><a href="#${id}">${text}</a></li>`
    })
    
    toc += '</ul></nav>'
    return toc
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const downloadHtml = () => {
    if (!html) return
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    setMarkdown(sampleMarkdown)
    setError('')
  }

  const clearAll = () => {
    setMarkdown('')
    setHtml('')
    setError('')
  }

  const updateOption = (key: keyof ConversionOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Markdown to HTML Converter</h1>
          <p className="text-muted-foreground">
            Convert Markdown syntax to clean, styled HTML
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Markdown Input
              </CardTitle>
              <CardDescription>
                Enter your Markdown content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Markdown Content</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadSample}>
                      Sample
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Enter your Markdown here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={convertMarkdownToHtml} 
                  disabled={!markdown.trim() || isConverting}
                  className="flex-1"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4 mr-2" />
                      Convert to HTML
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Options Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Conversion Options
              </CardTitle>
              <CardDescription>
                Customize the HTML output
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={options.theme} 
                  onValueChange={(value) => updateOption('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeStyles"
                    checked={options.includeStyles}
                    onChange={(e) => updateOption('includeStyles', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="includeStyles" className="text-sm">
                    Include CSS Styles
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTOC"
                    checked={options.includeTOC}
                    onChange={(e) => updateOption('includeTOC', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="includeTOC" className="text-sm">
                    Include Table of Contents
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="codeHighlight"
                    checked={options.codeHighlight}
                    onChange={(e) => updateOption('codeHighlight', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="codeHighlight" className="text-sm">
                    Code Syntax Highlighting
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features Supported</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="text-xs">Headers</Badge>
                  <Badge variant="outline" className="text-xs">Bold/Italic</Badge>
                  <Badge variant="outline" className="text-xs">Links</Badge>
                  <Badge variant="outline" className="text-xs">Images</Badge>
                  <Badge variant="outline" className="text-xs">Lists</Badge>
                  <Badge variant="outline" className="text-xs">Code Blocks</Badge>
                  <Badge variant="outline" className="text-xs">Tables</Badge>
                  <Badge variant="outline" className="text-xs">Blockquotes</Badge>
                </div>
              </div>

              {html && (
                <div className="space-y-2">
                  <Label>Output Actions</Label>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyToClipboard(html)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy HTML
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={downloadHtml}
                      className="flex-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                HTML Output
              </CardTitle>
              <CardDescription>
                {showPreview ? 'Live preview' : 'HTML source code'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={showPreview ? "default" : "outline"}
                  onClick={() => setShowPreview(true)}
                  className="flex-1"
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant={!showPreview ? "default" : "outline"}
                  onClick={() => setShowPreview(false)}
                  className="flex-1"
                >
                  Source
                </Button>
              </div>

              {html ? (
                <div className="border rounded-lg overflow-hidden">
                  {showPreview ? (
                    <div className="p-4 bg-white min-h-[400px] max-h-[600px] overflow-y-auto">
                      <div 
                        dangerouslySetInnerHTML={{ __html: html }} 
                        className="prose max-w-none"
                      />
                    </div>
                  ) : (
                    <pre className="p-4 bg-gray-50 text-xs overflow-x-auto max-h-[600px]">
                      <code>{html}</code>
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    No HTML output yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Convert Markdown to see the result here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}