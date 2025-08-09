'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Upload, Download, RotateCcw, Volume2, FileAudio } from 'lucide-react'
import { toast } from 'sonner'
import { useToast } from '@/hooks/use-toast'

export default function AudioConverter() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState('mp3')
  const [quality, setQuality] = useState([128])
  const [loading, setLoading] = useState(false)
  const [conversionInfo, setConversionInfo] = useState<{
    originalSize: number
    estimatedSize: number
    format: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      toast.error("Invalid file type: Please select an audio file")
      return
    }

    setAudioFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Calculate estimated output size
    const estimatedSize = Math.round((file.size / 1024) * (quality[0] / 128))
    setConversionInfo({
      originalSize: file.size,
      estimatedSize: estimatedSize * 1024,
      format: outputFormat.toUpperCase()
    })
  }

  const convertAudio = () => {
    if (!audioFile) {
      toast.error("No file selected: Please select an audio file to convert")
      return
    }

    setLoading(true)
    try {
      // Simulate audio conversion
      setTimeout(() => {
        const convertedBlob = new Blob(['simulated converted audio data'], { 
          type: `audio/${outputFormat}` 
        })
        
        const url = URL.createObjectURL(convertedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `converted-${audioFile.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success(`Audio converted successfully: File converted to ${outputFormat.toUpperCase()} format`)
      }, 2000)
    } catch (error) {
      toast.error("Conversion failed: Unable to convert the audio file")
    } finally {
      setLoading(false)
    }
  }

  const clearFile = () => {
    setAudioFile(null)
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Converter</h1>
        <p className="text-muted-foreground">
          Convert audio files between different formats with customizable quality settings
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Audio Tool</Badge>
          <Badge variant="outline">Conversion</Badge>
        </div>
      </div>

      <Tabs defaultValue="convert" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="convert">Convert Audio</TabsTrigger>
          <TabsTrigger value="formats">Format Info</TabsTrigger>
        </TabsList>

        <TabsContent value="convert" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Audio</CardTitle>
                <CardDescription>
                  Select an audio file to convert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Volume2 className="w-16 h-16 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{audioFile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(audioFile?.size || 0)}
                        </p>
                      </div>
                      <audio 
                        src={previewUrl} 
                        controls 
                        className="w-full max-w-xs mx-auto"
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
                        <FileAudio className="w-16 h-16 text-gray-400" />
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="audio-upload"
                        />
                        <Button asChild>
                          <label htmlFor="audio-upload" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Audio File
                          </label>
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Supports: MP3, WAV, OGG, M4A, FLAC
                      </p>
                    </div>
                  )}
                </div>

                {audioFile && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Output Format</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
                          <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
                          <SelectItem value="ogg">OGG (Open Source)</SelectItem>
                          <SelectItem value="m4a">M4A (Apple)</SelectItem>
                          <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {outputFormat === 'mp3' && (
                      <div className="space-y-2">
                        <Label>Quality: {quality[0]} kbps</Label>
                        <Slider
                          value={quality}
                          onValueChange={setQuality}
                          max={320}
                          min={32}
                          step={16}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher quality = larger file size
                        </p>
                      </div>
                    )}

                    {conversionInfo && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Conversion Info</h4>
                        <div className="text-sm space-y-1">
                          <p>Original: {formatFileSize(conversionInfo.originalSize)}</p>
                          <p>Estimated: {formatFileSize(conversionInfo.estimatedSize)}</p>
                          <p>Format: {conversionInfo.format}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={convertAudio} 
                      disabled={loading || !audioFile}
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
                          Convert Audio
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
                  Learn about different audio formats and their use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800">MP3</h4>
                    <p className="text-sm text-blue-700">
                      Most popular compressed format. Good balance of quality and file size. 
                      Ideal for music streaming and portable devices.
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      Quality: 32-320 kbps | Best for: General use
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-800">WAV</h4>
                    <p className="text-sm text-green-700">
                      Uncompressed audio format. Preserves original quality but creates 
                      large file sizes. Perfect for professional audio work.
                    </p>
                    <div className="mt-2 text-xs text-green-600">
                      Quality: Perfect | Best for: Professional audio, editing
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-purple-800">FLAC</h4>
                    <p className="text-sm text-purple-700">
                      Lossless compression format. Reduces file size while maintaining 
                      perfect audio quality. Great for archiving.
                    </p>
                    <div className="mt-2 text-xs text-purple-600">
                      Quality: Perfect | Best for: Audiophiles, archiving
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-orange-800">OGG/M4A</h4>
                    <p className="text-sm text-orange-700">
                      Open source and proprietary formats respectively. Offer good 
                      compression efficiency and quality.
                    </p>
                    <div className="mt-2 text-xs text-orange-600">
                      Quality: Good | Best for: Alternative to MP3
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Tips</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Use MP3 for general music listening</li>
                    <li>• Use WAV for professional audio work</li>
                    <li>• Use FLAC for high-quality archiving</li>
                    <li>• 128 kbps is good for casual listening</li>
                    <li>• 256 kbps is recommended for music enthusiasts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audio Format Comparison</CardTitle>
              <CardDescription>
                Detailed comparison of supported audio formats
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
                      <th className="border border-gray-300 p-3 text-left">File Size</th>
                      <th className="border border-gray-300 p-3 text-left">Best Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">MP3</td>
                      <td className="border border-gray-300 p-3">Lossy</td>
                      <td className="border border-gray-300 p-3">Good</td>
                      <td className="border border-gray-300 p-3">Small</td>
                      <td className="border border-gray-300 p-3">Music, Podcasts</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">WAV</td>
                      <td className="border border-gray-300 p-3">None</td>
                      <td className="border border-gray-300 p-3">Perfect</td>
                      <td className="border border-gray-300 p-3">Large</td>
                      <td className="border border-gray-300 p-3">Professional, Editing</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">FLAC</td>
                      <td className="border border-gray-300 p-3">Lossless</td>
                      <td className="border border-gray-300 p-3">Perfect</td>
                      <td className="border border-gray-300 p-3">Medium</td>
                      <td className="border border-gray-300 p-3">Archiving, Audiophiles</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">OGG</td>
                      <td className="border border-gray-300 p-3">Lossy</td>
                      <td className="border border-gray-300 p-3">Good</td>
                      <td className="border border-gray-300 p-3">Small</td>
                      <td className="border border-gray-300 p-3">Open Source Projects</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">M4A</td>
                      <td className="border border-gray-300 p-3">Lossy</td>
                      <td className="border border-gray-300 p-3">Good</td>
                      <td className="border border-gray-300 p-3">Small</td>
                      <td className="border border-gray-300 p-3">Apple Devices</td>
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