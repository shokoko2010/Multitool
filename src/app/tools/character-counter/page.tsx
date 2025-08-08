'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Hash, Type } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CharacterCounterTool() {
  const [text, setText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [sentenceCount, setSentenceCount] = useState(0)
  const [paragraphCount, setParagraphCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    analyzeText(text)
  }, [text])

  const analyzeText = (content: string) => {
    setCharCount(content.length)
    
    // Word count (including Chinese characters)
    const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
    setWordCount(words)
    
    // Line count
    const lines = content === '' ? 0 : content.split('\n').length
    setLineCount(lines)
    
    // Sentence count
    const sentences = content.trim() === '' ? 0 : content.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length
    setSentenceCount(sentences)
    
    // Paragraph count
    const paragraphs = content.trim() === '' ? 0 : content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    setParagraphCount(paragraphs)
    
    // Reading time (average 200 words per minute for English, 300 for Chinese)
    const avgWordsPerMinute = 250 // Mixed average
    setReadingTime(Math.ceil(words / avgWordsPerMinute))
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const clearText = () => {
    setText('')
  }

  const loadSampleText = () => {
    setText('The quick brown fox jumps over the lazy dog. This is a sample text for testing the character counter tool. It contains multiple sentences and paragraphs to demonstrate various counting features.')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Character Counter</h1>
        <p className="text-muted-foreground">
          Analyze text and get detailed statistics about characters, words, reading time, and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter or paste your text below to analyze it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            
            <div className="flex gap-2">
              <Button onClick={clearText} variant="outline" className="flex-1">
                Clear Text
              </Button>
              <Button onClick={loadSampleText} variant="outline" className="flex-1">
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Text Statistics
            </CardTitle>
            <CardDescription>
              Detailed analysis of your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="reading">Reading</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Characters</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-2xl font-bold">{charCount}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(charCount.toString(), 'Character count')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Characters (no spaces)</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-2xl font-bold">{charCount - text.split(' ').join('').length}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard((charCount - text.split(' ').join('').length).toString(), 'Character count (no spaces)')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Words</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-2xl font-bold">{wordCount}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(wordCount.toString(), 'Word count')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Lines</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-2xl font-bold">{lineCount}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(lineCount.toString(), 'Line count')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Sentences</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{sentenceCount}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(sentenceCount.toString(), 'Sentence count')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Paragraphs</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{paragraphCount}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(paragraphCount.toString(), 'Paragraph count')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Average words per sentence</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : '0'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Average characters per word</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{wordCount > 0 ? (charCount / wordCount).toFixed(1) : '0'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reading" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Estimated reading time</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{readingTime} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Reading speed</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">250 words/min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Characters per minute</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{readingTime > 0 ? Math.ceil(charCount / readingTime) : '0'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Text Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Text Preview</CardTitle>
          <CardDescription>
            First 200 characters of your text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg min-h-[80px] font-mono text-sm">
            {text.length > 0 ? (text.length > 200 ? text.substring(0, 200) + '...' : text) : 'No text entered'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}