'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, FileText, Minimize2, Maximize2, Zap } from 'lucide-react'

export default function JsonMinifierTool() {
  const [inputJson, setInputJson] = useState('')
  const [outputJson, setOutputJson] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [minifiedSize, setMinifiedSize] = useState(0)
  const [compressionRatio, setCompressionRatio] = useState(0)
  const [format, setFormat] = useState<'minified' | 'formatted'>('minified')
  const [error, setError] = useState('')

  const processJson = useCallback(() => {
    if (!inputJson.trim()) {
      setError('Please enter JSON data to process')
      return
    }

    try {
      const jsonData = JSON.parse(inputJson)
      const originalJsonString = JSON.stringify(jsonData, null, 2)
      const minifiedJsonString = JSON.stringify(jsonData)
      
      setOriginalSize(originalJsonString.length)
      setMinifiedSize(minifiedJsonString.length)
      setCompressionRatio(((originalJsonString.length - minifiedJsonString.length) / originalJsonString.length) * 100)
      
      setOutputJson(format === 'minified' ? minifiedJsonString : originalJsonString)
      setError('')
    } catch (parseError) {
      setError(`Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
      setOutputJson('')
    }
  }, [inputJson, format])

  const handleCopy = async () => {
    if (outputJson) {
      await navigator.clipboard.writeText(outputJson)
    }
  }

  const handleDownload = () => {
    if (outputJson) {
      const blob = new Blob([outputJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = format === 'minified' ? 'minified.json' : 'formatted.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputJson(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInputJson('')
    setOutputJson('')
    setOriginalSize(0)
    setMinifiedSize(0)
    setCompressionRatio(0)
    setError('')
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSampleJson = () => {
    return `{
  "user": {
    "id": 12345,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "age": 30,
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "phoneNumbers": [
        {
          "type": "home",
          "number": "+1-555-123-4567"
        },
        {
          "type": "work",
          "number": "+1-555-987-6543"
        }
      ],
      "preferences": {
        "theme": "dark",
        "language": "en",
        "notifications": {
          "email": true,
          "push": false,
          "sms": true
        }
      }
    },
    "settings": {
      "privacy": "public",
      "twoFactorEnabled": true,
      "lastLogin": "2024-01-15T10:30:00Z",
      "accountCreated": "2023-06-01T00:00:00Z",
      "subscription": {
        "plan": "premium",
        "status": "active",
        "renewalDate": "2024-06-01T00:00:00Z"
      }
    }
  },
  "metadata": {
    "version": "1.0.0",
    "apiVersion": "v2",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_1234567890abcdef"
  }
}`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            JSON Minifier & Formatter
          </CardTitle>
          <CardDescription>
            Minify JSON to reduce file size or format it for better readability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input JSON</label>
                <Textarea
                  placeholder="Enter JSON data to minify or format..."
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setInputJson(getSampleJson())}>
                  Load Sample
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload JSON
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Options</label>
                <Select value={format} onValueChange={(value: 'minified' | 'formatted') => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minified">
                      <div className="flex items-center gap-2">
                        <Minimize2 className="h-4 w-4" />
                        Minified
                      </div>
                    </SelectItem>
                    <SelectItem value="formatted">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4" />
                        Formatted
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={processJson} disabled={!inputJson.trim()} className="w-full">
                {format === 'minified' ? (
                  <>
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Minify JSON
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Format JSON
                  </>
                )}
              </Button>

              {outputJson && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Output JSON</label>
                  <Textarea
                    value={outputJson}
                    readOnly
                    rows={8}
                    className="font-mono text-sm resize-none"
                  />
                </div>
              )}

              {outputJson && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {originalSize > 0 && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-3">Size Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatBytes(originalSize)}</div>
                  <div className="text-sm text-muted-foreground">Original Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatBytes(minifiedSize)}</div>
                  <div className="text-sm text-muted-foreground">Minified Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{compressionRatio.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Space Saved</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${100 - compressionRatio}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>Compression: {compressionRatio.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Tabs defaultValue="benefits" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="benefits" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Benefits of JSON Minification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-green-600">Performance</div>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Faster file loading</li>
                        <li>• Reduced bandwidth usage</li>
                        <li>• Quicker API responses</li>
                        <li>• Improved cache efficiency</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">Storage</div>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Smaller file sizes</li>
                        <li>• Reduced storage costs</li>
                        <li>• Efficient database storage</li>
                        <li>• Better backup performance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="use-cases" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Common Use Cases</h4>
                  <div className="space-y-3">
                    <div className="p-2 bg-background rounded">
                      <div className="font-medium">Production APIs</div>
                      <div className="text-sm text-muted-foreground">
                        Minify JSON responses to reduce payload size and improve API performance
                      </div>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <div className="font-medium">Web Applications</div>
                      <div className="text-sm text-muted-foreground">
                        Use minified JSON for configuration files and data storage
                      </div>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <div className="font-medium">Mobile Apps</div>
                      <div className="text-sm text-muted-foreground">
                        Reduce data transfer sizes for better mobile performance
                      </div>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <div className="font-medium">Development</div>
                      <div className="text-sm text-muted-foreground">
                        Format JSON for debugging and development readability
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Best Practices</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">For Production:</div>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Always minify JSON for APIs</li>
                        <li>• Use gzip compression</li>
                        <li>• Cache minified files</li>
                        <li>• Keep original source files</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium">For Development:</div>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Use formatted JSON for readability</li>
                        <li>• Validate JSON before minifying</li>
                        <li>• Test minified output</li>
                        <li>• Use version control</li>
                      </ul>
                    </div>
                  </div>
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