'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Link, Lock, Unlock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function UrlEncoder() {
  const [inputText, setInputText] = useState('')
  const [encodedResult, setEncodedResult] = useState('')
  const [decodedResult, setDecodedResult] = useState('')

  const encodeUrl = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to encode",
        variant: "destructive"
      })
      return
    }

    try {
      const encoded = encodeURIComponent(inputText)
      setEncodedResult(encoded)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode URL",
        variant: "destructive"
      })
    }
  }

  const decodeUrl = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter URL to decode",
        variant: "destructive"
      })
      return
    }

    try {
      const decoded = decodeURIComponent(inputText)
      setDecodedResult(decoded)
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid URL encoding",
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

  const clearAll = () => {
    setInputText('')
    setEncodedResult('')
    setDecodedResult('')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Encoder/Decoder</h1>
        <p className="text-muted-foreground">Encode and decode URL strings for web applications</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Input Text
            </CardTitle>
            <CardDescription>Enter text to encode or decode</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to encode or decode..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Encode
            </TabsTrigger>
            <TabsTrigger value="decode" className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Decode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>URL Encoding</CardTitle>
                <CardDescription>
                  Convert special characters to URL-safe format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={encodeUrl} className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Encode URL
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
                    <div className="text-sm text-muted-foreground">
                      <p>Original: {inputText.length} characters</p>
                      <p>Encoded: {encodedResult.length} characters</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>URL Decoding</CardTitle>
                <CardDescription>
                  Convert URL-encoded text back to original format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={decodeUrl} className="w-full">
                  <Unlock className="h-4 w-4 mr-2" />
                  Decode URL
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
                    <div className="text-sm text-muted-foreground">
                      <p>Encoded: {inputText.length} characters</p>
                      <p>Decoded: {decodedResult.length} characters</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>URL Encoding Reference</CardTitle>
            <CardDescription>Common URL encoding examples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">Common Encodings</h4>
                <div className="space-y-1 font-mono text-xs">
                  <div>Space → %20</div>
                  <div>! → %21</div>
                  <div># → %23</div>
                  <div>$ → %24</div>
                  <div>% → %25</div>
                  <div>& → %26</div>
                  <div>+ → %2B</div>
                  <div>/ → %2F</div>
                  <div>? → %3F</div>
                  <div>= → %3D</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Example</h4>
                <div className="bg-muted p-3 rounded text-xs">
                  <div className="mb-2"><strong>Original:</strong></div>
                  <div className="mb-2">Hello World! How are you?</div>
                  <div className="mb-2"><strong>Encoded:</strong></div>
                  <div>Hello%20World!%20How%20are%20you%3F</div>
                </div>
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