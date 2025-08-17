"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RefreshCw, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function LoremIpsumGenerator() {
  const [outputText, setOutputText] = useState('')
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)

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

  const generateLoremIpsum = () => {
    let result = ''
    
    if (startWithLorem) {
      result = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, '
    }

    const generateSentence = () => {
      const sentenceLength = Math.floor(Math.random() * 15) + 5
      let sentence = []
      
      for (let i = 0; i < sentenceLength; i++) {
        const word = loremWords[Math.floor(Math.random() * loremWords.length)]
        sentence.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
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

    if (type === 'paragraphs') {
      const paragraphs = []
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem) {
          // First paragraph already has the lorem ipsum start
          const remainingSentences = Math.floor(Math.random() * 4) + 2
          for (let j = 0; j < remainingSentences; j++) {
            result += ' ' + generateSentence()
          }
          paragraphs.push(result)
          result = ''
        } else {
          paragraphs.push(generateParagraph())
        }
      }
      result = paragraphs.join('\n\n')
    } else if (type === 'sentences') {
      const sentences = []
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence())
      }
      result = sentences.join(' ')
    } else if (type === 'words') {
      const words = []
      for (let i = 0; i < count; i++) {
        const word = loremWords[Math.floor(Math.random() * loremWords.length)]
        words.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
      }
      result = words.join(' ') + '.'
    }

    setOutputText(result)
    toast.success('Lorem ipsum text generated!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lorem-ipsum.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setOutputText('')
    toast.success('Cleared!')
  }

  const getTextStats = (text: string) => {
    return {
      characters: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split('\n').length,
      paragraphs: text.trim() ? text.split('\n\n').filter(p => p.trim()).length : 0
    }
  }

  const stats = getTextStats(outputText)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Lorem Ipsum Generator</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate placeholder text (Lorem Ipsum) for your designs, prototypes, and testing purposes.
            </p>
          </motion.div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Generator Options
            </CardTitle>
            <CardDescription>
              Configure your Lorem ipsum generation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                    <SelectItem value="sentences">Sentences</SelectItem>
                    <SelectItem value="words">Words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Count</label>
                <Select value={count.toString()} onValueChange={(value) => setCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Start with "Lorem ipsum"</label>
                <Select value={startWithLorem.toString()} onValueChange={(value) => setStartWithLorem(value === 'true')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={generateLoremIpsum} size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Text
            </CardTitle>
            <CardDescription>
              Your Lorem ipsum text will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={outputText}
              readOnly
              className="min-h-[300px] font-serif text-base leading-relaxed"
              placeholder="Click 'Generate' to create Lorem ipsum text..."
            />
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Hash className="h-3 w-3 mr-1" />
                {stats.characters} characters
              </Badge>
              <Badge variant="secondary">
                <Type className="h-3 w-3 mr-1" />
                {stats.words} words
              </Badge>
              <Badge variant="secondary">
                <AlignLeft className="h-3 w-3 mr-1" />
                {stats.lines} lines
              </Badge>
              {type === 'paragraphs' && (
                <Badge variant="secondary">
                  <FileText className="h-3 w-3 mr-1" />
                  {stats.paragraphs} paragraphs
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopy} disabled={!outputText} size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleDownload} disabled={!outputText} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Common Uses</CardTitle>
            <CardDescription>
              Lorem ipsum is commonly used in these scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Web Design</h4>
                <p className="text-sm text-muted-foreground">
                  Placeholder text for website mockups and wireframes
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Print Design</h4>
                <p className="text-sm text-muted-foreground">
                  Filling space in brochures, magazines, and books
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Testing typography, layout, and design elements
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Prototyping</h4>
                <p className="text-sm text-muted-foreground">
                  Creating realistic content for prototypes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}