'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Eye, 
  Download, 
  Upload, 
  Copy, 
  Save,
  Bold,
  Italic,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Trash2,
  Settings
} from 'lucide-react'

interface MarkdownDocument {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export default function MarkdownEditor() {
  const [documents, setDocuments] = useState<MarkdownDocument[]>([])
  const [currentDocument, setCurrentDocument] = useState<MarkdownDocument | null>(null)
  const [markdownContent, setMarkdownContent] = useState('')
  const [documentTitle, setDocumentTitle] = useState('')
  const [previewMode, setPreviewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('editor')
  const [copied, setCopied] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load sample document
    const sampleDoc: MarkdownDocument = {
      id: 'sample',
      title: 'Sample Document',
      content: `# Welcome to Markdown Editor

This is a **sample** markdown document to get you started.

## Features

- **Real-time preview**
- *Syntax highlighting*
- \`Code blocks\`
- [Links](https://example.com)
- > Blockquotes

### Code Example

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

Happy writing! 🎉`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setDocuments([sampleDoc])
    setCurrentDocument(sampleDoc)
    setMarkdownContent(sampleDoc.content)
    setDocumentTitle(sampleDoc.title)
  }, [])

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = markdownContent.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    let newText = ''
    let cursorPosition = 0

    switch (syntax) {
      case 'bold':
        newText = `**${textToInsert}**`
        cursorPosition = start + 2 + textToInsert.length
        break
      case 'italic':
        newText = `*${textToInsert}*`
        cursorPosition = start + 1 + textToInsert.length
        break
      case 'heading1':
        newText = `# ${textToInsert}`
        cursorPosition = start + 2 + textToInsert.length
        break
      case 'heading2':
        newText = `## ${textToInsert}`
        cursorPosition = start + 3 + textToInsert.length
        break
      case 'heading3':
        newText = `### ${textToInsert}`
        cursorPosition = start + 4 + textToInsert.length
        break
      case 'link':
        newText = `[${textToInsert}](url)`
        cursorPosition = start + 1 + textToInsert.length
        break
      case 'image':
        newText = `![${textToInsert}](url)`
        cursorPosition = start + 2 + textToInsert.length
        break
      case 'code':
        newText = `\`${textToInsert}\``
        cursorPosition = start + 1 + textToInsert.length
        break
      case 'blockquote':
        newText = `> ${textToInsert}`
        cursorPosition = start + 2 + textToInsert.length
        break
      case 'ul':
        newText = `- ${textToInsert}`
        cursorPosition = start + 2 + textToInsert.length
        break
      case 'ol':
        newText = `1. ${textToInsert}`
        cursorPosition = start + 3 + textToInsert.length
        break
      case 'codeblock':
        newText = `\`\`\`\n${textToInsert}\n\`\`\``
        cursorPosition = start + 4 + textToInsert.length
        break
      default:
        newText = textToInsert
        cursorPosition = start + textToInsert.length
    }

    const newContent = 
      markdownContent.substring(0, start) + 
      newText + 
      markdownContent.substring(end)

    setMarkdownContent(newContent)
    
    // Set cursor position after a short delay
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
      }
    }, 0)
  }

  const saveDocument = () => {
    if (!documentTitle.trim()) {
      setError('Please enter a document title')
      return
    }

    const updatedDocument: MarkdownDocument = {
      id: currentDocument?.id || Date.now().toString(),
      title: documentTitle,
      content: markdownContent,
      createdAt: currentDocument?.createdAt || new Date(),
      updatedAt: new Date()
    }

    if (currentDocument) {
      setDocuments(prev => prev.map(doc => 
        doc.id === currentDocument.id ? updatedDocument : doc
      ))
      setCurrentDocument(updatedDocument)
    } else {
      setDocuments(prev => [updatedDocument, ...prev])
      setCurrentDocument(updatedDocument)
    }

    setError(null)
  }

  const newDocument = () => {
    setCurrentDocument(null)
    setMarkdownContent('')
    setDocumentTitle('')
    setError(null)
  }

  const loadDocument = (doc: MarkdownDocument) => {
    setCurrentDocument(doc)
    setMarkdownContent(doc.content)
    setDocumentTitle(doc.title)
    setError(null)
  }

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    if (currentDocument?.id === id) {
      newDocument()
    }
  }

  const downloadDocument = () => {
    if (!markdownContent.trim()) return

    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${documentTitle || 'document'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const uploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      setError('Please select a markdown file (.md or .markdown)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const title = file.name.replace(/\.(md|markdown)$/, '')
      
      setMarkdownContent(content)
      setDocumentTitle(title)
      setError(null)
    }
    reader.readAsText(file)
  }

  const renderMarkdown = (markdown: string): string => {
    // Simple markdown to HTML conversion for demo purposes
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      .replace(/^(.*)$/gim, '<p>$1</p>')
      .replace(/<p><\/p>/gim, '')
      .replace(/<p><h1>/gim, '<h1>')
      .replace(/<\/h1><\/p>/gim, '</h1>')
      .replace(/<p><h2>/gim, '<h2>')
      .replace(/<\/h2><\/p>/gim, '</h2>')
      .replace(/<p><h3>/gim, '<h3>')
      .replace(/<\/h3><\/p>/gim, '</h3>')
      .replace(/<p><code>/gim, '<code>')
      .replace(/<\/code><\/p>/gim, '</code>')
  }

  const wordCount = markdownContent.trim() ? markdownContent.trim().split(/\s+/).length : 0
  const characterCount = markdownContent.length

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Markdown Editor
          </CardTitle>
          <CardDescription>
            Create and edit markdown documents with live preview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={newDocument} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                New
              </Button>
              <Button onClick={saveDocument} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={downloadDocument} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                {copied ? 'Copied!' : <Copy className="h-4 w-4 mr-2" />}
                Copy
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".md,.markdown"
                onChange={uploadDocument}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>

              <div className="space-y-2">
                <Label>Formatting</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('bold')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('italic')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('heading1')}>
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('heading2')}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('heading3')}>
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('link')}>
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('image')}>
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('code')}>
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('blockquote')}>
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('ul')}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('ol')}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => insertMarkdown('codeblock')}>
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>View Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={previewMode === 'edit' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('edit')}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant={previewMode === 'split' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('split')}
                    className="flex-1"
                  >
                    Split
                  </Button>
                  <Button
                    variant={previewMode === 'preview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('preview')}
                    className="flex-1"
                  >
                    Preview
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Statistics</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Words: {wordCount}</div>
                  <div>Characters: {characterCount}</div>
                  <div>Documents: {documents.length}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div className="flex gap-2">
                {previewMode === 'split' && (
                  <div className="flex-1">
                    <Label>Markdown</Label>
                    <Textarea
                      ref={textareaRef}
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      placeholder="Write your markdown here..."
                      className="min-h-[400px] font-mono text-sm resize-none"
                    />
                  </div>
                )}
                {(previewMode === 'split' || previewMode === 'preview') && (
                  <div className={previewMode === 'split' ? 'flex-1' : 'w-full'}>
                    <Label>Preview</Label>
                    <div 
                      className="border rounded-md p-4 min-h-[400px] prose prose-sm max-w-none overflow-y-auto"
                      dangerouslySetInnerHTML={{ 
                        __html: renderMarkdown(markdownContent) 
                      }}
                    />
                  </div>
                )}
                {previewMode === 'edit' && (
                  <div className="w-full">
                    <Label>Markdown</Label>
                    <Textarea
                      ref={textareaRef}
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      placeholder="Write your markdown here..."
                      className="min-h-[500px] font-mono text-sm resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Your Documents</h3>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents yet</p>
                    <p className="text-sm text-muted-foreground">Create your first markdown document</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {documents.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{doc.title}</div>
                              <div className="text-xs text-muted-foreground">
                                Updated {doc.updatedAt.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadDocument(doc)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Markdown Cheat Sheet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Basic Formatting</div>
                      <div className="space-y-1 text-sm font-mono">
                        <div>**Bold**</div>
                        <div>*Italic*</div>
                        <div>`Code`</div>
                        <div>~~Strikethrough~~</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Headings</div>
                      <div className="space-y-1 text-sm font-mono">
                        <div># Heading 1</div>
                        <div>## Heading 2</div>
                        <div>### Heading 3</div>
                        <div>#### Heading 4</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Lists</div>
                      <div className="space-y-1 text-sm font-mono">
                        <div>- Item 1</div>
                        <div>- Item 2</div>
                        <div>1. Numbered</div>
                        <div>2. List</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Links & Images</div>
                      <div className="space-y-1 text-sm font-mono">
                        <div>[Link](url)</div>
                        <div>![Alt](url)</div>
                        <div>[Link][ref]</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Code Blocks</div>
                      <div className="space-y-1 text-sm font-mono">
                        <div>```</div>
                        <div>code block</div>
                        <div>```</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Other</div>
                      <div className="space-y-1 text-sm font-mono">
                        <div>{'> Blockquote'}</div>
                        <div>--- Horizontal Rule</div>
                        <div>| Table | Header |</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}