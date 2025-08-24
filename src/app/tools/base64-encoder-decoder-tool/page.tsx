'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Upload, Image, File } from 'lucide-react'

export default function Base64EncoderDecoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [fileMode, setFileMode] = useState(false)
  const [fileName, setFileName] = useState('')

  const encodeBase64 = () => {
    if (!input.trim()) return
    try {
      setOutput(btoa(input))
    } catch (error) {
      setOutput('Error: Invalid input for Base64 encoding')
    }
  }

  const decodeBase64 = () => {
    if (!input.trim()) return
    try {
      setOutput(atob(input))
    } catch (error) {
      setOutput('Error: Invalid Base64 string')
    }
  }

  const encodeFileAsBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    
    try {
      const base64 = await encodeFileAsBase64(file) as string
      setOutput(base64)
      
      // Add file info to input
      const fileSize = (file.size / 1024).toFixed(2)
      setInput(`File: ${file.name} (${fileSize} KB)`)
    } catch (error) {
      setOutput('Error: Failed to encode file')
    }
  }

  const downloadAsFile = () => {
    if (!output.trim()) return
    
    let mimeType = 'text/plain'
    let extension = '.txt'
    
    // Try to detect if it's an image
    if (output.startsWith('/9j/') || output.startsWith('iVBORw')) {
      mimeType = 'image/png'
      extension = '.png'
    } else if (output.startsWith('JVBERi0x')) {
      mimeType = 'application/pdf'
      extension = '.pdf'
    }
    
    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `base64-${fileName || 'output'}${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const swapInputOutput = () => {
    setInput(output)
    setOutput(input)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setFileName('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Base64 Encoder/Decoder</h1>
          <p className="text-muted-foreground">
            Encode and decode text and files to/from Base64 format
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Input
              </CardTitle>
              <CardDescription>
                Enter text or upload a file to encode/decode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={fileMode ? 'file' : 'text'} onValueChange={(value) => setFileMode(value === 'file')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    File
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text to encode or Base64 to decode..."
                    className="min-h-[200px] resize-none"
                  />
                </TabsContent>
                
                <TabsContent value="file" className="mt-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a file to encode as Base64
                      </p>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept="*/*"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" className="w-full">
                          Choose File
                        </Button>
                      </label>
                    </div>
                    {fileName && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Selected: {fileName}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                Output
              </CardTitle>
              <CardDescription>
                The Base64 encoded or decoded result
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Output will appear here..."
                className="min-h-[200px] resize-none"
                readOnly
              />
              
              {output && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadAsFile} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Encoding Options</CardTitle>
            <CardDescription>
              Choose how you want to process your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="encode" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="encode" className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  Encode
                </TabsTrigger>
                <TabsTrigger value="decode" className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  Decode
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="encode" className="mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Base64 Encoding:</strong> Converts binary data to an ASCII string format. 
                    Commonly used for encoding files, images, and binary data for transmission over text-based protocols.
                  </p>
                  <Button onClick={encodeBase64} className="w-full">
                    <File className="w-4 h-4 mr-2" />
                    Encode to Base64
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="decode" className="mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Base64 Decoding:</strong> Converts Base64 encoded data back to its original binary format. 
                    Use this to decode Base64 strings back to text or binary files.
                  </p>
                  <Button onClick={decodeBase64} className="w-full">
                    <File className="w-4 h-4 mr-2" />
                    Decode from Base64
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={swapInputOutput} variant="outline" className="flex-1">
                Swap Input/Output
              </Button>
              <Button onClick={clearAll} variant="outline" className="flex-1">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Base64 Encoding Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Text Encoding</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Original:</strong> Hello World!</p>
                  <p><strong>Base64:</strong> SGVsbG8gV29ybGQh</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Special Characters</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Original:</strong> Hello @ World # 123</p>
                  <p><strong>Base64:</strong> SGVsbG8gQCBXb3JsZCAjIDEyMw==</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Common Use Cases</h4>
                <div className="text-sm space-y-1">
                  <p>• Email attachments</p>
                  <p>• Data URI schemes (images in CSS/HTML)</p>
                  <p>• API authentication tokens</p>
                  <p>• Storing binary data in JSON/XML</p>
                  <p>• Encoding URLs and form data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}