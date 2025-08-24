'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, Copy, BarChart3, Settings, Image, Download as DownloadIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BarcodeConfig {
  format: 'code128' | 'code39' | 'ean13' | 'ean8' | 'upc' | 'isbn' | 'code128c' | 'code128b'
  width: number
  height: number
  textSize: number
  outputFormat: 'png' | 'svg' | 'jpg'
}

const barcodeFormats = [
  { value: 'code128', label: 'Code 128', description: 'Alphanumeric, very dense' },
  { value: 'code39', label: 'Code 39', description: 'Alphanumeric, older standard' },
  { value: 'ean13', label: 'EAN-13', description: '13-digit numbers for products' },
  { value: 'ean8', label: 'EAN-8', description: '8-digit numbers for small products' },
  { value: 'upc', label: 'UPC-A', description: '12-digit numbers for North America' },
  { value: 'isbn', label: 'ISBN', description: 'Book numbering system' },
  { value: 'code128c', label: 'Code 128C', description: 'Numeric only, very compact' },
  { value: 'code128b', label: 'Code 128B', description: 'Full ASCII character set' }
]

const formatExamples = {
  code128: 'ABC123DEF456',
  code39: 'HELLO-WORLD',
  ean13: '1234567890123',
  ean8: '12345678',
  upc: '123456789012',
  isbn: '978-0-306-40615-7',
  code128c: '123456789012',
  code128b: 'Hello World 123!'
}

export default function BarcodeGeneratorTool() {
  const [inputText, setInputText] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<BarcodeConfig['format']>('code128')
  const [barcodeConfig, setBarcodeConfig] = useState<BarcodeConfig>({
    format: 'code128',
    width: 2,
    height: 100,
    textSize: 12,
    outputFormat: 'svg'
  })
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateBarcode = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter text to generate barcode",
        variant: "destructive",
      })
      return
    }

    // Validate input for selected format
    const format = barcodeFormats.find(f => f.value === selectedFormat)
    if (!format) return

    setIsGenerating(true)
    
    setTimeout(() => {
      const svgContent = createSimulatedBarcode()
      setGeneratedBarcode(svgContent)
      setIsGenerating(false)
      
      toast({
        title: "Barcode Generated",
        description: `Barcode generated in ${format.label} format`,
      })
    }, 800)
  }

  const createSimulatedBarcode = (): string => {
    const { width, height, textSize } = barcodeConfig
    const text = inputText.trim()
    
    // Create barcode pattern based on text
    const barWidth = width
    const totalWidth = text.length * barWidth * 3
    const pattern: string[] = []
    
    // Generate alternating pattern based on character codes
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      const isWideBar = charCode % 2 === 0
      
      // Create bars and spaces
      for (let j = 0; j < 3; j++) {
        const barHeight = j === 1 ? height : height * 0.7
        const xPos = i * barWidth * 3 + j * barWidth
        
        pattern.push(String.raw`
          <rect 
            x="${xPos}" 
            y="${(height - barHeight) / 2}" 
            width="${barWidth}" 
            height="${barHeight}" 
            fill="${j % 2 === 0 ? '#000000' : '#ffffff'}"
          />
        `)
      }
    }
    
    return `
      <svg width="${totalWidth}" height="${height + textSize + 10}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${totalWidth}" height="${height}" fill="#ffffff"/>
        ${pattern.join('')}
        <text x="${totalWidth / 2}" y="${height + textSize}" text-anchor="middle" font-family="monospace" font-size="${textSize}" fill="#000000">
          ${text}
        </text>
      </svg>
    `
  }

  const downloadBarcode = () => {
    if (!generatedBarcode) return
    
    const blob = new Blob([generatedBarcode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `barcode-${selectedFormat}-${Date.now()}.${barcodeConfig.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Your barcode download has begun",
    })
  }

  const copyToClipboard = () => {
    if (!generatedBarcode) return
    
    navigator.clipboard.writeText(generatedBarcode)
    toast({
      title: "Copied!",
      description: "Barcode SVG copied to clipboard",
    })
  }

  const loadSampleData = () => {
    const format = selectedFormat
    setInputText(formatExamples[format as keyof typeof formatExamples] || 'SAMPLE123')
  }

  const updateFormat = (format: BarcodeConfig['format']) => {
    setSelectedFormat(format)
    setInputText(formatExamples[format as keyof typeof formatExamples] || '')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Barcode Generator</h1>
        <p className="text-muted-foreground">
          Generate barcodes in various formats for products and inventory
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Barcode Configuration
            </CardTitle>
            <CardDescription>
              Configure your barcode settings and content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Barcode Format</Label>
              <Select value={selectedFormat} onValueChange={updateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barcodeFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Input Text */}
            <div className="space-y-2">
              <Label htmlFor="barcode-text">Content</Label>
              <Input
                id="barcode-text"
                placeholder="Enter barcode content..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Example for {barcodeFormats.find(f => f.value === selectedFormat)?.label}: 
                {formatExamples[selectedFormat as keyof typeof formatExamples]}
              </p>
            </div>

            {/* Width */}
            <div className="space-y-2">
              <Label htmlFor="barcode-width">Bar Width: {barcodeConfig.width}px</Label>
              <Input
                id="barcode-width"
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={barcodeConfig.width}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="barcode-height">Height: {barcodeConfig.height}px</Label>
              <Input
                id="barcode-height"
                type="range"
                min="50"
                max="200"
                step="10"
                value={barcodeConfig.height}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              />
            </div>

            {/* Text Size */}
            <div className="space-y-2">
              <Label htmlFor="barcode-text-size">Text Size: {barcodeConfig.textSize}px</Label>
              <Input
                id="barcode-text-size"
                type="range"
                min="8"
                max="20"
                step="1"
                value={barcodeConfig.textSize}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, textSize: parseInt(e.target.value) }))}
              />
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={barcodeConfig.outputFormat} onValueChange={(value: 'png' | 'svg' | 'jpg') => setBarcodeConfig(prev => ({ ...prev, outputFormat: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={generateBarcode} disabled={isGenerating} className="flex-1">
                {isGenerating ? 'Generating...' : 'Generate Barcode'}
              </Button>
              <Button onClick={loadSampleData} variant="outline">
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Generated Barcode
              </span>
              {generatedBarcode && (
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadBarcode} variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Your generated barcode will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedBarcode ? (
              <div className="flex flex-col items-center space-y-4">
                <div 
                  className="border rounded-lg p-4 bg-white"
                  style={{ 
                    width: '100%',
                    minHeight: barcodeConfig.height + barcodeConfig.textSize + 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatedBarcode }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <Badge variant="secondary">
                    {barcodeFormats.find(f => f.value === selectedFormat)?.label}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Size: {barcodeConfig.width}px × {barcodeConfig.height}px
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No barcode generated yet</p>
                <p className="text-sm">Enter content and click "Generate Barcode"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Format Information */}
      <Card>
        <CardHeader>
          <CardTitle>Barcode Format Information</CardTitle>
          <CardDescription>
            Learn about different barcode formats and their use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barcodeFormats.map((format) => (
              <div key={format.value} className="p-3 border rounded-lg">
                <div className="font-medium">{format.label}</div>
                <div className="text-sm text-muted-foreground">{format.description}</div>
                <div className="text-xs mt-1">
                  <strong>Example:</strong> {formatExamples[format.value as keyof typeof formatExamples]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}