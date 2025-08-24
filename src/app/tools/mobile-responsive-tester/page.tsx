'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Watch, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  Minimize,
  Ruler,
  Palette,
  SmartphoneHorizontal
} from 'lucide-react'

interface Device {
  name: string
  width: number
  height: number
  type: 'phone' | 'tablet' | 'watch' | 'desktop'
  orientation: 'portrait' | 'landscape'
  dpi: number
  userAgent: string
}

interface TestResult {
  viewport: {
    width: number
    height: number
    scale: number
  }
  responsive: {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    breakpoints: {
      xs: boolean
      sm: boolean
      md: boolean
      lg: boolean
      xl: boolean
    }
  }
  touch: {
    supported: boolean
    maxTouchPoints: number
  }
  screen: {
    width: number
    height: number
    colorDepth: number
    pixelRatio: number
  }
}

const devices: Device[] = [
  // Phones
  {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    type: 'phone',
    orientation: 'portrait',
    dpi: 460,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    type: 'phone',
    orientation: 'portrait',
    dpi: 460,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 780,
    type: 'phone',
    orientation: 'portrait',
    dpi: 420,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36'
  },
  {
    name: 'Google Pixel 7',
    width: 412,
    height: 892,
    type: 'phone',
    orientation: 'portrait',
    dpi: 420,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36'
  },
  // Tablets
  {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    type: 'tablet',
    orientation: 'portrait',
    dpi: 264,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    type: 'tablet',
    orientation: 'portrait',
    dpi: 264,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'Samsung Galaxy Tab S8',
    width: 800,
    height: 1280,
    type: 'tablet',
    orientation: 'portrait',
    dpi: 320,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X700) AppleWebKit/537.36'
  },
  // Watches
  {
    name: 'Apple Watch Series 8',
    width: 224,
    height: 368,
    type: 'watch',
    orientation: 'portrait',
    dpi: 326,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  // Desktop
  {
    name: 'Desktop 1920x1080',
    width: 1920,
    height: 1080,
    type: 'desktop',
    orientation: 'landscape',
    dpi: 96,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    name: 'Desktop 1366x768',
    width: 1366,
    height: 768,
    type: 'desktop',
    orientation: 'landscape',
    dpi: 96,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
]

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
}

export default function MobileResponsiveTester() {
  const [url, setUrl] = useState<string>('https://example.com')
  const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0])
  const [scale, setScale] = useState<number>(0.5)
  const [isRotated, setIsRotated] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [iframeKey, setIframeKey] = useState<number>(0)

  const rotateDevice = () => {
    setIsRotated(!isRotated)
  }

  const getDeviceDimensions = () => {
    if (isRotated) {
      return {
        width: selectedDevice.height,
        height: selectedDevice.width
      }
    }
    return {
      width: selectedDevice.width,
      height: selectedDevice.height
    }
  }

  const runTest = () => {
    const dimensions = getDeviceDimensions()
    const viewportWidth = dimensions.width
    const viewportHeight = dimensions.height

    const responsive = {
      isMobile: viewportWidth < 768,
      isTablet: viewportWidth >= 768 && viewportWidth < 1024,
      isDesktop: viewportWidth >= 1024,
      breakpoints: {
        xs: viewportWidth >= breakpoints.xs,
        sm: viewportWidth >= breakpoints.sm,
        md: viewportWidth >= breakpoints.md,
        lg: viewportWidth >= breakpoints.lg,
        xl: viewportWidth >= breakpoints.xl
      }
    }

    const touch = {
      supported: selectedDevice.type !== 'desktop',
      maxTouchPoints: selectedDevice.type !== 'desktop' ? 5 : 0
    }

    const screen = {
      width: viewportWidth,
      height: viewportHeight,
      colorDepth: 24,
      pixelRatio: selectedDevice.dpi / 96
    }

    setTestResult({
      viewport: {
        width: viewportWidth,
        height: viewportHeight,
        scale
      },
      responsive,
      touch,
      screen
    })
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.1))
  }

  const resetZoom = () => {
    setScale(0.5)
  }

  const fitToScreen = () => {
    const dimensions = getDeviceDimensions()
    const screenWidth = window.innerWidth - 100
    const screenHeight = window.innerHeight - 300
    
    const scaleX = screenWidth / dimensions.width
    const scaleY = screenHeight / dimensions.height
    const newScale = Math.min(scaleX, scaleY, 1)
    
    setScale(newScale)
  }

  useEffect(() => {
    setIframeKey(prev => prev + 1)
    runTest()
  }, [selectedDevice, isRotated, scale])

  useEffect(() => {
    fitToScreen()
  }, [selectedDevice])

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      case 'watch': return <Watch className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getBreakpointColor = (breakpoint: string, value: boolean) => {
    if (!value) return 'bg-gray-100 text-gray-800'
    switch (breakpoint) {
      case 'xs': return 'bg-purple-100 text-purple-800'
      case 'sm': return 'bg-blue-100 text-blue-800'
      case 'md': return 'bg-green-100 text-green-800'
      case 'lg': return 'bg-yellow-100 text-yellow-800'
      case 'xl': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const dimensions = getDeviceDimensions()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mobile Responsive Tester</h1>
        <p className="text-muted-foreground">
          Test your website's responsive design across different devices and screen sizes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Device Selection</CardTitle>
            <CardDescription>
              Choose a device to test your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Device</Label>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {devices.map((device) => (
                  <div
                    key={device.name}
                    className={`p-2 border rounded cursor-pointer hover:bg-muted/50 ${
                      selectedDevice.name === device.name ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{device.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {device.width} × {device.height}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Zoom Controls</Label>
              <div className="flex gap-2">
                <Button onClick={zoomOut} variant="outline" size="sm">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button onClick={resetZoom} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button onClick={zoomIn} variant="outline" size="sm">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button onClick={fitToScreen} variant="outline" size="sm">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {Math.round(scale * 100)}%
              </div>
            </div>

            <Button onClick={rotateDevice} className="w-full">
              <SmartphoneHorizontal className="h-4 w-4 mr-2" />
              Rotate Device
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Device Preview</CardTitle>
            <CardDescription>
              {selectedDevice.name} • {dimensions.width} × {dimensions.height}px • {scale * 100}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center min-h-[600px] bg-gray-50 rounded-lg p-4">
              <div
                className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
                style={{
                  width: dimensions.width * scale,
                  height: dimensions.height * scale,
                  maxWidth: '100%',
                  maxHeight: '80vh'
                }}
              >
                <iframe
                  key={iframeKey}
                  src={url}
                  className="w-full h-full"
                  style={{
                    transform: `scale(${1 / scale})`,
                    transformOrigin: 'top left',
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`
                  }}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {testResult && (
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Responsive Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`text-lg font-bold ${testResult.responsive.isMobile ? 'text-green-600' : 'text-gray-400'}`}>
                      {testResult.responsive.isMobile ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-muted-foreground">Mobile</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${testResult.responsive.isTablet ? 'text-green-600' : 'text-gray-400'}`}>
                      {testResult.responsive.isTablet ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-muted-foreground">Tablet</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${testResult.responsive.isDesktop ? 'text-green-600' : 'text-gray-400'}`}>
                      {testResult.responsive.isDesktop ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-muted-foreground">Desktop</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Breakpoints</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(testResult.responsive.breakpoints).map(([key, value]) => (
                      <Badge key={key} className={getBreakpointColor(key, value)}>
                        {key.toUpperCase()}: {value ? '✓' : '✗'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Viewport Width:</span>
                    <span className="ml-2 font-medium">{testResult.viewport.width}px</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Viewport Height:</span>
                    <span className="ml-2 font-medium">{testResult.viewport.height}px</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Touch Support</h4>
                  <div className="flex items-center gap-2">
                    {testResult.touch.supported ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> : 
                      <XCircle className="h-5 w-5 text-red-500" />
                    }
                    <span>{testResult.touch.supported ? 'Touch Supported' : 'No Touch Support'}</span>
                  </div>
                  {testResult.touch.supported && (
                    <div className="text-sm text-muted-foreground ml-7">
                      Max touch points: {testResult.touch.maxTouchPoints}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Screen Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolution:</span>
                      <span>{testResult.screen.width} × {testResult.screen.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pixel Ratio:</span>
                      <span>{testResult.screen.pixelRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color Depth:</span>
                      <span>{testResult.screen.colorDepth} bits</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Device Type</h4>
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(selectedDevice.type)}
                    <span className="capitalize">{selectedDevice.type}</span>
                    <Badge variant="outline">{selectedDevice.dpi} DPI</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Responsive Design Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Mobile-First Approach</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Design for mobile screens first</li>
                <li>• Use relative units (rem, em, %)</li>
                <li>• Implement touch-friendly interfaces</li>
                <li>• Optimize images and assets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Breakpoint Strategy</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use common breakpoints (640px, 768px, 1024px)</li>
                <li>• Test on actual devices</li>
                <li>• Consider device orientation</li>
                <li>• Use CSS Grid and Flexbox</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}