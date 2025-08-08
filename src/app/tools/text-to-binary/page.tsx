'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RefreshCw, FileText, Binary, Settings, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BinaryConfig {
  separator: 'space' | 'newline' | 'none'
  bits: '8' | '16' | '32'
  case: 'upper' | 'lower'
  includeAscii: boolean
  groupSize: number
}

export default function TextToBinaryTool() {
  const [textInput, setTextInput] = useState('')
  const [binaryOutput, setBinaryOutput] = useState('')
  const [binaryConfig, setBinaryConfig] = useState<BinaryConfig>({
    separator: 'space',
    bits: '8',
    case: 'upper',
    includeAscii: true,
    groupSize: 8
  })
  const [isConverting, setIsConverting] = useState(false)
  const [activeTab, setActiveTab] = useState('text-to-binary')
  const { toast } = useToast()

  const textToBinary = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter text to convert to binary",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    setTimeout(() => {
      const binary = simulateTextToBinaryConversion()
      setBinaryOutput(binary)
      setIsConverting(false)
      
      toast({
        title: "Conversion Complete",
        description: "Text successfully converted to binary",
      })
    }, 500)
  }

  const simulateTextToBinaryConversion = (): string => {
    const text = textInput.trim()
    const { separator, bits, case: letterCase, includeAscii, groupSize } = binaryConfig
    
    let binaryResult = ''
    let asciiResult = ''
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const charCode = char.charCodeAt(0)
      
      // Convert to binary with specified bit length
      let binary = charCode.toString(2).padStart(parseInt(bits), '0')
      
      // Apply case preference
      if (letterCase === 'lower') {
        binary = binary.toLowerCase()
      }
      
      // Group bits
      if (groupSize > 0) {
        const grouped = binary.match(new RegExp(`.{1,${groupSize}}`, 'g')) || [binary]
        binary = grouped.join(' ')
      }
      
      if (i > 0) {
        binaryResult += separator === 'newline' ? '\n' : ' '
      }
      binaryResult += binary
      
      if (includeAscii) {
        asciiResult += `${char}(${charCode}) `
      }
    }
    
    return includeAscii ? `${binaryResult}\n\nASCII Values:\n${asciiResult.trim()}` : binaryResult
  }

  const binaryToText = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter binary to convert to text",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    setTimeout(() => {
      const text = simulateBinaryToTextConversion()
      setBinaryOutput(text)
      setIsConverting(false)
      
      toast({
        title: "Conversion Complete",
        description: "Binary successfully converted to text",
      })
    }, 500)
  }

  const simulateBinaryToTextConversion = (): string => {
    const binary = textInput.trim()
    
    // Remove separators
    const cleanBinary = binary.replace(/[\s\n]/g, '')
    
    // Validate binary
    if (!/^[01]+$/.test(cleanBinary)) {
      return 'Invalid binary input. Please use only 0s and 1s.'
    }
    
    let result = ''
    
    // Split into bytes (8 bits)
    for (let i = 0; i < cleanBinary.length; i += 8) {
      const byte = cleanBinary.substr(i, 8)
      
      // Pad last byte if necessary
      const paddedByte = byte.padEnd(8, '0')
      
      // Convert to decimal and then to character
      const decimal = parseInt(paddedByte, 2)
      result += String.fromCharCode(decimal)
    }
    
    return result
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const downloadOutput = () => {
    if (!binaryOutput) return
    
    const content = activeTab === 'text-to-binary' ? binaryOutput : textInput
    const filename = `${activeTab === 'text-to-binary' ? 'binary' : 'text'}-${Date.now()}.txt`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Your file download has begun",
    })
  }

  const loadSampleText = () => {
    const sampleText = "Hello, World! 123"
    setTextInput(sampleText)
  }

  const loadSampleBinary = () => {
    const sampleBinary = "01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001 00100000 00110001 00110010 00110011"
    setTextInput(sampleBinary)
  }

  const clearAll = () => {
    setTextInput('')
    setBinaryOutput('')
  }

  const updateConfig = (key: keyof BinaryConfig, value: any) => {
    setBinaryConfig(prev => ({ ...prev, [key]: value }))
  }

  const convert = () => {
    if (activeTab === 'text-to-binary') {
      textToBinary()
    } else {
      binaryToText()
    }
  }

  const getStats = () => {
    if (activeTab === 'text-to-binary' && textInput) {
      const charCount = textInput.length
      const binaryLength = textInput.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0).toString(2).length
      }, 0)
      return `${charCount} characters • ~${binaryLength} bits`
    } else if (activeTab === 'binary-to-text' && textInput) {
      const binaryLength = textInput.replace(/[\s\n]/g, '').length
      const charCount = Math.floor(binaryLength / 8)
      return `${binaryLength} bits • ~${charCount} characters`
    }
    return ''
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Text & Binary Converter</h1>
        <p className="text-muted-foreground">
          Convert between text and binary formats with customizable options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input
            </CardTitle>
            <CardDescription>
              {activeTab === 'text-to-binary' 
                ? "Enter text to convert to binary" 
                : "Enter binary to convert to text"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">
                {activeTab === 'text-to-binary' ? 'Text Content' : 'Binary Content'}
              </Label>
              <Textarea
                id="text-input"
                placeholder={activeTab === 'text-to-binary' 
                  ? "Enter your text here..." 
                  : "Enter binary (0s and 1s) here..."
                }
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {getStats()}
              </div>
              <div className="flex gap-2">
                <Button onClick={activeTab === 'text-to-binary' ? loadSampleText : loadSampleBinary} variant="outline" size="sm">
                  Load Sample
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Binary className="h-5 w-5" />
                {activeTab === 'text-to-binary' ? 'Binary Output' : 'Text Output'}
              </span>
              {binaryOutput && (
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(binaryOutput, activeTab === 'text-to-binary' ? 'Binary' : 'Text')} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadOutput} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {activeTab === 'text-to-binary' 
                ? "Your binary representation will appear here" 
                : "Your converted text will appear here"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {binaryOutput ? (
              <div className="space-y-4">
                <Textarea
                  value={binaryOutput}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="text-center">
                  <Badge variant="secondary">
                    {binaryOutput.length} characters
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Binary className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No output yet</p>
                <p className="text-sm">Enter content and click "Convert"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      {activeTab === 'text-to-binary' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Binary Configuration
            </CardTitle>
            <CardDescription>
              Customize how text is converted to binary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Bit Length</Label>
                <Select value={binaryConfig.bits} onValueChange={(value) => updateConfig('bits', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8-bit (ASCII)</SelectItem>
                    <SelectItem value="16">16-bit (Unicode)</SelectItem>
                    <SelectItem value="32">32-bit (Extended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Separator</Label>
                <Select value={binaryConfig.separator} onValueChange={(value) => updateConfig('separator', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="space">Space</SelectItem>
                    <SelectItem value="newline">Newline</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Case</Label>
                <Select value={binaryConfig.case} onValueChange={(value) => updateConfig('case', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upper">Uppercase</SelectItem>
                    <SelectItem value="lower">Lowercase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Group Size</Label>
                <Select value={binaryConfig.groupSize.toString()} onValueChange={(value) => updateConfig('groupSize', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 bits</SelectItem>
                    <SelectItem value="8">8 bits</SelectItem>
                    <SelectItem value="16">16 bits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={binaryConfig.includeAscii}
                    onChange={(e) => updateConfig('includeAscii', e.target.checked)}
                    className="rounded"
                  />
                  <span>Include ASCII values</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Binary Conversion Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <Badge variant="outline">ASCII support</Badge>
                <Badge variant="outline">Unicode</Badge>
                <Badge variant="outline">Custom formatting</Badge>
                <Badge variant="outline">ASCII values</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Controls</CardTitle>
          <CardDescription>
            Switch between text-to-binary and binary-to-text conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text-to-binary">Text to Binary</TabsTrigger>
              <TabsTrigger value="binary-to-text">Binary to Text</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex justify-center">
            <Button onClick={convert} disabled={isConverting || !textInput.trim()} size="lg">
              {isConverting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Binary className="h-4 w-4 mr-2" />
                  Convert
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}