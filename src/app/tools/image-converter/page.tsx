'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, RotateCcw, Crop, Image as ImageIcon, FileImage, Maximize2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ImageConverter() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [outputFormat, setOutputFormat] = useState('jpeg')
  const [quality, setQuality] = useState(90)
  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [convertedImageUrl, setConvertedImageUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const supportedFormats = [
    { value: 'jpeg', label: 'JPEG', extension: '.jpg' },
    { value: 'png', label: 'PNG', extension: '.png' },
    { value: 'webp', label: 'WebP', extension: '.webp' },
    { value: 'gif', label: 'GIF', extension: '.gif' },
    { value: 'bmp', label: 'BMP', extension: '.bmp' },
    { value: 'tiff', label: 'TIFF', extension: '.tiff' },
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setSelectedImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setConvertedImageUrl('')
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setPreviewUrl('')
    setConvertedImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const convertImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to convert",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)
    setProgress(0)

    try {
      // Simulate conversion progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Create canvas for image manipulation
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      const img = new Image()
      img.onload = async () => {
        // Set canvas dimensions
        let canvasWidth = img.width
        let canvasHeight = img.height

        if (width && height) {
          canvasWidth = width
          canvasHeight = height
        } else if (width) {
          canvasHeight = (img.height * width) / img.width
        } else if (height) {
          canvasWidth = (img.width * height) / img.height
        }

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

        // Convert to selected format
        let mimeType = `image/${outputFormat}`
        let dataUrl: string

        if (outputFormat === 'jpeg') {
          dataUrl = canvas.toDataURL(mimeType, quality / 100)
        } else if (outputFormat === 'png') {
          dataUrl = canvas.toDataURL(mimeType)
        } else if (outputFormat === 'webp') {
          dataUrl = canvas.toDataURL(mimeType, quality / 100)
        } else {
          dataUrl = canvas.toDataURL(mimeType)
        }

        setConvertedImageUrl(dataUrl)
        setProgress(100)
        
        clearInterval(progressInterval)
        
        toast({
          title: "Success!",
          description: "Image converted successfully",
          variant: "default",
        })
      }

      img.src = previewUrl
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Failed to convert image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const downloadImage = () => {
    if (!convertedImageUrl) return

    const link = document.createElement('a')
    link.download = `converted-image.${outputFormat}`
    link.href = convertedImageUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Downloaded!",
      description: "Image downloaded successfully",
      variant: "default",
    })
  }

  const resetSettings = () => {
    setOutputFormat('jpeg')
    setQuality(90)
    setWidth(null)
    setHeight(null)
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const getImageInfo = () => {
    if (!previewUrl) return null

    const img = new Image()
    img.src = previewUrl
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      size: selectedImage?.size || 0,
      type: selectedImage?.type || '',
    }
  }

  const imageInfo = getImageInfo()

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Image Converter</h1>
          <p className="text-muted-foreground">Convert, resize, and optimize images in various formats</p>
        </div>

        <Tabs defaultValue="convert" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="convert">Convert</TabsTrigger>
            <TabsTrigger value="resize">Resize</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
          </TabsList>

          <TabsContent value="convert" className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>Select an image file to convert</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop an image here, or{" "}
                        <button
                          onClick={openFileSelector}
                          className="text-primary hover:underline"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports: JPG, PNG, WebP, GIF, BMP, TIFF
                      </p>
                    </div>
                  </div>
                </div>

                {selectedImage && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileImage className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{selectedImage.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button onClick={removeSelectedImage} variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Settings */}
            {selectedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Settings</CardTitle>
                  <CardDescription>Configure how your image should be converted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="output-format">Output Format</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label} ({format.extension})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quality">Quality: {quality}%</Label>
                      <input
                        id="quality"
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full"
                        disabled={!['jpeg', 'webp'].includes(outputFormat)}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={convertImage} disabled={isConverting} size="sm">
                      {isConverting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                      )}
                      Convert Image
                    </Button>
                    <Button onClick={resetSettings} variant="outline" size="sm">
                      Reset Settings
                    </Button>
                  </div>

                  {isConverting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Converting...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            {previewUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Original Image</CardTitle>
                  <CardDescription>Preview of your uploaded image</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="max-w-full overflow-hidden rounded-lg border">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full h-auto"
                      />
                    </div>
                    {imageInfo && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Width</div>
                          <div className="text-muted-foreground">{imageInfo.width}px</div>
                        </div>
                        <div>
                          <div className="font-medium">Height</div>
                          <div className="text-muted-foreground">{imageInfo.height}px</div>
                        </div>
                        <div>
                          <div className="font-medium">Size</div>
                          <div className="text-muted-foreground">
                            {(imageInfo.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Type</div>
                          <div className="text-muted-foreground">{imageInfo.type}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Converted Image */}
            {convertedImageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Converted Image</CardTitle>
                  <CardDescription>Your converted image is ready</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={downloadImage} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={() => setConvertedImageUrl('')} variant="outline" size="sm">
                        Clear
                      </Button>
                    </div>
                    <div className="max-w-full overflow-hidden rounded-lg border">
                      <img
                        src={convertedImageUrl}
                        alt="Converted"
                        className="max-w-full h-auto"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Format: {outputFormat.toUpperCase()} | Quality: {quality}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resize Image</CardTitle>
                <CardDescription>Resize your image to specific dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Resize functionality available in the Convert tab after uploading an image.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimize Image</CardTitle>
                <CardDescription>Optimize image quality and file size</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Optimization functionality available in the Convert tab after uploading an image.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}