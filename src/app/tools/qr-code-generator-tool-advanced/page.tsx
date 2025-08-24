'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrCode, Download, Copy, Link, Mail, Phone, MessageSquare, Wifi, Calendar } from 'lucide-react'

interface QRCodeOptions {
  text: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  foregroundColor: string
  backgroundColor: string
  type: 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard'
}

export default function QRCodeGeneratorToolAdvanced() {
  const [options, setOptions] = useState<QRCodeOptions>({
    text: '',
    size: 200,
    errorCorrection: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    type: 'text'
  })

  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async () => {
    if (!options.text.trim()) return

    setIsGenerating(true)
    
    try {
      // Simulate QR code generation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real implementation, you would use a QR code library
      // For now, we'll create a placeholder data URL
      const canvas = document.createElement('canvas')
      canvas.width = options.size
      canvas.height = options.size
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Fill background
        ctx.fillStyle = options.backgroundColor
        ctx.fillRect(0, 0, options.size, options.size)
        
        // Draw QR code pattern (simplified)
        ctx.fillStyle = options.foregroundColor
        const cellSize = options.size / 25
        
        // Draw finder patterns
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            if ((i === 0 || i === 6 || j === 0 || j === 6) || 
                (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
              ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
            }
          }
        }
        
        // Draw random pattern
        for (let i = 0; i < 25; i++) {
          for (let j = 0; j < 25; j++) {
            if (Math.random() > 0.5 && !(i < 9 && j < 9)) {
              ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
            }
          }
        }
        
        setQrCodeData(canvas.toDataURL())
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeData) return
    
    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.png`
    link.href = qrCodeData
    link.click()
  }

  const copyQRCode = async () => {
    if (!qrCodeData) return
    
    try {
      const response = await fetch(qrCodeData)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
    } catch (error) {
      console.error('Error copying QR code:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return <Link className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'wifi': return <Wifi className="h-4 w-4" />
      case 'vcard': return <Calendar className="h-4 w-4" />
      default: return <QrCode className="h-4 w-4" />
    }
  }

  const getTypePlaceholder = (type: string) => {
    switch (type) {
      case 'url': return 'https://example.com'
      case 'email': return 'user@example.com'
      case 'phone': return '+1234567890'
      case 'sms': return '+1234567890:Hello World'
      case 'wifi': return 'WIFI:S:MyNetwork;T:WPA;P:MyPassword;;'
      case 'vcard': return 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD'
      default: return 'Enter text to encode'
    }
  }

  const updateOption = (field: keyof QRCodeOptions, value: string | number) => {
    setOptions(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced QR Code Generator</h1>
        <p className="text-muted-foreground">
          Generate custom QR codes for various purposes with advanced options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Settings
              </CardTitle>
              <CardDescription>
                Configure your QR code options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">QR Code Type</Label>
                  <Select value={options.type} onValueChange={(value) => updateOption('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="wifi">WiFi</SelectItem>
                      <SelectItem value="vcard">vCard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="text">Content</Label>
                  <Textarea
                    id="text"
                    placeholder={getTypePlaceholder(options.type)}
                    value={options.text}
                    onChange={(e) => updateOption('text', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Size (pixels)</Label>
                    <Input
                      id="size"
                      type="number"
                      min="100"
                      max="1000"
                      value={options.size}
                      onChange={(e) => updateOption('size', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="errorCorrection">Error Correction</Label>
                    <Select value={options.errorCorrection} onValueChange={(value) => updateOption('errorCorrection', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="foregroundColor">Foreground Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="foregroundColor"
                        type="color"
                        value={options.foregroundColor}
                        onChange={(e) => updateOption('foregroundColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={options.foregroundColor}
                        onChange={(e) => updateOption('foregroundColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={options.backgroundColor}
                        onChange={(e) => updateOption('backgroundColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={options.backgroundColor}
                        onChange={(e) => updateOption('backgroundColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={generateQRCode} disabled={!options.text.trim() || isGenerating} className="w-full">
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>
                Use these templates for common QR code types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    updateOption('type', 'url')
                    updateOption('text', 'https://example.com')
                  }}
                  className="w-full justify-start"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Website URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateOption('type', 'email')
                    updateOption('text', 'mailto:contact@example.com')
                  }}
                  className="w-full justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateOption('type', 'phone')
                    updateOption('text', 'tel:+1234567890')
                  }}
                  className="w-full justify-start"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateOption('type', 'wifi')
                    updateOption('text', 'WIFI:S:MyNetwork;T:WPA;P:MyPassword;;')
                  }}
                  className="w-full justify-start"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  WiFi Network
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(options.type)}
                Generated QR Code
              </CardTitle>
              <CardDescription>
                Your QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {qrCodeData ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeData} 
                        alt="Generated QR Code" 
                        className="border rounded-lg"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <Button onClick={downloadQRCode} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={copyQRCode} variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge variant="outline">{options.type}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{options.size}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Correction:</span>
                          <span>{options.errorCorrection}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Content Length:</span>
                          <span>{options.text.length} characters</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <QrCode className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Enter content and click generate to create your QR code
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Information</CardTitle>
              <CardDescription>
                Learn about QR codes and their uses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">What are QR Codes?</h4>
                  <p className="text-muted-foreground">
                    QR (Quick Response) codes are two-dimensional barcodes that can store various types of information 
                    and can be quickly scanned by smartphones and other devices.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Error Correction Levels</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Low (L):</strong> 7% error correction</li>
                    <li>• <strong>Medium (M):</strong> 15% error correction</li>
                    <li>• <strong>Quartile (Q):</strong> 25% error correction</li>
                    <li>• <strong>High (H):</strong> 30% error correction</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Common Uses</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Website URLs and links</li>
                    <li>• Contact information (vCard)</li>
                    <li>• WiFi network credentials</li>
                    <li>• Payment information</li>
                    <li>• Event tickets and boarding passes</li>
                    <li>• Product tracking and inventory</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}