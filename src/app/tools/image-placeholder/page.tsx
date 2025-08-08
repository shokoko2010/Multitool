'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Image as ImageIcon, Download, Copy, Settings, Palette, Type } from 'lucide-react'

export default function ImagePlaceholderGenerator() {
  const [width, setWidth] = useState('400')
  const [height, setHeight] = useState('300')
  const [backgroundColor, setBackgroundColor] = useState('#f0f0f0')
  const [textColor, setTextColor] = useState('#666666')
  const [placeholderText, setPlaceholderText] = useState('Image')
  const [fontSize, setFontSize] = useState('24')
  const [fontWeight, setFontWeight] = useState('bold')
  const [loading, setLoading] = useState(false)
  const [placeholderUrl, setPlaceholderUrl] = useState('')
  const [error, setError] = useState('')

  const generatePlaceholder = async () => {
    if (!width || !height) {
      setError('Please specify both width and height')
      return
    }

    setLoading(true)
    setError('')
    setPlaceholderUrl('')

    try {
      // Simulate placeholder generation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create placeholder data URL
      const canvas = document.createElement('canvas')
      canvas.width = parseInt(width)
      canvas.height = parseInt(height)
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')
      
      // Fill background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw text
      ctx.fillStyle = textColor
      ctx.font = `${fontWeight} ${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Word wrap for long text
      const words = placeholderText.split(' ')
      const lines = []
      let currentLine = words[0]
      
      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(currentLine + ' ' + word).width
        if (width < canvas.width - 40) {
          currentLine += ' ' + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)
      
      // Draw lines
      const lineHeight = parseInt(fontSize) * 1.2
      const startY = (canvas.height - (lines.length - 1) * lineHeight) / 2
      
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * lineHeight)
      })
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png')
      setPlaceholderUrl(dataUrl)
    } catch (err) {
      setError('Failed to generate placeholder. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPlaceholder = () => {
    if (!placeholderUrl) return
    
    const link = document.createElement('a')
    link.href = placeholderUrl
    link.download = `placeholder-${width}x${height}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyImageUrl = () => {
    if (!placeholderUrl) return
    navigator.clipboard.writeText(placeholderUrl)
  }

  const getPresetUrl = (preset: string) => {
    const presets = {
      avatar: 'https://picsum.photos/seed/avatar/100/100.jpg',
      thumbnail: 'https://picsum.photos/seed/thumbnail/200/150.jpg',
      banner: 'https://picsum.photos/seed/banner/800/200.jpg',
      featured: 'https://picsum.photos/seed/featured/600/400.jpg',
      gallery: 'https://picsum.photos/seed/gallery/400/300.jpg',
      hero: 'https://picsum.photos/seed/hero/1200/400.jpg'
    }
    return presets[preset as keyof typeof presets] || ''
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Placeholder Generator
          </CardTitle>
          <CardDescription>
            Create custom image placeholders for your projects. Choose dimensions, 
            colors, text, and download in various formats. Perfect for prototyping 
            and development work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Generator</TabsTrigger>
              <TabsTrigger value="presets">Quick Presets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (px)</label>
                  <Input
                    type="number"
                    placeholder="400"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    min="1"
                    max="4000"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (px)</label>
                  <Input
                    type="number"
                    placeholder="300"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="1"
                    max="4000"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Background Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      placeholder="#f0f0f0"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      placeholder="#666666"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Placeholder Text</label>
                <Input
                  placeholder="Image"
                  value={placeholderText}
                  onChange={(e) => setPlaceholderText(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size (px)</label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    min="8"
                    max="200"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Weight</label>
                  <select
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Lighter</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="700">700</option>
                    <option value="800">800</option>
                    <option value="900">900</option>
                  </select>
                </div>
              </div>
              
              <Button onClick={generatePlaceholder} disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate Placeholder'}
              </Button>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setWidth('100')
                    setHeight('100')
                    setPlaceholderText('Avatar')
                  }}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <span className="text-xs">Avatar</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setWidth('200')
                    setHeight('150')
                    setPlaceholderText('Thumbnail')
                  }}
                >
                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <span className="text-xs">Thumbnail</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setWidth('800')
                    setHeight('200')
                    setPlaceholderText('Banner')
                  }}
                >
                  <div className="w-20 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-xs">Banner</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setWidth('600')
                    setHeight('400')
                    setPlaceholderText('Featured')
                  }}
                >
                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <span className="text-xs">Featured</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setWidth('400')
                    setHeight('300')
                    setPlaceholderText('Gallery')
                  }}
                >
                  <div className="w-12 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <span className="text-xs">Gallery</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-1"
                  onClick={() => {
                    setWidth('1200')
                    setHeight('400')
                    setPlaceholderText('Hero')
                  }}
                >
                  <div className="w-24 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <span className="text-xs">Hero</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {placeholderUrl && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadPlaceholder} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                <Button onClick={copyImageUrl} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Image URL
                </Button>
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Placeholder Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={placeholderUrl}
                          alt="Generated placeholder"
                          className="w-full h-auto"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold">{width}px</div>
                          <div className="text-sm text-muted-foreground">Width</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{height}px</div>
                          <div className="text-sm text-muted-foreground">Height</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">PNG</div>
                          <div className="text-sm text-muted-foreground">Format</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="code" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Embedding Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">HTML Image Tag</label>
                        <Textarea
                          value={`<img src="${placeholderUrl}" alt="${placeholderText}" width="${width}" height="${height}" />`}
                          readOnly
                          className="font-mono text-xs mt-1"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">CSS Background</label>
                        <Textarea
                          value={`background-image: url('${placeholderUrl}');\nbackground-size: ${width}px ${height}px;`}
                          readOnly
                          className="font-mono text-xs mt-1"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Markdown</label>
                        <Textarea
                          value={`![${placeholderText}](${placeholderUrl})`}
                          readOnly
                          className="font-mono text-xs mt-1"
                          rows={1}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Dimensions</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Width: {width}px</p>
                            <p>Height: {height}px</p>
                            <p>Aspect Ratio: {(parseInt(width) / parseInt(height)).toFixed(2)}:1</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Colors</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Background: {backgroundColor}</p>
                            <p>Text: {textColor}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Typography</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Text: "{placeholderText}"</p>
                            <p>Font Size: {fontSize}px</p>
                            <p>Font Weight: {fontWeight}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Export</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Format: PNG</p>
                            <p>Quality: High</p>
                            <p>Transparency: Supported</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}