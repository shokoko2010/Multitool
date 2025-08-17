"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, Search, BarChart3, TrendingUp, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function MetaDescriptionGenerator() {
  const [inputText, setInputText] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [tone, setTone] = useState<'professional' | 'casual' | 'enthusiastic' | 'informative'>('professional')
  const [targetAudience, setTargetAudience] = useState('')
  const [generatedDescriptions, setGeneratedDescriptions] = useState<string[]>([])
  const [selectedDescription, setSelectedDescription] = useState('')

  const generateMetaDescriptions = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some content to generate meta descriptions')
      return
    }

    // Extract key information from the input text
    const words = inputText.toLowerCase().split(/\s+/)
    const wordCount = words.length
    
    // Extract key phrases (simplified)
    const keyPhrases = extractKeyPhrases(inputText)
    
    // Generate multiple meta descriptions
    const descriptions = []
    
    // Template 1: Professional tone
    descriptions.push(generateProfessionalDescription(inputText, focusKeyword, keyPhrases))
    
    // Template 2: Benefit-focused
    descriptions.push(generateBenefitDescription(inputText, focusKeyword, keyPhrases))
    
    // Template 3: Question-based
    descriptions.push(generateQuestionDescription(inputText, focusKeyword, keyPhrases))
    
    // Template 4: Action-oriented
    descriptions.push(generateActionDescription(inputText, focusKeyword, keyPhrases))
    
    // Template 5: List-style
    descriptions.push(generateListDescription(inputText, focusKeyword, keyPhrases))

    setGeneratedDescriptions(descriptions)
    setSelectedDescription(descriptions[0])
    toast.success('Meta descriptions generated successfully!')
  }

  const extractKeyPhrases = (text: string) => {
    // Simple key phrase extraction
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    const phrases = []
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/)
      if (words.length >= 3 && words.length <= 8) {
        phrases.push(sentence.trim())
      }
    }
    
    return phrases.slice(0, 3)
  }

  const generateProfessionalDescription = (text: string, keyword: string, keyPhrases: string[]) => {
    const firstSentence = text.split('.')[0] || text
    const truncated = firstSentence.length > 120 ? firstSentence.substring(0, 120) + '...' : firstSentence
    
    let description = truncated
    if (keyword && !description.toLowerCase().includes(keyword.toLowerCase())) {
      description += ` Learn about ${keyword}.`
    }
    
    return description.length > 160 ? description.substring(0, 157) + '...' : description
  }

  const generateBenefitDescription = (text: string, keyword: string, keyPhrases: string[]) => {
    const benefitWords = ['discover', 'learn', 'explore', 'understand', 'master', 'improve', 'achieve']
    const randomBenefit = benefitWords[Math.floor(Math.random() * benefitWords.length)]
    
    let description = `${randomBenefit.charAt(0).toUpperCase() + randomBenefit.slice(1)} `
    
    if (keyword) {
      description += keyword
    } else {
      description += 'essential insights'
    }
    
    description += ' and expert guidance. '
    
    if (keyPhrases.length > 0) {
      description += keyPhrases[0].substring(0, 60) + '...'
    }
    
    return description.length > 160 ? description.substring(0, 157) + '...' : description
  }

  const generateQuestionDescription = (text: string, keyword: string, keyPhrases: string[]) => {
    const questionWords = ['How', 'What', 'Why', 'When', 'Where']
    const randomQuestion = questionWords[Math.floor(Math.random() * questionWords.length)]
    
    let description = `${randomQuestion} `
    
    if (keyword) {
      description += `can you optimize ${keyword}? `
    } else {
      description += 'can you improve your results? '
    }
    
    description += 'Get expert tips and strategies. '
    
    if (keyPhrases.length > 0) {
      description += keyPhrases[0].substring(0, 40) + '...'
    }
    
    return description.length > 160 ? description.substring(0, 157) + '...' : description
  }

  const generateActionDescription = (text: string, keyword: string, keyPhrases: string[]) => {
    const actionWords = ['Start', 'Begin', 'Launch', 'Begin your', 'Take the first step towards']
    const randomAction = actionWords[Math.floor(Math.random() * actionWords.length)]
    
    let description = `${randomAction} `
    
    if (keyword) {
      description += keyword
    } else {
      description += 'journey to success'
    }
    
    description += ' today. Expert guidance and proven strategies await.'
    
    return description.length > 160 ? description.substring(0, 157) + '...' : description
  }

  const generateListDescription = (text: string, keyword: string, keyPhrases: string[]) => {
    let description = 'Complete guide: '
    
    if (keyword) {
      description += keyword
    } else {
      description += 'essential tips'
    }
    
    description += ', best practices, and expert advice. '
    
    if (keyPhrases.length > 1) {
      description += `Includes ${keyPhrases[0].substring(0, 30)}...`
    }
    
    return description.length > 160 ? description.substring(0, 157) + '...' : description
  }

  const handleCopy = (description: string) => {
    navigator.clipboard.writeText(description)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    if (!selectedDescription) return
    
    const content = `Generated Meta Description:\n\n${selectedDescription}\n\nCharacter Count: ${selectedDescription.length}\nFocus Keyword: ${focusKeyword || 'None'}\nTone: ${tone}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meta-description.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputText('')
    setFocusKeyword('')
    setGeneratedDescriptions([])
    setSelectedDescription('')
    toast.success('Cleared!')
  }

  const getCharacterCount = (text: string) => {
    return text.length
  }

  const getCharacterCountColor = (count: number) => {
    if (count < 50) return 'text-red-600'
    if (count > 160) return 'text-red-600'
    if (count < 120) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Meta Description Generator</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate compelling meta descriptions for SEO. Create multiple variations and choose the best one for your content.
            </p>
          </motion.div>
        </div>

        {/* Input Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Content Details
            </CardTitle>
            <CardDescription>
              Provide information about your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="content-text">Content Text</Label>
              <Textarea
                id="content-text"
                placeholder="Enter your content text, article, or page content..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="focus-keyword">Focus Keyword (Optional)</Label>
                <Input
                  id="focus-keyword"
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="Main keyword"
                />
              </div>
              
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="target-audience">Target Audience (Optional)</Label>
                <Input
                  id="target-audience"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., beginners, experts"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateMetaDescriptions} disabled={!inputText.trim()} size="lg">
                <Search className="h-4 w-4 mr-2" />
                Generate Descriptions
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Descriptions */}
        {generatedDescriptions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Generated Meta Descriptions
              </CardTitle>
              <CardDescription>
                Choose the best meta description for your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedDescriptions.map((description, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDescription === description ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedDescription(description)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">Option {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${getCharacterCountColor(getCharacterCount(description))}`}>
                          {getCharacterCount(description)} characters
                        </span>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(description)
                          }} 
                          variant="ghost" 
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Description */}
        {selectedDescription && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Selected Description
              </CardTitle>
              <CardDescription>
                Your chosen meta description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-mono text-sm">{selectedDescription}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Badge variant="secondary">
                      <Hash className="h-3 w-3 mr-1" />
                      {getCharacterCount(selectedDescription)} chars
                    </Badge>
                    {focusKeyword && (
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {focusKeyword}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleCopy(selectedDescription)} size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={handleDownload} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEO Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Meta Description Best Practices
            </CardTitle>
            <CardDescription>
              Tips for writing effective meta descriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Length Guidelines</h4>
                <p className="text-sm text-muted-foreground">
                  Keep meta descriptions between 120-160 characters for optimal display in search results.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Include Keywords</h4>
                <p className="text-sm text-muted-foreground">
                  Naturally include your focus keyword to improve relevance and search visibility.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Compelling Content</h4>
                <p className="text-sm text-muted-foreground">
                  Write descriptions that encourage clicks by highlighting benefits and unique value.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Unique Descriptions</h4>
                <p className="text-sm text-muted-foreground">
                  Avoid duplicate meta descriptions across pages to prevent SEO issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}