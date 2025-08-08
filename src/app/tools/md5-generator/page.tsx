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

export default function MD5GeneratorTool() {
  const [inputText, setInputText] = useState('')
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [md5Hash, setMd5Hash] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateMD5 = async (text: string) => {
    setIsGenerating(true)
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('MD5', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setMd5Hash(hashHex)
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate MD5 hash",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFileMD5 = async (file: File) => {
    setIsGenerating(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('MD5', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setMd5Hash(hashHex)
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate MD5 hash for file",
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
      generateFileMD5(file)
    }
  }

  const loadSampleText = () => {
    setInputText('Hello, World!')
  }

  const clearAll = () => {
    setInputText('')
    setInputFile(null)
    setMd5Hash('')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">MD5 Generator</h1>
        <p className="text-muted-foreground">
          Generate MD5 hashes for text and files
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text MD5</TabsTrigger>
          <TabsTrigger value="file">File MD5</TabsTrigger>
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
                  Enter text to generate MD5 hash
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
                  onClick={() => generateMD5(inputText)} 
                  disabled={!inputText.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate MD5 Hash'}
                </Button>
              </CardContent>
            </Card>

            {/* Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  MD5 Hash
                </CardTitle>
                <CardDescription>
                  Generated MD5 hash result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>MD5 Hash (32 characters)</Label>
                  <div className="relative">
                    <Input
                      value={md5Hash}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(md5Hash, 'MD5 Hash')}
                      disabled={!md5Hash}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {md5Hash && (
                  <div className="space-y-2">
                    <Label>Hash Properties</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Length</div>
                        <div>32 characters</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Format</div>
                        <div>Hexadecimal</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Algorithm</div>
                        <div>MD5</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-semibold">Security</div>
                        <div>Weak (deprecated)</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Note:</strong> MD5 is cryptographically broken and should not be used for security purposes.</p>
                  <p className="mt-1">Consider using SHA-256 or SHA-3 for secure applications.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Common MD5 Examples</CardTitle>
              <CardDescription>
                See MD5 hashes for common strings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { text: '', md5: 'd41d8cd98f00b204e9800998ecf8427e' },
                  { text: 'a', md5: '0cc175b9c0f1b6a831c399e269772661' },
                  { text: 'abc', md5: '900150983cd24fb0d6963f7d28e17f72' },
                  { text: 'message digest', md5: 'f96b697d7cb7938d525a2f31aaf1618a' },
                  { text: 'abcdefghijklmnopqrstuvwxyz', md5: 'c3fcd3d751a9e6204a5f9141fae5fe30' },
                  { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', md5: 'd174ab98d277d9f5a5641d21e7dcedc0' }
                ].map((example, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="text-sm font-semibold">Text:</div>
                    <div className="text-xs font-mono break-all">
                      {example.text || '(empty string)'}
                    </div>
                    <div className="text-sm font-semibold mt-2">MD5:</div>
                    <div className="text-xs font-mono text-blue-600 break-all">
                      {example.md5}
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
                  Upload a file to generate MD5 hash
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
                        setMd5Hash('')
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
                  File MD5 Hash
                </CardTitle>
                <CardDescription>
                  Generated MD5 hash for the uploaded file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>MD5 Hash</Label>
                  <div className="relative">
                    <Input
                      value={md5Hash}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(md5Hash, 'File MD5 Hash')}
                      disabled={!md5Hash}
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
                  <p><strong>Tip:</strong> MD5 hashes are useful for file integrity verification and duplicate detection.</p>
                  <p className="mt-1">Two identical files will always produce the same MD5 hash.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}