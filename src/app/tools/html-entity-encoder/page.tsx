'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, RefreshCw, ArrowRightLeft, Info } from 'lucide-react'

interface EntityConversion {
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
  result: EntityConversion
  timestamp: Date
}

export default function HTMLEntityEncoder() {
  const [inputText, setInputText] = useState<string>('')
  const [outputText, setOutputText] = useState<string>('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [conversion, setConversion] = useState<EntityConversion | null>(null)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])

  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '€': '&euro;',
    '£': '&pound;',
    '¥': '&yen;',
    '¢': '&cent;',
    '§': '&sect;',
    '¶': '&para;',
    '°': '&deg;',
    '±': '&plusmn;',
    '×': '&times;',
        '÷': '&divide;',
    '√': '&radic;',
    '∞': '&infin;',
    '≈': '&asymp;',
    '≠': '&ne;',
    '≤': '&le;',
    '≥': '&ge;',
    'α': '&alpha;',
    'β': '&beta;',
    'γ': '&gamma;',
    'δ': '&delta;',
    'ε': '&epsilon;',
    'π': '&pi;',
    'σ': '&sigma;',
    'τ': '&tau;',
    'φ': '&phi;',
    'ψ': '&psi;',
    'ω': '&omega;',
    'Α': '&Alpha;',
    'Β': '&Beta;',
    'Γ': '&Gamma;',
    'Δ': '&Delta;',
    'Ε': '&Epsilon;',
    'Π': '&Pi;',
    'Σ': '&Sigma;',
    'Ω': '&Omega;',
    ' ': '&nbsp;',
    '¡': '&iexcl;',
    '¿': '&iquest;',
    '«': '&laquo;',
    '»': '&raquo;',
    '…': '&hellip;',
    '–': '&ndash;',
    '—': '&mdash;',
    '‘': '&lsquo;',
    '’': '&rsquo;',
    '“': '&ldquo;',
    '”': '&rdquo;',
    '†': '&dagger;',
    '‡': '&Dagger;',
    '•': '&bull;',
    '‰': '&permil;',
    '‹': '&lsaquo;',
    '›': '&rsaquo;',
    '♠': '&spades;',
    '♣': '&clubs;',
    '♥': '&hearts;',
    '♦': '&diams;'
  }

  const encodeHTMLEntities = (text: string): string => {
    return text.replace(/[&<>"'©®™€£¥¢§¶°±×÷√∞≈≠≤≥αβγδεπστυφψωΑΒΓΔΕΠΣΩ ¡¿«»…–—‘’“”†‡•‰‹›♠♣♥♦\s]/g, (match) => {
      return htmlEntities[match] || match
    })
  }

  const decodeHTMLEntities = (text: string): string => {
    return text.replace(/&[^;]+;/g, (entity) => {
      // Find the entity in our reverse mapping
      for (const [char, entityCode] of Object.entries(htmlEntities)) {
        if (entityCode === entity) {
          return char
        }
      }
      // If not found, return the original entity
      return entity
    })
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
      let result: EntityConversion

      if (mode === 'encode') {
        const encoded = encodeHTMLEntities(inputText)
        result = {
          original: inputText,
          encoded,
          decoded: inputText, // Original is the decoded version when encoding
          isValid: true
        }
      } else {
        const decoded = decodeHTMLEntities(inputText)
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

  const loadSampleText = () => {
    const sample = 'Hello <world>! This is a "test" with special characters: © ® ™ € £ ¥'
    setInputText(sample)
  }

  const loadHTMLSample = () => {
    const sample = '&lt;div class=&quot;container&quot;&gt;Hello &amp; Welcome! &copy; 2024&lt;/div&gt;'
    setInputText(sample)
  }

  useEffect(() => {
    processConversion()
  }, [inputText, mode])

  const getUsedEntities = (text: string) => {
    const usedEntities: string[] = []
    const entityPattern = /&[^;]+;/g
    let match
    while ((match = entityPattern.exec(text)) !== null) {
      if (!usedEntities.includes(match[0])) {
        usedEntities.push(match[0])
      }
    }
    return usedEntities
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HTML Entity Encoder / Decoder</h1>
        <p className="text-muted-foreground">Convert special characters to HTML entities and vice versa</p>
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
                    <Code className="h-5 w-5" />
                    Input
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSampleText}>
                      Sample Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadHTMLSample}>
                      HTML Sample
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter text to {mode === 'encode' ? 'encode to HTML entities' : 'decode from HTML entities'}
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
                    ? 'Enter text with special characters to encode...' 
                    : 'Enter HTML entities to decode...'
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
                  {mode === 'encode' ? 'HTML Entities' : 'Decoded Text'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={outputText}
                  readOnly
                  placeholder={mode === 'encode' 
                    ? 'HTML entities will appear here...' 
                    : 'Decoded text will appear here...'
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

                    {/* Used Entities Analysis */}
                    {mode === 'decode' && getUsedEntities(conversion.decoded).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium">Entities Found:</h4>
                          <div className="flex flex-wrap gap-2">
                            {getUsedEntities(conversion.decoded).map((entity, index) => (
                              <Badge key={index} variant="outline" className="font-mono">
                                {entity}
                              </Badge>
                            ))}
                          </div>
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
              <CardTitle>HTML Entity Reference</CardTitle>
              <CardDescription>
                Common HTML entities and their character equivalents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Basic Entities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex justify-between p-2 border rounded">
                      <span>&amp;</span>
                      <span className="font-mono">&amp;amp;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>&lt;</span>
                      <span className="font-mono">&amp;lt;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>&gt;</span>
                      <span className="font-mono">&amp;gt;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>"</span>
                      <span className="font-mono">&amp;quot;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>'</span>
                      <span className="font-mono">&amp;apos;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span> </span>
                      <span className="font-mono">&amp;nbsp;</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Symbol Entities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex justify-between p-2 border rounded">
                      <span>©</span>
                      <span className="font-mono">&amp;copy;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>®</span>
                      <span className="font-mono">&amp;reg;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>™</span>
                      <span className="font-mono">&amp;trade;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>€</span>
                      <span className="font-mono">&amp;euro;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>£</span>
                      <span className="font-mono">&amp;pound;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>¥</span>
                      <span className="font-mono">&amp;yen;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>°</span>
                      <span className="font-mono">&amp;deg;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>±</span>
                      <span className="font-mono">&amp;plusmn;</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Mathematical Entities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex justify-between p-2 border rounded">
                      <span>×</span>
                      <span className="font-mono">&amp;times;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>÷</span>
                      <span className="font-mono">&amp;divide;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>√</span>
                      <span className="font-mono">&amp;radic;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>∞</span>
                      <span className="font-mono">&amp;infin;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>≈</span>
                      <span className="font-mono">&amp;asymp;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>≠</span>
                      <span className="font-mono">&amp;ne;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>≤</span>
                      <span className="font-mono">&amp;le;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>≥</span>
                      <span className="font-mono">&amp;ge;</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Greek Letters</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex justify-between p-2 border rounded">
                      <span>α</span>
                      <span className="font-mono">&amp;alpha;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>β</span>
                      <span className="font-mono">&amp;beta;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>γ</span>
                      <span className="font-mono">&amp;gamma;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>π</span>
                      <span className="font-mono">&amp;pi;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>σ</span>
                      <span className="font-mono">&amp;sigma;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>ω</span>
                      <span className="font-mono">&amp;omega;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>Α</span>
                      <span className="font-mono">&amp;Alpha;</span>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>Ω</span>
                      <span className="font-mono">&amp;Omega;</span>
                    </div>
                  </div>
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
                Your recent HTML entity encoding/decoding operations
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