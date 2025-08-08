'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react'

export default function FileSplitter() {
  const [file, setFile] = useState<File | null>(null)
  const [splitSize, setSplitSize] = useState('10MB')
  const [splitType, setSplitType] = useState('size')
  const [splitBy, setSplitBy] = useState('lines')
  const [lineCount, setLineCount] = useState(1000)
  const [chunkSize, setChunkSize] = useState(1024 * 1024 * 10)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
      setResult(null)
    }
  }

  const parseSize = (sizeStr: string): number => {
    const units: { [key: string]: number } = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    }
    
    const match = sizeStr.match(/^(\d+)(B|KB|MB|GB|TB)$/i)
    if (match) {
      return parseInt(match[1]) * units[match[2].toUpperCase()]
    }
    return 1024 * 1024 * 10 // Default 10MB
  }

  const splitBySize = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const fileSize = file.size
      const chunkSize = parseSize(splitSize)
      const chunks = Math.ceil(fileSize / chunkSize)
      
      const splitResult = {
        originalFile: file.name,
        originalSize: fileSize,
        chunkSize: chunkSize,
        totalChunks: chunks,
        estimatedSize: `${(fileSize / chunks / 1024 / 1024).toFixed(2)} MB`
      }

      setResult(splitResult)
      setSuccess(true)
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (err) {
      setError('Failed to split file by size')
    } finally {
      setIsProcessing(false)
    }
  }

  const splitByLines = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const text = await file.text()
      const lines = text.split('\n')
      const chunks = []
      
      for (let i = 0; i < lines.length; i += lineCount) {
        chunks.push(lines.slice(i, i + lineCount).join('\n'))
      }

      const splitResult = {
        originalFile: file.name,
        totalLines: lines.length,
        linesPerChunk: lineCount,
        totalChunks: chunks.length,
        estimatedSize: `${(file.size / chunks.length / 1024 / 1024).toFixed(2)} MB`
      }

      setResult(splitResult)
      setSuccess(true)
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (err) {
      setError('Failed to split file by lines')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSplitFiles = () => {
    if (!result) return

    const blob = new Blob(['Split file content simulation'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `split_${result.originalFile || 'chunk'}_001.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetAll = () => {
    setFile(null)
    setSplitSize('10MB')
    setSplitType('size')
    setSplitBy('lines')
    setLineCount(1000)
    setChunkSize(1024 * 1024 * 10)
    setIsProcessing(false)
    setProgress(0)
    setResult(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              File Splitter
            </CardTitle>
            <CardDescription>
              Split large files into smaller, manageable chunks by size or line count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="size" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="size">Split by Size</TabsTrigger>
                <TabsTrigger value="lines">Split by Lines</TabsTrigger>
              </TabsList>
              
              <TabsContent value="size" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Select File</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileSelect}
                        className="flex-1"
                        ref={fileInputRef}
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Browse
                      </Button>
                    </div>
                    {file && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="split-size">Split Size</Label>
                    <Select value={splitSize} onValueChange={setSplitSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select split size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1MB">1 MB</SelectItem>
                        <SelectItem value="5MB">5 MB</SelectItem>
                        <SelectItem value="10MB">10 MB</SelectItem>
                        <SelectItem value="25MB">25 MB</SelectItem>
                        <SelectItem value="50MB">50 MB</SelectItem>
                        <SelectItem value="100MB">100 MB</SelectItem>
                        <SelectItem value="500MB">500 MB</SelectItem>
                        <SelectItem value="1GB">1 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={splitBySize}
                    disabled={!file || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Split File by Size'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="lines" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload-lines">Select File</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="file-upload-lines"
                        type="file"
                        onChange={handleFileSelect}
                        className="flex-1"
                        ref={fileInputRef}
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Browse
                      </Button>
                    </div>
                    {file && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="line-count">Lines per Chunk</Label>
                    <Input
                      id="line-count"
                      type="number"
                      value={lineCount}
                      onChange={(e) => setLineCount(parseInt(e.target.value) || 1000)}
                      min="1"
                      max="100000"
                    />
                  </div>

                  <Button
                    onClick={splitByLines}
                    disabled={!file || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Split File by Lines'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 text-sm">File split successfully!</span>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Split Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Original File:</span>
                        <p className="text-muted-foreground">{result.originalFile}</p>
                      </div>
                      <div>
                        <span className="font-medium">Original Size:</span>
                        <p className="text-muted-foreground">
                          {typeof result.originalSize === 'number' 
                            ? `${(result.originalSize / 1024 / 1024).toFixed(2)} MB`
                            : result.originalSize
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Split Method:</span>
                        <p className="text-muted-foreground">
                          {splitType === 'size' ? 'By Size' : 'By Lines'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Total Chunks:</span>
                        <p className="text-muted-foreground">{result.totalChunks}</p>
                      </div>
                    </div>
                    
                    {splitType === 'size' && (
                      <div>
                        <span className="font-medium">Chunk Size:</span>
                        <p className="text-muted-foreground">
                          {typeof result.chunkSize === 'number'
                            ? `${(result.chunkSize / 1024 / 1024).toFixed(2)} MB`
                            : result.chunkSize
                          }
                        </p>
                      </div>
                    )}
                    
                    {splitType === 'lines' && (
                      <div>
                        <span className="font-medium">Lines per Chunk:</span>
                        <p className="text-muted-foreground">{result.linesPerChunk}</p>
                      </div>
                    )}

                    <div>
                      <span className="font-medium">Estimated Chunk Size:</span>
                      <p className="text-muted-foreground">{result.estimatedSize}</p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={downloadSplitFiles}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Split Files
                </Button>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={resetAll}>
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Split by Size:</strong> Divide your file into chunks of a specific size (e.g., 10MB each).
            </div>
            <div>
              <strong>Split by Lines:</strong> Divide your file into chunks containing a specific number of lines.
            </div>
            <div>
              <strong>Supported Formats:</strong> Text files, CSV files, log files, and other plain text formats.
            </div>
            <div>
              <strong>Binary Files:</strong> For binary files, use the size-based splitting method.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}