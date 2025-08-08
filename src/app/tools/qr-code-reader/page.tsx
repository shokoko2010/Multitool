'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Upload, Camera, Scan, QrCode, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QRResult {
  text: string
  format: string
  timestamp: Date
}

export default function QRCodeReaderTool() {
  const [qrResults, setQrResults] = useState<QRResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [inputText, setInputText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const scanFromCamera = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Get image data and try to detect QR code
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // For demo purposes, we'll simulate QR code detection
      // In a real implementation, you would use a QR code detection library
      const simulatedResult = simulateQRDetection(imageData)
      
      if (simulatedResult) {
        addQRResult(simulatedResult)
        stopCamera()
      }
    }

    requestAnimationFrame(scanFromCamera)
  }

  const simulateQRDetection = (imageData: ImageData): string | null => {
    // This is a simulation - in a real app, you'd use a proper QR code detection library
    // For demo purposes, we'll occasionally detect "QR codes"
    const random = Math.random()
    if (random < 0.1) { // 10% chance of "detecting" a QR code
      return 'https://example.com/demo-qr-content'
    }
    return null
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
        
        // Simulate QR code detection from uploaded image
        setTimeout(() => {
          const simulatedResult = `https://example.com/uploaded-qr-${Date.now()}`
          addQRResult(simulatedResult)
        }, 1000)
      }
      reader.readAsDataURL(file)
    }
  }

  const addQRResult = (text: string) => {
    const newResult: QRResult = {
      text,
      format: 'QR Code',
      timestamp: new Date()
    }
    
    setQrResults(prev => [newResult, ...prev])
    
    toast({
      title: "QR Code Detected",
      description: "QR code content has been extracted",
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const clearResults = () => {
    setQrResults([])
  }

  const generateQRFromText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter some text to generate QR code",
        variant: "destructive",
      })
      return
    }

    // For demo purposes, we'll add the text as if it was scanned
    addQRResult(inputText)
    setInputText('')
  }

  const loadSampleQR = () => {
    addQRResult('https://www.example.com')
    addQRResult('Hello, World!')
    addQRResult('mailto:contact@example.com?subject=Test&body=Message')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">QR Code Reader</h1>
        <p className="text-muted-foreground">
          Scan QR codes using your camera or upload images
        </p>
      </div>

      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="camera">Camera Scan</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="text">Text Input</TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Camera Scanner
                </CardTitle>
                <CardDescription>
                  Point your camera at a QR code to scan it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {isScanning ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Camera className="h-16 w-16" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-4 border-blue-500 rounded-lg"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={isScanning ? stopCamera : startCamera} 
                    className="flex-1"
                  >
                    {isScanning ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Stop Scanning
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </>
                    )}
                  </Button>
                  <Button onClick={loadSampleQR} variant="outline">
                    Load Sample
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>• Position QR code within the frame</p>
                  <p>• Ensure good lighting conditions</p>
                  <p>• Hold device steady for best results</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Scan className="h-5 w-5" />
                    Recent Scans
                  </span>
                  <Button onClick={clearResults} variant="outline" size="sm">
                    Clear
                  </Button>
                </CardTitle>
                <CardDescription>
                  QR codes detected from camera
                </CardDescription>
              </CardHeader>
              <CardContent>
                {qrResults.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No QR codes detected yet</p>
                    <p className="text-sm">Start scanning to see results here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {qrResults.map((result, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <Badge variant="secondary">{result.format}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm font-mono break-all">
                          {result.text}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.text, 'QR Code Content')}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Upload an image containing a QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded QR code" 
                        className="max-w-full max-h-48 mx-auto rounded-lg"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setUploadedImage(null)}
                        size="sm"
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">
                            Click to upload an image
                          </span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Supports JPG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Tip:</strong> For best results, use clear images with good contrast and proper lighting.</p>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Extracted Content
                </CardTitle>
                <CardDescription>
                  QR code content from uploaded images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {qrResults.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No QR codes detected yet</p>
                    <p className="text-sm">Upload an image to extract QR code content</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {qrResults.map((result, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <Badge variant="secondary">{result.format}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm font-mono break-all">
                          {result.text}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.text, 'QR Code Content')}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Generate QR from Text
                </CardTitle>
                <CardDescription>
                  Enter text to simulate QR code generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter text, URL, or other content..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                
                <div className="flex gap-2">
                  <Button onClick={generateQRFromText} className="flex-1">
                    Generate QR
                  </Button>
                  <Button onClick={loadSampleQR} variant="outline" className="flex-1">
                    Load Sample
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Note:</strong> This mode simulates QR code generation for testing purposes.</p>
                  <p className="mt-1">Common QR code content types:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Website URLs</li>
                    <li>Contact information (vCard)</li>
                    <li>WiFi network credentials</li>
                    <li>Email addresses</li>
                    <li>Plain text messages</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Examples</CardTitle>
                <CardDescription>
                  Common types of QR codes and their content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Website URL', example: 'https://www.example.com', description: 'Links to websites' },
                    { type: 'Contact Info', example: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD', description: 'Contact details' },
                    { type: 'WiFi', example: 'WIFI:T:WPA;S:NetworkName;P:Password;;', description: 'WiFi network access' },
                    { type: 'Email', example: 'mailto:contact@example.com?subject=Hello&body=Message', description: 'Email composition' },
                    { type: 'SMS', example: 'sms:+1234567890?body=Hello%20world', description: 'SMS message' },
                    { type: 'Location', example: 'geo:40.7128,-74.0060', description: 'Geographic coordinates' }
                  ].map((example, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="font-semibold">{example.type}</div>
                      <div className="text-xs font-mono break-all text-blue-600">
                        {example.example}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {example.description}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInputText(example.example)
                          generateQRFromText()
                        }}
                        className="w-full"
                      >
                        Use This Example
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}