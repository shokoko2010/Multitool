'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Send, 
  Download, 
  Copy, 
  Play, 
  RefreshCw, 
  FileText, 
  Code,
  AlertCircle,
  CheckCircle,
  XCircle,
  Database,
  Hash
} from 'lucide-react'

interface GraphQLRequest {
  endpoint: string
  query: string
  variables: string
  headers: Record<string, string>
}

interface GraphQLResponse {
  data?: any
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: Array<string | number>
  }>
  extensions?: any
}

interface GraphQLSchema {
  types: Array<{
    name: string
    kind: string
    description?: string
    fields?: Array<{
      name: string
      type: string
      description?: string
    }>
  }>
}

const sampleQueries = [
  {
    name: 'Simple Query',
    query: `query {
  hello
}`,
    variables: '{}'
  },
  {
    name: 'User Query',
    query: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}`,
    variables: `{
  "id": "1"
}`
  },
  {
    name: 'Mutation',
    query: `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    createdAt
  }
}`,
    variables: `{
  "input": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}`
  }
]

const sampleEndpoints = [
  { name: 'GitHub GraphQL', url: 'https://api.github.com/graphql' },
  { name: 'GraphQL Playground', url: 'https://graphqlzero.almansi.me/api' },
  { name: 'SpaceX GraphQL', url: 'https://spacex-production.up.railway.app/' }
]

export default function GraphQLTester() {
  const [request, setRequest] = useState<GraphQLRequest>({
    endpoint: 'https://graphqlzero.almansi.me/api',
    query: `query {
  posts {
    data {
      id
      title
      body
    }
  }
}`,
    variables: '{}',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const [response, setResponse] = useState<GraphQLResponse | null>(null)
  const [schema, setSchema] = useState<GraphQLSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isIntrospecting, setIsIntrospecting] = useState(false)

  const sendRequest = async () => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = { ...request.headers }
      
      const requestBody: any = {
        query: request.query
      }

      try {
        const variables = JSON.parse(request.variables)
        if (Object.keys(variables).length > 0) {
          requestBody.variables = variables
        }
      } catch {
        // Variables JSON is invalid, send as is
      }

      const res = await fetch(request.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      })

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({
        errors: [{
          message: error instanceof Error ? error.message : 'Network error'
        }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const introspectSchema = async () => {
    setIsIntrospecting(true)
    try {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            types {
              name
              kind
              description
              fields {
                name
                type {
                  name
                  kind
                }
                description
              }
            }
          }
        }
      `

      const res = await fetch(request.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: introspectionQuery })
      })

      const data = await res.json()
      
      if (data.data?.__schema) {
        setSchema(data.data.__schema)
      }
    } catch (error) {
      console.error('Failed to introspect schema:', error)
    } finally {
      setIsIntrospecting(false)
    }
  }

  const loadSampleQuery = (sample: typeof sampleQueries[0]) => {
    setRequest(prev => ({
      ...prev,
      query: sample.query,
      variables: sample.variables
    }))
  }

  const loadSampleEndpoint = (endpoint: typeof sampleEndpoints[0]) => {
    setRequest(prev => ({
      ...prev,
      endpoint: endpoint.url
    }))
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
    
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `graphql_response_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const prettifyQuery = () => {
    // Simple query prettifier
    const prettified = request.query
      .replace(/\{/g, '{\n  ')
      .replace(/\}/g, '\n}')
      .replace(/\(/g, '(\n    ')
      .replace(/\)/g, '\n  )')
      .replace(/,/g, ',\n    ')
      .replace(/\n\s*\n/g, '\n')
    
    setRequest(prev => ({ ...prev, query: prettified }))
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GraphQL Tester</h1>
        <p className="text-muted-foreground">
          Test and debug GraphQL APIs with schema introspection and query validation
        </p>
      </div>

      <Tabs defaultValue="query" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query">Query Editor</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GraphQL Request</CardTitle>
              <CardDescription>
                Configure your GraphQL endpoint and query
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">GraphQL Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    id="endpoint"
                    value={request.endpoint}
                    onChange={(e) => setRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="https://api.example.com/graphql"
                  />
                  <Button onClick={introspectSchema} variant="outline" disabled={isIntrospecting}>
                    {isIntrospecting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                  </Button>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="query">GraphQL Query</Label>
                  <Button onClick={prettifyQuery} variant="outline" size="sm">
                    Prettify
                  </Button>
                </div>
                <Textarea
                  id="query"
                  value={request.query}
                  onChange={(e) => setRequest(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="Enter your GraphQL query..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="variables">Variables (JSON)</Label>
                  <Textarea
                    id="variables"
                    value={request.variables}
                    onChange={(e) => setRequest(prev => ({ ...prev, variables: e.target.value }))}
                    placeholder="{}"
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sample Queries</Label>
                  <div className="space-y-2">
                    {sampleQueries.map((sample, index) => (
                      <Button
                        key={index}
                        onClick={() => loadSampleQuery(sample)}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Hash className="h-3 w-3 mr-2" />
                        {sample.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={sendRequest} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executing Query...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Execute Query
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Endpoints</CardTitle>
              <CardDescription>
                Click on any endpoint to load it for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {sampleEndpoints.map((endpoint, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => loadSampleEndpoint(endpoint)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{endpoint.name}</CardTitle>
                      <CardDescription className="text-xs truncate">
                        {endpoint.url}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                      {response.errors ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      Response
                    </CardTitle>
                    <CardDescription>
                      {response.errors ? 
                        `${response.errors.length} error${response.errors.length !== 1 ? 's' : ''} found` : 
                        'Query executed successfully'
                      }
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => copyToClipboard(JSON.stringify(response, null, 2))} variant="outline" size="sm">
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
                <div className="space-y-4">
                  {response.errors && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-600">Errors</h4>
                      {response.errors.map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="font-medium text-red-800">{error.message}</div>
                          {error.locations && (
                            <div className="text-sm text-red-600 mt-1">
                              Location: Line {error.locations[0]?.line}, Column {error.locations[0]?.column}
                            </div>
                          )}
                          {error.path && (
                            <div className="text-sm text-red-600">
                              Path: {error.path.join('.')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {response.data && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Data</h4>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{JSON.stringify(response.data, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  {response.extensions && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Extensions</h4>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{JSON.stringify(response.extensions, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No response yet. Execute a query to see results.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          {schema ? (
            <Card>
              <CardHeader>
                <CardTitle>GraphQL Schema</CardTitle>
                <CardDescription>
                  Introspected schema from your GraphQL endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {schema.types
                      .filter(type => !type.name.startsWith('__'))
                      .slice(0, 12)
                      .map((type) => (
                        <Card key={type.name} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{type.name}</h4>
                            <Badge variant="outline">{type.kind}</Badge>
                          </div>
                          {type.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {type.description}
                            </p>
                          )}
                          {type.fields && type.fields.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Fields:</div>
                              {type.fields.slice(0, 3).map((field) => (
                                <div key={field.name} className="text-xs">
                                  <span className="font-medium">{field.name}</span>
                                  <span className="text-muted-foreground">: {field.type.name || field.type.kind}</span>
                                </div>
                              ))}
                              {type.fields.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{type.fields.length - 3} more
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="full-schema">
                      <AccordionTrigger>View Full Schema</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                          <code>{JSON.stringify(schema, null, 2)}</code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No schema loaded yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the database icon next to your endpoint to introspect the schema.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}