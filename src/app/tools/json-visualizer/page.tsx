'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Copy, Eye, Code, TreePine, Hash } from 'lucide-react'

interface JsonNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  path: string
  children?: JsonNode[]
  expanded?: boolean
}

export default function JsonVisualizer() {
  const [jsonInput, setJsonInput] = useState('')
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [treeData, setTreeData] = useState<JsonNode[]>([])
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'tree' | 'formatted' | 'raw'>('tree')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [maxDepth, setMaxDepth] = useState(10)

  const parseJson = (jsonString: string): any => {
    try {
      setError('')
      return JSON.parse(jsonString)
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message)
      return null
    }
  }

  const buildTree = (obj: any, path: string = '', depth: number = 0): JsonNode[] => {
    if (depth > maxDepth) return []

    if (Array.isArray(obj)) {
      return obj.map((item, index) => {
        const currentPath = path ? `${path}[${index}]` : `[${index}]`
        const node: JsonNode = {
          key: index.toString(),
          value: item,
          type: Array.isArray(item) ? 'array' : typeof item === 'object' && item !== null ? 'object' : typeof item,
          path: currentPath,
          expanded: depth < 3
        }

        if (node.type === 'object' || node.type === 'array') {
          node.children = buildTree(item, currentPath, depth + 1)
        }

        return node
      })
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).map(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key
        const node: JsonNode = {
          key,
          value,
          type: Array.isArray(value) ? 'array' : typeof value === 'object' && value !== null ? 'object' : typeof value,
          path: currentPath,
          expanded: depth < 3
        }

        if (node.type === 'object' || node.type === 'array') {
          node.children = buildTree(value, currentPath, depth + 1)
        }

        return node
      })
    }

    return []
  }

  const handleParse = () => {
    if (!jsonInput.trim()) return

    const parsed = parseJson(jsonInput)
    if (parsed) {
      setParsedJson(parsed)
      const tree = buildTree(parsed)
      setTreeData(tree)
    }
  }

  const toggleNode = (node: JsonNode) => {
    const updateTree = (nodes: JsonNode[]): JsonNode[] => {
      return nodes.map(n => {
        if (n.path === node.path) {
          return { ...n, expanded: !n.expanded }
        }
        if (n.children) {
          return { ...n, children: updateTree(n.children) }
        }
        return n
      })
    }

    setTreeData(updateTree(treeData))
  }

  const expandAll = () => {
    const expand = (nodes: JsonNode[]): JsonNode[] => {
      return nodes.map(n => ({
        ...n,
        expanded: true,
        children: n.children ? expand(n.children) : undefined
      }))
    }
    setTreeData(expand(treeData))
  }

  const collapseAll = () => {
    const collapse = (nodes: JsonNode[]): JsonNode[] => {
      return nodes.map(n => ({
        ...n,
        expanded: false,
        children: n.children ? collapse(n.children) : undefined
      }))
    }
    setTreeData(collapse(treeData))
  }

  const formatJson = (obj: any, indent: number = 2): string => {
    return JSON.stringify(obj, null, indent)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const downloadJson = () => {
    if (!parsedJson) return

    const formatted = formatJson(parsedJson)
    const blob = new Blob([formatted], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTypeColor = (type: string): string => {
    const colors = {
      object: 'text-purple-600',
      array: 'text-blue-600',
      string: 'text-green-600',
      number: 'text-orange-600',
      boolean: 'text-red-600',
      null: 'text-gray-600'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return <TreePine className="h-3 w-3" />
      case 'array':
        return <Hash className="h-3 w-3" />
      default:
        return <Code className="h-3 w-3" />
    }
  }

  const renderValue = (value: any, type: string): string => {
    switch (type) {
      case 'string':
        return `"${value}"`
      case 'number':
        return value.toString()
      case 'boolean':
        return value ? 'true' : 'false'
      case 'null':
        return 'null'
      default:
        return ''
    }
  }

  const renderTreeNode = (node: JsonNode, depth: number = 0) => {
    const indent = depth * 20

    return (
      <div key={node.path} className="select-none">
        <div 
          className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded cursor-pointer"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => (node.children || []).length > 0 && toggleNode(node)}
        >
          {(node.children || []).length > 0 && (
            <span className="text-gray-400">
              {node.expanded ? '▼' : '▶'}
            </span>
          )}
          {(node.children || []).length === 0 && (
            <span className="w-4" />
          )}
          <span className="text-sm text-gray-500">{node.key}:</span>
          <span className={`text-sm font-medium ${getTypeColor(node.type)}`}>
            {getTypeIcon(node.type)}
            <span className="ml-1">{renderValue(node.value, node.type)}</span>
          </span>
          <Badge variant="outline" className="text-xs">
            {node.type}
          </Badge>
        </div>
        
        {node.expanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const loadExample = () => {
    setJsonInput(`{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212-555-1234"
    },
    {
      "type": "work",
      "number": "646-555-5678"
    }
  ],
  "metadata": {
    "created": "2023-01-15T10:30:00Z",
    "modified": "2023-01-20T14:45:00Z",
    "tags": ["customer", "premium", "active"]
  },
  "orders": null,
  "preferences": {
    "newsletter": true,
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}`)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            JSON Visualizer
          </CardTitle>
          <CardDescription>
            Parse, visualize, and format JSON data with interactive tree view and multiple display modes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="json-input">JSON Data</Label>
              <Textarea
                id="json-input"
                placeholder="Paste your JSON data here..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-48 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleParse} disabled={!jsonInput.trim()}>
                Parse JSON
              </Button>
              <Button onClick={loadExample} variant="outline">
                Load Example
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {parsedJson && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <Label htmlFor="view-mode">View Mode</Label>
                  <Select value={viewMode} onValueChange={(value: 'tree' | 'formatted' | 'raw') => setViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tree">Tree View</SelectItem>
                      <SelectItem value="formatted">Formatted</SelectItem>
                      <SelectItem value="raw">Raw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {viewMode === 'tree' && (
                  <div className="flex gap-2">
                    <Button onClick={expandAll} variant="outline" size="sm">
                      Expand All
                    </Button>
                    <Button onClick={collapseAll} variant="outline" size="sm">
                      Collapse All
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <Button onClick={() => copyToClipboard(formatJson(parsedJson))} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadJson} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* JSON Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    JSON Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewMode === 'tree' && (
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                      {treeData.map(node => renderTreeNode(node))}
                    </div>
                  )}
                  
                  {viewMode === 'formatted' && (
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <pre className={`text-sm font-mono whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatJson(parsedJson)}
                      </pre>
                    </div>
                  )}
                  
                  {viewMode === 'raw' && (
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <pre className={`text-sm font-mono whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {JSON.stringify(parsedJson)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* JSON Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">JSON Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {typeof parsedJson === 'object' ? Object.keys(parsedJson).length : 1}
                      </div>
                      <div className="text-sm text-muted-foreground">Root Keys</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {JSON.stringify(parsedJson).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Characters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatJson(parsedJson).split('\n').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Lines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {maxDepth}
                      </div>
                      <div className="text-sm text-muted-foreground">Max Depth</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}