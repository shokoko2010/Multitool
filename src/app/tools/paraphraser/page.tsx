'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, RefreshCw, FileText } from 'lucide-react'

interface ParaphraseResult {
  original: string
  paraphrased: string
  similarity: number
  alternatives: string[]
}

const paraphraseTemplates = [
  [
    "The {original} can be described as {paraphrase}.",
    "In other words, {original} means {paraphrase}.",
    "To put it differently, {original} refers to {paraphrase}.",
    "This can be expressed as {paraphrase} when considering {original}."
  ],
  [
    "One way to understand {original} is through {paraphrase}.",
    "An alternative perspective on {original} would be {paraphrase}.",
    "From a different viewpoint, {original} essentially means {paraphrase}.",
    "We might also say that {original} translates to {paraphrase}."
  ],
  [
    "The concept of {original} can be rephrased as {paraphrase}.",
    "When we talk about {original}, we're essentially referring to {paraphrase}.",
    "Another way to frame {original} is {paraphrase}.",
    "In essence, {original} amounts to {paraphrase}."
  ]
]

const synonymReplacements: { [key: string]: string[] } = {
  'good': ['excellent', 'great', 'wonderful', 'fantastic', 'outstanding', 'superb'],
  'bad': ['poor', 'terrible', 'awful', 'horrible', 'dreadful', 'appalling'],
  'important': ['crucial', 'vital', 'essential', 'significant', 'key', 'critical'],
  'different': ['distinct', 'various', 'diverse', 'separate', 'unique', 'dissimilar'],
  'same': ['identical', 'similar', 'alike', 'equivalent', 'matching', 'comparable'],
  'many': ['numerous', 'multiple', 'several', 'countless', 'abundant', 'plentiful'],
  'few': ['limited', 'scant', 'scarce', 'minimal', 'fewer', 'insufficient'],
  'large': ['big', 'huge', 'enormous', 'massive', 'substantial', 'extensive'],
  'small': ['tiny', 'miniature', 'compact', 'minute', 'petite', 'microscopic'],
  'new': ['recent', 'fresh', 'modern', 'contemporary', 'novel', 'innovative'],
  'old': ['ancient', 'aged', 'vintage', 'elderly', 'mature', 'seasoned'],
  'fast': ['quick', 'rapid', 'swift', 'speedy', 'efficient', 'immediate'],
  'slow': ['gradual', 'leisurely', 'unhurried', 'deliberate', 'measured', 'steady'],
  'easy': ['simple', 'straightforward', 'painless', 'effortless', 'convenient', 'manageable'],
  'difficult': ['challenging', 'complex', 'complicated', 'hard', 'tough', 'demanding'],
  'beautiful': ['attractive', 'gorgeous', 'stunning', 'lovely', 'pretty', 'elegant'],
  'ugly': ['unattractive', 'hideous', 'unsightly', 'unappealing', 'plain', 'unattractive'],
  'happy': ['joyful', 'delighted', 'pleased', 'content', 'cheerful', 'merry'],
  'sad': ['unhappy', 'depressed', 'miserable', 'gloomy', 'downcast', 'sorrowful'],
  'interesting': ['fascinating', 'engaging', 'captivating', 'intriguing', 'compelling', 'absorbing'],
  'boring': ['dull', 'tedious', 'uninteresting', 'monotonous', 'repetitive', 'unexciting']
}

export default function Paraphraser() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParaphraseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [paraphraseStyle, setParaphraseStyle] = useState('simple')

  const paraphraseText = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Simple paraphrasing logic
      let paraphrased = input
      
      // Apply synonym replacements
      Object.entries(synonymReplacements).forEach(([word, synonyms]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        if (regex.test(input)) {
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)]
          paraphrased = paraphrased.replace(regex, synonym)
        }
      })
      
      // Apply sentence restructuring
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      if (sentences.length > 1) {
        // Shuffle sentence order (simple approach)
        const shuffled = [...sentences].sort(() => Math.random() - 0.5)
        paraphrased = shuffled.join('. ') + '.'
      }
      
      // Generate alternatives
      const alternatives: string[] = []
      for (let i = 0; i < 2; i++) {
        let alt = input
        
        // Apply different transformations
        Object.entries(synonymReplacements).forEach(([word, synonyms]) => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi')
          if (regex.test(input) && Math.random() > 0.5) {
            const synonym = synonyms[Math.floor(Math.random() * synonyms.length)]
            alt = alt.replace(regex, synonym)
          }
        })
        
        alternatives.push(alt)
      }
      
      // Calculate similarity (simplified)
      const similarity = calculateSimilarity(input, paraphrased)
      
      const paraphraseResult: ParaphraseResult = {
        original: input,
        paraphrased,
        similarity,
        alternatives
      }
      
      setResult(paraphraseResult)
    } catch (error) {
      console.error('Error paraphrasing text:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(word => words2.has(word)))
    const union = new Set([...words1, ...words2])
    
    return (intersection.size / union.size) * 100
  }

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const regenerateParaphrase = () => {
    if (input) {
      paraphraseText()
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Paraphraser</h1>
        <p className="text-muted-foreground">Rewrite text with different wording while preserving meaning</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to paraphrase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for paraphrasing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Paraphrase Style:</label>
              <select
                value={paraphraseStyle}
                onChange={(e) => setParaphraseStyle(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="simple">Simple</option>
                <option value="academic">Academic</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>
            <Button 
              onClick={paraphraseText} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Paraphrasing...' : 'Paraphrase Text'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Paraphrased Results
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={regenerateParaphrase}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.similarity.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Similarity</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.alternatives.length + 1}</div>
                  <p className="text-sm text-muted-foreground">Variations</p>
                </div>
                <div className="text-center">
                  <Badge variant={result.similarity > 70 ? 'secondary' : 'destructive'}>
                    {result.similarity > 70 ? 'Good' : 'Low'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Quality</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Original Text</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{result.original}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Paraphrased Text</h3>
                  <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">{result.paraphrased}</p>
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyResult(result.paraphrased)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                {result.alternatives.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Alternative Paraphrases</h3>
                    <div className="space-y-2">
                      {result.alternatives.map((alternative, index) => (
                        <div key={index} className="border border-gray-200 p-3 rounded-lg">
                          <p className="text-sm">{alternative}</p>
                          <div className="flex justify-end mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyResult(alternative)}
                              className="flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tips for Better Paraphrasing</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Change sentence structure while keeping the original meaning</li>
                  <li>• Use synonyms for key words and phrases</li>
                  <li>• Maintain the same tone and style as the original</li>
                  <li>• Ensure the paraphrased text flows naturally</li>
                  <li>• Check for accuracy and clarity in the reworded text</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}