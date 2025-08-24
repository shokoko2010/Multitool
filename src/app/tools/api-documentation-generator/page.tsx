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
  FileText, 
  Download, 
  Copy, 
  Plus, 
  Trash2, 
  Code,
  BookOpen,
  Server,
  Database,
  Shield
} from 'lucide-react'

interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  path: string
  summary: string
  description: string
  parameters: Array<{
    name: string
    in: 'query' | 'path' | 'header' | 'body'
    required: boolean
    type: string
    description: string
    example?: string
  }>
  requestBody?: {
    contentType: string
    schema: string
    example: string
  }
  responses: Array<{
    code: number
    description: string
    contentType?: string
    schema?: string
    example?: string
  }>
  tags: string[]
  security: Array<{
    type: string
    scheme: string
    description?: string
  }>
}

interface APIDocumentation {
  info: {
    title: string
    version: string
    description: string
    contact?: {
      name: string
      email: string
      url: string
    }
    license?: {
      name: string
      url: string
    }
  }
  servers: Array<{
    url: string
    description: string
  }>
  endpoints: APIEndpoint[]
  components: {
    schemas: Array<{
      name: string
      type: string
      properties: Array<{
        name: string
        type: string
        description?: string
        required?: boolean
        example?: string
      }>
    }>
  }
  securitySchemes: Array<{
    name: string
    type: string
    description: string
    scheme?: string
    bearerFormat?: string
  }>
}

export default function APIDocumentationGenerator() {
  const [documentation, setDocumentation] = useState<APIDocumentation>({
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation for my application'
    },
    servers: [
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    endpoints: [],
    components: {
      schemas: []
    },
    securitySchemes: [
      {
        name: 'BearerAuth',
        type: 'http',
        description: 'JWT Token authentication',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    ]
  })

  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [activeTab, setActiveTab] = useState('endpoints')

  const addEndpoint = () => {
    const newEndpoint: APIEndpoint = {
      id: Math.random().toString(36).substring(7),
      method: 'GET',
      path: '/endpoint',
      summary: 'New Endpoint',
      description: 'Description of the new endpoint',
      parameters: [],
      responses: [
        {
          code: 200,
          description: 'Success response'
        }
      ],
      tags: [],
      security: []
    }
    
    setDocumentation(prev => ({
      ...prev,
      endpoints: [...prev.endpoints, newEndpoint]
    }))
    setSelectedEndpoint(newEndpoint)
  }

  const updateEndpoint = (endpointId: string, updates: Partial<APIEndpoint>) => {
    setDocumentation(prev => ({
      ...prev,
      endpoints: prev.endpoints.map(endpoint => 
        endpoint.id === endpointId ? { ...endpoint, ...updates } : endpoint
      )
    }))
    
    if (selectedEndpoint?.id === endpointId) {
      setSelectedEndpoint(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteEndpoint = (endpointId: string) => {
    setDocumentation(prev => ({
      ...prev,
      endpoints: prev.endpoints.filter(endpoint => endpoint.id !== endpointId)
    }))
    
    if (selectedEndpoint?.id === endpointId) {
      setSelectedEndpoint(null)
    }
  }

  const generateOpenAPISpec = () => {
    const openAPISpec = {
      openapi: '3.0.0',
      info: documentation.info,
      servers: documentation.servers,
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {}
      }
    }

    // Convert endpoints to OpenAPI paths
    documentation.endpoints.forEach(endpoint => {
      if (!openAPISpec.paths[endpoint.path]) {
        openAPISpec.paths[endpoint.path] = {}
      }
      
      openAPISpec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters.map(param => ({
          name: param.name,
          in: param.in,
          required: param.required,
          schema: { type: param.type },
          description: param.description
        })),
        responses: endpoint.responses.reduce((acc, response) => {
          acc[response.code] = {
            description: response.description,
            content: response.contentType ? {
              [response.contentType]: {
                schema: response.schema ? JSON.parse(response.schema) : undefined,
                example: response.example ? JSON.parse(response.example) : undefined
              }
            } : undefined
          }
          return acc
        }, {} as any)
      }
    })

    // Convert schemas
    documentation.components.schemas.forEach(schema => {
      openAPISpec.components.schemas[schema.name] = {
        type: schema.type,
        properties: schema.properties.reduce((acc, prop) => {
          acc[prop.name] = {
            type: prop.type,
            description: prop.description
          }
          return acc
        }, {} as any)
      }
    })

    // Convert security schemes
    documentation.securitySchemes.forEach(scheme => {
      openAPISpec.components.securitySchemes[scheme.name] = {
        type: scheme.type,
        description: scheme.description,
        scheme: scheme.scheme,
        bearerFormat: scheme.bearerFormat
      }
    })

    return JSON.stringify(openAPISpec, null, 2)
  }

  const generateMarkdownDocs = () => {
    let markdown = `# ${documentation.info.title}\n\n`
    markdown += `**Version:** ${documentation.info.version}\n\n`
    markdown += `${documentation.info.description}\n\n`

    if (documentation.info.contact) {
      markdown += `## Contact\n\n`
      markdown += `- **Name:** ${documentation.info.contact.name}\n`
      markdown += `- **Email:** ${documentation.info.contact.email}\n`
      markdown += `- **URL:** ${documentation.info.contact.url}\n\n`
    }

    markdown += `## Servers\n\n`
    documentation.servers.forEach(server => {
      markdown += `- **${server.description}:** \`${server.url}\`\n`
    })
    markdown += '\n'

    markdown += `## Authentication\n\n`
    documentation.securitySchemes.forEach(scheme => {
      markdown += `### ${scheme.name}\n\n`
      markdown += `${scheme.description}\n\n`
      if (scheme.scheme) {
        markdown += `**Scheme:** ${scheme.scheme}\n\n`
      }
      if (scheme.bearerFormat) {
        markdown += `**Bearer Format:** ${scheme.bearerFormat}\n\n`
      }
    })

    markdown += `## Endpoints\n\n`
    
    // Group endpoints by tags
    const endpointsByTag: Record<string, APIEndpoint[]> = {}
    documentation.endpoints.forEach(endpoint => {
      const primaryTag = endpoint.tags[0] || 'default'
      if (!endpointsByTag[primaryTag]) {
        endpointsByTag[primaryTag] = []
      }
      endpointsByTag[primaryTag].push(endpoint)
    })

    Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
      markdown += `### ${tag.charAt(0).toUpperCase() + tag.slice(1)}\n\n`
      
      endpoints.forEach(endpoint => {
        markdown += `#### ${endpoint.method} ${endpoint.path}\n\n`
        markdown += `${endpoint.description}\n\n`
        
        if (endpoint.parameters.length > 0) {
          markdown += `**Parameters:**\n\n`
          endpoint.parameters.forEach(param => {
            markdown += `- \`${param.name}\` (${param.in}, ${param.type}${param.required ? ', required' : ''}): ${param.description}\n`
          })
          markdown += '\n'
        }
        
        if (endpoint.requestBody) {
          markdown += `**Request Body:**\n\n`
          markdown += `\`\`\`json\n${endpoint.requestBody.example}\n\`\`\`\n\n`
        }
        
        markdown += `**Responses:**\n\n`
        endpoint.responses.forEach(response => {
          markdown += `- **${response.code}:** ${response.description}\n`
          if (response.example) {
            markdown += `  \`\`\`json\n${response.example}\n  \`\`\`\n`
          }
        })
        markdown += '\n'
      })
    })

    return markdown
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadDocumentation = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'PATCH': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Documentation Generator</h1>
        <p className="text-muted-foreground">
          Create professional API documentation with OpenAPI 3.0 and Markdown support
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure your API information and endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">API Title</Label>
              <Input
                id="title"
                value={documentation.info.title}
                onChange={(e) => setDocumentation(prev => ({
                  ...prev,
                  info: { ...prev.info, title: e.target.value }
                }))}
                placeholder="My API"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={documentation.info.version}
                onChange={(e) => setDocumentation(prev => ({
                  ...prev,
                  info: { ...prev.info, version: e.target.value }
                }))}
                placeholder="1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={documentation.info.description}
                onChange={(e) => setDocumentation(prev => ({
                  ...prev,
                  info: { ...prev.info, description: e.target.value }
                }))}
                placeholder="API documentation for my application"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Endpoints</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {documentation.endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className={`p-2 border rounded cursor-pointer hover:bg-muted/50 ${
                      selectedEndpoint?.id === endpoint.id ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedEndpoint(endpoint)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm font-medium">{endpoint.path}</span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteEndpoint(endpoint.id)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {endpoint.summary}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={addEndpoint} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Endpoint
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Endpoint Editor</CardTitle>
            <CardDescription>
              {selectedEndpoint ? 
                `Editing: ${selectedEndpoint.method} ${selectedEndpoint.path}` : 
                'Select an endpoint to edit'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEndpoint ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>HTTP Method</Label>
                    <Select 
                      value={selectedEndpoint.method} 
                      onValueChange={(value: any) => updateEndpoint(selectedEndpoint.id, { method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="HEAD">HEAD</SelectItem>
                        <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Path</Label>
                    <Input
                      value={selectedEndpoint.path}
                      onChange={(e) => updateEndpoint(selectedEndpoint.id, { path: e.target.value })}
                      placeholder="/users/{id}"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Input
                      value={selectedEndpoint.summary}
                      onChange={(e) => updateEndpoint(selectedEndpoint.id, { summary: e.target.value })}
                      placeholder="Get user by ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={selectedEndpoint.tags.join(', ')}
                      onChange={(e) => updateEndpoint(selectedEndpoint.id, { 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      placeholder="users, authentication"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedEndpoint.description}
                    onChange={(e) => updateEndpoint(selectedEndpoint.id, { description: e.target.value })}
                    placeholder="Detailed description of what this endpoint does"
                    rows={3}
                  />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="parameters">
                    <AccordionTrigger>Parameters</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {selectedEndpoint.parameters.map((param, index) => (
                          <div key={index} className="grid gap-2 md:grid-cols-4 p-2 border rounded">
                            <Input
                              value={param.name}
                              onChange={(e) => {
                                const newParams = [...selectedEndpoint.parameters]
                                newParams[index] = { ...newParams[index], name: e.target.value }
                                updateEndpoint(selectedEndpoint.id, { parameters: newParams })
                              }}
                              placeholder="Parameter name"
                            />
                            <Select
                              value={param.in}
                              onValueChange={(value: any) => {
                                const newParams = [...selectedEndpoint.parameters]
                                newParams[index] = { ...newParams[index], in: value }
                                updateEndpoint(selectedEndpoint.id, { parameters: newParams })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="query">Query</SelectItem>
                                <SelectItem value="path">Path</SelectItem>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="body">Body</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={param.type}
                              onValueChange={(value) => {
                                const newParams = [...selectedEndpoint.parameters]
                                newParams[index] = { ...newParams[index], type: value }
                                updateEndpoint(selectedEndpoint.id, { parameters: newParams })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="integer">Integer</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                                <SelectItem value="object">Object</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() => {
                                const newParams = selectedEndpoint.parameters.filter((_, i) => i !== index)
                                updateEndpoint(selectedEndpoint.id, { parameters: newParams })
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newParam = {
                              name: '',
                              in: 'query' as const,
                              required: false,
                              type: 'string',
                              description: ''
                            }
                            updateEndpoint(selectedEndpoint.id, { 
                              parameters: [...selectedEndpoint.parameters, newParam] 
                            })
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Add Parameter
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="responses">
                    <AccordionTrigger>Responses</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {selectedEndpoint.responses.map((response, index) => (
                          <div key={index} className="grid gap-2 md:grid-cols-3 p-2 border rounded">
                            <Input
                              value={response.code.toString()}
                              onChange={(e) => {
                                const newResponses = [...selectedEndpoint.responses]
                                newResponses[index] = { ...newResponses[index], code: parseInt(e.target.value) }
                                updateEndpoint(selectedEndpoint.id, { responses: newResponses })
                              }}
                              placeholder="200"
                              type="number"
                            />
                            <Input
                              value={response.description}
                              onChange={(e) => {
                                const newResponses = [...selectedEndpoint.responses]
                                newResponses[index] = { ...newResponses[index], description: e.target.value }
                                updateEndpoint(selectedEndpoint.id, { responses: newResponses })
                              }}
                              placeholder="Success response"
                            />
                            <Button
                              onClick={() => {
                                const newResponses = selectedEndpoint.responses.filter((_, i) => i !== index)
                                updateEndpoint(selectedEndpoint.id, { responses: newResponses })
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newResponse = {
                              code: 200,
                              description: 'Success response'
                            }
                            updateEndpoint(selectedEndpoint.id, { 
                              responses: [...selectedEndpoint.responses, newResponse] 
                            })
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Add Response
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select an endpoint to edit its details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Generate Documentation</CardTitle>
          <CardDescription>
            Export your API documentation in different formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="openapi">OpenAPI</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-semibold">Interactive Docs</h4>
                  <p className="text-sm text-muted-foreground">
                    Preview your API documentation
                  </p>
                </div>
                <div className="text-center">
                  <Server className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-semibold">OpenAPI 3.0</h4>
                  <p className="text-sm text-muted-foreground">
                    Standard API specification format
                  </p>
                </div>
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-semibold">Markdown</h4>
                  <p className="text-sm text-muted-foreground">
                    Human-readable documentation
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="openapi" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button onClick={() => copyToClipboard(generateOpenAPISpec())} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy OpenAPI
                </Button>
                <Button onClick={() => downloadDocumentation(generateOpenAPISpec(), 'openapi.json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download OpenAPI
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                <code>{generateOpenAPISpec()}</code>
              </pre>
            </TabsContent>

            <TabsContent value="markdown" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button onClick={() => copyToClipboard(generateMarkdownDocs())} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Markdown
                </Button>
                <Button onClick={() => downloadDocumentation(generateMarkdownDocs(), 'API_Documentation.md')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Markdown
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                <code>{generateMarkdownDocs()}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}