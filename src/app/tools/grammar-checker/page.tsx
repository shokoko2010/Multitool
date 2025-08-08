'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

interface GrammarIssue {
  type: 'spelling' | 'grammar' | 'punctuation' | 'capitalization' | 'style'
  text: string
  suggestion: string
  position: number
  severity: 'low' | 'medium' | 'high'
}

interface GrammarResult {
  issues: GrammarIssue[]
  totalIssues: number
  score: number
  suggestions: string[]
}

export default function GrammarChecker() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<GrammarResult | null>(null)
  const [loading, setLoading] = useState(false)

  const checkGrammar = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const issues: GrammarIssue[] = []
      
      // Basic grammar checks
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      
      // Check for common grammar issues
      sentences.forEach((sentence, sentenceIndex) => {
        const words = sentence.split(/\s+/)
        const startPos = input.indexOf(sentence)
        
        // Check for capitalization at start of sentence
        if (sentenceIndex > 0 && sentence[0] && sentence[0] !== sentence[0].toUpperCase()) {
          issues.push({
            type: 'capitalization',
            text: sentence.trim(),
            suggestion: sentence.trim().charAt(0).toUpperCase() + sentence.trim().slice(1),
            position: startPos,
            severity: 'medium'
          })
        }
        
        // Check for double spaces
        if (sentence.includes('  ')) {
          issues.push({
            type: 'style',
            text: 'Double spaces',
            suggestion: 'Use single spaces',
            position: startPos,
            severity: 'low'
          })
        }
        
        // Check for common punctuation issues
        if (sentence.includes(',,')) {
          issues.push({
            type: 'punctuation',
            text: ',,',
            suggestion: ',',
            position: startPos,
            severity: 'medium'
          })
        }
        
        if (sentence.includes('..')) {
          issues.push({
            type: 'punctuation',
            text: '..',
            suggestion: '.',
            position: startPos,
            severity: 'medium'
          })
        }
        
        // Check for missing punctuation at end
        if (sentence.trim() && !sentence.trim().match(/[.!?]$/)) {
          issues.push({
            type: 'punctuation',
            text: sentence.trim(),
            suggestion: sentence.trim() + '.',
            position: startPos + sentence.trim().length,
            severity: 'high'
          })
        }
      })
      
      // Check for common spelling issues (simplified)
      const commonSpellingMistakes: { [key: string]: string } = {
        'teh': 'the',
        'adn': 'and',
        'recieve': 'receive',
        'seperate': 'separate',
        'definately': 'definitely',
        'occured': 'occurred',
        'untill': 'until',
        'alot': 'a lot',
        'wich': 'which',
        'thier': 'their',
        'recieved': 'received',
        'begining': 'beginning',
        'excute': 'execute',
        'accomodate': 'accommodate'
      }
      
      Object.entries(commonSpellingMistakes).forEach(([mistake, correction]) => {
        const regex = new RegExp(`\\b${mistake}\\b`, 'gi')
        const matches = input.match(regex)
        if (matches) {
          matches.forEach(match => {
            const index = input.toLowerCase().indexOf(match.toLowerCase())
            issues.push({
              type: 'spelling',
              text: match,
              suggestion: correction,
              position: index,
              severity: 'high'
            })
          })
        }
      })
      
      // Check for run-on sentences (very long sentences)
      sentences.forEach(sentence => {
        if (sentence.split(/\s+/).length > 25) {
          const startPos = input.indexOf(sentence)
          issues.push({
            type: 'grammar',
            text: 'Long sentence',
            suggestion: 'Consider breaking this sentence into shorter ones',
            position: startPos,
            severity: 'medium'
          })
        }
      })
      
      // Remove duplicates and sort by position
      const uniqueIssues = issues.filter((issue, index, self) => 
        index === self.findIndex(i => i.position === issue.position && i.text === issue.text)
      ).sort((a, b) => a.position - b.position)
      
      // Calculate score
      const totalIssues = uniqueIssues.length
      const maxIssues = Math.min(totalIssues, 10) // Cap at 10 for scoring
      const score = Math.max(0, 100 - (maxIssues * 10))
      
      // Generate suggestions
      const suggestions: string[] = []
      if (totalIssues === 0) {
        suggestions.push('Excellent! No grammar issues found.')
      } else {
        suggestions.push(`Found ${totalIssues} potential issue${totalIssues !== 1 ? 's' : ''}`)
        
        const spellingIssues = uniqueIssues.filter(i => i.type === 'spelling').length
        const grammarIssues = uniqueIssues.filter(i => i.type === 'grammar').length
        const punctuationIssues = uniqueIssues.filter(i => i.type === 'punctuation').length
        
        if (spellingIssues > 0) suggestions.push(`• ${spellingIssues} spelling issue${spellingIssues !== 1 ? 's' : ''}`)
        if (grammarIssues > 0) suggestions.push(`• ${grammarIssues} grammar issue${grammarIssues !== 1 ? 's' : ''}`)
        if (punctuationIssues > 0) suggestions.push(`• ${punctuationIssues} punctuation issue${punctuationIssues !== 1 ? 's' : ''}`)
        
        suggestions.push('• Review capitalization at sentence beginnings')
        suggestions.push('• Check for proper sentence endings')
      }
      
      const grammarResult: GrammarResult = {
        issues: uniqueIssues,
        totalIssues,
        score,
        suggestions
      }
      
      setResult(grammarResult)
    } catch (error) {
      console.error('Error checking grammar:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    const resultText = `
Grammar Check Report:

Score: ${result.score}/100
Total Issues: ${result.totalIssues}

Issues Found:
${result.issues.map(issue => `- ${issue.type}: "${issue.text}" → "${issue.suggestion}"`).join('\n')}

Suggestions:
${result.suggestions.map(s => `• ${s}`).join('\n')}
    `.trim()
    navigator.clipboard.writeText(resultText)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spelling': return <XCircle className="h-4 w-4 text-red-500" />
      case 'grammar': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'punctuation': return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'capitalization': return <Info className="h-4 w-4 text-purple-500" />
      case 'style': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grammar Checker</h1>
        <p className="text-muted-foreground">Check for grammar, spelling, and punctuation errors in your text</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to check for grammar and spelling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for grammar checking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={checkGrammar} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Checking...' : 'Check Grammar'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Grammar Check Results
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
                  <div className={`text-3xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.score}/100
                  </div>
                  <p className="text-sm text-muted-foreground">Grammar Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.totalIssues}</div>
                  <p className="text-sm text-muted-foreground">Issues Found</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {result.issues.filter(i => i.severity === 'high').length}
                  </div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </div>

              {result.issues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Issues Found</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.issues.map((issue, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(issue.type)}
                            <span className="font-medium capitalize">{issue.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {issue.severity}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="line-through">{issue.text}</span>
                            <span className="ml-2 text-green-600">→ {issue.suggestion}</span>
                          </p>
                        </div>
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
                <strong>Note:</strong> This is a basic grammar checker. For comprehensive grammar analysis, 
                consider using professional tools like Grammarly, ProWritingAid, or LanguageTool.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}