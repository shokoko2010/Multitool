'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smartphone, 
  Download, 
  Copy, 
  Palette, 
  Settings, 
  Monitor,
  Tablet,
  Watch,
  Tv
} from 'lucide-react'

interface ManifestConfig {
  appName: string
  shortName: string
  description: string
  startUrl: string
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
  orientation: 'any' | 'natural' | 'landscape' | 'portrait'
  themeColor: string
  backgroundColor: string
  lang: string
  dir: 'ltr' | 'rtl'
  categories: string[]
  screenshots: Array<{
    src: string
    sizes: string
    type: string
    form_factor: 'narrow' | 'wide' | 'any'
  }>
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose: 'any' | 'maskable' | 'any maskable'
  }>
  scope: string
  preferRelatedApplications: boolean
  relatedApplications: Array<{
    platform: string
    url: string
    id: string
  }>
}

interface GeneratedManifest {
  webapp: string
  android: string
  ios: string
  windows: string
}

const displayModes = [
  { value: 'fullscreen', label: 'Fullscreen' },
  { value: 'standalone', label: 'Standalone' },
  { value: 'minimal-ui', label: 'Minimal UI' },
  { value: 'browser', label: 'Browser' }
]

const orientationModes = [
  { value: 'any', label: 'Any' },
  { value: 'natural', label: 'Natural' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' }
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' }
]

const categories = [
  'business', 'education', 'entertainment', 'finance', 'games', 
  'health', 'lifestyle', 'music', 'news', 'productivity', 
  'shopping', 'social', 'sports', 'travel', 'utilities'
]

export default function MobileAppManifestGenerator() {
  const [config, setConfig] = useState<ManifestConfig>({
    appName: 'My Awesome App',
    shortName: 'AwesomeApp',
    description: 'A progressive web app that works everywhere',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    lang: 'en',
    dir: 'ltr',
    categories: ['productivity'],
    screenshots: [],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    scope: '/',
    preferRelatedApplications: false,
    relatedApplications: []
  })

  const [generatedManifest, setGeneratedManifest] = useState<GeneratedManifest | null>(null)

  const generateManifests = () => {
    const webapp = generateWebAppManifest()
    const android = generateAndroidManifest()
    const ios = generateIOSManifest()
    const windows = generateWindowsManifest()

    setGeneratedManifest({
      webapp,
      android,
      ios,
      windows
    })
  }

  const generateWebAppManifest = (): string => {
    const manifest = {
      name: config.appName,
      short_name: config.shortName,
      description: config.description,
      start_url: config.startUrl,
      display: config.display,
      orientation: config.orientation,
      theme_color: config.themeColor,
      background_color: config.backgroundColor,
      lang: config.lang,
      dir: config.dir,
      categories: config.categories,
      scope: config.scope,
      prefer_related_applications: config.preferRelatedApplications,
      related_applications: config.relatedApplications.length > 0 ? config.relatedApplications : undefined,
      icons: config.icons,
      screenshots: config.screenshots.length > 0 ? config.screenshots : undefined
    }

    return JSON.stringify(manifest, null, 2)
  }

  const generateAndroidManifest = (): string => {
    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.${config.shortName.toLowerCase()}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.AppCompat.Light.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="${new URL(window.location.origin).hostname}" />
            </intent-filter>
        </activity>

    </application>

</manifest>`
  }

  const generateIOSManifest = (): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>${config.appName}</string>
    <key>CFBundleIdentifier</key>
    <string>com.example.${config.shortName.toLowerCase()}</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleName</key>
    <string>${config.shortName}</string>
    
    <key>LSRequiresIPhoneOS</key>
    <true/>
    
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    
    <key>UISupportedInterfaceOrientations</key>
    <array>
        ${config.orientation === 'portrait' ? '<string>UIInterfaceOrientationPortrait</string>' : ''}
        ${config.orientation === 'landscape' ? '<string>UIInterfaceOrientationLandscapeLeft</string><string>UIInterfaceOrientationLandscapeRight</string>' : ''}
        ${config.orientation === 'any' ? '<string>UIInterfaceOrientationPortrait</string><string>UIInterfaceOrientationLandscapeLeft</string><string>UIInterfaceOrientationLandscapeRight</string>' : ''}
    </array>
    
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    
    <key>CFBundleIcons</key>
    <dict>
        <key>CFBundlePrimaryIcon</key>
        <dict>
            <key>CFBundleIconFiles</key>
            <array>
                <string>Icon-60</string>
                <string>Icon-76</string>
                <string>Icon-120</string>
                <string>Icon-152</string>
            </array>
        </dict>
    </dict>
</dict>
</plist>`
  }

  const generateWindowsManifest = (): string => {
    return `<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
         xmlns:uap3="http://schemas.microsoft.com/appx/manifest/uap/windows10/3"
         IgnorableNamespaces="uap3">

  <Identity Name="${config.shortName.toLowerCase()}"
            Publisher="CN=Example Corp"
            Version="1.0.0.0" />

  <Properties>
    <DisplayName>${config.appName}</DisplayName>
    <PublisherDisplayName>Example Corp</PublisherDisplayName>
    <Description>${config.description}</Description>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Universal" MinVersion="10.0.0.0" MaxVersionTested="10.0.0.0" />
  </Dependencies>

  <Resources>
    <Resource Language="en-us" />
  </Resources>

  <Applications>
    <Application Id="App"
                 Executable="$targetnametoken$.exe"
                 EntryPoint="$targetentrypoint$">
      <uap:VisualElements
          DisplayName="${config.appName}"
          Description="${config.description}"
          BackgroundColor="${config.backgroundColor.replace('#', '')}"
          Square150x150Logo="Assets\\Square150x150Logo.png"
          Square44x44Logo="Assets\\Square44x44Logo.png">
        <uap:DefaultTile Wide310x150Logo="Assets\\Wide310x150Logo.png" />
        <uap:SplashScreen Image="Assets\\SplashScreen.png" BackgroundColor="${config.backgroundColor.replace('#', '')}" />
      </uap:VisualElements>
      <uap3:Extension Category="windows.protocol">
        <uap3:Protocol Name="${config.shortName.toLowerCase()}" />
      </uap3:Extension>
    </Application>
  </Applications>

  <Capabilities>
    <Capability Name="internetClient" />
  </Capabilities>

</Package>`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadManifest = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const addCategory = (category: string) => {
    if (!config.categories.includes(category)) {
      setConfig(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }))
    }
  }

  const removeCategory = (category: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }))
  }

  const addScreenshot = () => {
    const screenshot = {
      src: prompt('Screenshot URL:') || '/screenshot.png',
      sizes: '1280x720',
      type: 'image/png',
      form_factor: 'wide' as const
    }
    setConfig(prev => ({
      ...prev,
      screenshots: [...prev.screenshots, screenshot]
    }))
  }

  const removeScreenshot = (index: number) => {
    setConfig(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mobile App Manifest Generator</h1>
        <p className="text-muted-foreground">
          Generate Progressive Web App and native app manifests for multiple platforms
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              App Configuration
            </CardTitle>
            <CardDescription>
              Configure your app details and platform-specific settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  value={config.appName}
                  onChange={(e) => setConfig(prev => ({ ...prev, appName: e.target.value }))}
                  placeholder="My Awesome App"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name</Label>
                <Input
                  id="shortName"
                  value={config.shortName}
                  onChange={(e) => setConfig(prev => ({ ...prev, shortName: e.target.value }))}
                  placeholder="AwesomeApp"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A progressive web app that works everywhere"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startUrl">Start URL</Label>
                <Input
                  id="startUrl"
                  value={config.startUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, startUrl: e.target.value }))}
                  placeholder="/"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Input
                  id="scope"
                  value={config.scope}
                  onChange={(e) => setConfig(prev => ({ ...prev, scope: e.target.value }))}
                  placeholder="/"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display">Display Mode</Label>
                <Select value={config.display} onValueChange={(value: any) => setConfig(prev => ({ ...prev, display: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {displayModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation</Label>
                <Select value={config.orientation} onValueChange={(value: any) => setConfig(prev => ({ ...prev, orientation: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orientationModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="themeColor">Theme Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="themeColor"
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.themeColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lang">Language</Label>
                <Select value={config.lang} onValueChange={(value) => setConfig(prev => ({ ...prev, lang: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dir">Text Direction</Label>
                <Select value={config.dir} onValueChange={(value: any) => setConfig(prev => ({ ...prev, dir: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltr">Left to Right</SelectItem>
                    <SelectItem value="rtl">Right to Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categories</Label>
                <Select onValueChange={addCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Add category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => !config.categories.includes(cat)).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => removeCategory(category)}>
                    {category} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Screenshots</Label>
                <Button onClick={addScreenshot} variant="outline" size="sm">
                  Add Screenshot
                </Button>
              </div>
              {config.screenshots.map((screenshot, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <Input value={screenshot.src} readOnly className="flex-1" />
                  <Button onClick={() => removeScreenshot(index)} variant="outline" size="sm">
                    ×
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={generateManifests} className="w-full">
              Generate Manifests
            </Button>
          </CardContent>
        </Card>

        {generatedManifest && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Manifests</CardTitle>
              <CardDescription>
                Download manifests for different platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="webapp" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="webapp">Web App</TabsTrigger>
                  <TabsTrigger value="android">Android</TabsTrigger>
                  <TabsTrigger value="ios">iOS</TabsTrigger>
                  <TabsTrigger value="windows">Windows</TabsTrigger>
                </TabsList>

                <TabsContent value="webapp" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Monitor className="h-5 w-5" />
                    <h3 className="font-semibold">Web App Manifest</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button onClick={() => copyToClipboard(generatedManifest.webapp)} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={() => downloadManifest(generatedManifest.webapp, 'manifest.json')} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download manifest.json
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                      <code>{generatedManifest.webapp}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="android" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-5 w-5" />
                    <h3 className="font-semibold">Android Manifest</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button onClick={() => copyToClipboard(generatedManifest.android)} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={() => downloadManifest(generatedManifest.android, 'AndroidManifest.xml')} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download AndroidManifest.xml
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                      <code>{generatedManifest.android}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="ios" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Tablet className="h-5 w-5" />
                    <h3 className="font-semibold">iOS Info.plist</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button onClick={() => copyToClipboard(generatedManifest.ios)} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={() => downloadManifest(generatedManifest.ios, 'Info.plist')} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Info.plist
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                      <code>{generatedManifest.ios}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="windows" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Tv className="h-5 w-5" />
                    <h3 className="font-semibold">Windows App Manifest</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button onClick={() => copyToClipboard(generatedManifest.windows)} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={() => downloadManifest(generatedManifest.windows, 'AppxManifest.xml')} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download AppxManifest.xml
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                      <code>{generatedManifest.windows}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Platform Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold">Web App</h4>
              <p className="text-sm text-muted-foreground">Progressive Web App manifest for modern browsers</p>
            </div>
            <div className="text-center">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold">Android</h4>
              <p className="text-sm text-muted-foreground">AndroidManifest.xml for native Android apps</p>
            </div>
            <div className="text-center">
              <Tablet className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <h4 className="font-semibold">iOS</h4>
              <p className="text-sm text-muted-foreground">Info.plist for iOS applications</p>
            </div>
            <div className="text-center">
              <Tv className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">Windows</h4>
              <p className="text-sm text-muted-foreground">AppxManifest.xml for Windows Store apps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}