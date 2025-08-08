'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, RefreshCw, Monitor, Cpu, HardDrive, Wifi, Battery, Smartphone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SystemInfo {
  browser: {
    name: string
    version: string
    userAgent: string
    platform: string
    language: string
    cookiesEnabled: boolean
    doNotTrack: string
  }
  display: {
    screenWidth: number
    screenHeight: number
    colorDepth: number
    pixelDepth: number
    availWidth: number
    availHeight: number
    windowInnerWidth: number
    windowInnerHeight: number
    windowOuterWidth: number
    windowOuterHeight: number
    devicePixelRatio: number
  }
  device: {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    touchEnabled: boolean
    memory?: number
    hardwareConcurrency?: number
    deviceMemory?: number
    maxTouchPoints?: number
  }
  connection: {
    online: boolean
    connectionType?: string
    downlink?: number
    effectiveType?: string
    rtt?: number
    saveData?: boolean
  }
  location: {
    latitude?: number
    longitude?: number
    accuracy?: number
    altitude?: number
    altitudeAccuracy?: number
    heading?: number
    speed?: number
  }
  time: {
    timezone: string
    timezoneOffset: number
    currentTime: string
    utcTime: string
    timestamp: number
  }
  plugins: Array<{
    name: string
    filename: string
  }>
  languages: string[]
  storage: {
    localStorage: number
    sessionStorage: number
    cookies: number
  }
}

export default function SystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationPermission, setLocationPermission] = useState(false)

  const collectSystemInfo = () => {
    setLoading(true)
    try {
      // Browser information
      const browserInfo = {
        name: getBrowserName(),
        version: getBrowserVersion(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || 'unspecified'
      }

      // Display information
      const displayInfo = {
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight,
        windowOuterWidth: window.outerWidth,
        windowOuterHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio
      }

      // Device information
      const deviceInfo = {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent),
        isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        touchEnabled: 'ontouchstart' in window,
        memory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints
      }

      // Connection information
      const connectionInfo = {
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType,
        downlink: (navigator as any).connection?.downlink,
        effectiveType: (navigator as any).connection?.effectiveType,
        rtt: (navigator as any).connection?.rtt,
        saveData: (navigator as any).connection?.saveData
      }

      // Time information
      const now = new Date()
      const timeInfo = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: now.getTimezoneOffset(),
        currentTime: now.toLocaleString(),
        utcTime: now.toUTCString(),
        timestamp: now.getTime()
      }

      // Plugins
      const plugins = Array.from(navigator.plugins).map(plugin => ({
        name: plugin.name,
        filename: plugin.filename
      }))

      // Languages
      const languages = navigator.languages

      // Storage information
      const storageInfo = {
        localStorage: calculateStorageSize(localStorage),
        sessionStorage: calculateStorageSize(sessionStorage),
        cookies: document.cookie.length
      }

      const info: SystemInfo = {
        browser: browserInfo,
        display: displayInfo,
        device: deviceInfo,
        connection: connectionInfo,
        location: {},
        time: timeInfo,
        plugins,
        languages,
        storage: storageInfo
      }

      setSystemInfo(info)
      
      toast({
        title: "System information collected",
        description: "Complete system details have been gathered"
      })
    } catch (error) {
      toast({
        title: "Collection failed",
        description: "Unable to collect system information",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getBrowserName = (): string => {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf("Chrome") > -1) return "Chrome"
    if (userAgent.indexOf("Safari") > -1) return "Safari"
    if (userAgent.indexOf("Firefox") > -1) return "Firefox"
    if (userAgent.indexOf("Edge") > -1) return "Edge"
    if (userAgent.indexOf("Opera") > -1) return "Opera"
    if (userAgent.indexOf("MSIE") > -1) return "Internet Explorer"
    return "Unknown"
  }

  const getBrowserVersion = (): string => {
    const userAgent = navigator.userAgent
    const match = userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera|MSIE)\/([0-9.]+)/)
    return match ? match[2] : "Unknown"
  }

  const calculateStorageSize = (storage: Storage): number => {
    let total = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        total += key.length + storage.getItem(key)?.length || 0
      }
    }
    return total
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      })
      return
    }

    setLocationPermission(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (systemInfo) {
          setSystemInfo({
            ...systemInfo,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            }
          })
          
          toast({
            title: "Location obtained",
            description: "Your location has been successfully retrieved"
          })
        }
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Unable to get your location. Please check permissions.",
          variant: "destructive"
        })
        setLocationPermission(false)
      }
    )
  }

  const copyToClipboard = () => {
    if (!systemInfo) return

    const infoText = `System Information Report
Generated: ${new Date().toLocaleString()}

=== Browser Information ===
Name: ${systemInfo.browser.name}
Version: ${systemInfo.browser.version}
Platform: ${systemInfo.browser.platform}
Language: ${systemInfo.browser.language}
Cookies Enabled: ${systemInfo.browser.cookiesEnabled}
Do Not Track: ${systemInfo.browser.doNotTrack}

=== Display Information ===
Screen Resolution: ${systemInfo.display.screenWidth}x${systemInfo.display.screenHeight}
Available Space: ${systemInfo.display.availWidth}x${systemInfo.display.availHeight}
Window Size: ${systemInfo.display.windowInnerWidth}x${systemInfo.display.windowInnerHeight}
Color Depth: ${systemInfo.display.colorDepth} bits
Device Pixel Ratio: ${systemInfo.display.devicePixelRatio}

=== Device Information ===
Type: ${systemInfo.device.isMobile ? 'Mobile' : systemInfo.device.isTablet ? 'Tablet' : 'Desktop'}
Touch Enabled: ${systemInfo.device.touchEnabled}
Hardware Cores: ${systemInfo.device.hardwareConcurrency || 'Unknown'}
Memory: ${systemInfo.device.deviceMemory || 'Unknown'} GB

=== Connection Information ===
Online: ${systemInfo.connection.online}
Connection Type: ${systemInfo.connection.connectionType || 'Unknown'}
Downlink: ${systemInfo.connection.downlink || 'Unknown'} Mbps
Effective Type: ${systemInfo.connection.effectiveType || 'Unknown'}

=== Time Information ===
Timezone: ${systemInfo.time.timezone}
Current Time: ${systemInfo.time.currentTime}
UTC Time: ${systemInfo.time.utcTime}

=== Plugins (${systemInfo.plugins.length}) ===
${systemInfo.plugins.map(p => `- ${p.name} (${p.filename})`).join('\n')}

=== Languages ===
${systemInfo.languages.join(', ')}

=== Storage Usage ===
LocalStorage: ${(systemInfo.storage.localStorage / 1024).toFixed(2)} KB
SessionStorage: ${(systemInfo.storage.sessionStorage / 1024).toFixed(2)} KB
Cookies: ${systemInfo.storage.cookies} characters

${systemInfo.location.latitude ? `=== Location ===
Latitude: ${systemInfo.location.latitude}
Longitude: ${systemInfo.location.longitude}
Accuracy: ${systemInfo.location.accuracy} meters
` : ''}`

    navigator.clipboard.writeText(infoText)
    toast({
      title: "Copied to clipboard",
      description: "System information has been copied to clipboard"
    })
  }

  const downloadReport = () => {
    if (!systemInfo) return

    const content = `System Information Report
Generated: ${new Date().toLocaleString()}

Browser Information:
- Name: ${systemInfo.browser.name}
- Version: ${systemInfo.browser.version}
- Platform: ${systemInfo.browser.platform}
- Language: ${systemInfo.browser.language}
- Cookies Enabled: ${systemInfo.browser.cookiesEnabled}
- Do Not Track: ${systemInfo.browser.doNotTrack}

Display Information:
- Screen Resolution: ${systemInfo.display.screenWidth}x${systemInfo.display.screenHeight}
- Available Space: ${systemInfo.display.availWidth}x${systemInfo.display.availHeight}
- Window Size: ${systemInfo.display.windowInnerWidth}x${systemInfo.display.windowInnerHeight}
- Color Depth: ${systemInfo.display.colorDepth} bits
- Device Pixel Ratio: ${systemInfo.display.devicePixelRatio}

Device Information:
- Type: ${systemInfo.device.isMobile ? 'Mobile' : systemInfo.device.isTablet ? 'Tablet' : 'Desktop'}
- Touch Enabled: ${systemInfo.device.touchEnabled}
- Hardware Cores: ${systemInfo.device.hardwareConcurrency || 'Unknown'}
- Memory: ${systemInfo.device.deviceMemory || 'Unknown'} GB

Connection Information:
- Online: ${systemInfo.connection.online}
- Connection Type: ${systemInfo.connection.connectionType || 'Unknown'}
- Downlink: ${systemInfo.connection.downlink || 'Unknown'} Mbps
- Effective Type: ${systemInfo.connection.effectiveType || 'Unknown'}

Time Information:
- Timezone: ${systemInfo.time.timezone}
- Current Time: ${systemInfo.time.currentTime}
- UTC Time: ${systemInfo.time.utcTime}

Plugins (${systemInfo.plugins.length}):
${systemInfo.plugins.map(p => `- ${p.name} (${p.filename})`).join('\n')}

Languages:
${systemInfo.languages.join(', ')}

Storage Usage:
- LocalStorage: ${(systemInfo.storage.localStorage / 1024).toFixed(2)} KB
- SessionStorage: ${(systemInfo.storage.sessionStorage / 1024).toFixed(2)} KB
- Cookies: ${systemInfo.storage.cookies} characters

${systemInfo.location.latitude ? `
Location Information:
- Latitude: ${systemInfo.location.latitude}
- Longitude: ${systemInfo.location.longitude}
- Accuracy: ${systemInfo.location.accuracy} meters
` : ''}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'system-info.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "System information report download has started"
    })
  }

  useEffect(() => {
    collectSystemInfo()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Information</h1>
        <p className="text-muted-foreground">
          View detailed information about your browser, device, system configuration, and network
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">System Tool</Badge>
          <Badge variant="outline">Diagnostics</Badge>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={collectSystemInfo} disabled={loading}>
          {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {loading ? "Loading..." : "Refresh Info"}
        </Button>
        <Button onClick={copyToClipboard} disabled={!systemInfo} variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>
        <Button onClick={downloadReport} disabled={!systemInfo} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button onClick={getLocation} disabled={!systemInfo || locationPermission} variant="outline">
          <Wifi className="w-4 h-4 mr-2" />
          Get Location
        </Button>
      </div>

      {systemInfo && (
        <Tabs defaultValue="browser" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="browser">Browser</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="browser" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Browser Information
                </CardTitle>
                <CardDescription>
                  Detailed information about your web browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Basic Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {systemInfo.browser.name}</div>
                      <div><strong>Version:</strong> {systemInfo.browser.version}</div>
                      <div><strong>Platform:</strong> {systemInfo.browser.platform}</div>
                      <div><strong>Language:</strong> {systemInfo.browser.language}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Capabilities</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Cookies:</strong> {systemInfo.browser.cookiesEnabled ? 'Enabled' : 'Disabled'}</div>
                      <div><strong>Do Not Track:</strong> {systemInfo.browser.doNotTrack}</div>
                      <div><strong>Plugins:</strong> {systemInfo.plugins.length}</div>
                      <div><strong>Languages:</strong> {systemInfo.languages.length}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">User Agent</h4>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
                    {systemInfo.browser.userAgent}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Installed Plugins</h4>
                  <div className="space-y-1">
                    {systemInfo.plugins.map((plugin, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{plugin.name}</span>
                        <span className="text-muted-foreground">{plugin.filename}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Display Information
                </CardTitle>
                <CardDescription>
                  Screen and display configuration details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Screen</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Resolution:</strong> {systemInfo.display.screenWidth} × {systemInfo.display.screenHeight}</div>
                      <div><strong>Available:</strong> {systemInfo.display.availWidth} × {systemInfo.display.availHeight}</div>
                      <div><strong>Color Depth:</strong> {systemInfo.display.colorDepth} bits</div>
                      <div><strong>Pixel Depth:</strong> {systemInfo.display.pixelDepth} bits</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Window</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Inner Size:</strong> {systemInfo.display.windowInnerWidth} × {systemInfo.display.windowInnerHeight}</div>
                      <div><strong>Outer Size:</strong> {systemInfo.display.windowOuterWidth} × {systemInfo.display.windowOuterHeight}</div>
                      <div><strong>Device Pixel Ratio:</strong> {systemInfo.display.devicePixelRatio}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="device" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Information
                </CardTitle>
                <CardDescription>
                  Hardware and device capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Device Type</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Category:</strong> {
                        systemInfo.device.isMobile ? 'Mobile' : 
                        systemInfo.device.isTablet ? 'Tablet' : 'Desktop'
                      }</div>
                      <div><strong>Touch Enabled:</strong> {systemInfo.device.touchEnabled ? 'Yes' : 'No'}</div>
                      <div><strong>Max Touch Points:</strong> {systemInfo.device.maxTouchPoints || 'Unknown'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Hardware Cores:</strong> {systemInfo.device.hardwareConcurrency || 'Unknown'}</div>
                      <div><strong>Device Memory:</strong> {systemInfo.device.deviceMemory || 'Unknown'} GB</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Network Information
                </CardTitle>
                <CardDescription>
                  Connection and network status details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Connection Status</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Online:</strong> {systemInfo.connection.online ? 'Yes' : 'No'}</div>
                      <div><strong>Connection Type:</strong> {systemInfo.connection.connectionType || 'Unknown'}</div>
                      <div><strong>Save Data Mode:</strong> {systemInfo.connection.saveData ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Downlink:</strong> {systemInfo.connection.downlink || 'Unknown'} Mbps</div>
                      <div><strong>Effective Type:</strong> {systemInfo.connection.effectiveType || 'Unknown'}</div>
                      <div><strong>Round Trip Time:</strong> {systemInfo.connection.rtt || 'Unknown'} ms</div>
                    </div>
                  </div>
                </div>

                {systemInfo.location.latitude && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Location</h4>
                    <div className="grid gap-2 text-sm">
                      <div><strong>Latitude:</strong> {systemInfo.location.latitude}</div>
                      <div><strong>Longitude:</strong> {systemInfo.location.longitude}</div>
                      <div><strong>Accuracy:</strong> {systemInfo.location.accuracy} meters</div>
                      {systemInfo.location.altitude && (
                        <div><strong>Altitude:</strong> {systemInfo.location.altitude} meters</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Storage Information
                </CardTitle>
                <CardDescription>
                  Browser storage usage and capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(systemInfo.storage.localStorage / 1024).toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-800">LocalStorage (KB)</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(systemInfo.storage.sessionStorage / 1024).toFixed(1)}
                    </div>
                    <div className="text-sm text-green-800">SessionStorage (KB)</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {systemInfo.storage.cookies}
                    </div>
                    <div className="text-sm text-purple-800">Cookie Size (chars)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!systemInfo && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-16 h-16 text-gray-400 mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Collecting system information...</h3>
            <p className="text-muted-foreground text-center">
              Gathering detailed information about your browser, device, and system configuration
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}