'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Download, RotateCcw, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ImageResizer() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [quality, setQuality] = useState<number>(80)
  const [format, setFormat] = useState<string>('jpeg')
  const [aspectRatio, setAspectRatio] = useState<string>('maintain')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Get image dimensions
    const img = new Image()
    img.onload = () => {
      setWidth(img.width)
      setHeight(img.height)
    }
    img.src = url
  }

  const resizeImage = () => {
    if (!image || !previewUrl || !canvasRef.current) {
      toast({
        title: "Missing image",
        description: "Please select an image first",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.onload = () => {
        let newWidth = img.width
        let newHeight = img.height

        if (aspectRatio === 'maintain' && width && height) {
          // Maintain aspect ratio
          const ratio = Math.min(width / img.width, height / img.height)
          newWidth = img.width * ratio
          newHeight = img.height * ratio
        } else if (aspectRatio === 'stretch' && width && height) {
          newWidth = width
          newHeight = height
        } else if (aspectRatio === 'crop' && width && height) {
          // Crop to fit
          const ratio = Math.max(width / img.width, height / img.height)
          newWidth = img.width * ratio
          newHeight = img.height * ratio
        }

        canvas.width = newWidth
        canvas.height = newHeight

        // Clear canvas
        ctx.clearRect(0, 0, newWidth, newHeight)

        if (aspectRatio === 'crop' && width && height) {
          // Center crop
          const sx = (img.width * ratio - width) / 2
          const sy = (img.height * ratio - height) / 2
          ctx.drawImage(img, -sx, -sy, img.width * ratio, img.height * ratio)
        } else {
          ctx.drawImage(img, 0, 0, newWidth, newHeight)
        }

        // Convert to blob and download
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `resized-${image.name.replace(/\.[^/.]+$/, '')}.${format}`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              
              toast({
                title: "Image resized successfully",
                description: `Image resized to ${Math.round(newWidth)}x${Math.round(newHeight)}`
              })
            }
          },
          `image/${format}`,
          quality / 100
        )
      }
      img.src = previewUrl
    } catch (error) {
      toast({
        title: "Resize failed",
        description: "Unable to resize the image",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const clearImage = () => {
    setImage(null)
    setPreviewUrl(null)
    setWidth(null)
    setHeight(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Resizer</h1>
        <p className="text-muted-foreground">
          Resize images while maintaining quality and aspect ratio
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Image Tool</Badge>
          <Badge variant="outline">Resizing</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image to resize
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
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
                    Supports: JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </div>

            {image && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <input
                      id="width"
                      type="number"
                      placeholder="Auto"
                      value={width || ''}
                      onChange={(e) => setWidth(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (px)</Label>
                    <input
                      id="height"
                      type="number"
                      placeholder="Auto"
                      value={height || ''}
                      onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintain">Maintain Aspect Ratio</SelectItem>
                      <SelectItem value="stretch">Stretch to Fit</SelectItem>
                      <SelectItem value="crop">Crop to Fit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
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
                  />
                </div>

                <Button 
                  onClick={resizeImage} 
                  disabled={loading || !image}
                  className="w-full"
                >
                  {loading ? "Resizing..." : "Resize Image"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview & Tips</CardTitle>
            <CardDescription>
              Image resizing information and best practices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {image ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Original Image</h4>
                  <p className="text-sm space-y-1">
                    <span>Name: {image.name}</span><br />
                    <span>Size: {(image.size / 1024 / 1024).toFixed(2)} MB</span><br />
                    <span>Dimensions: {width} × {height} px</span><br />
                    <span>Type: {image.type}</span>
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Resize Options</h4>
                  <div className="text-sm space-y-1">
                    <p>• Maintain aspect ratio for best quality</p>
                    <p>• Use WebP for smaller file sizes</p>
                    <p>• Quality 80% provides good balance</p>
                    <p>• Crop option for specific dimensions</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How to Use</h4>
                  <div className="text-sm space-y-1">
                    <p>1. Upload an image using the file selector</p>
                    <p>2. Set your desired width and height</p>
                    <p>3. Choose aspect ratio handling</p>
                    <p>4. Select output format and quality</p>
                    <p>5. Click "Resize Image" to download</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Best Practices</h4>
                  <div className="text-sm space-y-1">
                    <p>• Use high-quality source images</p>
                    <p>• Maintain aspect ratio when possible</p>
                    <p>• Use WebP format for web images</p>
                    <p>• Quality 80% is optimal for most uses</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}