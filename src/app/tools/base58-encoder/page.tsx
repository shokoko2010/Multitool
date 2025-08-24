'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText } from 'lucide-react'

export default function Base58Encoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  // Base58 character set
  const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

  const encodeBase58 = (text: string): string => {
    if (!text) return ''
    
    // Convert string to bytes
    const bytes = new TextEncoder().encode(text)
    
    // Convert bytes to big integer
    let num = BigInt(0)
    for (const byte of bytes) {
      num = (num << BigInt(8)) | BigInt(byte)
    }
    
    // Convert to Base58
    let result = ''
    while (num > BigInt(0)) {
      const remainder = num % BigInt(58)
      result = BASE58_CHARS[Number(remainder)] + result
      num = num / BigInt(58)
    }
    
    // Add leading '1's for each leading zero byte
    for (const byte of bytes) {
      if (byte === 0) {
        result = '1' + result
      } else {
        break
      }
    }
    
    return result || '1'
  }

  const decodeBase58 = (base58: string): string => {
    if (!base58) return ''
    
    // Convert Base58 to big integer
    let num = BigInt(0)
    for (const char of base58) {
      const index = BASE58_CHARS.indexOf(char)
      if (index === -1) {
        throw new Error('Invalid Base58 character')
      }
      num = num * BigInt(58) + BigInt(index)
    }
    
    // Convert big integer to bytes
    const bytes: number[] = []
    while (num > BigInt(0)) {
      bytes.unshift(Number(num & BigInt(0xff)))
      num = num >> BigInt(8)
    }
    
    // Add leading zeros for each leading '1'
    let leadingZeros = 0
    for (const char of base58) {
      if (char === '1') {
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
      const encoded = encodeBase58(input)
      setOutput(encoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeBase58(input)
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
    a.download = 'base58-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Base58 Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Convert text to and from Base58 encoding. Base58 is commonly used in Bitcoin and other cryptocurrencies.
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
                  placeholder="Enter text to encode to Base58..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleEncode} className="w-full">
                Encode to Base58
              </Button>
            </TabsContent>
            
            <TabsContent value="decode" className="space-y-4">
              <div>
                <Label htmlFor="decode-input">Base58 Text</Label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter Base58 text to decode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleDecode} className="w-full">
                Decode from Base58
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
            <h3 className="font-semibold mb-2">About Base58</h3>
            <p className="text-sm text-muted-foreground">
              Base58 is a binary-to-text encoding scheme that uses 58 different characters (A-Z, a-z, 0-9, excluding 0, O, I, l). 
              It's designed to avoid visual ambiguity and is commonly used in Bitcoin addresses and other cryptocurrency applications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}