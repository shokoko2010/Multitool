'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Palette, EyeDropper, Hash, Type } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  hsv: string
  cmyk: string
}

interface ColorPalette {
  name: string
  colors: string[]
}

export default function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [formats, setFormats] = useState<ColorFormats>({
    hex: '#3b82f6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)',
    hsv: 'hsv(217, 76%, 96%)',
    cmyk: 'cmyk(76%, 47%, 0%, 4%)'
  })
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
  const [savedColors, setSavedColors] = useState<string[]>([])
  const colorInputRef = useRef<HTMLInputElement>(null)

  const { trackUsage } = useToolAccess('color-picker')

  // Predefined color palettes
  const palettes: ColorPalette[] = [
    {
      name: 'Material Design',
      colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722']
    },
    {
      name: 'Tailwind CSS',
      colors: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']
    },
    {
      name: 'Pastel Colors',
      colors: ['#ffd1dc', '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e0bbff', '#ffc9de', '#ffcccb', '#ffe4b5', '#f0e68c', '#98fb98', '#add8e6', '#d8bfd8', '#ffb6c1', '#f5deb3']
    }
  ]

  useEffect(() => {
    // Load saved colors from localStorage
    const saved = localStorage.getItem('savedColors')
    if (saved) {
      setSavedColors(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    updateColorFormats(selectedColor)
  }, [selectedColor])

  const updateColorFormats = (color: string) => {
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    // Calculate formats
    const newFormats: ColorFormats = {
      hex: color,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b),
      hsv: rgbToHsv(r, g, b),
      cmyk: rgbToCmyk(r, g, b)
    }

    setFormats(newFormats)
  }

  const rgbToHsl = (r: number, g: number, b: number): string => {
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
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  }

  const rgbToHsv = (r: number, g: number, b: number): string => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min

    let h = 0
    const s = max === 0 ? 0 : d / max
    const v = max

    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`
  }

  const rgbToCmyk = (r: number, g: number, b: number): string => {
    r /= 255
    g /= 255
    b /= 255

    const k = 1 - Math.max(r, g, b)
    const c = (1 - r - k) / (1 - k) || 0
    const m = (1 - g - k) / (1 - k) || 0
    const y = (1 - b - k) / (1 - k) || 0

    return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`
  }

  const handleColorChange = async (color: string) => {
    try {
      await trackUsage()
      setSelectedColor(color)
    } catch (error) {
      console.error('Error tracking usage:', error)
    }
  }

  const copyToClipboard = async (format: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const saveColor = () => {
    if (!savedColors.includes(selectedColor)) {
      const newSavedColors = [selectedColor, ...savedColors].slice(0, 20) // Keep max 20 colors
      setSavedColors(newSavedColors)
      localStorage.setItem('savedColors', JSON.stringify(newSavedColors))
    }
  }

  const removeSavedColor = (color: string) => {
    const newSavedColors = savedColors.filter(c => c !== color)
    setSavedColors(newSavedColors)
    localStorage.setItem('savedColors', JSON.stringify(newSavedColors))
  }

  const generateRandomColor = async () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    await handleColorChange(randomColor)
  }

  const exportColors = () => {
    const exportData = {
      selectedColor,
      formats,
      savedColors,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'color-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      toolId="color-picker"
      toolName="Color Picker"
      toolDescription="Pick, convert, and save colors with multiple format support"
      toolCategory="Color Tools"
      toolIcon={<Palette className="w-8 h-8" />}
      action={{
        label: "Random Color",
        onClick: generateRandomColor
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Color Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Color Picker</CardTitle>
            <CardDescription>
              Choose your color using different methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Preview */}
            <div className="space-y-2">
              <Label>Selected Color</Label>
              <div 
                className="w-full h-24 rounded-lg border-2 border-border cursor-pointer"
                style={{ backgroundColor: selectedColor }}
                onClick={() => colorInputRef.current?.click()}
              />
              <div className="flex items-center gap-2">
                <Input
                  ref={colorInputRef}
                  type="color"
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-16 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="font-mono flex-1"
                />
                <Button variant="outline" size="sm" onClick={saveColor}>
                  Save
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateRandomColor} className="flex-1">
                Random
              </Button>
              <Button variant="outline" size="sm" onClick={exportColors} className="flex-1">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Formats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Color Formats</CardTitle>
            <CardDescription>
              Different representations of your selected color
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hex" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="hex">HEX</TabsTrigger>
                <TabsTrigger value="rgb">RGB</TabsTrigger>
                <TabsTrigger value="hsl">HSL</TabsTrigger>
                <TabsTrigger value="hsv">HSV</TabsTrigger>
                <TabsTrigger value="cmyk">CMYK</TabsTrigger>
              </TabsList>

              <TabsContent value="hex" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5" />
                    <div>
                      <p className="font-medium">HEX</p>
                      <p className="text-sm text-muted-foreground">Hexadecimal format</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={formats.hex} readOnly className="font-mono w-32" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard('hex', formats.hex)}
                    >
                      {copiedFormat === 'hex' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rgb" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5" />
                    <div>
                      <p className="font-medium">RGB</p>
                      <p className="text-sm text-muted-foreground">Red, Green, Blue</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={formats.rgb} readOnly className="font-mono w-32" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard('rgb', formats.rgb)}
                    >
                      {copiedFormat === 'rgb' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hsl" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5" />
                    <div>
                      <p className="font-medium">HSL</p>
                      <p className="text-sm text-muted-foreground">Hue, Saturation, Lightness</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={formats.hsl} readOnly className="font-mono w-32" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard('hsl', formats.hsl)}
                    >
                      {copiedFormat === 'hsl' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hsv" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5" />
                    <div>
                      <p className="font-medium">HSV</p>
                      <p className="text-sm text-muted-foreground">Hue, Saturation, Value</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={formats.hsv} readOnly className="font-mono w-32" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard('hsv', formats.hsv)}
                    >
                      {copiedFormat === 'hsv' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cmyk" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5" />
                    <div>
                      <p className="font-medium">CMYK</p>
                      <p className="text-sm text-muted-foreground">Cyan, Magenta, Yellow, Key</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={formats.cmyk} readOnly className="font-mono w-32" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard('cmyk', formats.cmyk)}
                    >
                      {copiedFormat === 'cmyk' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Color Palettes */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palettes</CardTitle>
          <CardDescription>
            Pre-designed color schemes for inspiration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="material" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="material">Material Design</TabsTrigger>
              <TabsTrigger value="tailwind">Tailwind CSS</TabsTrigger>
              <TabsTrigger value="pastel">Pastel Colors</TabsTrigger>
            </TabsList>

            {palettes.map((palette) => (
              <TabsContent key={palette.name} value={palette.name.toLowerCase().replace(' ', '-')} className="space-y-4">
                <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-2">
                  {palette.colors.map((color, index) => (
                    <button
                      key={index}
                      className="w-full aspect-square rounded border border-border hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      title={color}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Saved Colors */}
      {savedColors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Colors</CardTitle>
            <CardDescription>
              Your personally saved color collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-2">
              {savedColors.map((color, index) => (
                <div key={index} className="relative group">
                  <button
                    className="w-full aspect-square rounded border border-border hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSavedColor(color)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Color Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🎨 Color Theory</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use complementary colors</li>
                <li>• Consider color psychology</li>
                <li>• Maintain contrast ratio</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Format Usage</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• HEX for web development</li>
                <li>• RGB for digital design</li>
                <li>• HSL for adjustments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Best Practices</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Create color palettes</li>
                <li>• Test accessibility</li>
                <li>• Use consistent colors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Multiple format support</li>
                <li>• Color palette library</li>
                <li>• Export capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}