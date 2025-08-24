'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, Hash, FileText, Type } from 'lucide-react'

export default function SlugGeneratorTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [separator, setSeparator] = useState('-')
  const [lowercase, setLowercase] = useState(true)
  const [removeStopWords, setRemoveStopWords] = useState(false)
  const [maxLength, setMaxLength] = useState(0)
  const [batchInput, setBatchInput] = useState('')
  const [batchOutput, setBatchOutput] = useState('')

  const stopWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it',
    'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there',
    'these', 'they', 'this', 'to', 'was', 'will', 'with', 'the', 'be', 'to', 'of',
    'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he',
    'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from'
  ])

  const generateSlug = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const slug = createSlug(input, {
        separator,
        lowercase,
        removeStopWords,
        maxLength
      })
      setOutput(slug)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`)
    }
  }, [input, separator, lowercase, removeStopWords, maxLength])

  const generateBatchSlugs = useCallback(() => {
    if (!batchInput.trim()) {
      setBatchOutput('')
      return
    }

    try {
      const lines = batchInput.split('\n').filter(line => line.trim())
      const slugs = lines.map(line => {
        try {
          return createSlug(line, {
            separator,
            lowercase,
            removeStopWords,
            maxLength
          })
        } catch (error) {
          return `Error: ${error instanceof Error ? error.message : 'Invalid input'}`
        }
      })
      setBatchOutput(slugs.join('\n'))
    } catch (error) {
      setBatchOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`)
    }
  }, [batchInput, separator, lowercase, removeStopWords, maxLength])

  const createSlug = (text: string, options: {
    separator: string
    lowercase: boolean
    removeStopWords: boolean
    maxLength: number
  }): string => {
    let result = text

    // Remove HTML tags
    result = result.replace(/<[^>]*>/g, ' ')

    // Remove special characters and extra spaces
    result = result.replace(/[^\w\s-]/g, ' ')
    result = result.replace(/\s+/g, ' ')
    result = result.trim()

    // Remove stop words if enabled
    if (options.removeStopWords) {
      const words = result.split(' ')
      const filteredWords = words.filter(word => !stopWords.has(word.toLowerCase()))
      result = filteredWords.join(' ')
    }

    // Convert to lowercase if enabled
    if (options.lowercase) {
      result = result.toLowerCase()
    }

    // Replace spaces with separator
    result = result.replace(/\s+/g, options.separator)

    // Remove duplicate separators
    result = result.replace(new RegExp(`[${options.separator}]+`, 'g'), options.separator)

    // Remove separators from start and end
    result = result.replace(new RegExp(`^[${options.separator}]+|[${options.separator}]+$`, 'g'), '')

    // Apply max length if specified
    if (options.maxLength > 0 && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength)
      // Remove trailing separator if truncated
      result = result.replace(new RegExp(`[${options.separator}]+$`, 'g'), '')
    }

    return result
  }

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
    }
  }

  const handleCopyBatch = async () => {
    if (batchOutput) {
      await navigator.clipboard.writeText(batchOutput)
    }
  }

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'slug.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadBatch = () => {
    if (batchOutput) {
      const blob = new Blob([batchOutput], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'slugs.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setBatchInput('')
    setBatchOutput('')
  }

  const getExamples = () => {
    return [
      { input: 'Hello World!', output: 'hello-world' },
      { input: 'This is a Test Post', output: 'this-is-a-test-post' },
      { input: 'My Awesome Blog Post!!!', output: 'my-awesome-blog-post' },
      { input: 'User-Generated Content', output: 'user-generated-content' }
    ]
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Slug Generator
          </CardTitle>
          <CardDescription>
            Create URL-friendly slugs from text strings for use in web applications and CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Input Text</Label>
                <Textarea
                  id="text-input"
                  placeholder="Enter text to convert to slug..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Options</h4>
                
                <div className="space-y-2">
                  <Label>Separator</Label>
                  <Select value={separator} onValueChange={setSeparator}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">Hyphen (-)</SelectItem>
                      <SelectItem value="_">Underscore (_)</SelectItem>
                      <SelectItem value=".">Dot (.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={lowercase}
                    onCheckedChange={(checked) => setLowercase(checked as boolean)}
                  />
                  <Label htmlFor="lowercase">Convert to lowercase</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-stopwords"
                    checked={removeStopWords}
                    onCheckedChange={(checked) => setRemoveStopWords(checked as boolean)}
                  />
                  <Label htmlFor="remove-stopwords">Remove stop words</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxlength">Max Length (0 = no limit)</Label>
                  <Input
                    id="maxlength"
                    type="number"
                    min="0"
                    value={maxLength}
                    onChange={(e) => setMaxLength(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generated Slug</Label>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm min-h-[100px] break-all">
                  {output || <span className="text-muted-foreground">Generated slug will appear here...</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateSlug} disabled={!input.trim()}>
                  <Hash className="h-4 w-4 mr-2" />
                  Generate Slug
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={!output}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium">Batch Processing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Enter multiple texts (one per line)</Label>
                <Textarea
                  placeholder={`Enter texts to convert, one per line...
e.g.,
Hello World!
This is a Test Post
My Awesome Blog Post!!!`}
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Generated Slugs</Label>
                <Textarea
                  value={batchOutput}
                  readOnly
                  rows={6}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={generateBatchSlugs} disabled={!batchInput.trim()}>
                Generate All Slugs
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyBatch} disabled={!batchOutput}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadBatch} disabled={!batchOutput}>
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About Slugs</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What is a URL Slug?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    A URL slug is a user-friendly and URL-valid version of a string, typically used 
                    in web addresses to make them more readable and SEO-friendly. Slugs are created 
                    by removing special characters, replacing spaces with separators, and converting 
                    to lowercase.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Slugs are commonly used in CMS platforms, blogs, and web applications to create 
                    clean, human-readable URLs that are easy to share and remember.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Examples</h4>
                  <div className="space-y-2">
                    {getExamples().map((example, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-background rounded">
                          <div className="font-medium text-muted-foreground">Input:</div>
                          <div className="font-mono">{example.input}</div>
                        </div>
                        <div className="p-2 bg-background rounded">
                          <div className="font-medium text-muted-foreground">Output:</div>
                          <div className="font-mono">{example.output}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-4">
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}