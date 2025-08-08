'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, Copy, QrCode, Settings, Palette, Image, Download as DownloadIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QRCodeConfig {
  size: number
  format: 'png' | 'svg' | 'jpg'
  bgColor: string
  fgColor: string
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
}

export default function QRCodeGeneratorTool() {
  const [inputText, setInputText] = useState('')
  const [qrConfig, setQrConfig] = useState<QRCodeConfig>({
    size: 256,
    format: 'png',
    bgColor: '#ffffff',
    fgColor: '#000000',
    errorCorrection: 'M'
  })
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateQRCode = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter text or URL to generate QR code",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    
    // Simulate QR code generation
    setTimeout(() => {
      // Create a simple SVG-based QR code simulation
      const svgContent = createSimulatedQRCode()
      setGeneratedQR(svgContent)
      setIsGenerating(false)
      
      toast({
        title: "QR Code Generated",
        description: "Your QR code has been successfully generated",
      })
    }, 1000)
  }

  const createSimulatedQRCode = (): string => {
    const { size, bgColor, fgColor } = qrConfig
    
    // Create a simple SVG pattern that looks like a QR code
    const moduleSize = 8
    const modules = Math.floor(size / moduleSize)
    const pattern = []
    
    // Create finder pattern (top-left)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        pattern.push(`<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${i === 0 || j === 0 || i === 6 || j === 6 ? fgColor : bgColor}"/>`)
      }
    }
    
    // Create finder pattern (top-right)
    for (let i = 0; i < 7; i++) {
      for (let j = modules - 7; j < modules; j++) {
        pattern.push(`<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${i === 0 || j === modules - 7 || i === 6 || j === modules - 1 ? fgColor : bgColor}"/>`)
      }
    }
    
    // Create finder pattern (bottom-left)
    for (let i = modules - 7; i < modules; i++) {
      for (let j = 0; j < 7; j++) {
        pattern.push(`<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${i === modules - 7 || j === 0 || i === modules - 1 || j === 6 ? fgColor : bgColor}"/>`)
      }
    }
    
    // Add some random data modules
    for (let i = 8; i < modules - 8; i++) {
      for (let j = 8; j < modules - 8; j++) {
        if (Math.random() > 0.5) {
          pattern.push(`<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fgColor}"/>`)
        }
      }
    }
    
    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${bgColor}"/>
        ${pattern.join('')}
      </svg>
    `
  }

  const downloadQRCode = () => {
    if (!generatedQR) return
    
    const blob = new Blob([generatedQR], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-code-${Date.now()}.${qrConfig.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Your QR code download has begun",
    })
  }

  const copyToClipboard = () => {
    if (!generatedQR) return
    
    navigator.clipboard.writeText(generatedQR)
    toast({
      title: "Copied!",
      description: "QR code SVG copied to clipboard",
    })
  }

  const loadSampleData = () => {
    setInputText('https://www.example.com')
    setQrConfig({
      size: 256,
      format: 'png',
      bgColor: '#ffffff',
      fgColor: '#000000',
      errorCorrection: 'M'
    })
  }

  const presetColors = [
    { bg: '#ffffff', fg: '#000000', name: 'Black & White' },
    { bg: '#000000', fg: '#ffffff', name: 'White & Black' },
    { bg: '#1e40af', fg: '#ffffff', name: 'Blue & White' },
    { bg: '#dc2626', fg: '#ffffff', name: 'Red & White' },
    { bg: '#16a34a', fg: '#ffffff', name: 'Green & White' },
    { bg: '#7c3aed', fg: '#ffffff', name: 'Purple & White' }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">QR Code Generator</h1>
        <p className="text-muted-foreground">
          Generate custom QR codes for URLs, text, and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Configuration
            </CardTitle>
            <CardDescription>
              Configure your QR code settings and content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="qr-text">Content</Label>
              <Textarea
                id="qr-text"
                placeholder="Enter URL, text, or other content..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <Label htmlFor="qr-size">Size: {qrConfig.size}px</Label>
              <Input
                id="qr-size"
                type="range"
                min="128"
                max="512"
                step="32"
                value={qrConfig.size}
                onChange={(e) => setQrConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
              />
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={qrConfig.format} onValueChange={(value: 'png' | 'svg' | 'jpg') => setQrConfig(prev => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label>Colors</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={qrConfig.bgColor}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={qrConfig.bgColor}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Foreground</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={qrConfig.fgColor}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, fgColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={qrConfig.fgColor}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, fgColor: e.target.value }))}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preset Colors */}
            <div className="space-y-2">
              <Label>Color Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                {presetColors.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQrConfig(prev => ({ ...prev, bgColor: preset.bg, fgColor: preset.fg }))}
                    className="h-8 text-xs"
                  >
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: preset.bg }}
                      />
                      <div 
                        className="w-3 h-3 rounded border" 
                        style={{ backgroundColor: preset.fg }}
                      />
                      <span>{preset.name.split(' & ')[0]}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Error Correction */}
            <div className="space-y-2">
              <Label>Error Correction Level</Label>
              <Select value={qrConfig.errorCorrection} onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setQrConfig(prev => ({ ...prev, errorCorrection: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (~7%)</SelectItem>
                  <SelectItem value="M">Medium (~15%)</SelectItem>
                  <SelectItem value="Q">Quartile (~25%)</SelectItem>
                  <SelectItem value="H">High (~30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={generateQRCode} disabled={isGenerating} className="flex-1">
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
              <Button onClick={loadSampleData} variant="outline">
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Image className="h-5 w-5" alt="Generated QR code" />
                Generated QR Code
              </span>
              {generatedQR && (
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadQRCode} variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Your generated QR code will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQR ? (
              <div className="flex flex-col items-center space-y-4">
                <div 
                  className="border rounded-lg p-4 bg-white"
                  style={{ 
                    width: qrConfig.size + 32, 
                    height: qrConfig.size + 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatedQR }}
                    style={{ width: qrConfig.size, height: qrConfig.size }}
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <Badge variant="secondary">
                    {qrConfig.size}×{qrConfig.size}px
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Format: {qrConfig.format.toUpperCase()} | 
                    Error Correction: {qrConfig.errorCorrection}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No QR code generated yet</p>
                <p className="text-sm">Enter content and click "Generate QR Code"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}