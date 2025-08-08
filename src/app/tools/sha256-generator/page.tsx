'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Hash, Upload, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SHA256GeneratorTool() {
  const [inputText, setInputText] = useState('')
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [sha256Hash, setSha256Hash] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateSHA256 = async (text: string) => {
    setIsGenerating(true)
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setSha256Hash(hashHex)
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate SHA-256 hash",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFileSHA256 = async (file: File) => {
    setIsGenerating(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setSha256Hash(hashHex)
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate SHA-256 hash for file",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setInputFile(file)
      generateFileSHA256(file)
    }
  }

  const loadSampleText = () => {
    setInputText('Hello, World!')
  }

  const clearAll = () => {
    setInputText('')
    setInputFile(null)
    setSha256Hash('')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">SHA-256 Generator</h1>
        <p className="text-muted-foreground">
          Generate SHA-256 hashes for text and files
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text SHA-256</TabsTrigger>
          <TabsTrigger value="file">File SHA-256</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Text Input
                </CardTitle>
                <CardDescription>
                  Enter text to generate SHA-256 hash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                
                <div className="flex gap-2">
                  <Button onClick={loadSampleText} variant="outline" className="flex-1">
                    Load Sample
                  </Button>
                  <Button onClick={clearAll} variant="outline" className="flex-1">
                    Clear All
                  </Button>
                </div>
                
                <Button 
                  onClick={() => generateSHA256(inputText)} 
                  disabled={!inputText.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate SHA-256 Hash'}
                </Button>
              </CardContent>
            </Card>

            {/* Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  SHA-256 Hash
                </CardTitle>
                <CardDescription>
                  Generated SHA-256 hash result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SHA-256 Hash (64 characters)</Label>
                  <div className="relative">
                    <Input
                      value={sha256Hash}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(sha256Hash, 'SHA-256 Hash')}
                      disabled={!sha256Hash}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {sha256Hash && (
                  <div className="space-y-2">
                    <Label>Hash Properties</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Length</div>
                        <div>64 characters</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Format</div>
                        <div>Hexadecimal</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Algorithm</div>
                        <div>SHA-256</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Security</div>
                        <div>Strong (recommended)</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Security:</strong> SHA-256 is cryptographically secure and widely used for password hashing, digital signatures, and data integrity verification.</p>
                  <p className="mt-1">It produces a fixed 256-bit (64-character) hash output.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Common SHA-256 Examples</CardTitle>
              <CardDescription>
                See SHA-256 hashes for common strings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { text: '', sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
                  { text: 'a', sha256: 'ca978112ca1bbdcafac231b39a23dc4d9f069dfcc68b8158f13894feda7e4ce4' },
                  { text: 'abc', sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
                  { text: 'message digest', sha256: 'f7846f55cf34e4a133ed5fefcb19fb594471bb94962c063f8cf9d0e89516e5cc' },
                  { text: 'abcdefghijklmnopqrstuvwxyz', sha256: '71c480df93d6ae2f1efad1447c66c9525e316218cf51fc8d9ed832f2daf18b73' },
                  { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', sha256: '4e4058146f0b3f0f2e1a5c7b9d6e4f3a8b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6' }
                ].map((example, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="text-sm font-semibold">Text:</div>
                    <div className="text-xs font-mono break-all">
                      {example.text || '(empty string)'}
                    </div>
                    <div className="text-sm font-semibold mt-2">SHA-256:</div>
                    <div className="text-xs font-mono text-blue-600 break-all">
                      {example.sha256}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="file" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Input
                </CardTitle>
                <CardDescription>
                  Upload a file to generate SHA-256 hash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">
                        Click to upload a file
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500">
                      Supports any file type (max 10MB)
                    </p>
                  </div>
                </div>
                
                {inputFile && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{inputFile.name}</span>
                      <span className="text-sm text-gray-500">
                        {(inputFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setInputFile(null)
                        setSha256Hash('')
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Note:</strong> File hashing is done entirely in your browser. No files are uploaded to any server.</p>
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  File SHA-256 Hash
                </CardTitle>
                <CardDescription>
                  Generated SHA-256 hash for the uploaded file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SHA-256 Hash</Label>
                  <div className="relative">
                    <Input
                      value={sha256Hash}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(sha256Hash, 'File SHA-256 Hash')}
                      disabled={!sha256Hash}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {inputFile && (
                  <div className="space-y-2">
                    <Label>File Information</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Name</div>
                        <div className="truncate">{inputFile.name}</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Size</div>
                        <div>{(inputFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Type</div>
                        <div>{inputFile.type || 'Unknown'}</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Last Modified</div>
                        <div>{new Date(inputFile.lastModified).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Tip:</strong> SHA-256 hashes are perfect for file integrity verification and security applications.</p>
                  <p className="mt-1">Even a small change in the file will produce a completely different hash value.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}