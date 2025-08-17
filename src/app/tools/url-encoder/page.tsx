'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Link, RotateCcw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function UrlEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  
  const { trackUsage } = useToolAccess('url-encoder')

  const encodeUrl = async () => {
    if (!input.trim()) {
      setError('Please enter URL or text to encode')
      return
    }

    try {
      // Track usage before encoding
      await trackUsage()

      const encoded = encodeURIComponent(input)
      setOutput(encoded)
      setError(null)
    } catch (err) {
      setError('Failed to encode URL. Please check your input.')
      setOutput('')
    }
  }

  const decodeUrl = async () => {
    if (!input.trim()) {
      setError('Please enter URL to decode')
      return
    }

    try {
      // Track usage before decoding
      await trackUsage()

      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      setError(null)
    } catch (err) {
      setError('Invalid URL encoding. Please check your input.')
      setOutput('')
    }
  }

  const processInput = async () => {
    if (mode === 'encode') {
      await encodeUrl()
    } else {
      await decodeUrl()
    }
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadResult = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `url-${mode}-result.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const loadSample = () => {
    if (mode === 'encode') {
      setInput('https://example.com/search?q=hello world&category=web development')
    } else {
      setInput('https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26category%3Dweb%20development')
    }
    setError(null)
  }

  const switchMode = (newMode: 'encode' | 'decode') => {
    setMode(newMode)
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <ToolLayout
      toolId="url-encoder"
      toolName="URL Encoder/Decoder"
      toolDescription="Encode and decode URLs for safe web transmission"
      toolCategory="Developer Tools"
      toolIcon={<Link className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              {mode === 'encode' 
                ? 'Enter URL or text to encode' 
                : 'Enter encoded URL to decode'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Data</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' 
                  ? 'Enter URL or text to encode...' 
                  : 'Enter encoded URL to decode...'
                }
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button 
                variant={mode === 'encode' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => switchMode('encode')}
              >
                Encode Mode
              </Button>
              <Button 
                variant={mode === 'decode' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => switchMode('decode')}
              >
                Decode Mode
              </Button>
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              {mode === 'encode' 
                ? 'URL encoded result' 
                : 'Decoded URL result'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Result</label>
                {output && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder={mode === 'encode' 
                  ? 'Encoded URL will appear here...' 
                  : 'Decoded URL will appear here...'
                }
                rows={8}
                className="font-mono text-sm bg-muted/50"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={processInput}
                disabled={!input.trim()}
                className="flex-1"
              >
                {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">About URL Encoding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 What is URL Encoding?</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Converts unsafe characters to % followed by hex digits</li>
                <li>• Ensures URLs are valid and transportable</li>
                <li>• Spaces become %20, special characters get encoded</li>
                <li>• Also known as percent-encoding</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Common Uses</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Query parameters in URLs</li>
                <li>• Form data submission</li>
                <li>• API requests with special characters</li>
                <li>• Safe data transmission in web applications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}