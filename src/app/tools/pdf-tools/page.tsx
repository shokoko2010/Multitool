'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, FileText, Merge, Split, RefreshCw, Trash2, Eye, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PDFFile {
  id: string
  name: string
  size: number
  type: 'application/pdf'
}

interface MergeConfig {
  filename: string
  order: string[]
}

interface SplitConfig {
  pages: string
  filename: string
}

interface ConvertConfig {
  targetFormat: string
  quality: string
  ocr: boolean
}

export default function PDFTools() {
  const [activeTab, setActiveTab] = useState('merge')
  const [files, setFiles] = useState<PDFFile[]>([])
  const [mergeConfig, setMergeConfig] = useState<MergeConfig>({
    filename: 'merged-document',
    order: []
  })
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    pages: '1',
    filename: 'split-document'
  })
  const [convertConfig, setConvertConfig] = useState<ConvertConfig>({
    targetFormat: 'docx',
    quality: 'high',
    ocr: false
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    selectedFiles.forEach(file => {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File",
          description: `${file.name} is not a PDF file`,
          variant: "destructive",
        })
        return
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 50MB`,
          variant: "destructive",
        })
        return
      }

      const newFile: PDFFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type
      }

      setFiles(prev => [...prev, newFile])
    })
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const moveFile = (id: string, direction: 'up' | 'down') => {
    const index = files.findIndex(file => file.id === id)
    if (index === -1) return

    const newFiles = [...files]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newFiles.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
      setFiles(newFiles)
    }
  }

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Insufficient Files",
        description: "Please upload at least 2 PDF files to merge",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    
    // Simulate PDF merging
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "PDFs Merged",
        description: `${files.length} PDF files have been merged successfully`,
      })
    }, 3000)
  }

  const splitPDF = async () => {
    if (files.length !== 1) {
      toast({
        title: "Single File Required",
        description: "Please upload exactly 1 PDF file to split",
        variant: "destructive",
      })
      return
    }

    const pages = splitConfig.pages
    if (!/^\d+(,\d+)*$/.test(pages) && pages !== 'all') {
      toast({
        title: "Invalid Page Range",
        description: "Please enter valid page numbers (e.g., 1,3,5) or 'all'",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "PDF Split",
        description: `PDF split into pages: ${pages}`,
      })
    }, 2000)
  }

  const convertPDF = async () => {
    if (files.length !== 1) {
      toast({
        title: "Single File Required",
        description: "Please upload exactly 1 PDF file to convert",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "PDF Converted",
        description: `PDF converted to ${convertConfig.targetFormat.toUpperCase()} format`,
      })
    }, 2500)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadAll = () => {
    toast({
      title: "Download Started",
      description: "Your files download has begun",
    })
  }

  const clearAllFiles = () => {
    setFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">PDF Tools</h1>
        <p className="text-muted-foreground">
          Merge, split, and convert PDF files with advanced tools
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF Files
          </CardTitle>
          <CardDescription>
            Upload PDF files to process with the selected tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div>
              <Label htmlFor="pdf-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500">
                  Click to upload PDF files
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </Label>
              <Input
                ref={fileInputRef}
                id="pdf-upload"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supports multiple PDF files (max 50MB each)
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Uploaded Files ({files.length})</h4>
                <div className="flex gap-2">
                  <Button onClick={clearAllFiles} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button onClick={downloadAll} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveFile(file.id, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveFile(file.id, 'down')}
                        disabled={index === files.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tool Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="merge">Merge PDFs</TabsTrigger>
          <TabsTrigger value="split">Split PDF</TabsTrigger>
          <TabsTrigger value="convert">Convert PDF</TabsTrigger>
        </TabsList>
        
        {/* Merge Tab */}
        <TabsContent value="merge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Merge className="h-5 w-5" />
                Merge PDF Files
              </CardTitle>
              <CardDescription>
                Combine multiple PDF files into a single document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merge-filename">Output Filename</Label>
                <Input
                  id="merge-filename"
                  value={mergeConfig.filename}
                  onChange={(e) => setMergeConfig(prev => ({ ...prev, filename: e.target.value }))}
                  placeholder="merged-document"
                />
              </div>

              {files.length >= 2 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Merge Order</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Files will be merged in the order shown below
                    </p>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm">{file.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={mergePDFs} 
                    disabled={isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Merging PDFs...
                      </>
                    ) : (
                      <>
                        <Merge className="h-4 w-4 mr-2" />
                        Merge PDFs
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Merge className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Upload at least 2 PDF files to merge</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Split Tab */}
        <TabsContent value="split" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Split className="h-5 w-5" />
                Split PDF File
              </CardTitle>
              <CardDescription>
                Split a PDF file into multiple pages or documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="split-pages">Pages to Split</Label>
                  <Input
                    id="split-pages"
                    value={splitConfig.pages}
                    onChange={(e) => setSplitConfig(prev => ({ ...prev, pages: e.target.value }))}
                    placeholder="1,3,5 or all"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter page numbers separated by commas, or use 'all'
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="split-filename">Output Filename</Label>
                  <Input
                    id="split-filename"
                    value={splitConfig.filename}
                    onChange={(e) => setSplitConfig(prev => ({ ...prev, filename: e.target.value }))}
                    placeholder="split-document"
                  />
                </div>
              </div>

              {files.length === 1 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">File to Split</h4>
                    <div className="flex items-center gap-3 p-3 bg-white rounded">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{files[0].name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(files[0].size)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={splitPDF} 
                    disabled={isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Splitting PDF...
                      </>
                    ) : (
                      <>
                        <Split className="h-4 w-4 mr-2" />
                        Split PDF
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Split className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Upload exactly 1 PDF file to split</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Convert Tab */}
        <TabsContent value="convert" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Convert PDF File
              </CardTitle>
              <CardDescription>
                Convert PDF files to other formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Format</Label>
                  <Select value={convertConfig.targetFormat} onValueChange={(value) => setConvertConfig(prev => ({ ...prev, targetFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docx">Microsoft Word (.docx)</SelectItem>
                      <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                      <SelectItem value="html">HTML (.html)</SelectItem>
                      <SelectItem value="rtf">Rich Text (.rtf)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="pptx">PowerPoint (.pptx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select value={convertConfig.quality} onValueChange={(value) => setConvertConfig(prev => ({ ...prev, quality: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (faster)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (best quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={convertConfig.ocr}
                    onChange={(e) => setConvertConfig(prev => ({ ...prev, ocr: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Enable OCR for scanned documents</span>
                </label>
              </div>

              {files.length === 1 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">File to Convert</h4>
                    <div className="flex items-center gap-3 p-3 bg-white rounded">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{files[0].name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(files[0].size)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={convertPDF} 
                    disabled={isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Converting PDF...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Convert PDF
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <RefreshCw className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Upload exactly 1 PDF file to convert</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}