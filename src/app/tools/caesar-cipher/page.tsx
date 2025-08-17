'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Lock, Unlock, RotateCcw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function CaesarCipher() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [shift, setShift] = useState(3)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [preserveCase, setPreserveCase] = useState(true)
  const [ignoreNonAlpha, setIgnoreNonAlpha] = useState(true)
  const { trackUsage } = useToolAccess('caesar-cipher')

  const caesarCipher = (text: string, shiftAmount: number, encode: boolean): string => {
    if (!text) return ''
    
    // Track usage
    trackUsage()

    const actualShift = encode ? shiftAmount : -shiftAmount
    let result = ''

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      
      if (ignoreNonAlpha && !/[a-zA-Z]/.test(char)) {
        result += char
        continue
      }

      if (/[a-z]/.test(char)) {
        const shifted = String.fromCharCode(((char.charCodeAt(0) - 97 + actualShift + 26) % 26) + 97)
        result += preserveCase ? shifted : shifted.toLowerCase()
      } else if (/[A-Z]/.test(char)) {
        const shifted = String.fromCharCode(((char.charCodeAt(0) - 65 + actualShift + 26) % 26) + 65)
        result += preserveCase ? shifted : shifted.toLowerCase()
      } else {
        result += char
      }
    }

    return result
  }

  const processText = () => {
    if (!input.trim()) return

    try {
      const result = caesarCipher(input, shift, mode === 'encode')
      setOutput(result)
    } catch (error) {
      setOutput('Error: Failed to process text')
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
      a.download = mode === 'encode' ? 'caesar-encoded.txt' : 'caesar-decoded.txt'
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

  const tryAllShifts = () => {
    if (!input.trim()) return []

    const results = []
    for (let i = 1; i <= 25; i++) {
      const decoded = caesarCipher(input, i, false)
      results.push({ shift: i, text: decoded })
    }
    return results
  }

  const bruteForceResults = tryAllShifts()

  return (
    <ToolLayout
      toolId="caesar-cipher"
      toolName="Caesar Cipher"
      toolDescription="Encode or decode text using the Caesar cipher substitution algorithm"
      toolCategory="Text Tools"
      toolIcon={mode === 'encode' ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
      action={{
        label: mode === 'encode' ? "Encode Text" : "Decode Text",
        onClick: processText,
        disabled: !input.trim()
      }}
    >
      <div className="space-y-6">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cipher Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encode">Encode (Shift Forward)</SelectItem>
                    <SelectItem value="decode">Decode (Shift Backward)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Shift Amount</Label>
                <Input
                  id="shift"
                  type="number"
                  min="1"
                  max="25"
                  value={shift}
                  onChange={(e) => setShift(Math.max(1, Math.min(25, parseInt(e.target.value) || 3)))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preserve-case">Preserve Case</Label>
                <Select value={preserveCase.toString()} onValueChange={(value) => setPreserveCase(value === 'true')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ignore-non-alpha">Ignore Non-Alphabetic</Label>
                <Select value={ignoreNonAlpha.toString()} onValueChange={(value) => setIgnoreNonAlpha(value === 'true')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="cipher" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cipher">Cipher Tool</TabsTrigger>
            <TabsTrigger value="brute-force">Brute Force Decoder</TabsTrigger>
          </TabsList>

          <TabsContent value="cipher" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {mode === 'encode' ? 'Original Text' : 'Encoded Text'}
                  </CardTitle>
                  <CardDescription>
                    {mode === 'encode' 
                      ? 'Enter the text you want to encode'
                      : 'Paste the Caesar cipher text to decode'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder={mode === 'encode' 
                        ? "Enter your text here... e.g., Hello World!"
                        : "Paste encoded text here... e.g., Khoor Zruog!"
                      }
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={8}
                      className="resize-none"
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
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Swap
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {mode === 'encode' ? 'Encoded Text' : 'Decoded Text'}
                  </CardTitle>
                  <CardDescription>
                    {mode === 'encode' 
                      ? `Your text encoded with shift ${shift}`
                      : `Your text decoded with shift ${shift}`
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
                        <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
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
                          ? 'Enter text above and click "Encode Text" to apply Caesar cipher'
                          : 'Paste encoded text above and click "Decode Text" to reveal the original message'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="brute-force" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brute Force Decoder</CardTitle>
                <CardDescription>
                  Try all possible shift values (1-25) to decode Caesar cipher text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brute-input">Encoded Text</Label>
                    <Textarea
                      id="brute-input"
                      placeholder="Paste encoded text here... e.g., Khoor Zruog!"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {input && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Trying all 25 possible shifts
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {bruteForceResults.map((result, index) => (
                          <div key={index} className="p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm mb-1">
                                  Shift {result.shift}:
                                </div>
                                <div className="text-sm text-muted-foreground font-mono">
                                  {result.text}
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setOutput(result.text)
                                  setMode('decode')
                                  setShift(result.shift)
                                }}
                              >
                                Use This
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">About Caesar Cipher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">What is Caesar Cipher?</h4>
                  <p className="text-muted-foreground">
                    A substitution cipher where each letter is shifted by a fixed number of positions in the alphabet. Named after Julius Caesar who used it for military communications.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">How It Works</h4>
                  <p className="text-muted-foreground">
                    Each letter is replaced by a letter some fixed number of positions down the alphabet. For example, with a shift of 3, A becomes D, B becomes E, etc.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Security</h4>
                  <p className="text-muted-foreground">
                    Very weak by modern standards but useful for educational purposes and simple obfuscation. Easily broken by brute force or frequency analysis.
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
                  <h4 className="font-medium mb-1">Custom Shift Values</h4>
                  <p className="text-muted-foreground">
                    Choose any shift value from 1 to 25 for encoding and decoding.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Case Preservation</h4>
                  <p className="text-muted-foreground">
                    Option to preserve or ignore the original case of letters.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Brute Force Decoder</h4>
                  <p className="text-muted-foreground">
                    Automatically try all possible shift values to decode unknown messages.
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