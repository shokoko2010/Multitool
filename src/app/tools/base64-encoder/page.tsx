'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Hash, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw,
  Trash2,
  FileText,
  Save,
  Eye,
  EyeOff,
  Code,
  FileImage,
  File
} from 'lucide-react'

interface ConversionResult {
  input: string
  output: string
  type: 'encode' | 'decode'
  inputType: 'text' | 'file'
  timestamp: Date
  stats: {
    inputSize: number
    outputSize: number
    ratio: number
  }
}

export default function Base64Encoder() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [outputFileUrl, setOutputFileUrl] = useState<string>('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isValidBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str
    } catch {
      return false
    }
  }

  const encodeText = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
    } catch (error) {
      throw new Error('Failed to encode text')
    }
  }

  const decodeText = (base64: string): string => {
    try {
      if (!isValidBase64(base64)) {
        throw new Error('Invalid Base64 string')
      }
      return decodeURIComponent(escape(atob(base64)))
    } catch (error) {
      throw new Error('Failed to decode Base64')
    }
  }

  const encodeFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Get base64 part from data URL
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const decodeFile = (base64: string, mimeType: string = 'application/octet-stream'): Blob => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    } catch (error) {
      throw new Error('Failed to decode Base64 file')
    }
  }

  const detectMimeType = (base64: string): string => {
    // Simple MIME type detection based on common file signatures
    const signatures: { [key: string]: string } = {
      'iVBORw': 'image/png',
      '/9j/': 'image/jpeg',
      'JVBERi': 'application/pdf',
      'UEsDB': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'PK': 'application/zip',
      'R0lGOD': 'image/gif',
      'Qk0': 'image/bmp',
      'SUkq': 'image/tiff',
      'AAABAA': 'audio/mpeg',
      'ID3': 'audio/mpeg',
      'UklGR': 'audio/wav'
    }

    for (const [signature, mimeType] of Object.entries(signatures)) {
      if (base64.startsWith(signature)) {
        return mimeType
      }
    }

    return 'application/octet-stream'
  }

  const processConversion = async () => {
    if (inputType === 'text' && !inputText.trim()) {
      setError('Please enter text to process')
      return
    }

    if (inputType === 'file' && !inputFile) {
      setError('Please select a file to process')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      let result = ''
      let inputSize = 0
      let outputSize = 0

      if (inputType === 'text') {
        inputSize = inputText.length
        
        if (mode === 'encode') {
          result = encodeText(inputText)
        } else {
          result = decodeText(inputText)
        }
        
        outputSize = result.length
        setOutputText(result)
        setOutputFileUrl('')
      } else if (inputFile) {
        inputSize = inputFile.size
        
        if (mode === 'encode') {
          result = await encodeFile(inputFile)
          outputSize = result.length
          setOutputText(result)
          setOutputFileUrl('')
        } else {
          const mimeType = detectMimeType(inputText)
          const blob = decodeFile(inputText, mimeType)
          outputSize = blob.size
          setOutputText('')
          setOutputFileUrl(URL.createObjectURL(blob))
        }
      }

      // Calculate ratio
      const ratio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0

      // Add to history
      const conversionResult: ConversionResult = {
        input: inputType === 'text' ? inputText : inputFile!.name,
        output: result,
        type: mode,
        inputType,
        timestamp: new Date(),
        stats: {
          inputSize,
          outputSize,
          ratio
        }
      }

      setConversionHistory(prev => [conversionResult, ...prev.slice(0, 9)])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadResult = () => {
    if (outputFileUrl) {
      const a = document.createElement('a')
      a.href = outputFileUrl
      a.download = `decoded_${inputFile?.name || 'file'}`
      a.click()
    } else if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${mode === 'encode' ? 'encoded' : 'decoded'}_result.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setInputFile(file)
    setError(null)

    if (mode === 'decode') {
      // If decoding a file, read it as text first
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    }
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setInputFile(null)
    setOutputFileUrl('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const swapMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    
    // Swap input and output
    if (outputText) {
      setInputText(outputText)
      setOutputText(inputText)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getRatioColor = (ratio: number): string => {
    if (ratio > 0) return 'text-red-600'
    if (ratio < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getRatioText = (ratio: number): string => {
    if (ratio > 0) return `+${ratio}%`
    if (ratio < 0) return `${ratio}%`
    return '0%'
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-6 w-6" />
            Base64 {mode === 'encode' ? 'Encoder' : 'Decoder'}
          </CardTitle>
          <CardDescription>
            {mode === 'encode' 
              ? 'Encode text and files to Base64 format' 
              : 'Decode Base64 back to text and files'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant={mode === 'encode' ? 'default' : 'outline'}
              onClick={() => setMode('encode')}
            >
              Encode
            </Button>
            <Button
              variant={mode === 'decode' ? 'default' : 'outline'}
              onClick={() => setMode('decode')}
            >
              Decode
            </Button>
            <Button variant="outline" onClick={swapMode}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Swap
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Input Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={inputType === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInputType('text')}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      variant={inputType === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInputType('file')}
                    >
                      <File className="h-4 w-4 mr-2" />
                      File
                    </Button>
                  </div>
                </div>
              </div>

              {inputType === 'text' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Input Text</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(inputText, 'input')}
                    >
                      {copied === 'input' ? '✓' : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Select File</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    {inputFile ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                        <div className="font-medium">{inputFile.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(inputFile.size)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose Different File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <File className="h-8 w-8 text-muted-foreground mx-auto" />
                        <div className="text-sm text-muted-foreground">
                          {mode === 'encode' 
                            ? 'Select a file to encode to Base64'
                            : 'Select a Base64 file to decode'
                          }
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={processConversion} 
                  disabled={isProcessing || (inputType === 'text' && !inputText.trim()) || (inputType === 'file' && !inputFile)}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Hash className="mr-2 h-4 w-4" />
                      {mode === 'encode' ? 'Encode' : 'Decode'}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Output</Label>
                  <div className="flex items-center gap-2">
                    {outputFileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(outputText || outputFileUrl, 'output')}
                    >
                      {copied === 'output' ? '✓' : <Copy className="h-3 w-3" />}
                    </Button>
                    {(outputText || outputFileUrl) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={downloadResult}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {outputFileUrl ? (
                  <div className="space-y-2">
                    {showPreview ? (
                      <div className="border rounded-lg overflow-hidden">
                        {outputFileUrl.startsWith('data:image') ? (
                          <img
                            src={outputFileUrl}
                            alt="Decoded file preview"
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        ) : (
                          <div className="p-8 text-center">
                            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">File decoded successfully</p>
                            <p className="text-sm text-muted-foreground">
                              Click download to save the file
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-muted text-center">
                        <File className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          File decoded successfully
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder="Output will appear here..."
                    className="min-h-[200px] font-mono text-sm bg-muted"
                  />
                )}
              </div>

              {outputText && conversionHistory.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatFileSize(conversionHistory[0].stats.inputSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">Input Size</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatFileSize(conversionHistory[0].stats.outputSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">Output Size</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getRatioColor(conversionHistory[0].stats.ratio)}`}>
                          {getRatioText(conversionHistory[0].stats.ratio)}
                        </div>
                        <div className="text-sm text-muted-foreground">Size Change</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Conversion History</h3>
                {conversionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversion history yet</p>
                    <p className="text-sm text-muted-foreground">Your conversions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {conversionHistory.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {result.type === 'encode' ? 'Encoded' : 'Decoded'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {result.inputType === 'text' ? 'Text' : 'File'}
                                </Badge>
                                <span className="font-medium text-sm">
                                  {result.inputType === 'text' 
                                    ? result.input.substring(0, 50) + (result.input.length > 50 ? '...' : '')
                                    : result.input
                                  }
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {result.timestamp.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(result.stats.inputSize)} → {formatFileSize(result.stats.outputSize)} • {getRatioText(result.stats.ratio)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMode(result.type)
                                  setInputType(result.inputType)
                                  if (result.inputType === 'text') {
                                    setInputText(result.input)
                                    setOutputText(result.output)
                                  }
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(result.output, `history-${index}`)}
                              >
                                {copied === `history-${index}` ? '✓' : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">About Base64</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">What is Base64?</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.</p>
                        <p>It's commonly used for encoding data that needs to be stored or transferred over media that handle text.</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Common Use Cases</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Email attachments</p>
                        <p>• Data URLs in HTML/CSS</p>
                        <p>• Storing complex data in JSON</p>
                        <p>• Encoding binary data for APIs</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Character Set</div>
                      <div className="text-sm font-mono bg-muted p-2 rounded">
                        A-Z a-z 0-9 + /
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        64 characters total (hence the name Base64)
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Size Considerations</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Base64 encoding increases file size by ~33%</p>
                        <p>• Each 3 bytes of binary data = 4 Base64 characters</p>
                        <p>• Padding with '=' characters ensures proper length</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}