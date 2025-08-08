'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Download, Video, Link, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VideoInfo {
  url: string
  title: string
  duration: string
  quality: string
  format: string
  size: string
  thumbnail: string
}

export default function VideoDownloader() {
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [selectedQuality, setSelectedQuality] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('mp4')
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a video URL to analyze",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Simulate video analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock video info
      const mockInfo: VideoInfo = {
        url: videoUrl,
        title: "Sample Video Title",
        duration: "3:45",
        quality: "1080p",
        format: "mp4",
        size: "45.2 MB",
        thumbnail: "https://via.placeholder.com/320x180?text=Video+Thumbnail"
      }
      
      setVideoInfo(mockInfo)
      setDownloadStatus('idle')
      
      toast({
        title: "Video analyzed",
        description: "Video information extracted successfully"
      })
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze the video URL",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadVideo = async () => {
    if (!videoInfo || !selectedQuality) {
      toast({
        title: "Missing selection",
        description: "Please select a quality and format before downloading",
        variant: "destructive"
      })
      return
    }

    setDownloadStatus('processing')
    setDownloadProgress(0)
    
    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 500)

      // Simulate download completion
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setDownloadProgress(100)
      setDownloadStatus('success')
      
      // Create and trigger download
      const blob = new Blob(['simulated video data'], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${videoInfo.title || 'video'}_${selectedQuality}.${selectedFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Download completed",
        description: `Video downloaded in ${selectedQuality} quality`
      })
    } catch (error) {
      setDownloadStatus('error')
      toast({
        title: "Download failed",
        description: "Unable to download the video",
        variant: "destructive"
      })
    }
  }

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return ['youtube.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv'].some(domain => 
        urlObj.hostname.includes(domain)
      )
    } catch {
      return false
    }
  }

  const getSupportedSites = (): string[] => {
    return [
      'YouTube',
      'Vimeo',
      'Dailymotion', 
      'Twitch',
      'Facebook',
      'Instagram',
      'Twitter/X'
    ]
  }

  const setSampleUrl = () => {
    setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Downloader</h1>
        <p className="text-muted-foreground">
          Download videos from popular platforms with multiple quality options and formats
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Video Tool</Badge>
          <Badge variant="outline">Download</Badge>
        </div>
      </div>

      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="download">Download Video</TabsTrigger>
          <TabsTrigger value="supported">Supported Sites</TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Video URL</CardTitle>
                <CardDescription>
                  Enter the video URL to download
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  {!validateUrl(videoUrl) && videoUrl && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      URL format appears invalid
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={analyzeVideo} 
                    disabled={loading || !videoUrl.trim()}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Analyzing..." : "Analyze Video"}
                  </Button>
                  <Button onClick={setSampleUrl} variant="outline">
                    <Link className="w-4 h-4 mr-2" />
                    Sample
                  </Button>
                </div>

                {/* Supported Sites Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-800">Supported Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {getSupportedSites().map((site) => (
                      <Badge key={site} variant="outline" className="text-xs">
                        {site}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Download Options</CardTitle>
                <CardDescription>
                  Select quality and format for download
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoInfo ? (
                  <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Video className="w-8 h-8 text-blue-500" />
                        <div>
                          <div className="font-medium">{videoInfo.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Duration: {videoInfo.duration} • Size: {videoInfo.size}
                          </div>
                        </div>
                      </div>
                      
                      {videoInfo.thumbnail && (
                        <img 
                          src={videoInfo.thumbnail} 
                          alt="Video thumbnail" 
                          className="w-full rounded-lg"
                          style={{ maxHeight: '180px', objectFit: 'cover' }}
                        />
                      )}
                    </div>

                    {/* Quality Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="quality">Select Quality</Label>
                      <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                          <SelectItem value="720p">720p (HD)</SelectItem>
                          <SelectItem value="480p">480p (SD)</SelectItem>
                          <SelectItem value="360p">360p (Low)</SelectItem>
                          <SelectItem value="144p">144p (Lowest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="format">Select Format</Label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                          <SelectItem value="avi">AVI</SelectItem>
                          <SelectItem value="mov">MOV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Download Progress */}
                    {downloadStatus === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Downloading...</span>
                          <span>{Math.round(downloadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Download Status */}
                    {downloadStatus === 'success' && (
                      <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">Download completed!</span>
                      </div>
                    )}

                    <Button 
                      onClick={downloadVideo} 
                      disabled={!selectedQuality || downloadStatus === 'processing'}
                      className="w-full"
                    >
                      {downloadStatus === 'processing' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {downloadStatus === 'processing' ? 'Downloading...' : 'Download Video'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No video selected</h3>
                    <p className="text-muted-foreground">
                      Enter a video URL and click "Analyze Video" to see download options
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="supported" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Video Platforms</CardTitle>
              <CardDescription>
                Complete list of supported video download platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "YouTube",
                    description: "Download videos from YouTube including music videos, tutorials, and live streams",
                    features: ["4K/8K support", "Audio extraction", "Playlist download", "Subtitles"]
                  },
                  {
                    name: "Vimeo",
                    description: "High-quality videos from Vimeo with professional features",
                    features: ["HD quality", "Original files", "DRM support", "Multiple formats"]
                  },
                  {
                    name: "Dailymotion",
                    description: "Download videos from Dailymotion including news and entertainment content",
                    features: ["HD quality", "Fast download", "Batch download", "Mobile optimized"]
                  },
                  {
                    name: "Twitch",
                    description: "Download Twitch streams, highlights, and VODs",
                    features: ["Live stream recording", "Clip extraction", "Quality selection", "Chat download"]
                  },
                  {
                    name: "Facebook",
                    description: "Download videos from Facebook posts, stories, and live streams",
                    features: ["HD quality", "Original format", "Batch processing", "Privacy settings"]
                  },
                  {
                    name: "Instagram",
                    description: "Download Instagram videos, reels, and stories",
                    features: ["Reel support", "Story download", "HD quality", "Fast processing"]
                  },
                  {
                    name: "Twitter/X",
                    description: "Download videos from Twitter including tweets and spaces",
                    features: ["HD quality", "Original format", "Fast download", "Multiple qualities"]
                  },
                  {
                    name: "TikTok",
                    description: "Download TikTok videos with original quality and metadata",
                    features: ["HD quality", "Original sound", "Metadata preservation", "Fast processing"]
                  },
                  {
                    name: "LinkedIn",
                    description: "Download professional videos from LinkedIn posts and learning content",
                    features: ["HD quality", "Professional format", "Batch download", "Metadata"]
                  }
                ].map((platform) => (
                  <div key={platform.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold mb-2">{platform.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{platform.description}</p>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-700">Features:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {platform.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="text-green-500">•</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-yellow-800">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Please respect copyright laws and content creators' rights</li>
                  <li>• Only download content you have permission to download</li>
                  <li>• Some platforms may have restrictions on downloading content</li>
                  <li>• Always check the terms of service before downloading</li>
                  <li>• Consider supporting content creators through official channels</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}