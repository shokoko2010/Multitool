'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, RefreshCw, Palette, Eye, EyeOff } from 'lucide-react'

interface ColorConversion {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  cmyk: { c: number; m: number; y: number; k: number }
  hsv: { h: number; s: number; v: number }
}

interface ConversionHistory {
  id: string
  input: string
  conversion: ColorConversion
  timestamp: Date
}

export default function RGBHexConverter() {
  const [hexInput, setHexInput] = useState<string>('#3B82F6')
  const [rgbInput, setRgbInput] = useState({ r: '59', g: '130', b: '246' })
  const [conversion, setConversion] = useState<ColorConversion | null>(null)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

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

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

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

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    const v = max
    const d = max - min
    const s = max === 0 ? 0 : d / max

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
  }

  const convertFromHex = (hex: string) => {
    const normalizedHex = hex.startsWith('#') ? hex : '#' + hex
    const rgb = hexToRgb(normalizedHex)
    
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)

      const result: ColorConversion = {
        hex: normalizedHex.toUpperCase(),
        rgb,
        hsl,
        cmyk,
        hsv
      }

      setConversion(result)
      setRgbInput({ r: rgb.r.toString(), g: rgb.g.toString(), b: rgb.b.toString() })
      
      // Add to history
      const historyItem: ConversionHistory = {
        id: Date.now().toString(),
        input: normalizedHex,
        conversion: result,
        timestamp: new Date()
      }
      
      setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)])
    }
  }

  const convertFromRgb = () => {
    const r = parseInt(rgbInput.r)
    const g = parseInt(rgbInput.g)
    const b = parseInt(rgbInput.b)

    if (!isNaN(r) && !isNaN(g) && !isNaN(b) && 
        r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      const hex = rgbToHex(r, g, b)
      const hsl = rgbToHsl(r, g, b)
      const cmyk = rgbToCmyk(r, g, b)
      const hsv = rgbToHsv(r, g, b)

      const result: ColorConversion = {
        hex: hex.toUpperCase(),
        rgb: { r, g, b },
        hsl,
        cmyk,
        hsv
      }

      setConversion(result)
      setHexInput(hex)
      
      // Add to history
      const historyItem: ConversionHistory = {
        id: Date.now().toString(),
        input: `RGB(${r}, ${g}, ${b})`,
        conversion: result,
        timestamp: new Date()
      }
      
      setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)])
    }
  }

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    
    setRgbInput({ r: r.toString(), g: g.toString(), b: b.toString() })
    convertFromRgb()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Input', 'Hex', 'RGB', 'HSL', 'CMYK'],
      ...conversionHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.input,
        item.conversion.hex,
        `RGB(${item.conversion.rgb.r}, ${item.conversion.rgb.g}, ${item.conversion.rgb.b})`,
        `HSL(${item.conversion.hsl.h}, ${item.conversion.hsl.s}%, ${item.conversion.hsl.l}%)`,
        `CMYK(${item.conversion.cmyk.c}%, ${item.conversion.cmyk.m}%, ${item.conversion.cmyk.y}%, ${item.conversion.cmyk.k}%)`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-conversion-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (value.length === 7 || value.length === 4) {
      convertFromHex(value)
    }
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    setRgbInput(prev => ({ ...prev, [channel]: value }))
  }

  useEffect(() => {
    convertFromHex(hexInput)
  }, [])

  const isValidHex = (hex: string) => {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RGB to HEX Converter</h1>
        <p className="text-muted-foreground">Convert between RGB, HEX, HSL, CMYK, and HSV color formats</p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Input
                </CardTitle>
                <CardDescription>
                  Enter color values in HEX or RGB format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hex">HEX Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hex"
                      value={hexInput}
                      onChange={(e) => handleHexChange(e.target.value)}
                      placeholder="#3B82F6"
                      maxLength={7}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      {showColorPicker ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {hexInput && !isValidHex(hexInput) && (
                    <p className="text-sm text-red-500">Invalid HEX format</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>RGB Color</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="r" className="text-xs">R</Label>
                      <Input
                        id="r"
                        type="number"
                        value={rgbInput.r}
                        onChange={(e) => handleRgbChange('r', e.target.value)}
                        placeholder="0-255"
                        min="0"
                        max="255"
                      />
                    </div>
                    <div>
                      <Label htmlFor="g" className="text-xs">G</Label>
                      <Input
                        id="g"
                        type="number"
                        value={rgbInput.g}
                        onChange={(e) => handleRgbChange('g', e.target.value)}
                        placeholder="0-255"
                        min="0"
                        max="255"
                      />
                    </div>
                    <div>
                      <Label htmlFor="b" className="text-xs">B</Label>
                      <Input
                        id="b"
                        type="number"
                        value={rgbInput.b}
                        onChange={(e) => handleRgbChange('b', e.target.value)}
                        placeholder="0-255"
                        min="0"
                        max="255"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={convertFromRgb} className="flex-1">
                    Convert from RGB
                  </Button>
                  <Button onClick={generateRandomColor} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Random
                  </Button>
                </div>

                {showColorPicker && conversion && (
                  <div className="space-y-2">
                    <Label>Color Picker</Label>
                    <input
                      type="color"
                      value={conversion.hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="w-full h-12 rounded cursor-pointer"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Preview</CardTitle>
                <CardDescription>
                  Visual representation and color values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {conversion ? (
                  <>
                    <div
                      className="w-full h-32 rounded-lg border"
                      style={{ backgroundColor: conversion.hex }}
                    />
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">HEX</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {conversion.hex}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(conversion.hex)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">RGB</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {conversion.rgb.r}, {conversion.rgb.g}, {conversion.rgb.b}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${conversion.rgb.r}, ${conversion.rgb.g}, ${conversion.rgb.b}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">HSL</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {conversion.hsl.h}°, {conversion.hsl.s}%, {conversion.hsl.l}%
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${conversion.hsl.h}, ${conversion.hsl.s}%, ${conversion.hsl.l}%`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">HSV</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {conversion.hsv.h}°, {conversion.hsv.s}%, {conversion.hsv.v}%
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${conversion.hsv.h}, ${conversion.hsv.s}%, ${conversion.hsv.v}%`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">CMYK</Label>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {conversion.cmyk.c}%, {conversion.cmyk.m}%, {conversion.cmyk.y}%, {conversion.cmyk.k}%
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`${conversion.cmyk.c}%, ${conversion.cmyk.m}%, ${conversion.cmyk.y}%, ${conversion.cmyk.k}%`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter a color value to see the conversion
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {conversion && (
            <Card>
              <CardHeader>
                <CardTitle>Color Information</CardTitle>
                <CardDescription>
                  Additional details about the color
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Brightness</div>
                    <div className="text-lg font-semibold">
                      {Math.round((conversion.rgb.r * 0.299 + conversion.rgb.g * 0.587 + conversion.rgb.b * 0.114) / 255 * 100)}%
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Luminance</div>
                    <div className="text-lg font-semibold">
                      {conversion.hsl.l}%
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Saturation</div>
                    <div className="text-lg font-semibold">
                      {conversion.hsl.s}%
                    </div>
                  </div>
                  
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Hue</div>
                    <div className="text-lg font-semibold">
                      {conversion.hsl.h}°
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Common Colors</CardTitle>
              <CardDescription>
                Quick access to commonly used colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {[
                  { hex: '#000000', name: 'Black' },
                  { hex: '#FFFFFF', name: 'White' },
                  { hex: '#FF0000', name: 'Red' },
                  { hex: '#00FF00', name: 'Green' },
                  { hex: '#0000FF', name: 'Blue' },
                  { hex: '#FFFF00', name: 'Yellow' },
                  { hex: '#FF00FF', name: 'Magenta' },
                  { hex: '#00FFFF', name: 'Cyan' },
                  { hex: '#FFA500', name: 'Orange' },
                  { hex: '#800080', name: 'Purple' },
                  { hex: '#FFC0CB', name: 'Pink' },
                  { hex: '#A52A2A', name: 'Brown' },
                  { hex: '#808080', name: 'Gray' },
                  { hex: '#008000', name: 'Dark Green' },
                  { hex: '#000080', name: 'Navy' },
                  { hex: '#FFD700', name: 'Gold' }
                ].map((color, index) => (
                  <button
                    key={index}
                    className="group relative p-2 rounded-lg border hover:shadow-md transition-all"
                    onClick={() => handleHexChange(color.hex)}
                  >
                    <div
                      className="w-full h-8 rounded mb-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-xs font-medium truncate">{color.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{color.hex}</div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Conversion History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHistory}
                  disabled={conversionHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Your recent color conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversion history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {conversionHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: item.conversion.hex }}
                        />
                        <div>
                          <div className="font-medium">{item.input}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.conversion.hex} • RGB({item.conversion.rgb.r}, {item.conversion.rgb.g}, {item.conversion.rgb.b})
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.conversion.hex)}
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