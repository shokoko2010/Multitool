'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Upload, Download, Copy, RefreshCw, QrCode, Link, Text, Wifi, Email, Phone } from 'lucide-react'

interface QRCodeResult {
  type: 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'unknown'
  content: string
  parsed?: {
    ssid?: string
    password?: string
    security?: string
    email?: string
    subject?: string
    phone?: string
    url?: string
  }
  timestamp: Date
}

interface ScanHistory {
  id: string
  result: QRCodeResult
  timestamp: Date
}

export default function QRCodeScanner() {
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanResult, setScanResult] = useState<QRCodeResult | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const parseQRContent = (content: string): QRCodeResult => {
    const result: QRCodeResult = {
      type: 'unknown',
      content,
      timestamp: new Date()
    }

    // URL detection
    if (content.match(/^https?:\/\//i)) {
      result.type = 'url'
      result.parsed = { url: content }
      return result
    }

    // WiFi detection (WIFI:S:SSID;T:WPA;P:PASSWORD;H:false;;)
    const wifiMatch = content.match(/^WIFI:S:([^;]+);T:([^;]+);P:([^;]+);/i)
    if (wifiMatch) {
      result.type = 'wifi'
      result.parsed = {
        ssid: wifiMatch[1],
        password: wifiMatch[3],
        security: wifiMatch[2]
      }
      return result
    }

    // Email detection (mailto:email?subject=subject)
    const emailMatch = content.match(/^mailto:([^?]+)(?:\?subject=([^&]+))?/i)
    if (emailMatch) {
      result.type = 'email'
      result.parsed = {
        email: emailMatch[1],
        subject: emailMatch[2] || ''
      }
      return result
    }

    // Phone detection (tel:+1234567890)
    const phoneMatch = content.match(/^tel:(\+?\d+)/i)
    if (phoneMatch) {
      result.type = 'phone'
      result.parsed = { phone: phoneMatch[1] }
      return result
    }

    // Default to text
    result.type = 'text'
    return result
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        setIsScanning(true)
        
        // Simulate QR code detection
        setTimeout(() => {
          const mockContent = 'https://example.com/qr-demo'
          const result = parseQRContent(mockContent)
          setScanResult(result)
          setIsScanning(false)
          
          // Add to history
          const historyItem: ScanHistory = {
            id: Date.now().toString(),
            result,
            timestamp: new Date()
          }
          setScanHistory(prev => [historyItem, ...prev.slice(0, 9)])
        }, 2000)
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      alert('Camera access is required for scanning QR codes')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setIsScanning(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Simulate QR code reading from file
      setTimeout(() => {
        const mockContent = 'Sample QR code content from uploaded file'
        const result = parseQRContent(mockContent)
        setScanResult(result)
        
        // Add to history
        const historyItem: ScanHistory = {
          id: Date.now().toString(),
          result,
          timestamp: new Date()
        }
        setScanHistory(prev => [historyItem, ...prev.slice(0, 9)])
      }, 1000)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Type', 'Content'],
      ...scanHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.result.type,
        item.result.content
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-scan-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearResult = () => {
    setScanResult(null)
    setSelectedFile(null)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const getTypeIcon = (type: string) => {
    const icons = {
      'url': <Link className="h-4 w-4" />,
      'text': <Text className="h-4 w-4" />,
      'wifi': <Wifi className="h-4 w-4" />,
      'email': <Email className="h-4 w-4" />,
      'phone': <Phone className="h-4 w-4" />,
      'unknown': <QrCode className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <QrCode className="h-4 w-4" />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'url': 'bg-blue-100 text-blue-800',
      'text': 'bg-gray-100 text-gray-800',
      'wifi': 'bg-green-100 text-green-800',
      'email': 'bg-purple-100 text-purple-800',
      'phone': 'bg-orange-100 text-orange-800',
      'unknown': 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan QR codes using your camera or upload an image</p>
      </div>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Choose a scanning method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Camera Scan</CardTitle>
                    <CardDescription>
                      Use your device camera to scan QR codes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      {cameraActive ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Camera not active</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={cameraActive ? stopCamera : startCamera}
                        className="flex-1"
                        disabled={isScanning}
                      >
                        {cameraActive ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Stop Camera
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Start Camera
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">File Upload</CardTitle>
                    <CardDescription>
                      Upload an image containing a QR code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {selectedFile ? selectedFile.name : 'No file selected'}
                        </p>
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {isScanning && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Scanning for QR code...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {scanResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Scan Result</span>
                      <Button variant="outline" size="sm" onClick={clearResult}>
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      QR code content and parsed information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(scanResult.type)}
                      <Badge className={getTypeColor(scanResult.type)}>
                        {scanResult.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {scanResult.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Content</Label>
                        <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                          {scanResult.content}
                        </div>
                      </div>

                      {scanResult.parsed && (
                        <div>
                          <Label className="text-sm font-medium">Parsed Information</Label>
                          <div className="space-y-2 mt-2">
                            {scanResult.type === 'url' && scanResult.parsed.url && (
                              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm">URL:</span>
                                <a 
                                  href={scanResult.parsed.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {scanResult.parsed.url}
                                </a>
                              </div>
                            )}
                            {scanResult.type === 'wifi' && (
                              <>
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                  <span className="text-sm">Network:</span>
                                  <span className="text-sm font-medium">{scanResult.parsed.ssid}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                  <span className="text-sm">Password:</span>
                                  <span className="text-sm font-mono">{scanResult.parsed.password}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                  <span className="text-sm">Security:</span>
                                  <span className="text-sm font-medium">{scanResult.parsed.security}</span>
                                </div>
                              </>
                            )}
                            {scanResult.type === 'email' && scanResult.parsed.email && (
                              <>
                                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                                  <span className="text-sm">Email:</span>
                                  <a 
                                    href={`mailto:${scanResult.parsed.email}`} 
                                    className="text-sm text-purple-600 hover:underline"
                                  >
                                    {scanResult.parsed.email}
                                  </a>
                                </div>
                                {scanResult.parsed.subject && (
                                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                                    <span className="text-sm">Subject:</span>
                                    <span className="text-sm">{scanResult.parsed.subject}</span>
                                  </div>
                                )}
                              </>
                            )}
                            {scanResult.type === 'phone' && scanResult.parsed.phone && (
                              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                                <span className="text-sm">Phone:</span>
                                <a 
                                  href={`tel:${scanResult.parsed.phone}`} 
                                  className="text-sm text-orange-600 hover:underline"
                                >
                                  {scanResult.parsed.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(scanResult.content)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported QR Code Types</CardTitle>
              <CardDescription>
                Types of QR codes that can be scanned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <Link className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium text-sm">URLs</div>
                  <div className="text-xs text-muted-foreground">Website links</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Text className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                  <div className="font-medium text-sm">Text</div>
                  <div className="text-xs text-muted-foreground">Plain text</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Wifi className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="font-medium text-sm">WiFi</div>
                  <div className="text-xs text-muted-foreground">Network credentials</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Email className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="font-medium text-sm">Email</div>
                  <div className="text-xs text-muted-foreground">Email addresses</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Phone className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="font-medium text-sm">Phone</div>
                  <div className="text-xs text-muted-foreground">Phone numbers</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <QrCode className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                  <div className="font-medium text-sm">Other</div>
                  <div className="text-xs text-muted-foreground">Various formats</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Scan History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHistory}
                  disabled={scanHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Your recent QR code scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scan history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(item.result.type)}
                          <Badge className={getTypeColor(item.result.type)}>
                            {item.result.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium truncate">
                          {item.result.content.length > 50 
                            ? item.result.content.substring(0, 50) + '...' 
                            : item.result.content
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.result.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
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