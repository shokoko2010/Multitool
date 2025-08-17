'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Eye, Palette, Sliders, Wand2, Plus, Trash2 } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface GradientStop {
  id: string
  color: string
  position: number
}

interface GradientSettings {
  type: 'linear' | 'radial' | 'conic'
  direction: string
  angle: number
  stops: GradientStop[]
}

export default function CssGradientGenerator() {
  const [settings, setSettings] = useState<GradientSettings>({
    type: 'linear',
    direction: 'to right',
    angle: 90,
    stops: [
      { id: '1', color: '#667eea', position: 0 },
      { id: '2', color: '#764ba2', position: 100 }
    ]
  })

  const [cssCode, setCssCode] = useState('')
  const [previewText, setPreviewText] = useState('Beautiful Gradient')
  const { trackUsage } = useToolAccess('css-gradient-generator')

  const generateCssGradient = (): string => {
    const { type, direction, angle, stops } = settings
    
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    const stopString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
    
    let gradient = ''
    
    switch (type) {
      case 'linear':
        gradient = `linear-gradient(${angle}deg, ${stopString})`
        break
      case 'radial':
        gradient = `radial-gradient(circle, ${stopString})`
        break
      case 'conic':
        gradient = `conic-gradient(from ${angle}deg, ${stopString})`
        break
    }
    
    return gradient
  }

  const updateGradient = () => {
    const gradient = generateCssGradient()
    setCssCode(gradient)
    trackUsage()
  }

  const updateSetting = (key: keyof GradientSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateGradient()
  }

  const updateStop = (stopId: string, key: keyof GradientStop, value: any) => {
    const newStops = settings.stops.map(stop => 
      stop.id === stopId ? { ...stop, [key]: value } : stop
    )
    updateSetting('stops', newStops)
  }

  const addStop = () => {
    const newStop: GradientStop = {
      id: Date.now().toString(),
      color: '#000000',
      position: 50
    }
    updateSetting('stops', [...settings.stops, newStop])
  }

  const removeStop = (stopId: string) => {
    if (settings.stops.length > 2) {
      const newStops = settings.stops.filter(stop => stop.id !== stopId)
      updateSetting('stops', newStops)
    }
  }

  const copyToClipboard = () => {
    if (cssCode) {
      const fullCss = `background: ${cssCode};`
      navigator.clipboard.writeText(fullCss)
    }
  }

  const downloadCss = () => {
    if (cssCode) {
      const fullCss = `/* CSS Gradient Generated */\n.gradient-element {\n  background: ${cssCode};\n}`
      const blob = new Blob([fullCss], { type: 'text/css' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'css-gradient.css'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const presetGradients = [
    {
      name: 'Sunset',
      description: 'Warm orange to pink',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      stops: [
        { color: '#ff9a9e', position: 0 },
        { color: '#fecfef', position: 100 }
      ]
    },
    {
      name: 'Ocean',
      description: 'Blue to teal',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ]
    },
    {
      name: 'Forest',
      description: 'Green to dark green',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      stops: [
        { color: '#11998e', position: 0 },
        { color: '#38ef7d', position: 100 }
      ]
    },
    {
      name: 'Fire',
      description: 'Red to yellow',
      gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      stops: [
        { color: '#ff416c', position: 0 },
        { color: '#ff4b2b', position: 100 }
      ]
    },
    {
      name: 'Purple Rain',
      description: 'Purple to blue',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ]
    }
  ]

  const applyPreset = (preset: typeof presetGradients[0]) => {
    const newStops = preset.stops.map((stop, index) => ({
      id: (index + 1).toString(),
      color: stop.color,
      position: stop.position
    }))
    
    setSettings({
      ...settings,
      stops: newStops
    })
    setCssCode(preset.gradient)
    trackUsage()
  }

  // Initialize gradient on first render
  useState(() => {
    updateGradient()
  })

  const currentGradient = generateCssGradient()

  return (
    <ToolLayout
      toolId="css-gradient-generator"
      toolName="CSS Gradient Generator"
      toolDescription="Create beautiful CSS gradients with real-time preview and code generation"
      toolCategory="Design Tools"
      toolIcon={<Palette className="w-8 h-8" />}
    >
      <div className="space-y-6">
        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preset Gradients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {presetGradients.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start"
                  onClick={() => applyPreset(preset)}
                  style={{ background: preset.gradient }}
                >
                  <div className="font-medium text-sm text-white drop-shadow">{preset.name}</div>
                  <div className="text-xs text-white/80 drop-shadow">{preset.description}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Gradient Controls</CardTitle>
              <CardDescription>
                Customize your gradient with these settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gradient Type</Label>
                  <Select value={settings.type} onValueChange={(value) => updateSetting('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                      <SelectItem value="conic">Conic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.type === 'linear' && (
                  <div className="space-y-2">
                    <Label htmlFor="angle">Angle: {settings.angle}°</Label>
                    <Input
                      id="angle"
                      type="range"
                      min="0"
                      max="360"
                      value={settings.angle}
                      onChange={(e) => updateSetting('angle', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Color Stops</Label>
                    <Button variant="outline" size="sm" onClick={addStop}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Stop
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {settings.stops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="color"
                            value={stop.color}
                            onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                            className="w-8 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={stop.color}
                            onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                            className="flex-1 text-sm"
                            placeholder="#000000"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={stop.position}
                            onChange={(e) => updateStop(stop.id, 'position', parseInt(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm w-10">{stop.position}%</span>
                          {settings.stops.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStop(stop.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview and Output */}
          <Card>
            <CardHeader>
              <CardTitle>Preview & CSS Code</CardTitle>
              <CardDescription>
                See your gradient and get the CSS code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">Text Preview</TabsTrigger>
                  <TabsTrigger value="box">Box Preview</TabsTrigger>
                  <TabsTrigger value="code">CSS Code</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preview-text">Preview Text</Label>
                    <Input
                      id="preview-text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      placeholder="Beautiful Gradient"
                    />
                  </div>
                  
                  <div 
                    className="border rounded-lg p-12 text-center text-white text-2xl font-bold drop-shadow-lg"
                    style={{ background: currentGradient }}
                  >
                    {previewText}
                  </div>
                </TabsContent>

                <TabsContent value="box" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="border rounded-lg p-8 h-40 flex items-center justify-center text-white font-medium"
                      style={{ background: currentGradient }}
                    >
                      Small Box
                    </div>
                    <div 
                      className="border rounded-lg p-8 h-40 flex items-center justify-center text-white font-medium"
                      style={{ background: currentGradient }}
                    >
                      Small Box
                    </div>
                  </div>
                  <div 
                    className="border rounded-lg p-12 h-40 flex items-center justify-center text-white font-bold text-xl"
                    style={{ background: currentGradient }}
                  >
                    Large Preview Area
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generated CSS</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadCss}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                      <div className="text-green-600">background: </div>
                      <div>{currentGradient};</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cross-browser Compatibility</Label>
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm text-muted-foreground">
                      <div>background: -webkit-{currentGradient};</div>
                      <div>background: -moz-{currentGradient};</div>
                      <div>background: -o-{currentGradient};</div>
                      <div>background: {currentGradient};</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">About CSS Gradients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">What are CSS Gradients?</h4>
                  <p className="text-muted-foreground">
                    CSS gradients are smooth transitions between two or more colors that create a gradient effect without using images.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Types of Gradients</h4>
                  <p className="text-muted-foreground">
                    Linear gradients follow a straight line, radial gradients radiate from a center point, and conic gradients rotate around a center point.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Performance Benefits</h4>
                  <p className="text-muted-foreground">
                    Gradients are generated by the browser, making them lightweight and scalable compared to image-based backgrounds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Design Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Color Harmony</h4>
                  <p className="text-muted-foreground">
                    Use colors that work well together. Consider using complementary or analogous color schemes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Subtle vs Bold</h4>
                  <p className="text-muted-foreground">
                    Subtle gradients work well for backgrounds, while bold gradients can be used for accents and calls to action.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Accessibility</h4>
                  <p className="text-muted-foreground">
                    Ensure text remains readable over gradient backgrounds by using sufficient contrast or text shadows.
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