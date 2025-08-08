'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Download, Copy, Settings, Monitor, Smartphone, Tablet } from 'lucide-react'

export default function WebsiteScreenshotGenerator() {
  const [url, setUrl] = useState('')
  const [width, setWidth] = useState('1920')
  const [height, setHeight] = useState('1080')
  const [device, setDevice] = useState('desktop')
  const [quality, setQuality] = useState('90')
  const [loading, setLoading] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [error, setError] = useState('')

  const generateScreenshot = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    setScreenshotUrl('')

    try {
      // Simulate screenshot generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock screenshot URL (in real implementation, this would be an actual screenshot)
      const mockScreenshotUrl = `https://picsum.photos/seed/${encodeURIComponent(url)}/${width}/${height}.jpg`
      setScreenshotUrl(mockScreenshotUrl)
    } catch (err) {
      setError('Failed to generate screenshot. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadScreenshot = () => {
    if (!screenshotUrl) return
    
    const link = document.createElement('a')
    link.href = screenshotUrl
    link.download = `screenshot-${new Date().getTime()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyImageUrl = () => {
    if (!screenshotUrl) return
    navigator.clipboard.writeText(screenshotUrl)
  }

  const getDeviceDimensions = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return { width: '375', height: '667' }
      case 'tablet':
        return { width: '768', height: '1024' }
      case 'desktop':
      default:
        return { width: '1920', height: '1080' }
    }
  }

  const handleDeviceChange = (deviceType: string) => {
    setDevice(deviceType)
    const dimensions = getDeviceDimensions(deviceType)
    setWidth(dimensions.width)
    setHeight(dimensions.height)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Website Screenshot Generator
          </CardTitle>
          <CardDescription>
            Generate high-quality screenshots of any website. Choose from different 
            devices, resolutions, and quality settings. Perfect for documentation, 
            presentations, and web analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Device Type</label>
              <div className="flex gap-2">
                <Button
                  variant={device === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDeviceChange('desktop')}
                  className="flex-1"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={device === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDeviceChange('tablet')}
                  className="flex-1"
                >
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  variant={device === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDeviceChange('mobile')}
                  className="flex-1"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Width (px)</label>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="100"
                max="3840"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Height (px)</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="100"
                max="2160"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality (%)</label>
              <Input
                type="number"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                min="10"
                max="100"
                className="w-full"
              />
            </div>
          </div>
          
          <Button onClick={generateScreenshot} disabled={loading} className="w-full">
            {loading ? 'Generating Screenshot...' : 'Generate Screenshot'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {screenshotUrl && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 border-b">
                    <span className="text-sm text-gray-600">Website Screenshot Preview</span>
                  </div>
                  <div className="p-4">
                    <img
                      src={screenshotUrl}
                      alt="Website screenshot"
                      className="w-full h-auto border rounded-lg shadow-sm"
                      style={{ maxHeight: '600px' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-primary">{width}</div>
                      <div className="text-xs text-muted-foreground">Width (px)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-primary">{height}</div>
                      <div className="text-xs text-muted-foreground">Height (px)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-primary">{quality}%</div>
                      <div className="text-xs text-muted-foreground">Quality</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Screenshot Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target URL</label>
                        <Input value={url} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Device Type</label>
                        <Badge variant="default">{device.charAt(0).toUpperCase() + device.slice(1)}</Badge>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Resolution</label>
                        <Input value={`${width} × ${height}`} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quality</label>
                        <Input value={`${quality}%`} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Common Presets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth('1920')
                          setHeight('1080')
                          setDevice('desktop')
                        }}
                      >
                        Full HD
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth('1280')
                          setHeight('720')
                          setDevice('desktop')
                        }}
                      >
                        HD
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth('375')
                          setHeight('667')
                          setDevice('mobile')
                        }}
                      >
                        iPhone
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth('768')
                          setHeight('1024')
                          setDevice('tablet')
                        }}
                      >
                        iPad
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="export" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={downloadScreenshot} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </Button>
                      <Button onClick={copyImageUrl} variant="outline" className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Direct Image URL</label>
                      <div className="flex gap-2">
                        <Input
                          value={screenshotUrl}
                          readOnly
                          className="flex-1 font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyImageUrl}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Image Format</h4>
                        <div className="flex gap-2">
                          <Badge variant="default">JPEG</Badge>
                          <Badge variant="outline">PNG</Badge>
                          <Badge variant="outline">WebP</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">File Size</h4>
                        <p className="text-sm text-gray-600">Estimated: ~245 KB</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Embedding Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">HTML Image Tag</label>
                      <Textarea
                        value={`<img src="${screenshotUrl}" alt="Website screenshot" width="${width}" height="${height}" />`}
                        readOnly
                        className="font-mono text-xs mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Markdown</label>
                      <Textarea
                        value={`![Website screenshot](${screenshotUrl})`}
                        readOnly
                        className="font-mono text-xs mt-1"
                        rows={1}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Direct Link</label>
                      <Textarea
                        value={screenshotUrl}
                        readOnly
                        className="font-mono text-xs mt-1"
                        rows={1}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}