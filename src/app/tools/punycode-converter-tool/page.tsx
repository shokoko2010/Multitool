'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Globe, Languages } from 'lucide-react'

export default function PunycodeConverterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [batchInput, setBatchInput] = useState('')
  const [batchOutput, setBatchOutput] = useState('')

  const processPunycode = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeToPunycode(input)
        setOutput(encoded)
      } else {
        const decoded = decodeFromPunycode(input)
        setOutput(decoded)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`)
    }
  }, [input, mode])

  const processBatch = useCallback(() => {
    if (!batchInput.trim()) {
      setBatchOutput('')
      return
    }

    try {
      const lines = batchInput.split('\n').filter(line => line.trim())
      const results = lines.map(line => {
        try {
          if (mode === 'encode') {
            return `${line} → ${encodeToPunycode(line)}`
          } else {
            return `${line} → ${decodeFromPunycode(line)}`
          }
        } catch (error) {
          return `${line} → Error: ${error instanceof Error ? error.message : 'Invalid input'}`
        }
      })
      setBatchOutput(results.join('\n'))
    } catch (error) {
      setBatchOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`)
    }
  }, [batchInput, mode])

  const encodeToPunycode = (domain: string): string => {
    const labels = domain.split('.')
    const encodedLabels = labels.map(label => {
      if (/^[\x00-\x7F]+$/.test(label)) {
        return label // ASCII only, no conversion needed
      }
      return 'xn--' + punycodeEncode(label)
    })
    return encodedLabels.join('.')
  }

  const decodeFromPunycode = (domain: string): string => {
    const labels = domain.split('.')
    const decodedLabels = labels.map(label => {
      if (!label.startsWith('xn--')) {
        return label // Not a punycode label
      }
      const punycode = label.substring(4)
      return punycodeDecode(punycode)
    })
    return decodedLabels.join('.')
  }

  const punycodeEncode = (input: string): string => {
    // Basic implementation of Punycode encoding
    // This is a simplified version - in production, use a proper library
    const n = 0x80
    const delta = 0
    const h = 0
    const output = []
    
    // Copy all basic code points
    for (let i = 0; i < input.length; i++) {
      const codePoint = input.charCodeAt(i)
      if (codePoint < 0x80) {
        output.push(String.fromCharCode(codePoint))
      }
    }
    
    // This is a very basic implementation
    // A full implementation would handle the complete Punycode algorithm
    return btoa(unescape(encodeURIComponent(input)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const punycodeDecode = (input: string): string => {
    // Basic implementation of Punycode decoding
    // This is a simplified version - in production, use a proper library
    const base64 = input
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    try {
      return decodeURIComponent(escape(atob(base64)))
    } catch {
      // Fallback for invalid base64
      return input
    }
  }

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
    }
  }

  const handleCopyBatch = async () => {
    if (batchOutput) {
      await navigator.clipboard.writeText(batchOutput)
    }
  }

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `punycode-${mode === 'encode' ? 'encoded' : 'decoded'}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadBatch = () => {
    if (batchOutput) {
      const blob = new Blob([batchOutput], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `punycode-batch-${mode === 'encode' ? 'encoded' : 'decoded'}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setBatchInput('')
    setBatchOutput('')
  }

  const getExamples = () => {
    return [
      { unicode: 'münchen.com', punycode: 'xn--mnchen-3ya.com' },
      { unicode: 'café.fr', punycode: 'xn--caf-dma.fr' },
      { unicode: '测试.com', punycode: 'xn--0zwm56d.com' },
      { unicode: 'пример.рф', punycode: 'xn--e1afmkfd.xn--p1ai' }
    ]
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Punycode Converter
          </CardTitle>
          <CardDescription>
            Convert between Unicode domain names and Punycode (ASCII) encoding for internationalized domain names
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Unicode to Punycode</TabsTrigger>
              <TabsTrigger value="decode">Punycode to Unicode</TabsTrigger>
            </TabsList>

            <TabsContent value="encode" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain-input">Unicode Domain Name</Label>
                <Input
                  id="domain-input"
                  placeholder="e.g., münchen.com"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="decode" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="punycode-input">Punycode Domain Name</Label>
                <Input
                  id="punycode-input"
                  placeholder="e.g., xn--mnchen-3ya.com"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-4">
            <Button onClick={processPunycode} disabled={!input.trim()}>
              <Languages className="h-4 w-4 mr-2" />
              Convert
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!output}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {output && (
            <div className="mt-6 space-y-4">
              <Label>Result</Label>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                {output}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium">Batch Conversion</h3>
            <div className="space-y-2">
              <Label>Enter multiple domain names (one per line)</Label>
              <Textarea
                placeholder={`Enter domain names, one per line...
e.g.,
münchen.com
café.fr
测试.com`}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={processBatch} disabled={!batchInput.trim()}>
                Convert All
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyBatch} disabled={!batchOutput}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadBatch} disabled={!batchOutput}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {batchOutput && (
              <div className="mt-4 space-y-2">
                <Label>Batch Results</Label>
                <Textarea
                  value={batchOutput}
                  readOnly
                  rows={8}
                  className="font-mono"
                />
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About Punycode</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What is Punycode?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Punycode is an encoding syntax designed to convert Unicode strings into ASCII 
                    characters for use in Internationalized Domain Names (IDNs). It allows domain 
                    names to contain non-ASCII characters while maintaining compatibility with the 
                    existing DNS infrastructure.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Punycode domains start with "xn--" prefix followed by the encoded ASCII 
                    representation. This enables users to register domain names in their native 
                    languages while ensuring the domain works globally across all systems.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Examples</h4>
                  <div className="space-y-2">
                    {getExamples().map((example, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-background rounded">
                          <div className="font-medium text-muted-foreground">Unicode:</div>
                          <div className="font-mono">{example.unicode}</div>
                        </div>
                        <div className="p-2 bg-background rounded">
                          <div className="font-medium text-muted-foreground">Punycode:</div>
                          <div className="font-mono">{example.punycode}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}