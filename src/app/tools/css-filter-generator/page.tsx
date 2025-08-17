'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Eye, Palette, Sliders, Wand2 } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface FilterSettings {
  blur: number
  brightness: number
  contrast: number
  grayscale: number
  hueRotate: number
  invert: number
  opacity: number
  saturate: number
  sepia: number
  dropShadowX: number
  dropShadowY: number
  dropShadowBlur: number
  dropShadowColor: string
}

export default function CssFilterGenerator() {
  const [settings, setSettings] = useState<FilterSettings>({
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    opacity: 100,
    saturate: 100,
    sepia: 0,
    dropShadowX: 0,
    dropShadowY: 0,
    dropShadowBlur: 0,
    dropShadowColor: '#000000'
  })

  const [cssCode, setCssCode] = useState('')
  const [previewText, setPreviewText] = useState('Sample Text')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { trackUsage } = useToolAccess('css-filter-generator')

  const generateCssFilter = (): string => {
    const filters: string[] = []

    if (settings.blur > 0) filters.push(`blur(${settings.blur}px)`)
    if (settings.brightness !== 100) filters.push(`brightness(${settings.brightness}%)`)
    if (settings.contrast !== 100) filters.push(`contrast(${settings.contrast}%)`)
    if (settings.grayscale > 0) filters.push(`grayscale(${settings.grayscale}%)`)
    if (settings.hueRotate > 0) filters.push(`hue-rotate(${settings.hueRotate}deg)`)
    if (settings.invert > 0) filters.push(`invert(${settings.invert}%)`)
    if (settings.opacity !== 100) filters.push(`opacity(${settings.opacity}%)`)
    if (settings.saturate !== 100) filters.push(`saturate(${settings.saturate}%)`)
    if (settings.sepia > 0) filters.push(`sepia(${settings.sepia}%)`)
    
    const shadowFilters: string[] = []
    if (settings.dropShadowX !== 0 || settings.dropShadowY !== 0 || settings.dropShadowBlur > 0) {
      shadowFilters.push(`drop-shadow(${settings.dropShadowX}px ${settings.dropShadowY}px ${settings.dropShadowBlur}px ${settings.dropShadowColor})`)
    }

    const allFilters = [...filters, ...shadowFilters]
    return allFilters.length > 0 ? allFilters.join(' ') : 'none'
  }

  const updateFilter = (key: keyof FilterSettings, value: number | string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    const filter = generateCssFilter()
    setCssCode(filter)
    trackUsage()
  }

  const resetFilters = () => {
    setSettings({
      blur: 0,
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100,
      saturate: 100,
      sepia: 0,
      dropShadowX: 0,
      dropShadowY: 0,
      dropShadowBlur: 0,
      dropShadowColor: '#000000'
    })
    setCssCode('')
    trackUsage()
  }

  const copyToClipboard = () => {
    if (cssCode) {
      const fullCss = `filter: ${cssCode};`
      navigator.clipboard.writeText(fullCss)
    }
  }

  const downloadCss = () => {
    if (cssCode) {
      const fullCss = `/* CSS Filter Generated */\n.filtered-element {\n  filter: ${cssCode};\n}`
      const blob = new Blob([fullCss], { type: 'text/css' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'css-filters.css'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
        trackUsage()
      }
      reader.readAsDataURL(file)
    }
  }

  const presetFilters = [
    {
      name: 'Vintage',
      description: 'Old photo effect',
      settings: { sepia: 50, contrast: 120, brightness: 90 }
    },
    {
      name: 'Dramatic',
      description: 'High contrast',
      settings: { contrast: 150, brightness: 110, saturate: 120 }
    },
    {
      name: 'Cool',
      description: 'Blue tint',
      settings: { hueRotate: 180, saturate: 80, brightness: 105 }
    },
    {
      name: 'Warm',
      description: 'Orange tint',
      settings: { sepia: 30, saturate: 120, brightness: 105 }
    },
    {
      name: 'Blurry',
      description: 'Soft focus',
      settings: { blur: 3, brightness: 110 }
    }
  ]

  const applyPreset = (preset: typeof presetFilters[0]) => {
    const newSettings = { ...settings, ...preset.settings }
    setSettings(newSettings)
    const filter = generateCssFilter()
    setCssCode(filter)
    trackUsage()
  }

  const currentFilter = generateCssFilter()

  return (
    <ToolLayout
      toolId="css-filter-generator"
      toolName="CSS Filter Generator"
      toolDescription="Create and preview CSS filters with real-time visual feedback"
      toolCategory="Design Tools"
      toolIcon={<Sliders className="w-8 h-8" />}
    >
      <div className="space-y-6">
        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {presetFilters.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{preset.description}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Controls</CardTitle>
              <CardDescription>
                Adjust the values to create your desired filter effect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blur">Blur: {settings.blur}px</Label>
                  <Input
                    id="blur"
                    type="range"
                    min="0"
                    max="20"
                    value={settings.blur}
                    onChange={(e) => updateFilter('blur', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brightness">Brightness: {settings.brightness}%</Label>
                  <Input
                    id="brightness"
                    type="range"
                    min="0"
                    max="200"
                    value={settings.brightness}
                    onChange={(e) => updateFilter('brightness', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contrast">Contrast: {settings.contrast}%</Label>
                  <Input
                    id="contrast"
                    type="range"
                    min="0"
                    max="200"
                    value={settings.contrast}
                    onChange={(e) => updateFilter('contrast', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grayscale">Grayscale: {settings.grayscale}%</Label>
                  <Input
                    id="grayscale"
                    type="range"
                    min="0"
                    max="100"
                    value={settings.grayscale}
                    onChange={(e) => updateFilter('grayscale', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hueRotate">Hue Rotate: {settings.hueRotate}deg</Label>
                  <Input
                    id="hueRotate"
                    type="range"
                    min="0"
                    max="360"
                    value={settings.hueRotate}
                    onChange={(e) => updateFilter('hueRotate', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invert">Invert: {settings.invert}%</Label>
                  <Input
                    id="invert"
                    type="range"
                    min="0"
                    max="100"
                    value={settings.invert}
                    onChange={(e) => updateFilter('invert', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opacity">Opacity: {settings.opacity}%</Label>
                  <Input
                    id="opacity"
                    type="range"
                    min="0"
                    max="100"
                    value={settings.opacity}
                    onChange={(e) => updateFilter('opacity', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saturate">Saturate: {settings.saturate}%</Label>
                  <Input
                    id="saturate"
                    type="range"
                    min="0"
                    max="200"
                    value={settings.saturate}
                    onChange={(e) => updateFilter('saturate', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sepia">Sepia: {settings.sepia}%</Label>
                  <Input
                    id="sepia"
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sepia}
                    onChange={(e) => updateFilter('sepia', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Drop Shadow</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="dropShadowX">X: {settings.dropShadowX}px</Label>
                      <Input
                        id="dropShadowX"
                        type="range"
                        min="-20"
                        max="20"
                        value={settings.dropShadowX}
                        onChange={(e) => updateFilter('dropShadowX', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropShadowY">Y: {settings.dropShadowY}px</Label>
                      <Input
                        id="dropShadowY"
                        type="range"
                        min="-20"
                        max="20"
                        value={settings.dropShadowY}
                        onChange={(e) => updateFilter('dropShadowY', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropShadowBlur">Blur: {settings.dropShadowBlur}px</Label>
                      <Input
                        id="dropShadowBlur"
                        type="range"
                        min="0"
                        max="20"
                        value={settings.dropShadowBlur}
                        onChange={(e) => updateFilter('dropShadowBlur', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropShadowColor">Shadow Color</Label>
                    <Input
                      id="dropShadowColor"
                      type="color"
                      value={settings.dropShadowColor}
                      onChange={(e) => updateFilter('dropShadowColor', e.target.value)}
                      className="w-16 h-8 p-1"
                    />
                  </div>
                </div>
              </div>

              <Button variant="outline" onClick={resetFilters} className="w-full">
                <Wand2 className="w-4 h-4 mr-2" />
                Reset All Filters
              </Button>
            </CardContent>
          </Card>

          {/* Preview and Output */}
          <Card>
            <CardHeader>
              <CardTitle>Preview & CSS Code</CardTitle>
              <CardDescription>
                See your filter applied in real-time and get the CSS code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Preview</TabsTrigger>
                  <TabsTrigger value="image">Image Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preview-text">Preview Text</Label>
                    <Input
                      id="preview-text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      placeholder="Sample Text"
                    />
                  </div>
                  
                  <div className="border rounded-lg p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div 
                      className="text-2xl font-bold text-gray-800"
                      style={{ filter: currentFilter }}
                    >
                      {previewText}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-muted-foreground">
                          <Palette className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Click to upload image</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {previewImage && (
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-auto"
                        style={{ filter: currentFilter }}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated CSS</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!currentFilter || currentFilter === 'none'}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadCss} disabled={!currentFilter || currentFilter === 'none'}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  {currentFilter && currentFilter !== 'none' ? (
                    <div>
                      <div className="text-green-600">filter: </div>
                      <div>{currentFilter};</div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No filters applied</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">About CSS Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">What are CSS Filters?</h4>
                  <p className="text-muted-foreground">
                    CSS filters are graphical effects that can be applied to elements to modify their rendering before display. They include effects like blur, brightness, contrast, and more.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Browser Support</h4>
                  <p className="text-muted-foreground">
                    CSS filters are widely supported in modern browsers including Chrome, Firefox, Safari, and Edge.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Performance</h4>
                  <p className="text-muted-foreground">
                    Filters are GPU-accelerated in modern browsers, providing smooth performance even with complex effects.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Common Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Image Effects</h4>
                  <p className="text-muted-foreground">
                    Apply vintage, dramatic, or artistic effects to images without editing software.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Hover Effects</h4>
                  <p className="text-muted-foreground">
                    Create engaging hover states with smooth transitions and filter changes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Accessibility</h4>
                  <p className="text-muted-foreground">
                    Adjust brightness, contrast, and other properties to improve readability and accessibility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  )
}