'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Copy, 
  Palette, 
  EyeDropper, 
  Grid3X3, 
  Sliders,
  Type,
  Square,
  Hash,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react'

interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name?: string
}

interface ColorPalette {
  name: string
  colors: Color[]
}

export default function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState<Color>({
    hex: '#3B82F6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 }
  })
  const [colorHistory, setColorHistory] = useState<Color[]>([])
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([
    {
      name: 'Material Design',
      colors: [
        { hex: '#F44336', rgb: { r: 244, g: 67, b: 54 }, hsl: { h: 4, s: 90, l: 58 } },
        { hex: '#E91E63', rgb: { r: 233, g: 30, b: 99 }, hsl: { h: 340, s: 82, l: 51 } },
        { hex: '#9C27B0', rgb: { r: 156, g: 39, b: 176 }, hsl: { h: 291, s: 64, l: 42 } },
        { hex: '#673AB7', rgb: { r: 103, g: 58, b: 183 }, hsl: { h: 258, s: 51, l: 47 } },
        { hex: '#3F51B5', rgb: { r: 63, g: 81, b: 181 }, hsl: { h: 231, s: 48, l: 48 } }
      ]
    },
    {
      name: 'Pastel Colors',
      colors: [
        { hex: '#FFB3BA', rgb: { r: 255, g: 179, b: 186 }, hsl: { h: 354, s: 100, l: 85 } },
        { hex: '#FFDFBA', rgb: { r: 255, g: 223, b: 186 }, hsl: { h: 30, s: 100, l: 86 } },
        { hex: '#FFFFBA', rgb: { r: 255, g: 255, b: 186 }, hsl: { h: 60, s: 100, l: 86 } },
        { hex: '#BAFFC9', rgb: { r: 186, g: 255, b: 201 }, hsl: { h: 140, s: 100, l: 86 } },
        { hex: '#BAE1FF', rgb: { r: 186, g: 225, b: 255 }, hsl: { h: 200, s: 100, l: 86 } }
      ]
    }
  ])
  const [copied, setCopied] = useState<string | null>(null)
  const [newPaletteName, setNewPaletteName] = useState('')
  const [activeTab, setActiveTab] = useState('picker')

  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }, [])

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }, [])

  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
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
  }, [])

  const hslToRgb = useCallback((h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360
    s /= 100
    l /= 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }, [])

  const updateColor = useCallback((color: Partial<Color>) => {
    let newColor = { ...selectedColor, ...color }

    // Ensure all color formats are consistent
    if (color.hex) {
      const rgb = hexToRgb(color.hex)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      newColor = { ...newColor, rgb, hsl }
    } else if (color.rgb) {
      const hex = rgbToHex(color.rgb.r, color.rgb.g, color.rgb.b)
      const hsl = rgbToHsl(color.rgb.r, color.rgb.g, color.rgb.b)
      newColor = { ...newColor, hex, hsl }
    } else if (color.hsl) {
      const rgb = hslToRgb(color.hsl.h, color.hsl.s, color.hsl.l)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      newColor = { ...newColor, rgb, hex }
    }

    setSelectedColor(newColor)
  }, [selectedColor, hexToRgb, rgbToHex, rgbToHsl, hslToRgb])

  const handleHexChange = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      updateColor({ hex })
    }
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const rgb = { ...selectedColor.rgb, [channel]: Math.max(0, Math.min(255, value)) }
    updateColor({ rgb })
  }

  const handleHslChange = (channel: 'h' | 's' | 'l', value: number) => {
    const hsl = { ...selectedColor.hsl }
    if (channel === 'h') {
      hsl[channel] = Math.max(0, Math.min(360, value))
    } else {
      hsl[channel] = Math.max(0, Math.min(100, value))
    }
    updateColor({ hsl })
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const addToHistory = () => {
    if (!colorHistory.some(color => color.hex === selectedColor.hex)) {
      setColorHistory(prev => [selectedColor, ...prev.slice(0, 19)])
    }
  }

  const createNewPalette = () => {
    if (!newPaletteName.trim()) return

    const newPalette: ColorPalette = {
      name: newPaletteName,
      colors: [selectedColor]
    }

    setCustomPalettes(prev => [...prev, newPalette])
    setNewPaletteName('')
  }

  const addToPalette = (paletteIndex: number) => {
    const palette = customPalettes[paletteIndex]
    if (!palette.colors.some(color => color.hex === selectedColor.hex)) {
      const updatedPalettes = [...customPalettes]
      updatedPalettes[paletteIndex] = {
        ...palette,
        colors: [...palette.colors, selectedColor]
      }
      setCustomPalettes(updatedPalettes)
    }
  }

  const removeFromPalette = (paletteIndex: number, colorIndex: number) => {
    const updatedPalettes = [...customPalettes]
    updatedPalettes[paletteIndex] = {
      ...updatedPalettes[paletteIndex],
      colors: updatedPalettes[paletteIndex].colors.filter((_, i) => i !== colorIndex)
    }
    setCustomPalettes(updatedPalettes)
  }

  const deletePalette = (paletteIndex: number) => {
    setCustomPalettes(prev => prev.filter((_, i) => i !== paletteIndex))
  }

  const generateHarmonies = () => {
    const { h, s, l } = selectedColor.hsl
    const harmonies = [
      { name: 'Complementary', hex: rgbToHex(...Object.values(hslToRgb((h + 180) % 360, s, l))) },
      { name: 'Triadic', hex: rgbToHex(...Object.values(hslToRgb((h + 120) % 360, s, l))) },
      { name: 'Analogous', hex: rgbToHex(...Object.values(hslToRgb((h + 30) % 360, s, l))) },
      { name: 'Split Complementary', hex: rgbToHex(...Object.values(hslToRgb((h + 150) % 360, s, l))) }
    ]
    return harmonies
  }

  const getColorName = (hex: string): string => {
    const colorNames: Record<string, string> = {
      '#FF0000': 'Red',
      '#00FF00': 'Green',
      '#0000FF': 'Blue',
      '#FFFF00': 'Yellow',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#808080': 'Gray',
      '#FFA500': 'Orange',
      '#800080': 'Purple',
      '#FFC0CB': 'Pink',
      '#A52A2A': 'Brown',
      '#008000': 'Dark Green',
      '#000080': 'Navy',
      '#FFD700': 'Gold'
    }
    return colorNames[hex.toUpperCase()] || 'Custom Color'
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Color Picker
          </CardTitle>
          <CardDescription>
            Pick, convert, and manage colors with various tools and palettes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="picker">Color Picker</TabsTrigger>
              <TabsTrigger value="palettes">Palettes</TabsTrigger>
              <TabsTrigger value="harmonies">Harmonies</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="picker" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Color Preview</Label>
                    <div 
                      className="w-full h-32 rounded-lg border-2 border-border shadow-sm"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        HEX
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={selectedColor.hex}
                          onChange={(e) => handleHexChange(e.target.value)}
                          placeholder="#000000"
                          className="font-mono"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => copyToClipboard(selectedColor.hex, 'hex')}
                        >
                          {copied === 'hex' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        RGB
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="r" className="text-xs">R</Label>
                          <Input
                            id="r"
                            type="number"
                            min="0"
                            max="255"
                            value={selectedColor.rgb.r}
                            onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="g" className="text-xs">G</Label>
                          <Input
                            id="g"
                            type="number"
                            min="0"
                            max="255"
                            value={selectedColor.rgb.g}
                            onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="b" className="text-xs">B</Label>
                          <Input
                            id="b"
                            type="number"
                            min="0"
                            max="255"
                            value={selectedColor.rgb.b}
                            onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(`rgb(${selectedColor.rgb.r}, ${selectedColor.rgb.g}, ${selectedColor.rgb.b})`, 'rgb')}
                        className="w-full"
                      >
                        {copied === 'rgb' ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copy RGB
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Sliders className="h-4 w-4" />
                        HSL
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="h" className="text-xs">H</Label>
                          <Input
                            id="h"
                            type="number"
                            min="0"
                            max="360"
                            value={selectedColor.hsl.h}
                            onChange={(e) => handleHslChange('h', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="s" className="text-xs">S</Label>
                          <Input
                            id="s"
                            type="number"
                            min="0"
                            max="100"
                            value={selectedColor.hsl.s}
                            onChange={(e) => handleHslChange('s', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="l" className="text-xs">L</Label>
                          <Input
                            id="l"
                            type="number"
                            min="0"
                            max="100"
                            value={selectedColor.hsl.l}
                            onChange={(e) => handleHslChange('l', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(`hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)`, 'hsl')}
                        className="w-full"
                      >
                        {copied === 'hsl' ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copy HSL
                      </Button>
                    </div>
                  </div>

                  <Button onClick={addToHistory} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to History
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Color Information</Label>
                    <Card>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Name:</span>
                          <span className="text-sm">{getColorName(selectedColor.hex)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Brightness:</span>
                          <span className="text-sm">
                            {Math.round((selectedColor.rgb.r * 0.299 + selectedColor.rgb.g * 0.587 + selectedColor.rgb.b * 0.114) / 255 * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Luminance:</span>
                          <span className="text-sm">
                            {Math.round((0.2126 * selectedColor.rgb.r + 0.7152 * selectedColor.rgb.g + 0.0722 * selectedColor.rgb.b) / 255 * 100)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Colors</Label>
                    <div className="grid grid-cols-8 gap-2">
                      {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => updateColor({ hex: color })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Sliders</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Hue</Label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedColor.hsl.h}
                          onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Saturation</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedColor.hsl.s}
                          onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Lightness</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedColor.hsl.l}
                          onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="palettes" className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New palette name"
                    value={newPaletteName}
                    onChange={(e) => setNewPaletteName(e.target.value)}
                  />
                  <Button onClick={createNewPalette}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>

                <div className="space-y-4">
                  {customPalettes.map((palette, paletteIndex) => (
                    <Card key={paletteIndex}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{palette.name}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePalette(paletteIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {palette.colors.map((color, colorIndex) => (
                              <div key={colorIndex} className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color.hex }}
                                  onClick={() => updateColor({ hex: color.hex })}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromPalette(paletteIndex, colorIndex)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToPalette(paletteIndex)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="harmonies" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Color Harmonies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {generateHarmonies().map((harmony, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div
                          className="w-full h-24 rounded-lg mb-3"
                          style={{ backgroundColor: harmony.hex }}
                        />
                        <div className="space-y-2">
                          <div className="font-medium">{harmony.name}</div>
                          <div className="font-mono text-sm">{harmony.hex}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => updateColor({ hex: harmony.hex })}
                          >
                            Use Color
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Color History</h3>
                {colorHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No colors in history yet</p>
                    <p className="text-sm text-muted-foreground">Colors you use will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {colorHistory.map((color, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div
                            className="w-full h-16 rounded-lg mb-2"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="space-y-1">
                            <div className="font-mono text-xs">{color.hex}</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => updateColor({ hex: color.hex })}
                            >
                              Use
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}