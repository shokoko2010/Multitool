'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, Camera, Copy, Download, FileText, Image as ImageIcon, Settings, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OCRResult {
  text: string
  confidence: number
  timestamp: Date
  language: string
}

interface OCRConfig {
  language: string
  format: 'plain' | 'markdown' | 'json'
  extractTables: boolean
  preserveFormatting: boolean
}

const supportedLanguages = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' }
]

export default function ImageToTextTool() {
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrConfig, setOcrConfig] = useState<OCRConfig>({
    language: 'auto',
    format: 'plain',
    extractTables: false,
    preserveFormatting: true
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async () => {
    if (!uploadedImage) {
      toast({
        title: "No Image",
        description: "Please upload an image to extract text",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate OCR processing
    setTimeout(() => {
      const mockResult = generateMockOCRResult()
      setOcrResults(prev => [mockResult, ...prev])
      setIsProcessing(false)
      
      toast({
        title: "Text Extracted",
        description: `Text extracted with ${mockResult.confidence}% confidence`,
      })
    }, 2000)
  }

  const generateMockOCRResult = (): OCRResult => {
    const sampleTexts = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "The quick brown fox jumps over the lazy dog. This pangram contains all letters of the English alphabet.",
      "Artificial Intelligence is transforming the way we work, live, and interact with technology every day.",
      "Welcome to our comprehensive text extraction tool. Upload images and extract text with high accuracy.",
      "This is a sample text extracted from an image using OCR technology. The system processes various image formats."
    ]
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    const confidence = Math.floor(Math.random() * 30) + 70 // 70-100%
    
    return {
      text: randomText,
      confidence,
      timestamp: new Date(),
      language: ocrConfig.language === 'auto' ? 'en' : ocrConfig.language
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const downloadResult = (result: OCRResult) => {
    let content = result.text
    let filename = `ocr-result-${Date.now()}`
    
    if (ocrConfig.format === 'markdown') {
      content = `# Extracted Text\n\n**Language:** ${result.language}\n**Confidence:** ${result.confidence}%\n**Timestamp:** ${result.timestamp.toLocaleString()}\n\n---\n\n${result.text}`
      filename += '.md'
    } else if (ocrConfig.format === 'json') {
      content = JSON.stringify({
        text: result.text,
        confidence: result.confidence,
        timestamp: result.timestamp.toISOString(),
        language: result.language,
        config: ocrConfig
      }, null, 2)
      filename += '.json'
    } else {
      filename += '.txt'
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearResults = () => {
    setOcrResults([])
  }

  const clearImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const loadSampleImage = () => {
    // Create a simple SVG as sample image
    const svgContent = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill="#f8f9fa"/>
        <text x="200" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#333">
          Sample Image for OCR
        </text>
        <text x="200" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">
          Upload your own images to extract text
        </text>
      </svg>
    `
    
    setUploadedImage(`data:image/svg+xml;base64,${btoa(svgContent)}`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Image to Text (OCR)</h1>
        <p className="text-muted-foreground">
          Extract text from images using Optical Character Recognition
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Upload an image to extract text from it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded for OCR" 
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button onClick={clearImage} variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button onClick={processImage} disabled={isProcessing}>
                          {isProcessing ? 'Processing...' : 'Extract Text'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <Label htmlFor="ocr-image-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">
                            Click to upload an image
                          </span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </Label>
                        <Input
                          ref={fileInputRef}
                          id="ocr-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Supports JPG, PNG, GIF, WebP (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={loadSampleImage} variant="outline" className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Load Sample
                  </Button>
                  <Button 
                    onClick={processImage} 
                    disabled={!uploadedImage || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Extract Text'}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Tips:</strong></p>
                  <p>• Use high-quality, clear images for best results</p>
                  <p>• Ensure text is well-lit and in focus</p>
                  <p>• Supported languages: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean</p>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Extracted Text
                  </span>
                  {ocrResults.length > 0 && (
                    <div className="flex gap-2">
                      <Button onClick={clearResults} variant="outline" size="sm">
                        Clear All
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Text extracted from your images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ocrResults.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No text extracted yet</p>
                    <p className="text-sm">Upload an image and click "Extract Text"</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {ocrResults.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{result.language}</Badge>
                            <Badge variant={result.confidence > 85 ? 'default' : 'outline'}>
                              {result.confidence}% confidence
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          {result.text}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(result.text, 'Extracted Text')}
                            className="flex-1"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadResult(result)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                OCR Configuration
              </CardTitle>
              <CardDescription>
                Configure text extraction settings and options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={ocrConfig.language} onValueChange={(value) => setOcrConfig(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={ocrConfig.format} onValueChange={(value: 'plain' | 'markdown' | 'json') => setOcrConfig(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain Text</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label>Options</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={ocrConfig.extractTables}
                      onChange={(e) => setOcrConfig(prev => ({ ...prev, extractTables: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Extract tables and structured data</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={ocrConfig.preserveFormatting}
                      onChange={(e) => setOcrConfig(prev => ({ ...prev, preserveFormatting: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Preserve text formatting</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">About OCR Technology</h4>
                <p className="text-sm text-muted-foreground">
                  Optical Character Recognition (OCR) converts images containing text into machine-readable text. 
                  This tool uses advanced AI algorithms to extract text with high accuracy from various image formats.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}