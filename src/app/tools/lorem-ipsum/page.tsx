'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, RefreshCw, FileText, Hash } from 'lucide-react'

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
]

const LOREM_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
]

const COMMON_PATTERNS = [
  { name: "Words", count: 20 },
  { name: "Sentences", count: 3 },
  { name: "Paragraphs", count: 1 },
  { name: "Blog Post", count: 3 },
  { name: "Full Page", count: 5 }
]

export default function LoremIpsum() {
  const [type, setType] = useState<'words' | 'sentences' | 'paragraphs'>('words')
  const [count, setCount] = useState(20)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [generatedText, setGeneratedText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateLoremIpsum = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      let result = ''
      
      if (type === 'words') {
        result = generateWords(count)
      } else if (type === 'sentences') {
        result = generateSentences(count)
      } else if (type === 'paragraphs') {
        result = generateParagraphs(count)
      }
      
      setGeneratedText(result)
      setIsGenerating(false)
    }, 500)
  }

  const generateWords = (numWords: number): string => {
    const words: string[] = []
    
    if (startWithLorem) {
      words.push('Lorem', 'ipsum')
    }
    
    while (words.length < numWords) {
      const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
      words.push(randomWord)
    }
    
    return words.slice(0, numWords).join(' ')
  }

  const generateSentences = (numSentences: number): string => {
    const sentences: string[] = []
    
    for (let i = 0; i < numSentences; i++) {
      const sentenceWords = Math.floor(Math.random() * 10) + 5 // 5-15 words per sentence
      const sentence = generateWords(sentenceWords)
      sentences.push(capitalizeFirstLetter(sentence) + '.')
    }
    
    return sentences.join(' ')
  }

  const generateParagraphs = (numParagraphs: number): string => {
    const paragraphs: string[] = []
    
    for (let i = 0; i < numParagraphs; i++) {
      const sentences = Math.floor(Math.random() * 4) + 3 // 3-6 sentences per paragraph
      const paragraph = generateSentences(sentences)
      paragraphs.push(paragraph)
    }
    
    return paragraphs.join('\n\n')
  }

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadText = () => {
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

  const loadPattern = (patternName: string) => {
    const pattern = COMMON_PATTERNS.find(p => p.name === patternName)
    if (pattern) {
      if (pattern.name === "Words") {
        setType('words')
        setCount(pattern.count)
      } else if (pattern.name === "Sentences") {
        setType('sentences')
        setCount(pattern.count)
      } else if (pattern.name === "Paragraphs") {
        setType('paragraphs')
        setCount(pattern.count)
      } else if (pattern.name === "Blog Post") {
        setType('paragraphs')
        setCount(pattern.count)
      } else if (pattern.name === "Full Page") {
        setType('paragraphs')
        setCount(pattern.count)
      }
    }
  }

  const loadSample = () => {
    setGeneratedText(LOREM_PARAGRAPHS.join('\n\n'))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lorem Ipsum Generator</h1>
        <p className="text-muted-foreground">
          Generate placeholder text for testing and design purposes
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Lorem Ipsum
            </CardTitle>
            <CardDescription>
              Customize your Lorem ipsum text generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(value: 'words' | 'sentences' | 'paragraphs') => setType(value)}>
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
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </div>
            </div>

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

            <div className="flex gap-2 flex-wrap">
              {COMMON_PATTERNS.map((pattern) => (
                <Button
                  key={pattern.name}
                  variant="outline"
                  size="sm"
                  onClick={() => loadPattern(pattern.name)}
                >
                  {pattern.name} ({pattern.count})
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample
              </Button>
            </div>

            <Button 
              onClick={generateLoremIpsum} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Hash className="mr-2 h-4 w-4" />
                  Generate Lorem Ipsum
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedText && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Text</CardTitle>
                  <CardDescription>
                    Your Lorem ipsum text is ready
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadText}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{generatedText}</pre>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {generatedText.split(' ').length} words
                  </Badge>
                  <Badge variant="outline">
                    {generatedText.split(/[.!?]+/).filter(Boolean).length} sentences
                  </Badge>
                  <Badge variant="outline">
                    {generatedText.split(/\n\s*\n/).filter(Boolean).length} paragraphs
                  </Badge>
                  <Badge variant="outline">
                    {generatedText.length} characters
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About Lorem Ipsum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Lorem ipsum is dummy text used in the printing and typesetting industry. 
                It has been the industry's standard dummy text ever since the 1500s, 
                when an unknown printer took a galley of type and scrambled it to make 
                a type specimen book.
              </p>
              <p>
                It has survived not only five centuries, but also the leap into 
                electronic typesetting, remaining essentially unchanged. It was 
                popularised in the 1960s with the release of Letraset sheets 
                containing Lorem ipsum passages, and more recently with desktop 
                publishing software like Aldus PageMaker including versions of Lorem ipsum.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}