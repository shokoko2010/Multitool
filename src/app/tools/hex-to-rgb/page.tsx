'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Copy, RefreshCw, Hash, Droplet } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function HexToRGB() {
  const [hexInput, setHexInput] = useState('')
  const [rgbOutput, setRgbOutput] = useState({ r: 0, g: 0, b: 0 })
  const [isValidHex, setIsValidHex] = useState(true)
  const [copied, setCopied] = useState('')
  const { toast } = useToast()

  const isValidHexColor = (hex: string): boolean => {
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexRegex.test(hex)
  }

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    // Remove # if present
    hex = hex.replace('#', '')
    
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    
    const num = parseInt(hex, 16)
    if (isNaN(num)) return null
    
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    }
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const handleHexInput = (value: string) => {
    setHexInput(value)
    setCopied('')
    
    if (!value.trim()) {
      setIsValidHex(true)
      return
    }
    
    const valid = isValidHexColor(value)
    setIsValidHex(valid)
    
    if (valid) {
      const rgb = hexToRgb(value)
      if (rgb) {
        setRgbOutput(rgb)
      }
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      variant: "default",
    })
    
    setTimeout(() => setCopied(''), 2000)
  }

  const insertSampleHex = () => {
    setHexInput('#3498db')
  }

  const clearAll = () => {
    setHexInput('')
    setRgbOutput({ r: 0, g: 0, b: 0 })
    setCopied('')
    setIsValidHex(true)
  }

  const generateRandomHex = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    setHexInput(randomHex)
    handleHexInput(randomHex)
  }

  const commonColors = [
    { hex: '#FF0000', name: 'Red' },
    { hex: '#00FF00', name: 'Green' },
    { hex: '#0000FF', name: 'Blue' },
    { hex: '#FFFF00', name: 'Yellow' },
    { hex: '#FF00FF', name: 'Magenta' },
    { hex: '#00FFFF', name: 'Cyan' },
    { hex: '#000000', name: 'Black' },
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#808080', name: 'Gray' },
    { hex: '#800080', name: 'Purple' },
    { hex: '#FFA500', name: 'Orange' },
    { hex: '#FFC0CB', name: 'Pink' },
    { hex: '#A52A2A', name: 'Brown' },
    { hex: '#008000', name: 'Dark Green' },
    { hex: '#000080', name: 'Navy' },
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">HEX to RGB Converter</h1>
          <p className="text-muted-foreground">Convert between HEX color codes and RGB values</p>
        </div>

        <Tabs defaultValue="hex-to-rgb" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hex-to-rgb">HEX to RGB</TabsTrigger>
            <TabsTrigger value="rgb-to-hex">RGB to HEX</TabsTrigger>
          </TabsList>

          <TabsContent value="hex-to-rgb" className="space-y-6">
            {/* HEX Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  HEX Color Input
                </CardTitle>
                <CardDescription>Enter a HEX color code to convert to RGB</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={insertSampleHex} variant="outline" size="sm">
                    Insert Sample
                  </Button>
                  <Button onClick={generateRandomHex} variant="outline" size="sm">
                    Random Color
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hex-input">HEX Color Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hex-input"
                      type="text"
                      placeholder="#3498db"
                      value={hexInput}
                      onChange={(e) => handleHexInput(e.target.value)}
                      className="font-mono"
                    />
                    <div 
                      className="w-12 h-10 rounded border flex items-center justify-center"
                      style={{ backgroundColor: isValidHex && hexInput ? hexInput : '#f3f4f6' }}
                    >
                      {isValidHex && hexInput && (
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: hexInput }}
                        />
                      )}
                    </div>
                  </div>
                  {!isValidHex && (
                    <p className="text-sm text-destructive">Please enter a valid HEX color code (e.g., #3498db or #fff)</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RGB Output */}
            {hexInput && isValidHex && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5" />
                    RGB Color Output
                  </CardTitle>
                  <CardDescription>Converted RGB values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Red (R)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={rgbOutput.r}
                          readOnly
                          className="font-mono"
                        />
                        <Badge variant="outline">R</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Green (G)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={rgbOutput.g}
                          readOnly
                          className="font-mono"
                        />
                        <Badge variant="outline">G</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Blue (B)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={rgbOutput.b}
                          readOnly
                          className="font-mono"
                        />
                        <Badge variant="outline">B</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">RGB Color Preview</Label>
                    <div 
                      className="w-full h-20 rounded-lg border-2 border-dashed border-muted-foreground/25"
                      style={{ backgroundColor: `rgb(${rgbOutput.r}, ${rgbOutput.g}, ${rgbOutput.b})` }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">RGB String</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={`rgb(${rgbOutput.r}, ${rgbOutput.g}, ${rgbOutput.b})`}
                        readOnly
                        className="font-mono"
                      />
                      <Button 
                        onClick={() => copyToClipboard(`rgb(${rgbOutput.r}, ${rgbOutput.g}, ${rgbOutput.b})`, 'RGB')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'RGB'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">HEX String</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={hexInput}
                        readOnly
                        className="font-mono"
                      />
                      <Button 
                        onClick={() => copyToClipboard(hexInput, 'HEX')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'HEX'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Common Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Common Colors</CardTitle>
                <CardDescription>Click on any color to use it</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {commonColors.map((color, index) => (
                    <Button
                      key={index}
                      onClick={() => handleHexInput(color.hex)}
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <div 
                        className="w-8 h-8 rounded border mb-1"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-mono">{color.hex}</span>
                      <span className="text-xs text-muted-foreground">{color.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rgb-to-hex" className="space-y-6">
            {/* RGB Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5" />
                  RGB Color Input
                </CardTitle>
                <CardDescription>Enter RGB values to convert to HEX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="red-input">Red (R)</Label>
                    <Input
                      id="red-input"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="255"
                      value={rgbOutput.r}
                      onChange={(e) => setRgbOutput({ ...rgbOutput, r: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="green-input">Green (G)</Label>
                    <Input
                      id="green-input"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="255"
                      value={rgbOutput.g}
                      onChange={(e) => setRgbOutput({ ...rgbOutput, g: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blue-input">Blue (B)</Label>
                    <Input
                      id="blue-input"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="255"
                      value={rgbOutput.b}
                      onChange={(e) => setRgbOutput({ ...rgbOutput, b: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Color Preview</Label>
                  <div 
                    className="w-full h-20 rounded-lg border-2 border-dashed border-muted-foreground/25"
                    style={{ backgroundColor: `rgb(${rgbOutput.r}, ${rgbOutput.g}, ${rgbOutput.b})` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* HEX Output */}
            {(rgbOutput.r !== 0 || rgbOutput.g !== 0 || rgbOutput.b !== 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    HEX Color Output
                  </CardTitle>
                  <CardDescription>Converted HEX color code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">HEX Color Code</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={rgbToHex(rgbOutput.r, rgbOutput.g, rgbOutput.b)}
                        readOnly
                        className="font-mono text-lg"
                      />
                      <Button 
                        onClick={() => copyToClipboard(rgbToHex(rgbOutput.r, rgbOutput.g, rgbOutput.b), 'HEX')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'HEX'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">RGB Values</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={`rgb(${rgbOutput.r}, ${rgbOutput.g}, ${rgbOutput.b})`}
                        readOnly
                        className="font-mono"
                      />
                      <Button 
                        onClick={() => copyToClipboard(`rgb(${rgbOutput.r}, ${rgbOutput.g}, ${rgbOutput.b})`, 'RGB')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'RGB'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
            <CardDescription>Best practices for color conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• HEX codes can be 3-digit (#fff) or 6-digit (#ffffff)</li>
              <li>• RGB values range from 0 to 255 for each component</li>
              <li>• Use the color preview to see your selections</li>
              <li>• Click the copy buttons to quickly copy color values</li>
              <li>• Common colors are available for quick selection</li>
              <li>• Both formats are widely supported in web design</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}