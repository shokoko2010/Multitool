'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Binary, RotateCcw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function BinaryToText() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const { trackUsage } = useToolAccess('binary-to-text')

  const binaryToText = async () => {
    if (!input.trim()) {
      setError('Please enter binary data')
      return
    }

    try {
      // Track usage before converting
      await trackUsage()

      // Remove any non-binary characters and split into 8-bit chunks
      const cleanInput = input.replace(/[^01]/g, '')
      const bytes = cleanInput.match(/.{1,8}/g) || []
      
      if (bytes.length === 0) {
        throw new Error('No valid binary data found')
      }

      // Handle incomplete last byte
      const lastByte = bytes[bytes.length - 1]
      if (lastByte.length < 8) {
        bytes[bytes.length - 1] = lastByte.padEnd(8, '0')
      }

      const text = bytes.map(byte => {
        const decimal = parseInt(byte, 2)
        if (isNaN(decimal)) {
          throw new Error(`Invalid binary: ${byte}`)
        }
        return String.fromCharCode(decimal)
      }).join('')

      setOutput(text)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setOutput('')
    }
  }

  const textToBinary = async () => {
    if (!input.trim()) {
      setError('Please enter text')
      return
    }

    try {
      // Track usage before converting
      await trackUsage()

      const binary = input.split('').map(char => {
        const code = char.charCodeAt(0)
        return code.toString(2).padStart(8, '0')
      }).join(' ')

      setOutput(binary)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setOutput('')
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
      a.download = 'binary-conversion-result.txt'
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
    setInput('01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100')
    setError(null)
  }

  return (
    <ToolLayout
      toolId="binary-to-text"
      toolName="Binary to Text Converter"
      toolDescription="Convert between binary and text"
      toolCategory="Text Tools"
      toolIcon={<Binary className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              Enter binary (8-bit chunks, space separated) or text to convert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Data</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter binary (e.g., 01001000 01100101) or text..."
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
              Conversion result will appear here
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
                placeholder="Conversion result will appear here..."
                rows={8}
                className="font-mono text-sm bg-muted/50"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={binaryToText}
                disabled={!input.trim()}
                className="flex-1"
              >
                Binary to Text
              </Button>
              <Button 
                variant="outline"
                onClick={textToBinary}
                disabled={!input.trim()}
              >
                Text to Binary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">About Binary Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 What is Binary?</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Base-2 number system using only 0s and 1s</li>
                <li>• Each digit is called a "bit"</li>
                <li>• 8 bits = 1 byte (can represent 256 values)</li>
                <li>• Fundamental to computer systems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Usage Tips</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Separate bytes with spaces for readability</li>
                <li>• Each character = 8 bits (1 byte)</li>
                <li>• Convert both ways: Binary ↔ Text</li>
                <li>• Invalid binary will be automatically cleaned</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}