'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Palette, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Color {
  hex: string
  rgb: string
  hsl: string
  name?: string
}

interface Palette {
  name: string
  colors: Color[]
  type: 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochromatic' | 'split-complementary'
}

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3b82f6')
  const [paletteType, setPaletteType] = useState<Palette['type']>('analogous')
  const [generatedPalette, setGeneratedPalette] = useState<Palette | null>(null)
  const [customColors, setCustomColors] = useState<string[]>(['#3b82f6', '#10b981', '#f59e0b'])
  const [showColorInfo, setShowColorInfo] = useState(true)
  const { toast } = useToast()

  const paletteTypes = [
    { value: 'analogous', label: 'Analogous', description: 'Colors adjacent to each other on the color wheel' },
    { value: 'complementary', label: 'Complementary', description: 'Colors opposite each other on the color wheel' },
    { value: 'triadic', label: 'Triadic', description: 'Three colors evenly spaced on the color wheel' },
    { value: 'tetradic', label: 'Tetradic', description: 'Four colors evenly spaced on the color wheel' },
    { value: 'monochromatic', label: 'Monochromatic', description: 'Different shades of the same color' },
    { value: 'split-complementary', label: 'Split Complementary', description: 'Base color plus two adjacent to its complement' }
  ]

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return 'rgb(0, 0, 0)'
    
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `rgb(${r}, ${g}, ${b})`
  }

  const rgbToHsl = (rgb: string): string => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return 'hsl(0, 0%, 0%)'
    
    let r = parseInt(match[1]) / 255
    let g = parseInt(match[2]) / 255
    let b = parseInt(match[3]) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  }

  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!match) return '#000000'
    
    let h = parseInt(match[1]) / 360
    let s = parseInt(match[2]) / 100
    let l = parseInt(match[3]) / 100

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    const toHex = (x: number): string => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const generateAnalogousColors = (baseHex: string): Color[] => {
    const baseHsl = rgbToHsl(hexToRgb(baseHex))
    const hslMatch = baseHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hslMatch) return []

    const baseHue = parseInt(hslMatch[1])
    const saturation = parseInt(hslMatch[2])
    const lightness = parseInt(hslMatch[3])

    const colors: Color[] = []
    for (let i = -2; i <= 2; i++) {
      const hue = (baseHue + i * 30 + 360) % 360
      const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      const hex = hslToHex(hsl)
      colors.push({
        hex,
        rgb: hexToRgb(hex),
        hsl
      })
    }

    return colors
  }

  const generateComplementaryColors = (baseHex: string): Color[] => {
    const baseHsl = rgbToHsl(hexToRgb(baseHex))
    const hslMatch = baseHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hslMatch) return []

    const baseHue = parseInt(hslMatch[1])
    const saturation = parseInt(hslMatch[2])
    const lightness = parseInt(hslMatch[3])

    const complementaryHue = (baseHue + 180) % 360

    return [
      {
        hex: baseHex,
        rgb: hexToRgb(baseHex),
        hsl: baseHsl
      },
      {
        hex: hslToHex(`hsl(${complementaryHue}, ${saturation}%, ${lightness}%)`),
        rgb: hexToRgb(hslToHex(`hsl(${complementaryHue}, ${saturation}%, ${lightness}%)`)),
        hsl: `hsl(${complementaryHue}, ${saturation}%, ${lightness}%)`
      }
    ]
  }

  const generateTriadicColors = (baseHex: string): Color[] => {
    const baseHsl = rgbToHsl(hexToRgb(baseHex))
    const hslMatch = baseHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hslMatch) return []

    const baseHue = parseInt(hslMatch[1])
    const saturation = parseInt(hslMatch[2])
    const lightness = parseInt(hslMatch[3])

    const colors: Color[] = []
    for (let i = 0; i < 3; i++) {
      const hue = (baseHue + i * 120) % 360
      const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      const hex = hslToHex(hsl)
      colors.push({
        hex,
        rgb: hexToRgb(hex),
        hsl
      })
    }

    return colors
  }

  const generateTetradicColors = (baseHex: string): Color[] => {
    const baseHsl = rgbToHsl(hexToRgb(baseHex))
    const hslMatch = baseHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hslMatch) return []

    const baseHue = parseInt(hslMatch[1])
    const saturation = parseInt(hslMatch[2])
    const lightness = parseInt(hslMatch[3])

    const colors: Color[] = []
    for (let i = 0; i < 4; i++) {
      const hue = (baseHue + i * 90) % 360
      const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      const hex = hslToHex(hsl)
      colors.push({
        hex,
        rgb: hexToRgb(hex),
        hsl
      })
    }

    return colors
  }

  const generateMonochromaticColors = (baseHex: string): Color[] => {
    const baseHsl = rgbToHsl(hexToRgb(baseHex))
    const hslMatch = baseHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hslMatch) return []

    const baseHue = parseInt(hslMatch[1])
    const saturation = parseInt(hslMatch[2])

    const colors: Color[] = []
    const lightnessValues = [20, 35, 50, 65, 80]

    lightnessValues.forEach(lightness => {
      const hsl = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`
      const hex = hslToHex(hsl)
      colors.push({
        hex,
        rgb: hexToRgb(hex),
        hsl
      })
    })

    return colors
  }

  const generateSplitComplementaryColors = (baseHex: string): Color[] => {
    const baseHsl = rgbToHsl(hexToRgb(baseHex))
    const hslMatch = baseHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hslMatch) return []

    const baseHue = parseInt(hslMatch[1])
    const saturation = parseInt(hslMatch[2])
    const lightness = parseInt(hslMatch[3])

    const complementaryHue = (baseHue + 180) % 360
    const split1 = (complementaryHue + 30) % 360
    const split2 = (complementaryHue - 30 + 360) % 360

    return [
      {
        hex: baseHex,
        rgb: hexToRgb(baseHex),
        hsl: baseHsl
      },
      {
        hex: hslToHex(`hsl(${split1}, ${saturation}%, ${lightness}%)`),
        rgb: hexToRgb(hslToHex(`hsl(${split1}, ${saturation}%, ${lightness}%)`)),
        hsl: `hsl(${split1}, ${saturation}%, ${lightness}%)`
      },
      {
        hex: hslToHex(`hsl(${split2}, ${saturation}%, ${lightness}%)`),
        rgb: hexToRgb(hslToHex(`hsl(${split2}, ${saturation}%, ${lightness}%)`)),
        hsl: `hsl(${split2}, ${saturation}%, ${lightness}%)`
      }
    ]
  }

  const generatePalette = useCallback(() => {
    let colors: Color[] = []

    switch (paletteType) {
      case 'analogous':
        colors = generateAnalogousColors(baseColor)
        break
      case 'complementary':
        colors = generateComplementaryColors(baseColor)
        break
      case 'triadic':
        colors = generateTriadicColors(baseColor)
        break
      case 'tetradic':
        colors = generateTetradicColors(baseColor)
        break
      case 'monochromatic':
        colors = generateMonochromaticColors(baseColor)
        break
      case 'split-complementary':
        colors = generateSplitComplementaryColors(baseColor)
        break
    }

    const paletteTypeObj = paletteTypes.find(pt => pt.value === paletteType)
    setGeneratedPalette({
      name: paletteTypeObj?.label || paletteType,
      colors,
      type: paletteType
    })
  }, [baseColor, paletteType])

  const generateRandomPalette = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    setBaseColor(randomColor)
    
    const types = paletteTypes.map(pt => pt.value)
    const randomType = types[Math.floor(Math.random() * types.length)] as Palette['type']
    setPaletteType(randomType)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Color value has been copied to clipboard",
    })
  }

  const downloadPalette = () => {
    if (!generatedPalette) return

    const cssContent = `/* ${generatedPalette.name} Color Palette */
:root {
${generatedPalette.colors.map((color, index) => 
  `  --color-${index + 1}: ${color.hex};`
).join('\n')}
}

/* CSS Classes */
${generatedPalette.colors.map((color, index) => 
`.color-${index + 1} {
  color: ${color.hex};
}

.bg-color-${index + 1} {
  background-color: ${color.hex};
}

.border-color-${index + 1} {
  border-color: ${color.hex};
}
`).join('\n')}
`

    const blob = new Blob([cssContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedPalette.name.toLowerCase().replace(/\s+/g, '-')}-palette.css`
    a.click()
    URL.revokeObjectURL(url)
  }

  const addCustomColor = () => {
    if (customColors.length < 8) {
      setCustomColors(prev => [...prev, '#000000'])
    }
  }

  const removeCustomColor = (index: number) => {
    setCustomColors(prev => prev.filter((_, i) => i !== index))
  }

  const updateCustomColor = (index: number, color: string) => {
    setCustomColors(prev => prev.map((c, i) => i === index ? color : c))
  }

  const getContrastColor = (hexColor: string): string => {
    const rgb = hexToRgb(hexColor)
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return '#000000'
    
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Color Palette Generator
          </CardTitle>
          <CardDescription>
            Generate beautiful color palettes with various color harmony rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList>
                <TabsTrigger value="generator">Palette Generator</TabsTrigger>
                <TabsTrigger value="custom">Custom Palette</TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="space-y-6">
                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base-color">Base Color:</Label>
                    <div className="flex gap-2">
                      <Input
                        id="base-color"
                        type="color"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="w-16 h-10 p-0 border-0"
                      />
                      <Input
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="palette-type">Palette Type:</Label>
                    <Select value={paletteType} onValueChange={(value: Palette['type']) => setPaletteType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paletteTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-2">
                    <Button onClick={generatePalette} className="flex-1">
                      Generate Palette
                    </Button>
                    <Button variant="outline" onClick={generateRandomPalette}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Generated Palette */}
                {generatedPalette && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{generatedPalette.name} Palette</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowColorInfo(!showColorInfo)}
                          >
                            {showColorInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadPalette}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {generatedPalette.colors.map((color, index) => (
                          <div key={index} className="space-y-2">
                            <div
                              className="w-full h-24 rounded-lg border cursor-pointer"
                              style={{ backgroundColor: color.hex }}
                              onClick={() => copyToClipboard(color.hex)}
                            />
                            {showColorInfo && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {color.hex}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(color.hex)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div className="font-mono">{color.rgb}</div>
                                  <div className="font-mono">{color.hsl}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Custom Colors:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCustomColor}
                      disabled={customColors.length >= 8}
                    >
                      Add Color
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {customColors.map((color, index) => (
                      <div key={index} className="space-y-2">
                        <div
                          className="w-full h-24 rounded-lg border cursor-pointer relative group"
                          style={{ backgroundColor: color }}
                          onClick={() => copyToClipboard(color)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeCustomColor(index)
                            }}
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={color}
                            onChange={(e) => updateCustomColor(index, e.target.value)}
                            className="w-12 h-8 p-0 border-0"
                          />
                          <Input
                            value={color}
                            onChange={(e) => updateCustomColor(index, e.target.value)}
                            placeholder="#000000"
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {customColors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Custom Palette Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {customColors.map((color, index) => (
                            <div key={index} className="space-y-2">
                              <div
                                className="w-full h-24 rounded-lg border cursor-pointer flex items-center justify-center"
                                style={{ 
                                  backgroundColor: color,
                                  color: getContrastColor(color)
                                }}
                                onClick={() => copyToClipboard(color)}
                              >
                                <span className="font-mono text-sm">{color}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Choose a base color and palette type to generate harmonious color schemes</li>
                <li>• Use the random generator to discover unexpected color combinations</li>
                <li>• Create custom palettes by adding your own colors</li>
                <li>• Click on any color to copy its hex value to clipboard</li>
                <li>• Download CSS variables for use in your projects</li>
                <li>• Toggle color information display for cleaner previews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}