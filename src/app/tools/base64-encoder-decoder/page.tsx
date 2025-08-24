'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Upload, FileText, Image, Code, RotateCcw, Trash2 } from 'lucide-react'

interface ConversionResult {
  input: string
  output: string
  mode: 'encode' | 'decode'
  type: 'text' | 'file' | 'url'
  timestamp: Date
  success: boolean
  error?: string
}

interface ConversionHistory {
  id: string
  result: ConversionResult
  timestamp: Date
}

export default function Base64EncoderDecoder() {
  const [inputText, setInputText] = useState<string>('')
  const [outputText, setOutputText] = useState<string>('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [inputType, setInputType] = useState<'text' | 'file' | 'url'>('text')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])

  const encodeBase64 = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
    } catch (error) {
      throw new Error('Failed to encode text')
    }
  }

  const decodeBase64 = (base64: string): string => {
    try {
      return decodeURIComponent(escape(atob(base64)))
    } catch (error) {
      throw new Error('Failed to decode Base64')
    }
  }

  const encodeFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1] // Remove data URL prefix
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const decodeBase64ToFile = (base64: string, mimeType: string = 'application/octet-stream'): Blob => {
    try {
      const byteString = atob(base64)
      const arrayBuffer = new ArrayBuffer(byteString.length)
      const uint8Array = new Uint8Array(arrayBuffer)
      
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i)
      }
      
      return new Blob([uint8Array], { type: mimeType })
    } catch (error) {
      throw new Error('Failed to decode Base64 to file')
    }
  }

  const processConversion = async () => {
    if (!inputText && !selectedFile) return

    setIsProcessing(true)
    let result: string
    let success = true
    let error: string | undefined

    try {
      if (inputType === 'file' && selectedFile) {
        if (mode === 'encode') {
          result = await encodeFileToBase64(selectedFile)
        } else {
          // For file decoding, we assume the input is Base64
          const blob = decodeBase64ToFile(inputText, selectedFile.type)
          result = `File decoded successfully. Size: ${blob.size} bytes`
        }
      } else {
        // Text processing
        if (mode === 'encode') {
          result = encodeBase64(inputText)
        } else {
          result = decodeBase64(inputText)
        }
      }
    } catch (err) {
      result = ''
      success = false
      error = err instanceof Error ? err.message : 'Unknown error occurred'
    }

    setOutputText(result)
    setIsProcessing(false)

    // Add to history
    const conversionResult: ConversionResult = {
      input: inputText || selectedFile?.name || '',
      output: result,
      mode,
      type: inputType,
      timestamp: new Date(),
      success,
      error
    }

    const historyItem: ConversionHistory = {
      id: Date.now().toString(),
      result: conversionResult,
      timestamp: new Date()
    }

    setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setInputText('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResult = () => {
    if (!outputText) return

    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `base64-${mode === 'encode' ? 'encoded' : 'decoded'}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadDecodedFile = () => {
    if (!outputText || mode !== 'decode' || inputType !== 'file') return

    try {
      const blob = decodeBase64ToFile(outputText, selectedFile?.type || 'application/octet-stream')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `decoded-${selectedFile?.name || 'file'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download decoded file:', error)
    }
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Mode', 'Type', 'Input', 'Output', 'Success'],
      ...conversionHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.result.mode,
        item.result.type,
        item.result.input.length > 50 ? item.result.input.substring(0, 50) + '...' : item.result.input,
        item.result.output.length > 50 ? item.result.output.substring(0, 50) + '...' : item.result.output,
        item.result.success ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `base64-conversion-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setSelectedFile(null)
  }

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    // Swap input and output
    setInputText(outputText)
    setOutputText(inputText)
  }

  const isValidBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    // Auto-process when input changes (for text input)
    if (inputType === 'text' && inputText) {
      const timeoutId = setTimeout(() => {
        processConversion()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [inputText, mode, inputType])

  const getModeIcon = (mode: 'encode' | 'decode') => {
    return mode === 'encode' ? <Code className="h-4 w-4" /> : <FileText className="h-4 w-4" />
  }

  const getTypeIcon = (type: 'text' | 'file' | 'url') => {
    const icons = {
      'text': <FileText className="h-4 w-4" />,
      'file': <Image className="h-4 w-4" />,
      'url': <Code className="h-4 w-4" />
    }
    return icons[type]
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Base64 Encoder / Decoder</h1>
        <p className="text-muted-foreground">Encode and decode text and files to/from Base64 format</p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getModeIcon(mode)}
                  Base64 {mode === 'encode' ? 'Encoder' : 'Decoder'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={swapMode}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Swap
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {mode === 'encode' 
                  ? 'Convert text or files to Base64 format' 
                  : 'Convert Base64 back to text or files'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Button
                  variant={mode === 'encode' ? 'default' : 'outline'}
                  onClick={() => setMode('encode')}
                  className="flex-1"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Encode
                </Button>
                <Button
                  variant={mode === 'decode' ? 'default' : 'outline'}
                  onClick={() => setMode('decode')}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Decode
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={inputType === 'text' ? 'default' : 'outline'}
                  onClick={() => setInputType('text')}
                  size="sm"
                >
                  Text
                </Button>
                <Button
                  variant={inputType === 'file' ? 'default' : 'outline'}
                  onClick={() => setInputType('file')}
                  size="sm"
                >
                  File
                </Button>
              </div>

              <Separator />

              {inputType === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="inputText">
                    {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                  </Label>
                  <Textarea
                    id="inputText"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={mode === 'encode' 
                      ? 'Enter text to encode to Base64...' 
                      : 'Enter Base64 string to decode...'
                    }
                    className="min-h-[120px]"
                  />
                  {mode === 'decode' && inputText && !isValidBase64(inputText) && (
                    <p className="text-sm text-red-500">Invalid Base64 format</p>
                  )}
                </div>
              )}

              {inputType === 'file' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>Choose File</span>
                        </Button>
                      </label>
                      {selectedFile && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedFile && (
                    <Button onClick={processConversion} disabled={isProcessing} className="w-full">
                      {isProcessing ? 'Processing...' : mode === 'encode' ? 'Encode File' : 'Decode Base64'}
                    </Button>
                  )}
                </div>
              )}

              {(outputText || isProcessing) && (
                <div className="space-y-2">
                  <Label htmlFor="outputText">
                    {mode === 'encode' ? 'Base64 Result' : 'Decoded Result'}
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="outputText"
                      value={isProcessing ? 'Processing...' : outputText}
                      readOnly
                      className="min-h-[120px] pr-10"
                    />
                    {outputText && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(outputText)}
                        className="absolute top-2 right-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {outputText && (
                <div className="flex gap-2">
                  <Button onClick={downloadResult} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download as Text
                  </Button>
                  {mode === 'decode' && inputType === 'file' && (
                    <Button onClick={downloadDecodedFile} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download as File
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base64 Information</CardTitle>
              <CardDescription>
                Learn about Base64 encoding and its uses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">What is Base64?</h4>
                  <p className="text-sm text-muted-foreground">
                    Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
                    It's commonly used to encode data that needs to be stored or transferred in a text-only format.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Common Uses</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email attachments</li>
                    <li>• Data URIs in web development</li>
                    <li>• Storing complex data in JSON/XML</li>
                    <li>• Embedding images in HTML/CSS</li>
                    <li>• API request/response encoding</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Conversion History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHistory}
                  disabled={conversionHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Your recent Base64 conversions
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
                          {getModeIcon(item.result.mode)}
                          <Badge variant={item.result.success ? 'default' : 'destructive'}>
                            {item.result.mode.toUpperCase()}
                          </Badge>
                          {getTypeIcon(item.result.type)}
                          <Badge variant="outline">
                            {item.result.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium truncate">
                          {item.result.input.length > 30 
                            ? item.result.input.substring(0, 30) + '...' 
                            : item.result.input
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                        {!item.result.success && item.result.error && (
                          <div className="text-xs text-red-500 mt-1">
                            Error: {item.result.error}
                          </div>
                        )}
                      </div>
                      {item.result.success && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.result.output)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
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