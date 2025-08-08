'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Eye, Palette } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ColorPickerTool() {
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [hex, setHex] = useState('#3b82f6')
  const [rgb, setRgb] = useState('rgb(59, 130, 246)')
  const [hsl, setHsl] = useState('hsl(217, 91%, 60%)')
  const [rgba, setRgba] = useState('rgba(59, 130, 246, 1)')
  const [hsla, setHsla] = useState('hsla(217, 91%, 60%, 1)')
  const [alpha, setAlpha] = useState(1)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    convertColor(selectedColor)
  }, [selectedColor])

  const convertColor = (color: string) => {
    try {
      // Create a temporary element to use the browser's color conversion
      const tempDiv = document.createElement('div')
      tempDiv.style.color = color
      document.body.appendChild(tempDiv)
      
      const computedColor = window.getComputedStyle(tempDiv).color
      document.body.removeChild(tempDiv)

      // Parse RGB values
      const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1])
        const g = parseInt(rgbMatch[2])
        const b = parseInt(rgbMatch[3])
        
        setRgb(`rgb(${r}, ${g}, ${b})`)
        setRgba(`rgba(${r}, ${g}, ${b}, ${alpha})`)
        
        // Convert to HEX
        const toHex = (n: number) => n.toString(16).padStart(2, '0')
        setHex(`#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase())
        
        // Convert to HSL
        const rNorm = r / 255
        const gNorm = g / 255
        const bNorm = b / 255
        
        const max = Math.max(rNorm, gNorm, bNorm)
        const min = Math.min(rNorm, gNorm, bNorm)
        let h = 0, s = 0, l = (max + min) / 2
        
        if (max !== min) {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          
          switch (max) {
            case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break
            case gNorm: h = (bNorm - rNorm) / d + 2; break
            case bNorm: h = (rNorm - gNorm) / d + 4; break
          }
          h /= 6
        }
        
        h = Math.round(h * 360)
        s = Math.round(s * 100)
        l = Math.round(l * 100)
        
        setHsl(`hsl(${h}, ${s}%, ${l}%)`)
        setHsla(`hsla(${h}, ${s}%, ${l}%, ${alpha})`)
      }
    } catch (error) {
      console.error('Color conversion error:', error)
    }
  }

  const handleHexChange = (value: string) => {
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setSelectedColor(value)
    }
  }

  const handleAlphaChange = (value: number) => {
    setAlpha(value)
    convertColor(selectedColor)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    setSelectedColor(randomColor)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Color Picker</h1>
        <p className="text-muted-foreground">
          Pick colors and get color codes in various formats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Picker Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Picker
            </CardTitle>
            <CardDescription>
              Select a color using the color picker or input a HEX value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="w-48 h-48 rounded-lg border-2 border-gray-300 cursor-pointer shadow-lg"
                style={{ backgroundColor: selectedColor }}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
              />
              
              <div className="w-full space-y-2">
                <Label htmlFor="hex-input">HEX Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="hex-input"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    placeholder="#000000"
                    className="font-mono"
                  />
                  <Button onClick={() => copyToClipboard(hex, 'HEX')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={generateRandomColor} variant="outline" className="w-full">
                Generate Random Color
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Values Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Color Values
            </CardTitle>
            <CardDescription>
              Color values in different formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hex" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hex">HEX</TabsTrigger>
                <TabsTrigger value="rgb">RGB</TabsTrigger>
                <TabsTrigger value="hsl">HSL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hex" className="space-y-4">
                <div className="space-y-2">
                  <Label>HEX</Label>
                  <div className="flex gap-2">
                    <Input value={hex} readOnly className="font-mono" />
                    <Button onClick={() => copyToClipboard(hex, 'HEX')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>HEX with Alpha</Label>
                  <div className="flex gap-2">
                    <Input value={hex + Math.round(alpha * 255).toString(16).padStart(2, '0')} readOnly className="font-mono" />
                    <Button onClick={() => copyToClipboard(hex + Math.round(alpha * 255).toString(16).padStart(2, '0'), 'HEX Alpha')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="rgb" className="space-y-4">
                <div className="space-y-2">
                  <Label>RGB</Label>
                  <div className="flex gap-2">
                    <Input value={rgb} readOnly className="font-mono" />
                    <Button onClick={() => copyToClipboard(rgb, 'RGB')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>RGBA</Label>
                  <div className="flex gap-2">
                    <Input value={rgba} readOnly className="font-mono" />
                    <Button onClick={() => copyToClipboard(rgba, 'RGBA')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Opacity</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={alpha}
                      onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12">{alpha}</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="hsl" className="space-y-4">
                <div className="space-y-2">
                  <Label>HSL</Label>
                  <div className="flex gap-2">
                    <Input value={hsl} readOnly className="font-mono" />
                    <Button onClick={() => copyToClipboard(hsl, 'HSL')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>HSLA</Label>
                  <div className="flex gap-2">
                    <Input value={hsla} readOnly className="font-mono" />
                    <Button onClick={() => copyToClipboard(hsla, 'HSLA')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>
            Commonly used color palettes for inspiration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
              '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
              '#F1948A', '#85C1E9', '#F4D03F', '#AED6F1', '#A9DFBF', '#FAD7A0'
            ].map((color) => (
              <div
                key={color}
                className="space-y-2 cursor-pointer group"
                onClick={() => setSelectedColor(color)}
              >
                <div
                  className="w-full h-16 rounded-lg border-2 border-gray-200 group-hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                />
                <div className="text-xs font-mono text-center text-muted-foreground group-hover:text-foreground transition-colors">
                  {color}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}