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
  FileText, 
  Settings, 
  ArrowUpDown,
  Trash2,
  Plus,
  MoveUp,
  MoveDown,
  Eye,
  Loader2
} from 'lucide-react'

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages: number
  order: number
  preview?: string
}

interface MergeSettings {
  outputFileName: string
  pageOrder: 'original' | 'reverse' | 'custom'
  includePageNumbers: boolean
  compressOutput: boolean
  quality: number
}

export default function PDFMerger() {
  const [selectedFiles, setSelectedFiles] = useState<PDFFile[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('merge')
  const [showPreviews, setShowPreviews] = useState(false)
  
  const [settings, setSettings] = useState<MergeSettings>({
    outputFileName: 'merged_document.pdf',
    pageOrder: 'original',
    includePageNumbers: false,
    compressOutput: false,
    quality: 90
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== files.length) {
      setError('Some files were not PDFs and were skipped')
    }

    const newFiles: PDFFile[] = pdfFiles.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      pages: Math.floor(Math.random() * 50) + 1, // Simulated page count
      order: selectedFiles.length + index
    }))

    setSelectedFiles(prev => [...prev, ...newFiles])
    
    if (pdfFiles.length > 0) {
      setError(null)
    }
  }

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id))
  }

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setSelectedFiles(prev => {
      const files = [...prev]
      const index = files.findIndex(f => f.id === id)
      
      if (index === -1) return files
      
      if (direction === 'up' && index > 0) {
        [files[index - 1], files[index]] = [files[index], files[index - 1]]
      } else if (direction === 'down' && index < files.length - 1) {
        [files[index], files[index + 1]] = [files[index + 1], files[index]]
      }
      
      return files.map((file, i) => ({ ...file, order: i }))
    })
  }

  const mergePDFs = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one PDF file')
      return
    }

    setIsMerging(true)
    setError(null)

    try {
      // Simulate PDF merging
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a mock merged PDF URL
      const mockPdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' })
      const url = URL.createObjectURL(mockPdfBlob)
      setMergedPdfUrl(url)
    } catch (error) {
      setError('Failed to merge PDFs. Please try again.')
    } finally {
      setIsMerging(false)
    }
  }

  const downloadMergedPDF = () => {
    if (!mergedPdfUrl) return

    const link = document.createElement('a')
    link.href = mergedPdfUrl
    link.download = settings.outputFileName
    link.click()
  }

  const resetAll = () => {
    setSelectedFiles([])
    setMergedPdfUrl('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateSetting = (key: keyof MergeSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0)
  }

  const getTotalPages = () => {
    return selectedFiles.reduce((total, file) => total + file.pages, 0)
  }

  const getEstimatedSize = () => {
    const baseSize = getTotalSize()
    const compressionRatio = settings.compressOutput ? settings.quality / 100 : 1
    return baseSize * compressionRatio
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            PDF Merger
          </CardTitle>
          <CardDescription>
            Merge multiple PDF files into a single document with customizable options
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
              <TabsTrigger value="merge">Merge</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="merge" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="files">Select PDF Files</Label>
                    <div className="flex gap-2">
                      <Input
                        id="files"
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Add PDF Files
                      </Button>
                      {selectedFiles.length > 0 && (
                        <Button variant="outline" onClick={resetAll}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      {selectedFiles.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No PDF files selected</p>
                          <p className="text-sm">Add PDF files to merge them together</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {selectedFiles.map((file, index) => (
                            <div key={file.id} className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{file.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)} • {file.pages} pages
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveFile(file.id, 'up')}
                                  disabled={index === 0}
                                >
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveFile(file.id, 'down')}
                                  disabled={index === selectedFiles.length - 1}
                                >
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={mergePDFs} 
                      disabled={selectedFiles.length === 0 || isMerging}
                      className="flex-1"
                    >
                      {isMerging ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Merging...
                        </>
                      ) : (
                        <>
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          Merge PDFs
                        </>
                      )}
                    </Button>
                    
                    {mergedPdfUrl && (
                      <Button variant="outline" onClick={downloadMergedPDF}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {selectedFiles.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{selectedFiles.length}</div>
                            <div className="text-sm text-muted-foreground">Files</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{getTotalPages()}</div>
                            <div className="text-sm text-muted-foreground">Total Pages</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {formatFileSize(getTotalSize())}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Size</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Merge Preview</Label>
                    <div className="border rounded-lg p-4 bg-muted">
                      {selectedFiles.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Add PDF files to see merge preview</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Merge Order:</div>
                          <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={file.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                                <Badge variant="outline" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <FileText className="h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium truncate">{file.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Page {index === 0 ? 1 : selectedFiles.slice(0, index).reduce((sum, f) => sum + f.pages, 0) + 1} - {selectedFiles.slice(0, index + 1).reduce((sum, f) => sum + f.pages, 0)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 border-t">
                            <div className="text-sm text-muted-foreground">
                              Final document will have {getTotalPages()} pages
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {mergedPdfUrl && (
                    <div className="space-y-2">
                      <Label>Merged Document</Label>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{settings.outputFileName}</div>
                              <div className="text-sm text-muted-foreground">
                                {getTotalPages()} pages • {formatFileSize(getEstimatedSize())}
                              </div>
                            </div>
                            <Button onClick={downloadMergedPDF}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Tips</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Drag files to reorder them before merging</p>
                      <p>• The merge order determines the final page order</p>
                      <p>• Large files may take longer to process</p>
                      <p>• Use compression settings to reduce file size</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="outputFileName">Output File Name</Label>
                    <Input
                      id="outputFileName"
                      value={settings.outputFileName}
                      onChange={(e) => updateSetting('outputFileName', e.target.value)}
                      placeholder="merged_document.pdf"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pageOrder">Page Order</Label>
                    <select
                      id="pageOrder"
                      value={settings.pageOrder}
                      onChange={(e) => updateSetting('pageOrder', e.target.value as any)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="original">Keep Original Order</option>
                      <option value="reverse">Reverse Order</option>
                      <option value="custom">Custom Order (use drag & drop)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label>Options</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.includePageNumbers}
                          onChange={(e) => updateSetting('includePageNumbers', e.target.checked)}
                        />
                        <span className="text-sm">Include Page Numbers</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.compressOutput}
                          onChange={(e) => updateSetting('compressOutput', e.target.checked)}
                        />
                        <span className="text-sm">Compress Output</span>
                      </label>
                    </div>
                  </div>

                  {settings.compressOutput && (
                    <div className="space-y-2">
                      <Label htmlFor="quality">Compression Quality: {settings.quality}%</Label>
                      <input
                        id="quality"
                        type="range"
                        min="10"
                        max="100"
                        value={settings.quality}
                        onChange={(e) => updateSetting('quality', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('outputFileName', 'merged_document.pdf')
                          updateSetting('pageOrder', 'original')
                          updateSetting('includePageNumbers', false)
                          updateSetting('compressOutput', false)
                        }}
                      >
                        Reset Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('compressOutput', true)
                          updateSetting('quality', 80)
                        }}
                      >
                        Optimize for Size
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('compressOutput', false)
                          updateSetting('quality', 100)
                        }}
                      >
                        Maximum Quality
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSetting('includePageNumbers', true)
                          updateSetting('pageOrder', 'original')
                        }}
                      >
                        Document Style
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Output</Label>
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">File Name:</span>
                            <div className="font-medium">{settings.outputFileName}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estimated Size:</span>
                            <div className="font-medium">{formatFileSize(getEstimatedSize())}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Pages:</span>
                            <div className="font-medium">{getTotalPages()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Compression:</span>
                            <div className="font-medium">
                              {settings.compressOutput ? `${settings.quality}%` : 'None'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label>Information</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Page numbers are added as footers</p>
                      <p>• Compression reduces file size but may affect quality</p>
                      <p>• Custom order requires manual arrangement in the merge tab</p>
                      <p>• Large documents may take longer to process</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Document Preview</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreviews(!showPreviews)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreviews ? 'Hide Previews' : 'Show Previews'}
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  {selectedFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No PDF files selected</p>
                      <p className="text-sm text-muted-foreground">Add PDF files to see preview</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">
                        Merge Structure ({selectedFiles.length} files, {getTotalPages()} pages)
                      </div>
                      
                      {showPreviews ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedFiles.map((file, index) => (
                            <Card key={file.id} className="overflow-hidden">
                              <CardContent className="p-3">
                                <div className="aspect-[3/4] bg-muted rounded mb-2 flex items-center justify-center">
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium truncate">{file.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {file.pages} pages • {formatFileSize(file.size)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Position {index + 1} of {selectedFiles.length}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={file.id} className="flex items-center gap-3 p-3 border rounded">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              <FileText className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{file.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {file.pages} pages
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Final document: {settings.outputFileName} ({getTotalPages()} pages, {formatFileSize(getEstimatedSize())})
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}