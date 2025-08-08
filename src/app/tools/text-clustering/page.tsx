'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Network, Hash, Users } from 'lucide-react'

interface Cluster {
  id: number
  theme: string
  keywords: string[]
  sentences: string[]
  size: number
  similarity: number
}

interface ClusteringResult {
  totalSentences: number
  clusterCount: number
  averageClusterSize: number
  clusters: Cluster[]
  themes: string[]
  qualityScore: number
}

export default function TextClustering() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ClusteringResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [clusterCount, setClusterCount] = useState(3)

  const clusterText = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      // Split into sentences
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const totalSentences = sentences.length
      
      if (totalSentences < clusterCount) {
        alert('Text must have more sentences than the number of clusters')
        return
      }

      // Simple keyword extraction and clustering
      const clusters: Cluster[] = []
      const usedSentences = new Set<number>()

      // Define common themes and keywords
      const themes = [
        {
          name: 'Technology',
          keywords: ['technology', 'computer', 'software', 'digital', 'internet', 'online', 'system', 'application', 'device', 'innovation']
        },
        {
          name: 'Business',
          keywords: ['business', 'company', 'market', 'profit', 'sales', 'customer', 'revenue', 'strategy', 'management', 'team']
        },
        {
          name: 'Science',
          keywords: ['science', 'research', 'study', 'experiment', 'data', 'analysis', 'theory', 'hypothesis', 'method', 'result']
        },
        {
          name: 'Education',
          keywords: ['education', 'school', 'student', 'teacher', 'learning', 'course', 'university', 'study', 'knowledge', 'skill']
        },
        {
          name: 'Health',
          keywords: ['health', 'medical', 'patient', 'treatment', 'disease', 'medicine', 'doctor', 'hospital', 'care', 'wellness']
        },
        {
          name: 'Environment',
          keywords: ['environment', 'climate', 'sustainability', 'pollution', 'green', 'energy', 'nature', 'conservation', 'ecosystem', 'planet']
        }
      ]

      // Assign sentences to clusters based on keyword matching
      sentences.forEach((sentence, index) => {
        const lowerSentence = sentence.toLowerCase()
        let bestCluster = -1
        let bestScore = 0

        themes.forEach((theme, themeIndex) => {
          let score = 0
          theme.keywords.forEach(keyword => {
            if (lowerSentence.includes(keyword)) {
              score++
            }
          })
          
          if (score > bestScore) {
            bestScore = score
            bestCluster = themeIndex
          }
        })

        if (bestCluster !== -1 && bestScore > 0) {
          if (!clusters[bestCluster]) {
            clusters[bestCluster] = {
              id: bestCluster + 1,
              theme: themes[bestCluster].name,
              keywords: themes[bestCluster].keywords.slice(0, 5),
              sentences: [],
              size: 0,
              similarity: 0
            }
          }
          clusters[bestCluster].sentences.push(sentence)
          clusters[bestCluster].size++
          usedSentences.add(index)
        }
      })

      // Assign remaining sentences to the largest clusters
      const remainingSentences = sentences
        .map((sentence, index) => ({ sentence, index }))
        .filter(item => !usedSentences.has(item.index))

      remainingSentences.forEach(({ sentence }) => {
        let largestCluster = 0
        let maxSize = 0

        clusters.forEach((cluster, index) => {
          if (cluster.size > maxSize) {
            maxSize = cluster.size
            largestCluster = index
          }
        })

        if (clusters[largestCluster]) {
          clusters[largestCluster].sentences.push(sentence)
          clusters[largestCluster].size++
        }
      })

      // Filter out empty clusters and limit to requested number
      const validClusters = clusters
        .filter(cluster => cluster.size > 0)
        .slice(0, clusterCount)

      // Calculate similarity scores (simplified)
      validClusters.forEach(cluster => {
        const totalPossible = cluster.sentences.length * cluster.keywords.length
        let matches = 0
        
        cluster.sentences.forEach(sentence => {
          const lowerSentence = sentence.toLowerCase()
          cluster.keywords.forEach(keyword => {
            if (lowerSentence.includes(keyword)) {
              matches++
            }
          })
        })

        cluster.similarity = totalPossible > 0 ? (matches / totalPossible) * 100 : 0
      })

      // Calculate quality score
      const averageClusterSize = validClusters.reduce((sum, cluster) => sum + cluster.size, 0) / validClusters.length
      const qualityScore = calculateQualityScore(validClusters, totalSentences)

      const clusteringResult: ClusteringResult = {
        totalSentences,
        clusterCount: validClusters.length,
        averageClusterSize,
        clusters: validClusters,
        themes: validClusters.map(c => c.theme),
        qualityScore
      }

      setResult(clusteringResult)
    } catch (error) {
      console.error('Error clustering text:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateQualityScore = (clusters: Cluster[], totalSentences: number): number => {
    if (clusters.length === 0) return 0

    let score = 100

    // Penalty for too few sentences per cluster
    const smallClusters = clusters.filter(c => c.size < 2).length
    score -= smallClusters * 10

    // Penalty for imbalance
    const sizes = clusters.map(c => c.size)
    const maxSize = Math.max(...sizes)
    const minSize = Math.min(...sizes)
    const imbalance = (maxSize - minSize) / totalSentences
    score -= imbalance * 50

    // Bonus for good keyword matching
    const avgSimilarity = clusters.reduce((sum, c) => sum + c.similarity, 0) / clusters.length
    score += avgSimilarity * 0.3

    return Math.max(0, Math.min(100, score))
  }

  const copyResult = () => {
    if (!result) return
    
    const resultText = `
Text Clustering Analysis Report:

Total Sentences: ${result.totalSentences}
Number of Clusters: ${result.clusterCount}
Average Cluster Size: ${result.averageClusterSize.toFixed(1)}
Quality Score: ${result.qualityScore.toFixed(1)}/100

Clusters:
${result.clusters.map((cluster, index) => `
Cluster ${cluster.id} (${cluster.theme}):
- Size: ${cluster.size} sentences
- Similarity: ${cluster.similarity.toFixed(1)}%
- Keywords: ${cluster.keywords.join(', ')}
- Sentences: ${cluster.sentences.length} shown
${cluster.sentences.slice(0, 2).map(s => `  - ${s}`).join('\n')}
`).join('\n')}

Themes Identified: ${result.themes.join(', ')}
    `.trim()
    
    navigator.clipboard.writeText(resultText)
  }

  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getClusterColor = (similarity: number): string => {
    if (similarity >= 70) return 'bg-green-100 text-green-800'
    if (similarity >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Clustering Analyzer</h1>
        <p className="text-muted-foreground">Group similar sentences and identify themes in text content</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Enter the text you want to cluster by theme and similarity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here for clustering analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Number of Clusters:</label>
              <input
                type="range"
                min="2"
                max="6"
                value={clusterCount}
                onChange={(e) => setClusterCount(parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline">{clusterCount}</Badge>
            </div>
            <Button 
              onClick={clusterText} 
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? 'Clustering...' : 'Cluster Text'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clustering Analysis Results
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
                  <div className="text-2xl font-bold">{result.totalSentences}</div>
                  <p className="text-sm text-muted-foreground">Total Sentences</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.clusterCount}</div>
                  <p className="text-sm text-muted-foreground">Clusters Found</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.averageClusterSize.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Avg Size</p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getQualityColor(result.qualityScore)}`}>
                    {result.qualityScore.toFixed(1)}/100
                  </div>
                  <p className="text-sm text-muted-foreground">Quality</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Identified Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {result.themes.map((theme, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Clusters</h3>
                <div className="space-y-4">
                  {result.clusters.map((cluster) => (
                    <Card key={cluster.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Cluster {cluster.id}: {cluster.theme}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getClusterColor(cluster.similarity)}
                            >
                              {cluster.similarity.toFixed(1)}% match
                            </Badge>
                            <Badge variant="secondary">
                              {cluster.size} sentences
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Keywords</h5>
                          <div className="flex flex-wrap gap-1">
                            {cluster.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Sample Sentences</h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {cluster.sentences.slice(0, 3).map((sentence, index) => (
                              <div key={index} className="text-sm p-2 bg-muted rounded">
                                {sentence}
                              </div>
                            ))}
                            {cluster.sentences.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{cluster.sentences.length - 3} more sentences...
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Clustering Quality Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Distribution Analysis</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Largest Cluster:</span>
                        <span className="font-medium">
                          {Math.max(...result.clusters.map(c => c.size))} sentences
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Smallest Cluster:</span>
                        <span className="font-medium">
                          {Math.min(...result.clusters.map(c => c.size))} sentences
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cluster Balance:</span>
                        <span className="font-medium">
                          {((Math.min(...result.clusters.map(c => c.size)) / Math.max(...result.clusters.map(c => c.size))) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Content Coverage</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Sentences Clustered:</span>
                        <span className="font-medium">
                          {result.clusters.reduce((sum, c) => sum + c.size, 0)}/{result.totalSentences}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage Rate:</span>
                        <span className="font-medium">
                          {((result.clusters.reduce((sum, c) => sum + c.size, 0) / result.totalSentences) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Theme Diversity:</span>
                        <span className="font-medium">
                          {result.themes.length} themes identified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Usage Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Clustering helps identify main themes and topics in text</li>
                  <li>• Adjust cluster count based on expected number of topics</li>
                  <li>• Higher similarity scores indicate better theme coherence</li>
                  <li>• Use clustering for content organization and analysis</li>
                  <li>• Combine with other NLP tools for deeper insights</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}