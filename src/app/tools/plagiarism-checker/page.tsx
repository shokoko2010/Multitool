'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface PlagiarismResult {
  originalityScore: number
  status: 'unique' | 'potential' | 'duplicate'
  matches: Array<{
    source: string
    similarity: number
    snippet: string
  }>
  suggestions: string[]
}

export default function PlagiarismChecker() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<PlagiarismResult | null>(null)
  const [loading, setLoading] = useState(false)

  const checkPlagiarism = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Simulated plagiarism detection (in real implementation, this would use external APIs or databases)
      const text = input.toLowerCase()
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      
      // Common phrases that might indicate plagiarism
      const suspiciousPhrases = [
        'according to',
        'it is important to note',
        'furthermore',
        'moreover',
        'in addition',
        'however',
        'therefore',
        'thus',
        'consequently',
        'as a result',
        'in conclusion',
        'to sum up',
        'in summary',
        'overall',
        'generally speaking',
        'typically',
        'usually',
        'commonly',
        'frequently',
        'often',
        'sometimes',
        'rarely',
        'never',
        'always'
      ]

      let suspiciousCount = 0
      sentences.forEach(sentence => {
        suspiciousPhrases.forEach(phrase => {
          if (sentence.includes(phrase)) {
            suspiciousCount++
          }
        })
      })

      // Calculate originality score
      const totalSentences = sentences.length
      const suspiciousRatio = suspiciousCount / Math.max(totalSentences, 1)
      const originalityScore = Math.max(0, 100 - (suspiciousRatio * 100))

      // Determine status
      let status: 'unique' | 'potential' | 'duplicate'
      if (originalityScore >= 85) {
        status = 'unique'
      } else if (originalityScore >= 60) {
        status = 'potential'
      } else {
        status = 'duplicate'
      }

      // Generate mock matches for demonstration
      const matches: PlagiarismResult['matches'] = []
      if (originalityScore < 85) {
        const mockSources = ['Academic Database', 'Web Article', 'Research Paper', 'Online Forum']
        const similarity = Math.max(20, 100 - originalityScore)
        
        matches.push({
          source: mockSources[Math.floor(Math.random() * mockSources.length)],
          similarity: similarity + (Math.random() * 10 - 5),
          snippet: sentences[Math.floor(Math.random() * sentences.length)].substring(0, 100) + '...'
        })
      }

      // Generate suggestions
      const suggestions: string[] = []
      if (originalityScore < 85) {
        suggestions.push('Consider rephrasing common phrases and transitions')
        suggestions.push('Add more original content and personal insights')
        suggestions.push('Include proper citations for external sources')
        suggestions.push('Vary your sentence structure and vocabulary')
      } else {
        suggestions.push('Good originality score!')
        suggestions.push('Continue maintaining your writing style')
        suggestions.push('Remember to cite all external sources')
      }

      const plagiarismResult: PlagiarismResult = {
        originalityScore,
        status,
        matches,
        suggestions
      }

      setResult(plagiarismResult)
    } catch (error) {
      console.error('Error checking plagiarism:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    const resultText = `
Originality Score: ${result.originalityScore.toFixed(1)}%
Status: ${result.status}
Similarity Matches: ${result.matches.length}

Suggestions:
${result.suggestions.map(s => `- ${s}`).join('\n')}
    `.trim()
    navigator.clipboard.writeText(resultText)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unique': return 'bg-green-100 text-green-800'
      case 'potential': return 'bg-yellow-100 text-yellow-800'
      case 'duplicate': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unique': return <CheckCircle className="h-4 w-4" />
      case 'potential': return <AlertTriangle className="h-4 w-4" />
      case 'duplicate': return <AlertTriangle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plagiarism Checker</h1>
        <p className="text-muted-foreground">Check for potential plagiarism and ensure content originality</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to check for plagiarism
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for plagiarism checking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={checkPlagiarism} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Checking...' : 'Check Plagiarism'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Plagiarism Analysis Results
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)} {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Status</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.originalityScore.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Originality Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.matches.length}</div>
                  <p className="text-sm text-muted-foreground">Potential Matches</p>
                </div>
              </div>

              {result.matches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-600">Potential Matches Found</h3>
                  <div className="space-y-3">
                    {result.matches.map((match, index) => (
                      <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-800">{match.source}</span>
                          <Badge variant="destructive">{match.similarity.toFixed(1)}% similar</Badge>
                        </div>
                        <p className="text-sm text-red-700">{match.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold">Suggestions</h3>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                <strong>Note:</strong> This is a demonstration tool. For professional plagiarism detection, 
                consider using dedicated services like Turnitin, Copyscape, or Grammarly Premium.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}