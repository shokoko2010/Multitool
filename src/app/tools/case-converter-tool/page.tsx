'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RotateCcw, Type } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConversionResult {
  name: string
  value: string
  description: string
}

export default function CaseConverterTool() {
  const [inputText, setInputText] = useState('')
  const [results, setResults] = useState<ConversionResult[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()

  const convertToCamelCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[A-Z]/, (char) => char.toLowerCase())
  }

  const convertToPascalCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[a-z]/, (char) => char.toUpperCase())
  }

  const convertToSnakeCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  const convertToKebabCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const convertToScreamingSnakeCase = (text: string): string => {
    return text
      .toUpperCase()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  const convertToTitleCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/^\s+|\s+$/g, '')
  }

  const convertToSentenceCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/^[a-z]/, (char) => char.toUpperCase())
  }

  const convertToLowerCase = (text: string): string => {
    return text.toLowerCase()
  }

  const convertToUpperCase = (text: string): string => {
    return text.toUpperCase()
  }

  const convertToDotCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '.')
      .replace(/^\.|\.$/g, '')
  }

  const convertToPathCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '/')
      .replace(/^\/|\/$/g, '')
  }

  const convertToConstantCase = (text: string): string => {
    return convertToScreamingSnakeCase(text)
  }

  const convertToTrainCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => '-' + char.toUpperCase())
      .replace(/^-|-$/g, '')
  }

  const convertAllCases = (text: string): ConversionResult[] => {
    if (!text.trim()) return []

    return [
      {
        name: 'Camel Case',
        value: convertToCamelCase(text),
        description: 'firstWordSecondWord (used in JavaScript variables)'
      },
      {
        name: 'Pascal Case',
        value: convertToPascalCase(text),
        description: 'FirstWordSecondWord (used in class names)'
      },
      {
        name: 'Snake Case',
        value: convertToSnakeCase(text),
        description: 'first_word_second_word (used in Python variables)'
      },
      {
        name: 'Kebab Case',
        value: convertToKebabCase(text),
        description: 'first-word-second-word (used in URLs and CSS)'
      },
      {
        name: 'Screaming Snake Case',
        value: convertToScreamingSnakeCase(text),
        description: 'FIRST_WORD_SECOND_WORD (used for constants)'
      },
      {
        name: 'Title Case',
        value: convertToTitleCase(text),
        description: 'First Word Second Word (used in titles)'
      },
      {
        name: 'Sentence Case',
        value: convertToSentenceCase(text),
        description: 'First word second word (used in sentences)'
      },
      {
        name: 'Lower Case',
        value: convertToLowerCase(text),
        description: 'all lowercase letters'
      },
      {
        name: 'Upper Case',
        value: convertToUpperCase(text),
        description: 'ALL UPPERCASE LETTERS'
      },
      {
        name: 'Dot Case',
        value: convertToDotCase(text),
        description: 'first.word.second.word (used in some configurations)'
      },
      {
        name: 'Path Case',
        value: convertToPathCase(text),
        description: 'first/word/second/word (used in file paths)'
      },
      {
        name: 'Constant Case',
        value: convertToConstantCase(text),
        description: 'FIRST_WORD_SECOND_WORD (alternative for constants)'
      },
      {
        name: 'Train Case',
        value: convertToTrainCase(text),
        description: 'First-Word-Second-Word (used in some frameworks)'
      }
    ]
  }

  const handleConvert = () => {
    if (!inputText.trim()) return
    
    const conversionResults = convertAllCases(inputText)
    setResults(conversionResults)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to clipboard",
    })
  }

  const downloadResults = () => {
    if (results.length === 0) return

    const content = `Case Conversion Results
========================

Original Text: ${inputText}

Converted Texts:
${results.map(result => 
  `${result.name}:
  ${result.value}
  Description: ${result.description}`
).join('\n\n')}

Generated on: ${new Date().toLocaleString()}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'case-conversion-results.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInputText('')
    setResults([])
  }

  const loadExample = () => {
    setInputText('Hello World! This is a TEST string.')
    handleConvert()
  }

  const getFilteredResults = () => {
    if (activeTab === 'all') return results
    
    const categories = {
      programming: ['Camel Case', 'Pascal Case', 'Snake Case', 'Kebab Case', 'Screaming Snake Case'],
      text: ['Title Case', 'Sentence Case', 'Lower Case', 'Upper Case'],
      other: ['Dot Case', 'Path Case', 'Constant Case', 'Train Case']
    }
    
    return results.filter(result => categories[activeTab as keyof typeof categories]?.includes(result.name))
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-6 w-6" />
            Case Converter Tool
          </CardTitle>
          <CardDescription>
            Convert text between different case formats for programming, writing, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleConvert} disabled={!inputText.trim()}>
                  Convert Text
                </Button>
                <Button variant="outline" onClick={loadExample}>
                  Load Example
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                {results.length > 0 && (
                  <Button variant="outline" onClick={downloadResults}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Enter text to convert:</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your text here..."
                  className="min-h-24"
                  onKeyPress={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && handleConvert()}
                />
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Cases ({results.length})</TabsTrigger>
                  <TabsTrigger value="programming">Programming (5)</TabsTrigger>
                  <TabsTrigger value="text">Text Formatting (4)</TabsTrigger>
                  <TabsTrigger value="other">Other (4)</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {getFilteredResults().map((result, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{result.name}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.value)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardDescription className="text-sm">
                            {result.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="font-mono text-sm bg-muted p-3 rounded break-all">
                              {result.value}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {result.value.length} characters
                              </Badge>
                              <Badge variant="outline">
                                {result.value.split(/\s+/).filter(w => w.length > 0).length} words
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Format Reference</CardTitle>
                <CardDescription>
                  Common use cases for different case formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Programming</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Camel Case:</strong> JavaScript variables</li>
                      <li><strong>Pascal Case:</strong> Class names</li>
                      <li><strong>Snake Case:</strong> Python variables</li>
                      <li><strong>Kebab Case:</strong> CSS classes, URLs</li>
                      <li><strong>Screaming Snake:</strong> Constants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Writing</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Title Case:</strong> Headings, titles</li>
                      <li><strong>Sentence Case:</strong> Sentences, paragraphs</li>
                      <li><strong>Lower Case:</strong> URLs, filenames</li>
                      <li><strong>Upper Case:</strong> Acronyms, emphasis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">Configuration</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Dot Case:</strong> Config keys</li>
                      <li><strong>Path Case:</strong> File paths</li>
                      <li><strong>Constant Case:</strong> Environment vars</li>
                      <li><strong>Train Case:</strong> Some frameworks</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Examples</CardTitle>
                <CardDescription>
                  See how different text converts across formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Example: "user profile settings"</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                      <div><strong>Camel:</strong> userProfileSettings</div>
                      <div><strong>Pascal:</strong> UserProfileSettings</div>
                      <div><strong>Snake:</strong> user_profile_settings</div>
                      <div><strong>Kebab:</strong> user-profile-settings</div>
                      <div><strong>Title:</strong> User Profile Settings</div>
                      <div><strong>Sentence:</strong> User profile settings</div>
                      <div><strong>Upper:</strong> USER PROFILE SETTINGS</div>
                      <div><strong>Dot:</strong> user.profile.settings</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Example: "API_ENDPOINT_URL"</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                      <div><strong>Camel:</strong> apiEndpointUrl</div>
                      <div><strong>Pascal:</strong> ApiEndpointUrl</div>
                      <div><strong>Snake:</strong> api_endpoint_url</div>
                      <div><strong>Kebab:</strong> api-endpoint-url</div>
                      <div><strong>Title:</strong> Api Endpoint Url</div>
                      <div><strong>Sentence:</strong> Api endpoint url</div>
                      <div><strong>Lower:</strong> api_endpoint_url</div>
                      <div><strong>Path:</strong> api/endpoint/url</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enter your text in the input field above</li>
                <li>• Click "Convert Text" to see all case format conversions</li>
                <li>• Use the tabs to filter by category (Programming, Text, Other)</li>
                <li>• Click the copy button to copy any converted text to clipboard</li>
                <li>• Use "Load Example" to see how the converter works</li>
                <li>• Download all results as a text file for reference</li>
                <li>• Supports mixed case, special characters, and multiple words</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}