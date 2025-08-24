'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, Image, Palette, Type, Settings } from 'lucide-react'

interface FaviconConfig {
  text: string
  fontSize: number
  textColor: string
  backgroundColor: string
  shape: 'square' | 'circle' | 'rounded'
  size: number
  format: 'png' | 'ico' | 'svg'
}

export default function FaviconGenerator() {
  const [config, setConfig] = useState<FaviconConfig>({
    text: 'A',
    fontSize: 40,
    textColor: '#ffffff',
    backgroundColor: '#3b82f6',
    shape: 'rounded',
    size: 32,
    format: 'png'
  })
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateFavicon = async () => {
    if (!config.text.trim()) {
      setError('Please enter text for the favicon')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const canvas = canvasRef.current
      if (!canvas) {
        throw new Error('Canvas not available')
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Canvas context not available')
      }

      // Set canvas size
      canvas.width = config.size
      canvas.height = config.size

      // Clear canvas
      ctx.clearRect(0, 0, config.size, config.size)

      // Draw background
      ctx.fillStyle = config.backgroundColor
      if (config.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(config.size / 2, config.size / 2, config.size / 2, 0, 2 * Math.PI)
        ctx.fill()
      } else if (config.shape === 'rounded') {
        const radius = config.size * 0.2
        ctx.beginPath()
        ctx.moveTo(radius, 0)
        ctx.lineTo(config.size - radius, 0)
        ctx.quadraticCurveTo(config.size, 0, config.size, radius)
        ctx.lineTo(config.size, config.size - radius)
        ctx.quadraticCurveTo(config.size, config.size, config.size - radius, config.size)
        ctx.lineTo(radius, config.size)
        ctx.quadraticCurveTo(0, config.size, 0, config.size - radius)
        ctx.lineTo(0, radius)
        ctx.quadraticCurveTo(0, 0, radius, 0)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.fillRect(0, 0, config.size, config.size)
      }

      // Draw text
      ctx.fillStyle = config.textColor
      ctx.font = `bold ${config.fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.text, config.size / 2, config.size / 2)

      // Generate preview URL
      setPreviewUrl(canvas.toDataURL('image/png'))

    } catch (err) {
      setError('Failed to generate favicon: ' + (err as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadFavicon = () => {
    if (!previewUrl) return

    const canvas = canvasRef.current
    if (!canvas) return

    let blob: Blob
    let filename: string

    if (config.format === 'svg') {
      // Generate SVG
      const svgContent = `<svg width="${config.size}" height="${config.size}" xmlns="http://www.w3.org/2000/svg">
        ${config.shape === 'circle' ? 
          `<circle cx="${config.size/2}" cy="${config.size/2}" r="${config.size/2}" fill="${config.backgroundColor}"/>` :
          config.shape === 'rounded' ?
          `<rect x="0" y="0" width="${config.size}" height="${config.size}" rx="${config.size * 0.2}" fill="${config.backgroundColor}"/>` :
          `<rect x="0" y="0" width="${config.size}" height="${config.size}" fill="${config.backgroundColor}"/>`
        }
        <text x="${config.size/2}" y="${config.size/2}" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial" font-size="${config.fontSize}" font-weight="bold" fill="${config.textColor}">
          ${config.text}
        </text>
      </svg>`
      
      blob = new Blob([svgContent], { type: 'image/svg+xml' })
      filename = 'favicon.svg'
    } else {
      // Generate PNG or ICO
      if (config.format === 'ico') {
        // For ICO, we'll create a simple version (real ICO would require more complex format)
        blob = new Blob([canvasToBuffer(canvas)], { type: 'image/x-icon' })
        filename = 'favicon.ico'
      } else {
        canvas.toBlob((blobData) => {
          if (blobData) {
            const url = URL.createObjectURL(blobData)
            const a = document.createElement('a')
            a.href = url
            a.download = 'favicon.png'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        }, 'image/png')
        return
      }
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const canvasToBuffer = (canvas: HTMLCanvasElement): ArrayBuffer => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return new ArrayBuffer(0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return imageData.data.buffer
  }

  const updateConfig = (key: keyof FaviconConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const colorPresets = [
    { name: 'Blue', bg: '#3b82f6', text: '#ffffff' },
    { name: 'Red', bg: '#ef4444', text: '#ffffff' },
    { name: 'Green', bg: '#10b981', text: '#ffffff' },
    { name: 'Purple', bg: '#8b5cf6', text: '#ffffff' },
    { name: 'Orange', bg: '#f97316', text: '#ffffff' },
    { name: 'Pink', bg: '#ec4899', text: '#ffffff' },
    { name: 'Gray', bg: '#6b7280', text: '#ffffff' },
    { name: 'Dark', bg: '#1f2937', text: '#ffffff' },
    { name: 'Light', bg: '#f3f4f6', text: '#1f2937' },
    { name: 'Yellow', bg: '#eab308', text: '#000000' }
  ]

  const sizePresets = [
    { name: '16x16', value: 16 },
    { name: '32x32', value: 32 },
    { name: '64x64', value: 64 },
    { name: '128x128', value: 128 },
    { name: '256x256', value: 256 }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Favicon Generator</h1>
          <p className="text-muted-foreground">
            Create custom favicons with text and colors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Customize your favicon appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Text (1-2 characters recommended)</Label>
                <Input
                  value={config.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  placeholder="Enter text..."
                  maxLength={2}
                  className="text-center text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label>Font Size: {config.fontSize}px</Label>
                <Input
                  type="range"
                  min="10"
                  max="60"
                  value={config.fontSize}
                  onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.textColor}
                      onChange={(e) => updateConfig('textColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.textColor}
                      onChange={(e) => updateConfig('textColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Shape</Label>
                <Select value={config.shape} onValueChange={(value) => updateConfig('shape', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={config.size.toString()} onValueChange={(value) => updateConfig('size', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizePresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value.toString()}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={config.format} onValueChange={(value) => updateConfig('format', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="ico">ICO</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Presets</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateConfig('backgroundColor', preset.bg)
                        updateConfig('textColor', preset.text)
                      }}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: preset.bg }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={generateFavicon} 
                  disabled={!config.text.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 mr-2" />
                      Generate Favicon
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Preview
              </CardTitle>
              <CardDescription>
                See how your favicon looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Actual Size ({config.size}x{config.size}px)</p>
                  <div className="inline-block border border-gray-300 rounded p-2 bg-white">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Favicon preview"
                        style={{ width: config.size, height: config.size }}
                      />
                    ) : (
                      <div 
                        className="bg-gray-200 flex items-center justify-center"
                        style={{ width: config.size, height: config.size }}
                      >
                        <Type className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Zoomed View (128x128px)</p>
                  <div className="inline-block border border-gray-300 rounded p-2 bg-white">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Favicon preview zoomed"
                        style={{ width: 128, height: 128 }}
                        className="image-rendering-pixelated"
                      />
                    ) : (
                      <div 
                        className="bg-gray-200 flex items-center justify-center"
                        style={{ width: 128, height: 128 }}
                      >
                        <Type className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Browser Tab Preview</p>
                  <div className="inline-block border border-gray-300 rounded bg-white p-2">
                    <div className="flex items-center gap-2">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Favicon browser preview"
                          style={{ width: 16, height: 16 }}
                        />
                      ) : (
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      )}
                      <span className="text-sm">Your Website Title</span>
                    </div>
                  </div>
                </div>

                {previewUrl && (
                  <Button 
                    onClick={downloadFavicon}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {config.format.toUpperCase()}
                  </Button>
                )}
              </div>

              {!previewUrl && (
                <div className="text-center py-8">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    No preview yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Generate a favicon to see the preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Design Tips
              </CardTitle>
              <CardDescription>
                Best practices for favicon design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">🎨 Color & Contrast</h4>
                  <p className="text-xs text-gray-600">Use high contrast colors for better visibility at small sizes</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">📏 Size & Simplicity</h4>
                  <p className="text-xs text-gray-600">Keep it simple - complex designs won't be readable at 16x16px</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">🔤 Text Guidelines</h4>
                  <p className="text-xs text-gray-600">Use 1-2 characters maximum. Letters work better than numbers</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">📱 Multi-size Support</h4>
                  <p className="text-xs text-gray-600">Generate multiple sizes (16x16, 32x32, 64x64) for best results</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">🔍 File Formats</h4>
                  <p className="text-xs text-gray-600">
                    <strong>PNG:</strong> Best for transparency<br/>
                    <strong>ICO:</strong> Traditional format, supports multiple sizes<br/>
                    <strong>SVG:</strong> Scalable, modern choice
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">⚡ Performance</h4>
                  <p className="text-xs text-gray-600">Keep file size small (under 4KB) for fast loading</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}