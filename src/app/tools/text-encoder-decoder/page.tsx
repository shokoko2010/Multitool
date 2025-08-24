'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RotateCcw, Code } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EncodingMethod {
  name: string
  encode: (text: string) => string
  decode: (text: string) => string
  description: string
}

export default function TextEncoderDecoder() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [activeMethod, setActiveMethod] = useState('base64')
  const [isEncoding, setIsEncoding] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const { toast } = useToast()

  const encodingMethods: Record<string, EncodingMethod> = {
    base64: {
      name: 'Base64',
      encode: (text: string) => btoa(unescape(encodeURIComponent(text))),
      decode: (text: string) => decodeURIComponent(escape(atob(text))),
      description: 'Standard Base64 encoding for binary data'
    },
    base64url: {
      name: 'Base64 URL',
      encode: (text: string) => {
        const encoded = btoa(unescape(encodeURIComponent(text)))
        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
      },
      decode: (text: string) => {
        let base64 = text.replace(/-/g, '+').replace(/_/g, '/')
        while (base64.length % 4) {
          base64 += '='
        }
        return decodeURIComponent(escape(atob(base64)))
      },
      description: 'URL-safe Base64 encoding without padding'
    },
    html: {
      name: 'HTML Entities',
      encode: (text: string) => {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
      },
      decode: (text: string) => {
        const div = document.createElement('div')
        div.innerHTML = text
        return div.textContent || div.innerText || ''
      },
      description: 'HTML entity encoding for web content'
    },
    url: {
      name: 'URL Encoding',
      encode: (text: string) => encodeURIComponent(text),
      decode: (text: string) => decodeURIComponent(text),
      description: 'Percent-encoding for URLs'
    },
    unicode: {
      name: 'Unicode Escape',
      encode: (text: string) => {
        return Array.from(text)
          .map(char => {
            const code = char.charCodeAt(0)
            return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char
          })
          .join('')
      },
      decode: (text: string) => {
        return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => 
          String.fromCharCode(parseInt(hex, 16))
        )
      },
      description: 'Unicode escape sequences'
    },
    hex: {
      name: 'Hexadecimal',
      encode: (text: string) => {
        return Array.from(new TextEncoder().encode(text))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('')
      },
      decode: (text: string) => {
        const bytes = []
        for (let i = 0; i < text.length; i += 2) {
          bytes.push(parseInt(text.substr(i, 2), 16))
        }
        return new TextDecoder().decode(new Uint8Array(bytes))
      },
      description: 'Hexadecimal representation of bytes'
    },
    binary: {
      name: 'Binary',
      encode: (text: string) => {
        return Array.from(new TextEncoder().encode(text))
          .map(byte => byte.toString(2).padStart(8, '0'))
          .join(' ')
      },
      decode: (text: string) => {
        const bytes = text.split(' ').map(bin => parseInt(bin, 2))
        return new TextDecoder().decode(new Uint8Array(bytes))
      },
      description: 'Binary representation of bytes'
    },
    morse: {
      name: 'Morse Code',
      encode: (text: string) => {
        const morseCode: Record<string, string> = {
          'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
          'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
          'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
          'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
          'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
          '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
          '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
          "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
          '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
          '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
        }
        
        return text.toUpperCase().split('').map(char => 
          morseCode[char] || char
        ).join(' ')
      },
      decode: (text: string) => {
        const morseCode: Record<string, string> = {
          '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
          '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
          '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
          '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
          '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
          '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
          '---..': '8', '----.': '9', '.-.-.-': '.', '--..--': ',', '..--..': '?',
          '.----.': "'", '-.-.--': '!', '-..-.': '/', '-.--.': '(', '-.--.-': ')',
          '.-...': '&', '---...': ':', '-.-.-.': ';', '-...-': '=', '.-.-.': '+',
          '-....-': '-', '..--.-': '_', '.-..-.': '"', '...-..-': '$', '.--.-.': '@'
        }
        
        return text.split(' ').map(code => morseCode[code] || code).join('')
      },
      description: 'Morse code encoding'
    },
    rot13: {
      name: 'ROT13',
      encode: (text: string) => {
        return text.replace(/[a-zA-Z]/g, char => {
          const start = char <= 'Z' ? 65 : 97
          return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start)
        })
      },
      decode: (text: string) => {
        return text.replace(/[a-zA-Z]/g, char => {
          const start = char <= 'Z' ? 65 : 97
          return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start)
        })
      },
      description: 'Simple letter substitution cipher'
    },
    reverse: {
      name: 'Reverse Text',
      encode: (text: string) => text.split('').reverse().join(''),
      decode: (text: string) => text.split('').reverse().join(''),
      description: 'Reverse the order of characters'
    }
  }

  const processText = () => {
    if (!inputText.trim()) return

    const method = encodingMethods[activeMethod]
    if (!method) return

    try {
      const result = isEncoding ? method.encode(inputText) : method.decode(inputText)
      setOutputText(result)

      // Add to history
      const operation = isEncoding ? 'Encoded' : 'Decoded'
      const historyEntry = `${operation} with ${method.name}: ${inputText.slice(0, 50)}${inputText.length > 50 ? '...' : ''}`
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)])
    } catch (error) {
      setOutputText(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const swapTexts = () => {
    setInputText(outputText)
    setOutputText(inputText)
    setIsEncoding(!isEncoding)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to clipboard",
    })
  }

  const downloadResult = () => {
    if (!outputText) return

    const content = `Text ${isEncoding ? 'Encoding' : 'Decoding'} Result
==================================

Method: ${encodingMethods[activeMethod].name}
Operation: ${isEncoding ? 'Encode' : 'Decode'}

Input:
${inputText}

Output:
${outputText}

Description: ${encodingMethods[activeMethod].description}

Generated on: ${new Date().toLocaleString()}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-${isEncoding ? 'encoded' : 'decoded'}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
  }

  const loadExample = () => {
    const examples = {
      base64: 'Hello, World!',
      html: '<div>Hello & "World"</div>',
      url: 'https://example.com/search?q=hello world',
      unicode: 'Hello 世界!',
      hex: 'Hello',
      binary: 'Hello',
      morse: 'HELLO WORLD',
      rot13: 'Hello World',
      reverse: 'Hello World'
    }
    
    setInputText(examples[activeMethod as keyof typeof examples] || 'Hello, World!')
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            Text Encoder / Decoder
          </CardTitle>
          <CardDescription>
            Encode and decode text using various encoding methods and ciphers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Method Selection */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(encodingMethods).map(([key, method]) => (
                <Button
                  key={key}
                  variant={activeMethod === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveMethod(key)}
                >
                  {method.name}
                </Button>
              ))}
            </div>

            {/* Current Method Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-600">
                      {encodingMethods[activeMethod].name}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {encodingMethods[activeMethod].description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadExample}>
                    Load Example
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Input/Output Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Input Text:</Label>
                  <Badge variant="outline">
                    {isEncoding ? 'Encoding' : 'Decoding'}
                  </Badge>
                </div>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to encode or decode..."
                  className="min-h-32 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Output Text:</Label>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(outputText)}
                      disabled={!outputText}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={swapTexts}
                      disabled={!outputText}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={outputText}
                  readOnly
                  placeholder="Result will appear here..."
                  className="min-h-32 font-mono text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={processText} disabled={!inputText.trim()}>
                {isEncoding ? 'Encode' : 'Decode'}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
              {outputText && (
                <Button variant="outline" onClick={downloadResult}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {history.map((entry, index) => (
                      <div
                        key={index}
                        className="p-2 bg-muted rounded text-sm cursor-pointer hover:bg-muted/80"
                        onClick={() => copyToClipboard(entry)}
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Encoding Methods Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Encoding Methods Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(encodingMethods).map(([key, method]) => (
                    <div key={key} className="space-y-2">
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="web" className="w-full">
                  <TabsList>
                    <TabsTrigger value="web">Web Development</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="data">Data Processing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="web" className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Web Development</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>HTML Entities:</strong> Safely display user content</li>
                        <li>• <strong>URL Encoding:</strong> Pass parameters in URLs</li>
                        <li>• <strong>Base64:</strong> Encode binary data for text transmission</li>
                        <li>• <strong>Unicode Escape:</strong> Handle special characters</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Security</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>ROT13:</strong> Simple obfuscation</li>
                        <li>• <strong>Base64:</strong> Encode sensitive data</li>
                        <li>• <strong>Custom Encoding:</strong> Data protection</li>
                        <li>• <strong>Hashing:</strong> (Use separate tool for hashing)</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Data Processing</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>Hex/Binary:</strong> Low-level data manipulation</li>
                        <li>• <strong>Base64:</strong> Binary to text conversion</li>
                        <li>• <strong>Morse Code:</strong> Communication protocols</li>
                        <li>• <strong>Unicode:</strong> International text handling</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}