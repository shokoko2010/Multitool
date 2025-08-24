'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Download, FileText, Plus, Trash2, Upload, FileDown, Code, ExternalLink } from 'lucide-react'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  summary: string
  description: string
  parameters: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    in: 'query' | 'path' | 'body' | 'header'
    required: boolean
    description: string
    example?: any
  }>
  requestBody?: {
    contentType: string
    schema: any
    example?: any
  }
  responses: Array<{
    statusCode: number
    description: string
    schema?: any
    example?: any
  }>
  tags: string[]
}

interface ApiInfo {
  title: string
  description: string
  version: string
  baseUrl: string
  contact?: {
    name: string
    email: string
  }
  license?: {
    name: string
    url: string
  }
}

export default function ApiDocumentationGeneratorTool() {
  const [apiInfo, setApiInfo] = useState<ApiInfo>({
    title: 'My API',
    description: 'API documentation generated with AI',
    version: '1.0.0',
    baseUrl: 'https://api.example.com',
    contact: {
      name: 'API Team',
      email: 'api@example.com'
    }
  })

  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      id: '1',
      method: 'GET',
      path: '/users',
      summary: 'Get all users',
      description: 'Retrieve a list of all users in the system',
      parameters: [
        {
          name: 'limit',
          type: 'number',
          in: 'query',
          required: false,
          description: 'Maximum number of users to return',
          example: 10
        },
        {
          name: 'offset',
          type: 'number',
          in: 'query',
          required: false,
          description: 'Number of users to skip',
          example: 0
        }
      ],
      responses: [
        {
          statusCode: 200,
          description: 'Successful response',
          schema: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                }
              }
            }
          },
          example: {
            users: [
              { id: '1', name: 'John Doe', email: 'john@example.com' },
              { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
            ]
          }
        }
      ],
      tags: ['users']
    }
  ])

  const [outputFormat, setOutputFormat] = useState<'openapi' | 'markdown' | 'html'>('openapi')
  const [generatedDocs, setGeneratedDocs] = useState('')
  const [includeExamples, setIncludeExamples] = useState(true)
  const [includeSchema, setIncludeSchema] = useState(true)

  const generateDocumentation = useCallback(() => {
    let docs = ''

    switch (outputFormat) {
      case 'openapi':
        docs = generateOpenAPIDocs()
        break
      case 'markdown':
        docs = generateMarkdownDocs()
        break
      case 'html':
        docs = generateHtmlDocs()
        break
    }

    setGeneratedDocs(docs)
  }, [apiInfo, endpoints, outputFormat, includeExamples, includeSchema])

  const generateOpenAPIDocs = (): string => {
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: apiInfo.title,
        description: apiInfo.description,
        version: apiInfo.version,
        contact: apiInfo.contact,
        license: apiInfo.license
      },
      servers: [
        {
          url: apiInfo.baseUrl,
          description: 'Production server'
        }
      ],
      paths: {} as any,
      tags: Array.from(new Set(endpoints.flatMap(e => e.tags))).map(tag => ({
        name: tag,
        description: `${tag} operations`
      }))
    }

    // Build paths
    endpoints.forEach(endpoint => {
      if (!openApiSpec.paths[endpoint.path]) {
        openApiSpec.paths[endpoint.path] = {}
      }

      const operation: any = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters.map(param => ({
          name: param.name,
          in: param.in,
          required: param.required,
          description: param.description,
          schema: { type: param.type },
          example: includeExamples ? param.example : undefined
        })).filter(param => param.in !== 'body'),
        responses: {}
      }

      // Add request body if present
      if (endpoint.requestBody) {
        operation.requestBody = {
          content: {
            [endpoint.requestBody.contentType]: {
              schema: endpoint.requestBody.schema,
              example: includeExamples ? endpoint.requestBody.example : undefined
            }
          }
        }
      }

      // Add responses
      endpoint.responses.forEach(response => {
        operation.responses[response.statusCode] = {
          description: response.description,
          content: {
            'application/json': {
              schema: includeSchema ? response.schema : undefined,
              example: includeExamples ? response.example : undefined
            }
          }
        }
      })

      openApiSpec.paths[endpoint.path][endpoint.method.toLowerCase()] = operation
    })

    return JSON.stringify(openApiSpec, null, 2)
  }

  const generateMarkdownDocs = (): string => {
    let md = `# ${apiInfo.title}

${apiInfo.description}

**Version:** ${apiInfo.version}  
**Base URL:** ${apiInfo.baseUrl}

${apiInfo.contact ? `**Contact:** ${apiInfo.contact.name} <${apiInfo.contact.email}>` : ''}

---

## Endpoints

`

    endpoints.forEach(endpoint => {
      md += `### ${endpoint.method} ${endpoint.path}

**Summary:** ${endpoint.summary}

**Description:** ${endpoint.description}

**Tags:** ${endpoint.tags.join(', ')}

`

      if (endpoint.parameters.length > 0) {
        md += `#### Parameters

| Name | Type | In | Required | Description |
|------|------|----|----------|-------------|
`
        endpoint.parameters.forEach(param => {
          md += `| ${param.name} | ${param.type} | ${param.in} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`
        })
        md += '\n'
      }

      if (endpoint.requestBody) {
        md += `#### Request Body

**Content-Type:** ${endpoint.requestBody.contentType}

`
        if (includeSchema && endpoint.requestBody.schema) {
          md += `**Schema:**
\`\`\`json
${JSON.stringify(endpoint.requestBody.schema, null, 2)}
\`\`\n`
        }

        if (includeExamples && endpoint.requestBody.example) {
          md += `**Example:**
\`\`\`json
${JSON.stringify(endpoint.requestBody.example, null, 2)}
\`\`\n`
        }
      }

      md += `#### Responses

`
      endpoint.responses.forEach(response => {
        md += `**${response.statusCode}** - ${response.description}\n`
        
        if (includeSchema && response.schema) {
          md += `\`\`\`json
${JSON.stringify(response.schema, null, 2)}
\`\`\n`
        }

        if (includeExamples && response.example) {
          md += `**Example:**
\`\`\`json
${JSON.stringify(response.example, null, 2)}
\`\`\n`
        }
        md += '\n'
      })

      md += '---\n\n'
    })

    return md
  }

  const generateHtmlDocs = (): string => {
    const markdown = generateMarkdownDocs()
    
    // Simple markdown to HTML conversion for basic formatting
    let html = markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
      .replace(/<p><table>/g, '<table>')
      .replace(/<\/table><\/p>/g, '</table>')
      .replace(/<p>\|/g, '|')
      .replace(/\|<\/p>/g, '|')
      .replace(/<p>```/g, '<pre><code>')
      .replace(/```<\/p>/g, '</code></pre>')

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${apiInfo.title} - API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        .endpoint { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .method { padding: 2px 6px; border-radius: 3px; color: white; font-weight: bold; }
        .get { background: #28a745; }
        .post { background: #007bff; }
        .put { background: #ffc107; color: #212529; }
        .delete { background: #dc3545; }
        .patch { background: #17a2b8; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`
  }

  const addNewEndpoint = () => {
    const newEndpoint: ApiEndpoint = {
      id: Date.now().toString(),
      method: 'GET',
      path: '/new-endpoint',
      summary: 'New Endpoint',
      description: 'Description of the new endpoint',
      parameters: [],
      responses: [
        {
          statusCode: 200,
          description: 'Successful response'
        }
      ],
      tags: ['general']
    }
    setEndpoints([...endpoints, newEndpoint])
  }

  const deleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id))
  }

  const updateEndpoint = (id: string, updates: Partial<ApiEndpoint>) => {
    setEndpoints(endpoints.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const handleCopy = async () => {
    if (generatedDocs) {
      await navigator.clipboard.writeText(generatedDocs)
    }
  }

  const handleDownload = () => {
    if (generatedDocs) {
      const mimeType = outputFormat === 'html' ? 'text/html' : 'text/plain'
      const extension = outputFormat === 'html' ? 'html' : outputFormat === 'markdown' ? 'md' : 'json'
      const blob = new Blob([generatedDocs], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `api-documentation.${extension}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImportOpenAPI = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const openApiSpec = JSON.parse(e.target?.result as string)
          if (openApiSpec.info) {
            setApiInfo({
              title: openApiSpec.info.title || 'Imported API',
              description: openApiSpec.info.description || '',
              version: openApiSpec.info.version || '1.0.0',
              baseUrl: openApiSpec.servers?.[0]?.url || '',
              contact: openApiSpec.info.contact,
              license: openApiSpec.info.license
            })
          }
          // Import endpoints (simplified)
          if (openApiSpec.paths) {
            const importedEndpoints: ApiEndpoint[] = []
            Object.entries(openApiSpec.paths).forEach(([path, methods]: [string, any]) => {
              Object.entries(methods).forEach(([method, operation]: [string, any]) => {
                if (operation.summary) {
                  importedEndpoints.push({
                    id: Date.now().toString() + Math.random(),
                    method: method.toUpperCase() as any,
                    path,
                    summary: operation.summary,
                    description: operation.description || '',
                    parameters: operation.parameters || [],
                    responses: Object.entries(operation.responses || {}).map(([statusCode, response]: [string, any]) => ({
                      statusCode: parseInt(statusCode),
                      description: response.description || '',
                      schema: response.content?.['application/json']?.schema,
                      example: response.content?.['application/json']?.example
                    })),
                    tags: operation.tags || []
                  })
                }
              })
            })
            setEndpoints(importedEndpoints)
          }
        } catch (error) {
          console.error('Error importing OpenAPI spec:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const getMethodColor = (method: string): string => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-cyan-100 text-cyan-800'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            API Documentation Generator
          </CardTitle>
          <CardDescription>
            Generate professional API documentation in OpenAPI, Markdown, or HTML format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">API Info</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">API Title</Label>
                  <Input
                    id="title"
                    value={apiInfo.title}
                    onChange={(e) => setApiInfo({ ...apiInfo, title: e.target.value })}
                    placeholder="My API"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={apiInfo.version}
                    onChange={(e) => setApiInfo({ ...apiInfo, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={apiInfo.baseUrl}
                    onChange={(e) => setApiInfo({ ...apiInfo, baseUrl: e.target.value })}
                    placeholder="https://api.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact Name</Label>
                  <Input
                    id="contact-name"
                    value={apiInfo.contact?.name || ''}
                    onChange={(e) => setApiInfo({
                      ...apiInfo,
                      contact: { ...apiInfo.contact!, name: e.target.value }
                    })}
                    placeholder="API Team"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={apiInfo.description}
                  onChange={(e) => setApiInfo({ ...apiInfo, description: e.target.value })}
                  rows={3}
                  placeholder="API description..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={apiInfo.contact?.email || ''}
                    onChange={(e) => setApiInfo({
                      ...apiInfo,
                      contact: { ...apiInfo.contact!, email: e.target.value }
                    })}
                    placeholder="api@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license-name">License Name</Label>
                  <Input
                    id="license-name"
                    value={apiInfo.license?.name || ''}
                    onChange={(e) => setApiInfo({
                      ...apiInfo,
                      license: { ...apiInfo.license!, name: e.target.value }
                    })}
                    placeholder="MIT"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">API Endpoints</h3>
                <div className="flex gap-2">
                  <Button onClick={addNewEndpoint}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Endpoint
                  </Button>
                  <input
                    type="file"
                    accept=".json,.yaml"
                    onChange={handleImportOpenAPI}
                    className="hidden"
                    id="import-openapi"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('import-openapi')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import OpenAPI
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {endpoints.map((endpoint) => (
                  <Card key={endpoint.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {endpoint.path}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEndpoint(endpoint.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Summary</Label>
                        <Input
                          value={endpoint.summary}
                          onChange={(e) => updateEndpoint(endpoint.id, { summary: e.target.value })}
                          placeholder="Endpoint summary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={endpoint.description}
                          onChange={(e) => updateEndpoint(endpoint.id, { description: e.target.value })}
                          placeholder="Endpoint description"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        value={endpoint.tags.join(', ')}
                        onChange={(e) => updateEndpoint(endpoint.id, { tags: e.target.value.split(',').map(t => t.trim()) })}
                        placeholder="users, auth, general"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Parameters</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newParam = {
                              name: 'param',
                              type: 'string' as const,
                              in: 'query' as const,
                              required: false,
                              description: 'Parameter description'
                            }
                            updateEndpoint(endpoint.id, {
                              parameters: [...endpoint.parameters, newParam]
                            })
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Parameter
                        </Button>
                      </div>
                      {endpoint.parameters.length > 0 && (
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, index) => (
                            <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-2 bg-muted rounded">
                              <Input
                                value={param.name}
                                onChange={(e) => {
                                  const newParams = [...endpoint.parameters]
                                  newParams[index] = { ...param, name: e.target.value }
                                  updateEndpoint(endpoint.id, { parameters: newParams })
                                }}
                                placeholder="Name"
                              />
                              <Select
                                value={param.type}
                                onValueChange={(value: any) => {
                                  const newParams = [...endpoint.parameters]
                                  newParams[index] = { ...param, type: value }
                                  updateEndpoint(endpoint.id, { parameters: newParams })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="object">Object</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={param.in}
                                onValueChange={(value: any) => {
                                  const newParams = [...endpoint.parameters]
                                  newParams[index] = { ...param, in: value }
                                  updateEndpoint(endpoint.id, { parameters: newParams })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="query">Query</SelectItem>
                                  <SelectItem value="path">Path</SelectItem>
                                  <SelectItem value="body">Body</SelectItem>
                                  <SelectItem value="header">Header</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`required-${endpoint.id}-${index}`}
                                  checked={param.required}
                                  onCheckedChange={(checked) => {
                                    const newParams = [...endpoint.parameters]
                                    newParams[index] = { ...param, required: checked as boolean }
                                    updateEndpoint(endpoint.id, { parameters: newParams })
                                  }}
                                />
                                <Label htmlFor={`required-${endpoint.id}-${index}`} className="text-sm">
                                  Required
                                </Label>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newParams = endpoint.parameters.filter((_, i) => i !== index)
                                  updateEndpoint(endpoint.id, { parameters: newParams })
                                }}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select value={outputFormat} onValueChange={(value: 'openapi' | 'markdown' | 'html') => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openapi">OpenAPI/Swagger</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-examples"
                      checked={includeExamples}
                      onCheckedChange={(checked) => setIncludeExamples(checked as boolean)}
                    />
                    <Label htmlFor="include-examples">Include Examples</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-schema"
                      checked={includeSchema}
                      onCheckedChange={(checked) => setIncludeSchema(checked as boolean)}
                    />
                    <Label htmlFor="include-schema">Include Schema</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateDocumentation} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Documentation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {generatedDocs ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Generated Documentation</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Textarea
                      value={generatedDocs}
                      readOnly
                      rows={20}
                      className="font-mono text-sm resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Documentation Generated</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your API documentation to see the preview here
                  </p>
                  <Button onClick={generateDocumentation}>
                    Generate Documentation
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}