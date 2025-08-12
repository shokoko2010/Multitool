'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Copy, FileText, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function LoremIpsumGenerator() {
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
    const sentence = []
    for (let i = 0; i < sentenceLength; i++) {
      const word = loremWords[Math.floor(Math.random() * loremWords.length)]
      sentence.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    }
    return sentence.join(' ') + '.'
  }

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 5) + 3
    const paragraph = []
    for (let i = 0; i < sentenceCount; i++) {
      paragraph.push(generateSentence())
    }
    return paragraph.join(' ')
  }

  const generateLoremIpsum = () => {
    let result = ''
    
    if (startWithLorem && type === 'paragraphs') {
      result = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
    }

    switch (type) {
      case 'words':
        const words = []
        for (let i = 0; i < count; i++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
        }
        result = words.join(' ')
        break
      
      case 'sentences':
        const sentences = []
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence())
        }
        result = sentences.join(' ')
        break
      
      case 'paragraphs':
        const paragraphs = []
        const paragraphCount = startWithLorem ? count - 1 : count
        for (let i = 0; i < paragraphCount; i++) {
          paragraphs.push(generateParagraph())
        }
        result += paragraphs.join('\n\n')
        break
    }

    setGeneratedText(result)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText)
    toast({
      title: "Copied!",
      description: "Lorem ipsum text copied to clipboard"
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lorem Ipsum Generator</h1>
        <p className="text-muted-foreground">Generate placeholder text for your designs and prototypes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generator Settings
            </CardTitle>
            <CardDescription>Configure your lorem ipsum generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">Generate</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
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

            {type === 'paragraphs' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="start-with-lorem"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="start-with-lorem">Start with "Lorem ipsum"</Label>
              </div>
            )}

            <Button onClick={generateLoremIpsum} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Lorem Ipsum
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Text
            </CardTitle>
            <CardDescription>Your lorem ipsum placeholder text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={generatedText}
                readOnly
                className="min-h-[200px]"
                placeholder="Generated text will appear here..."
              />
              {generatedText && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {generatedText && (
              <div className="text-sm text-muted-foreground">
                <p>Type: {type}</p>
                <p>Count: {count}</p>
                <p>Characters: {generatedText.length}</p>
                <p>Words: {generatedText.split(/\s+/).filter(word => word.length > 0).length}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}