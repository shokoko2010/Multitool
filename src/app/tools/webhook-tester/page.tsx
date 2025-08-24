'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Webhook, 
  Copy, 
  RefreshCw, 
  Play, 
  Trash2, 
  Download, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface WebhookRequest {
  id: string
  timestamp: string
  method: string
  headers: Record<string, string>
  body: string
  query: Record<string, string>
}

interface WebhookConfig {
  endpoint: string
  secret: string
  isActive: boolean
  retention: number
  format: 'json' | 'form'
}

export default function WebhookTester() {
  const [config, setConfig] = useState<WebhookConfig>({
    endpoint: '',
    secret: '',
    isActive: false,
    retention: 24,
    format: 'json'
  })

  const [requests, setRequests] = useState<WebhookRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<WebhookRequest | null>(null)
  const [webhookUrl, setWebhookUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (config.endpoint) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      setWebhookUrl(`${baseUrl}/api/webhook/${config.endpoint}`)
    }
  }, [config.endpoint])

  const generateEndpoint = () => {
    const randomString = Math.random().toString(36).substring(2, 15)
    setConfig(prev => ({ ...prev, endpoint: randomString }))
  }

  const generateSecret = () => {
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setConfig(prev => ({ ...prev, secret: randomString }))
  }

  const clearRequests = () => {
    setRequests([])
    setSelectedRequest(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportRequests = () => {
    const data = {
      config,
      requests,
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webhook_logs_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const simulateWebhook = async () => {
    if (!config.endpoint) return

    setIsLoading(true)
    try {
      const samplePayload = {
        event: 'test.event',
        timestamp: new Date().toISOString(),
        data: {
          id: Math.random().toString(36).substring(7),
          message: 'This is a test webhook payload',
          value: Math.floor(Math.random() * 1000)
        }
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WebhookTester/1.0'
        },
        body: JSON.stringify(samplePayload)
      })

      if (response.ok) {
        // Simulate receiving the webhook (in real implementation, this would come from the server)
        const newRequest: WebhookRequest = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WebhookTester/1.0'
          },
          body: JSON.stringify(samplePayload, null, 2),
          query: {}
        }
        
        setRequests(prev => [newRequest, ...prev])
      }
    } catch (error) {
      console.error('Failed to simulate webhook:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatBody = (body: string) => {
    try {
      return JSON.stringify(JSON.parse(body), null, 2)
    } catch {
      return body
    }
  }

  const getStatusColor = (method: string) => {
    switch (method) {
      case 'POST': return 'bg-green-100 text-green-800'
      case 'GET': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Webhook Tester</h1>
        <p className="text-muted-foreground">
          Create webhook endpoints to test and debug incoming webhook requests
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure your webhook endpoint settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="endpoint"
                      value={config.endpoint}
                      onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                      placeholder="my-webhook"
                    />
                    <Button onClick={generateEndpoint} variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secret"
                      type="password"
                      value={config.secret}
                      onChange={(e) => setConfig(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="webhook-secret"
                    />
                    <Button onClick={generateSecret} variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="retention">Request Retention (hours)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={config.retention}
                    onChange={(e) => setConfig(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                    min="1"
                    max="168"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Expected Format</Label>
                  <Select value={config.format} onValueChange={(value: 'json' | 'form') => setConfig(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="form">Form Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={config.isActive}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </CardContent>
          </Card>

          {webhookUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Webhook URL</CardTitle>
                <CardDescription>
                  Use this URL to send webhook requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="flex-1" />
                    <Button onClick={() => copyToClipboard(webhookUrl)} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">cURL Example</h4>
                    <pre className="text-sm">
                      {`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"event": "test", "data": {"message": "Hello World"}}'`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Incoming Requests</h2>
              <p className="text-muted-foreground">
                {requests.length} request{requests.length !== 1 ? 's' : ''} received
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearRequests} variant="outline" disabled={requests.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button onClick={exportRequests} variant="outline" disabled={requests.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {requests.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Request History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                          selectedRequest?.id === request.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={getStatusColor(request.method)}>
                            {request.method}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(request.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm font-medium truncate">
                          {request.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedRequest && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                    <CardDescription>
                      {selectedRequest.method} request received at {formatTimestamp(selectedRequest.timestamp)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Headers</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(selectedRequest.headers).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span className="text-muted-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {Object.keys(selectedRequest.query).length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Query Parameters</h4>
                          <div className="space-y-1 text-sm">
                            {Object.entries(selectedRequest.query).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span className="text-muted-foreground">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-2">Body</h4>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{formatBody(selectedRequest.body)}</code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No webhook requests received yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Configure your webhook endpoint and send a test request.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Webhook</CardTitle>
              <CardDescription>
                Send a test webhook request to your endpoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testPayload">Test Payload</Label>
                <Textarea
                  id="testPayload"
                  defaultValue={`{
  "event": "test.event",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "id": "test-123",
    "message": "This is a test webhook",
    "value": 42
  }
}`}
                  rows={8}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testHeaders">Custom Headers (JSON)</Label>
                  <Textarea
                    id="testHeaders"
                    defaultValue={`{
  "Content-Type": "application/json",
  "X-Webhook-Source": "test-client"
}`}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testMethod">HTTP Method</Label>
                  <Select defaultValue="POST">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={simulateWebhook} disabled={isLoading || !config.endpoint}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending Test...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Send Test Webhook
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Integration Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">GitHub Webhook</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
                    {`GitHub Repository → Settings → Webhooks → Add webhook
Payload URL: ${webhookUrl}
Content type: application/json
Secret: ${config.secret || 'your-secret-key'}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Stripe Webhook</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
                    {`Stripe Dashboard → Developers → Webhooks → Add endpoint
Endpoint URL: ${webhookUrl}
Listen to: payment_intent.succeeded
Signing secret: ${config.secret || 'whsec_...'}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Custom Application</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
                    {`// JavaScript example
fetch('${webhookUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${config.secret || 'your-token'}'
  },
  body: JSON.stringify({
    event: 'user.created',
    data: { userId: 123, email: 'user@example.com' }
  })
})`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}