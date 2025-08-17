'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, RotateCcw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function Base64Encoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  
  const { trackUsage } = useToolAccess('base64-encoder')

  const encodeBase64 = async () => {
    if (!input.trim()) {
      setError('Please enter text to encode')
      return
    }

    try {
      // Track usage before encoding
      await trackUsage()

      const encoded = btoa(input)
      setOutput(encoded)
      setError(null)
    } catch (err) {
      setError('Failed to encode text. Make sure it contains valid UTF-8 characters.')
      setOutput('')
    }
  }

  const decodeBase64 = async () => {
    if (!input.trim()) {
      setError('Please enter Base64 to decode')
      return
    }

    try {
      // Track usage before decoding
      await trackUsage()

      const decoded = atob(input)
      setOutput(decoded)
      setError(null)
    } catch (err) {
      setError('Invalid Base64 input. Please check your Base64 string.')
      setOutput('')
    }
  }

  const processInput = async () => {
    if (mode === 'encode') {
      await encodeBase64()
    } else {
      await decodeBase64()
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
      a.download = `base64-${mode}-result.txt`
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
      setInput('Hello, World!')
    } else {
      setInput('SGVsbG8sIFdvcmxkIQ==')
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
      toolId="base64-encoder"
      toolName="Base64 Encoder/Decoder"
      toolDescription="Encode and decode Base64 strings"
      toolCategory="Developer Tools"
      toolIcon={<FileText className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              {mode === 'encode' 
                ? 'Enter text to encode to Base64' 
                : 'Enter Base64 to decode to text'
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
                  ? 'Enter text to encode...' 
                  : 'Enter Base64 string to decode...'
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
                ? 'Base64 encoded result' 
                : 'Decoded text result'
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
                  ? 'Base64 result will appear here...' 
                  : 'Decoded text will appear here...'
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
                {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">About Base64</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 What is Base64?</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Binary-to-text encoding scheme</li>
                <li>• Represents binary data in ASCII string format</li>
                <li>• Uses 64 characters (A-Z, a-z, 0-9, +, /)</li>
                <li>• Commonly used for data transmission</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Common Uses</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Email attachments (MIME)</li>
                <li>• Data URLs in web development</li>
                <li>• Storing complex data in XML/JSON</li>
                <li>• Encoding binary data for text-based protocols</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}