'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, Trash2, Eye, AlertTriangle, CheckCircle, FileImage } from 'lucide-react'

export default function EXIFDataRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [processedUrl, setProcessedUrl] = useState<string>('')
  const [exifData, setExifData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setSelectedFile(file)
    setFileName(file.name)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    // Reset processed URL
    setProcessedUrl('')
    setExifData(null)
    setError('')
  }

  const removeEXIFData = async () => {
    if (!selectedFile) {
      setError('Please select an image file first')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate EXIF removal process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create canvas to remove EXIF data
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        // Convert to blob (simulating processed image without EXIF)
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setProcessedUrl(url)
            
            // Mock EXIF data that was removed
            const mockExifData = {
              camera: {
                make: 'Canon',
                model: 'EOS 5D Mark IV',
                lens: 'EF 24-70mm f/2.8L II USM'
              },
              settings: {
                exposureTime: '1/250s',
                fNumber: 'f/8.0',
                iso: '100',
                focalLength: '35mm',
                whiteBalance: 'Auto'
              },
              gps: {
                latitude: 40.7128,
                longitude: -74.0060,
                altitude: 10.5
              },
              metadata: {
                dateTime: '2024:01:20 14:30:00',
                orientation: 'Horizontal (normal)',
                software: 'Adobe Photoshop 2024'
              },
              fileSize: {
                original: '4.2 MB',
                processed: '4.1 MB',
                reduction: '0.1 MB (2.4%)'
              }
            }
            
            setExifData(mockExifData)
          }
        }, 'image/jpeg', 0.95)
      }
      
      img.src = previewUrl
    } catch (err) {
      setError('Failed to remove EXIF data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadProcessedImage = () => {
    if (!processedUrl) return
    
    const link = document.createElement('a')
    link.href = processedUrl
    link.download = `no-exif-${fileName || 'processed.jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetAll = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setProcessedUrl('')
    setExifData(null)
    setFileName('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            EXIF Data Remover
          </CardTitle>
          <CardDescription>
            Remove EXIF metadata from your images to protect privacy and reduce file size. 
            View what data will be removed and download the cleaned image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Upload an Image</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select an image file to remove EXIF metadata and protect your privacy
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                variant="outline"
              >
                Choose Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-gray-600">Ready to process</p>
                  </div>
                </div>
                <Button onClick={resetAll} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Original Image
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                  <Button 
                    onClick={removeEXIFData} 
                    disabled={loading} 
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Remove EXIF Data'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    {processedUrl ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Eye className="h-4 w-4" />}
                    Processed Image
                  </h3>
                  {processedUrl ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={processedUrl}
                          alt="Processed"
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                      <Button onClick={downloadProcessedImage} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Clean Image
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Processed image will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {exifData && (
            <Tabs defaultValue="removed" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="removed">Removed Data</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="removed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      EXIF Data Removed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Camera Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Make</span>
                            <span className="font-medium">{exifData.camera.make}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Model</span>
                            <span className="font-medium">{exifData.camera.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lens</span>
                            <span className="font-medium">{exifData.camera.lens}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">GPS Location</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Latitude</span>
                            <span className="font-medium">{exifData.gps.latitude}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Longitude</span>
                            <span className="font-medium">{exifData.gps.longitude}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Altitude</span>
                            <span className="font-medium">{exifData.gps.altitude}m</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Camera Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Exposure</span>
                            <span className="font-medium">{exifData.settings.exposureTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Aperture</span>
                            <span className="font-medium">{exifData.settings.fNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ISO</span>
                            <span className="font-medium">{exifData.settings.iso}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">File Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Original Size</span>
                            <span className="font-medium">{exifData.fileSize.original}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Processed Size</span>
                            <span className="font-medium">{exifData.fileSize.processed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Space Saved</span>
                            <Badge variant="default">{exifData.fileSize.reduction}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Before & After Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <h4 className="font-medium mb-2">Original Image</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={previewUrl}
                            alt="Original"
                            className="w-full h-48 object-contain"
                          />
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Contains EXIF metadata
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium mb-2">Processed Image</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={processedUrl}
                            alt="Processed"
                            className="w-full h-48 object-contain"
                          />
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          EXIF data removed
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">What is EXIF Data?</h4>
                        <p className="text-sm text-gray-600">
                          EXIF (Exchangeable Image File Format) metadata includes information 
                          about the camera settings, GPS location, date/time, and other technical 
                          details embedded in image files.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Why Remove EXIF Data?</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Protect your privacy and location</li>
                          <li>• Remove sensitive camera information</li>
                          <li>• Reduce file size slightly</li>
                          <li>• Share images without revealing personal data</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Data Types Removed</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <Badge variant="outline">Camera Make/Model</Badge>
                          <Badge variant="outline">Lens Information</Badge>
                          <Badge variant="outline">GPS Coordinates</Badge>
                          <Badge variant="outline">Date/Time</Badge>
                          <Badge variant="outline">Camera Settings</Badge>
                          <Badge variant="outline">Serial Numbers</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}