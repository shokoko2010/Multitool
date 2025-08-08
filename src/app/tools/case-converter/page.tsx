'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, RotateCcw, FileText, Type } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CaseConverterTool() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const { toast } = useToast()

  const caseConversions = [
    {
      name: 'UPPERCASE',
      description: 'Convert all text to uppercase',
      converter: (text: string) => text.toUpperCase(),
      color: 'bg-red-100 text-red-800'
    },
    {
      name: 'lowercase',
      description: 'Convert all text to lowercase',
      converter: (text: string) => text.toLowerCase(),
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Title Case',
      description: 'Convert to title case (First Letter Of Each Word)',
      converter: (text: string) => {
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      },
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'Sentence case',
      description: 'Convert to sentence case (first letter uppercase)',
      converter: (text: string) => {
        return text.replace(/(^\w|\.\s*\w)/g, (match) => 
          match.toUpperCase()
        )
      },
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'camelCase',
      description: 'Convert to camelCase (first word lowercase)',
      converter: (text: string) => {
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase()
        }).replace(/\s+/g, '')
      },
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      name: 'PascalCase',
      description: 'Convert to PascalCase (FirstLetterOfEachWord)',
      converter: (text: string) => {
        return text.replace(/(?:^\w|\b\w)/g, (word) => 
          word.toUpperCase()
        ).replace(/\s+/g, '')
      },
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      name: 'snake_case',
      description: 'Convert to snake_case (words separated by underscores)',
      converter: (text: string) => {
        return text.replace(/\W+/g, '_')
          .replace(/([a-z\d])([A-Z])/g, '$1_$2')
          .toLowerCase()
      },
      color: 'bg-teal-100 text-teal-800'
    },
    {
      name: 'kebab-case',
      description: 'Convert to kebab-case (words separated by hyphens)',
      converter: (text: string) => {
        return text.replace(/\W+/g, '-')
          .replace(/([a-z\d])([A-Z])/g, '$1-$2')
          .toLowerCase()
      },
      color: 'bg-orange-100 text-orange-800'
    },
    {
      name: 'CONSTANT_CASE',
      description: 'Convert to CONSTANT_CASE (uppercase with underscores)',
      converter: (text: string) => {
        return text.replace(/\W+/g, '_')
          .replace(/([a-z\d])([A-Z])/g, '$1_$2')
          .toUpperCase()
      },
      color: 'bg-pink-100 text-pink-800'
    },
    {
      name: 'Train-Case',
      description: 'Convert to Train-Case (hyphens, first letter uppercase)',
      converter: (text: string) => {
        return text.replace(/\W+/g, '-')
          .replace(/([a-z\d])([A-Z])/g, '$1-$2')
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('-')
      },
      color: 'bg-cyan-100 text-cyan-800'
    }
  ]

  const convertCase = (converter: (text: string) => string) => {
    if (!inputText.trim()) {
      toast({
        title: "No input text",
        description: "Please enter some text to convert.",
        variant: "destructive"
      })
      return
    }
    
    const converted = converter(inputText)
    setOutputText(converted)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    })
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
  }

  const loadExample = () => {
    setInputText('Hello World! This is a test case converter tool.')
  }

  const characterStats = {
    input: inputText.length,
    output: outputText.length,
    words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
    lines: inputText.split('\n').length
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="h-5 w-5" />
            <span>Case Converter Tool</span>
          </CardTitle>
          <CardDescription>
            Convert text between different case formats including uppercase, lowercase, title case, camelCase, snake_case, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={loadExample}>
              <FileText className="h-3 w-3 mr-1" />
              Load Example
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Enter the text you want to convert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input">Text Input</Label>
              <Textarea
                id="input"
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Characters</Label>
                <p className="font-medium">{characterStats.input}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Words</Label>
                <p className="font-medium">{characterStats.words}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Lines</Label>
                <p className="font-medium">{characterStats.lines}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Output Chars</Label>
                <p className="font-medium">{characterStats.output}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Converted Text</CardTitle>
            <CardDescription>The result will appear here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="output">Output</Label>
              <Textarea
                id="output"
                placeholder="Converted text will appear here..."
                value={outputText}
                readOnly
                rows={8}
                className="resize-none bg-gray-50"
              />
            </div>
            
            {outputText && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => copyToClipboard(outputText)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Output
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(inputText + '\n\n' + outputText)}
                >
                  Copy Both
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Case Conversion Options */}
      <Card>
        <CardHeader>
          <CardTitle>Case Conversion Options</CardTitle>
          <CardDescription>Click on any option to convert your text</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
              <TabsTrigger value="all">All Formats</TabsTrigger>
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="programming">Programming</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {caseConversions.map((conversion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => convertCase(conversion.converter)}
                  >
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <Badge className={conversion.color}>
                          {conversion.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {conversion.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {caseConversions.slice(0, 4).map((conversion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => convertCase(conversion.converter)}
                  >
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <Badge className={conversion.color}>
                          {conversion.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {conversion.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="programming" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {caseConversions.slice(4).map((conversion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => convertCase(conversion.converter)}
                  >
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <Badge className={conversion.color}>
                          {conversion.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {conversion.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Case Conversion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Case conversion is essential in programming and text formatting. Different programming languages 
            and style guides have specific conventions for naming variables, functions, classes, and constants.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Common Use Cases:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Programming:</strong> Variable names, function names, class names</li>
              <li>• <strong>Web Development:</strong> CSS class names, HTML attributes, URL slugs</li>
              <li>• <strong>Documentation:</strong> Headings, titles, labels</li>
              <li>• <strong>Database:</strong> Table names, column names, SQL queries</li>
            </ul>
          </div>
          <Separator className="my-3" />
          <div className="space-y-2">
            <h4 className="font-medium">Programming Language Conventions:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>JavaScript:</strong> camelCase for variables, PascalCase for classes</li>
              <li>• <strong>Python:</strong> snake_case for variables and functions</li>
              <li>• <strong>Java:</strong> camelCase for variables, PascalCase for classes</li>
              <li>• <strong>C#:</strong> PascalCase for public members, camelCase for private</li>
              <li>• <strong>SQL:</strong> snake_case for table and column names</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}