'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Upload, Download, RotateCcw, X, Image as ImageIcon, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ImageCompressor() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [quality, setQuality] = useState([80])
  const [maxWidth, setMaxWidth] = useState([1920])
  const [format, setFormat] = useState<string>('jpeg')
  const [loading, setLoading] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number
    compressedSize: number
    compressionRatio: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    setImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setCompressedUrl(null)
    setCompressionInfo(null)
  }

  const compressImage = () => {
    if (!image || !previewUrl) {
      toast({
        title: "Missing image",
        description: "Please select an image first",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Calculate new dimensions
        let newWidth = img.width
        let newHeight = img.height

        if (img.width > maxWidth[0]) {
          const ratio = maxWidth[0] / img.width
          newWidth = maxWidth[0]
          newHeight = img.height * ratio
        }

        canvas.width = newWidth
        canvas.height = newHeight

        // Clear canvas and draw image
        ctx.clearRect(0, 0, newWidth, newHeight)
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedUrl = URL.createObjectURL(blob)
              setCompressedUrl(compressedUrl)

              // Calculate compression info
              const originalSize = image.size
              const compressedSize = blob.size
              const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

              setCompressionInfo({
                originalSize,
                compressedSize,
                compressionRatio
              })

              // Auto-download compressed image
              const a = document.createElement('a')
              a.href = compressedUrl
              a.download = `compressed-${image.name.replace(/\.[^/.]+$/, '')}.${format}`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              
              toast({
                title: "Image compressed successfully",
                description: `Size reduced by ${compressionRatio.toFixed(1)}%`
              })
            }
          },
          `image/${format}`,
          quality[0] / 100
        )
      }
      img.src = previewUrl
    } catch (error) {
      toast({
        title: "Compression failed",
        description: "Unable to compress the image",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const clearImage = () => {
    setImage(null)
    setPreviewUrl(null)
    setCompressedUrl(null)
    setCompressionInfo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadCompressed = () => {
    if (!compressedUrl) return

    const a = document.createElement('a')
    a.href = compressedUrl
    a.download = `compressed-${image?.name.replace(/\.[^/.]+$/, '')}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    toast({
      title: "Download started",
      description: "Compressed image download has started"
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Compressor</h1>
        <p className="text-muted-foreground">
          Compress images while maintaining quality and reducing file size
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Image Tool</Badge>
          <Badge variant="outline">Compression</Badge>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload & Compress</TabsTrigger>
          <TabsTrigger value="preview">Preview Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>
                  Select an image to compress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                      <div className="flex justify-center gap-2">
                        <Button onClick={clearImage} variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </label>
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Supports: JPG, PNG, WebP, GIF
                      </p>
                    </div>
                  )}
                </div>

                {image && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Quality: {quality[0]}%</Label>
                      <Slider
                        value={quality}
                        onValueChange={setQuality}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower quality = smaller file size
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Width: {maxWidth[0]}px</Label>
                      <Slider
                        value={maxWidth}
                        onValueChange={setMaxWidth}
                        max={3840}
                        min={320}
                        step={100}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Reduces dimensions for smaller file size
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="format">Output Format</Label>
                      <Tabs value={format} onValueChange={setFormat} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="jpeg">JPEG</TabsTrigger>
                          <TabsTrigger value="png">PNG</TabsTrigger>
                          <TabsTrigger value="webp">WebP</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <Button 
                      onClick={compressImage} 
                      disabled={loading || !image}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          Compressing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Compress Image
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compression Settings</CardTitle>
                <CardDescription>
                  Configure image compression parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Quality Settings</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>• 90%: High quality (minimal compression)</p>
                    <p>• 80%: Good quality (recommended)</p>
                    <p>• 60%: Medium quality</p>
                    <p>• 30%: Low quality (maximum compression)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Format Comparison</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>• JPEG: Best for photos, smaller files</p>
                    <p>• PNG: Lossless, supports transparency</p>
                    <p>• WebP: Modern format, best compression</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Tips</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>• Use 80% quality for web images</p>
                    <p>• Reduce width to 1920px for web use</p>
                    <p>• Use WebP for modern browsers</p>
                    <p>• Keep original for backup</p>
                  </div>
                </div>

                {compressionInfo && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Compression Results</h4>
                    <div className="text-sm space-y-1">
                      <p>Original: {(compressionInfo.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Compressed: {(compressionInfo.compressedSize / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Saved: {compressionInfo.compressionRatio.toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {compressedUrl ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Original Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewUrl && (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                      {compressionInfo && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm">
                            Size: {(compressionInfo.originalSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compressed Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img
                      src={compressedUrl}
                      alt="Compressed"
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                    {compressionInfo && (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">
                          Size: {(compressionInfo.compressedSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-sm text-green-600">
                          Saved: {compressionInfo.compressionRatio.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    <Button onClick={downloadCompressed} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Compressed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">
                  Upload and compress an image to see the comparison
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}