'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, RotateCcw } from 'lucide-react'

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')

  const convertToUppercase = () => {
    setOutputText(inputText.toUpperCase())
  }

  const convertToLowercase = () => {
    setOutputText(inputText.toLowerCase())
  }

  const convertToTitleCase = () => {
    setOutputText(inputText.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    ))
  }

  const convertToSentenceCase = () => {
    setOutputText(inputText.replace(/(^\w|\.\s*\w)/g, (txt) => 
      txt.toUpperCase()
    ))
  }

  const convertToCamelCase = () => {
    setOutputText(inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    ).replace(/\s+/g, ''))
  }

  const convertToPascalCase = () => {
    setOutputText(inputText.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
      word.toUpperCase()
    ).replace(/\s+/g, ''))
  }

  const convertToSnakeCase = () => {
    setOutputText(inputText.replace(/\s+/g, '_').toLowerCase())
  }

  const convertToKebabCase = () => {
    setOutputText(inputText.replace(/\s+/g, '-').toLowerCase())
  }

  const convertToConstantCase = () => {
    setOutputText(inputText.replace(/\s+/g, '_').toUpperCase())
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
  }

  const swapText = () => {
    setInputText(outputText)
    setOutputText(inputText)
  }

  const caseOptions = [
    { name: 'UPPERCASE', action: convertToUppercase, description: 'Convert to uppercase' },
    { name: 'lowercase', action: convertToLowercase, description: 'Convert to lowercase' },
    { name: 'Title Case', action: convertToTitleCase, description: 'Convert to title case' },
    { name: 'Sentence case', action: convertToSentenceCase, description: 'Convert to sentence case' },
    { name: 'camelCase', action: convertToCamelCase, description: 'Convert to camelCase' },
    { name: 'PascalCase', action: convertToPascalCase, description: 'Convert to PascalCase' },
    { name: 'snake_case', action: convertToSnakeCase, description: 'Convert to snake_case' },
    { name: 'kebab-case', action: convertToKebabCase, description: 'Convert to kebab-case' },
    { name: 'CONSTANT_CASE', action: convertToConstantCase, description: 'Convert to CONSTANT_CASE' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Text Case Converter</h1>
          <p className="text-muted-foreground">
            Convert text between different case formats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>
                Enter or paste your text here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="mt-4 text-sm text-muted-foreground">
                Characters: {inputText.length} | Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>Output Text</CardTitle>
              <CardDescription>
                Converted text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={outputText}
                readOnly
                rows={8}
                className="resize-none bg-muted"
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={copyToClipboard} disabled={!outputText}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={swapText} disabled={!outputText}>
                  Swap
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              {outputText && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Characters: {outputText.length} | Words: {outputText.trim() ? outputText.trim().split(/\s+/).length : 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Case Options */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Case Conversion Options</CardTitle>
            <CardDescription>
              Choose how you want to convert your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={option.action}
                  disabled={!inputText}
                  className="h-auto py-4 text-left"
                >
                  <div>
                    <div className="font-semibold">{option.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Case Examples</CardTitle>
            <CardDescription>
              See how different cases look with example text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>UPPERCASE:</strong> HELLO WORLD</div>
              <div><strong>lowercase:</strong> hello world</div>
              <div><strong>Title Case:</strong> Hello World</div>
              <div><strong>Sentence case:</strong> Hello world</div>
              <div><strong>camelCase:</strong> helloWorld</div>
              <div><strong>PascalCase:</strong> HelloWorld</div>
              <div><strong>snake_case:</strong> hello_world</div>
              <div><strong>kebab-case:</strong> hello-world</div>
              <div><strong>CONSTANT_CASE:</strong> HELLO_WORLD</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}