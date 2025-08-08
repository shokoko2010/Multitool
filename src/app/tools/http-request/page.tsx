'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, Send, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function HttpRequestTester() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState('')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [responseHeaders, setResponseHeaders] = useState('')
  const { toast } = useToast()

  const makeRequest = async () => {
    if (!url.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a URL to test",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const headersObj: Record<string, string> = {}
      if (headers.trim()) {
        headers.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim())
          if (key && value) {
            headersObj[key] = value
          }
        })
      }

      const requestInit: RequestInit = {
        method,
        headers: headersObj,
      }

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        requestInit.body = body
      }

      const startTime = Date.now()
      const fetchResponse = await fetch(url, requestInit)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      const responseText = await fetchResponse.text()
      
      const responseHeadersObj: Record<string, string> = {}
      fetchResponse.headers.forEach((value, key) => {
        responseHeadersObj[key] = value
      })

      const formattedResponse = `HTTP/1.1 ${fetchResponse.status} ${fetchResponse.statusText}
Response Time: ${responseTime}ms

Response Headers:
${Object.entries(responseHeadersObj).map(([key, value]) => `${key}: ${value}`).join('\n')}

Response Body:
${responseText}`

      setResponse(formattedResponse)
      setResponseHeaders(Object.entries(responseHeadersObj).map(([key, value]) => `${key}: ${value}`).join('\n'))
      
      toast({
        title: "Request completed",
        description: `HTTP ${method} request completed in ${responseTime}ms with status ${fetchResponse.status}`
      })
    } catch (error) {
      const errorResponse = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      setResponse(errorResponse)
      
      toast({
        title: "Request failed",
        description: "Unable to complete the HTTP request",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Response has been copied to clipboard"
    })
  }

  const downloadResponse = () => {
    const blob = new Blob([response], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'http-response.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "HTTP response download has started"
    })
  }

  const clearAll = () => {
    setUrl('')
    setHeaders('')
    setBody('')
    setResponse('')
    setResponseHeaders('')
  }

  const setSampleRequest = () => {
    setUrl('https://jsonplaceholder.typicode.com/posts/1')
    setMethod('GET')
    setHeaders('Content-Type: application/json\nUser-Agent: HTTP-Request-Tester/1.0')
    setBody('')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HTTP Request Tester</h1>
        <p className="text-muted-foreground">
          Test HTTP requests and view detailed responses including headers and timing
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Network Tool</Badge>
          <Badge variant="outline">HTTP</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Configuration</CardTitle>
            <CardDescription>
              Configure your HTTP request parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <input
                id="url"
                type="url"
                placeholder="https://example.com/api"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headers">Headers (one per line)</Label>
              <Textarea
                id="headers"
                placeholder="Content-Type: application/json
Authorization: Bearer token123
User-Agent: MyApp/1.0"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="space-y-2">
                <Label htmlFor="body">Request Body</Label>
                <Textarea
                  id="body"
                  placeholder='{"key": "value", "number": 42}'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={makeRequest} disabled={loading || !url.trim()} className="flex-1">
                {loading ? <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {loading ? "Sending..." : "Send Request"}
              </Button>
              <Button onClick={setSampleRequest} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Sample
              </Button>
              <Button onClick={clearAll} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              HTTP response will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={response}
              readOnly
              className="min-h-[400px] font-mono text-sm bg-muted"
            />
            <div className="flex gap-2">
              <Button onClick={() => copyToClipboard(response)} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Response
              </Button>
              <Button onClick={downloadResponse} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>HTTP Request Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use appropriate HTTP methods (GET, POST, PUT, DELETE)</li>
                <li>• Set proper Content-Type headers</li>
                <li>• Include User-Agent for identification</li>
                <li>• Handle CORS properly when testing APIs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Common Status Codes</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 200 OK - Request successful</li>
                <li>• 201 Created - Resource created</li>
                <li>• 400 Bad Request - Invalid request</li>
                <li>• 404 Not Found - Resource not found</li>
                <li>• 500 Internal Server Error - Server error</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}