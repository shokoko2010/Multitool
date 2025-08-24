'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Settings, 
  BarChart3,
  Zap,
  FileImage,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react'

interface CompressionSettings {
  quality: number
  format: 'jpeg' | 'png' | 'webp'
  maxWidth: number
  maxHeight: number
  enableLossless: boolean
  preserveMetadata: boolean
}

interface CompressionResult {
  originalFile: File
  compressedFile: File | null
  originalSize: number
  compressedSize: number
  compressionRatio: number
  timeTaken: number
  originalDimensions: { width: number; height: number }
  compressedDimensions: { width: number; height: number }
  format: string
}

export default function ImageCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [compressedUrl, setCompressedUrl] = useState<string>('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(true)
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('compress')
  
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 80,
    format: 'jpeg',
    maxWidth: 1920,
    maxHeight: 1080,
    enableLossless: false,
    preserveMetadata: false
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calculateCompressionRatio = (original: number, compressed: number): number => {
    return Math.round(((original - compressed) / original) * 100)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB')
      return
    }

    setSelectedFile(file)
    setError(null)
    setCompressedUrl('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const compressImage = async (): Promise<CompressionResult> => {
    if (!selectedFile || !canvasRef.current) {
      throw new Error('No file selected or canvas not available')
    }

    const startTime = Date.now()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img
          const originalDimensions = { width, height }

          if (width > settings.maxWidth || height > settings.maxHeight) {
            const ratio = Math.min(settings.maxWidth / width, settings.maxHeight / height)
            width *= ratio
            height *= ratio
          }

          const compressedDimensions = { width: Math.round(width), height: Math.round(height) }

          // Set canvas dimensions
          canvas.width = width
          canvas.height = height

          // Draw image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }

              const compressedFile = new File([blob], `compressed_${selectedFile.name}`, {
                type: `image/${settings.format}`
              })

              const timeTaken = Date.now() - startTime
              const result: CompressionResult = {
                originalFile: selectedFile,
                compressedFile,
                originalSize: selectedFile.size,
                compressedSize: blob.size,
                compressionRatio: calculateCompressionRatio(selectedFile.size, blob.size),
                timeTaken,
                originalDimensions,
                compressedDimensions,
                format: settings.format.toUpperCase()
              }

              // Create compressed preview
              const compressedReader = new FileReader()
              compressedReader.onload = (e) => {
                setCompressedUrl(e.target?.result as string)
                resolve(result)
              }
              compressedReader.readAsDataURL(blob)
            },
            `image/${settings.format}`,
            settings.enableLossless ? 1 : settings.quality / 100
          )
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(selectedFile)
    })
  }

  const handleCompress = async () => {
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setIsCompressing(true)
    setError(null)

    try {
      const result = await compressImage()
      setCompressionResults(prev => [result, ...prev.slice(0, 9)])
    } catch (error) {
      setError('Failed to compress image. Please try again.')
    } finally {
      setIsCompressing(false)
    }
  }

  const downloadCompressed = () => {
    if (!compressedUrl) return

    const link = document.createElement('a')
    link.href = compressedUrl
    link.download = `compressed_${selectedFile?.name || 'image'}`
    link.click()
  }

  const resetAll = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setCompressedUrl('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateSetting = (key: keyof CompressionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const getCompressionColor = (ratio: number): string => {
    if (ratio >= 70) return 'text-green-600'
    if (ratio >= 40) return 'text-blue-600'
    if (ratio >= 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompressionLevel = (ratio: number): string => {
    if (ratio >= 70) return 'Excellent'
    if (ratio >= 40) return 'Good'
    if (ratio >= 20) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-6 w-6" />
            Image Compressor
          </CardTitle>
          <CardDescription>
            Compress images while maintaining quality with advanced optimization options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="compress">Compress</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="compress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Select Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                      {selectedFile && (
                        <Button variant="outline" onClick={resetAll}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {selectedFile && (
                      <div className="text-sm text-muted-foreground">
                        {selectedFile.name} • {formatFileSize(selectedFile.size)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCompress} 
                        disabled={!selectedFile || isCompressing}
                        className="flex-1"
                      >
                        {isCompressing ? (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                            Compressing...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Compress Image
                          </>
                        )}
                      </Button>
                      
                      {compressedUrl && (
                        <Button variant="outline" onClick={downloadCompressed}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {compressedUrl && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowOriginal(!showOriginal)}
                        >
                          {showOriginal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="ml-1">{showOriginal ? 'Hide Original' : 'Show Original'}</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="space-y-2">
                      <Label>Current Settings</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Quality: {settings.quality}%</div>
                        <div>Format: {settings.format.toUpperCase()}</div>
                        <div>Max Width: {settings.maxWidth}px</div>
                        <div>Max Height: {settings.maxHeight}px</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="border rounded-lg overflow-hidden bg-muted">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={showOriginal ? previewUrl : compressedUrl || previewUrl}
                            alt="Preview"
                            className="w-full h-auto max-h-96 object-contain"
                          />
                          {compressedUrl && showOriginal && (
                            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              Original
                            </div>
                          )}
                          {compressedUrl && !showOriginal && (
                            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                              Compressed
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No image selected</p>
                            <p className="text-sm text-muted-foreground">Select an image to preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {compressedUrl && compressionResults.length > 0 && (
                    <div className="space-y-2">
                      <Label>Compression Results</Label>
                      <Card>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Original Size:</span>
                                <span className="text-sm font-medium">{formatFileSize(compressionResults[0].originalSize)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Compressed Size:</span>
                                <span className="text-sm font-medium">{formatFileSize(compressionResults[0].compressedSize)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Compression:</span>
                                <span className={`text-sm font-medium ${getCompressionColor(compressionResults[0].compressionRatio)}`}>
                                  {compressionResults[0].compressionRatio}%
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Time Taken:</span>
                                <span className="text-sm font-medium">{compressionResults[0].timeTaken}ms</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Quality Level:</span>
                                <Badge variant="outline" className="text-xs">
                                  {getCompressionLevel(compressionResults[0].compressionRatio)}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Format:</span>
                                <span className="text-sm font-medium">{compressionResults[0].format}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality: {settings.quality}%</Label>
                    <input
                      id="quality"
                      type="range"
                      min="10"
                      max="100"
                      value={settings.quality}
                      onChange={(e) => updateSetting('quality', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low Quality</span>
                      <span>High Quality</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Output Format</Label>
                    <select
                      id="format"
                      value={settings.format}
                      onChange={(e) => updateSetting('format', e.target.value as any)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="jpeg">JPEG (Best for photos)</option>
                      <option value="png">PNG (Lossless, supports transparency)</option>
                      <option value="webp">WebP (Modern format, smaller size)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxWidth">Maximum Width: {settings.maxWidth}px</Label>
                    <input
                      id="maxWidth"
                      type="range"
                      min="100"
                      max="4096"
                      step="100"
                      value={settings.maxWidth}
                      onChange={(e) => updateSetting('maxWidth', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxHeight">Maximum Height: {settings.maxHeight}px</Label>
                    <input
                      id="maxHeight"
                      type="range"
                      min="100"
                      max="4096"
                      step="100"
                      value={settings.maxHeight}
                      onChange={(e) => updateSetting('maxHeight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Advanced Options</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.enableLossless}
                          onChange={(e) => updateSetting('enableLossless', e.target.checked)}
                        />
                        <span className="text-sm">Enable Lossless Compression (PNG/WebP only)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.preserveMetadata}
                          onChange={(e) => updateSetting('preserveMetadata', e.target.checked)}
                        />
                        <span className="text-sm">Preserve Image Metadata</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('quality', 90)
                          updateSetting('format', 'jpeg')
                          updateSetting('maxWidth', 1920)
                          updateSetting('maxHeight', 1080)
                        }}
                      >
                        High Quality
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('quality', 70)
                          updateSetting('format', 'jpeg')
                          updateSetting('maxWidth', 1280)
                          updateSetting('maxHeight', 720)
                        }}
                      >
                        Balanced
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('quality', 50)
                          updateSetting('format', 'jpeg')
                          updateSetting('maxWidth', 800)
                          updateSetting('maxHeight', 600)
                        }}
                      >
                        High Compression
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('quality', 100)
                          updateSetting('format', 'png')
                          updateSetting('enableLossless', true)
                          updateSetting('maxWidth', 4096)
                          updateSetting('maxHeight', 4096)
                        }}
                      >
                        Lossless PNG
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tips</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• JPEG is best for photographs and complex images</p>
                      <p>• PNG is ideal for graphics with text or transparency</p>
                      <p>• WebP offers the best compression for modern browsers</p>
                      <p>• Lower quality = smaller file size but reduced image quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compression History</h3>
                {compressionResults.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No compression history yet</p>
                    <p className="text-sm text-muted-foreground">Compressed images will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {compressionResults.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium mb-1">{result.originalFile.name}</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Original:</span>
                                  <div className="font-medium">{formatFileSize(result.originalSize)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Compressed:</span>
                                  <div className="font-medium">{formatFileSize(result.compressedSize)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Saved:</span>
                                  <div className={`font-medium ${getCompressionColor(result.compressionRatio)}`}>
                                    {result.compressionRatio}%
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Format:</span>
                                  <div className="font-medium">{result.format}</div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {result.timeTaken}ms • {result.originalDimensions.width}x{result.originalDimensions.height} → {result.compressedDimensions.width}x{result.compressedDimensions.height}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const url = URL.createObjectURL(result.compressedFile!)
                                  const link = document.createElement('a')
                                  link.href = url
                                  link.download = `compressed_${result.originalFile.name}`
                                  link.click()
                                  URL.revokeObjectURL(url)
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  )
}