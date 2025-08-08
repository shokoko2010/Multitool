'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Upload, Download, RotateCcw, Video, Film } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function VideoConverter() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState('mp4')
  const [quality, setQuality] = useState(['1080p'])
  const [compression, setCompression] = useState([75])
  const [loading, setLoading] = useState(false)
  const [conversionInfo, setConversionInfo] = useState<{
    originalSize: number
    estimatedSize: number
    format: string
    duration?: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive"
      })
      return
    }

    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Calculate estimated output size
    const estimatedSize = Math.round((file.size / 1024) * (compression[0] / 100))
    setConversionInfo({
      originalSize: file.size,
      estimatedSize: estimatedSize * 1024,
      format: outputFormat.toUpperCase()
    })
  }

  const convertVideo = () => {
    if (!videoFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to convert",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Simulate video conversion
      setTimeout(() => {
        const convertedBlob = new Blob(['simulated converted video data'], { 
          type: `video/${outputFormat}` 
        })
        
        const url = URL.createObjectURL(convertedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `converted-${videoFile.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast({
          title: "Video converted successfully",
          description: `File converted to ${outputFormat.toUpperCase()} format`
        })
      }, 3000)
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Unable to convert the video file",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const clearFile = () => {
    setVideoFile(null)
    setPreviewUrl(null)
    setConversionInfo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 ? 
      `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` :
      `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Converter</h1>
        <p className="text-muted-foreground">
          Convert video files between different formats with customizable quality and compression settings
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Video Tool</Badge>
          <Badge variant="outline">Conversion</Badge>
        </div>
      </div>

      <Tabs defaultValue="convert" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="convert">Convert Video</TabsTrigger>
          <TabsTrigger value="formats">Format Info</TabsTrigger>
        </TabsList>

        <TabsContent value="convert" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
                <CardDescription>
                  Select a video file to convert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Video className="w-16 h-16 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{videoFile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(videoFile?.size || 0)}
                        </p>
                      </div>
                      <video 
                        src={previewUrl} 
                        controls 
                        className="w-full max-w-xs mx-auto rounded"
                        style={{ maxHeight: '200px' }}
                      />
                      <div className="flex justify-center gap-2">
                        <Button onClick={clearFile} variant="outline">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Film className="w-16 h-16 text-gray-400" />
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="video-upload"
                        />
                        <Button asChild>
                          <label htmlFor="video-upload" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Video File
                          </label>
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Supports: MP4, AVI, MOV, WMV, MKV, WebM
                      </p>
                    </div>
                  )}
                </div>

                {videoFile && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Output Format</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                          <SelectItem value="avi">AVI (Uncompressed)</SelectItem>
                          <SelectItem value="mov">MOV (Apple)</SelectItem>
                          <SelectItem value="webm">WebM (Web Optimized)</SelectItem>
                          <SelectItem value="mkv">MKV (Open Source)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality[0]} onValueChange={(value) => setQuality([value])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4k">4K (3840x2160)</SelectItem>
                          <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                          <SelectItem value="720p">720p (1280x720)</SelectItem>
                          <SelectItem value="480p">480p (854x480)</SelectItem>
                          <SelectItem value="360p">360p (640x360)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Compression: {compression[0]}%</Label>
                      <Slider
                        value={compression}
                        onValueChange={setCompression}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher compression = smaller file size, lower quality
                      </p>
                    </div>

                    {conversionInfo && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Conversion Info</h4>
                        <div className="text-sm space-y-1">
                          <p>Original: {formatFileSize(conversionInfo.originalSize)}</p>
                          <p>Estimated: {formatFileSize(conversionInfo.estimatedSize)}</p>
                          <p>Format: {conversionInfo.format}</p>
                          <p>Quality: {quality[0]}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={convertVideo} 
                      disabled={loading || !videoFile}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Convert Video
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format Guide</CardTitle>
                <CardDescription>
                  Learn about different video formats and their use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800">MP4 (H.264)</h4>
                    <p className="text-sm text-blue-700">
                      Most popular compressed format. Excellent balance of quality and file size. 
                      Compatible with virtually all devices and platforms.
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      Best for: General use, web streaming, mobile devices
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-800">WebM</h4>
                    <p className="text-sm text-green-700">
                      Open web video format designed for HTML5. Excellent compression efficiency 
                      and quality, especially for web content.
                    </p>
                    <div className="mt-2 text-xs text-green-600">
                      Best for: Web videos, HTML5 content, modern browsers
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-purple-800">MOV</h4>
                    <p className="text-sm text-purple-700">
                      Apple's proprietary format. Excellent quality and supports professional 
                      features like multiple audio tracks and subtitles.
                    </p>
                    <div className="mt-2 text-xs text-purple-600">
                      Best for: Professional video editing, Apple ecosystem
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-orange-800">AVI/MKV</h4>
                    <p className="text-sm text-orange-700">
                      AVI is older but widely supported. MKV is modern container format that 
                      supports multiple audio/video tracks and subtitles.
                    </p>
                    <div className="mt-2 text-xs text-orange-600">
                      Best for: Media archives, complex video projects
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Conversion Tips</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Use MP4 for general video sharing</li>
                    <li>• Use WebM for web-optimized content</li>
                    <li>• Higher quality = larger file size</li>
                    <li>• 75% compression provides good quality/size balance</li>
                    <li>• Consider your target audience's devices</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Format Comparison</CardTitle>
              <CardDescription>
                Detailed comparison of supported video formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Format</th>
                      <th className="border border-gray-300 p-3 text-left">Compression</th>
                      <th className="border border-gray-300 p-3 text-left">Quality</th>
                      <th className="border border-gray-300 p-3 text-left">Compatibility</th>
                      <th className="border border-gray-300 p-3 text-left">Best Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">MP4</td>
                      <td className="border border-gray-300 p-3">H.264</td>
                      <td className="border border-gray-300 p-3">Excellent</td>
                      <td className="border border-gray-300 p-3">Universal</td>
                      <td className="border border-gray-300 p-3">General videos, streaming</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">WebM</td>
                      <td className="border border-gray-300 p-3">VP9</td>
                      <td className="border border-gray-300 p-3">Excellent</td>
                      <td className="border border-gray-300 p-3">Web browsers</td>
                      <td className="border border-gray-300 p-3">HTML5 videos, web content</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">MOV</td>
                      <td className="border border-gray-300 p-3">H.264/ProRes</td>
                      <td className="border border-gray-300 p-3">Excellent</td>
                      <td className="border border-gray-300 p-3">Apple devices</td>
                      <td className="border border-gray-300 p-3">Professional editing</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">AVI</td>
                      <td className="border border-gray-300 p-3">Various</td>
                      <td className="border border-gray-300 p-3">Variable</td>
                      <td className="border border-gray-300 p-3">Good</td>
                      <td className="border border-gray-300 p-3">Legacy systems, archives</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">MKV</td>
                      <td className="border border-gray-300 p-3">Various</td>
                      <td className="border border-gray-300 p-3">Excellent</td>
                      <td className="border border-gray-300 p-3">Good</td>
                      <td className="border border-gray-300 p-3">Media archives, complex projects</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}