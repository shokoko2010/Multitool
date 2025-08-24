'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Lock, Unlock } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function Base32ToText() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('decode')
  const { trackUsage } = useToolAccess('base32-to-text')

  // Base32 alphabet (A-Z, 2-7)
  const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

  const encodeBase32 = (text: string): string => {
    if (!text) return ''
    
    // Track usage
    trackUsage()

    const bytes = new TextEncoder().encode(text)
    let result = ''
    
    let buffer = 0
    let bitsLeft = 0

    for (const byte of bytes) {
      buffer = (buffer << 8) | byte
      bitsLeft += 8

      while (bitsLeft >= 5) {
        const index = (buffer >>> (bitsLeft - 5)) & 0x1F
        result += base32Alphabet[index]
        bitsLeft -= 5
      }
    }

    if (bitsLeft > 0) {
      const index = (buffer << (5 - bitsLeft)) & 0x1F
      result += base32Alphabet[index]
    }

    // Add padding if needed
    const paddingLength = ((8 - Math.ceil(result.length / 8)) * 8 - result.length) % 8;
    if(paddingLength > 0) result += '==='.slice(0, paddingLength);

    return result
  }

  const decodeBase32 = (base32: string): string => {
    if (!base32) return ''
    
    // Track usage
    trackUsage()

    // Remove padding and convert to uppercase
 const clean = base32.replace(/=+$/, '').toUpperCase()
    let result = ''
    let buffer = 0
    let bitsLeft = 0

    for (const char of clean) {
      const index = base32Alphabet.indexOf(char)
      if (index === -1) continue // Skip invalid characters

      buffer = (buffer << 5) | index
      bitsLeft += 5

      while (bitsLeft >= 8) {
        const byte = (buffer >>> (bitsLeft - 8)) & 0xFF
        result += String.fromCharCode(byte)
        bitsLeft -= 8
      }
    }

    return result
  }

  const processText = () => {
    if (!input.trim()) return

    try {
      if (mode === 'encode') {
        setOutput(encodeBase32(input))
      } else {
        setOutput(decodeBase32(input))
      }
    } catch (error) {
      setOutput('Error: Invalid Base32 input')
    }
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadText = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mode === 'encode' ? 'base32-encoded.txt' : 'decoded-text.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  const swapInputOutput = () => {
    setInput(output)
    setOutput(input)
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  return (
    <ToolLayout
      toolId="base32-to-text"
      toolName="Base32 Encoder/Decoder"
      toolDescription="Encode text to Base32 or decode Base32 back to text"
      toolCategory="Text Tools"
      toolIcon={mode === 'encode' ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
      action={{
        label: mode === 'encode' ? "Encode to Base32" : "Decode from Base32",
        onClick: processText,
        disabled: !input.trim()
      }}
    >
      <div className="space-y-6">
        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversion Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="decode" className="flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Decode Base32 → Text
                </TabsTrigger>
                <TabsTrigger value="encode" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Encode Text → Base32
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'encode' ? 'Text Input' : 'Base32 Input'}
              </CardTitle>
              <CardDescription>
                {mode === 'encode' 
                  ? 'Enter the text you want to encode to Base32'
                  : 'Paste your Base32 encoded string to decode'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder={mode === 'encode' 
                    ? "Enter your text here... e.g., Hello World!"
                    : "Paste Base32 string here... e.g., JBSWY3DPEBLW64TMMQ======"
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                  className="font-mono text-sm resize-none"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearAll}
                  disabled={!input && !output}
                >
                  Clear All
                </Button>
                {output && (
                  <Button 
                    variant="outline" 
                    onClick={swapInputOutput}
                  >
                    Swap Input/Output
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'encode' ? 'Base32 Output' : 'Decoded Text'}
              </CardTitle>
              <CardDescription>
                {mode === 'encode' 
                  ? 'Your Base32 encoded result'
                  : 'The decoded text will appear here'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {output ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      <FileText className="w-3 h-3 mr-1" />
                      {output.length} characters
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadText}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed break-all">
                      {output}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to {mode === 'encode' ? 'encode' : 'decode'}</h3>
                  <p className="text-muted-foreground">
                    {mode === 'encode' 
                      ? 'Enter text above and click "Encode to Base32" to convert it'
                      : 'Paste Base32 string above and click "Decode from Base32" to convert it'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">About Base32</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">What is Base32?</h4>
                  <p className="text-muted-foreground">
                    Base32 is a binary-to-text encoding scheme that represents binary data in an ASCII string format using 32 different characters.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Character Set</h4>
                  <p className="text-muted-foreground font-mono">
                    A-Z, 2-7 (26 letters + 6 digits = 32 characters)
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Common Uses</h4>
                  <p className="text-muted-foreground">
                    Used in email encoding, cryptography, applications where case-insensitive encoding is needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Case Insensitive</h4>
                  <p className="text-muted-foreground">
                    Base32 encoding is case-insensitive, making it more robust for transmission.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">No Special Characters</h4>
                  <p className="text-muted-foreground">
                    Uses only alphanumeric characters, avoiding issues with special symbols.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Error Detection</h4>
                  <p className="text-muted-foreground">
                    Includes padding characters (=) for proper length alignment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  )
}