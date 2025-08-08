'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Palette, Copy, Eye, Droplet } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ColorFormats {
  hex: string
  rgb: string
  rgba: string
  hsl: string
  hsla: string
  hsv: string
  cmyk: string
}

export default function ColorConverterTool() {
  const [inputColor, setInputColor] = useState('#3b82f6')
  const [colorFormats, setColorFormats] = useState<ColorFormats>({
    hex: '',
    rgb: '',
    rgba: '',
    hsl: '',
    hsla: '',
    hsv: '',
    cmyk: ''
  })
  const [isValidColor, setIsValidColor] = useState(true)
  const { toast } = useToast()

  // Convert HEX to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, v = max

    const d = max - min
    s = max === 0 ? 0 : d / max

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    }
  }

  // Convert RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255
    g /= 255
    b /= 255

    const k = 1 - Math.max(r, g, b)
    const c = (1 - r - k) / (1 - k) || 0
    const m = (1 - g - k) / (1 - k) || 0
    const y = (1 - b - k) / (1 - k) || 0

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    }
  }

  // Validate and convert color
  const convertColor = (color: string): ColorFormats | null => {
    // Clean the input
    let cleanColor = color.trim().toLowerCase()
    
    // Add # if missing
    if (!cleanColor.startsWith('#') && cleanColor.length === 6) {
      cleanColor = `#${cleanColor}`
    }

    // Try to parse as HEX
    let rgb = hexToRgb(cleanColor)
    
    if (!rgb && cleanColor.startsWith('#')) {
      // Try 3-digit hex
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
      const result = shorthandRegex.exec(cleanColor)
      if (result) {
        rgb = {
          r: parseInt(result[1] + result[1], 16),
          g: parseInt(result[2] + result[2], 16),
          b: parseInt(result[3] + result[3], 16)
        }
      }
    }

    if (!rgb) {
      setIsValidColor(false)
      return null
    }

    setIsValidColor(true)

    const { r, g, b } = rgb
    const hsl = rgbToHsl(r, g, b)
    const hsv = rgbToHsv(r, g, b)
    const cmyk = rgbToCmyk(r, g, b)

    return {
      hex: cleanColor,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, 1)`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
    }
  }

  useEffect(() => {
    const formats = convertColor(inputColor)
    if (formats) {
      setColorFormats(formats)
    }
  }, [inputColor])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `Color value ${text} copied to clipboard.`,
    })
  }

  const presetColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Color Converter</span>
          </CardTitle>
          <CardDescription>
            Convert colors between HEX, RGB, HSL, HSV, and CMYK formats. Get color codes for CSS and design work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color-input">Enter Color</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="color-input"
                  placeholder="#3b82f6 or rgb(59, 130, 246)"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="font-mono"
                />
                <div 
                  className="w-12 h-10 rounded border border-gray-300"
                  style={{ backgroundColor: isValidColor ? inputColor : '#f3f4f6' }}
                />
              </div>
              {!isValidColor && (
                <p className="text-sm text-red-600 mt-1">Invalid color format</p>
              )}
            </div>
            
            <div>
              <Label>Quick Presets</Label>
              <div className="flex space-x-2 mt-1 flex-wrap">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setInputColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Color Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="w-full h-48 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: isValidColor ? inputColor : '#f3f4f6' }}
            />
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">CSS Examples</Label>
                <div className="mt-2 space-y-2">
                  <code className="block text-sm bg-gray-100 p-2 rounded">
                    background-color: {colorFormats.hex};
                  </code>
                  <code className="block text-sm bg-gray-100 p-2 rounded">
                    background-color: {colorFormats.rgb};
                  </code>
                  <code className="block text-sm bg-gray-100 p-2 rounded">
                    background-color: {colorFormats.hsl};
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplet className="h-5 w-5" />
              <span>Color Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">HEX</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono">{colorFormats.hex}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(colorFormats.hex)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">RGB</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono">{colorFormats.rgb}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(colorFormats.rgb)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">HSL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono">{colorFormats.hsl}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(colorFormats.hsl)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">HSV</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono">{colorFormats.hsv}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(colorFormats.hsv)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">CMYK</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono">{colorFormats.cmyk}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(colorFormats.cmyk)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">RGBA</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono">{colorFormats.rgba}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(colorFormats.rgba)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Format Details */}
      <Card>
        <CardHeader>
          <CardTitle>Color Format Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hex" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="hex">HEX</TabsTrigger>
              <TabsTrigger value="rgb">RGB</TabsTrigger>
              <TabsTrigger value="hsl">HSL</TabsTrigger>
              <TabsTrigger value="hsv">HSV</TabsTrigger>
              <TabsTrigger value="cmyk">CMYK</TabsTrigger>
              <TabsTrigger value="rgba">RGBA</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hex" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>HEX Format</Label>
                  <p className="text-sm text-muted-foreground">
                    Hexadecimal color notation, using # followed by 3 or 6 hexadecimal digits.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <code className="text-sm">#RRGGBB or #RGB</code>
                  <p className="text-xs text-gray-600 mt-1">
                    RR = Red (00-FF), GG = Green (00-FF), BB = Blue (00-FF)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">CSS</Badge>
                  <Badge variant="outline">SVG</Badge>
                  <Badge variant="outline">Design Tools</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rgb" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>RGB Format</Label>
                  <p className="text-sm text-muted-foreground">
                    Red, Green, Blue values from 0-255. Most precise representation of colors on screens.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <code className="text-sm">rgb(R, G, B)</code>
                  <p className="text-xs text-gray-600 mt-1">
                    R, G, B = 0-255 (integer values)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">CSS</Badge>
                  <Badge variant="outline">Canvas</Badge>
                  <Badge variant="outline">JavaScript</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hsl" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>HSL Format</Label>
                  <p className="text-sm text-muted-foreground">
                    Hue, Saturation, Lightness. Intuitive for color manipulation and design.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <code className="text-sm">hsl(H, S%, L%)</code>
                  <p className="text-xs text-gray-600 mt-1">
                    H = 0-360°, S = 0-100%, L = 0-100%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">CSS</Badge>
                  <Badge variant="outline">Design</Badge>
                  <Badge variant="outline">Color Theory</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hsv" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>HSV Format</Label>
                  <p className="text-sm text-muted-foreground">
                    Hue, Saturation, Value. Similar to HSL but based on color intensity.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <code className="text-sm">hsv(H, S%, V%)</code>
                  <p className="text-xs text-gray-600 mt-1">
                    H = 0-360°, S = 0-100%, V = 0-100%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Graphics</Badge>
                  <Badge variant="outline">Image Processing</Badge>
                  <Badge variant="outline">Color Selection</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cmyk" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>CMYK Format</Label>
                  <p className="text-sm text-muted-foreground">
                    Cyan, Magenta, Yellow, Key (Black). Used for print color mixing.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <code className="text-sm">cmyk(C%, M%, Y%, K%)</code>
                  <p className="text-xs text-gray-600 mt-1">
                    C, M, Y, K = 0-100%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Print</Badge>
                  <Badge variant="outline">Design</Badge>
                  <Badge variant="outline">Prepress</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rgba" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>RGBA Format</Label>
                  <p className="text-sm text-muted-foreground">
                    RGB with Alpha channel for transparency control.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <code className="text-sm">rgba(R, G, B, A)</code>
                  <p className="text-xs text-gray-600 mt-1">
                    R, G, B = 0-255, A = 0.0-1.0
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">CSS</Badge>
                  <Badge variant="outline">UI Design</Badge>
                  <Badge variant="outline">Overlays</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">When to Use Each Format:</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>HEX:</strong> Web design, CSS, quick color selection
                  </li>
                  <li>
                    <strong>RGB:</strong> Precise color control, JavaScript manipulation
                  </li>
                  <li>
                    <strong>HSL:</strong> Color design, adjustments, creating color schemes
                  </li>
                  <li>
                    <strong>HSV:</strong> Color picking interfaces, graphics software
                  </li>
                  <li>
                    <strong>CMYK:</strong> Print design, professional printing
                  </li>
                  <li>
                    <strong>RGBA:</strong> When transparency is needed in web design
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}