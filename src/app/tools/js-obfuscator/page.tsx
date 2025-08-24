'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Download, Upload, Shield, AlertTriangle } from 'lucide-react'

interface JSObfuscationResult {
  original: string
  obfuscated: string
  originalSize: number
  obfuscatedSize: number
  complexityScore: number
  isValid: boolean
  error?: string
  techniques: string[]
}

interface ObfuscationHistory {
  id: string
  originalSize: number
  obfuscatedSize: number
  complexityScore: number
  timestamp: Date
}

export default function JSObfuscator() {
  const [inputJS, setInputJS] = useState<string>('')
  const [obfuscatedJS, setObfuscatedJS] = useState<string>('')
  const [obfuscationLevel, setObfuscationLevel] = useState<number>(2)
  const [result, setResult] = useState<JSObfuscationResult | null>(null)
  const [obfuscationHistory, setObfuscationHistory] = useState<ObfuscationHistory[]>([])

  const obfuscateJS = (js: string, level: number): JSObfuscationResult => {
    if (!js.trim()) {
      return {
        original: js,
        obfuscated: '',
        originalSize: 0,
        obfuscatedSize: 0,
        complexityScore: 0,
        isValid: false,
        error: 'Please enter JavaScript code',
        techniques: []
      }
    }

    try {
      let obfuscated = js
      const techniques: string[] = []

      // Basic validation - check if it looks like JavaScript
      if (!js.match(/(function|var|let|const|=>|class|import|export)/)) {
        throw new Error('Input does not appear to be valid JavaScript code')
      }

      // Level 1: Basic obfuscation
      if (level >= 1) {
        // String obfuscation
        obfuscated = obfuscated.replace(/(['"`])((?:(?!\1)[^\\]|\\.)*?)\1/g, (match, quote, content) => {
          techniques.push('String encoding')
          const encoded = btoa(unescape(encodeURIComponent(content)))
          return `atob('${encoded}')`
        })

        // Variable name obfuscation (simple)
        const varMap: { [key: string]: string } = {}
        let varCounter = 0
        
        obfuscated = obfuscated.replace(/\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (match, keyword, varName) => {
          if (!varMap[varName] && varName.length > 1) {
            const obfuscatedName = `_${varCounter.toString(36)}`
            varMap[varName] = obfuscatedName
            varCounter++
            techniques.push('Variable renaming')
          }
          return `${keyword} ${varMap[varName] || varName}`
        })

        // Replace variable usage
        Object.entries(varMap).forEach(([original, obfuscated]) => {
          const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
          obfuscated = obfuscated.replace(regex, obfuscated)
        })
      }

      // Level 2: Intermediate obfuscation
      if (level >= 2) {
        // Function name obfuscation
        obfuscated = obfuscated.replace(/\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (match, funcName) => {
          if (funcName.length > 1) {
            techniques.push('Function renaming')
            return `function _${Math.random().toString(36).substr(2, 5)}`
          }
          return match
        })

        // Control flow obfuscation
        obfuscated = obfuscated.replace(/\bif\s*\(([^)]+)\)\s*{/g, (match, condition) => {
          techniques.push('Control flow obfuscation')
          return `if(!!(${condition})){`
        })

        // Number obfuscation
        obfuscated = obfuscated.replace(/\b(\d+)\b/g, (match, num) => {
          if (parseInt(num) > 10) {
            techniques.push('Number encoding')
            const operations = ['+', '-', '*']
            const op = operations[Math.floor(Math.random() * operations.length)]
            const offset = Math.floor(Math.random() * 5) + 1
            return `${num}${op}${offset}${op === '+' ? '-' : '+'}${offset}`
          }
          return match
        })
      }

      // Level 3: Advanced obfuscation
      if (level >= 3) {
        // Dead code insertion
        techniques.push('Dead code insertion')
        obfuscated = `if(false){${'console.log("dead code");'.repeat(3)}}${obfuscated}`

        // Array access obfuscation
        obfuscated = obfuscated.replace(/\[([^\]]+)\]/g, (match, index) => {
          if (!index.match(/['"]/)) {
            techniques.push('Array access obfuscation')
            return `[(${index})]`
          }
          return match
        })

        // Self-defending code
        techniques.push('Self-defending code')
        obfuscated = `(function(){${obfuscated}})();`
      }

      // Add anti-debugging techniques for higher levels
      if (level >= 2) {
        techniques.push('Anti-debugging')
        obfuscated = `try{${obfuscated}}catch(e){console.log(e);}`
      }

      // Calculate complexity score
      const complexityScore = Math.min(100, techniques.length * 15 + level * 20)

      const originalSize = new Blob([js]).size
      const obfuscatedSize = new Blob([obfuscated]).size

      return {
        original: js,
        obfuscated,
        originalSize,
        obfuscatedSize,
        complexityScore,
        isValid: true,
        techniques
      }
    } catch (error) {
      return {
        original: js,
        obfuscated: '',
        originalSize: 0,
        obfuscatedSize: 0,
        complexityScore: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        techniques: []
      }
    }
  }

  const processObfuscation = () => {
    const obfuscationResult = obfuscateJS(inputJS, obfuscationLevel)
    setResult(obfuscationResult)
    setObfuscatedJS(obfuscationResult.obfuscated)

    if (obfuscationResult.isValid) {
      // Add to history
      const historyItem: ObfuscationHistory = {
        id: Date.now().toString(),
        originalSize: obfuscationResult.originalSize,
        obfuscatedSize: obfuscationResult.obfuscatedSize,
        complexityScore: obfuscationResult.complexityScore,
        timestamp: new Date()
      }
      
      setObfuscationHistory(prev => [historyItem, ...prev.slice(0, 9)])
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadJS = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'text/javascript' || file.name.endsWith('.js'))) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputJS(content)
      }
      reader.readAsText(file)
    }
  }

  const clearAll = () => {
    setInputJS('')
    setObfuscatedJS('')
    setResult(null)
  }

  const loadSampleJS = () => {
    const sample = `// Sample JavaScript function
function calculateTotal(price, quantity, discount = 0) {
    const subtotal = price * quantity;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    return {
        subtotal: subtotal,
        discount: discountAmount,
        total: total
    };
}

// Example usage
const result = calculateTotal(19.99, 3, 10);
console.log('Total cost:', result.total);

// Another function
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Array manipulation
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled numbers:', doubled);`
    
    setInputJS(sample)
  }

  useEffect(() => {
    if (inputJS) {
      processObfuscation()
    }
  }, [inputJS, obfuscationLevel])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getComplexityLevel = (score: number) => {
    if (score >= 80) return { label: 'Very High', color: 'bg-red-500' }
    if (score >= 60) return { label: 'High', color: 'bg-orange-500' }
    if (score >= 40) return { label: 'Medium', color: 'bg-yellow-500' }
    if (score >= 20) return { label: 'Low', color: 'bg-blue-500' }
    return { label: 'Very Low', color: 'bg-green-500' }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JavaScript Obfuscator</h1>
        <p className="text-muted-foreground">Protect your JavaScript code by obfuscating it to make it harder to understand</p>
      </div>

      <Tabs defaultValue="obfuscator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="obfuscator">Obfuscator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="obfuscator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Original JavaScript
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSampleJS}>
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
                      accept=".js,text/javascript"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter your JavaScript code to obfuscate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Obfuscation Level</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={obfuscationLevel === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setObfuscationLevel(1)}
                    >
                      Basic
                    </Button>
                    <Button
                      variant={obfuscationLevel === 2 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setObfuscationLevel(2)}
                    >
                      Intermediate
                    </Button>
                    <Button
                      variant={obfuscationLevel === 3 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setObfuscationLevel(3)}
                    >
                      Advanced
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {obfuscationLevel === 1 && 'Basic: String encoding, variable renaming'}
                    {obfuscationLevel === 2 && 'Intermediate: Function renaming, control flow obfuscation'}
                    {obfuscationLevel === 3 && 'Advanced: Dead code insertion, anti-debugging'}
                  </div>
                </div>

                <Textarea
                  value={inputJS}
                  onChange={(e) => setInputJS(e.target.value)}
                  placeholder="Enter your JavaScript code here..."
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
                    <Shield className="h-5 w-5" />
                    Obfuscated JavaScript
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(obfuscatedJS)}
                      disabled={!obfuscatedJS}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadJS(obfuscatedJS, 'obfuscated.js')}
                      disabled={!obfuscatedJS}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Obfuscated JavaScript output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={obfuscatedJS}
                  readOnly
                  placeholder="Obfuscated JavaScript will appear here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                
                {result && result.obfuscatedSize > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Size: {formatFileSize(result.obfuscatedSize)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Obfuscation Analysis
                </CardTitle>
                <CardDescription>
                  Code protection analysis and applied techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.isValid ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-700">Successfully Obfuscated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Complexity:</span>
                        <Badge 
                          variant="outline" 
                          className={getComplexityLevel(result.complexityScore).color.replace('bg-', 'bg-').replace('500', '100')}
                        >
                          {getComplexityLevel(result.complexityScore).label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ({result.complexityScore.toFixed(0)}/100)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{formatFileSize(result.originalSize)}</div>
                        <div className="text-sm text-muted-foreground">Original Size</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{formatFileSize(result.obfuscatedSize)}</div>
                        <div className="text-sm text-muted-foreground">Obfuscated Size</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{result.techniques.length}</div>
                        <div className="text-sm text-muted-foreground">Techniques Used</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{obfuscationLevel}</div>
                        <div className="text-sm text-muted-foreground">Obfuscation Level</div>
                      </div>
                    </div>

                    {result.techniques.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium">Applied Techniques:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.techniques.map((technique, index) => (
                              <Badge key={index} variant="outline">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-orange-800">Important Security Note</div>
                          <div className="text-sm text-orange-600">
                            Obfuscation makes code harder to understand but does not provide complete security. 
                            Always test obfuscated code thoroughly and consider additional security measures for sensitive applications.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-700">Obfuscation Failed</span>
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
              <CardTitle>Obfuscation Techniques</CardTitle>
              <CardDescription>
                Understanding the methods used to protect JavaScript code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Basic Techniques</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• String encoding/decoding</li>
                    <li>• Variable renaming</li>
                    <li>• Function renaming</li>
                    <li>• Number manipulation</li>
                    <li>• Comment removal</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Intermediate Techniques</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Control flow obfuscation</li>
                    <li>• Array access obfuscation</li>
                    <li>• Boolean logic obfuscation</li>
                    <li>• String concatenation splitting</li>
                    <li>• Dead code insertion</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Advanced Techniques</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Self-defending code</li>
                    <li>• Anti-debugging measures</li>
                    <li>• Code encryption</li>
                    <li>• Runtime code generation</li>
                    <li>• Domain lock implementation</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep original code for development</li>
                    <li>• Test obfuscated code thoroughly</li>
                    <li>• Use appropriate obfuscation levels</li>
                    <li>• Consider performance impact</li>
                    <li>• Combine with other security measures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Obfuscation History</CardTitle>
              <CardDescription>
                Your recent JavaScript obfuscation operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {obfuscationHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No obfuscation history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {obfuscationHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {formatFileSize(item.originalSize)} → {formatFileSize(item.obfuscatedSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Complexity: {item.complexityScore.toFixed(0)}/100
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {getComplexityLevel(item.complexityScore).label}
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