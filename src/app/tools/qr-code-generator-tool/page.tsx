'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, QrCode, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function QRCodeGeneratorTool() {
  const [inputText, setInputText] = useState('')
  const [qrSize, setQrSize] = useState(200)
  const [errorCorrection, setErrorCorrection] = useState('M')
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [includeLogo, setIncludeLogo] = useState(false)
  const [logoSize, setLogoSize] = useState(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const errorCorrectionLevels = [
    { value: 'L', label: 'Low (7%)', description: 'Recovery up to 7%' },
    { value: 'M', label: 'Medium (15%)', description: 'Recovery up to 15%' },
    { value: 'Q', label: 'Quartile (25%)', description: 'Recovery up to 25%' },
    { value: 'H', label: 'High (30%)', description: 'Recovery up to 30%' }
  ]

  const generateQRCode = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text or URL to generate QR code",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Dynamically import qrcode library
      const QRCode = (await import('qrcode')).default

      const canvas = canvasRef.current
      if (!canvas) return

      const options = {
        errorCorrectionLevel: errorCorrection,
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        },
        width: qrSize
      }

      await QRCode.toCanvas(canvas, inputText, options)

      if (includeLogo) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Draw a simple placeholder for logo
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(
            canvas.width / 2 - logoSize / 2,
            canvas.height / 2 - logoSize / 2,
            logoSize,
            logoSize
          )
          ctx.fillStyle = '#000000'
          ctx.font = `${logoSize / 2}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            'LOGO',
            canvas.width / 2,
            canvas.height / 2
          )
        }
      }
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const copyQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const item = new ClipboardItem({ 'image/png': blob })
        navigator.clipboard.write([item]).then(() => {
          toast({
            title: "Copied to clipboard",
            description: "QR code has been copied to clipboard",
          })
        })
      }
    })
  }

  const loadExample = (example: string) => {
    setInputText(example)
  }

  const clearAll = () => {
    setInputText('')
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const examples = [
    { name: 'Website URL', text: 'https://www.example.com' },
    { name: 'Email Address', text: 'mailto:contact@example.com' },
    { name: 'Phone Number', text: 'tel:+1234567890' },
    { name: 'WiFi Network', text: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;' },
    { name: 'Plain Text', text: 'Hello World! This is a QR code example.' }
  ]

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            QR Code Generator
          </CardTitle>
          <CardDescription>
            Generate custom QR codes for URLs, text, contact information, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList>
                <TabsTrigger value="generator">Generator</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="qr-text">Text or URL:</Label>
                      <Textarea
                        id="qr-text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text, URL, or any content to encode..."
                        className="min-h-24"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={generateQRCode} disabled={isGenerating || !inputText.trim()}>
                        {isGenerating ? 'Generating...' : 'Generate QR Code'}
                      </Button>
                      <Button variant="outline" onClick={clearAll}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>

                    {/* Quick Examples */}
                    <div className="space-y-2">
                      <Label>Quick Examples:</Label>
                      <div className="flex flex-wrap gap-2">
                        {examples.map((example, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => loadExample(example.text)}
                          >
                            {example.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* QR Code Display */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Generated QR Code:</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadQRCode}
                          disabled={!inputText.trim()}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyQRCode}
                          disabled={!inputText.trim()}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <canvas
                        ref={canvasRef}
                        width={qrSize}
                        height={qrSize}
                        className="max-w-full h-auto"
                      />
                    </div>

                    {inputText && (
                      <div className="space-y-2">
                        <Label>Encoded Content:</Label>
                        <div className="text-sm bg-muted p-3 rounded break-all font-mono">
                          {inputText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Website URL</CardTitle>
                      <CardDescription className="text-sm">
                        QR codes that link to websites
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                          https://www.example.com
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadExample('https://www.example.com')}
                          className="w-full"
                        >
                          Use This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Email Address</CardTitle>
                      <CardDescription className="text-sm">
                        QR codes that open email clients
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                          mailto:contact@example.com
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadExample('mailto:contact@example.com')}
                          className="w-full"
                        >
                          Use This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Phone Number</CardTitle>
                      <CardDescription className="text-sm">
                        QR codes that initiate phone calls
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                          tel:+1234567890
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadExample('tel:+1234567890')}
                          className="w-full"
                        >
                          Use This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">WiFi Network</CardTitle>
                      <CardDescription className="text-sm">
                        QR codes for WiFi network configuration
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                          WIFI:T:WPA;S:MyNetwork;P:MyPassword;;
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadExample('WIFI:T:WPA;S:MyNetwork;P:MyPassword;;')}
                          className="w-full"
                        >
                          Use This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Plain Text</CardTitle>
                      <CardDescription className="text-sm">
                        QR codes containing plain text messages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                          Hello World! This is a QR code example.
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadExample('Hello World! This is a QR code example.')}
                          className="w-full"
                        >
                          Use This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Location</CardTitle>
                      <CardDescription className="text-sm">
                        QR codes with geographic coordinates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-mono bg-muted p-2 rounded break-all">
                          geo:37.7749,-122.4194
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadExample('geo:37.7749,-122.4194')}
                          className="w-full"
                        >
                          Use This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="qr-size">QR Code Size:</Label>
                      <Select value={qrSize.toString()} onValueChange={(value) => setQrSize(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100x100 pixels</SelectItem>
                          <SelectItem value="150">150x150 pixels</SelectItem>
                          <SelectItem value="200">200x200 pixels</SelectItem>
                          <SelectItem value="300">300x300 pixels</SelectItem>
                          <SelectItem value="400">400x400 pixels</SelectItem>
                          <SelectItem value="500">500x500 pixels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="error-correction">Error Correction Level:</Label>
                      <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {errorCorrectionLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-muted-foreground">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="foreground-color">Foreground Color:</Label>
                      <div className="flex gap-2">
                        <Input
                          id="foreground-color"
                          type="color"
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="w-16 h-10 p-0 border-0"
                        />
                        <Input
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="background-color">Background Color:</Label>
                      <div className="flex gap-2">
                        <Input
                          id="background-color"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-16 h-10 p-0 border-0"
                        />
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-logo"
                          checked={includeLogo}
                          onCheckedChange={(checked) => setIncludeLogo(checked as boolean)}
                        />
                        <Label htmlFor="include-logo">Include Logo</Label>
                      </div>

                      {includeLogo && (
                        <div className="space-y-2 ml-6">
                          <Label htmlFor="logo-size">Logo Size:</Label>
                          <Select value={logoSize.toString()} onValueChange={(value) => setLogoSize(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20">20x20 pixels</SelectItem>
                              <SelectItem value="30">30x30 pixels</SelectItem>
                              <SelectItem value="40">40x40 pixels</SelectItem>
                              <SelectItem value="50">50x50 pixels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tips for Best Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                          <li>• Use high error correction for codes that might be damaged</li>
                          <li>• Ensure good contrast between foreground and background colors</li>
                          <li>• Keep logos small to maintain scanability</li>
                          <li>• Test QR codes before printing on materials</li>
                          <li>• Avoid very small sizes for print materials</li>
                          <li>• Use plain text for maximum compatibility</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enter any text, URL, or data in the input field</li>
                <li>• Click "Generate QR Code" to create your QR code</li>
                <li>• Use quick examples for common QR code types</li>
                <li>• Customize appearance in the Settings tab</li>
                <li>• Download or copy the generated QR code</li>
                <li>• Test QR codes before using them in production</li>
                <li>• Supported formats: URLs, email, phone, WiFi, text, and more</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}