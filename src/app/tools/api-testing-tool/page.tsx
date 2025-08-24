'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Send, 
  Download, 
  Copy, 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  FileText, 
  Code,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface APIRequest {
  url: string
  method: string
  headers: Record<string, string>
  body: string
  authType: 'none' | 'bearer' | 'basic' | 'api-key'
  authValue: string
}

interface APIResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
}

interface TestResult {
  id: string
  name: string
  request: APIRequest
  response: APIResponse | null
  timestamp: string
  status: 'pending' | 'running' | 'success' | 'error'
}

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
const authTypes = [
  { value: 'none', label: 'No Authentication' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'api-key', label: 'API Key' }
]

const sampleRequests = [
  {
    name: 'GET Users',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users',
    headers: { 'Content-Type': 'application/json' },
    body: '',
    authType: 'none' as const,
    authValue: ''
  },
  {
    name: 'POST Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    }),
    authType: 'none' as const,
    authValue: ''
  },
  {
    name: 'PUT Update Post',
    method: 'PUT',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      title: 'Updated Post',
      body: 'This post has been updated',
      userId: 1
    }),
    authType: 'none' as const,
    authValue: ''
  }
]

export default function APITestingTool() {
  const [request, setRequest] = useState<APIRequest>({
    url: 'https://jsonplaceholder.typicode.com/users',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: '',
    authType: 'none',
    authValue: ''
  })
  
  const [response, setResponse] = useState<APIResponse | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('')

  const sendRequest = async () => {
    setIsRunning(true)
    const startTime = Date.now()

    try {
      const headers: Record<string, string> = { ...request.headers }
      
      // Add authentication headers
      if (request.authType === 'bearer' && request.authValue) {
        headers['Authorization'] = `Bearer ${request.authValue}`
      } else if (request.authType === 'basic' && request.authValue) {
        headers['Authorization'] = `Basic ${btoa(request.authValue)}`
      } else if (request.authType === 'api-key' && request.authValue) {
        headers['X-API-Key'] = request.authValue
      }

      const fetchOptions: RequestInit = {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
      }

      const res = await fetch(request.url, fetchOptions)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const responseBody = await res.text()
      const size = new Blob([responseBody]).size

      const apiResponse: APIResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: responseTime,
        size: size
      }

      setResponse(apiResponse)
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: error instanceof Error ? error.message : 'Unknown error',
        time: Date.now() - startTime,
        size: 0
      })
    } finally {
      setIsRunning(false)
    }
  }

  const loadSampleRequest = (sample: typeof sampleRequests[0]) => {
    setRequest({
      url: sample.url,
      method: sample.method,
      headers: sample.headers,
      body: sample.body,
      authType: sample.authType,
      authValue: sample.authValue
    })
  }

  const addHeader = () => {
    const key = prompt('Header name:')
    const value = prompt('Header value:')
    if (key && value) {
      setRequest(prev => ({
        ...prev,
        headers: { ...prev.headers, [key]: value }
      }))
    }
  }

  const removeHeader = (key: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers }
      delete newHeaders[key]
      return { ...prev, headers: newHeaders }
    })
  }

  const formatJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonString
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResponse = () => {
    if (!response) return
    
    const blob = new Blob([response.body], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4" />
    if (status >= 400) return <XCircle className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Testing Tool</h1>
        <p className="text-muted-foreground">
          Test and debug REST APIs with advanced request configuration and response analysis
        </p>
      </div>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request">Request Builder</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="samples">Sample Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Request Configuration</CardTitle>
              <CardDescription>
                Configure your API request with method, URL, headers, and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select value={request.method} onValueChange={(value) => setRequest(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {httpMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Request URL</Label>
                  <Input
                    id="url"
                    value={request.url}
                    onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Headers</Label>
                  <Button onClick={addHeader} variant="outline" size="sm">
                    Add Header
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input value={key} readOnly className="flex-1" />
                      <Input 
                        value={value} 
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          headers: { ...prev.headers, [key]: e.target.value }
                        }))}
                        className="flex-1"
                      />
                      <Button onClick={() => removeHeader(key)} variant="outline" size="sm">
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth">Authentication</Label>
                <Select value={request.authType} onValueChange={(value: any) => setRequest(prev => ({ ...prev, authType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authTypes.map((auth) => (
                      <SelectItem key={auth.value} value={auth.value}>
                        {auth.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {request.authType !== 'none' && (
                  <Input
                    value={request.authValue}
                    onChange={(e) => setRequest(prev => ({ ...prev, authValue: e.target.value }))}
                    placeholder={request.authType === 'bearer' ? 'Bearer token' : 
                              request.authType === 'basic' ? 'username:password' : 'API key'}
                    type="password"
                  />
                )}
              </div>

              {(request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') && (
                <div className="space-y-2">
                  <Label htmlFor="body">Request Body</Label>
                  <Textarea
                    id="body"
                    value={request.body}
                    onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Enter JSON request body..."
                    rows={6}
                  />
                </div>
              )}

              <Button onClick={sendRequest} disabled={isRunning} className="w-full">
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="space-y-6">
          {response ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(response.status)}
                      Response
                      <Badge variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}>
                        {response.status} {response.statusText}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Request completed in {response.time}ms • {response.size} bytes
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => copyToClipboard(response.body)} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={downloadResponse} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="headers">
                    <AccordionTrigger>Response Headers</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 text-sm">
                        {Object.entries(response.headers).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span className="text-muted-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="body">
                    <AccordionTrigger>Response Body</AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{formatJSON(response.body)}</code>
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No response yet. Send a request to see results.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="samples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample API Requests</CardTitle>
              <CardDescription>
                Click on any sample to load it into the request builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {sampleRequests.map((sample, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => loadSampleRequest(sample)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{sample.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {sample.method} {new URL(sample.url).pathname}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{sample.method}</Badge>
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}