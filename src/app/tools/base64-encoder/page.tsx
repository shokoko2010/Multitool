'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Copy, FileText, Upload, Download } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Base64Encoder() {
  const [inputText, setInputText] = useState('')
  const [encodedResult, setEncodedResult] = useState('')
  const [decodedResult, setDecodedResult] = useState('')

  const encodeBase64 = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to encode",
        variant: "destructive"
      })
      return
    }

    try {
      const encoded = btoa(inputText)
      setEncodedResult(encoded)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode text",
        variant: "destructive"
      })
    }
  }

  const decodeBase64 = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter Base64 to decode",
        variant: "destructive"
      })
      return
    }

    try {
      const decoded = atob(inputText)
      setDecodedResult(decoded)
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid Base64 format",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard"
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isEncode: boolean) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputText(content)
      
      if (isEncode) {
        try {
          const encoded = btoa(content)
          setEncodedResult(encoded)
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to encode file content",
            variant: "destructive"
          })
        }
      }
    }
    reader.readAsText(file)
  }

  const downloadResult = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInputText('')
    setEncodedResult('')
    setDecodedResult('')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Base64 Encoder/Decoder</h1>
        <p className="text-muted-foreground">Encode and decode text using Base64 format</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input Text
            </CardTitle>
            <CardDescription>Enter text to encode or decode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter text to encode or decode..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px]"
            />
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="file-encode">Upload file to encode</Label>
                <Input
                  id="file-encode"
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="file-decode">Upload file to decode</Label>
                <Input
                  id="file-decode"
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Encode
            </TabsTrigger>
            <TabsTrigger value="decode" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Decode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Base64 Encoding</CardTitle>
                <CardDescription>
                  Convert text to Base64 format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={encodeBase64} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Encode to Base64
                </Button>
                
                {encodedResult && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        value={encodedResult}
                        readOnly
                        className="min-h-[120px] font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(encodedResult)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResult(encodedResult, 'encoded.txt')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Original: {inputText.length} characters</p>
                      <p>Encoded: {encodedResult.length} characters</p>
                      <p>Ratio: {((encodedResult.length / inputText.length) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Base64 Decoding</CardTitle>
                <CardDescription>
                  Convert Base64 text back to original format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={decodeBase64} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Decode from Base64
                </Button>
                
                {decodedResult && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        value={decodedResult}
                        readOnly
                        className="min-h-[120px]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(decodedResult)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResult(decodedResult, 'decoded.txt')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Encoded: {inputText.length} characters</p>
                      <p>Decoded: {decodedResult.length} characters</p>
                      <p>Ratio: {((decodedResult.length / inputText.length) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Base64 Information</CardTitle>
            <CardDescription>About Base64 encoding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">What is Base64?</h4>
                <p className="text-muted-foreground">
                  Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It's commonly used to encode data for transfer over media that handle text.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Common Uses</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Email attachments</li>
                  <li>• Data URIs in HTML/CSS</li>
                  <li>• Storing complex data in JSON</li>
                  <li>• Encoding binary data for APIs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={clearAll} variant="outline" className="flex-1">
            Clear All
          </Button>
        </div>
      </div>
    </div>
  )
}