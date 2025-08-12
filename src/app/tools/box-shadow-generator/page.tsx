'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, RotateCcw } from 'lucide-react'

export default function BoxShadowGenerator() {
  const [shadow, setShadow] = useState({
    hOffset: '0',
    vOffset: '4',
    blur: '6',
    spread: '0',
    color: '#000000',
    opacity: '20'
  })
  const [cssCode, setCssCode] = useState('')
  const [inset, setInset] = useState(false)

  const generateCSS = () => {
    const { hOffset, vOffset, blur, spread, color, opacity } = shadow
    const rgbaColor = hexToRgba(color, opacity)
    const insetValue = inset ? 'inset ' : ''
    setCssCode(`box-shadow: ${insetValue}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${rgbaColor};`)
  }

  const hexToRgba = (hex: string, opacity: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
  }

  const handleInputChange = (property: string, value: string) => {
    setShadow(prev => ({
      ...prev,
      [property]: value
    }))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode)
  }

  const resetValues = () => {
    setShadow({
      hOffset: '0',
      vOffset: '4',
      blur: '6',
      spread: '0',
      color: '#000000',
      opacity: '20'
    })
    setInset(false)
    setCssCode('')
  }

  const presetShadows = [
    { name: 'None', values: { hOffset: '0', vOffset: '0', blur: '0', spread: '0', color: '#000000', opacity: '0' } },
    { name: 'Small', values: { hOffset: '0', vOffset: '2', blur: '4', spread: '0', color: '#000000', opacity: '20' } },
    { name: 'Medium', values: { hOffset: '0', vOffset: '4', blur: '6', spread: '0', color: '#000000', opacity: '20' } },
    { name: 'Large', values: { hOffset: '0', vOffset: '8', blur: '16', spread: '0', color: '#000000', opacity: '20' } },
    { name: 'Extra Large', values: { hOffset: '0', vOffset: '12', blur: '24', spread: '0', color: '#000000', opacity: '20' } },
    { name: 'Inner', values: { hOffset: '0', vOffset: '2', blur: '4', spread: '0', color: '#000000', opacity: '20' } },
    { name: 'Colored', values: { hOffset: '0', vOffset: '4', blur: '8', spread: '0', color: '#3b82f6', opacity: '30' } },
  ]

  const applyPreset = (values: any) => {
    setShadow(values)
    if (values.name === 'Inner') {
      setInset(true)
    } else {
      setInset(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Box Shadow Generator</h1>
          <p className="text-muted-foreground">
            Generate CSS box-shadow code with live preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Shadow Controls</CardTitle>
              <CardDescription>
                Adjust the shadow properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hOffset">Horizontal Offset</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hOffset"
                      type="number"
                      value={shadow.hOffset}
                      onChange={(e) => handleInputChange('hOffset', e.target.value)}
                      min="-50"
                      max="50"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vOffset">Vertical Offset</Label>
                  <div className="flex gap-2">
                    <Input
                      id="vOffset"
                      type="number"
                      value={shadow.vOffset}
                      onChange={(e) => handleInputChange('vOffset', e.target.value)}
                      min="-50"
                      max="50"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blur">Blur Radius</Label>
                  <div className="flex gap-2">
                    <Input
                      id="blur"
                      type="number"
                      value={shadow.blur}
                      onChange={(e) => handleInputChange('blur', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spread">Spread Radius</Label>
                  <div className="flex gap-2">
                    <Input
                      id="spread"
                      type="number"
                      value={shadow.spread}
                      onChange={(e) => handleInputChange('spread', e.target.value)}
                      min="-50"
                      max="50"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={shadow.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                    <Input
                      type="text"
                      value={shadow.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opacity">Opacity</Label>
                  <div className="flex gap-2">
                    <Input
                      id="opacity"
                      type="range"
                      value={shadow.opacity}
                      onChange={(e) => handleInputChange('opacity', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="flex items-center text-sm text-muted-foreground w-12">{shadow.opacity}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inset"
                  checked={inset}
                  onChange={(e) => setInset(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="inset">Inset Shadow</Label>
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
                See how your box-shadow looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div
                    className="w-48 h-48 bg-white border border-gray-200 flex items-center justify-center"
                    style={{
                      boxShadow: cssCode.replace('box-shadow: ', '').replace(';', '')
                    }}
                  >
                    <span className="text-sm text-muted-foreground">Preview</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presets */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preset Shadows</CardTitle>
            <CardDescription>
              Quick presets for common shadow effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {presetShadows.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => applyPreset(preset.values)}
                  className="h-auto py-4"
                >
                  <div className="text-center">
                    <div
                      className="w-12 h-12 mx-auto mb-2 bg-white border border-gray-200"
                      style={{
                        boxShadow: `${preset.name === 'Inner' ? 'inset ' : ''}${preset.values.hOffset}px ${preset.values.vOffset}px ${preset.values.blur}px ${preset.values.spread}px ${hexToRgba(preset.values.color, preset.values.opacity)}`
                      }}
                    />
                    <div className="text-xs">{preset.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}