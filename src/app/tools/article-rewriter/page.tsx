'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function ArticleRewriter() {
  const [inputText, setInputText] = useState('')
  const [rewrittenText, setRewrittenText] = useState('')
  const [isRewriting, setIsRewriting] = useState(false)
  const [selectedMode, setSelectedMode] = useState('simple')

  const rewriteModes = [
    { id: 'simple', name: 'Simple', description: 'Basic rephrasing' },
    { id: 'advanced', name: 'Advanced', description: 'Comprehensive rewriting' },
    { id: 'academic', name: 'Academic', description: 'Formal academic tone' },
    { id: 'creative', name: 'Creative', description: 'Creative and engaging' }
  ]

  const rewriteArticle = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to rewrite')
      return
    }

    setIsRewriting(true)
    try {
      // Simulate rewriting process with AI-like transformation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simple rewriting logic (in real app, this would use AI API)
      const words = inputText.split(' ')
      const rewrittenWords = words.map(word => {
        const synonyms = {
          'good': 'excellent',
          'bad': 'poor',
          'big': 'large',
          'small': 'tiny',
          'fast': 'quick',
          'slow': 'gradual',
          'important': 'significant',
          'different': 'distinct',
          'same': 'identical',
          'new': 'recent',
          'old': 'aged',
          'best': 'superior',
          'worst': 'inferior',
          'happy': 'joyful',
          'sad': 'unhappy',
          'beautiful': 'attractive',
          'ugly': 'unattractive',
          'smart': 'intelligent',
          'stupid': 'unintelligent',
          'rich': 'wealthy',
          'poor': 'impoverished'
        }
        
        const lowerWord = word.toLowerCase()
        return synonyms[lowerWord] || word
      })
      
      setRewrittenText(rewrittenWords.join(' '))
      toast.success('Article rewritten successfully!')
    } catch (error) {
      toast.error('Failed to rewrite article')
    } finally {
      setIsRewriting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('File downloaded!')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Article Rewriter</h1>
        <p className="text-muted-foreground">
          Rewrite articles, essays, and content with different styles and tones
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Enter the text you want to rewrite</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                {inputText.length} characters, {inputText.split(' ').length} words
              </div>
              <Button 
                onClick={() => setInputText('')} 
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewrite Mode</CardTitle>
            <CardDescription>Choose the style and tone for your rewritten content</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedMode} onValueChange={setSelectedMode}>
              <TabsList className="grid w-full grid-cols-4">
                {rewriteModes.map((mode) => (
                  <TabsTrigger key={mode.id} value={mode.id} className="text-xs">
                    {mode.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">{rewriteModes.find(m => m.id === selectedMode)?.name} Mode</h3>
                <p className="text-sm text-muted-foreground">
                  {rewriteModes.find(m => m.id === selectedMode)?.description}
                </p>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewritten Article</CardTitle>
            <CardDescription>Your rewritten content will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isRewriting ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Rewriting your article...</span>
              </div>
            ) : rewrittenText ? (
              <div className="space-y-4">
                <Textarea
                  value={rewrittenText}
                  readOnly
                  className="min-h-[200px]"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {rewrittenText.length} characters, {rewrittenText.split(' ').length} words
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => copyToClipboard(rewrittenText)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      onClick={() => downloadAsFile(rewrittenText, 'rewritten-article.txt')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => {
                        setRewrittenText('')
                        setInputText('')
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Your rewritten article will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold">1. Enter Your Text</h4>
                <p className="text-sm text-muted-foreground">
                  Paste the article or content you want to rewrite into the input field.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">2. Choose Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Select the rewriting mode that best fits your needs (simple, advanced, academic, or creative).
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">3. Rewrite Article</h4>
                <p className="text-sm text-muted-foreground">
                  Click the rewrite button to generate a new version of your content.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">4. Copy or Download</h4>
                <p className="text-sm text-muted-foreground">
                  Copy the rewritten text to clipboard or download it as a text file.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}