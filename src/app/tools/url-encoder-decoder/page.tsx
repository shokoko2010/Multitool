'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link, Copy, RefreshCw, ArrowRightLeft, Info } from 'lucide-react'

interface URLConversion {
  original: string
  encoded: string
  decoded: string
  isValid: boolean
  error?: string
}

interface ConversionHistory {
  id: string
  type: 'encode' | 'decode'
  input: string
  result: URLConversion
  timestamp: Date
}

export default function URLEncoderDecoder() {
  const [inputText, setInputText] = useState<string>('')
  const [outputText, setOutputText] = useState<string>('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [conversion, setConversion] = useState<URLConversion | null>(null)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])

  const encodeURL = (text: string): string => {
    try {
      return encodeURIComponent(text)
    } catch (error) {
      throw new Error('Failed to encode URL')
    }
  }

  const decodeURL = (text: string): string => {
    try {
      return decodeURIComponent(text)
    } catch (error) {
      throw new Error('Failed to decode URL')
    }
  }

  const processConversion = () => {
    if (!inputText.trim()) {
      setConversion({
        original: inputText,
        encoded: '',
        decoded: '',
        isValid: false,
        error: 'Please enter text to process'
      })
      return
    }

    try {
      let result: URLConversion

      if (mode === 'encode') {
        const encoded = encodeURL(inputText)
        result = {
          original: inputText,
          encoded,
          decoded: inputText, // Original is the decoded version when encoding
          isValid: true
        }
      } else {
        const decoded = decodeURL(inputText)
        result = {
          original: inputText,
          encoded: inputText, // Original is the encoded version when decoding
          decoded,
          isValid: true
        }
      }

      setConversion(result)
      setOutputText(mode === 'encode' ? result.encoded : result.decoded)

      // Add to history
      const historyItem: ConversionHistory = {
        id: Date.now().toString(),
        type: mode,
        input: inputText,
        result,
        timestamp: new Date()
      }
      
      setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      setConversion({
        original: inputText,
        encoded: '',
        decoded: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      setOutputText('')
    }
  }

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    // Swap input and output
    setInputText(outputText)
    setOutputText(inputText)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setConversion(null)
  }

  const loadSampleURL = () => {
    const sample = 'https://example.com/search?q=hello world&category=technology'
    setInputText(sample)
  }

  const loadComplexSample = () => {
    const sample = 'https://example.com/api/v1/data?name=John Doe&email=john@example.com&tags=web development,programming&filter={"status":"active","priority":"high"}'
    setInputText(sample)
  }

  useEffect(() => {
    processConversion()
  }, [inputText, mode])

  const getURLParts = (url: string) => {
    try {
      const urlObj = new URL(url)
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      }
    } catch {
      return null
    }
  }

  const getQueryParams = (url: string) => {
    try {
      const urlObj = new URL(url)
      const params = new URLSearchParams(urlObj.search)
      const result: { [key: string]: string } = {}
      params.forEach((value, key) => {
        result[key] = value
      })
      return result
    } catch {
      return null
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Encoder / Decoder</h1>
        <p className="text-muted-foreground">Encode and decode URLs and URL components safely</p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Input
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSampleURL}>
                      Sample URL
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadComplexSample}>
                      Complex URL
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter URL or text to {mode === 'encode' ? 'encode' : 'decode'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={mode === 'encode' ? 'default' : 'outline'}
                    onClick={() => setMode('encode')}
                    className="flex-1"
                  >
                    Encode
                  </Button>
                  <Button
                    variant={mode === 'decode' ? 'default' : 'outline'}
                    onClick={() => setMode('decode')}
                    className="flex-1"
                  >
                    Decode
                  </Button>
                  <Button variant="outline" onClick={swapMode}>
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>

                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === 'encode' 
                    ? 'Enter URL or text to encode...' 
                    : 'Enter encoded URL to decode...'
                  }
                  className="min-h-[200px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Output
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(outputText)}
                    disabled={!outputText}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </CardTitle>
                <CardDescription>
                  {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={outputText}
                  readOnly
                  placeholder={mode === 'encode' 
                    ? 'Encoded URL will appear here...' 
                    : 'Decoded URL will appear here...'
                  }
                  className="min-h-[200px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {conversion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Conversion Details
                </CardTitle>
                <CardDescription>
                  {mode === 'encode' ? 'Encoding analysis' : 'Decoding analysis'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversion.isValid ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-700">
                        Successfully {mode === 'encode' ? 'encoded' : 'decoded'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Original:</div>
                        <div className="text-sm bg-muted p-2 rounded break-all font-mono">
                          {conversion.original.length > 100 
                            ? conversion.original.substring(0, 100) + '...' 
                            : conversion.original
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Length: {conversion.original.length} characters
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-sm">
                          {mode === 'encode' ? 'Encoded:' : 'Decoded:'}
                        </div>
                        <div className="text-sm bg-muted p-2 rounded break-all font-mono">
                          {(mode === 'encode' ? conversion.encoded : conversion.decoded).length > 100 
                            ? (mode === 'encode' ? conversion.encoded : conversion.decoded).substring(0, 100) + '...' 
                            : (mode === 'encode' ? conversion.encoded : conversion.decoded)
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Length: {(mode === 'encode' ? conversion.encoded : conversion.decoded).length} characters
                        </div>
                      </div>
                    </div>

                    {/* URL Analysis */}
                    {mode === 'decode' && conversion.decoded.startsWith('http') && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium">URL Analysis</h4>
                          {getURLParts(conversion.decoded) && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Protocol</div>
                                <div className="text-sm font-mono">
                                  {getURLParts(conversion.decoded)?.protocol}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Hostname</div>
                                <div className="text-sm font-mono">
                                  {getURLParts(conversion.decoded)?.hostname}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Path</div>
                                <div className="text-sm font-mono">
                                  {getURLParts(conversion.decoded)?.pathname || '/'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {getQueryParams(conversion.decoded) && Object.keys(getQueryParams(conversion.decoded)!).length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Query Parameters:</div>
                              <div className="space-y-1">
                                {Object.entries(getQueryParams(conversion.decoded)!).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-sm font-mono">
                                    <span>{key}:</span>
                                    <span>{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-700">
                        {mode === 'encode' ? 'Encoding' : 'Decoding'} failed
                      </span>
                    </div>
                    
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800">
                        Error: {conversion.error}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>URL Encoding Reference</CardTitle>
              <CardDescription>
                Common URL encoding examples and special characters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Special Characters</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex justify-between p-2 border rounded">
                      <span>Space</span>
                      <span className="font-mono">%20</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>!</span>
                      <span className="font-mono">%21</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>#</span>
                      <span className="font-mono">%23</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>$</span>
                      <span className="font-mono">%24</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>&</span>
                      <span className="font-mono">%26</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>+</span>
                      <span className="font-mono">%2B</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>/</span>
                      <span className="font-mono">%2F</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>?</span>
                      <span className="font-mono">%3F</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>=</span>
                      <span className="font-mono">%3D</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>@</span>
                      <span className="font-mono">%40</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">When to Use URL Encoding</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Query parameters in URLs</li>
                    <li>• Form data submission</li>
                    <li>• API requests with special characters</li>
                    <li>• File paths with spaces or special characters</li>
                    <li>• User input in URLs</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Always encode user-provided input</li>
                    <li>• Use encodeURIComponent() for full URLs</li>
                    <li>• Use encodeURI() for partial URL components</li>
                    <li>• Decode only when processing the data</li>
                    <li>• Test with various special characters</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion History</CardTitle>
              <CardDescription>
                Your recent URL encoding/decoding operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversion history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {conversionHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={item.type === 'encode' ? 'default' : 'secondary'}>
                            {item.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm font-medium truncate">
                          {item.input.length > 50 
                            ? item.input.substring(0, 50) + '...' 
                            : item.input
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.input.length} → {(item.type === 'encode' ? item.result.encoded : item.result.decoded).length} chars
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.type === 'encode' ? item.result.encoded : item.result.decoded)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
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