'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Download, Upload, Minimize, Maximize, RefreshCw } from 'lucide-react'

interface CSSMinificationResult {
  original: string
  minified: string
  originalSize: number
  minifiedSize: number
  compressionRatio: number
  isValid: boolean
  error?: string
  stats?: {
    rules: number
    selectors: number
    properties: number
    comments: number
    whitespace: number
  }
}

interface MinificationHistory {
  id: string
  originalSize: number
  minifiedSize: number
  compressionRatio: number
  timestamp: Date
}

export default function CSSMinifier() {
  const [inputCSS, setInputCSS] = useState<string>('')
  const [minifiedCSS, setMinifiedCSS] = useState<string>('')
  const [result, setResult] = useState<CSSMinificationResult | null>(null)
  const [minificationHistory, setMinificationHistory] = useState<MinificationHistory[]>([])

  const minifyCSS = (css: string): CSSMinificationResult => {
    if (!css.trim()) {
      return {
        original: css,
        minified: '',
        originalSize: 0,
        minifiedSize: 0,
        compressionRatio: 0,
        isValid: false,
        error: 'Please enter CSS code'
      }
    }

    try {
      let minified = css
      const stats = {
        rules: 0,
        selectors: 0,
        properties: 0,
        comments: 0,
        whitespace: 0
      }

      // Count original stats
      const lines = css.split('\n')
      let inComment = false
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.includes('/*') && line.includes('*/')) {
          stats.comments++
        } else if (line.includes('/*')) {
          inComment = true
          stats.comments++
        } else if (line.includes('*/')) {
          inComment = false
          stats.comments++
        } else if (inComment) {
          stats.comments++
        } else if (line && !line.startsWith('@') && line.includes('{')) {
          stats.rules++
          // Count selectors (everything before {)
          const selectorPart = line.split('{')[0].trim()
          stats.selectors += selectorPart.split(',').length
        } else if (line.includes(':') && !line.startsWith('@')) {
          stats.properties++
        }
        
        // Count whitespace
        stats.whitespace += line.length - line.trim().length
      }

      // Remove comments
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '')
      
      // Remove newlines and tabs
      minified = minified.replace(/\r?\n|\r|\t/g, '')
      
      // Remove multiple spaces
      minified = minified.replace(/\s+/g, ' ')
      
      // Remove spaces around special characters
      minified = minified.replace(/\s*([{}:;,])\s*/g, '$1')
      
      // Remove unnecessary semicolons before closing braces
      minified = minified.replace(/;}/g, '}')
      
      // Remove spaces around !important
      minified = minified.replace(/!important/g, '!important')
      
      // Remove leading/trailing whitespace
      minified = minified.trim()

      const originalSize = new Blob([css]).size
      const minifiedSize = new Blob([minified]).size
      const compressionRatio = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0

      return {
        original: css,
        minified,
        originalSize,
        minifiedSize,
        compressionRatio,
        isValid: true,
        stats
      }
    } catch (error) {
      return {
        original: css,
        minified: '',
        originalSize: 0,
        minifiedSize: 0,
        compressionRatio: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  const processMinification = () => {
    const minificationResult = minifyCSS(inputCSS)
    setResult(minificationResult)
    setMinifiedCSS(minificationResult.minified)

    if (minificationResult.isValid) {
      // Add to history
      const historyItem: MinificationHistory = {
        id: Date.now().toString(),
        originalSize: minificationResult.originalSize,
        minifiedSize: minificationResult.minifiedSize,
        compressionRatio: minificationResult.compressionRatio,
        timestamp: new Date()
      }
      
      setMinificationHistory(prev => [historyItem, ...prev.slice(0, 9)])
    }
  }

  const beautifyCSS = () => {
    if (!minifiedCSS) return

    let beautified = minifiedCSS
    
    // Add newlines after rules
    beautified = beautified.replace(/}/g, '}\n')
    
    // Add newline after opening brace
    beautified = beautified.replace(/{/g, '{\n  ')
    
    // Add newline after properties
    beautified = beautified.replace(/;/g, ';\n  ')
    
    // Remove extra newlines
    beautified = beautified.replace(/\n\s*\n/g, '\n')
    
    // Add proper indentation
    const lines = beautified.split('\n')
    let indented = ''
    let indentLevel = 0
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }
      
      if (trimmed) {
        indented += '  '.repeat(indentLevel) + trimmed + '\n'
      }
      
      if (trimmed.includes('{')) {
        indentLevel++
      }
    }
    
    setInputCSS(indented.trim())
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCSS = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'text/css' || file.name.endsWith('.css'))) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputCSS(content)
      }
      reader.readAsText(file)
    }
  }

  const clearAll = () => {
    setInputCSS('')
    setMinifiedCSS('')
    setResult(null)
  }

  const loadSampleCSS = () => {
    const sample = `/* Sample CSS for demonstration */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
    text-align: center;
    margin-bottom: 30px;
}

.header h1 {
    color: #2c3e50;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 10px;
}

.header p {
    color: #7f8c8d;
    font-size: 1.1rem;
    line-height: 1.6;
}

.button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.button:hover {
    background-color: #2980b9;
}

.button:active {
    transform: translateY(1px);
}

.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
}

.card h2 {
    color: #2c3e50;
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.card p {
    color: #495057;
    line-height: 1.6;
    margin-bottom: 15px;
}

@media (max-width: 768px) {
    .container {
        padding: 15px;
    }
    
    .header h1 {
        font-size: 2rem;
    }
    
    .button {
        padding: 10px 20px;
        font-size: 0.9rem;
    }
}`
    
    setInputCSS(sample)
  }

  useEffect(() => {
    if (inputCSS) {
      processMinification()
    }
  }, [inputCSS])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSS Minifier</h1>
        <p className="text-muted-foreground">Minify CSS code to reduce file size and improve loading performance</p>
      </div>

      <Tabs defaultValue="minifier" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="minifier">Minifier</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="minifier" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Original CSS
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSampleCSS}>
                      Sample
                    </Button>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".css,text/css"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter your CSS code to minify
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputCSS}
                  onChange={(e) => setInputCSS(e.target.value)}
                  placeholder="Enter your CSS code here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                
                {result && result.originalSize > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Size: {formatFileSize(result.originalSize)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Minimize className="h-5 w-5" />
                    Minified CSS
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={beautifyCSS}
                      disabled={!minifiedCSS}
                    >
                      <Maximize className="h-4 w-4 mr-2" />
                      Beautify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(minifiedCSS)}
                      disabled={!minifiedCSS}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCSS(minifiedCSS, 'minified.css')}
                      disabled={!minifiedCSS}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Minified CSS output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={minifiedCSS}
                  readOnly
                  placeholder="Minified CSS will appear here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                
                {result && result.minifiedSize > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Size: {formatFileSize(result.minifiedSize)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Minification Results
                </CardTitle>
                <CardDescription>
                  CSS optimization statistics and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.isValid ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-700">Successfully Minified</span>
                      </div>
                      <Badge variant="outline">
                        {result.compressionRatio.toFixed(1)}% smaller
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{formatFileSize(result.originalSize)}</div>
                        <div className="text-sm text-muted-foreground">Original Size</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{formatFileSize(result.minifiedSize)}</div>
                        <div className="text-sm text-muted-foreground">Minified Size</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {result.originalSize - result.minifiedSize}
                        </div>
                        <div className="text-sm text-muted-foreground">Bytes Saved</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{result.compressionRatio.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Compression</div>
                      </div>
                    </div>

                    {result.stats && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium">CSS Statistics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-xl font-bold">{result.stats.rules}</div>
                              <div className="text-sm text-muted-foreground">Rules</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-xl font-bold">{result.stats.selectors}</div>
                              <div className="text-sm text-muted-foreground">Selectors</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-xl font-bold">{result.stats.properties}</div>
                              <div className="text-sm text-muted-foreground">Properties</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-xl font-bold">{result.stats.comments}</div>
                              <div className="text-sm text-muted-foreground">Comments</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-xl font-bold">{result.stats.whitespace}</div>
                              <div className="text-sm text-muted-foreground">Whitespace</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-center">
                        <div className="font-medium text-blue-800">Performance Impact</div>
                        <div className="text-sm text-blue-600 mt-1">
                          Minifying your CSS can improve page load times by reducing file transfer size.
                          {result.compressionRatio > 20 && (
                            <span className="block mt-1">
                              Excellent compression! This will significantly improve loading performance.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-700">Minification Failed</span>
                    </div>
                    
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800">
                        Error: {result.error}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>CSS Optimization Tips</CardTitle>
              <CardDescription>
                Best practices for writing efficient CSS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Minification Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Reduced file size</li>
                    <li>• Faster page load times</li>
                    <li>• Lower bandwidth usage</li>
                    <li>• Better user experience</li>
                    <li>• Improved SEO rankings</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">What Gets Removed</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Comments and whitespace</li>
                    <li>• Unnecessary semicolons</li>
                    <li>• Redundant spaces</li>
                    <li>• Newlines and tabs</li>
                    <li>• Empty rules</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep original CSS for development</li>
                    <li>• Use minified CSS in production</li>
                    <li>• Combine multiple CSS files</li>
                    <li>• Use CSS preprocessors wisely</li>
                    <li>• Test minified CSS thoroughly</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Advanced Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use CSS Grid and Flexbox</li>
                    <li>• Avoid !important when possible</li>
                    <li>• Use shorthand properties</li>
                    <li>• Optimize selector specificity</li>
                    <li>• Consider CSS custom properties</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minification History</CardTitle>
              <CardDescription>
                Your recent CSS minification operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {minificationHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No minification history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {minificationHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {formatFileSize(item.originalSize)} → {formatFileSize(item.minifiedSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.compressionRatio.toFixed(1)}% compression ratio
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {item.compressionRatio > 30 ? 'Excellent' : item.compressionRatio > 15 ? 'Good' : 'Fair'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}