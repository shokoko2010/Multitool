'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText } from 'lucide-react'

export default function UrlSafeBase64Encoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encodeUrlSafeBase64 = (text: string): string => {
    if (!text) return ''
    
    // Convert to regular Base64
    const base64 = btoa(unescape(encodeURIComponent(text)))
    
    // Make it URL-safe
    return base64
      .replace(/\+/g, '-')  // Replace + with -
      .replace(/\//g, '_')  // Replace / with _
      .replace(/=/g, '')    // Remove padding
  }

  const decodeUrlSafeBase64 = (urlSafeBase64: string): string => {
    if (!urlSafeBase64) return ''
    
    try {
      // Add padding if needed
      let base64 = urlSafeBase64
      while (base64.length % 4) {
        base64 += '='
      }
      
      // Convert from URL-safe to regular Base64
      base64 = base64
        .replace(/-/g, '+')  // Replace - with +
        .replace(/_/g, '/')  // Replace _ with /
      
      // Decode from Base64
      return decodeURIComponent(escape(atob(base64)))
    } catch (error) {
      throw new Error('Invalid URL-safe Base64 string')
    }
  }

  const handleEncode = () => {
    try {
      const encoded = encodeUrlSafeBase64(input)
      setOutput(encoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeUrlSafeBase64(input)
      setOutput(decoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'url-safe-base64-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            URL-Safe Base64 Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Convert text to and from URL-safe Base64 encoding. Perfect for URLs, JWT tokens, and web applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="encode" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode</TabsTrigger>
              <TabsTrigger value="decode">Decode</TabsTrigger>
            </TabsList>
            
            <TabsContent value="encode" className="space-y-4">
              <div>
                <Label htmlFor="encode-input">Input Text</Label>
                <Textarea
                  id="encode-input"
                  placeholder="Enter text to encode to URL-safe Base64..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleEncode} className="w-full">
                Encode to URL-Safe Base64
              </Button>
            </TabsContent>
            
            <TabsContent value="decode" className="space-y-4">
              <div>
                <Label htmlFor="decode-input">URL-Safe Base64 Text</Label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter URL-safe Base64 text to decode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleDecode} className="w-full">
                Decode from URL-Safe Base64
              </Button>
            </TabsContent>
          </Tabs>
          
          {output && (
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="output">Result</Label>
                <Textarea
                  id="output"
                  value={output}
                  readOnly
                  className="min-h-32 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadFile} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">About URL-Safe Base64</h3>
            <p className="text-sm text-muted-foreground">
              URL-safe Base64 is a variant of Base64 encoding that replaces '+' with '-', '/' with '_', and removes padding '='. 
              This makes it safe to use in URLs and other contexts where special characters might cause issues. It's commonly used 
              in JWT tokens, URL parameters, and web APIs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}