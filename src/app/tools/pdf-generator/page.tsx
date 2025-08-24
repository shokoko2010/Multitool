'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileText, Type, Image, Settings, Info } from 'lucide-react'

interface PDFConfig {
  title: string
  author: string
  subject: string
  keywords: string
  content: string
  fontSize: number
  fontFamily: string
  pageSize: 'A4' | 'A5' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export default function PDFGenerator() {
  const [config, setConfig] = useState<PDFConfig>({
    title: 'My Document',
    author: 'John Doe',
    subject: 'Generated Document',
    keywords: 'pdf, document, generated',
    content: `# Welcome to PDF Generator

This is a sample document created with the PDF Generator tool.

## Features

- **Easy to use**: Simple interface for creating documents
- **Customizable**: Adjust fonts, sizes, and page settings
- **Professional**: Generate clean, well-formatted documents
- **Export options**: Download as HTML or plain text

## Getting Started

1. Enter your document title and metadata
2. Add your content using Markdown formatting
3. Configure page settings and styling
4. Generate and download your document

## Markdown Support

You can use **bold text**, *italic text*, and \`code blocks\`.

### Lists

- Item 1
- Item 2
- Item 3

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Tables

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Lists | ✅ |
| Tables | ✅ |
| Code | ✅ |

> This is a blockquote example.

---

Thank you for using the PDF Generator tool!`,
    fontSize: 12,
    fontFamily: 'Arial',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  })

  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const pageSizes = {
    'A4': { width: 210, height: 297 },
    'A5': { width: 148, height: 210 },
    'Letter': { width: 216, height: 279 },
    'Legal': { width: 216, height: 356 }
  }

  const generatePDF = async () => {
    if (!config.title.trim() || !config.content.trim()) {
      setError('Please enter title and content')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Convert Markdown to HTML
      let htmlContent = config.content
      
      // Headers
      htmlContent = htmlContent
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')

      // Bold and italic
      htmlContent = htmlContent
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')

      // Inline code
      htmlContent = htmlContent.replace(/`([^`]+)`/gim, '<code>$1</code>')

      // Code blocks
      htmlContent = htmlContent.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, language, code) => {
        return `<pre><code class="language-${language || ''}">${code.trim()}</code></pre>`
      })

      // Links
      htmlContent = htmlContent.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')

      // Images
      htmlContent = htmlContent.replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">')

      // Unordered lists
      htmlContent = htmlContent.replace(/^[\s]*-[\s]+(.*$)/gim, '<li>$1</li>')
      htmlContent = htmlContent.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

      // Ordered lists
      htmlContent = htmlContent.replace(/^[\s]*\d+\.[\s]+(.*$)/gim, '<li>$1</li>')
      htmlContent = htmlContent.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')

      // Blockquotes
      htmlContent = htmlContent.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

      // Horizontal rules
      htmlContent = htmlContent.replace(/^---$/gim, '<hr>')

      // Line breaks
      htmlContent = htmlContent.replace(/\n/gim, '<br>')

      // Clean up double line breaks
      htmlContent = htmlContent.replace(/<br><br>/gim, '<br>')

      // Generate HTML document
      const pageSize = pageSizes[config.pageSize]
      const { width, height } = config.orientation === 'landscape' 
        ? { width: pageSize.height, height: pageSize.width }
        : pageSize

      const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <meta name="author" content="${config.author}">
    <meta name="subject" content="${config.subject}">
    <meta name="keywords" content="${config.keywords}">
    <style>
        @page {
            size: ${config.pageSize} ${config.orientation};
            margin: ${config.margins.top}mm ${config.margins.right}mm ${config.margins.bottom}mm ${config.margins.left}mm;
        }
        
        body {
            font-family: ${config.fontFamily}, sans-serif;
            font-size: ${config.fontSize}px;
            line-height: 1.6;
            color: #333;
            max-width: ${width - config.margins.left - config.margins.right}mm;
            margin: 0 auto;
            padding: ${config.margins.top}mm ${config.margins.right}mm ${config.margins.bottom}mm ${config.margins.left}mm;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #222;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        
        h1 { font-size: ${config.fontSize + 8}px; }
        h2 { font-size: ${config.fontSize + 6}px; }
        h3 { font-size: ${config.fontSize + 4}px; }
        h4 { font-size: ${config.fontSize + 2}px; }
        h5 { font-size: ${config.fontSize + 1}px; }
        h6 { font-size: ${config.fontSize}px; }
        
        code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: ${config.fontSize - 1}px;
        }
        
        pre {
            background-color: #f4f4f4;
            padding: 16px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1em 0;
        }
        
        pre code {
            background: none;
            padding: 0;
            font-size: ${config.fontSize - 1}px;
        }
        
        blockquote {
            border-left: 4px solid #ddd;
            margin: 1em 0;
            padding-left: 16px;
            color: #666;
            font-style: italic;
        }
        
        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        
        li {
            margin: 0.25em 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 2em 0;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

      setGeneratedContent(htmlDocument)

    } catch (err) {
      setError('Failed to generate PDF: ' + (err as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadHTML = () => {
    if (!generatedContent) return
    
    const blob = new Blob([generatedContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadText = () => {
    if (!config.content) return
    
    const textContent = `${config.title}

Author: ${config.author}
Subject: ${config.subject}
Keywords: ${config.keywords}
Generated on: ${new Date().toLocaleDateString()}

${config.content}`
    
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const updateConfig = (key: keyof PDFConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateMargin = (side: keyof PDFConfig['margins'], value: number) => {
    setConfig(prev => ({
      ...prev,
      margins: { ...prev.margins, [side]: value }
    }))
  }

  const loadSample = () => {
    setConfig({
      ...config,
      title: 'Sample PDF Document',
      author: 'PDF Generator',
      subject: 'Sample Document',
      keywords: 'sample, pdf, document',
      content: config.content
    })
    setError('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">PDF Generator</h1>
          <p className="text-muted-foreground">
            Create professional documents with Markdown support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Document Settings
              </CardTitle>
              <CardDescription>
                Configure your document properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={config.title}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  placeholder="Document title"
                />
              </div>

              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  value={config.author}
                  onChange={(e) => updateConfig('author', e.target.value)}
                  placeholder="Author name"
                />
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={config.subject}
                  onChange={(e) => updateConfig('subject', e.target.value)}
                  placeholder="Document subject"
                />
              </div>

              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={config.keywords}
                  onChange={(e) => updateConfig('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Page Size</Label>
                  <Select value={config.pageSize} onValueChange={(value) => updateConfig('pageSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A5">A5</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select value={config.orientation} onValueChange={(value) => updateConfig('orientation', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={config.fontFamily} onValueChange={(value) => updateConfig('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Size: {config.fontSize}px</Label>
                <Input
                  type="range"
                  min="8"
                  max="24"
                  value={config.fontSize}
                  onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Margins (mm)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Top</Label>
                    <Input
                      type="number"
                      value={config.margins.top}
                      onChange={(e) => updateMargin('top', parseInt(e.target.value) || 0)}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Right</Label>
                    <Input
                      type="number"
                      value={config.margins.right}
                      onChange={(e) => updateMargin('right', parseInt(e.target.value) || 0)}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bottom</Label>
                    <Input
                      type="number"
                      value={config.margins.bottom}
                      onChange={(e) => updateMargin('bottom', parseInt(e.target.value) || 0)}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Left</Label>
                    <Input
                      type="number"
                      value={config.margins.left}
                      onChange={(e) => updateMargin('left', parseInt(e.target.value) || 0)}
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={loadSample}>
                  Load Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Content Editor
              </CardTitle>
              <CardDescription>
                Write your document content using Markdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Content (Markdown)</Label>
                <Textarea
                  value={config.content}
                  onChange={(e) => updateConfig('content', e.target.value)}
                  placeholder="Write your content here using Markdown..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={generatePDF} 
                  disabled={!config.title.trim() || !config.content.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="text-sm">Markdown Quick Reference</Label>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><code className="bg-gray-100 px-1 rounded"># Header</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">**bold**</code> <code className="bg-gray-100 px-1 rounded">*italic*</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">- list item</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">[link](url)</code></div>
                  <div><code className="bg-gray-100 px-1 rounded">\`\`\`code\`\`\`</code></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview & Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Preview & Download
              </CardTitle>
              <CardDescription>
                Preview your document and download it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedContent ? (
                <>
                  <div className="space-y-2">
                    <Label>Document Preview</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={generatedContent}
                        className="w-full h-64 border-0"
                        title="Document Preview"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Download Options</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={downloadHTML} variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        HTML
                      </Button>
                      <Button onClick={downloadText} variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Text
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Document Info</Label>
                    <div className="text-sm space-y-1">
                      <div><strong>Size:</strong> {config.pageSize} {config.orientation}</div>
                      <div><strong>Font:</strong> {config.fontFamily}, {config.fontSize}px</div>
                      <div><strong>Margins:</strong> {config.margins.top}/{config.margins.right}/{config.margins.bottom}/{config.margins.left}mm</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    No document generated yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Configure settings and add content, then generate your document
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Features & Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">📝 Rich Content</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Markdown support</li>
                  <li>• Headers and formatting</li>
                  <li>• Lists and tables</li>
                  <li>• Code blocks</li>
                  <li>• Images and links</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎨 Styling Options</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Multiple fonts</li>
                  <li>• Adjustable font sizes</li>
                  <li>• Page size selection</li>
                  <li>• Orientation control</li>
                  <li>• Custom margins</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📤 Export Options</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• HTML export</li>
                  <li>• Plain text export</li>
                  <li>• Print-ready format</li>
                  <li>• Metadata inclusion</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="mt-6">
          <Info className="w-4 h-4" />
          <AlertDescription>
            This tool generates HTML documents that are optimized for printing and can be saved as PDF using your browser's print function (Ctrl+P or Cmd+P).
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}