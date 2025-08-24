'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Eye, Copy, Download, Upload, Maximize2, Minimize2 } from 'lucide-react'

interface MarkdownDocument {
  id: string
  title: string
  content: string
  timestamp: Date
}

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState<string>('')
  const [html, setHtml] = useState<string>('')
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)
  const [documents, setDocuments] = useState<MarkdownDocument[]>([])
  const [currentDocument, setCurrentDocument] = useState<MarkdownDocument | null>(null)

  // Simple markdown to HTML converter
  const markdownToHTML = (md: string): string => {
    let html = md

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    html = html.replace(/_(.*?)_/g, '<em>$1</em>')
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

    // Unordered lists
    html = html.replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
    html = html.replace(/(<\/ul>\s*<ul>)/g, '') // Remove nested ul tags
    html = html.replace(/(<\/li>\s*<li>)/g, '</li><li>') // Fix list items
    html = html.replace(/(<ul>.*<\/ul>)/g, (match) => {
      return match.replace(/<li>/g, '<li>').replace(/<\/li>/g, '</li>')
    })

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>')
    html = html.replace(/(<\/ol>\s*<ol>)/g, '') // Remove nested ol tags
    html = html.replace(/(<\/li>\s*<li>)/g, '</li><li>') // Fix list items
    html = html.replace(/(<ol>.*<\/ol>)/g, (match) => {
      return match.replace(/<li>/g, '<li>').replace(/<\/li>/g, '</li>')
    })

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>')
    html = html.replace(/\n/g, '<br>')

    // Wrap in paragraphs
    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>'
    }

    return html
  }

  const updatePreview = () => {
    const htmlContent = markdownToHTML(markdown)
    setHtml(htmlContent)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadHTML = () => {
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
        ul, ol { padding-left: 20px; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
${html}
</body>
</html>`
    
    const blob = new Blob([fullHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'preview.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/markdown' || file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setMarkdown(content)
        
        // Create document entry
        const doc: MarkdownDocument = {
          id: Date.now().toString(),
          title: file.name.replace('.md', ''),
          content,
          timestamp: new Date()
        }
        setCurrentDocument(doc)
        setDocuments(prev => [doc, ...prev.slice(0, 9)])
      }
      reader.readAsText(file)
    }
  }

  const loadSampleMarkdown = () => {
    const sample = `# Markdown Sample

This is a **sample** markdown document to demonstrate the preview functionality.

## Features Supported

### Text Formatting
- **Bold text** using asterisks
- *Italic text* using single asterisks
- ~~Strikethrough~~ using tildes
- \`Inline code\` using backticks

### Lists

#### Unordered List
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

#### Ordered List
1. First item
2. Second item
3. Third item

### Links and Images

[Link to Google](https://www.google.com)

![Sample Image](https://via.placeholder.com/400x200?text=Sample+Image)

### Code Blocks

\`\`\`javascript
function helloWorld() {
    console.log("Hello, World!");
}
\`\`\`

Inline code: \`console.log("Hello")\`

### Blockquotes

> This is a blockquote.
> It can span multiple lines.
> Perfect for highlighting important information.

### Tables (Basic Support)

| Name  | Age  | City     |
|-------|------|----------|
| John  | 30   | New York |
| Jane  | 25   | London   |
| Bob   | 35   | Paris    |

---

*This markdown preview supports most common markdown features!*`
    
    setMarkdown(sample)
  }

  const clearAll = () => {
    setMarkdown('')
    setHtml('')
    setCurrentDocument(null)
  }

  const loadDocument = (doc: MarkdownDocument) => {
    setMarkdown(doc.content)
    setCurrentDocument(doc)
  }

  const saveCurrentDocument = () => {
    if (!markdown.trim()) return
    
    const doc: MarkdownDocument = {
      id: Date.now().toString(),
      title: currentDocument?.title || 'Untitled',
      content: markdown,
      timestamp: new Date()
    }
    
    setDocuments(prev => {
      const filtered = prev.filter(d => d.id !== doc.id)
      return [doc, ...filtered.slice(0, 9)]
    })
    
    setCurrentDocument(doc)
  }

  useEffect(() => {
    updatePreview()
  }, [markdown])

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Markdown Preview</h1>
        <p className="text-muted-foreground">Write markdown and see the rendered HTML preview in real-time</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={loadSampleMarkdown}>
          Sample
        </Button>
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              Upload MD
            </span>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".md,text/markdown"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button variant="outline" size="sm" onClick={saveCurrentDocument}>
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear
        </Button>
        <div className="flex-1" />
        <Button
          variant={isPreviewMode ? "outline" : "default"}
          size="sm"
          onClick={() => setIsPreviewMode(false)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant={isPreviewMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPreviewMode(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isPreviewMode ? "hidden lg:block" : "block"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Markdown Editor
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(markdown)}
                  disabled={!markdown}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadMarkdown}
                  disabled={!markdown}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Write your markdown here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your markdown here..."
              className="min-h-[500px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card className={isPreviewMode ? "block" : "hidden lg:block"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(html)}
                  disabled={!html}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadHTML}
                  disabled={!html}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Live preview of your markdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none min-h-[500px] p-4 border rounded bg-white"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </CardContent>
        </Card>
      </div>

      {documents.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              Your recently edited markdown documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                    currentDocument?.id === doc.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => loadDocument(doc)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.content.length} characters • {doc.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {doc.content.split('\n').length} lines
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Markdown Cheat Sheet</CardTitle>
          <CardDescription>
            Quick reference for common markdown syntax
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Basic Syntax</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded"># Heading 1</code>
                  <span>H1</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">## Heading 2</code>
                  <span>H2</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">### Heading 3</code>
                  <span>H3</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">**Bold**</code>
                  <span><strong>Bold</strong></span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">*Italic*</code>
                  <span><em>Italic</em></span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">~~Strikethrough~~</code>
                  <span><del>Strikethrough</del></span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Links & Media</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">[text](url)</code>
                  <span>Link</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">![alt](url)</code>
                  <span>Image</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">\`code\`</code>
                  <span>Inline code</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">\`\`\`block\`\`\`</code>
                  <span>Code block</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Lists</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">- Item</code>
                  <span>Unordered</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">1. Item</code>
                  <span>Ordered</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">{'> Quote'}</code>
                  <span>Blockquote</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">---</code>
                  <span>Horizontal rule</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Tables</h4>
              <div className="space-y-2 text-sm">
                <div className="font-mono text-xs">
                  | Header | Header |<br/>
                  |--------|--------|<br/>
                  | Cell   | Cell   |
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}