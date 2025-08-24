'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Link, Lock, Unlock } from 'lucide-react'

export default function URLEncoderDecoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encodeURL = () => {
    if (!input.trim()) return
    try {
      setOutput(encodeURIComponent(input))
    } catch (error) {
      setOutput('Error: Invalid input for URL encoding')
    }
  }

  const decodeURL = () => {
    if (!input.trim()) return
    try {
      setOutput(decodeURIComponent(input))
    } catch (error) {
      setOutput('Error: Invalid URL encoded string')
    }
  }

  const encodePartial = () => {
    if (!input.trim()) return
    try {
      // Only encode spaces and special characters, not the entire URL
      setOutput(input.replace(/[^a-zA-Z0-9-._~]/g, encodeURIComponent))
    } catch (error) {
      setOutput('Error: Invalid input for partial encoding')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const downloadAsFile = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'url-encoded-decoded.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const swapInputOutput = () => {
    setInput(output)
    setOutput(input)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">URL Encoder/Decoder</h1>
          <p className="text-muted-foreground">
            Encode and decode URLs for web development and API calls
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Input
              </CardTitle>
              <CardDescription>
                Enter the URL or text you want to encode or decode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter URL or text to encode/decode..."
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Output
              </CardTitle>
              <CardDescription>
                The encoded or decoded result will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Output will appear here..."
                className="min-h-[200px] resize-none"
                readOnly
              />
              
              {output && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadAsFile} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Encoding Options</CardTitle>
            <CardDescription>
              Choose how you want to process your URL or text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="encode" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="encode" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Encode
                </TabsTrigger>
                <TabsTrigger value="decode" className="flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Decode
                </TabsTrigger>
                <TabsTrigger value="partial" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Partial Encode
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="encode" className="mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Full URL Encoding:</strong> Encodes all special characters in the entire string. 
                    Use this when you need to encode a complete URL or URI component.
                  </p>
                  <Button onClick={encodeURL} className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Encode URL
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="decode" className="mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>URL Decoding:</strong> Decodes percent-encoded characters back to their original form. 
                    Use this to decode URLs or URI components that were previously encoded.
                  </p>
                  <Button onClick={decodeURL} className="w-full">
                    <Unlock className="w-4 h-4 mr-2" />
                    Decode URL
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="partial" className="mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Partial Encoding:</strong> Only encodes spaces and special characters, preserving the URL structure. 
                    Use this when you want to encode query parameters or specific parts of a URL.
                  </p>
                  <Button onClick={encodePartial} className="w-full">
                    <Link className="w-4 h-4 mr-2" />
                    Partial Encode
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={swapInputOutput} variant="outline" className="flex-1">
                Swap Input/Output
              </Button>
              <Button onClick={clearAll} variant="outline" className="flex-1">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>URL Encoding Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Query Parameters</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Original:</strong> https://example.com/search?q=hello world&category=web development</p>
                  <p><strong>Encoded:</strong> https://example.com/search?q=hello%20world&category=web%20development</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Special Characters</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Original:</strong> Hello! How are you? @#$%^&*()</p>
                  <p><strong>Encoded:</strong> Hello%21%20How%20are%20you%3F%20%40%23%24%25%5E%26%2A%28%29</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Unicode Characters</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Original:</strong> café, naïve, résumé</p>
                  <p><strong>Encoded:</strong> caf%C3%A9%2C%20na%C3%AFve%2C%20r%C3%A9sum%C3%A9</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}