'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Upload, Download, Copy, RotateCcw, FileImage, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Base64Tool() {
  const [textInput, setTextInput] = useState('')
  const [base64Input, setBase64Input] = useState('')
  const [textOutput, setTextOutput] = useState('')
  const [base64Output, setBase64Output] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isImageMode, setIsImageMode] = useState(false)
  const [fileName, setFileName] = useState('')
  const { toast } = useToast()

  const encodeText = () => {
    if (!textInput.trim()) {
      toast({
        title: "No input text",
        description: "Please enter some text to encode.",
        variant: "destructive"
      })
      return
    }
    
    try {
      const encoded = btoa(unescape(encodeURIComponent(textInput)))
      setBase64Output(encoded)
      setTextOutput('')
      setImagePreview(null)
    } catch (error) {
      toast({
        title: "Encoding failed",
        description: "Failed to encode text. Please try again.",
        variant: "destructive"
      })
    }
  }

  const decodeText = () => {
    if (!base64Input.trim()) {
      toast({
        title: "No input",
        description: "Please enter Base64 text to decode.",
        variant: "destructive"
      })
      return
    }
    
    try {
      const decoded = decodeURIComponent(escape(atob(base64Input)))
      setTextOutput(decoded)
      setBase64Output('')
      setImagePreview(null)
    } catch (error) {
      toast({
        title: "Decoding failed",
        description: "Invalid Base64 format. Please check your input.",
        variant: "destructive"
      })
    }
  }

  const encodeImage = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setBase64Output(result.split(',')[1]) // Remove data URL prefix
      setTextOutput('')
      setImagePreview(result)
      setFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const decodeImage = () => {
    if (!base64Input.trim()) {
      toast({
        title: "No input",
        description: "Please enter Base64 data to decode.",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Create a data URL for the image
      const dataUrl = `data:image/png;base64,${base64Input}`
      setImagePreview(dataUrl)
      setTextOutput('')
      setBase64Output('')
    } catch (error) {
      toast({
        title: "Image decoding failed",
        description: "Invalid Base64 image data. Please check your input.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    })
  }

  const clearAll = () => {
    setTextInput('')
    setBase64Input('')
    setTextOutput('')
    setBase64Output('')
    setImagePreview(null)
    setFileName('')
  }

  const loadExampleText = () => {
    setTextInput('Hello, World! This is a test string for Base64 encoding.')
  }

  const loadExampleImage = () => {
    // This would load a sample image in a real implementation
    toast({
      title: "Image Example",
      description: "Upload an image to see Base64 encoding in action.",
    })
  }

  const handleTextEncode = () => {
    if (isImageMode) {
      encodeText()
    } else {
      encodeText()
    }
  }

  const handleTextDecode = () => {
    if (isImageMode) {
      decodeImage()
    } else {
      decodeText()
    }
  }

  const stats = {
    inputSize: textInput.length,
    outputSize: base64Output.length,
    compressionRatio: textInput.length > 0 ? 
      ((base64Output.length - textInput.length) / textInput.length * 100).toFixed(1) : '0'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Base64 Encoder/Decoder</span>
          </CardTitle>
          <CardDescription>
            Encode and decode text or images to and from Base64 format. Essential for data embedding and transmission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              variant={isImageMode ? "outline" : "default"}
              onClick={() => setIsImageMode(false)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text Mode
            </Button>
            <Button 
              variant={isImageMode ? "default" : "outline"}
              onClick={() => setIsImageMode(true)}
            >
              <FileImage className="h-4 w-4 mr-2" />
              Image Mode
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          
          {isImageMode && (
            <Alert>
              <AlertDescription>
                In image mode, you can encode images to Base64 or decode Base64 data back to images.
                The encoded data can be used directly in HTML/CSS or for data embedding.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
        
        <TabsContent value="encode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>
                  {isImageMode ? "Upload an image or paste Base64 data" : "Enter text to encode"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isImageMode ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop an image here, or click to browse
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) encodeImage(file)
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={base64Output.length > 0}
                      >
                        Choose Image
                      </Button>
                    </div>
                    
                    {fileName && (
                      <div className="text-sm text-gray-600">
                        Selected file: {fileName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="input-text">Text to Encode</Label>
                    <Textarea
                      id="input-text"
                      placeholder="Enter your text here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      {stats.inputSize} characters
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleTextEncode}
                  disabled={!textInput.trim() && !base64Input.trim()}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Encode to Base64
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle>Base64 Output</CardTitle>
                <CardDescription>Encoded Base64 data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full h-auto rounded"
                        onError={(e) => {
                          e.currentTarget.src = ''
                          setImagePreview(null)
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Right-click the image to save it
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="base64-output">Base64 Result</Label>
                    <Textarea
                      id="base64-output"
                      placeholder="Base64 encoded data will appear here..."
                      value={base64Output}
                      readOnly
                      rows={8}
                      className="resize-none font-mono text-xs bg-gray-50"
                    />
                    <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                      <span>{stats.outputSize} characters</span>
                      <span>{stats.compressionRatio}% size change</span>
                    </div>
                  </div>
                )}
                
                {base64Output && (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => copyToClipboard(base64Output)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Base64
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`data:text/plain;base64,${base64Output}`)
                        toast({
                          title: "Copied as data URL",
                          description: "Base64 data copied as data URL.",
                        })
                      }}
                    >
                      Copy Data URL
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="decode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Base64 Input</CardTitle>
                <CardDescription>Enter Base64 data to decode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="base64-input">Base64 Data</Label>
                  <Textarea
                    id="base64-input"
                    placeholder="Paste your Base64 data here..."
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    rows={8}
                    className="resize-none font-mono text-xs"
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    {base64Input.length} characters
                  </div>
                </div>
                
                <Button 
                  onClick={handleTextDecode}
                  disabled={!base64Input.trim()}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Decode Base64
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle>Decoded Output</CardTitle>
                <CardDescription>Decoded result</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <img 
                        src={imagePreview} 
                        alt="Decoded image" 
                        className="max-w-full h-auto rounded"
                        onError={(e) => {
                          e.currentTarget.src = ''
                          setImagePreview(null)
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Image successfully decoded from Base64
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="decoded-output">Decoded Result</Label>
                    <Textarea
                      id="decoded-output"
                      placeholder="Decoded content will appear here..."
                      value={textOutput}
                      readOnly
                      rows={8}
                      className="resize-none"
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      {textOutput.length} characters
                    </div>
                  </div>
                )}
                
                {textOutput && (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => copyToClipboard(textOutput)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([textOutput], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'decoded_text.txt'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>About Base64</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
            It's commonly used for encoding data for transmission over media that are designed to deal with text.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Common Use Cases:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Embedding images in HTML/CSS (data URLs)</li>
              <li>• Encoding email attachments</li>
              <li>• Passing data in URLs without encoding issues</li>
              <li>• Basic authentication in HTTP headers</li>
              <li>• Data embedding in XML/JSON</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Characteristics:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Uses 64 characters: A-Z, a-z, 0-9, +, /, and = (padding)</li>
              <li>• Increases data size by approximately 33%</li>
              <li>• Safe for use in URLs and XML</li>
              <li>• Not encryption - it's encoding only</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}