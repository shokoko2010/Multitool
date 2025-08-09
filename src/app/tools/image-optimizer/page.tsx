'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  RefreshCw, 
  Settings, 
  Zap,
  CheckCircle,
  XCircle,
  Eye,
  FileImage,
  Compress,
  Maximize
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface ImageFile {
  file: File
  preview: string
  originalSize: number
  optimizedSize?: number
  optimizedUrl?: string
  compressionRatio?: number
  format: string
}

export default function ImageOptimizer() {
  const { theme } = useTheme()
  const [images, setImages] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [quality, setQuality] = useState([80])
  const [format, setFormat] = useState('jpeg')
  const [maxWidth, setMaxWidth] = useState([1920])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formats = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
    { value: 'auto', label: 'Auto (Best Format)' }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    const newImages: ImageFile[] = files.map(file => {
      const preview = URL.createObjectURL(file)
      const format = file.name.split('.').pop()?.toLowerCase() || 'jpeg'
      
      return {
        file,
        preview,
        originalSize: file.size,
        format
      }
    })
    
    setImages(prev => [...prev, ...newImages])
  }

  const optimizeImage = async (image: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const img = new Image()
      
      img.onload = () => {
        const ctx = canvas.getContext('2d')
        
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth[0]) {
          height = (height * maxWidth[0]) / width
          width = maxWidth[0]
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw image
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedUrl = URL.createObjectURL(blob)
              const optimizedSize = blob.size
              const compressionRatio = ((image.originalSize - optimizedSize) / image.originalSize) * 100
              
              resolve({
                ...image,
                optimizedSize,
                optimizedUrl,
                compressionRatio
              })
            } else {
              resolve(image)
            }
          },
          format === 'auto' ? `image/${image.format}` : `image/${format}`,
          quality[0] / 100
        )
      }
      
      img.src = image.preview
    })
  }

  const optimizeAllImages = async () => {
    if (images.length === 0) return
    
    setIsProcessing(true)
    
    try {
      const optimizedImages = await Promise.all(
        images.map(image => optimizeImage(image))
      )
      
      setImages(optimizedImages)
    } catch (error) {
      console.error('Error optimizing images:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = (image: ImageFile, index: number) => {
    if (!image.optimizedUrl) return
    
    const a = document.createElement('a')
    a.href = image.optimizedUrl
    a.download = `optimized-${image.file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const removeImage = (index: number) => {
    const imageToRemove = images[index]
    URL.revokeObjectURL(imageToRemove.preview)
    if (imageToRemove.optimizedUrl) {
      URL.revokeObjectURL(imageToRemove.optimizedUrl)
    }
    
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSavings = () => {
    return images.reduce((total, image) => {
      if (image.compressionRatio) {
        return total + (image.originalSize - (image.optimizedSize || 0))
      }
      return total
    }, 0)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Optimizer</h1>
        <p className="text-muted-foreground">
          Compress and optimize images for web performance
        </p>
      </div>

      <Tabs defaultValue="optimizer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="optimizer">Image Optimizer</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizer" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Images
              </CardTitle>
              <CardDescription>
                Select images to optimize (JPG, PNG, WebP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop images here or click to browse
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Images
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Optimization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quality: {quality[0]}%
                  </label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Output Format
                  </label>
                  <div className="flex gap-2">
                    {formats.map((f) => (
                      <Button
                        key={f.value}
                        variant={format === f.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormat(f.value)}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Width: {maxWidth[0]}px
                  </label>
                  <Slider
                    value={maxWidth}
                    onValueChange={setMaxWidth}
                    max={3840}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>100px</span>
                    <span>3840px</span>
                  </div>
                </div>

                <Button 
                  onClick={optimizeAllImages} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Optimize All Images
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {images.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{images.length}</div>
                      <div className="text-sm text-muted-foreground">Images</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatFileSize(getTotalSavings())}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Savings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {images.filter(img => img.optimizedSize).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Optimized</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg truncate">
                            {image.file.name}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Preview */}
                        <div className="relative aspect-square bg-muted/50 rounded-lg overflow-hidden">
                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="w-full h-full object-contain"
                          />
                          {image.optimizedUrl && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Optimized
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Original:</span>
                            <span>{formatFileSize(image.originalSize)}</span>
                          </div>
                          {image.optimizedSize && (
                            <>
                              <div className="flex justify-between">
                                <span>Optimized:</span>
                                <span className="text-green-600">
                                  {formatFileSize(image.optimizedSize)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Saved:</span>
                                <span className="text-green-600 font-medium">
                                  {image.compressionRatio?.toFixed(1)}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {image.optimizedUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadImage(image, index)}
                              className="flex-1"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(image.preview, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <Compress className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Batch Processing</h3>
              <p className="text-muted-foreground mb-4">
                Process multiple images with advanced optimization settings
              </p>
              <Button variant="outline">
                <Maximize className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}