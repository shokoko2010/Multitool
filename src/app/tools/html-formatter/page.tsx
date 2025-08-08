'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function HTMLFormatter() {
  const [htmlInput, setHtmlInput] = useState('')
  const [formattedHtml, setFormattedHtml] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [indentSize, setIndentSize] = useState(2)

  const formatHtml = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlInput, 'text/html')
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid HTML syntax')
      }

      const formatted = formatHtmlString(htmlInput, indentSize)
      setFormattedHtml(formatted)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid HTML: ' + (err as Error).message)
      setIsValid(false)
      setFormattedHtml('')
    }
  }

  const formatHtmlString = (html: string, indent: number): string => {
    const PADDING = ' '.repeat(indent)
    let formatted = ''
    let reg = /(>)(<)(\/*)/g
    html = html.replace(reg, '$1\n$2$3')
    
    let pad = 0
    html.split('\n').forEach(node => {
      let indent = 0
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0
      } else if (node.match(/^<\/\w/) && pad > 0) {
        pad -= 1
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1
      } else {
        indent = 0
      }

      let padding = ''
      for (let i = 0; i < pad; i++) {
        padding += PADDING
      }

      formatted += padding + node + '\n'
      pad += indent
    })

    return formatted
  }

  const minifyHtml = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlInput, 'text/html')
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid HTML syntax')
      }

      const minified = htmlInput
        .replace(/\s+/g, ' ')
        .replace(/> </g, '><')
        .replace(/\s*=\s*/g, '=')
        .replace(/"/g, "'")
        .trim()
      
      setFormattedHtml(minified)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid HTML: ' + (err as Error).message)
      setIsValid(false)
      setFormattedHtml('')
    }
  }

  const validateHtml = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlInput, 'text/html')
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid HTML syntax')
      }
      
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid HTML: ' + (err as Error).message)
      setIsValid(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedHtml)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadHtml = () => {
    const blob = new Blob([formattedHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; }
        .content { margin: 20px 0; }
        .footer { background-color: #333; color: white; padding: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to My Website</h1>
        <p>This is a sample HTML page</p>
    </div>
    
    <div class="content">
        <h2>About This Page</h2>
        <p>This is a demonstration of HTML formatting.</p>
        
        <h3>Features</h3>
        <ul>
            <li>Proper indentation</li>
            <li>Well-structured markup</li>
            <li>Clean and readable code</li>
        </ul>
    </div>
    
    <div class="footer">
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </div>
</body>
</html>`
    setHtmlInput(sample)
    setError('')
    setIsValid(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HTML Formatter</h1>
        <p className="text-muted-foreground">
          Format, validate, and beautify HTML with customizable indentation
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input HTML
            </CardTitle>
            <CardDescription>
              Paste your HTML code or load a sample to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                <Upload className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={validateHtml}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate
              </Button>
            </div>
            
            <Textarea
              placeholder="Paste your HTML here..."
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isValid && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Valid HTML</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatting Options</CardTitle>
            <CardDescription>
              Choose how you want to format your HTML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Indentation:</label>
              <select 
                value={indentSize} 
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Process your HTML code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={formatHtml} disabled={!htmlInput.trim()}>
                Format HTML
              </Button>
              <Button onClick={minifyHtml} disabled={!htmlInput.trim()} variant="outline">
                Minify HTML
              </Button>
              <Button 
                onClick={copyToClipboard} 
                disabled={!formattedHtml}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                onClick={downloadHtml} 
                disabled={!formattedHtml}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {formattedHtml && (
          <Card>
            <CardHeader>
              <CardTitle>Formatted HTML</CardTitle>
              <CardDescription>
                Your beautifully formatted HTML output
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="mt-4">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                    <code>{formattedHtml}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <Textarea
                    value={formattedHtml}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <div 
                    className="border rounded-md p-4 min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: formattedHtml }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}