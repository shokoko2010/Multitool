'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, FileText, Type, AlignLeft, Layers } from 'lucide-react'

interface ParagraphAnalysis {
  totalParagraphs: number
  totalWords: number
  totalCharacters: number
  totalSentences: number
  averageWordsPerParagraph: number
  averageCharactersPerParagraph: number
  averageSentencesPerParagraph: number
  shortestParagraph: number
  longestParagraph: number
  paragraphLengths: Array<{
    words: number
    characters: number
    sentences: number
    content: string
  }>
  readingTime: number
  structureScore: number
}

export default function ParagraphCounter() {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState<ParagraphAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeParagraphs = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Split into paragraphs (double newline approach)
      const paragraphs = input.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      const totalParagraphs = paragraphs.length
      
      // Analyze each paragraph
      const paragraphData: ParagraphAnalysis['paragraphLengths'] = []
      let totalWords = 0
      let totalCharacters = 0
      let totalSentences = 0
      const shortestParagraph = Infinity
      const longestParagraph = 0

      paragraphs.forEach(paragraph => {
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0)
        const words = paragraph.trim().split(/\s+/).filter(word => word.length > 0)
        
        const wordCount = words.length
        const characterCount = paragraph.trim().length
        const sentenceCount = sentences.length
        
        paragraphData.push({
          words: wordCount,
          characters: characterCount,
          sentences: sentenceCount,
          content: paragraph.trim().substring(0, 100) + (paragraph.trim().length > 100 ? '...' : '')
        })
        
        totalWords += wordCount
        totalCharacters += characterCount
        totalSentences += sentenceCount
      })

      const averageWordsPerParagraph = totalParagraphs > 0 ? totalWords / totalParagraphs : 0
      const averageCharactersPerParagraph = totalParagraphs > 0 ? totalCharacters / totalParagraphs : 0
      const averageSentencesPerParagraph = totalParagraphs > 0 ? totalSentences / totalParagraphs : 0

      // Calculate reading time
      const readingTime = Math.ceil(totalWords / 200) // Average reading speed: 200 words per minute

      // Calculate structure score (0-100)
      const structureScore = calculateStructureScore(paragraphData, averageWordsPerParagraph)

      const paragraphAnalysis: ParagraphAnalysis = {
        totalParagraphs,
        totalWords,
        totalCharacters,
        totalSentences,
        averageWordsPerParagraph,
        averageCharactersPerParagraph,
        averageSentencesPerParagraph,
        shortestParagraph: Math.min(...paragraphData.map(p => p.words)),
        longestParagraph: Math.max(...paragraphData.map(p => p.words)),
        paragraphLengths: paragraphData,
        readingTime,
        structureScore
      }

      setAnalysis(paragraphAnalysis)
    } catch (error) {
      console.error('Error analyzing paragraphs:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStructureScore = (paragraphs: any[], averageWords: number): number => {
    if (paragraphs.length === 0) return 0
    
    let score = 100
    
    // Penalty for very short paragraphs (< 50 words)
    const shortParagraphs = paragraphs.filter(p => p.words < 50).length
    score -= shortParagraphs * 5
    
    // Penalty for very long paragraphs (> 200 words)
    const longParagraphs = paragraphs.filter(p => p.words > 200).length
    score -= longParagraphs * 3
    
    // Penalty for inconsistent lengths
    const lengthVariance = paragraphs.reduce((sum, p) => sum + Math.abs(p.words - averageWords), 0) / paragraphs.length
    score -= Math.min(lengthVariance / 10, 20)
    
    // Bonus for good paragraph count (5-15 paragraphs for typical content)
    if (paragraphs.length < 3 || paragraphs.length > 20) {
      score -= 10
    }
    
    return Math.max(0, Math.min(100, score))
  }

  const copyResult = () => {
    if (!analysis) return
    
    const resultText = `
Paragraph Analysis Report:

Total Paragraphs: ${analysis.totalParagraphs}
Total Words: ${analysis.totalWords}
Total Characters: ${analysis.totalCharacters}
Total Sentences: ${analysis.totalSentences}
Average Words per Paragraph: ${analysis.averageWordsPerParagraph.toFixed(1)}
Average Characters per Paragraph: ${analysis.averageCharactersPerParagraph.toFixed(1)}
Average Sentences per Paragraph: ${analysis.averageSentencesPerParagraph.toFixed(1)}
Shortest Paragraph: ${analysis.shortestParagraph} words
Longest Paragraph: ${analysis.longestParagraph} words
Reading Time: ${analysis.readingTime} minute${analysis.readingTime !== 1 ? 's' : ''}
Structure Score: ${analysis.structureScore}/100

Paragraph Details:
${analysis.paragraphLengths.map((p, i) => `Paragraph ${i + 1}: ${p.words} words, ${p.characters} chars, ${p.sentences} sentences`).join('\n')}
    `.trim()
    
    navigator.clipboard.writeText(resultText)
  }

  const getStructureColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getParagraphColor = (wordCount: number) => {
    if (wordCount >= 150) return 'bg-red-100 text-red-800'
    if (wordCount >= 100) return 'bg-orange-100 text-orange-800'
    if (wordCount >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paragraph Counter</h1>
        <p className="text-muted-foreground">Analyze paragraph structure, length, and content organization</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignLeft className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze paragraph by paragraph
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for paragraph analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={analyzeParagraphs} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Paragraphs'}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Paragraph Analysis Results
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyResult}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.totalParagraphs}</div>
                  <p className="text-sm text-muted-foreground">Paragraphs</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.totalWords}</div>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.totalCharacters}</div>
                  <p className="text-sm text-muted-foreground">Characters</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.averageWordsPerParagraph.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">Avg Words/Para</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Size Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Shortest Paragraph:</span>
                      <span className="font-medium">{analysis.shortestParagraph} words</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Longest Paragraph:</span>
                      <span className="font-medium">{analysis.longestParagraph} words</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Characters:</span>
                      <span className="font-medium">{analysis.averageCharactersPerParagraph.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Sentences:</span>
                      <span className="font-medium">{analysis.averageSentencesPerParagraph.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Content Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Words per Paragraph:</span>
                      <span className="font-medium">{analysis.averageWordsPerParagraph.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Characters per Word:</span>
                      <span className="font-medium">{(analysis.totalCharacters / analysis.totalWords).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sentences per Paragraph:</span>
                      <span className="font-medium">{analysis.averageSentencesPerParagraph.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Reading Time:</span>
                      <span className="font-medium">{analysis.readingTime} min</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Structure Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getStructureColor(analysis.structureScore).split(' ')[0].includes('green') ? 'text-green-600' : getStructureColor(analysis.structureScore).split(' ')[0].includes('yellow') ? 'text-yellow-600' : 'text-red-600'}`}>
                        {analysis.structureScore}/100
                      </div>
                      <p className="text-sm text-muted-foreground">Structure Score</p>
                    </div>
                    <div className="text-center">
                      <Badge className={getStructureColor(analysis.structureScore)}>
                        {analysis.structureScore >= 80 ? 'Excellent' : 
                         analysis.structureScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Paragraph Breakdown</h3>
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {analysis.paragraphLengths.map((paragraph, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border-b last:border-b-0 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Paragraph {index + 1}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={getParagraphColor(paragraph.words)}
                          >
                            {paragraph.words} words
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{paragraph.characters} chars</span>
                          <span>•</span>
                          <span>{paragraph.sentences} sentences</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {paragraph.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Structure Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Paragraph Length Distribution</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Short (&lt;50 words):</span>
                        <span className="font-medium">
                          {analysis.paragraphLengths.filter(p => p.words < 50).length} paragraphs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium (50-100 words):</span>
                        <span className="font-medium">
                          {analysis.paragraphLengths.filter(p => p.words >= 50 && p.words <= 100).length} paragraphs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Long (&gt;100 words):</span>
                        <span className="font-medium">
                          {analysis.paragraphLengths.filter(p => p.words > 100).length} paragraphs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Writing Recommendations</h5>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <div>• Ideal paragraph length: 50-150 words</div>
                      <div>• Use short paragraphs for emphasis</div>
                      <div>• Break up long paragraphs for readability</div>
                      <div>• Maintain consistent paragraph structure</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Usage Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Paragraphs help organize thoughts and improve readability</li>
                  <li>• Each paragraph should focus on a single main idea</li>
                  <li>• Use transitions between paragraphs for smooth flow</li>
                  <li>• Consider your audience when determining paragraph length</li>
                  <li>• Online content benefits from shorter paragraphs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}