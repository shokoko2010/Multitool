"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, Hash, Type, BarChart3, AlignLeft, RotateCcw, Scissors, Lock, Unlock, Code, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [activeCase, setActiveCase] = useState<'uppercase' | 'lowercase' | 'titlecase' | 'camelcase' | 'snakecase' | 'kebabcase'>('uppercase')

  const convertCase = (text: string, caseType: string) => {
    if (!text) return ''
    
    switch (caseType) {
      case 'uppercase':
        return text.toUpperCase()
      case 'lowercase':
        return text.toLowerCase()
      case 'titlecase':
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      case 'camelcase':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '')
      case 'snakecase':
        return text.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\s]/g, '')
      case 'kebabcase':
        return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\s]/g, '')
      default:
        return text
    }
  }

  const handleConvert = () => {
    const converted = convertCase(inputText, activeCase)
    setOutputText(converted)
    toast.success('Text converted successfully!')
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
    a.download = 'converted-text.txt'
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
      lines: text.split('\n').length,
      sentences: text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
    }
  }

  const inputStats = getTextStats(inputText)
  const outputStats = getTextStats(outputText)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Text Case Converter</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert text between different cases including uppercase, lowercase, title case, camel case, snake case, and kebab case.
            </p>
          </motion.div>
        </div>

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
                Converted text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[200px] font-mono text-sm"
                placeholder="Converted text will appear here..."
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

        {/* Case Options */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Case Conversion Options
            </CardTitle>
            <CardDescription>
              Select the case you want to convert to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { id: 'uppercase', label: 'UPPERCASE', icon: Type, example: 'HELLO WORLD' },
                { id: 'lowercase', label: 'lowercase', icon: Type, example: 'hello world' },
                { id: 'titlecase', label: 'Title Case', icon: Type, example: 'Hello World' },
                { id: 'camelcase', label: 'camelCase', icon: Type, example: 'helloWorld' },
                { id: 'snakecase', label: 'snake_case', icon: Type, example: 'hello_world' },
                { id: 'kebabcase', label: 'kebab-case', icon: Type, example: 'hello-world' }
              ].map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={activeCase === option.id ? "default" : "outline"}
                    className="w-full h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveCase(option.id as any)}
                  >
                    <option.icon className="h-6 w-6" />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.example}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={handleConvert} disabled={!inputText} size="lg">
            Convert Text
          </Button>
          <Button onClick={handleClear} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  )
}