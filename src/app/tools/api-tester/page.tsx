'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RefreshCw, Send, CheckCircle, AlertCircle, Clock, Code, FileText } from 'lucide-react'

interface ApiResponse {
  status: number
  statusText: string
  headers: { [key: string]: string }
  data: any
  responseTime: number
  timestamp: string
}

interface RequestHistory {
  id: string
  method: string
  url: string
  timestamp: string
  status: number
  responseTime: number
}

export default function ApiTester() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [history, setHistory] = useState<RequestHistory[]>([])
  const [activeTab, setActiveTab] = useState('request')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const sampleUrls = [
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://api.github.com/users/octocat',
    'https://httpbin.org/get',
    'https://httpbin.org/post',
  ]

  const sampleHeaders = `Content-Type: application/json
Authorization: Bearer your-token-here
Accept: application/json`

  const sampleBodies = {
    GET: '',
    POST: `{
  "title": "Test Post",
  "body": "This is a test post",
  "userId": 1
}`,
    PUT: `{
  "id": 1,
  "title": "Updated Post",
  "body": "This is an updated post",
  "userId": 1
}`,
    DELETE: '',
    PATCH: `{
  "title": "Patched Post"
}`
  }

  const parseHeaders = (headersText: string): { [key: string]: string } => {
    const headers: { [key: string]: string } = {}
    const lines = headersText.split('\n')
    
    lines.forEach(line => {
      const [key, ...values] = line.split(':')
      if (key && values.length > 0) {
        headers[key.trim()] = values.join(':').trim()
      }
    })
    
    return headers
  }

  const sendRequest = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setIsSending(true)
    setError(null)
    setActiveTab('response')

    try {
      const startTime = Date.now()
      const parsedHeaders = parseHeaders(headers)
      const finalHeaders = {
        'User-Agent': 'API-Tester/1.0',
        ...parsedHeaders
      }

      const options: RequestInit = {
        method,
        headers: finalHeaders,
      }

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body
      }

      const response = await fetch(url, options)
      const responseTime = Date.now() - startTime
      
      let responseData
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        responseTime,
        timestamp: new Date().toISOString()
      }

      setResponse(apiResponse)

      // Add to history
      const historyItem: RequestHistory = {
        id: Math.random().toString(36).substr(2, 9),
        method,
        url,
        timestamp: new Date().toISOString(),
        status: response.status,
        responseTime
      }

      setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 requests

    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadResponse = () => {
    if (!response) return

    const dataStr = JSON.stringify(response.data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api_response_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const loadSample = (sampleUrl: string) => {
    setUrl(sampleUrl)
    setHeaders(sampleHeaders)
    setBody(sampleBodies[method as keyof typeof sampleBodies])
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500'
    if (status >= 300 && status < 400) return 'bg-yellow-500'
    if (status >= 400 && status < 500) return 'bg-orange-500'
    if (status >= 500) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const formatHeaders = (headers: { [key: string]: string }) => {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              API Tester
            </CardTitle>
            <CardDescription>
              Test REST APIs with customizable requests and view detailed responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="url">API URL</Label>
                      <Input
                        id="url"
                        placeholder="https://api.example.com/endpoint"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="method">HTTP Method</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="headers">Headers</Label>
                      <Textarea
                        id="headers"
                        placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
                        value={headers}
                        onChange={(e) => setHeaders(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="body">Request Body</Label>
                      <Textarea
                        id="body"
                        placeholder="Enter JSON request body..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={8}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quick Samples</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {sampleUrls.map((sampleUrl, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => loadSample(sampleUrl)}
                          >
                            Sample {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUrl('')
                      setHeaders('')
                      setBody('')
                      setResponse(null)
                      setError(null)
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={sendRequest}
                    disabled={isSending || !url}
                    className="flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="response" className="space-y-4">
                {response ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(response.status)}`} />
                          <span className="font-medium">
                            {response.status} {response.statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {response.responseTime}ms
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadResponse}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="body" className="w-full">
                      <TabsList>
                        <TabsTrigger value="body">Response Body</TabsTrigger>
                        <TabsTrigger value="headers">Headers</TabsTrigger>
                        <TabsTrigger value="info">Info</TabsTrigger>
                      </TabsList>

                      <TabsContent value="body">
                        <Card>
                          <CardContent className="p-4">
                            <pre className="text-sm overflow-auto max-h-96">
                              <code>{JSON.stringify(response.data, null, 2)}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="headers">
                        <Card>
                          <CardContent className="p-4">
                            <pre className="text-sm overflow-auto max-h-96">
                              <code>{formatHeaders(response.headers)}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="info">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Status Code:</span>
                            <p className="text-muted-foreground">{response.status}</p>
                          </div>
                          <div>
                            <span className="font-medium">Status Text:</span>
                            <p className="text-muted-foreground">{response.statusText}</p>
                          </div>
                          <div>
                            <span className="font-medium">Response Time:</span>
                            <p className="text-muted-foreground">{response.responseTime}ms</p>
                          </div>
                          <div>
                            <span className="font-medium">Timestamp:</span>
                            <p className="text-muted-foreground">
                              {new Date(response.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No response yet. Send a request to see the response.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Request History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setUrl(item.url)
                      setMethod(item.method)
                      setActiveTab('request')
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{item.method}</Badge>
                      <span className="text-sm font-medium truncate max-w-xs">
                        {item.url}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                        {item.status}
                      </span>
                      <span>{item.responseTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Request Methods:</strong> GET, POST, PUT, DELETE, PATCH
            </div>
            <div>
              <strong>Custom Headers:</strong> Add any headers you need
            </div>
            <div>
              <strong>JSON Body:</strong> Send JSON request bodies
            </div>
            <div>
              <strong>Response Analysis:</strong> View status, headers, and body
            </div>
            <div>
              <strong>Request History:</strong> Keep track of your requests
            </div>
            <div>
              <strong>Copy & Download:</strong> Copy responses or download as JSON
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}