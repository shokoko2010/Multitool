'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  QrCode, 
  Download, 
  Copy, 
  Settings, 
  Smartphone,
  Wifi,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Palette
} from 'lucide-react'

interface QRCodeOptions {
  size: number
  bgColor: string
  fgColor: string
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  includeMargin: boolean
  format: 'png' | 'svg' | 'jpg'
}

interface QRCodeData {
  text: string
  url: string
  email: string
  phone: string
  wifi: {
    ssid: string
    password: string
    security: 'WPA' | 'WEP' | 'nopass'
    hidden: boolean
  }
  location: {
    latitude: number
    longitude: number
    query: string
  }
  event: {
    title: string
    start: string
    end: string
    location: string
    description: string
  }
}

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState('text')
  const [qrData, setQrData] = useState<QRCodeData>({
    text: '',
    url: '',
    email: '',
    phone: '',
    wifi: {
      ssid: '',
      password: '',
      security: 'WPA',
      hidden: false
    },
    location: {
      latitude: 0,
      longitude: 0,
      query: ''
    },
    event: {
      title: '',
      start: '',
      end: '',
      location: '',
      description: ''
    }
  })
  const [options, setOptions] = useState<QRCodeOptions>({
    size: 200,
    bgColor: '#FFFFFF',
    fgColor: '#000000',
    errorCorrectionLevel: 'M',
    includeMargin: true,
    format: 'png'
  })
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQRCode = async (data: string) => {
    setIsGenerating(true)
    setError(null)

    try {
      // For demo purposes, we'll use a placeholder QR code service
      // In a real implementation, you would use a QR code library like qrcode.js
      const qrParams = new URLSearchParams({
        data: data,
        size: options.size.toString(),
        bgcolor: options.bgColor.replace('#', ''),
        color: options.fgColor.replace('#', ''),
        qzone: options.includeMargin ? '1' : '0',
        format: options.format
      })

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?${qrParams.toString()}`
      setQrCodeUrl(qrUrl)
    } catch (error) {
      setError('Failed to generate QR code. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getQRData = (): string => {
    switch (activeTab) {
      case 'text':
        return qrData.text
      case 'url':
        return qrData.url
      case 'email':
        return `mailto:${qrData.email}`
      case 'phone':
        return `tel:${qrData.phone}`
      case 'wifi':
        const wifi = qrData.wifi
        return `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`
      case 'location':
        if (qrData.location.latitude && qrData.location.longitude) {
          return `geo:${qrData.location.latitude},${qrData.location.longitude}`
        }
        return qrData.location.query
      case 'event':
        const event = qrData.event
        const startDate = new Date(event.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        const endDate = new Date(event.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        return `BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${startDate}
DTEND:${endDate}
LOCATION:${event.location}
DESCRIPTION:${event.description}
END:VEVENT`
      default:
        return ''
    }
  }

  const handleGenerate = () => {
    const data = getQRData()
    if (!data.trim()) {
      setError('Please enter the required information')
      return
    }
    generateQRCode(data)
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qrcode_${activeTab}_${new Date().toISOString().split('T')[0]}.${options.format}`
    link.click()
  }

  const copyQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
    } catch (error) {
      console.error('Failed to copy QR code to clipboard:', error)
    }
  }

  const updateQrData = (field: string, value: any) => {
    setQrData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateWifiData = (field: string, value: any) => {
    setQrData(prev => ({
      ...prev,
      wifi: {
        ...prev.wifi,
        [field]: value
      }
    }))
  }

  const updateLocationData = (field: string, value: any) => {
    setQrData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const updateEventData = (field: string, value: any) => {
    setQrData(prev => ({
      ...prev,
      event: {
        ...prev.event,
        [field]: value
      }
    }))
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'text': return <QrCode className="h-4 w-4" />
      case 'url': return <QrCode className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'wifi': return <Wifi className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      default: return <QrCode className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            QR Code Generator
          </CardTitle>
          <CardDescription>
            Generate QR codes for text, URLs, contacts, WiFi, locations, and events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                  <TabsTrigger value="text" className="text-xs">
                    {getTabIcon('text')}
                    <span className="hidden sm:inline ml-1">Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="text-xs">
                    {getTabIcon('url')}
                    <span className="hidden sm:inline ml-1">URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-xs">
                    {getTabIcon('email')}
                    <span className="hidden sm:inline ml-1">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="text-xs">
                    {getTabIcon('phone')}
                    <span className="hidden sm:inline ml-1">Phone</span>
                  </TabsTrigger>
                  <TabsTrigger value="wifi" className="text-xs">
                    {getTabIcon('wifi')}
                    <span className="hidden sm:inline ml-1">WiFi</span>
                  </TabsTrigger>
                  <TabsTrigger value="location" className="text-xs">
                    {getTabIcon('location')}
                    <span className="hidden sm:inline ml-1">Location</span>
                  </TabsTrigger>
                  <TabsTrigger value="event" className="text-xs">
                    {getTabIcon('event')}
                    <span className="hidden sm:inline ml-1">Event</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 space-y-4">
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text">Text Content</Label>
                      <Textarea
                        id="text"
                        placeholder="Enter any text to encode in the QR code"
                        value={qrData.text}
                        onChange={(e) => updateQrData('text', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={qrData.url}
                        onChange={(e) => updateQrData('url', e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        placeholder="example@email.com"
                        value={qrData.email}
                        onChange={(e) => updateQrData('email', e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        value={qrData.phone}
                        onChange={(e) => updateQrData('phone', e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="wifi" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ssid">Network Name (SSID)</Label>
                        <Input
                          id="ssid"
                          placeholder="MyWiFiNetwork"
                          value={qrData.wifi.ssid}
                          onChange={(e) => updateWifiData('ssid', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="password123"
                          value={qrData.wifi.password}
                          onChange={(e) => updateWifiData('password', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Security Type</Label>
                        <select
                          value={qrData.wifi.security}
                          onChange={(e) => updateWifiData('security', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">No Password</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hidden"
                          checked={qrData.wifi.hidden}
                          onChange={(e) => updateWifiData('hidden', e.target.checked)}
                        />
                        <Label htmlFor="hidden">Hidden Network</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            placeholder="37.7749"
                            value={qrData.location.latitude || ''}
                            onChange={(e) => updateLocationData('latitude', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            placeholder="-122.4194"
                            value={qrData.location.longitude || ''}
                            onChange={(e) => updateLocationData('longitude', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locationQuery">Or Search Query</Label>
                        <Input
                          id="locationQuery"
                          placeholder="Times Square, New York"
                          value={qrData.location.query}
                          onChange={(e) => updateLocationData('query', e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="event" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventTitle">Event Title</Label>
                        <Input
                          id="eventTitle"
                          placeholder="Team Meeting"
                          value={qrData.event.title}
                          onChange={(e) => updateEventData('title', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventStart">Start Date & Time</Label>
                          <Input
                            id="eventStart"
                            type="datetime-local"
                            value={qrData.event.start}
                            onChange={(e) => updateEventData('start', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eventEnd">End Date & Time</Label>
                          <Input
                            id="eventEnd"
                            type="datetime-local"
                            value={qrData.event.end}
                            onChange={(e) => updateEventData('end', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventLocation">Location</Label>
                        <Input
                          id="eventLocation"
                          placeholder="Conference Room A"
                          value={qrData.event.location}
                          onChange={(e) => updateEventData('location', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventDescription">Description</Label>
                        <Textarea
                          id="eventDescription"
                          placeholder="Weekly team sync meeting"
                          value={qrData.event.description}
                          onChange={(e) => updateEventData('description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  QR Code Options
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size (pixels)</Label>
                    <Input
                      id="size"
                      type="number"
                      min="100"
                      max="1000"
                      value={options.size}
                      onChange={(e) => setOptions(prev => ({ ...prev, size: parseInt(e.target.value) || 200 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <select
                      id="format"
                      value={options.format}
                      onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="png">PNG</option>
                      <option value="svg">SVG</option>
                      <option value="jpg">JPG</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bgColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bgColor"
                        type="color"
                        value={options.bgColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, bgColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={options.bgColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, bgColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fgColor">Foreground Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fgColor"
                        type="color"
                        value={options.fgColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, fgColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={options.fgColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, fgColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Error Correction Level</Label>
                  <div className="flex gap-2">
                    {(['L', 'M', 'Q', 'H'] as const).map(level => (
                      <Button
                        key={level}
                        variant={options.errorCorrectionLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOptions(prev => ({ ...prev, errorCorrectionLevel: level }))}
                      >
                        {level} ({level === 'L' ? 'Low' : level === 'M' ? 'Medium' : level === 'Q' ? 'Quartile' : 'High'})
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeMargin"
                    checked={options.includeMargin}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeMargin: e.target.checked }))}
                  />
                  <Label htmlFor="includeMargin">Include Margin</Label>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate QR Code'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Generated QR Code</h3>
                {qrCodeUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeUrl} 
                        alt="Generated QR Code" 
                        className="border rounded-lg shadow-sm"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={downloadQRCode}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={copyQRCode}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">QR code will appear here</p>
                    <p className="text-sm text-muted-foreground">Enter your data and click Generate</p>
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    How to Use
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>1. Select the type of QR code you want to create</p>
                    <p>2. Enter the required information</p>
                    <p>3. Customize the appearance if desired</p>
                    <p>4. Click "Generate QR Code"</p>
                    <p>5. Download or share your QR code</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Higher error correction levels make QR codes more resistant to damage</p>
                    <p>• Use high contrast colors for better scanability</p>
                    <p>• Test QR codes on different devices before sharing</p>
                    <p>• Keep the size appropriate for the intended use case</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}