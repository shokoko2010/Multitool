'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Type, Copy, Download, FileText, RotateCcw, Info, Hash } from 'lucide-react'
import { toast } from 'sonner'

// Leet speak mapping
const leetSpeakMap: { [key: string]: string } = {
  'A': '4', 'B': '8', 'C': '(', 'D': ')', 'E': '3', 'F': 'f', 'G': '9', 'H': '#', 'I': '1', 'J': '_', 'K': '>', 'L': '1', 'M': '|', 'N': '^', 'O': '0', 'P': '*', 'Q': '0', 'R': '+', 'S': '5', 'T': '7', 'U': 'u', 'V': '|', 'W': '2', 'X': '<', 'Y': '/', 'Z': '2',
  'a': '@', 'b': '8', 'c': '(', 'd': ')', 'e': '3', 'f': 'f', 'g': '9', 'h': '#', 'i': '1', 'j': '_', 'k': '>', 'l': '1', 'm': '|', 'n': '^', 'o': '0', 'p': '*', 'q': '0', 'r': '+', 's': '5', 't': '7', 'u': 'u', 'v': '|', 'w': '2', 'x': '<', 'y': '/', 'z': '2'
}

export default function TextToLeet() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [leetLevel, setLeetLevel] = useState(1) // 1-3, where 3 is mostleet

  const convertToLeet = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to convert')
      return
    }

    let converted = inputText
    let leetChars = 0

    // Apply leet conversion based on level
    if (leetLevel >= 1) {
      // Basic leet - most common substitutions
      converted = converted.split('').map(char => {
        if (leetSpeakMap[char] && Math.random() > 0.3) {
          leetChars++
          return leetSpeakMap[char]
        }
        return char
      }).join('')
    }

    if (leetLevel >= 2) {
      // Medium leet - more aggressive substitutions
      converted = converted.split('').map(char => {
        if (leetSpeakMap[char] && Math.random() > 0.5) {
          leetChars++
          return leetSpeakMap[char]
        }
        return char
      }).join('')
    }

    if (leetLevel >= 3) {
      // Maximum leet - almost all substitutions
      converted = converted.split('').map(char => {
        if (leetSpeakMap[char] && Math.random() > 0.2) {
          leetChars++
          return leetSpeakMap[char]
        }
        return char
      }).join('')
    }

    setOutputText(converted)
    
    // Update statistics
    setCharacterCount(converted.length)
    setWordCount(converted.trim() ? converted.trim().split(/\s+/).length : 0)
    
    toast.success(`Text converted to leet speak (Level ${leetLevel})!`)
  }

  const copyToClipboard = () => {
    if (!outputText) {
      toast.error('No text to copy')
      return
    }
    
    navigator.clipboard.writeText(outputText)
    toast.success('Leet text copied to clipboard!')
  }

  const downloadText = () => {
    if (!outputText) {
      toast.error('No text to download')
      return
    }

    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leet-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Leet text downloaded successfully!')
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setCharacterCount(0)
    setWordCount(0)
    toast.success('All text cleared!')
  }

  const swapText = () => {
    setInputText(outputText)
    setOutputText(inputText)
    toast.success('Text swapped!')
  }

  const getLeetChart = () => {
    return Object.entries(leetSpeakMap)
      .filter(([char]) => /[A-Za-z]/.test(char))
      .sort(([a], [b]) => a.localeCompare(b))
  }

  const calculateLeetRatio = () => {
    if (!inputText || !outputText) return 0
    const originalChars = inputText.split('').filter(char => /[A-Za-z]/.test(char)).length
    const leetChars = outputText.split('').filter(char => /[^A-Za-z]/.test(char)).length
    return originalChars > 0 ? Math.round((leetChars / originalChars) * 100) : 0
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text to Leet Speak</h1>
        <p className="text-muted-foreground">
          Convert text to leet speak with customizable substitution levels
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Leet Conversion
            </CardTitle>
            <CardDescription>
              Enter your text below and convert it to leet speak format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <label className="text-sm font-medium">Leet Level:</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(level => (
                  <Button
                    key={level}
                    variant={leetLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLeetLevel(level)}
                  >
                    Level {level}
                  </Button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {leetLevel === 1 ? 'Basic substitutions' : 
                 leetLevel === 2 ? 'Medium substitutions' : 'Maximum substitutions'}
              </span>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Text</label>
                <Textarea
                  placeholder="Enter your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-y"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Characters: {inputText.length}</span>
                  <span>Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Leet Output</label>
                <Textarea
                  value={outputText}
                  readOnly
                  className="min-h-[200px] resize-y bg-muted/50 font-mono text-sm"
                  placeholder="Leet text will appear here..."
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Characters: {characterCount}</span>
                  <span>Words: {wordCount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={convertToLeet} 
                disabled={!inputText.trim()}
                className="flex items-center gap-2"
              >
                <Hash className="h-4 w-4" />
                Convert to Leet
              </Button>
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                disabled={!outputText}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadText}
                disabled={!outputText}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline" 
                onClick={swapText}
                disabled={!outputText}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Swap
              </Button>
              <Button 
                variant="outline" 
                onClick={clearAll}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {outputText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Conversion Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{characterCount}</div>
                  <div className="text-sm text-muted-foreground">Total Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{wordCount}</div>
                  <div className="text-sm text-muted-foreground">Total Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {outputText.split('\n').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Lines</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {calculateLeetRatio()}%
                  </div>
                  <div className="text-sm text-muted-foreground">Leet Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Leet Speak Reference Chart</CardTitle>
            <CardDescription>
              Common character substitutions used in leet speak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Uppercase Letters</h4>
                <div className="grid gap-1 text-sm max-h-64 overflow-y-auto">
                  {getLeetChart()
                    .filter(([char]) => /[A-Z]/.test(char))
                    .map(([char, leet]) => (
                      <div key={char} className="flex justify-between p-1 border-b">
                        <span className="font-medium">{char}</span>
                        <Badge variant="outline" className="font-mono">{leet}</Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Lowercase Letters</h4>
                <div className="grid gap-1 text-sm max-h-64 overflow-y-auto">
                  {getLeetChart()
                    .filter(([char]) => /[a-z]/.test(char))
                    .map(([char, leet]) => (
                      <div key={char} className="flex justify-between p-1 border-b">
                        <span className="font-medium">{char}</span>
                        <Badge variant="outline" className="font-mono">{leet}</Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Leet Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 border rounded">
                    <div className="font-medium mb-1">Level 1 - Basic</div>
                    <p className="text-muted-foreground">Common substitutions, ~30% conversion rate</p>
                  </div>
                  <div className="p-2 border rounded">
                    <div className="font-medium mb-1">Level 2 - Medium</div>
                    <p className="text-muted-foreground">More substitutions, ~50% conversion rate</p>
                  </div>
                  <div className="p-2 border rounded">
                    <div className="font-medium mb-1">Level 3 - Maximum</div>
                    <p className="text-muted-foreground">Aggressive substitutions, ~80% conversion rate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Text to Leet Speak</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">How to Use</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <p>
                  Leet speak (or "1337 speak") is an alternative alphabet used primarily on the Internet. 
                  It replaces letters with numbers, symbols, or other characters that resemble them. 
                  This tool allows you to convert normal text to leet speak with different intensity levels.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Three levels of leet conversion intensity</li>
                      <li>• Randomized substitutions for natural variation</li>
                      <li>• Comprehensive character substitution chart</li>
                      <li>• Copy to clipboard functionality</li>
                      <li>• Download leet text as file</li>
                      <li>• Real-time conversion statistics</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Common Use Cases:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Gaming usernames and tags</li>
                      <li>• Online forum signatures</li>
                      <li>• Social media posts</li>
                      <li>• Chat room conversations</li>
                      <li>• Creating unique identifiers</li>
                      <li>• Internet culture references</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="usage" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Step-by-Step Guide:</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>Enter your text in the "Input Text" textarea</li>
                      <li>Select your desired leet level (1-3)</li>
                      <li>Click "Convert to Leet" to transform the text</li>
                      <li>View the leet text in the "Leet Output" area</li>
                      <li>Use the action buttons to copy, download, or swap text</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Leet Level Explanations:</h4>
                    <ul className="space-y-1 text-sm">
                      <li><span className="font-medium">Level 1:</span> Basic leet with common substitutions</li>
                      <li><span className="font-medium">Level 2:</span> Medium leet with more aggressive substitutions</li>
                      <li><span className="font-medium">Level 3:</span> Maximum leet with almost all possible substitutions</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="examples" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Before and After Examples:</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Input:</div>
                        <div className="font-mono text-sm">Hello World</div>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/50">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Output (Level 2):</div>
                        <div className="font-mono text-sm">#3110 \/\/0r1d</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">More Examples:</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 border rounded">
                        <span>I love programming</span>
                        <Badge variant="outline">1 |0v3 pr0gr4mm1ng</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Leet speak is cool</span>
                        <Badge variant="outline">1337 5p34k 15 c00l</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>Hacker culture</span>
                        <Badge variant="outline">#4(k3r cu1tur3</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Historical Background:</h4>
                    <p className="text-sm">
                      Leet speak originated in the 1980s among computer hackers and bulletin board system (BBS) users. 
                      The term "leet" comes from "elite" and was used to describe skilled users. The number "1337" 
                      was used to represent "elite" because the numbers resemble the letters.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Evolution of Leet:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 1980s: Originated in hacker communities</li>
                      <li>• 1990s: Spread to online gaming and chat rooms</li>
                      <li>• 2000s: Became mainstream internet culture</li>
                      <li>• 2010s: Used in social media and memes</li>
                      <li>• Present: Recognized as internet slang and cultural phenomenon</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cultural Impact:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Influenced internet slang and communication styles</li>
                      <li>• Used in gaming communities and online identities</li>
                      <li>• Appears in memes and internet culture references</li>
                      <li>• Recognized as a form of digital expression</li>
                      <li>• Used in cybersecurity and hacker culture contexts</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}