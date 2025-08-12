'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, RotateCcw } from 'lucide-react'

export default function BorderRadiusGenerator() {
  const [borderRadius, setBorderRadius] = useState({
    topLeft: '10',
    topRight: '10',
    bottomLeft: '10',
    bottomRight: '10'
  })
  const [cssCode, setCssCode] = useState('')

  const generateCSS = () => {
    const { topLeft, topRight, bottomLeft, bottomRight } = borderRadius
    
    // Check if all values are the same
    if (topLeft === topRight && topRight === bottomLeft && bottomLeft === bottomRight) {
      setCssCode(`border-radius: ${topLeft}px;`)
    } 
    // Check if top-left = bottom-right and top-right = bottom-left
    else if (topLeft === bottomRight && topRight === bottomLeft) {
      setCssCode(`border-radius: ${topLeft}px ${topRight}px;`)
    }
    // Check if top-left = top-right and bottom-left = bottom-right
    else if (topLeft === topRight && bottomLeft === bottomRight) {
      setCssCode(`border-radius: ${topLeft}px ${topLeft}px ${bottomLeft}px ${bottomLeft}px;`)
    }
    // Individual values
    else {
      setCssCode(`border-radius: ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`)
    }
  }

  const handleInputChange = (corner: string, value: string) => {
    setBorderRadius(prev => ({
      ...prev,
      [corner]: value
    }))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode)
  }

  const resetValues = () => {
    setBorderRadius({
      topLeft: '10',
      topRight: '10',
      bottomLeft: '10',
      bottomRight: '10'
    })
    setCssCode('')
  }

  const presetShapes = [
    { name: 'Square', values: { topLeft: '0', topRight: '0', bottomLeft: '0', bottomRight: '0' } },
    { name: 'Circle', values: { topLeft: '50', topRight: '50', bottomLeft: '50', bottomRight: '50' } },
    { name: 'Pill', values: { topLeft: '50', topRight: '50', bottomLeft: '50', bottomRight: '50' } },
    { name: 'Top Rounded', values: { topLeft: '20', topRight: '20', bottomLeft: '0', bottomRight: '0' } },
    { name: 'Bottom Rounded', values: { topLeft: '0', topRight: '0', bottomLeft: '20', bottomRight: '20' } },
    { name: 'Left Rounded', values: { topLeft: '20', topRight: '0', bottomLeft: '20', bottomRight: '0' } },
    { name: 'Right Rounded', values: { topLeft: '0', topRight: '20', bottomLeft: '0', bottomRight: '20' } },
  ]

  const applyPreset = (values: any) => {
    setBorderRadius(values)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Border Radius Generator</h1>
          <p className="text-muted-foreground">
            Generate CSS border-radius code with live preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Border Radius Controls</CardTitle>
              <CardDescription>
                Adjust the values for each corner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topLeft">Top Left</Label>
                  <div className="flex gap-2">
                    <Input
                      id="topLeft"
                      type="number"
                      value={borderRadius.topLeft}
                      onChange={(e) => handleInputChange('topLeft', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topRight">Top Right</Label>
                  <div className="flex gap-2">
                    <Input
                      id="topRight"
                      type="number"
                      value={borderRadius.topRight}
                      onChange={(e) => handleInputChange('topRight', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bottomLeft">Bottom Left</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottomLeft"
                      type="number"
                      value={borderRadius.bottomLeft}
                      onChange={(e) => handleInputChange('bottomLeft', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bottomRight">Bottom Right</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottomRight"
                      type="number"
                      value={borderRadius.bottomRight}
                      onChange={(e) => handleInputChange('bottomRight', e.target.value)}
                      min="0"
                      max="100"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">px</span>
                  </div>
                </div>
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
                See how your border-radius looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div
                    className="w-48 h-48 bg-primary/20 border-2 border-primary flex items-center justify-center"
                    style={{
                      borderRadius: `${borderRadius.topLeft}px ${borderRadius.topRight}px ${borderRadius.bottomRight}px ${borderRadius.bottomLeft}px`
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
            <CardTitle>Preset Shapes</CardTitle>
            <CardDescription>
              Quick presets for common border-radius patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {presetShapes.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => applyPreset(preset.values)}
                  className="h-auto py-4"
                >
                  <div className="text-center">
                    <div
                      className="w-12 h-12 mx-auto mb-2 bg-primary/20 border border-primary"
                      style={{
                        borderRadius: `${preset.values.topLeft}px ${preset.values.topRight}px ${preset.values.bottomRight}px ${preset.values.bottomLeft}px`
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