'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, Download, Image as ImageIcon, Compress, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CompressionResult {
  originalFile: File
  compressedBlob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  quality: number
  format: string
}

export default function ImageCompressorTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([])
  const [quality, setQuality] = useState([80])
  const [format, setFormat] = useState('auto')
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && supportedFormats.some(format => file.type.startsWith(format.split('/')[0]))) {
      setSelectedFile(file)
      setCompressionResults([])
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid image file (JPEG, PNG, or WebP)",
        variant: "destructive"
      })
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && supportedFormats.some(format => file.type.startsWith(format.split('/')[0]))) {
      setSelectedFile(file)
      setCompressionResults([])
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const compressImage = async (file: File, quality: number, outputFormat: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) {
        reject(new Error('Canvas not available'))
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions to maintain aspect ratio
        let { width, height } = img
        
        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Determine output format
        let mimeType = 'image/jpeg'
        if (outputFormat === 'png') {
          mimeType = 'image/png'
        } else if (outputFormat === 'webp') {
          mimeType = 'image/webp'
        } else if (file.type === 'image/png') {
          mimeType = 'image/png'
        }

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          mimeType,
          mimeType === 'image/png' ? undefined : quality / 100
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleCompress = async () => {
    if (!selectedFile) return

    setIsCompressing(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const outputFormat = format === 'auto' ? selectedFile.type.split('/')[1] : format
      const compressedBlob = await compressImage(selectedFile, quality[0], outputFormat)

      clearInterval(progressInterval)
      setProgress(100)

      const result: CompressionResult = {
        originalFile: selectedFile,
        compressedBlob,
        originalSize: selectedFile.size,
        compressedSize: compressedBlob.size,
        compressionRatio: Math.round((1 - compressedBlob.size / selectedFile.size) * 100),
        quality: quality[0],
        format: outputFormat
      }

      setCompressionResults([result])
      
      toast({
        title: "Compression Complete",
        description: `Image compressed by ${result.compressionRatio}%`,
      })
    } catch (error) {
      toast({
        title: "Compression Error",
        description: "Failed to compress image",
        variant: "destructive"
      })
    } finally {
      setIsCompressing(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const downloadImage = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const clearAll = () => {
    setSelectedFile(null)
    setCompressionResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Image Compressor
          </CardTitle>
          <CardDescription>
            Compress images to reduce file size while maintaining quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {selectedFile ? selectedFile.name : 'Drop an image here or click to select'}
                  </p>
                  {selectedFile && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Size: {formatFileSize(selectedFile.size)}</p>
                      <p>Type: {selectedFile.type}</p>
                    </div>
                  )}
                  {!selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Supports JPEG, PNG, and WebP formats
                    </p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            </div>

            {/* Compression Options */}
            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Compress className="h-5 w-5" />
                    Compression Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quality Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Quality: {quality[0]}%</Label>
                      <Badge variant="outline">
                        {quality[0] >= 80 ? 'High' : quality[0] >= 50 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                    <Slider
                      value={quality}
                      onValueChange={setQuality}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher quality = Larger file size. Lower quality = Smaller file size.
                    </p>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-2">
                    <Label>Output Format:</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (same as input)</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Compress Button */}
                  <div className="flex gap-2">
                    <Button onClick={handleCompress} disabled={isCompressing}>
                      {isCompressing ? 'Compressing...' : 'Compress Image'}
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      <RotateCw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {isCompressing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compressing...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {compressionResults.length > 0 && (
              <Tabs defaultValue="result" className="w-full">
                <TabsList>
                  <TabsTrigger value="result">Compression Result</TabsTrigger>
                  <TabsTrigger value="compare">Compare</TabsTrigger>
                </TabsList>

                <TabsContent value="result" className="space-y-4">
                  {compressionResults.map((result, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">Compression Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatFileSize(result.originalSize)}
                            </div>
                            <div className="text-sm text-blue-600">Original Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {formatFileSize(result.compressedSize)}
                            </div>
                            <div className="text-sm text-green-600">Compressed Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {result.compressionRatio}%
                            </div>
                            <div className="text-sm text-purple-600">Space Saved</div>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Quality Settings:</Label>
                            <div className="text-sm text-muted-foreground mt-1">
                              Quality: {result.quality}%
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Output Format:</Label>
                            <div className="text-sm text-muted-foreground mt-1">
                              {result.format.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                          <Button
                            onClick={() => downloadImage(result.compressedBlob, `compressed_${result.originalFile.name}`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Compressed
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => downloadImage(result.originalFile, `original_${result.originalFile.name}`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Original
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="compare" className="space-y-4">
                  {compressionResults.map((result, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Original Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Size:</span>
                                <span>{formatFileSize(result.originalSize)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span>{result.originalFile.type}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Compressed Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Size:</span>
                                <span>{formatFileSize(result.compressedSize)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span>image/{result.format}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quality:</span>
                                <span>{result.quality}%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compression Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Best Practices</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Start with high quality (80-90%)</li>
                      <li>• Adjust based on image content</li>
                      <li>• Use WebP for better compression</li>
                      <li>• Consider PNG for transparency</li>
                      <li>• Test compressed images before use</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600">Quality Guidelines</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Photos: JPEG 70-85%</li>
                      <li>• Graphics: PNG or WebP</li>
                      <li>• Web images: 60-80%</li>
                      <li>• Print: 90% or higher</li>
                      <li>• Thumbnails: 50-70%</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hidden canvas for compression */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}