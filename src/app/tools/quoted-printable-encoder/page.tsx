'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText } from 'lucide-react'

export default function QuotedPrintableEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encodeQuotedPrintable = (text: string): string => {
    if (!text) return ''
    
    let result = ''
    let lineLength = 0
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const charCode = char.charCodeAt(0)
      
      // Check if character needs encoding
      let needsEncoding = false
      if (charCode > 126 || charCode < 32) {
        needsEncoding = true
      } else if (char === '=' || char === '?' || char === '_' || char === ' ') {
        needsEncoding = true
      }
      
      if (needsEncoding) {
        const encoded = '=' + charCode.toString(16).toUpperCase().padStart(2, '0')
        
        // Check if adding encoded character would exceed line length limit
        if (lineLength + encoded.length > 76) {
          result += '=\r\n'
          lineLength = 0
        }
        
        result += encoded
        lineLength += encoded.length
      } else {
        // Check if adding character would exceed line length limit
        if (lineLength + 1 > 76) {
          result += '=\r\n'
          lineLength = 0
        }
        
        result += char
        lineLength++
      }
    }
    
    return result
  }

  const decodeQuotedPrintable = (quotedPrintable: string): string => {
    if (!quotedPrintable) return ''
    
    let result = ''
    let i = 0
    
    while (i < quotedPrintable.length) {
      const char = quotedPrintable[i]
      
      if (char === '=') {
        // Check for soft line break
        if (i + 1 < quotedPrintable.length && quotedPrintable[i + 1] === '\r') {
          if (i + 2 < quotedPrintable.length && quotedPrintable[i + 2] === '\n') {
            i += 3
            continue
          }
        }
        
        // Check for soft line break (just \n)
        if (i + 1 < quotedPrintable.length && quotedPrintable[i + 1] === '\n') {
          i += 2
          continue
        }
        
        // Decode hexadecimal value
        if (i + 2 < quotedPrintable.length) {
          const hex = quotedPrintable.substring(i + 1, i + 3)
          if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
            const charCode = parseInt(hex, 16)
            result += String.fromCharCode(charCode)
            i += 3
            continue
          }
        }
        
        // Invalid encoding, treat as literal
        result += char
        i++
      } else if (char === '_') {
        // Underscore represents space in quoted-printable
        result += ' '
        i++
      } else {
        result += char
        i++
      }
    }
    
    return result
  }

  const handleEncode = () => {
    try {
      const encoded = encodeQuotedPrintable(input)
      setOutput(encoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeQuotedPrintable(input)
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
    a.download = 'quoted-printable-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Quoted-Printable Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Convert text to and from Quoted-Printable encoding. Used in email messages and MIME encoding.
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
                  placeholder="Enter text to encode to Quoted-Printable..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleEncode} className="w-full">
                Encode to Quoted-Printable
              </Button>
            </TabsContent>
            
            <TabsContent value="decode" className="space-y-4">
              <div>
                <Label htmlFor="decode-input">Quoted-Printable Text</Label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter Quoted-Printable text to decode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleDecode} className="w-full">
                Decode from Quoted-Printable
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
            <h3 className="font-semibold mb-2">About Quoted-Printable</h3>
            <p className="text-sm text-muted-foreground">
              Quoted-Printable is an encoding method used in email messages and MIME encoding. It represents 8-bit data using 
              only ASCII characters, making it safe for transmission through systems that only support 7-bit text. It encodes 
              non-ASCII characters as =XX where XX is the hexadecimal representation of the character.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}