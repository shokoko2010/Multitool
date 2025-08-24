'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Lock, Unlock, RefreshCw } from 'lucide-react'

export default function ROT13CipherTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const processROT13 = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      // ROT13 is its own inverse, so encoding and decoding are the same operation
      const result = applyROT13(input)
      setOutput(result)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`)
    }
  }, [input])

  const applyROT13 = (text: string): string => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97
      return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start)
    })
  }

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
    }
  }

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'rot13-result.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  const handleSwap = () => {
    setInput(output)
    setOutput(input)
  }

  const getExamples = () => {
    return [
      { input: 'Hello World!', output: 'Uryyb Jbeyq!' },
      { input: 'ROT13 Cipher', output: 'EBG13 Pvcure' },
      { input: 'The quick brown fox jumps over the lazy dog', output: 'Gur dhvpx oebja sbk whzcf bire gur ynml qbt' },
      { input: 'Why did the chicken cross the road?', output: 'Jul qvq gur puvpxra pebff gur ebnq?' }
    ]
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            ROT13 Cipher
          </CardTitle>
          <CardDescription>
            A simple letter substitution cipher that replaces a letter with the 13th letter after it in the alphabet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Text</label>
              <Textarea
                placeholder="Enter text to encode/decode..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Text</label>
              <Textarea
                value={output}
                readOnly
                rows={6}
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={processROT13} disabled={!input.trim()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Apply ROT13
            </Button>
            <Button variant="outline" onClick={handleSwap} disabled={!input || !output}>
              Swap
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
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About ROT13</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="uses">Common Uses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What is ROT13?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    ROT13 (rotate by 13 places) is a simple letter substitution cipher that replaces 
                    a letter with the 13th letter after it in the alphabet. Because there are 26 
                    letters in the English alphabet, applying ROT13 twice returns the original text, 
                    making it its own inverse.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ROT13 provides no cryptographic security and is used primarily for obscuring text 
                    that shouldn't be immediately readable, such as spoilers, punchlines, or 
                    potentially offensive content.
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
                          <div className="font-medium text-muted-foreground">Input:</div>
                          <div className="font-mono">{example.input}</div>
                        </div>
                        <div className="p-2 bg-background rounded">
                          <div className="font-medium text-muted-foreground">Output:</div>
                          <div className="font-mono">{example.output}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="uses" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Common Uses of ROT13</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Hiding spoilers in online forums and discussions</li>
                    <li>• Obscuring punchlines in jokes</li>
                    <li>• Concealing potentially offensive content</li>
                    <li>• Simple obfuscation of email addresses</li>
                    <li>• Easter eggs and hidden messages in software</li>
                    <li>• Educational purposes to demonstrate basic ciphers</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">How ROT13 Works</h4>
            <p className="text-sm text-muted-foreground">
              ROT13 works by replacing each letter in the Latin alphabet with the letter 13 positions 
              after it. For example, 'A' becomes 'N', 'B' becomes 'O', and so on. Since there are 26 
              letters, applying ROT13 twice returns the original text. Non-alphabetic characters 
              remain unchanged. The cipher is case-sensitive, so uppercase and lowercase letters are 
              handled separately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}