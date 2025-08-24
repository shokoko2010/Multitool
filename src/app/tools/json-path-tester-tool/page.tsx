'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Search, AlertCircle, CheckCircle } from 'lucide-react'

interface PathResult {
  path: string
  value: any
  type: string
  found: boolean
}

interface PathExample {
  description: string
  path: string
  explanation: string
}

export default function JsonPathTesterTool() {
  const [jsonInput, setJsonInput] = useState('')
  const [pathInput, setPathInput] = useState('')
  const [results, setResults] = useState<PathResult[]>([])
  const [error, setError] = useState('')
  const [isValidJson, setIsValidJson] = useState(false)

  const testJsonPath = useCallback(() => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data')
      return
    }

    if (!pathInput.trim()) {
      setError('Please enter a JSON path')
      return
    }

    try {
      const jsonData = JSON.parse(jsonInput)
      setIsValidJson(true)
      setError('')

      const pathResults = evaluateJsonPath(jsonData, pathInput.trim())
      setResults(pathResults)
    } catch (parseError) {
      setError(`Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
      setIsValidJson(false)
      setResults([])
    }
  }, [jsonInput, pathInput])

  const evaluateJsonPath = (data: any, path: string): PathResult[] => {
    const results: PathResult[] = []
    
    try {
      // Simple JSONPath implementation
      const normalizedPath = path.replace(/^\$\.?/, '') // Remove $ prefix
      const pathParts = normalizedPath.split('.').filter(part => part.length > 0)
      
      evaluatePathRecursive(data, pathParts, [], results)
    } catch (evalError) {
      results.push({
        path,
        value: null,
        type: 'error',
        found: false
      })
    }

    return results
  }

  const evaluatePathRecursive = (
    current: any, 
    remainingParts: string[], 
    currentPath: string[], 
    results: PathResult[]
  ) => {
    if (remainingParts.length === 0) {
      // Found the target
      results.push({
        path: currentPath.join('.'),
        value: current,
        type: getJsonType(current),
        found: true
      })
      return
    }

    const currentPart = remainingParts[0]
    const newPath = [...currentPath, currentPart]
    const remaining = remainingParts.slice(1)

    // Handle array indexing (e.g., items[0])
    const arrayMatch = currentPart.match(/^([^\[]+)\[(\d+)\]$/)
    if (arrayMatch) {
      const [, propName, indexStr] = arrayMatch
      const index = parseInt(indexStr, 10)
      
      if (current && typeof current === 'object' && propName in current) {
        const arrayValue = current[propName]
        if (Array.isArray(arrayValue) && index >= 0 && index < arrayValue.length) {
          evaluatePathRecursive(arrayValue[index], remaining, newPath, results)
        } else {
          results.push({
            path: newPath.join('.'),
            value: null,
            type: 'error',
            found: false
          })
        }
      } else {
        results.push({
          path: newPath.join('.'),
          value: null,
          type: 'error',
          found: false
        })
      }
      return
    }

    // Handle wildcard (*)
    if (currentPart === '*') {
      if (current && typeof current === 'object') {
        if (Array.isArray(current)) {
          current.forEach((item, index) => {
            evaluatePathRecursive(item, remaining, [...newPath, `[${index}]`], results)
          })
        } else {
          Object.keys(current).forEach(key => {
            evaluatePathRecursive(current[key], remaining, [...newPath, key], results)
          })
        }
      } else {
        results.push({
          path: newPath.join('.'),
          value: null,
          type: 'error',
          found: false
        })
      }
      return
    }

    // Handle regular property access
    if (current && typeof current === 'object') {
      if (currentPart in current) {
        evaluatePathRecursive(current[currentPart], remaining, newPath, results)
      } else {
        results.push({
          path: newPath.join('.'),
          value: null,
          type: 'error',
          found: false
        })
      }
    } else {
      results.push({
        path: newPath.join('.'),
        value: null,
        type: 'error',
        found: false
      })
    }
  }

  const getJsonType = (value: any): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setJsonInput('')
    setPathInput('')
    setResults([])
    setError('')
    setIsValidJson(false)
  }

  const getSampleJson = () => {
    return `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      {
        "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  },
  "expensive": 10
}`
  }

  const pathExamples: PathExample[] = [
    {
      description: "Get all books",
      path: "$.store.book[*]",
      explanation: "Returns all book objects in the store"
    },
    {
      description: "Get book titles",
      path: "$.store.book[*].title",
      explanation: "Returns all book titles"
    },
    {
      description: "Get books under $10",
      path: "$.store.book[?(@.price < 10)]",
      explanation: "Returns books with price less than 10"
    },
    {
      description: "Get first book",
      path: "$.store.book[0]",
      explanation: "Returns the first book object"
    },
    {
      description: "Get store properties",
      path: "$.store.*",
      explanation: "Returns all properties of the store object"
    }
  ]

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            JSON Path Tester
          </CardTitle>
          <CardDescription>
            Test JSONPath expressions to query and extract data from JSON documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">JSON Data</Label>
                <Textarea
                  id="json-input"
                  placeholder="Enter JSON data to query..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setJsonInput(getSampleJson())}>
                  Load Sample
                </Button>
                <Button variant="outline" onClick={() => handleCopy(jsonInput)} disabled={!jsonInput}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => handleDownload(jsonInput, 'data.json')} disabled={!jsonInput}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="path-input">JSONPath Expression</Label>
                <Input
                  id="path-input"
                  placeholder="Enter JSONPath (e.g., $.store.book[*].title)"
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                />
              </div>
              
              <Button onClick={testJsonPath} disabled={!jsonInput.trim() || !pathInput.trim()} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Test Path
              </Button>

              <div className="space-y-2">
                <Label>Quick Examples</Label>
                <div className="space-y-1">
                  {pathExamples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setPathInput(example.path)}
                      className="w-full justify-start text-left h-auto p-2"
                    >
                      <div className="text-xs">
                        <div className="font-medium">{example.description}</div>
                        <div className="text-muted-foreground font-mono">{example.path}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Results ({results.filter(r => r.found).length} found, {results.filter(r => !r.found).length} not found)
                </h3>
                <Button variant="outline" size="sm" onClick={() => handleCopy(JSON.stringify(results, null, 2))}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Results
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.found 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {result.found ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          Path: {result.path || '$'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Type: {result.type}
                        </div>
                        {result.found ? (
                          <div className="font-mono text-sm bg-background p-2 rounded">
                            {typeof result.value === 'object' 
                              ? JSON.stringify(result.value, null, 2)
                              : String(result.value)
                            }
                          </div>
                        ) : (
                          <div className="text-red-700 text-sm">Path not found</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="syntax" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="syntax">JSONPath Syntax</TabsTrigger>
                <TabsTrigger value="examples">More Examples</TabsTrigger>
                <TabsTrigger value="about">About JSONPath</TabsTrigger>
              </TabsList>
              
              <TabsContent value="syntax" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">JSONPath Syntax Reference</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Basic Paths:</div>
                      <ul className="text-muted-foreground space-y-1">
                        <li><code className="bg-background px-1 rounded">$</code> - Root object</li>
                        <li><code className="bg-background px-1 rounded">.property</code> - Child property</li>
                        <li><code className="bg-background px-1 rounded">['property']</code> - Property with special chars</li>
                        <li><code className="bg-background px-1 rounded">*</code> - Wildcard (all properties/items)</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium">Array Operations:</div>
                      <ul className="text-muted-foreground space-y-1">
                        <li><code className="bg-background px-1 rounded">[0]</code> - First item</li>
                        <li><code className="bg-background px-1 rounded">[-1]</code> - Last item</li>
                        <li><code className="bg-background px-1 rounded">[0:3]</code> - Slice (items 0-2)</li>
                        <li><code className="bg-background px-1 rounded">[?(@.price {'>'} 10)]</code> - Filter expression</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Advanced Examples</h4>
                  <div className="space-y-3">
                    {[
                      {
                        path: "$.store.book[?(@.category == 'fiction')].title",
                        desc: "Get titles of all fiction books"
                      },
                      {
                        path: "$.store.book[?(@.price < 10)]",
                        desc: "Get books cheaper than $10"
                      },
                      {
                        path: "$.store.*",
                        desc: "Get all properties of store"
                      },
                      {
                        path: "$..book",
                        desc: "Get all book objects (recursive search)"
                      },
                      {
                        path: "$.store.book.length()",
                        desc: "Get number of books"
                      }
                    ].map((example, index) => (
                      <div key={index} className="p-2 bg-background rounded">
                        <div className="font-mono text-sm">{example.path}</div>
                        <div className="text-xs text-muted-foreground">{example.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">About JSONPath</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    JSONPath is a query language for JSON that allows you to extract data from JSON 
                    documents. It's similar to XPath for XML and provides a powerful way to navigate 
                    and filter JSON structures.
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    This tool implements a subset of JSONPath functionality, supporting basic path 
                    navigation, array indexing, wildcards, and simple property access. It's useful 
                    for testing and debugging JSONPath expressions before using them in applications.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JSONPath expressions start with $ (root) and use dot notation or bracket notation 
                    to navigate through the JSON structure. The results show all matching values found 
                    at the specified path.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-4">
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}