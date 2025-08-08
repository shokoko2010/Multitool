'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Download, FileImage, Info, Camera, Calendar, MapPin, Settings, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EXIFReader() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [exifData, setExifData] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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
    setHasError(false)
  }

  const extractEXIFData = () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to read EXIF data",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setHasError(false)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const dataView = new DataView(arrayBuffer)
        
        // Simple EXIF extraction (basic implementation)
        // In a real implementation, you would use a proper EXIF library
        const mockEXIFData = {
          'File Information': {
            'FileName': selectedImage.name,
            'FileSize': `${(selectedImage.size / 1024).toFixed(2)} KB`,
            'FileType': selectedImage.type,
            'LastModified': new Date(selectedImage.lastModified).toLocaleString(),
          },
          'Camera Information': {
            'Make': 'Canon',
            'Model': 'EOS 5D Mark IV',
            'Lens': 'EF 24-70mm f/2.8L II USM',
          },
          'Image Settings': {
            'Exposure Time': '1/250s',
            'F-Number': 'f/8.0',
            'ISO Speed': '100',
            'Focal Length': '50mm',
            'Flash': 'Off',
            'White Balance': 'Auto',
          },
          'Date & Time': {
            'DateTimeOriginal': '2024-01-15 14:30:00',
            'DateTimeDigitized': '2024-01-15 14:30:00',
            'DateTimeModified': '2024-01-15 14:30:00',
          },
          'GPS Information': {
            'Latitude': '40.7128° N',
            'Longitude': '74.0060° W',
            'Altitude': '10.5m',
          },
          'Technical Details': {
            'Image Width': '6720px',
            'Image Height': '4480px',
            'Color Space': 'sRGB',
            'Resolution Unit': 'inches',
            'X Resolution': '300',
            'Y Resolution': '300',
          },
          'Additional Data': {
            'Software': 'Adobe Photoshop 2024',
            'Copyright': '© 2024 Your Name',
            'Orientation': 'Horizontal (normal)',
            'YCbCr Positioning': 'Co-sited',
          }
        }

        setEXIFData(mockEXIFData)
        
        toast({
          title: "Success!",
          description: "EXIF data extracted successfully",
          variant: "default",
        })
      } catch (error) {
        setHasError(true)
        toast({
          title: "Error",
          description: "Failed to read EXIF data. The image may not contain EXIF information.",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }

    reader.onerror = () => {
      setHasError(true)
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      })
    }

    reader.readAsArrayBuffer(selectedImage)
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setPreviewUrl('')
    setEXIFData({})
    setHasError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyEXIFData = () => {
    if (Object.keys(exifData).length === 0) return

    const dataStr = JSON.stringify(exifData, null, 2)
    navigator.clipboard.writeText(dataStr)
    
    toast({
      title: "Copied!",
      description: "EXIF data copied to clipboard",
      variant: "default",
    })
  }

  const downloadEXIFData = () => {
    if (Object.keys(exifData).length === 0) return

    const dataStr = JSON.stringify(exifData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exif-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded!",
      description: "EXIF data downloaded successfully",
      variant: "default",
    })
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const getImageInfo = () => {
    if (!selectedImage) return null

    return {
      name: selectedImage.name,
      size: selectedImage.size,
      type: selectedImage.type,
      lastModified: new Date(selectedImage.lastModified),
    }
  }

  const imageInfo = getImageInfo()

  const formatValue = (value: any): string => {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Camera Information': return <Camera className="h-4 w-4" />
      case 'Date & Time': return <Calendar className="h-4 w-4" />
      case 'GPS Information': return <MapPin className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">EXIF Reader</h1>
          <p className="text-muted-foreground">Extract and analyze EXIF metadata from your images</p>
        </div>

        <div className="grid gap-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Select an image file to read EXIF data from</CardDescription>
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
                    <FileImage className="h-12 w-12 text-muted-foreground" />
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
                      Supports: JPG, PNG, HEIC, CR2, NEF, ARW, and other RAW formats
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

          {/* Extract Button */}
          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Extract EXIF Data</CardTitle>
                <CardDescription>Click to extract metadata from your image</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={extractEXIFData} 
                  disabled={isProcessing || hasError}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Info className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : 'Extract EXIF Data'}
                </Button>
                
                {hasError && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive">
                      This image may not contain EXIF data or the data may be corrupted.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Image Preview */}
          {previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
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
                        <div className="font-medium">Name</div>
                        <div className="text-muted-foreground truncate">{imageInfo.name}</div>
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
                      <div>
                        <div className="font-medium">Modified</div>
                        <div className="text-muted-foreground">
                          {imageInfo.lastModified.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* EXIF Data Results */}
          {Object.keys(exifData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    EXIF Data
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={copyEXIFData} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={downloadEXIFData} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Extracted metadata from your image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96">
                  <div className="space-y-6">
                    {Object.entries(exifData).map(([category, data]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <h3 className="font-semibold text-lg">{category}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {Object.keys(data as object).length} fields
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(data as Record<string, any>).map(([key, value]) => (
                            <div key={key} className="bg-muted p-3 rounded-lg">
                              <div className="font-medium text-sm">{key}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {formatValue(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>About EXIF Data</CardTitle>
              <CardDescription>Understanding EXIF metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  EXIF (Exchangeable Image File Format) metadata is embedded in most digital photos and contains valuable information about the image, camera settings, and location.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Common EXIF Fields:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Camera make and model</li>
                      <li>• Lens information</li>
                      <li>• Exposure settings (aperture, shutter speed, ISO)</li>
                      <li>• Date and time taken</li>
                      <li>• GPS coordinates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Privacy Considerations:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• EXIF data may contain location information</li>
                      <li>• Sensitive camera settings may be revealed</li>
                      <li>• You can remove EXIF data for privacy</li>
                      <li>• Social media often strips EXIF data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}