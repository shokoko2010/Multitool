'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileText, Image, FileJson, FileCode, FileSpreadsheet } from 'lucide-react'

interface ConvertedFile {
  name: string
  content: string
  type: string
  size: number
}

export default function FileConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState('')
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatOptions = [
    { value: 'txt', label: 'Text (.txt)', icon: FileText, category: 'Text' },
    { value: 'json', label: 'JSON (.json)', icon: FileJson, category: 'Data' },
    { value: 'csv', label: 'CSV (.csv)', icon: FileSpreadsheet, category: 'Data' },
    { value: 'xml', label: 'XML (.xml)', icon: FileCode, category: 'Data' },
    { value: 'html', label: 'HTML (.html)', icon: FileCode, category: 'Web' },
    { value: 'md', label: 'Markdown (.md)', icon: FileText, category: 'Text' },
    { value: 'yaml', label: 'YAML (.yaml)', icon: FileCode, category: 'Data' },
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setConvertedFile(null)
      setError('')
      
      // Auto-select target format based on file type
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (fileExt === 'txt') setTargetFormat('json')
      else if (fileExt === 'json') setTargetFormat('csv')
      else if (fileExt === 'csv') setTargetFormat('json')
      else if (fileExt === 'xml') setTargetFormat('json')
      else if (fileExt === 'html') setTargetFormat('md')
      else if (fileExt === 'md') setTargetFormat('html')
      else setTargetFormat('txt')
    }
  }

  const convertFile = async () => {
    if (!selectedFile || !targetFormat) {
      setError('Please select a file and target format')
      return
    }

    setIsConverting(true)
    setError('')

    try {
      const content = await selectedFile.text()
      const sourceExt = selectedFile.name.split('.').pop()?.toLowerCase()
      let convertedContent = ''
      let convertedName = ''
      let convertedType = ''

      // Simple conversion logic
      switch (sourceExt) {
        case 'txt':
          if (targetFormat === 'json') {
            convertedContent = JSON.stringify({ content: content }, null, 2)
            convertedType = 'application/json'
          } else if (targetFormat === 'csv') {
            convertedContent = content.split('\n').map((line, index) => `${index + 1},"${line}"`).join('\n')
            convertedType = 'text/csv'
          } else if (targetFormat === 'html') {
            convertedContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>Converted Text</title>\n</head>\n<body>\n  <pre>${content}</pre>\n</body>\n</html>`
            convertedType = 'text/html'
          } else if (targetFormat === 'md') {
            convertedContent = content
            convertedType = 'text/markdown'
          } else {
            convertedContent = content
            convertedType = 'text/plain'
          }
          break

        case 'json':
          const jsonData = JSON.parse(content)
          if (targetFormat === 'csv') {
            if (Array.isArray(jsonData)) {
              const headers = Object.keys(jsonData[0] || {})
              convertedContent = headers.join(',') + '\n' + 
                jsonData.map(row => headers.map(header => `"${row[header] || ''}"`).join(',')).join('\n')
            } else {
              convertedContent = Object.keys(jsonData).map(key => `${key},"${jsonData[key]}"`).join('\n')
            }
            convertedType = 'text/csv'
          } else if (targetFormat === 'xml') {
            convertedContent = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n' +
              Object.entries(jsonData).map(([key, value]) => `  <${key}>${value}</${key}>`).join('\n') +
              '\n</root>'
            convertedType = 'application/xml'
          } else if (targetFormat === 'txt') {
            convertedContent = JSON.stringify(jsonData, null, 2)
            convertedType = 'text/plain'
          } else if (targetFormat === 'yaml') {
            convertedContent = JSON.stringify(jsonData, null, 2)
              .replace(/"/g, '')
              .replace(/,/g, '')
              .replace(/{/g, '')
              .replace(/}/g, '')
              .replace(/(\w+):/g, '$1:')
            convertedType = 'text/yaml'
          } else {
            convertedContent = content
            convertedType = 'application/json'
          }
          break

        case 'csv':
          const lines = content.split('\n').filter(line => line.trim())
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
            const data = lines.slice(1).map(line => 
              line.split(',').reduce((obj, val, i) => ({ ...obj, [headers[i]]: val.replace(/"/g, '') }), {})
            )
            if (targetFormat === 'json') {
              convertedContent = JSON.stringify(data, null, 2)
              convertedType = 'application/json'
            } else if (targetFormat === 'xml') {
              convertedContent = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n' +
                data.map(row => '  <row>\n' +
                  Object.entries(row).map(([key, value]) => `    <${key}>${value}</${key}>`).join('\n') +
                  '\n  </row>'
                ).join('\n') +
                '\n</data>'
              convertedType = 'application/xml'
            } else {
              convertedContent = content
              convertedType = 'text/csv'
            }
          }
          break

        case 'xml':
          if (targetFormat === 'json') {
            // Simple XML to JSON conversion
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(content, 'text/xml')
            const result: any = {}
            
            const parseNode = (node: Element, obj: any) => {
              if (node.children.length === 0) {
                obj[node.tagName] = node.textContent
              } else {
                obj[node.tagName] = {}
                Array.from(node.children).forEach(child => {
                  parseNode(child, obj[node.tagName])
                })
              }
            }
            
            Array.from(xmlDoc.documentElement.children).forEach(child => {
              parseNode(child, result)
            })
            
            convertedContent = JSON.stringify(result, null, 2)
            convertedType = 'application/json'
          } else {
            convertedContent = content
            convertedType = 'application/xml'
          }
          break

        case 'html':
          if (targetFormat === 'md') {
            // Simple HTML to Markdown conversion
            convertedContent = content
              .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
              .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
              .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
              .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
              .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
              .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
              .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
              .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
              .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
            convertedType = 'text/markdown'
          } else if (targetFormat === 'txt') {
            convertedContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
            convertedType = 'text/plain'
          } else {
            convertedContent = content
            convertedType = 'text/html'
          }
          break

        case 'md':
          if (targetFormat === 'html') {
            // Simple Markdown to HTML conversion
            convertedContent = content
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
              .replace(/\*(.*)\*/gim, '<em>$1</em>')
              .replace(/`(.*)`/gim, '<code>$1</code>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
              .replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">')
              .replace(/\n/gim, '<br>')
            convertedContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>Converted Markdown</title>\n</head>\n<body>\n${convertedContent}\n</body>\n</html>`
            convertedType = 'text/html'
          } else {
            convertedContent = content
            convertedType = 'text/markdown'
          }
          break

        default:
          convertedContent = content
          convertedType = 'text/plain'
      }

      convertedName = selectedFile.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat

      setConvertedFile({
        name: convertedName,
        content: convertedContent,
        type: convertedType,
        size: new Blob([convertedContent]).size
      })
    } catch (err) {
      setError('Conversion failed: ' + (err as Error).message)
    } finally {
      setIsConverting(false)
    }
  }

  const downloadFile = () => {
    if (!convertedFile) return

    const blob = new Blob([convertedFile.content], { type: convertedFile.type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = convertedFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">File Converter</h1>
          <p className="text-muted-foreground">
            Convert files between different formats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Input File
              </CardTitle>
              <CardDescription>
                Select the file you want to convert
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
                  accept=".txt,.json,.csv,.xml,.html,.md,.yaml"
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to select a file or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Supports: TXT, JSON, CSV, XML, HTML, MD, YAML
                </p>
              </div>

              {selectedFile && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-format">Convert to</Label>
                    <Select value={targetFormat} onValueChange={setTargetFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target format" />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions.map((option) => {
                          const Icon = option.icon
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span>{option.label}</span>
                                <Badge variant="outline" className="text-xs">
                                  {option.category}
                                </Badge>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={convertFile} 
                    disabled={!selectedFile || !targetFormat || isConverting}
                    className="w-full"
                  >
                    {isConverting ? 'Converting...' : 'Convert File'}
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Converted File
              </CardTitle>
              <CardDescription>
                Download your converted file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {convertedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{convertedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(convertedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      Ready
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview (first 500 characters)</Label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm font-mono max-h-32 overflow-y-auto">
                      {convertedFile.content.substring(0, 500)}
                      {convertedFile.content.length > 500 && '...'}
                    </div>
                  </div>

                  <Button onClick={downloadFile} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Converted File
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    No converted file yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Select and convert a file to see the result here
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