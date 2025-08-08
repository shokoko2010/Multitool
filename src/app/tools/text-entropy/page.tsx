'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, BarChart3, Activity, Zap } from 'lucide-react'

interface EntropyResult {
  shannonEntropy: number
  linguisticEntropy: number
  characterEntropy: number
  wordEntropy: number
  redundancy: number
  uniqueness: number
  patterns: Array<{
    pattern: string
    frequency: number
    information: number
  }>
  analysis: {
    randomness: 'Low' | 'Medium' | 'High'
    predictability: 'High' | 'Medium' | 'Low'
    complexity: 'Simple' | 'Moderate' | 'Complex'
  }
}

export default function TextEntropy() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<EntropyResult | null>(null)
  const [loading, setLoading] = useState(false)

  const calculateEntropy = (text: string, base: number = 2): number => {
    if (!text) return 0
    
    const frequencies: { [key: string]: number } = {}
    const length = text.length
    
    // Count character frequencies
    for (let char of text) {
      frequencies[char] = (frequencies[char] || 0) + 1
    }
    
    // Calculate entropy
    let entropy = 0
    for (let char in frequencies) {
      const probability = frequencies[char] / length
      entropy -= probability * Math.log2(probability)
    }
    
    return entropy
  }

  const calculateLinguisticEntropy = (text: string): number => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    if (words.length === 0) return 0
    
    const wordFrequencies: { [key: string]: number } = {}
    words.forEach(word => {
      wordFrequencies[word] = (wordFrequencies[word] || 0) + 1
    })
    
    let entropy = 0
    for (let word in wordFrequencies) {
      const probability = wordFrequencies[word] / words.length
      entropy -= probability * Math.log2(probability)
    }
    
    return entropy
  }

  const findPatterns = (text: string): EntropyResult['patterns'] => {
    const patterns: EntropyResult['patterns'] = []
    const minLength = 2
    const maxLength = 5
    
    for (let len = minLength; len <= maxLength; len++) {
      const patternFreq: { [key: string]: number } = {}
      
      // Find all patterns of current length
      for (let i = 0; i <= text.length - len; i++) {
        const pattern = text.substring(i, i + len)
        patternFreq[pattern] = (patternFreq[pattern] || 0) + 1
      }
      
      // Convert to entropy calculations
      Object.entries(patternFreq).forEach(([pattern, frequency]) => {
        if (frequency > 1) { // Only recurring patterns
          const probability = frequency / (text.length - len + 1)
          const information = -Math.log2(probability)
          
          patterns.push({
            pattern,
            frequency,
            information
          })
        }
      })
    }
    
    // Sort by information content and return top 10
    return patterns
      .sort((a, b) => b.information - a.information)
      .slice(0, 10)
  }

  const analyzeEntropy = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Calculate different entropy measures
      const characterEntropy = calculateEntropy(input)
      const wordEntropy = calculateLinguisticEntropy(input)
      const shannonEntropy = characterEntropy // For text, character entropy is primary
      
      // Calculate redundancy and uniqueness
      const maxEntropy = Math.log2(256) // Assuming ASCII characters
      const redundancy = ((maxEntropy - characterEntropy) / maxEntropy) * 100
      const uniqueness = (characterEntropy / maxEntropy) * 100
      
      // Find patterns
      const patterns = findPatterns(input)
      
      // Determine analysis categories
      const randomness = characterEntropy < 3 ? 'Low' : characterEntropy < 5 ? 'Medium' : 'High'
      const predictability = redundancy > 70 ? 'High' : redundancy > 40 ? 'Medium' : 'Low'
      const complexity = characterEntropy < 2.5 ? 'Simple' : characterEntropy < 4.5 ? 'Moderate' : 'Complex'
      
      const linguisticEntropy = calculateLinguisticEntropy(input)
      
      const entropyResult: EntropyResult = {
        shannonEntropy,
        linguisticEntropy,
        characterEntropy,
        wordEntropy,
        redundancy,
        uniqueness,
        patterns,
        analysis: {
          randomness,
          predictability,
          complexity
        }
      }
      
      setResult(entropyResult)
    } catch (error) {
      console.error('Error analyzing entropy:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    
    const resultText = `
Text Entropy Analysis Report:

Shannon Entropy: ${result.shannonEntropy.toFixed(3)} bits
Character Entropy: ${result.characterEntropy.toFixed(3)} bits
Word Entropy: ${result.wordEntropy.toFixed(3)} bits
Linguistic Entropy: ${result.linguisticEntropy.toFixed(3)} bits

Redundancy: ${result.redundancy.toFixed(1)}%
Uniqueness: ${result.uniqueness.toFixed(1)}%

Analysis:
- Randomness: ${result.analysis.randomness}
- Predictability: ${result.analysis.predictability}
- Complexity: ${result.analysis.complexity}

Top Patterns:
${result.patterns.slice(0, 5).map(p => `${p.pattern}: ${p.frequency} times (${p.information.toFixed(2)} bits)`).join('\n')}
    `.trim()
    
    navigator.clipboard.writeText(resultText)
  }

  const getEntropyColor = (entropy: number): string => {
    if (entropy < 2) return 'text-red-600'
    if (entropy < 4) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getAnalysisColor = (value: string): string => {
    switch (value) {
      case 'High':
      case 'Complex':
      case 'Low': return 'bg-red-100 text-red-800'
      case 'Medium':
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Low':
      case 'Simple':
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Entropy Analyzer</h1>
        <p className="text-muted-foreground">Analyze information content, randomness, and patterns in text</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze for entropy and information content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for entropy analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
            <Button 
              onClick={analyzeEntropy} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Entropy'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Entropy Analysis Results
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getEntropyColor(result.shannonEntropy)}`}>
                    {result.shannonEntropy.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Shannon Entropy</p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getEntropyColor(result.characterEntropy)}`}>
                    {result.characterEntropy.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Character Entropy</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.redundancy.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Redundancy</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.uniqueness.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Uniqueness</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Entropy Measures</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Character:</span>
                      <span className={`text-sm font-medium ${getEntropyColor(result.characterEntropy)}`}>
                        {result.characterEntropy.toFixed(3)} bits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Word:</span>
                      <span className="text-sm font-medium">
                        {result.wordEntropy.toFixed(3)} bits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Linguistic:</span>
                      <span className="text-sm font-medium">
                        {result.linguisticEntropy.toFixed(3)} bits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Shannon:</span>
                      <span className={`text-sm font-medium ${getEntropyColor(result.shannonEntropy)}`}>
                        {result.shannonEntropy.toFixed(3)} bits
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Information Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Redundancy:</span>
                      <span className="text-sm font-medium">
                        {result.redundancy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uniqueness:</span>
                      <span className="text-sm font-medium">
                        {result.uniqueness.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Entropy:</span>
                      <span className="text-sm font-medium">
                        {Math.log2(256).toFixed(2)} bits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Efficiency:</span>
                      <span className="text-sm font-medium">
                        {((result.shannonEntropy / Math.log2(256)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAnalysisColor(result.analysis.randomness)}`}>
                        Randomness: {result.analysis.randomness}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAnalysisColor(result.analysis.predictability)}`}>
                        Predictability: {result.analysis.predictability}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAnalysisColor(result.analysis.complexity)}`}>
                        Complexity: {result.analysis.complexity}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {result.patterns.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Recurring Patterns</h3>
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {result.patterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {pattern.pattern}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{pattern.frequency} times</span>
                          <Badge variant="secondary" className="text-xs">
                            {pattern.information.toFixed(2)} bits
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Entropy Interpretation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Entropy Ranges</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 0-2 bits: Low randomness, high predictability</li>
                      <li>• 2-4 bits: Medium randomness, moderate predictability</li>
                      <li>• 4-8 bits: High randomness, low predictability</li>
                      <li>• 8+ bits: Maximum entropy, completely random</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Applications</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Cryptography: High entropy for security</li>
                      <li>• Compression: Low entropy for better compression</li>
                      <li>• Linguistics: Analyze text patterns and style</li>
                      <li>• Data Science: Measure information content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}