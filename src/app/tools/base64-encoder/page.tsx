'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Code, Copy, Download, FileText, CheckCircle, AlertCircle, Upload } from 'lucide-react'

export default function Base64Encoder() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encoding, setEncoding] = useState<'standard' | 'url'>('standard')
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)

  const encodeBase64 = () => {
    try {
      if (!inputText.trim()) {
        setError('Please enter text to encode')
        setOutputText('')
        setIsValid(false)
        return
      }

      let encoded: string
      if (encoding === 'url') {
        encoded = btoa(inputText)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')
      } else {
        encoded = btoa(inputText)
      }
      
      setOutputText(encoded)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError(`Encoding failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setOutputText('')
      setIsValid(false)
    }
  }

  const decodeBase64 = () => {
    try {
      if (!inputText.trim()) {
        setError('Please enter Base64 to decode')
        setOutputText('')
        setIsValid(false)
        return
      }

      let decoded: string
      if (encoding === 'url') {
        // Add padding if needed
        let base64 = inputText.replace(/-/g, '+').replace(/_/g, '/')
        while (base64.length % 4) {
          base64 += '='
        }
        decoded = atob(base64)
      } else {
        decoded = atob(inputText)
      }
      
      setOutputText(decoded)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError(`Decoding failed: ${err instanceof Error ? err.message : 'Invalid Base64'}`)
      setOutputText('')
      setIsValid(false)
    }
  }

  const processText = () => {
    if (mode === 'encode') {
      encodeBase64()
    } else {
      decodeBase64()
    }
  }

  const copyToClipboard = async () => {
    if (outputText) {
      try {
        await navigator.clipboard.writeText(outputText)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const downloadText = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setError('')
    setIsValid(false)
  }

  const loadSample = () => {
    if (mode === 'encode') {
      setInputText('Hello, World! This is a sample text for Base64 encoding.')
    } else {
      setInputText('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4=')
    }
  }

  const swapInputOutput = () => {
    setInputText(outputText)
    setOutputText(inputText)
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Code className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Base64 Encoder/Decoder</h1>
            </div>
            <p className="text-muted-foreground">
              Encode and decode text using Base64 encoding
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Mode:</span>
                <Select value={mode} onValueChange={(value: 'encode' | 'decode') => setMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encode">Encode</SelectItem>
                    <SelectItem value="decode">Decode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Encoding:</span>
                <Select value={encoding} onValueChange={(value: 'standard' | 'url') => setEncoding(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="url">URL-safe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Input ({mode === 'encode' ? 'Text' : 'Base64'})
                </CardTitle>
                <CardDescription>
                  {mode === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                  className="min-h-[400px] font-mono text-sm"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={loadSample} variant="outline" size="sm">
                    Load Sample
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </span>
                    </Button>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".txt,.json,.xml,.html" 
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {error && (
                  <div className={`flex items-center gap-2 p-3 rounded-md ${
                    isValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {isValid ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Output ({mode === 'encode' ? 'Base64' : 'Text'})
                </CardTitle>
                <CardDescription>
                  {mode === 'encode' ? 'Encoded Base64 result' : 'Decoded text result'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={outputText}
                  readOnly
                  placeholder={mode === 'encode' ? 'Encoded Base64 will appear here...' : 'Decoded text will appear here...'}
                  className="min-h-[400px] font-mono text-sm bg-muted/50"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={processText} disabled={!inputText.trim()}>
                    {mode === 'encode' ? 'Encode' : 'Decode'}
                  </Button>
                  <Button onClick={swapInputOutput} variant="outline" disabled={!outputText}>
                    Swap
                  </Button>
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline" 
                    disabled={!outputText}
                    className="flex items-center gap-2"
                  >
                    {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button 
                    onClick={downloadText} 
                    variant="outline" 
                    disabled={!outputText}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                {outputText && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {outputText.length} characters
                    </Badge>
                    <Badge variant="secondary">
                      Size: {(new Blob([outputText]).size / 1024).toFixed(2)} KB
                    </Badge>
                    {mode === 'encode' && (
                      <Badge variant="secondary">
                        Ratio: {((outputText.length / inputText.length) * 100).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Features & Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="encodings">Encodings</TabsTrigger>
                  <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">What is Base64?</h4>
                    <p className="text-sm text-muted-foreground">
                      Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
                      It's commonly used to encode data that needs to be stored or transferred over media designed 
                      to handle text.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Character Set</p>
                        <p className="text-xs text-muted-foreground">A-Z, a-z, 0-9, +, /, and = for padding</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Encoding Ratio</p>
                        <p className="text-xs text-muted-foreground">Approximately 33% size increase</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="encodings" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Encoding Types:</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-md">
                        <p className="text-sm font-medium">Standard Base64</p>
                        <p className="text-xs text-muted-foreground">
                          Uses + and / characters with = padding. Standard for most applications.
                        </p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <p className="text-sm font-medium">URL-safe Base64</p>
                        <p className="text-xs text-muted-foreground">
                          Uses - and _ characters instead of + and /, with optional padding. 
                          Safe for URLs and filenames.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="use-cases" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Common Use Cases:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Email Attachments</p>
                        <p className="text-xs text-muted-foreground">Encoding binary files for email transmission</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Data URLs</p>
                        <p className="text-xs text-muted-foreground">Embedding images in HTML/CSS</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">API Authentication</p>
                        <p className="text-xs text-muted-foreground">Encoding credentials for Basic Auth</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Web Tokens</p>
                        <p className="text-xs text-muted-foreground">JWT payload encoding</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Encoding Examples:</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Text: "Hello World"</p>
                        <p className="text-xs text-muted-foreground font-mono">SGVsbG8gV29ybGQ=</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">JSON: {"{\"name\":\"John\"}"}</p>
                        <p className="text-xs text-muted-foreground font-mono">eyJuYW1lIjoiSm9obiJ9</p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">URL: "https://example.com/path"</p>
                        <p className="text-xs text-muted-foreground font-mono">aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRo</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}