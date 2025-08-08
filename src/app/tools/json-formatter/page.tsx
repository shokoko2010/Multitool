'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function JSONFormatter() {
  const [jsonInput, setJsonInput] = useState('')
  const [formattedJson, setFormattedJson] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [indentSize, setIndentSize] = useState(2)

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setFormattedJson(formatted)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message)
      setIsValid(false)
      setFormattedJson('')
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const minified = JSON.stringify(parsed)
      setFormattedJson(minified)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message)
      setIsValid(false)
      setFormattedJson('')
    }
  }

  const validateJson = () => {
    try {
      JSON.parse(jsonInput)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message)
      setIsValid(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadJson = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    const sample = {
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zip": "10001"
      },
      "hobbies": ["reading", "swimming", "coding"],
      "active": true,
      "metadata": {
        "created": "2024-01-01T00:00:00Z",
        "updated": "2024-01-15T00:00:00Z"
      }
    }
    setJsonInput(JSON.stringify(sample, null, 2))
    setError('')
    setIsValid(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JSON Formatter</h1>
        <p className="text-muted-foreground">
          Format, validate, and beautify JSON data with customizable indentation
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input JSON
            </CardTitle>
            <CardDescription>
              Paste your JSON data or load a sample to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                <Upload className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={validateJson}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate
              </Button>
            </div>
            
            <Textarea
              placeholder="Paste your JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isValid && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Valid JSON</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatting Options</CardTitle>
            <CardDescription>
              Choose how you want to format your JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Indentation:</label>
              <select 
                value={indentSize} 
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
                <option value="\t">Tabs</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Process your JSON data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={formatJson} disabled={!jsonInput.trim()}>
                Format JSON
              </Button>
              <Button onClick={minifyJson} disabled={!jsonInput.trim()} variant="outline">
                Minify JSON
              </Button>
              <Button 
                onClick={copyToClipboard} 
                disabled={!formattedJson}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                onClick={downloadJson} 
                disabled={!formattedJson}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {formattedJson && (
          <Card>
            <CardHeader>
              <CardTitle>Formatted JSON</CardTitle>
              <CardDescription>
                Your beautifully formatted JSON output
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
                    <code>{formattedJson}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <Textarea
                    value={formattedJson}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}