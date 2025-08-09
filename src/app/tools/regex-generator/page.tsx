'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Code, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Plus, Settings } from 'lucide-react'

interface PatternTemplate {
  name: string
  description: string
  category: string
  pattern: string
  examples: string[]
}

interface GeneratedPattern {
  pattern: string
  description: string
  examples: string[]
  flags: string[]
}

class RegexGenerator {
  state = {
    selectedTemplate: '',
    customOptions: {
      caseSensitive: true,
      wordBoundary: false,
      multiline: false,
      global: true,
      unicode: false
    },
    customText: '',
    generatedPattern: '',
    generatedDescription: '',
    generatedExamples: [] as string[],
    testResults: [] as string[]
  }

  templates: PatternTemplate[] = [
    {
      name: 'Email Address',
      description: 'Matches standard email addresses',
      category: 'Contact',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      examples: ['user@example.com', 'john.doe@company.co.uk', 'test+alias@gmail.com']
    },
    {
      name: 'Phone Number',
      description: 'Matches various phone number formats',
      category: 'Contact',
      pattern: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
      examples: ['+1-555-0123', '(555) 123-4567', '555.123.4567']
    },
    {
      name: 'URL',
      description: 'Matches web addresses',
      category: 'Web',
      pattern: 'https?://[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*',
      examples: ['https://www.example.com', 'http://google.com/search', 'https://github.com/user/repo']
    },
    {
      name: 'IP Address',
      description: 'Matches IPv4 addresses',
      category: 'Network',
      pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      examples: ['192.168.1.1', '10.0.0.1', '172.16.254.1']
    },
    {
      name: 'Date',
      description: 'Matches dates in various formats',
      category: 'Date',
      pattern: '\\b\\d{1,4}[/-]\\d{1,2}[/-]\\d{1,4}\\b',
      examples: ['2024-01-15', '15/01/2024', '01-15-2024']
    },
    {
      name: 'Credit Card',
      description: 'Matches credit card numbers',
      category: 'Finance',
      pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
      examples: ['4111-1111-1111-1111', '5424 1801 2000 9999', '371449635398431']
    },
    {
      name: 'Hex Color',
      description: 'Matches hexadecimal color codes',
      category: 'Design',
      pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
      examples: ['#FF5733', '#00FF00', '#4169E1']
    },
    {
      name: 'Username',
      description: 'Matches typical username formats',
      category: 'User',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,15}$',
      examples: ['johndoe', 'jane_smith', 'user123']
    },
    {
      name: 'Password',
      description: 'Matches strong password requirements',
      category: 'Security',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      examples: ['Password123!', 'Secure@2024', 'Str0ngP@ss']
    },
    {
      name: 'Zip Code',
      description: 'Matches postal codes',
      category: 'Address',
      pattern: '\\b\\d{5}(?:[-\\s]\\d{4})?\\b',
      examples: ['90210', '10001-1234', '12345']
    }
  ]

  generatePattern() {
    const { selectedTemplate, customOptions, customText } = this.state
    
    if (selectedTemplate) {
      const template = this.templates.find(t => t.name === selectedTemplate)
      if (template) {
        let pattern = template.pattern
        let description = template.description
        let examples = [...template.examples]

        // Apply custom options
        if (!customOptions.caseSensitive) {
          pattern = pattern.replace(/[a-zA-Z]/g, (match) => {
            const lower = match.toLowerCase()
            const upper = match.toUpperCase()
            return `[${lower}${upper}]`
          })
        }

        if (customOptions.wordBoundary) {
          pattern = `\\b${pattern}\\b`
        }

        if (customOptions.unicode) {
          pattern = '(?:' + pattern + '|\\p{L}+)'
        }

        this.setState({
          generatedPattern: pattern,
          generatedDescription: description,
          generatedExamples: examples
        })
      }
    } else if (customText) {
      // Generate pattern from custom text analysis
      const pattern = this.analyzeCustomText(customText)
      this.setState({
        generatedPattern: pattern,
        generatedDescription: 'Pattern generated from custom text analysis',
        generatedExamples: [customText]
      })
    }
  }

  analyzeCustomText(text: string): string {
    // Simple text analysis to generate patterns
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) return ''
    
    const firstLine = lines[0].trim()
    
    // Check for email patterns
    if (firstLine.includes('@') && firstLine.includes('.')) {
      return '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
    }
    
    // Check for phone patterns
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(firstLine)) {
      return '\\+?\\d{1,3}[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}'
    }
    
    // Check for URL patterns
    if (firstLine.startsWith('http')) {
      return 'https?://[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*'
    }
    
    // Check for date patterns
    if (/\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}/.test(firstLine)) {
      return '\\b\\d{1,4}[-/]\\d{1,2}[-/]\\d{1,4}\\b'
    }
    
    // Check for numeric patterns
    if (/\b\d+\b/.test(firstLine)) {
      return '\\b\\d+\\b'
    }
    
    // Default pattern for text
    return this.generateTextPattern(firstLine)
  }

  generateTextPattern(text: string): string {
    // Simple pattern generation for text
    const words = text.split(/\s+/)
    if (words.length === 1) {
      return words[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    
    // Generate pattern for multiple words
    const pattern = words.map(word => 
      word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('\\s+')
    
    return pattern
  }

  testPattern(pattern: string, testText: string): string[] {
    try {
      const flags = this.state.customOptions.multiline ? 'gm' : 'g'
      const regex = new RegExp(pattern, flags)
      const matches = testText.match(regex)
      return matches || []
    } catch (error) {
      return []
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  downloadPattern() {
    const { generatedPattern, generatedDescription, generatedExamples } = this.state
    const content = {
      pattern: generatedPattern,
      description: generatedDescription,
      examples: generatedExamples,
      flags: this.getFlags(),
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'regex_pattern.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  getFlags(): string[] {
    const flags = []
    if (!this.state.customOptions.caseSensitive) flags.push('i')
    if (this.state.customOptions.multiline) flags.push('m')
    if (this.state.customOptions.global) flags.push('g')
    if (this.state.customOptions.unicode) flags.push('u')
    return flags
  }

  setState(newState: Partial<typeof this.state>) {
    this.state = { ...this.state, ...newState }
  }
}

// React component using the generator class
export default function RegexGeneratorTool() {
  const generator = new RegexGenerator()
  const [state, setState] = useState(generator.state)

  const updateState = (newState: Partial<typeof generator.state>) => {
    const updatedState = { ...state, ...newState }
    setState(updatedState)
    generator.setState(newState)
  }

  const generatePattern = () => {
    generator.generatePattern()
    updateState({
      generatedPattern: generator.state.generatedPattern,
      generatedDescription: generator.state.generatedDescription,
      generatedExamples: generator.state.generatedExamples
    })
  }

  const testPattern = () => {
    if (!state.generatedPattern || !state.customText) return
    
    const results = generator.testPattern(state.generatedPattern, state.customText)
    updateState({ testResults: results })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadPattern = () => {
    generator.downloadPattern()
  }

  const applyTemplate = (templateName: string) => {
    updateState({ selectedTemplate: templateName })
  }

  const getFlagString = () => {
    return generator.getFlags().join('') || '(none)'
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Regex Pattern Generator
            </CardTitle>
            <CardDescription>
              Generate regular expression patterns from templates or custom text analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <div>
                  <Label htmlFor="template-select">Choose a Template</Label>
                  <Select value={state.selectedTemplate} onValueChange={applyTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pattern template" />
                    </SelectTrigger>
                    <SelectContent>
                      {generator.templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {state.selectedTemplate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{state.selectedTemplate}</CardTitle>
                      <CardDescription>{generator.templates.find(t => t.name === state.selectedTemplate)?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Pattern Examples</Label>
                          <div className="mt-2 space-y-1">
                            {generator.templates.find(t => t.name === state.selectedTemplate)?.examples.map((example, index) => (
                              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                <code>{example}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label>Pattern Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="case-sensitive"
                          checked={state.customOptions.caseSensitive}
                          onCheckedChange={(checked) => 
                            updateState({ customOptions: { ...state.customOptions, caseSensitive: checked as boolean } })
                          }
                        />
                        <Label htmlFor="case-sensitive" className="text-sm">Case Sensitive</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="word-boundary"
                          checked={state.customOptions.wordBoundary}
                          onCheckedChange={(checked) => 
                            updateState({ customOptions: { ...state.customOptions, wordBoundary: checked as boolean } })
                          }
                        />
                        <Label htmlFor="word-boundary" className="text-sm">Word Boundary</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="multiline"
                          checked={state.customOptions.multiline}
                          onCheckedChange={(checked) => 
                            updateState({ customOptions: { ...state.customOptions, multiline: checked as boolean } })
                          }
                        />
                        <Label htmlFor="multiline" className="text-sm">Multiline</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="global"
                          checked={state.customOptions.global}
                          onCheckedChange={(checked) => 
                            updateState({ customOptions: { ...state.customOptions, global: checked as boolean } })
                          }
                        />
                        <Label htmlFor="global" className="text-sm">Global</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={generatePattern} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Pattern
                </Button>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div>
                  <Label htmlFor="custom-text">Custom Text for Analysis</Label>
                  <Textarea
                    id="custom-text"
                    placeholder="Enter text to analyze and generate pattern from..."
                    value={state.customText}
                    onChange={(e) => updateState({ customText: e.target.value })}
                    rows={6}
                  />
                </div>

                <Button onClick={generatePattern} disabled={!state.customText} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Pattern from Text
                </Button>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                {state.generatedPattern ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Generated Pattern</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(state.generatedPattern)}>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={downloadPattern}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label>Pattern</Label>
                            <code className="block bg-gray-100 p-3 rounded text-sm mt-1">
                              /{state.generatedPattern}/{getFlagString()}
                            </code>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">{state.generatedDescription}</p>
                          </div>
                          <div>
                            <Label>Flags</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {generator.getFlags().map((flag, index) => (
                                <Badge key={index} variant="outline">{flag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Test Pattern</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="test-text">Test Text</Label>
                          <Textarea
                            id="test-text"
                            placeholder="Enter text to test your generated pattern..."
                            value={state.customText}
                            onChange={(e) => updateState({ customText: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <Button onClick={testPattern} disabled={!state.customText} className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Test Pattern
                        </Button>

                        {state.testResults.length > 0 && (
                          <div>
                            <Label>Test Results ({state.testResults.length} matches)</Label>
                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                              {state.testResults.map((result, index) => (
                                <div key={index} className="text-sm bg-green-50 p-2 rounded">
                                  <code className="text-green-700">{result}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Generate a pattern first to test it.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {generator.templates.map((template) => (
                <Card 
                  key={template.name} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => applyTemplate(template.name)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Template Library:</strong> 10+ pre-built regex patterns
            </div>
            <div>
              <strong>Custom Analysis:</strong> Generate patterns from your text
            </div>
            <div>
              <strong>Pattern Options:</strong> Customize case sensitivity, boundaries, flags
            </div>
            <div>
              <strong>Real-time Testing:</strong> Test generated patterns instantly
            </div>
            <div>
              <strong>Export Patterns:</strong> Download patterns as JSON
            </div>
            <div>
              <strong>Easy Copy:</strong> One-click copy to clipboard
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}