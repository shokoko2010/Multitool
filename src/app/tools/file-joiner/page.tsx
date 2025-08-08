'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Upload, Download, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react'

interface FileItem {
  id: string
  file: File
  size: number
}

export default function FileJoiner() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [outputName, setOutputName] = useState('merged_file')
  const [outputFormat, setOutputFormat] = useState('txt')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const newFiles: FileItem[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      size: file.size
    }))
    
    setFiles(prev => [...prev, ...newFiles])
    setError(null)
    setSuccess(false)
    setResult(null)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const clearAllFiles = () => {
    setFiles([])
    setError(null)
    setSuccess(false)
    setResult(null)
  }

  const getTotalSize = (): number => {
    return files.reduce((sum, fileItem) => sum + fileItem.size, 0)
  }

  const joinFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to join')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const totalSize = getTotalSize()
      let processedSize = 0

      // Create a blob to hold the merged content
      const mergedContent = []
      
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]
        const content = await fileItem.file.text()
        mergedContent.push(content)
        
        processedSize += fileItem.size
        const progress = Math.round((processedSize / totalSize) * 100)
        setProgress(progress)
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      const finalContent = mergedContent.join('\n\n--- File Separator ---\n\n')
      
      const blob = new Blob([finalContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const joinResult = {
        totalFiles: files.length,
        totalSize: totalSize,
        outputName: `${outputName}.${outputFormat}`,
        estimatedSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
      }

      setResult({ ...joinResult, downloadUrl: url })
      setSuccess(true)
      
      // Complete progress
      setProgress(100)
    } catch (err) {
      setError('Failed to join files')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadMergedFile = () => {
    if (!result?.downloadUrl) return

    const a = document.createElement('a')
    a.href = result.downloadUrl
    a.download = result.outputName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(result.downloadUrl)
  }

  const resetAll = () => {
    setFiles([])
    setOutputName('merged_file')
    setOutputFormat('txt')
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
              File Joiner
            </CardTitle>
            <CardDescription>
              Merge multiple files into a single file with customizable output format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select Files to Join</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
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
                <p className="text-sm text-muted-foreground mt-1">
                  Select multiple files to join them together
                </p>
              </div>

              {files.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Selected Files ({files.length})</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFiles}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                    {files.map((fileItem) => (
                      <div key={fileItem.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">
                            {fileItem.file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(fileItem.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    Total size: {(getTotalSize() / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="output-name">Output Filename</Label>
                  <Input
                    id="output-name"
                    value={outputName}
                    onChange={(e) => setOutputName(e.target.value)}
                    placeholder="Enter output filename"
                  />
                </div>
                
                <div>
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="txt">.txt</SelectItem>
                      <SelectItem value="csv">.csv</SelectItem>
                      <SelectItem value="log">.log</SelectItem>
                      <SelectItem value="md">.md</SelectItem>
                      <SelectItem value="json">.json</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={joinFiles}
                disabled={files.length === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Join Files'}
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Joining files...</span>
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
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mt-4">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 text-sm">Files joined successfully!</span>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Join Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Files:</span>
                        <p className="text-muted-foreground">{result.totalFiles}</p>
                      </div>
                      <div>
                        <span className="font-medium">Total Size:</span>
                        <p className="text-muted-foreground">
                          {typeof result.totalSize === 'number' 
                            ? `${(result.totalSize / 1024 / 1024).toFixed(2)} MB`
                            : result.totalSize
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Output Name:</span>
                        <p className="text-muted-foreground">{result.outputName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Size:</span>
                        <p className="text-muted-foreground">{result.estimatedSize}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={downloadMergedFile}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Merged File
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
              <strong>Select Files:</strong> Choose multiple files to join together using the file picker.
            </div>
            <div>
              <strong>Customize Output:</strong> Set your preferred output filename and format.
            </div>
            <div>
              <strong>Join Process:</strong> Files will be concatenated with separators between them.
            </div>
            <div>
              <strong>Supported Formats:</strong> Text files, CSV files, log files, and other plain text formats.
            </div>
            <div>
              <strong>File Order:</strong> Files are joined in the order they were selected.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}