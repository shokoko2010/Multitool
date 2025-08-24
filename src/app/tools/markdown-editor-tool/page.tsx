'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, FileText, Eye, FileDown, FileUp, Maximize2, Minimize2 } from 'lucide-react'

export default function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState('')
  const [htmlOutput, setHtmlOutput] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState(14)
  const [lineNumbers, setLineNumbers] = useState(true)
  const [wordWrap, setWordWrap] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convertMarkdownToHtml = useCallback(() => {
    if (!markdown.trim()) {
      setHtmlOutput('')
      return
    }

    // Simple markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/__(.*)__/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/_(.*)_/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Images
      .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      // Unordered lists
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr>')
      // Paragraphs
      .replace(/(<\/[h|o|u][^>]*>)(.*?)(?=<[h|o|u]|$)/gs, '$1</p>$2<p>')
      .replace(/^(?!<[h|o|u])(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>)/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<ul>|<ol>)/g, '$1')
      .replace(/(<\/ul>|<\/ol>)<\/p>/g, '$1')
      .replace(/<p>(<li>)/g, '$1')
      .replace(/(<\/li>)<\/p>/g, '$1')
      .replace(/<p>(<blockquote>)/g, '$1')
      .replace(/(<\/blockquote>)<\/p>/g, '$1')
      .replace(/<p>(<pre>)/g, '$1')
      .replace(/(<\/pre>)<\/p>/g, '$1')
      .replace(/<p>(<hr>)/g, '$1')
      .replace(/(<hr>)<\/p>/g, '$1')

    setHtmlOutput(html)
  }, [markdown])

  const handleCopy = async () => {
    if (htmlOutput) {
      await navigator.clipboard.writeText(htmlOutput)
    }
  }

  const handleDownloadMarkdown = () => {
    if (markdown) {
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.md'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadHtml = () => {
    if (htmlOutput) {
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
      pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
      code { background: #f4f4f4; padding: 2px 4px; border-radius: 2px; }
      blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; }
    </style>
</head>
<body>
${htmlOutput}
</body>
</html>`
      const blob = new Blob([fullHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.html'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setMarkdown(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setMarkdown('')
    setHtmlOutput('')
  }

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = markdown.substring(start, end)
      const textToInsert = before + (selectedText || placeholder) + after
      const newValue = markdown.substring(0, start) + textToInsert + markdown.substring(end)
      setMarkdown(newValue)
      
      // Set cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length + (selectedText || placeholder).length, start + before.length + (selectedText || placeholder).length)
      }, 0)
    }
  }

  const getSampleMarkdown = () => {
    return `# Markdown Editor

This is a **markdown editor** with live preview.

## Features

- *Live preview*
- **Syntax highlighting**
- \`Code blocks\`
- [Links](https://example.com)
- > Blockquotes

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Unordered item
- Another item
- Last item

---

Happy editing! 🎉`
  }

  return (
    <div className={`container mx-auto p-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'max-w-7xl'}`}>
      <Card className={`${isFullscreen ? 'h-full rounded-none' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Markdown Editor
              </CardTitle>
              <CardDescription>
                Edit markdown with live preview and syntax highlighting
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`${isFullscreen ? 'h-[calc(100%-120px)]' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Markdown</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertText('**', '**', 'bold text')}
                  >
                    <strong>B</strong>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertText('*', '*', 'italic text')}
                  >
                    <em>I</em>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertText('`', '`', 'code')}
                  >
                    <code>{'{}'}</code>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertText('[', '](url)', 'link text')}
                  >
                    Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertText('```\n', '\n```', 'code')}
                  >
                    Code
                  </Button>
                </div>
              </div>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={isFullscreen ? 20 : 12}
                className="font-mono text-sm resize-none"
                placeholder="Write your markdown here..."
                style={{ fontSize: `${fontSize}px` }}
                wrap={wordWrap ? 'soft' : 'off'}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Preview</label>
                <Button variant="outline" size="sm" onClick={convertMarkdownToHtml}>
                  <Eye className="h-4 w-4 mr-2" />
                  Update Preview
                </Button>
              </div>
              <div 
                className={`border rounded-md p-4 overflow-auto ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}
                style={{ fontSize: `${fontSize}px`, minHeight: isFullscreen ? '400px' : '300px' }}
              >
                {htmlOutput ? (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlOutput }}
                  />
                ) : (
                  <div className="text-muted-foreground text-center py-8">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Click "Update Preview" to see the rendered HTML</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size</label>
              <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="line-numbers"
                  checked={lineNumbers}
                  onChange={(e) => setLineNumbers(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="line-numbers" className="text-sm">Line Numbers</label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="word-wrap"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="word-wrap" className="text-sm">Word Wrap</label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convertMarkdownToHtml} disabled={!markdown.trim()}>
              <Eye className="h-4 w-4 mr-2" />
              Update Preview
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => setMarkdown(getSampleMarkdown())}>
              Load Sample
            </Button>
            <div className="flex-1" />
            <input
              type="file"
              accept=".md"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline" onClick={handleDownloadMarkdown} disabled={!markdown}>
              <FileDown className="h-4 w-4 mr-2" />
              Save MD
            </Button>
            <Button variant="outline" onClick={handleDownloadHtml} disabled={!htmlOutput}>
              <FileDown className="h-4 w-4 mr-2" />
              Save HTML
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!htmlOutput}>
              <Copy className="h-4 w-4 mr-2" />
              Copy HTML
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="shortcuts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
                <TabsTrigger value="syntax">Syntax Guide</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="shortcuts" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><kbd className="bg-background px-2 py-1 rounded">Ctrl/Cmd + B</kbd> - Bold</div>
                    <div><kbd className="bg-background px-2 py-1 rounded">Ctrl/Cmd + I</kbd> - Italic</div>
                    <div><kbd className="bg-background px-2 py-1 rounded">Ctrl/Cmd + K</kbd> - Code</div>
                    <div><kbd className="bg-background px-2 py-1 rounded">Ctrl/Cmd + L</kbd> - Link</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="syntax" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Markdown Syntax</h4>
                  <div className="space-y-2 text-sm">
                    <div><code className="bg-background px-1 rounded"># Header 1</code></div>
                    <div><code className="bg-background px-1 rounded">## Header 2</code></div>
                    <div><code className="bg-background px-1 rounded">**Bold**</code></div>
                    <div><code className="bg-background px-1 rounded">*Italic*</code></div>
                    <div><code className="bg-background px-1 rounded">[Link](url)</code></div>
                    <div><code className="bg-background px-1 rounded">\`Code\`</code></div>
                    <div><code className="bg-background px-1 rounded">- List item</code></div>
                    <div><code className="bg-background px-1 rounded">1. Numbered item</code></div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Tips & Tricks</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use the toolbar buttons for quick formatting</li>
                    <li>• Preview updates automatically when you type</li>
                    <li>• Switch between light and dark themes</li>
                    <li>• Export to both Markdown and HTML formats</li>
                    <li>• Use fullscreen mode for distraction-free editing</li>
                    <li>• Upload existing .md files to edit</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}