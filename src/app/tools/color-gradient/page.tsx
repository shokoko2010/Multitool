'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, RotateCcw } from 'lucide-react'

const gradientTypes = [
  { value: 'linear', name: 'Linear Gradient' },
  { value: 'radial', name: 'Radial Gradient' },
  { value: 'conic', name: 'Conic Gradient' },
]

const gradientDirections = [
  { value: 'to right', name: 'To Right' },
  { value: 'to left', name: 'To Left' },
  { value: 'to bottom', name: 'To Bottom' },
  { value: 'to top', name: 'To Top' },
  { value: 'to bottom right', name: 'To Bottom Right' },
  { value: 'to bottom left', name: 'To Bottom Left' },
  { value: 'to top right', name: 'To Top Right' },
  { value: 'to top left', name: 'To Top Left' },
  { value: '45deg', name: '45 Degrees' },
  { value: '90deg', name: '90 Degrees' },
  { value: '135deg', name: '135 Degrees' },
  { value: '180deg', name: '180 Degrees' },
]

const presetGradients = [
  { name: 'Sunset', colors: ['#ff6b6b', '#4ecdc4'] },
  { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { name: 'Forest', colors: ['#134e5e', '#71b280'] },
  { name: 'Fire', colors: ['#f12711', '#f5af19'] },
  { name: 'Night', colors: ['#0f0c29', '#302b63', '#24243e'] },
  { name: 'Candy', colors: ['#ff9a9e', '#fecfef', '#fecfef'] },
  { name: 'Royal', colors: ['#141e30', '#243b55'] },
  { name: 'Peach', colors: ['#ffecd2', '#fcb69f'] },
]

export default function ColorGradientGenerator() {
  const [gradientType, setGradientType] = useState('linear')
  const [direction, setDirection] = useState('to right')
  const [colors, setColors] = useState(['#667eea', '#764ba2'])
  const [cssCode, setCssCode] = useState('')

  const generateCSS = () => {
    let css = ''
    
    if (gradientType === 'linear') {
      css = `background: linear-gradient(${direction}, ${colors.join(', ')});`
    } else if (gradientType === 'radial') {
      css = `background: radial-gradient(circle, ${colors.join(', ')});`
    } else if (gradientType === 'conic') {
      css = `background: conic-gradient(${colors.join(', ')});`
    }
    
    setCssCode(css)
  }

  const addColor = () => {
    if (colors.length < 5) {
      setColors([...colors, '#000000'])
    }
  }

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index))
    }
  }

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors]
    newColors[index] = color
    setColors(newColors)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode)
  }

  const resetValues = () => {
    setGradientType('linear')
    setDirection('to right')
    setColors(['#667eea', '#764ba2'])
    setCssCode('')
  }

  const applyPreset = (presetColors: string[]) => {
    setColors(presetColors)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Color Gradient Generator</h1>
          <p className="text-muted-foreground">
            Create beautiful CSS gradients with live preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Gradient Settings</CardTitle>
              <CardDescription>
                Configure your gradient properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradientType">Gradient Type</Label>
                  <Select value={gradientType} onValueChange={setGradientType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {gradientType === 'linear' && (
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select value={direction} onValueChange={setDirection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gradientDirections.map((dir) => (
                          <SelectItem key={dir.value} value={dir.value}>
                            {dir.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Colors</Label>
                <div className="space-y-2">
                  {colors.map((color, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                      {colors.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeColor(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {colors.length < 5 && (
                  <Button variant="outline" onClick={addColor} className="w-full">
                    Add Color
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={generateCSS}>
                  Generate CSS
                </Button>
                <Button variant="outline" onClick={resetValues}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {cssCode && (
                <div className="space-y-2">
                  <Label>Generated CSS</Label>
                  <div className="relative">
                    <pre className="bg-muted p-3 rounded-md text-sm font-mono">
                      {cssCode}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your gradient looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="w-full h-64 rounded-lg border border-gray-200"
                  style={{
                    background: cssCode.replace('background: ', '').replace(';', '')
                  }}
                />
                <div className="text-center text-sm text-muted-foreground">
                  Preview of your gradient
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presets */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preset Gradients</CardTitle>
            <CardDescription>
              Quick presets for beautiful gradients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presetGradients.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => applyPreset(preset.colors)}
                  className="h-auto py-4"
                >
                  <div className="text-center w-full">
                    <div
                      className="w-full h-12 mb-2 rounded"
                      style={{
                        background: `linear-gradient(to right, ${preset.colors.join(', ')})`
                      }}
                    />
                    <div className="text-xs">{preset.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Gradient Examples</CardTitle>
            <CardDescription>
              See different gradient types and directions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="h-20 rounded mb-2" style={{ background: 'linear-gradient(to right, #ff6b6b, #4ecdc4)' }} />
                <div className="text-sm text-center">Linear (Right)</div>
              </div>
              <div>
                <div className="h-20 rounded mb-2" style={{ background: 'radial-gradient(circle, #667eea, #764ba2)' }} />
                <div className="text-sm text-center">Radial</div>
              </div>
              <div>
                <div className="h-20 rounded mb-2" style={{ background: 'linear-gradient(45deg, #f12711, #f5af19)' }} />
                <div className="text-sm text-center">Linear (45°)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}