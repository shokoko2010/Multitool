'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RefreshCw, Type } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

const englishWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
  'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
  'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
  'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
  'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us'
]

const techWords = [
  'algorithm', 'database', 'framework', 'interface', 'javascript', 'python',
  'react', 'angular', 'vue', 'node', 'express', 'mongodb', 'mysql', 'api',
  'frontend', 'backend', 'fullstack', 'responsive', 'scalable', 'performance',
  'optimization', 'security', 'authentication', 'authorization', 'deployment',
  'testing', 'debugging', 'version', 'control', 'git', 'github', 'agile', 'scrum',
  'sprint', 'repository', 'branch', 'merge', 'commit', 'push', 'pull', 'request',
  'code', 'review', 'refactor', 'documentation', 'integration', 'continuous',
  'delivery', 'devops', 'container', 'docker', 'kubernetes', 'cloud', 'aws',
  'azure', 'google', 'platform', 'service', 'microservice', 'architecture',
  'design', 'pattern', 'object', 'oriented', 'functional', 'programming'
]

interface GeneratorOptions {
  type: 'lorem' | 'english' | 'tech'
  count: number
  unit: 'words' | 'sentences' | 'paragraphs'
  startWithLorem: boolean
  capitalize: boolean
  includePunctuation: boolean
}

export default function LoremIpsumGenerator() {
  const [generatedText, setGeneratedText] = useState('')
  const [options, setOptions] = useState<GeneratorOptions>({
    type: 'lorem',
    count: 5,
    unit: 'paragraphs',
    startWithLorem: true,
    capitalize: true,
    includePunctuation: true
  })
  const [history, setHistory] = useState<string[]>([])
  const { toast } = useToast()

  const getRandomWord = (words: string[]): string => {
    return words[Math.floor(Math.random() * words.length)]
  }

  const generateSentence = (words: string[], wordCount: number): string => {
    const sentenceWords = []
    for (let i = 0; i < wordCount; i++) {
      sentenceWords.push(getRandomWord(words))
    }
    
    let sentence = sentenceWords.join(' ')
    
    if (options.capitalize) {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
    }
    
    if (options.includePunctuation) {
      sentence += '.'
    }
    
    return sentence
  }

  const generateParagraph = (words: string[], sentenceCount: number): string => {
    const sentences = []
    for (let i = 0; i < sentenceCount; i++) {
      const wordCount = Math.floor(Math.random() * 10) + 5 // 5-15 words per sentence
      sentences.push(generateSentence(words, wordCount))
    }
    return sentences.join(' ')
  }

  const generateText = (): string => {
    const wordSet = options.type === 'lorem' ? loremWords : 
                   options.type === 'english' ? englishWords : techWords
    
    let text = ''
    
    switch (options.unit) {
      case 'words':
        const wordArray = []
        for (let i = 0; i < options.count; i++) {
          wordArray.push(getRandomWord(wordSet))
        }
        text = wordArray.join(' ')
        if (options.capitalize) {
          text = text.charAt(0).toUpperCase() + text.slice(1)
        }
        if (options.includePunctuation) {
          text += '.'
        }
        break
        
      case 'sentences':
        const sentences = []
        for (let i = 0; i < options.count; i++) {
          const wordCount = Math.floor(Math.random() * 10) + 5
          sentences.push(generateSentence(wordSet, wordCount))
        }
        text = sentences.join(' ')
        break
        
      case 'paragraphs':
        const paragraphs = []
        for (let i = 0; i < options.count; i++) {
          const sentenceCount = Math.floor(Math.random() * 4) + 2 // 2-5 sentences per paragraph
          paragraphs.push(generateParagraph(wordSet, sentenceCount))
        }
        text = paragraphs.join('\n\n')
        break
    }
    
    // Add "Lorem ipsum" start if requested and it's the first generation
    if (options.startWithLorem && options.type === 'lorem' && !history.length) {
      if (options.unit === 'words') {
        text = 'Lorem ipsum ' + text
      } else if (options.unit === 'sentences') {
        text = 'Lorem ipsum dolor sit amet. ' + text
      } else {
        text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + text
      }
    }
    
    return text
  }

  const handleGenerate = () => {
    const text = generateText()
    setGeneratedText(text)
    setHistory(prev => [text, ...prev.slice(0, 4)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to clipboard",
    })
  }

  const downloadText = () => {
    if (!generatedText) return
    
    const blob = new Blob([generatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lorem-ipsum-${options.type}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const updateOption = <K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getCharacterCount = (text: string): number => {
    return text.length
  }

  const getStats = () => {
    if (!generatedText) return { words: 0, characters: 0, sentences: 0, paragraphs: 0 }
    
    const words = getWordCount(generatedText)
    const characters = getCharacterCount(generatedText)
    const sentences = generatedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = generatedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    
    return { words, characters, sentences, paragraphs }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-6 w-6" />
            Lorem Ipsum Generator
          </CardTitle>
          <CardDescription>
            Generate placeholder text for design mockups, testing, and content filling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="text-type">Text Type:</Label>
                <Select 
                  value={options.type} 
                  onValueChange={(value: GeneratorOptions['type']) => updateOption('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lorem">Lorem Ipsum</SelectItem>
                    <SelectItem value="english">English Words</SelectItem>
                    <SelectItem value="tech">Tech Terms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Count:</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={options.count}
                  onChange={(e) => updateOption('count', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit:</Label>
                <Select 
                  value={options.unit} 
                  onValueChange={(value: GeneratorOptions['unit']) => updateOption('unit', value)}
                >
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
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label>Additional Options:</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="start-lorem"
                    checked={options.startWithLorem}
                    onCheckedChange={(checked) => updateOption('startWithLorem', checked as boolean)}
                  />
                  <Label htmlFor="start-lorem" className="text-sm">
                    Start with "Lorem ipsum"
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="capitalize"
                    checked={options.capitalize}
                    onCheckedChange={(checked) => updateOption('capitalize', checked as boolean)}
                  />
                  <Label htmlFor="capitalize" className="text-sm">
                    Capitalize sentences
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="punctuation"
                    checked={options.includePunctuation}
                    onCheckedChange={(checked) => updateOption('includePunctuation', checked as boolean)}
                  />
                  <Label htmlFor="punctuation" className="text-sm">
                    Include punctuation
                  </Label>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-2">
              <Button onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Text
              </Button>
              {generatedText && (
                <>
                  <Button variant="outline" onClick={() => copyToClipboard(generatedText)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={downloadText}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>

            {/* Generated Text */}
            {generatedText && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Text</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{stats.words} words</span>
                    <span>{stats.characters} chars</span>
                    <span>{stats.sentences} sentences</span>
                    <span>{stats.paragraphs} paragraphs</span>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="pt-6">
                    <Textarea
                      value={generatedText}
                      readOnly
                      className="min-h-48 resize-none"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Generations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((text, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            {getWordCount(text)} words
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(text)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Templates</CardTitle>
                <CardDescription>
                  Click any template to generate text with predefined settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateOption('type', 'lorem')
                      updateOption('count', 3)
                      updateOption('unit', 'paragraphs')
                      updateOption('startWithLorem', true)
                      handleGenerate()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">Classic Lorem</div>
                    <div className="text-xs text-muted-foreground">3 paragraphs, traditional</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateOption('type', 'english')
                      updateOption('count', 50)
                      updateOption('unit', 'words')
                      updateOption('startWithLorem', false)
                      handleGenerate()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">English Text</div>
                    <div className="text-xs text-muted-foreground">50 words, natural</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateOption('type', 'tech')
                      updateOption('count', 5)
                      updateOption('unit', 'sentences')
                      updateOption('startWithLorem', false)
                      handleGenerate()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">Tech Content</div>
                    <div className="text-xs text-muted-foreground">5 sentences, technical</div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateOption('type', 'lorem')
                      updateOption('count', 1)
                      updateOption('unit', 'paragraphs')
                      updateOption('startWithLorem', true)
                      handleGenerate()
                    }}
                    className="h-auto p-3 text-left"
                  >
                    <div className="font-medium">Short Paragraph</div>
                    <div className="text-xs text-muted-foreground">1 paragraph, quick</div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Usage Tips:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use Lorem Ipsum for traditional placeholder text in designs</li>
                <li>• Choose English words for more natural-looking content</li>
                <li>• Select Tech terms for development-related mockups</li>
                <li>• Adjust the count and unit based on your content needs</li>
                <li>• Use the quick templates for common scenarios</li>
                <li>• Generated text is perfect for wireframes, prototypes, and testing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}