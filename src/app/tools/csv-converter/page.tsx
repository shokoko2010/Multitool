'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Upload, FileText, CheckCircle } from 'lucide-react'

export default function CSVConverter() {
  const [csvInput, setCsvInput] = useState('')
  const [convertedData, setConvertedData] = useState('')
  const [parsedData, setParsedData] = useState<string[][]>([])
  const [outputFormat, setOutputFormat] = useState('json')
  const [delimiter, setDelimiter] = useState(',')
  const [hasHeader, setHasHeader] = useState(true)

  const parseCSV = (text: string, delimiter: string): string[][] => {
    const lines = text.trim().split('\n')
    return lines.map(line => line.split(delimiter).map(cell => cell.trim()))
  }

  const convertToJson = (data: string[][]): string => {
    if (data.length === 0) return '[]'
    
    const headers = hasHeader ? data[0] : data[0].map((_, index) => `Column ${index + 1}`)
    const rows = data.slice(hasHeader ? 1 : 0)
    
    const jsonArray = rows.map(row => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] || ''
      })
      return obj
    })
    
    return JSON.stringify(jsonArray, null, 2)
  }

  const convertToCSV = (data: string[][]): string => {
    if (outputFormat === 'csv') {
      return data.map(row => row.join(',')).join('\n')
    } else if (outputFormat === 'tsv') {
      return data.map(row => row.join('\t')).join('\n')
    }
    return csvInput
  }

  const convertData = () => {
    try {
      const data = parseCSV(csvInput, delimiter)
      setParsedData(data)
      
      let result = ''
      if (outputFormat === 'json') {
        result = convertToJson(data)
      } else {
        result = convertToCSV(data)
      }
      
      setConvertedData(result)
    } catch (error) {
      console.error('Conversion error:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(convertedData)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadData = () => {
    const extension = outputFormat === 'json' ? 'json' : outputFormat
    const mimeType = outputFormat === 'json' ? 'application/json' : 'text/csv'
    const blob = new Blob([convertedData], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSampleCsv = () => {
    const sample = `Name,Age,City,Email
John Doe,25,New York,john@example.com
Jane Smith,30,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com
Alice Brown,28,Houston,alice@example.com`
    setCsvInput(sample)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCsvInput(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSV Converter</h1>
        <p className="text-muted-foreground">
          Convert between CSV, JSON, and TSV formats with ease
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
            <CardDescription>
              Paste your CSV data or upload a file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSampleCsv}>
                <Upload className="h-4 w-4 mr-2" />
                Load Sample CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                Upload File
              </Button>
            </div>
            
            <Tabs defaultValue="text" className="w-full">
              <TabsList>
                <TabsTrigger value="text">Text Input</TabsTrigger>
                <TabsTrigger value="file">File Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Paste your CSV data here..."
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="file" className="mt-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-gray-400" />
                      <div className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">
                        CSV, TSV, or TXT files
                      </div>
                    </div>
                  </label>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Delimiter:</label>
                <select 
                  value={delimiter} 
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value=",">Comma (,)</option>
                  <option value="\t">Tab</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                  <option value=" ">Space</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Has Header:</label>
                <select 
                  value={hasHeader.toString()} 
                  onChange={(e) => setHasHeader(e.target.value === 'true')}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convert To</CardTitle>
            <CardDescription>
              Choose the format you want to convert to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={outputFormat === 'json' ? 'default' : 'outline'}
                onClick={() => setOutputFormat('json')}
                className="h-20 flex flex-col"
              >
                <FileText className="h-6 w-6 mb-2" />
                JSON
              </Button>
              <Button
                variant={outputFormat === 'csv' ? 'default' : 'outline'}
                onClick={() => setOutputFormat('csv')}
                className="h-20 flex flex-col"
              >
                <FileText className="h-6 w-6 mb-2" />
                CSV
              </Button>
              <Button
                variant={outputFormat === 'tsv' ? 'default' : 'outline'}
                onClick={() => setOutputFormat('tsv')}
                className="h-20 flex flex-col"
              >
                <FileText className="h-6 w-6 mb-2" />
                TSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Process your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={convertData} disabled={!csvInput.trim()}>
                Convert
              </Button>
              <Button 
                onClick={copyToClipboard} 
                disabled={!convertedData}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                onClick={downloadData} 
                disabled={!convertedData}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {convertedData && (
          <Card>
            <CardHeader>
              <CardTitle>Converted Data</CardTitle>
              <CardDescription>
                Your {outputFormat.toUpperCase()} data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="mt-4">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                    <code>{convertedData}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <Textarea
                    value={convertedData}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {parsedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                First few rows of your parsed data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-64">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {parsedData[0].map((header, index) => (
                        <th key={index} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">
                          {hasHeader ? header : `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 5 && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing 5 of {parsedData.length} rows
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}