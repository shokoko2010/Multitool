"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, ArrowLeftRight } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function TextReverser() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [reverseType, setReverseType] = useState<'characters' | 'words' | 'lines'>('characters')

  const reverseText = (text: string, type: string) => {
    if (!text) return ''
    
    switch (type) {
      case 'characters':
        return text.split('').reverse().join('')
      case 'words':
        return text.split(' ').reverse().join(' ')
      case 'lines':
        return text.split('\n').reverse().join('\n')
      default:
        return text
    }
  }

  const handleReverse = () => {
    const reversed = reverseText(inputText, reverseType)
    setOutputText(reversed)
    toast.success('Text reversed successfully!')
  }

  const handleSwap = () => {
    setInputText(outputText)
    setOutputText(inputText)
    toast.success('Swapped input and output!')
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
    a.download = 'reversed-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    toast.success('Cleared!')
  }

  const getTextStats = (text: string) => {
    return {
      characters: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split('\n').length
    }
  }

  const inputStats = getTextStats(inputText)
  const outputStats = getTextStats(outputText)

  const getReverseExample = (type: string) => {
    switch (type) {
      case 'characters':
        return { input: 'Hello World', output: 'dlroW olleH' }
      case 'words':
        return { input: 'Hello World Today', output: 'Today World Hello' }
      case 'lines':
        return { input: 'Line 1\nLine 2\nLine 3', output: 'Line 3\nLine 2\nLine 1' }
      default:
        return { input: '', output: '' }
    }
  }

  const example = getReverseExample(reverseType)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Text Reverser</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reverse text in different ways - by characters, words, or lines. Perfect for text manipulation and creative writing.
            </p>
          </motion.div>
        </div>

        {/* Reverse Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Reverse Type
            </CardTitle>
            <CardDescription>
              Choose how you want to reverse your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'characters', label: 'Reverse Characters', description: 'Reverse each character in the text', example: 'Hello → olleH' },
                { id: 'words', label: 'Reverse Words', description: 'Reverse the order of words', example: 'Hello World → World Hello' },
                { id: 'lines', label: 'Reverse Lines', description: 'Reverse the order of lines', example: 'Line 1\\nLine 2 → Line 2\\nLine 1' }
              ].map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={reverseType === option.id ? "default" : "outline"}
                    className="w-full h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setReverseType(option.id as any)}
                  >
                    <ArrowLeftRight className="h-6 w-6" />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground text-center">{option.description}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {/* Example */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Example:</p>
              <div className="font-mono text-sm">
                <div className="text-green-600">Input:  "{example.input}"</div>
                <div className="text-blue-600">Output: "{example.output}"</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Input Text
              </CardTitle>
              <CardDescription>
                Enter or paste your text here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {inputStats.characters} chars
                </Badge>
                <Badge variant="secondary">
                  <Type className="h-3 w-3 mr-1" />
                  {inputStats.words} words
                </Badge>
                <Badge variant="secondary">
                  <AlignLeft className="h-3 w-3 mr-1" />
                  {inputStats.lines} lines
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Output Text
              </CardTitle>
              <CardDescription>
                Reversed text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[200px] font-mono text-sm"
                placeholder="Reversed text will appear here..."
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {outputStats.characters} chars
                </Badge>
                <Badge variant="secondary">
                  <Type className="h-3 w-3 mr-1" />
                  {outputStats.words} words
                </Badge>
                <Badge variant="secondary">
                  <AlignLeft className="h-3 w-3 mr-1" />
                  {outputStats.lines} lines
                </Badge>
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
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={handleReverse} disabled={!inputText} size="lg">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Reverse Text
          </Button>
          <Button onClick={handleSwap} disabled={!outputText} variant="outline" size="lg">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Swap Input/Output
          </Button>
          <Button onClick={handleClear} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Use Cases */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Use Cases
            </CardTitle>
            <CardDescription>
              Common uses for text reversal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Creative Writing</h4>
                <p className="text-sm text-muted-foreground">
                  Create palindromes and reverse poetry
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Programming</h4>
                <p className="text-sm text-muted-foreground">
                  Test string manipulation algorithms
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Cryptography</h4>
                <p className="text-sm text-muted-foreground">
                  Simple text encoding and decoding
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Reverse data order for analysis
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fun & Games</h4>
                <p className="text-sm text-muted-foreground">
                  Create word puzzles and games
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Test text processing applications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}