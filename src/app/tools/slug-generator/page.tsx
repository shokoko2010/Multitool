'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Hash, Copy, RefreshCw, Type, FileText, Link, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SlugGenerator() {
  const [inputText, setInputText] = useState('')
  const [generatedSlug, setGeneratedSlug] = useState('')
  const [separator, setSeparator] = useState('-')
  const [lowercase, setLowercase] = useState(true)
  const [removeStopWords, setRemoveStopWords] = useState(true)
  const [maxWords, setMaxWords] = useState(0)
  const [copied, setCopied] = useState('')
  const { toast } = useToast()

  const separators = [
    { value: '-', label: 'Hyphen (-)' },
    { value: '_', label: 'Underscore (_)' },
    { value: '.', label: 'Period (.)' },
  ]

  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]

  const sampleTexts = [
    "Welcome to Our Amazing Website",
    "The Ultimate Guide to Web Development",
    "10 Tips for Better SEO Performance",
    "Building Responsive Websites with Modern CSS",
    "Understanding Machine Learning Fundamentals",
    "The Future of Artificial Intelligence",
    "Complete Guide to React.js Development",
    "Best Practices for User Experience Design"
  ]

  const generateSlug = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a slug",
        variant: "destructive",
      })
      return
    }

    let slug = inputText

    // Remove special characters and punctuation
    slug = slug.replace(/[^\w\s-]/g, '')

    // Replace spaces with separator
    slug = slug.replace(/\s+/g, separator)

    // Remove repeated separators
    const separatorRegex = new RegExp(`[${separator}]+`, 'g')
    slug = slug.replace(separatorRegex, separator)

    // Remove stop words if enabled
    if (removeStopWords) {
      const words = slug.split(separator)
      const filteredWords = words.filter(word => !stopWords.includes(word.toLowerCase()))
      slug = filteredWords.join(separator)
    }

    // Limit words if maxWords is set
    if (maxWords > 0) {
      const words = slug.split(separator)
      slug = words.slice(0, maxWords).join(separator)
    }

    // Remove leading/trailing separators
    slug = slug.replace(new RegExp(`^[${separator}]+|[${separator}]+$`, 'g'), '')

    // Convert to lowercase if enabled
    if (lowercase) {
      slug = slug.toLowerCase()
    }

    setGeneratedSlug(slug)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      variant: "default",
    })
    
    setTimeout(() => setCopied(''), 2000)
  }

  const insertSampleText = () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    setInputText(randomText)
  }

  const clearAll = () => {
    setInputText('')
    setGeneratedSlug('')
    setCopied('')
  }

  const generateMultipleSlugs = () => {
    if (!inputText.trim()) return

    const slugs = []
    slugs.push(generateSlugWithOptions(inputText, '-', true, removeStopWords, maxWords))
    slugs.push(generateSlugWithOptions(inputText, '_', true, removeStopWords, maxWords))
    slugs.push(generateSlugWithOptions(inputText, '-', false, removeStopWords, maxWords))
    
    return slugs
  }

  const generateSlugWithOptions = (
    text: string, 
    sep: string, 
    lower: boolean, 
    removeSW: boolean, 
    maxW: number
  ): string => {
    let slug = text

    // Remove special characters and punctuation
    slug = slug.replace(/[^\w\s-]/g, '')

    // Replace spaces with separator
    slug = slug.replace(/\s+/g, sep)

    // Remove repeated separators
    const separatorRegex = new RegExp(`[${sep}]+`, 'g')
    slug = slug.replace(separatorRegex, sep)

    // Remove stop words if enabled
    if (removeSW) {
      const words = slug.split(sep)
      const filteredWords = words.filter(word => !stopWords.includes(word.toLowerCase()))
      slug = filteredWords.join(sep)
    }

    // Limit words if maxWords is set
    if (maxW > 0) {
      const words = slug.split(sep)
      slug = words.slice(0, maxW).join(sep)
    }

    // Remove leading/trailing separators
    slug = slug.replace(new RegExp(`^[${sep}]+|[${sep}]+$`, 'g'), '')

    // Convert to lowercase if enabled
    if (lower) {
      slug = slug.toLowerCase()
    }

    return slug
  }

  const getSlugStats = () => {
    if (!generatedSlug) return null

    return {
      length: generatedSlug.length,
      wordCount: generatedSlug.split(separator).length,
      containsNumbers: /\d/.test(generatedSlug),
      containsSpecialChars: !/^[a-zA-Z0-9_-]+$/.test(generatedSlug),
    }
  }

  const slugStats = getSlugStats()

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Slug Generator</h1>
          <p className="text-muted-foreground">Create clean, SEO-friendly URL slugs from any text</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Generator</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Text Input
                </CardTitle>
                <CardDescription>Enter the text you want to convert to a slug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={insertSampleText} variant="outline" size="sm">
                    Insert Sample Text
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Enter your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                
                <div className="text-sm text-muted-foreground">
                  Characters: {inputText.length} | Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Basic Settings
                </CardTitle>
                <CardDescription>Configure your slug generation preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="separator">Separator</Label>
                    <Select value={separator} onValueChange={setSeparator}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select separator" />
                      </SelectTrigger>
                      <SelectContent>
                        {separators.map((sep) => (
                          <SelectItem key={sep.value} value={sep.value}>
                            {sep.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowercase">Convert to Lowercase</Label>
                    <Select value={lowercase.toString()} onValueChange={(value) => setLowercase(value === 'true')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={generateSlug} disabled={!inputText.trim()} className="w-full">
                  <Hash className="h-4 w-4 mr-2" />
                  Generate Slug
                </Button>
              </CardContent>
            </Card>

            {/* Generated Slug */}
            {generatedSlug && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Generated Slug
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(generatedSlug, 'Slug')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'Slug'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(`/${generatedSlug}`, 'URL Path')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'URL Path'}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Your SEO-friendly URL slug</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Slug</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm break-all">{generatedSlug}</code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">URL Path</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm break-all">/{generatedSlug}</code>
                    </div>
                  </div>
                  
                  {slugStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Length</div>
                        <div className="text-muted-foreground">{slugStats.length}</div>
                      </div>
                      <div>
                        <div className="font-medium">Words</div>
                        <div className="text-muted-foreground">{slugStats.wordCount}</div>
                      </div>
                      <div>
                        <div className="font-medium">Numbers</div>
                        <div className="text-muted-foreground">
                          {slugStats.containsNumbers ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Special Chars</div>
                        <div className="text-muted-foreground">
                          {slugStats.containsSpecialChars ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>Advanced slug generation options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remove-stop-words"
                      type="checkbox"
                      checked={removeStopWords}
                      onChange={(e) => setRemoveStopWords(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="remove-stop-words" className="text-sm">
                      Remove common stop words (a, an, the, and, etc.)
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-words">Maximum Words (0 = no limit)</Label>
                    <Input
                      id="max-words"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={maxWords}
                      onChange={(e) => setMaxWords(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Separator</Label>
                      <Select value={separator} onValueChange={setSeparator}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select separator" />
                        </SelectTrigger>
                        <SelectContent>
                          {separators.map((sep) => (
                            <SelectItem key={sep.value} value={sep.value}>
                              {sep.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Lowercase</Label>
                      <Select value={lowercase.toString()} onValueChange={(value) => setLowercase(value === 'true')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button onClick={generateSlug} disabled={!inputText.trim()} className="w-full">
                  <Hash className="h-4 w-4 mr-2" />
                  Generate Advanced Slug
                </Button>
              </CardContent>
            </Card>

            {/* Multiple Variants */}
            {inputText && (
              <Card>
                <CardHeader>
                  <CardTitle>Multiple Variants</CardTitle>
                  <CardDescription>Generate different slug variations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateMultipleSlugs().map((slug, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <code className="text-sm flex-1 mr-2">{slug}</code>
                        <Button 
                          onClick={() => copyToClipboard(slug, `Variant ${index + 1}`)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Slug Best Practices</CardTitle>
            <CardDescription>Guidelines for creating effective URL slugs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Do's</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use descriptive, readable words</li>
                    <li>• Keep slugs short and concise</li>
                    <li>• Use hyphens as separators (recommended)</li>
                    <li>• Include relevant keywords for SEO</li>
                    <li>• Use lowercase letters</li>
                    <li>• Remove unnecessary words and characters</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Don'ts</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Don't use underscores (use hyphens instead)</li>
                    <li>• Don't use special characters or symbols</li>
                    <li>• Don't make slugs too long</li>
                    <li>• Don't use uppercase letters</li>
                    <li>• Don't include dates if content ever updates</li>
                    <li>• Don't use excessive separators</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Good:</strong> /blog/web-development-tips
                  </div>
                  <div>
                    <strong>Bad:</strong> /blog/2024/01/15/web-development-tips-and-tricks-guide-for-beginners
                  </div>
                  <div>
                    <strong>Good:</strong> /products/blue-widget
                  </div>
                  <div>
                    <strong>Bad:</strong> /products/blue-widget-v2-special-edition-2024
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}