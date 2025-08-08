'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Link, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function UrlEncoderTool() {
  const [url, setUrl] = useState('')
  const [encodedUrl, setEncodedUrl] = useState('')
  const [decodedUrl, setDecodedUrl] = useState('')
  const [params, setParams] = useState('')
  const [encodedParams, setEncodedParams] = useState('')
  const { toast } = useToast()

  const encodeUrl = () => {
    try {
      const encoded = encodeURIComponent(url)
      setEncodedUrl(encoded)
    } catch (error) {
      toast({
        title: "Encoding Error",
        description: "Invalid URL format",
        variant: "destructive",
      })
    }
  }

  const decodeUrl = () => {
    try {
      const decoded = decodeURIComponent(url)
      setDecodedUrl(decoded)
    } catch (error) {
      toast({
        title: "Decoding Error",
        description: "Invalid encoded URL format",
        variant: "destructive",
      })
    }
  }

  const encodeParams = () => {
    try {
      const paramsArray = params.split('&').filter(param => param.trim())
      const encodedParamsArray = paramsArray.map(param => {
        const [key, ...values] = param.split('=')
        const value = values.join('=')
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      })
      setEncodedParams(encodedParamsArray.join('&'))
    } catch (error) {
      toast({
        title: "Encoding Error",
        description: "Invalid parameter format",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const swapEncodeDecode = () => {
    const temp = url
    setUrl(encodedUrl)
    setEncodedUrl(temp)
  }

  const swapParamsEncodeDecode = () => {
    const temp = params
    setParams(encodedParams)
    setEncodedParams(temp)
  }

  const loadSampleUrl = () => {
    setUrl('https://example.com/search?q=hello world&category=web development')
  }

  const loadSampleParams = () => {
    setParams('name=John Doe&email=john@example.com&message=Hello World!')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">URL Encoder/Decoder</h1>
        <p className="text-muted-foreground">
          Encode and decode URLs and URL parameters safely
        </p>
      </div>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">URL Encode/Decode</TabsTrigger>
          <TabsTrigger value="params">Parameters Encode/Decode</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Input URL
                </CardTitle>
                <CardDescription>
                  Enter the URL you want to encode or decode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                
                <div className="flex gap-2">
                  <Button onClick={loadSampleUrl} variant="outline" className="flex-1">
                    Load Sample
                  </Button>
                  <Button onClick={swapEncodeDecode} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Swap
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={encodeUrl} className="flex-1">
                    Encode URL
                  </Button>
                  <Button onClick={decodeUrl} variant="outline" className="flex-1">
                    Decode URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* URL Output */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Result
                </CardTitle>
                <CardDescription>
                  Encoded or decoded URL result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="relative">
                    <Input
                      value={encodedUrl}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(encodedUrl, 'URL')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Tip:</strong> URLs containing spaces or special characters need to be encoded for web compatibility.</p>
                  <p className="mt-1">Common characters that need encoding: space ( ), ampersand (&), equals (=), question mark (?), hash (#)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Common URL Encoding Examples</CardTitle>
              <CardDescription>
                See how common characters and symbols are encoded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { original: 'hello world', encoded: 'hello%20world' },
                  { original: 'user@example.com', encoded: 'user%40example.com' },
                  { original: 'search?q=javascript', encoded: 'search%3Fq%3Djavascript' },
                  { original: 'file name.txt', encoded: 'file%20name.txt' },
                  { original: '100% complete', encoded: '100%25%20complete' },
                  { original: 'path/to/file', encoded: 'path%2Fto%2Ffile' }
                ].map((example, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="text-sm font-semibold">Original:</div>
                    <div className="text-xs font-mono">{example.original}</div>
                    <div className="text-sm font-semibold mt-2">Encoded:</div>
                    <div className="text-xs font-mono text-blue-600">{example.encoded}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="params" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parameters Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  URL Parameters
                </CardTitle>
                <CardDescription>
                  Enter URL parameters (key=value pairs separated by &)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter parameters here..."
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                
                <div className="flex gap-2">
                  <Button onClick={loadSampleParams} variant="outline" className="flex-1">
                    Load Sample
                  </Button>
                  <Button onClick={swapParamsEncodeDecode} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Swap
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={encodeParams} className="flex-1">
                    Encode Params
                  </Button>
                  <Button onClick={() => {
                    try {
                      const decoded = decodeURIComponent(params.replace(/\+/g, ' '))
                      setEncodedParams(decoded)
                    } catch (error) {
                      toast({
                        title: "Decoding Error",
                        description: "Invalid encoded parameters format",
                        variant: "destructive",
                      })
                    }
                  }} variant="outline" className="flex-1">
                    Decode Params
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Parameters Output */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Encoded Parameters
                </CardTitle>
                <CardDescription>
                  URL-safe encoded parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="relative">
                    <Input
                      value={encodedParams}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(encodedParams, 'Parameters')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Tip:</strong> URL parameters should be encoded when included in URLs to ensure proper transmission and parsing.</p>
                  <p className="mt-1">Special characters in parameter values: space, &, =, ?, #, %, etc.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Parameter Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Parameter Encoding Examples</CardTitle>
              <CardDescription>
                See how common parameter values are encoded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { original: 'name=John Doe', encoded: 'name=John%20Doe' },
                  { original: 'email=user@example.com', encoded: 'email=user%40example.com' },
                  { original: 'search=hello world', encoded: 'search=hello%20world' },
                  { original: 'file=path/to/file.txt', encoded: 'file=path%2Fto%2Ffile.txt' },
                  { original: 'query=what?when?how', encoded: 'query=what%3Fwhen%3Fhow' },
                  { original: 'data=100% complete', encoded: 'data=100%25%20complete' }
                ].map((example, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="text-sm font-semibold">Original:</div>
                    <div className="text-xs font-mono">{example.original}</div>
                    <div className="text-sm font-semibold mt-2">Encoded:</div>
                    <div className="text-xs font-mono text-blue-600">{example.encoded}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}