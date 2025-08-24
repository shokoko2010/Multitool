'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText } from 'lucide-react'

export default function Base62Encoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  // Base62 character set (0-9, A-Z, a-z)
  const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

  const encodeBase62 = (text: string): string => {
    if (!text) return ''
    
    // Convert string to bytes
    const bytes = new TextEncoder().encode(text)
    
    // Convert bytes to big integer
    let num = BigInt(0)
    for (const byte of bytes) {
      num = (num << BigInt(8)) | BigInt(byte)
    }
    
    // Convert to Base62
    let result = ''
    while (num > BigInt(0)) {
      const remainder = num % BigInt(62)
      result = BASE62_CHARS[Number(remainder)] + result
      num = num / BigInt(62)
    }
    
    // Add leading '0's for each leading zero byte
    for (const byte of bytes) {
      if (byte === 0) {
        result = '0' + result
      } else {
        break
      }
    }
    
    return result || '0'
  }

  const decodeBase62 = (base62: string): string => {
    if (!base62) return ''
    
    // Convert Base62 to big integer
    let num = BigInt(0)
    for (const char of base62) {
      const index = BASE62_CHARS.indexOf(char)
      if (index === -1) {
        throw new Error('Invalid Base62 character')
      }
      num = num * BigInt(62) + BigInt(index)
    }
    
    // Convert big integer to bytes
    const bytes: number[] = []
    while (num > BigInt(0)) {
      bytes.unshift(Number(num & BigInt(0xff)))
      num = num >> BigInt(8)
    }
    
    // Add leading zeros for each leading '0'
    let leadingZeros = 0
    for (const char of base62) {
      if (char === '0') {
        leadingZeros++
      } else {
        break
      }
    }
    
    for (let i = 0; i < leadingZeros; i++) {
      bytes.unshift(0)
    }
    
    // Convert bytes to string
    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  const handleEncode = () => {
    try {
      const encoded = encodeBase62(input)
      setOutput(encoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeBase62(input)
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
    a.download = 'base62-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Base62 Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Convert text to and from Base62 encoding. Base62 uses alphanumeric characters (0-9, A-Z, a-z) and is URL-safe.
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
                  placeholder="Enter text to encode to Base62..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleEncode} className="w-full">
                Encode to Base62
              </Button>
            </TabsContent>
            
            <TabsContent value="decode" className="space-y-4">
              <div>
                <Label htmlFor="decode-input">Base62 Text</Label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter Base62 text to decode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleDecode} className="w-full">
                Decode from Base62
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
            <h3 className="font-semibold mb-2">About Base62</h3>
            <p className="text-sm text-muted-foreground">
              Base62 is a binary-to-text encoding scheme that uses 62 different characters (0-9, A-Z, a-z). 
              It's URL-safe and doesn't require special characters, making it ideal for short URLs, identifiers, and other web applications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}