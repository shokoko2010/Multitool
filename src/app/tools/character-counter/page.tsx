'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Hash, Type, FileText, Hash as HashIcon } from 'lucide-react'

export default function CharacterCounter() {
  const [inputText, setInputText] = useState('')

  const stats = {
    characters: inputText.length,
    charactersNoSpaces: inputText.replace(/\s/g, '').length,
    words: inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length,
    sentences: inputText.trim() === '' ? 0 : inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    paragraphs: inputText.trim() === '' ? 0 : inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
    lines: inputText === '' ? 0 : inputText.split('\n').length
  }

  const characterFrequency = () => {
    const frequency: { [key: string]: number } = {}
    const text = inputText.toLowerCase()
    
    for (let char of text) {
      if (char.match(/[a-z]/)) {
        frequency[char] = (frequency[char] || 0) + 1
      }
    }
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  }

  const topCharacters = characterFrequency()

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Character Counter</h1>
        <p className="text-muted-foreground">Count characters, words, sentences, and more in your text</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Text Input
              </CardTitle>
              <CardDescription>Enter or paste your text to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] resize-y"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Basic Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Characters</span>
                <Badge variant="secondary">{stats.characters}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Characters (no spaces)</span>
                <Badge variant="secondary">{stats.charactersNoSpaces}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Words</span>
                <Badge variant="secondary">{stats.words}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sentences</span>
                <Badge variant="secondary">{stats.sentences}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paragraphs</span>
                <Badge variant="secondary">{stats.paragraphs}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lines</span>
                <Badge variant="secondary">{stats.lines}</Badge>
              </div>
            </CardContent>
          </Card>

          {topCharacters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HashIcon className="h-5 w-5" />
                  Top Characters
                </CardTitle>
                <CardDescription>Most frequent characters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topCharacters.map(([char, count]) => (
                    <div key={char} className="flex justify-between items-center">
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {char.toUpperCase()}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {inputText && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.characters}</div>
                <div className="text-sm text-muted-foreground">Total Characters</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.words}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.sentences}</div>
                <div className="text-sm text-muted-foreground">Sentences</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats.words > 0 ? Math.round(stats.characters / stats.words) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Word Length</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}