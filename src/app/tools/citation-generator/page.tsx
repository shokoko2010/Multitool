'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, FileText, BookOpen, Globe, Film, Newspaper } from 'lucide-react'

interface Citation {
  mla: string
  apa: string
  chicago: string
  harvard: string
}

interface SourceData {
  author: string
  title: string
  container: string
  publisher: string
  date: string
  url: string
  doi: string
  pages: string
  volume: string
  issue: string
  type: 'book' | 'website' | 'article' | 'journal' | 'newspaper' | 'film'
}

export default function CitationGenerator() {
  const [sourceType, setSourceType] = useState<'book' | 'website' | 'article' | 'journal' | 'newspaper' | 'film'>('website')
  const [sourceData, setSourceData] = useState<SourceData>({
    author: '',
    title: '',
    container: '',
    publisher: '',
    date: '',
    url: '',
    doi: '',
    pages: '',
    volume: '',
    issue: '',
    type: 'website'
  })
  const [citations, setCitations] = useState<Citation | null>(null)
  const [loading, setLoading] = useState(false)

  const generateCitations = async () => {
    if (!sourceData.title.trim()) return

    setLoading(true)
    try {
      // Generate citations based on source type and data
      const citation: Citation = {
        mla: generateMLA(),
        apa: generateAPA(),
        chicago: generateChicago(),
        harvard: generateHarvard()
      }
      
      setCitations(citation)
    } catch (error) {
      console.error('Error generating citations:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMLA = (): string => {
    const { author, title, container, publisher, date, url, type } = sourceData
    
    let citation = ''
    
    if (author) {
      citation += `${author.split(', ').reverse().join(' ')}. `
    }
    
    citation += `${title}. `
    
    if (type === 'website') {
      citation += `Online. ${publisher}, ${date}. ${url}.`
    } else if (type === 'book') {
      citation += `${publisher}, ${date}.`
    } else if (type === 'article') {
      citation += `${container}, ${date}, ${url}.`
    } else if (type === 'journal') {
      citation += `${container} ${volume}${sourceData.issue ? `, no. ${sourceData.issue}` : ''} (${date}): ${pages}.`
    } else if (type === 'newspaper') {
      citation += `${container}, ${date}, ${pages}.`
    } else if (type === 'film') {
      citation += `Directed by ${author}. ${publisher}, ${date}.`
    }
    
    return citation
  }

  const generateAPA = (): string => {
    const { author, title, container, publisher, date, url, type } = sourceData
    
    let citation = ''
    
    if (author) {
      const authors = author.split(', ')
      if (authors.length === 1) {
        citation += `${authors[0].split(' ').pop()}, ${authors[0].split(' ').slice(0, -1).join(' ')}. `
      } else if (authors.length === 2) {
        citation += `${authors[0].split(' ').pop()}, ${authors[0].split(' ').slice(0, -1).join(' ')} & ${authors[1].split(' ').pop()}, ${authors[1].split(' ').slice(0, -1).join(' ')}. `
      } else {
        citation += `${authors[0].split(' ').pop()}, ${authors[0].split(' ').slice(0, -1).join(' ')} et al. `
      }
    }
    
    citation += `(${date.split(', ')[0]}). ${title}. `
    
    if (type === 'website') {
      citation += `Retrieved from ${url}`
    } else if (type === 'book') {
      citation += `${publisher}.`
    } else if (type === 'article') {
      citation += `${container}, ${date.split(', ')[0]}. ${url}`
    } else if (type === 'journal') {
      citation += `${container}, ${volume}(${sourceData.issue}), ${pages}. https://doi.org/${sourceData.doi}`
    } else if (type === 'newspaper') {
      citation += `${container}, ${date}, ${pages}.`
    } else if (type === 'film') {
      citation += `Film. ${publisher}.`
    }
    
    return citation
  }

  const generateChicago = (): string => {
    const { author, title, container, publisher, date, url, type } = sourceData
    
    let citation = ''
    
    if (author) {
      citation += `${author.split(', ').reverse().join(' ')}. `
    }
    
    citation += `${title}. `
    
    if (type === 'website') {
      citation += `Last modified ${date}. Accessed ${new Date().toLocaleDateString()}. ${url}.`
    } else if (type === 'book') {
      citation += `${publisher}, ${date}.`
    } else if (type === 'article') {
      citation += `In ${container}, ${date}. ${url}.`
    } else if (type === 'journal') {
      citation += `${container} ${volume}${sourceData.issue ? `, no. ${sourceData.issue}` : ''} (${date}): ${pages}.`
    } else if (type === 'newspaper') {
      citation += `${container}, ${date}, ${section} ${pages}.`
    } else if (type === 'film') {
      citation += `Directed by ${author}. ${publisher}, ${date}.`
    }
    
    return citation
  }

  const generateHarvard = (): string => {
    const { author, title, container, publisher, date, url, type } = sourceData
    
    let citation = ''
    
    if (author) {
      citation += `${author.split(', ').reverse().join(' ')} (${date.split(', ')[0]}) `
    }
    
    citation += `${title}. `
    
    if (type === 'website') {
      citation += `${publisher} [online]. Available at: ${url} [Accessed ${new Date().toLocaleDateString()}].`
    } else if (type === 'book') {
      citation += `${publisher}.`
    } else if (type === 'article') {
      citation += `${container}, ${date.split(', ')[0]}.`
    } else if (type === 'journal') {
      citation += `${container}, ${volume}(${sourceData.issue}), pp. ${pages}.`
    } else if (type === 'newspaper') {
      citation += `${container}, ${date}, p. ${pages}.`
    } else if (type === 'film') {
      citation += `Directed by ${author}. ${publisher}, ${date}.`
    }
    
    return citation
  }

  const copyCitation = (format: keyof Citation) => {
    if (!citations) return
    navigator.clipboard.writeText(citations[format])
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="h-4 w-4" />
      case 'website': return <Globe className="h-4 w-4" />
      case 'article': return <FileText className="h-4 w-4" />
      case 'journal': return <Newspaper className="h-4 w-4" />
      case 'newspaper': return <Newspaper className="h-4 w-4" />
      case 'film': return <Film className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getRequiredFields = () => {
    switch (sourceType) {
      case 'book':
        return ['author', 'title', 'publisher', 'date']
      case 'website':
        return ['author', 'title', 'publisher', 'date', 'url']
      case 'article':
        return ['author', 'title', 'container', 'date', 'url']
      case 'journal':
        return ['author', 'title', 'container', 'date', 'volume', 'pages']
      case 'newspaper':
        return ['author', 'title', 'container', 'date', 'pages']
      case 'film':
        return ['author', 'title', 'publisher', 'date']
      default:
        return ['author', 'title']
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Citation Generator</h1>
        <p className="text-muted-foreground">Generate citations in MLA, APA, Chicago, and Harvard formats</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Source Information
            </CardTitle>
            <CardDescription>
              Enter the details of your source to generate citations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="book">Book</option>
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="journal">Journal Article</option>
                  <option value="newspaper">Newspaper Article</option>
                  <option value="film">Film/Movie</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Author</label>
                <Input
                  placeholder="Last Name, First Name"
                  value={sourceData.author}
                  onChange={(e) => setSourceData({...sourceData, author: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Title of the work"
                  value={sourceData.title}
                  onChange={(e) => setSourceData({...sourceData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(sourceType === 'website' || sourceType === 'article' || sourceType === 'journal' || sourceType === 'newspaper') && (
                <div>
                  <label className="text-sm font-medium">Container/Website</label>
                  <Input
                    placeholder="Website name or journal title"
                    value={sourceData.container}
                    onChange={(e) => setSourceData({...sourceData, container: e.target.value})}
                  />
                </div>
              )}
              
              {(sourceType === 'book' || sourceType === 'website' || sourceType === 'film') && (
                <div>
                  <label className="text-sm font-medium">Publisher</label>
                  <Input
                    placeholder="Publisher name"
                    value={sourceData.publisher}
                    onChange={(e) => setSourceData({...sourceData, publisher: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Publication Date</label>
                <Input
                  placeholder="Year, Month Day"
                  value={sourceData.date}
                  onChange={(e) => setSourceData({...sourceData, date: e.target.value})}
                />
              </div>
              
              {sourceType === 'website' && (
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    placeholder="https://example.com"
                    value={sourceData.url}
                    onChange={(e) => setSourceData({...sourceData, url: e.target.value})}
                  />
                </div>
              )}
            </div>

            {(sourceType === 'journal' || sourceType === 'newspaper') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Volume</label>
                  <Input
                    placeholder="Volume number"
                    value={sourceData.volume}
                    onChange={(e) => setSourceData({...sourceData, volume: e.target.value})}
                  />
                </div>
                {sourceType === 'journal' && (
                  <div>
                    <label className="text-sm font-medium">Issue</label>
                    <Input
                      placeholder="Issue number"
                      value={sourceData.issue}
                      onChange={(e) => setSourceData({...sourceData, issue: e.target.value})}
                    />
                  </div>
                )}
              </div>
            )}

            {(sourceType === 'journal' || sourceType === 'newspaper') && (
              <div>
                <label className="text-sm font-medium">Pages</label>
                <Input
                  placeholder="pp. 123-145 or p. 123"
                  value={sourceData.pages}
                  onChange={(e) => setSourceData({...sourceData, pages: e.target.value})}
                />
              </div>
            )}

            <Button 
              onClick={generateCitations} 
              disabled={!sourceData.title.trim() || loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Citations'}
            </Button>
          </CardContent>
        </Card>

        {citations && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Citations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">MLA</Badge>
                      <span className="text-sm font-medium">Modern Language Association</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyCitation('mla')}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm bg-gray-50 p-3 rounded">{citations.mla}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">APA</Badge>
                      <span className="text-sm font-medium">American Psychological Association</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyCitation('apa')}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm bg-gray-50 p-3 rounded">{citations.apa}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Chicago</Badge>
                      <span className="text-sm font-medium">Chicago Manual of Style</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyCitation('chicago')}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm bg-gray-50 p-3 rounded">{citations.chicago}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Harvard</Badge>
                      <span className="text-sm font-medium">Harvard Referencing Style</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyCitation('harvard')}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm bg-gray-50 p-3 rounded">{citations.harvard}</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Citation Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Always double-check generated citations for accuracy</li>
                  <li>• Include all available information for the most complete citations</li>
                  <li>• Follow specific formatting requirements from your institution</li>
                  <li>• Use DOI numbers when available for journal articles</li>
                  <li>• Include access dates for online sources</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}