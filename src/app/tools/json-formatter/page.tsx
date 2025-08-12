'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Copy, Braces, FileText, Upload, Download } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function JsonFormatter() {
  const [inputText, setInputText] = useState('')
  const [formattedJson, setFormattedJson] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [error, setError] = useState('')

  const formatJson = () => {
    if (!inputText.trim()) {
      setError('Please enter JSON to format')
      return
    }

    try {
      const parsed = JSON.parse(inputText)
      
      if (sortKeys && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const sortedObj = sortObjectKeys(parsed)
        const formatted = JSON.stringify(sortedObj, null, indentSize)
        setFormattedJson(formatted)
      } else {
        const formatted = JSON.stringify(parsed, null, indentSize)
        setFormattedJson(formatted)
      }
      
      setError('')
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setFormattedJson('')
    }
  }

  const sortObjectKeys = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    }

    const sorted: any = {}
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key])
    })
    return sorted
  }

  const minifyJson = () => {
    if (!inputText.trim()) {
      setError('Please enter JSON to minify')
      return
    }

    try {
      const parsed = JSON.parse(inputText)
      const minified = JSON.stringify(parsed)
      setFormattedJson(minified)
      setError('')
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setFormattedJson('')
    }
  }

  const validateJson = () => {
    if (!inputText.trim()) {
      setError('Please enter JSON to validate')
      return
    }

    try {
      JSON.parse(inputText)
      toast({
        title: "Valid JSON!",
        description: "The JSON is valid and properly formatted"
      })
      setError('')
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setFormattedJson('')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson)
    toast({
      title: "Copied!",
      description: "Formatted JSON copied to clipboard"
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputText(content)
    }
    reader.readAsText(file)
  }

  const downloadResult = () => {
    if (!formattedJson) return
    
    const blob = new Blob([formattedJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInputText('')
    setFormattedJson('')
    setError('')
  }

  const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "isActive": true
}`

  const loadSample = () => {
    setInputText(sampleJson)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JSON Formatter</h1>
        <p className="text-muted-foreground">Format, validate, and minify JSON data</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input JSON
            </CardTitle>
            <CardDescription>Enter or paste your JSON data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={loadSample} variant="outline" size="sm">
                Load Sample
              </Button>
              <Label htmlFor="file-upload" className="flex-1">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <Textarea
              placeholder="Enter your JSON data here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="indent-size">Indent Size</Label>
                <Select value={indentSize.toString()} onValueChange={(value) => setIndentSize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sort-keys"
                  checked={sortKeys}
                  onCheckedChange={setSortKeys}
                />
                <Label htmlFor="sort-keys">Sort Keys</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={formatJson} className="flex-1">
                <Braces className="h-4 w-4 mr-2" />
                Format
              </Button>
              <Button onClick={minifyJson} variant="outline">
                Minify
              </Button>
              <Button onClick={validateJson} variant="outline">
                Validate
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Braces className="h-5 w-5" />
              Formatted JSON
            </CardTitle>
            <CardDescription>Formatted and validated JSON output</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={formattedJson}
                readOnly
                className="min-h-[300px] font-mono text-sm"
                placeholder="Formatted JSON will appear here..."
              />
              {formattedJson && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResult}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {formattedJson && (
              <div className="text-sm text-muted-foreground">
                <p>Original Size: {inputText.length} characters</p>
                <p>Formatted Size: {formattedJson.length} characters</p>
                <p>Lines: {formattedJson.split('\n').length}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>JSON Features</CardTitle>
          <CardDescription>What this tool can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-2">Format JSON</h4>
              <p className="text-muted-foreground">
                Beautify JSON with proper indentation and line breaks for better readability.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-2">Validate JSON</h4>
              <p className="text-muted-foreground">
                Check if your JSON is valid and get detailed error messages for issues.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-2">Minify JSON</h4>
              <p className="text-muted-foreground">
                Remove unnecessary whitespace to reduce file size for production use.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-6">
        <Button onClick={clearAll} variant="outline" className="flex-1">
          Clear All
        </Button>
      </div>
    </div>
  )
}