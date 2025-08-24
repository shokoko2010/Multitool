'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, FileText, RefreshCw } from 'lucide-react'

export default function LoremIpsumGeneratorTool() {
  const [type, setType] = useState('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [generatedText, setGeneratedText] = useState('')

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ]

  const generateSentence = () => {
    const sentenceLength = Math.floor(Math.random() * 10) + 5
    let sentence = []
    for (let i = 0; i < sentenceLength; i++) {
      sentence.push(loremWords[Math.floor(Math.random() * loremWords.length)])
    }
    return sentence.join(' ') + '.'
  }

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 5) + 3
    let paragraph = []
    for (let i = 0; i < sentenceCount; i++) {
      paragraph.push(generateSentence())
    }
    return paragraph.join(' ')
  }

  const generateLorem = () => {
    let result = []
    
    if (startWithLorem) {
      result.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
    }

    switch (type) {
      case 'words':
        for (let i = 0; i < count; i++) {
          result.push(loremWords[Math.floor(Math.random() * loremWords.length)])
        }
        setGeneratedText(result.join(' '))
        break
      case 'sentences':
        for (let i = 0; i < count; i++) {
          result.push(generateSentence())
        }
        setGeneratedText(result.join(' '))
        break
      case 'paragraphs':
        for (let i = 0; i < count; i++) {
          result.push(generateParagraph())
        }
        setGeneratedText(result.join('\n\n'))
        break
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText)
  }

  const downloadAsFile = () => {
    const blob = new Blob([generatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lorem-ipsum.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Lorem Ipsum Generator</h1>
          <p className="text-muted-foreground">
            Generate placeholder text for your designs and prototypes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generator Settings
              </CardTitle>
              <CardDescription>
                Configure your Lorem ipsum generation options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words">Words</SelectItem>
                    <SelectItem value="sentences">Sentences</SelectItem>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Count</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="startWithLorem"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="startWithLorem">Start with "Lorem ipsum"</Label>
              </div>

              <Button onClick={generateLorem} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Lorem Ipsum
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Text</CardTitle>
              <CardDescription>
                Your Lorem ipsum text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                placeholder="Click 'Generate Lorem Ipsum' to create placeholder text..."
                className="min-h-[200px] resize-none"
              />
              
              {generatedText && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadAsFile} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Lorem Ipsum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>
                Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing 
                industries for previewing layouts and visual mockups.
              </p>
              <h4>Common Uses:</h4>
              <ul>
                <li>Website design and wireframing</li>
                <li>Print media and publications</li>
                <li>Typography testing</li>
                <li>Layout prototyping</li>
                <li>Content placeholder during development</li>
              </ul>
              <h4>Why use Lorem ipsum?</h4>
              <p>
                Lorem ipsum text has a normal distribution of letters, making it look like readable 
                English while distracting from the actual design being presented.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}