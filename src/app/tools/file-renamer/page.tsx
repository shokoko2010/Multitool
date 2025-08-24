'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileText, RotateCcw, Hash, Type, Calendar } from 'lucide-react'

interface FileItem {
  name: string
  size: number
  type: string
  lastModified: number
}

interface RenamePattern {
  prefix: string
  suffix: string
  pattern: 'sequential' | 'date' | 'custom' | 'remove-pattern'
  customPattern: string
  removePattern: string
  startNumber: number
  dateFormat: string
  caseConversion: 'none' | 'uppercase' | 'lowercase' | 'titlecase'
  extension: 'keep' | 'change' | 'remove'
  newExtension: string
}

export default function FileRenamer() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [pattern, setPattern] = useState<RenamePattern>({
    prefix: '',
    suffix: '',
    pattern: 'sequential',
    customPattern: '',
    removePattern: '',
    startNumber: 1,
    dateFormat: 'YYYY-MM-DD',
    caseConversion: 'none',
    extension: 'keep',
    newExtension: ''
  })
  const [previewFiles, setPreviewFiles] = useState<{ original: string; new: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileItems: FileItem[] = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }))
      setSelectedFiles(fileItems)
      generatePreview(fileItems, pattern)
    }
  }

  const generatePreview = (files: FileItem[], currentPattern: RenamePattern) => {
    const preview = files.map((file, index) => {
      let newName = file.name
      const extIndex = newName.lastIndexOf('.')
      const nameWithoutExt = extIndex !== -1 ? newName.substring(0, extIndex) : newName
      const extension = extIndex !== -1 ? newName.substring(extIndex) : ''

      // Apply case conversion
      let processedName = nameWithoutExt
      switch (currentPattern.caseConversion) {
        case 'uppercase':
          processedName = processedName.toUpperCase()
          break
        case 'lowercase':
          processedName = processedName.toLowerCase()
          break
        case 'titlecase':
          processedName = processedName.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          )
          break
      }

      // Apply pattern
      let finalName = processedName
      switch (currentPattern.pattern) {
        case 'sequential':
          finalName = `${currentPattern.prefix}${currentPattern.startNumber + index}${currentPattern.suffix}`
          break
        case 'date':
          const date = new Date()
          const formattedDate = currentPattern.dateFormat
            .replace('YYYY', date.getFullYear().toString())
            .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
            .replace('DD', date.getDate().toString().padStart(2, '0'))
            .replace('HH', date.getHours().toString().padStart(2, '0'))
            .replace('mm', date.getMinutes().toString().padStart(2, '0'))
            .replace('ss', date.getSeconds().toString().padStart(2, '0'))
          finalName = `${currentPattern.prefix}${formattedDate}${currentPattern.suffix}`
          break
        case 'custom':
          finalName = currentPattern.customPattern
            .replace('{name}', processedName)
            .replace('{number}', (currentPattern.startNumber + index).toString())
            .replace('{date}', new Date().toISOString().split('T')[0])
            .replace('{time}', new Date().toTimeString().split(' ')[0])
          break
        case 'remove-pattern':
          finalName = processedName.replace(new RegExp(currentPattern.removePattern, 'g'), '')
          break
      }

      // Add prefix and suffix if not already applied
      if (currentPattern.pattern !== 'sequential' && currentPattern.pattern !== 'date') {
        finalName = `${currentPattern.prefix}${finalName}${currentPattern.suffix}`
      }

      // Handle extension
      let finalExtension = extension
      switch (currentPattern.extension) {
        case 'change':
          finalExtension = currentPattern.newExtension.startsWith('.') 
            ? currentPattern.newExtension 
            : `.${currentPattern.newExtension}`
          break
        case 'remove':
          finalExtension = ''
          break
      }

      return {
        original: file.name,
        new: `${finalName}${finalExtension}`
      }
    })

    setPreviewFiles(preview)
  }

  const updatePattern = (key: keyof RenamePattern, value: any) => {
    const newPattern = { ...pattern, [key]: value }
    setPattern(newPattern)
    generatePreview(selectedFiles, newPattern)
  }

  const downloadBatchFile = () => {
    if (previewFiles.length === 0) return

    // Create a batch script for Windows
    let batchContent = '@echo off\necho Renaming files...\n\n'
    previewFiles.forEach(({ original, new: newName }) => {
      if (original !== newName) {
        batchContent += `ren "${original}" "${newName}"\n`
      }
    })
    batchContent += '\necho Rename complete!\npause'

    // Create a shell script for Unix/Linux/Mac
    let shellContent = '#!/bin/bash\necho "Renaming files..."\n\n'
    previewFiles.forEach(({ original, new: newName }) => {
      if (original !== newName) {
        shellContent += `mv "${original}" "${newName}"\n`
      }
    })
    shellContent += '\necho "Rename complete!"'

    // Create a PowerShell script
    let powershellContent = '# PowerShell script to rename files\nWrite-Host "Renaming files..."\n\n'
    previewFiles.forEach(({ original, new: newName }) => {
      if (original !== newName) {
        powershellContent += `Rename-Item -Path "${original}" -NewName "${newName}"\n`
      }
    })
    powershellContent += '\nWrite-Host "Rename complete!"'

    // Create download links for all scripts
    const downloadScript = (content: string, filename: string) => {
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

    downloadScript(batchContent, 'rename_files.bat')
    downloadScript(shellContent, 'rename_files.sh')
    downloadScript(powershellContent, 'rename_files.ps1')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">File Renamer</h1>
          <p className="text-muted-foreground">
            Rename multiple files using custom patterns and rules
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Select Files
              </CardTitle>
              <CardDescription>
                Choose files to rename
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  multiple
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to select files
                </p>
                <p className="text-xs text-gray-500">
                  Multiple files supported
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pattern Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Rename Pattern
              </CardTitle>
              <CardDescription>
                Configure how files should be renamed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pattern Type</Label>
                <Select 
                  value={pattern.pattern} 
                  onValueChange={(value) => updatePattern('pattern', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequential Numbers</SelectItem>
                    <SelectItem value="date">Date/Time</SelectItem>
                    <SelectItem value="custom">Custom Pattern</SelectItem>
                    <SelectItem value="remove-pattern">Remove Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Prefix</Label>
                  <Input
                    value={pattern.prefix}
                    onChange={(e) => updatePattern('prefix', e.target.value)}
                    placeholder="file_"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Suffix</Label>
                  <Input
                    value={pattern.suffix}
                    onChange={(e) => updatePattern('suffix', e.target.value)}
                    placeholder="_v1"
                  />
                </div>
              </div>

              {pattern.pattern === 'sequential' && (
                <div className="space-y-2">
                  <Label>Start Number</Label>
                  <Input
                    type="number"
                    value={pattern.startNumber}
                    onChange={(e) => updatePattern('startNumber', parseInt(e.target.value) || 1)}
                  />
                </div>
              )}

              {pattern.pattern === 'date' && (
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={pattern.dateFormat} 
                    onValueChange={(value) => updatePattern('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">2024-01-01</SelectItem>
                      <SelectItem value="YYYYMMDD">20240101</SelectItem>
                      <SelectItem value="MM-DD-YYYY">01-01-2024</SelectItem>
                      <SelectItem value="DD-MM-YYYY">01-01-2024</SelectItem>
                      <SelectItem value="YYYY-MM-DD_HH-mm-ss">2024-01-01_12-30-45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {pattern.pattern === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Pattern</Label>
                  <Input
                    value={pattern.customPattern}
                    onChange={(e) => updatePattern('customPattern', e.target.value)}
                    placeholder="{name}_{number}_{date}"
                  />
                  <p className="text-xs text-gray-500">
                    Variables: {name}, {number}, {date}, {time}
                  </p>
                </div>
              )}

              {pattern.pattern === 'remove-pattern' && (
                <div className="space-y-2">
                  <Label>Remove Pattern</Label>
                  <Input
                    value={pattern.removePattern}
                    onChange={(e) => updatePattern('removePattern', e.target.value)}
                    placeholder="_old|_backup|temp"
                  />
                  <p className="text-xs text-gray-500">
                    Regex pattern to remove from filename
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Case Conversion</Label>
                <Select 
                  value={pattern.caseConversion} 
                  onValueChange={(value) => updatePattern('caseConversion', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Change</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="titlecase">Title Case</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Extension</Label>
                <Select 
                  value={pattern.extension} 
                  onValueChange={(value) => updatePattern('extension', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Keep Original</SelectItem>
                    <SelectItem value="change">Change</SelectItem>
                    <SelectItem value="remove">Remove</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pattern.extension === 'change' && (
                <div className="space-y-2">
                  <Label>New Extension</Label>
                  <Input
                    value={pattern.newExtension}
                    onChange={(e) => updatePattern('newExtension', e.target.value)}
                    placeholder="txt"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Preview
              </CardTitle>
              <CardDescription>
                Preview of renamed files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewFiles.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <Label>Preview ({previewFiles.length} files)</Label>
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {previewFiles.map((file, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-500 truncate">
                                {file.original}
                              </p>
                              <p className="text-sm font-medium text-green-600 truncate">
                                {file.new}
                              </p>
                            </div>
                          </div>
                          {index < previewFiles.length - 1 && (
                            <div className="border-t border-gray-200"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={downloadBatchFile} 
                    className="w-full"
                    disabled={previewFiles.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Rename Scripts
                  </Button>

                  <div className="text-xs text-gray-500">
                    <p>Downloads:</p>
                    <ul className="list-disc list-inside">
                      <li>rename_files.bat (Windows)</li>
                      <li>rename_files.sh (Linux/Mac)</li>
                      <li>rename_files.ps1 (PowerShell)</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Type className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    No preview yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Select files and configure pattern to see preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}