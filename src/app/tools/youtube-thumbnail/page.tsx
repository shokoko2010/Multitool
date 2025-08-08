'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, ExternalLink, Image, Video, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function YouTubeThumbnail() {
  const [videoUrl, setVideoUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [thumbnailType, setThumbnailType] = useState('default')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const thumbnailTypes = [
    { value: 'default', label: 'Default (120x90)', quality: 'medium' },
    { value: 'medium', label: 'Medium (320x180)', quality: 'medium' },
    { value: 'high', label: 'High (480x360)', quality: 'high' },
    { value: 'standard', label: 'Standard (640x480)', quality: 'high' },
    { value: 'maxres', label: 'Max Resolution (1280x720)', quality: 'maxres' },
  ]

  const extractVideoId = (url: string): string | null => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  const processVideoUrl = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube video URL",
        variant: "destructive",
      })
      return
    }

    const extractedId = extractVideoId(videoUrl)
    if (!extractedId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      })
      return
    }

    setVideoId(extractedId)
    generateThumbnail(extractedId)
  }

  const generateThumbnail = (id: string) => {
    setIsProcessing(true)
    
    // Simulate processing delay
    setTimeout(() => {
      const baseUrl = 'https://img.youtube.com/vi'
      const selectedType = thumbnailTypes.find(t => t.value === thumbnailType)
      const quality = selectedType?.quality || 'default'
      
      const url = `${baseUrl}/${id}/${quality}default.jpg`
      setThumbnailUrl(url)
      setIsProcessing(false)
      
      toast({
        title: "Success!",
        description: "Thumbnail generated successfully",
        variant: "default",
      })
    }, 1000)
  }

  const downloadThumbnail = () => {
    if (!thumbnailUrl) return

    const link = document.createElement('a')
    link.href = thumbnailUrl
    link.download = `youtube-thumbnail-${videoId}-${thumbnailType}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Downloaded!",
      description: "Thumbnail downloaded successfully",
      variant: "default",
    })
  }

  const copyThumbnailUrl = () => {
    if (!thumbnailUrl) return

    navigator.clipboard.writeText(thumbnailUrl)
    
    toast({
      title: "Copied!",
      description: "Thumbnail URL copied to clipboard",
      variant: "default",
    })
  }

  const openVideo = () => {
    if (!videoId) return

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    window.open(videoUrl, '_blank')
  }

  const insertSampleUrl = () => {
    setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  }

  const clearAll = () => {
    setVideoUrl('')
    setVideoId('')
    setThumbnailUrl('')
  }

  const getThumbnailDimensions = (type: string): string => {
    const dimensions = {
      default: '120×90',
      medium: '320×180',
      high: '480×360',
      standard: '640×480',
      maxres: '1280×720',
    }
    return dimensions[type as keyof typeof dimensions] || 'Unknown'
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">YouTube Thumbnail Downloader</h1>
          <p className="text-muted-foreground">Download high-quality thumbnails from any YouTube video</p>
        </div>

        <Tabs defaultValue="url" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="video-id">From Video ID</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-6">
            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle>YouTube Video URL</CardTitle>
                <CardDescription>Enter a YouTube video URL to extract its thumbnail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={insertSampleUrl} variant="outline" size="sm">
                    Insert Sample URL
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={processVideoUrl} 
                  disabled={!videoUrl.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4 mr-2" />
                  )}
                  Extract Thumbnail
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video-id" className="space-y-6">
            {/* Video ID Input */}
            <Card>
              <CardHeader>
                <CardTitle>Video ID</CardTitle>
                <CardDescription>Enter a YouTube video ID directly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-id">Video ID</Label>
                  <Input
                    id="video-id"
                    placeholder="dQw4w9WgXcQ"
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Example: For https://www.youtube.com/watch?v=dQw4w9WgXcQ, the ID is "dQw4w9WgXcQ"
                  </p>
                </div>
                
                <Button 
                  onClick={() => generateThumbnail(videoId)} 
                  disabled={!videoId.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  Generate Thumbnail
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Video ID Display */}
        {videoId && (
          <Card>
            <CardHeader>
              <CardTitle>Video Information</CardTitle>
              <CardDescription>Extracted video details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Video ID</div>
                  <div className="text-sm text-muted-foreground font-mono">{videoId}</div>
                </div>
                <Button onClick={openVideo} variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Video
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Thumbnail Settings */}
        {videoId && (
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail Settings</CardTitle>
              <CardDescription>Choose the thumbnail quality and size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnail-type">Thumbnail Type</Label>
                <Select value={thumbnailType} onValueChange={setThumbnailType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select thumbnail type" />
                  </SelectTrigger>
                  <SelectContent>
                    {thumbnailTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({getThumbnailDimensions(type.value)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => generateThumbnail(videoId)} 
                disabled={isProcessing}
                size="sm"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Regenerate
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Thumbnail Preview */}
        {thumbnailUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail Preview</CardTitle>
              <CardDescription>Your generated thumbnail is ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadThumbnail} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={copyThumbnailUrl} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="max-w-full overflow-hidden rounded-lg border">
                  <img
                    src={thumbnailUrl}
                    alt="YouTube Thumbnail"
                    className="max-w-full h-auto"
                    loading="lazy"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Video ID</div>
                    <div className="text-muted-foreground font-mono">{videoId}</div>
                  </div>
                  <div>
                    <div className="font-medium">Thumbnail Type</div>
                    <div className="text-muted-foreground">
                      {thumbnailTypes.find(t => t.value === thumbnailType)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Dimensions</div>
                    <div className="text-muted-foreground">
                      {getThumbnailDimensions(thumbnailType)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Quality</div>
                    <div className="text-muted-foreground">
                      {thumbnailTypes.find(t => t.value === thumbnailType)?.quality || 'Unknown'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <div className="font-medium mb-1">Direct URL</div>
                  <div className="text-sm font-mono break-all">{thumbnailUrl}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Examples</CardTitle>
            <CardDescription>Try these sample URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
                { url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Short YouTube URL' },
                { url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', title: 'YouTube Shorts' },
                { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Embedded Video' },
              ].map((example, index) => (
                <Button
                  key={index}
                  onClick={() => setVideoUrl(example.url)}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Video className="h-4 w-4 mr-2" />
                  {example.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
            <CardDescription>Best practices for using YouTube thumbnails</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Max Resolution thumbnails are the highest quality but may not be available for all videos</li>
              <li>• Standard and High quality thumbnails are available for most videos</li>
              <li>• Thumbnails are cached by YouTube, so they load instantly</li>
              <li>• You can use direct URLs in HTML img tags or markdown</li>
              <li>• Thumbnails are in JPEG format and optimized for web use</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}