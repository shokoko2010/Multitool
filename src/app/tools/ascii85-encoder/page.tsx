'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText } from 'lucide-react'

export default function Ascii85Encoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  // ASCII85 character set
  const ASCII85_CHARS = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu'

  const encodeAscii85 = (text: string): string => {
    if (!text) return ''
    
    // Convert string to bytes
    const bytes = new TextEncoder().encode(text)
    let result = ''
    
    // Process 4 bytes at a time
    for (let i = 0; i < bytes.length; i += 4) {
      let chunk = 0
      let bytesInChunk = Math.min(4, bytes.length - i)
      
      // Build 32-bit number from bytes
      for (let j = 0; j < bytesInChunk; j++) {
        chunk = (chunk << 8) | bytes[i + j]
      }
      
      // Special case: all zeros
      if (chunk === 0 && bytesInChunk === 4) {
        result += 'z'
        continue
      }
      
      // Pad to 4 bytes
      chunk <<= (4 - bytesInChunk) * 8
      
      // Convert to 5 ASCII85 characters
      const encodedChars = []
      for (let j = 4; j >= 0; j--) {
        const divisor = Math.pow(85, j)
        const index = Math.floor(chunk / divisor)
        encodedChars.push(ASCII85_CHARS[index])
        chunk %= divisor
      }
      
      // Remove padding characters
      result += encodedChars.slice(0, bytesInChunk + 1).join('')
    }
    
    return result
  }

  const decodeAscii85 = (ascii85: string): string => {
    if (!ascii85) return ''
    
    // Remove whitespace and handle 'z' shortcut
    ascii85 = ascii85.replace(/\s/g, '')
    ascii85 = ascii85.replace(/z/g, '!!!!!')
    
    // Check for invalid characters
    for (const char of ascii85) {
      if (ASCII85_CHARS.indexOf(char) === -1) {
        throw new Error('Invalid ASCII85 character')
      }
    }
    
    const bytes: number[] = []
    
    // Process 5 characters at a time
    for (let i = 0; i < ascii85.length; i += 5) {
      let chunk = 0
      let charsInChunk = Math.min(5, ascii85.length - i)
      
      // Build 32-bit number from ASCII85 characters
      for (let j = 0; j < charsInChunk; j++) {
        const index = ASCII85_CHARS.indexOf(ascii85[i + j])
        chunk = chunk * 85 + index
      }
      
      // Pad to 5 characters
      chunk *= Math.pow(85, 5 - charsInChunk)
      
      // Convert to 4 bytes
      const decodedBytes = []
      for (let j = 3; j >= 0; j--) {
        const shift = j * 8
        const byte = (chunk >> shift) & 0xff
        if (decodedBytes.length < charsInChunk - 1) {
          decodedBytes.unshift(byte)
        }
      }
      
      bytes.push(...decodedBytes)
    }
    
    // Convert bytes to string
    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  const handleEncode = () => {
    try {
      const encoded = encodeAscii85(input)
      setOutput(encoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeAscii85(input)
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
    a.download = 'ascii85-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            ASCII85 Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Convert text to and from ASCII85 encoding. ASCII85 is used in PDF files and Adobe PostScript.
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
                  placeholder="Enter text to encode to ASCII85..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleEncode} className="w-full">
                Encode to ASCII85
              </Button>
            </TabsContent>
            
            <TabsContent value="decode" className="space-y-4">
              <div>
                <Label htmlFor="decode-input">ASCII85 Text</Label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter ASCII85 text to decode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleDecode} className="w-full">
                Decode from ASCII85
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
            <h3 className="font-semibold mb-2">About ASCII85</h3>
            <p className="text-sm text-muted-foreground">
              ASCII85 (also known as Base85) is a binary-to-text encoding scheme that uses 85 different printable ASCII characters. 
              It's more efficient than Base64, providing about 25% size reduction. It's commonly used in PDF files and Adobe PostScript.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}