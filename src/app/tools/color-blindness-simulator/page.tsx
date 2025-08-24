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
import { Eye, Palette, Upload, Download } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function ColorBlindnessSimulator() {
  const [selectedColor, setSelectedColor] = useState('#3498db')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [simulationType, setSimulationType] = useState('protanopia')
  const { trackUsage } = useToolAccess('color-blindness-simulator')

  const colorBlindnessTypes = [
    { id: 'normal', name: 'Normal Vision', description: 'No color blindness' },
    { id: 'protanopia', name: 'Protanopia', description: 'Red-blind (missing red cones)' },
    { id: 'protanomaly', name: 'Protanomaly', description: 'Red-weak (abnormal red cones)' },
    { id: 'deuteranopia', name: 'Deuteranopia', description: 'Green-blind (missing green cones)' },
    { id: 'deuteranomaly', name: 'Deuteranomaly', description: 'Green-weak (abnormal green cones)' },
    { id: 'tritanopia', name: 'Tritanopia', description: 'Blue-blind (missing blue cones)' },
    { id: 'tritanomaly', name: 'Tritanomaly', description: 'Blue-weak (abnormal blue cones)' },
    { id: 'achromatopsia', name: 'Achromatopsia', description: 'Complete color blindness' },
    { id: 'achromatomaly', name: 'Achromatomaly', description: 'Partial color blindness' }
  ]

  const simulateColorBlindness = (color: string, type: string): string => {
    // Track usage when simulation is performed
    trackUsage()

    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

 // Apply color blindness simulation matrices
 let newR = r, newG = g, newB = b

 switch (type) {
   case 'protanopia':
     // Red-blind simulation
     newR = 0.567 * r + 0.433 * g
     newG = 0.558 * r + 0.442 * g
     newB = 0.242 * g + 0.758 * b
     break
   case 'protanomaly':
     // Red-weak simulation
     newR = 0.817 * r + 0.183 * g
     newG = 0.333 * r + 0.667 * g
     newB = 0.125 * g + 0.875 * b
     break
   case 'deuteranopia':
     // Green-blind simulation
     newR = 0.625 * r + 0.375 * g
     newG = 0.7 * r + 0.3 * g
     newB = 0.3 * g + 0.7 * b
     break
   case 'deuteranomaly':
     // Green-weak simulation
     newR = 0.8 * r + 0.2 * g
     newG = 0.258 * r + 0.742 * g
     newB = 0.142 * g + 0.858 * b
     break
   case 'tritanopia':
     // Blue-blind simulation
     newR = 0.95 * r + 0.05 * g
     newG = 0.433 * g + 0.567 * b
     newB = 0.475 * g + 0.525 * b
     break
   case 'tritanomaly':
     // Blue-weak simulation
     newR = 0.967 * r + 0.033 * g
     newG = 0.733 * g + 0.267 * b
     newB = 0.183 * g + 0.817 * b
     break
   case 'achromatopsia':
     // Complete color blindness (monochrome)
     const gray = 0.299 * r + 0.587 * g + 0.114 * b
     newR = newG = newB = gray
     break
   case 'achromatomaly':
     // Partial color blindness
     const avg = (r + g + b) / 3
     newR = 0.618 * r + 0.382 * avg
     newG = 0.618 * g + 0.382 * avg
     newB = 0.618 * b + 0.382 * avg
     break
   default:
     // Normal vision - no change
     break
 }

 // Convert back to hex
 const toHex = (value: number) => {
   const hex = Math.round(Math.max(0, Math.min(1, value)) * 255).toString(16)
   return hex.length === 1 ? '0' + hex : hex
 }

 return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        trackUsage()
      }
      reader.readAsDataURL(file)
    }
  }

  const simulatedColor = simulateColorBlindness(selectedColor, simulationType)
  const currentType = colorBlindnessTypes.find(t => t.id === simulationType)

  return (
    <ToolLayout
      toolId="color-blindness-simulator"
      toolName="Color Blindness Simulator"
      toolDescription="See how colors appear to people with different types of color blindness"
      toolCategory="Design Tools"
      toolIcon={<Eye className="w-8 h-8" />}
    >
      <div className="space-y-6">
        {/* Color Blindness Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Color Vision Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={simulationType} onValueChange={setSimulationType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorBlindnessTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentType && (
              <p className="text-sm text-muted-foreground mt-2">
                {currentType.description}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="color-picker" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="color-picker">Color Picker</TabsTrigger>
            <TabsTrigger value="image-upload">Image Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="color-picker" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Color Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Original Color</CardTitle>
                  <CardDescription>
                    Select a color to see how it appears with {currentType?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-picker">Choose Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color-picker"
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        placeholder="#3498db"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Preview</Label>
                    <div 
                      className="w-full h-24 rounded-lg border-2 border-border"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Original</span>
                      <Badge variant="outline">{selectedColor}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Simulated Color */}
              <Card>
                <CardHeader>
                  <CardTitle>Simulated Color</CardTitle>
                  <CardDescription>
                    How the color appears to someone with {currentType?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Color Preview</Label>
                    <div 
                      className="w-full h-24 rounded-lg border-2 border-border"
                      style={{ backgroundColor: simulatedColor }}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Simulated</span>
                      <Badge variant="outline">{simulatedColor}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-medium">Before</div>
                      <div className="text-muted-foreground">{selectedColor}</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium">After</div>
                      <div className="text-muted-foreground">{simulatedColor}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="image-upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>
                  Upload an image to see how it appears with {currentType?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Choose Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop an image here, or click to browse
                    </p>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      Select Image
                    </Button>
                  </div>
                </div>

                {imagePreview && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Original Image</Label>
                        <img 
                          src={imagePreview} 
                          alt="Original" 
                          className="w-full h-auto rounded-lg border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Simulated Image</Label>
                        <div className="w-full h-auto rounded-lg border bg-muted flex items-center justify-center p-8">
                          <div className="text-center text-muted-foreground">
                            <Palette className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Image simulation would appear here</p>
                            <p className="text-xs mt-1">(Advanced image processing would be implemented here)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Understanding Color Blindness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">What is Color Blindness?</h4>
                  <p className="text-muted-foreground">
                    Color blindness is the decreased ability to see color or differences in color. It affects approximately 1 in 12 men and 1 in 200 women.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Common Types</h4>
                  <p className="text-muted-foreground">
                    The most common types are red-green color blindness (protanopia/deuteranopia), affecting about 99% of color blind individuals.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Design Implications</h4>
                  <p className="text-muted-foreground">
                    Understanding color blindness helps create more accessible designs for all users.
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
                  <h4 className="font-medium mb-1">Don't Rely on Color Alone</h4>
                  <p className="text-muted-foreground">
                    Use patterns, textures, or labels in addition to color coding.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Use High Contrast</h4>
                  <p className="text-muted-foreground">
                    Ensure text and important elements have sufficient contrast.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Test Your Designs</h4>
                  <p className="text-muted-foreground">
                    Use tools like this to verify your designs work for color blind users.
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