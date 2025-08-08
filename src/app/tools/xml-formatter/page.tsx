'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function XMLFormatter() {
  const [xmlInput, setXmlInput] = useState('')
  const [formattedXml, setFormattedXml] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [indentSize, setIndentSize] = useState(2)

  const formatXml = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlInput, 'text/xml')
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML syntax')
      }

      const formatted = formatXmlString(xmlInput, indentSize)
      setFormattedXml(formatted)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid XML: ' + (err as Error).message)
      setIsValid(false)
      setFormattedXml('')
    }
  }

  const formatXmlString = (xml: string, indent: number): string => {
    const PADDING = ' '.repeat(indent)
    let formatted = ''
    const reg = /(>)(<)(\/*)/g
    xml = xml.replace(reg, '$1\n$2$3')
    let pad = 0

    xml.split('\n').forEach(node => {
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

      padding = ''
      for (let i = 0; i < pad; i++) {
        padding += PADDING
      }

      formatted += padding + node + '\n'
      pad += indent
    })

    return formatted
  }

  const minifyXml = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlInput, 'text/xml')
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML syntax')
      }

      const minified = xmlInput.replace(/\s+/g, ' ').replace(/> </g, '><').trim()
      setFormattedXml(minified)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid XML: ' + (err as Error).message)
      setIsValid(false)
      setFormattedXml('')
    }
  }

  const validateXml = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlInput, 'text/xml')
      
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML syntax')
      }
      
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid XML: ' + (err as Error).message)
      setIsValid(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedXml)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadXml = () => {
    const blob = new Blob([formattedXml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
    <book category="fiction">
        <title lang="en">Great Gatsby</title>
        <author>F. Scott Fitzgerald</author>
        <year>1925</year>
        <price>10.99</price>
    </book>
    <book category="non-fiction">
        <title lang="en">Sapiens</title>
        <author>Yuval Noah Harari</author>
        <year>2011</year>
        <price>15.99</price>
    </book>
</bookstore>`
    setXmlInput(sample)
    setError('')
    setIsValid(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">XML Formatter</h1>
        <p className="text-muted-foreground">
          Format, validate, and beautify XML data with customizable indentation
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input XML
            </CardTitle>
            <CardDescription>
              Paste your XML data or load a sample to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                <Upload className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={validateXml}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate
              </Button>
            </div>
            
            <Textarea
              placeholder="Paste your XML here..."
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
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
                <span className="text-sm">Valid XML</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatting Options</CardTitle>
            <CardDescription>
              Choose how you want to format your XML
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
              Process your XML data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={formatXml} disabled={!xmlInput.trim()}>
                Format XML
              </Button>
              <Button onClick={minifyXml} disabled={!xmlInput.trim()} variant="outline">
                Minify XML
              </Button>
              <Button 
                onClick={copyToClipboard} 
                disabled={!formattedXml}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                onClick={downloadXml} 
                disabled={!formattedXml}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {formattedXml && (
          <Card>
            <CardHeader>
              <CardTitle>Formatted XML</CardTitle>
              <CardDescription>
                Your beautifully formatted XML output
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="mt-4">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                    <code>{formattedXml}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <Textarea
                    value={formattedXml}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
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