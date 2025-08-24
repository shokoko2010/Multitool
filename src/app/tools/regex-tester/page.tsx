'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Play, Trash2, FileText } from 'lucide-react'

interface RegexMatch {
  match: string
  index: number
  groups?: string[]
}

interface RegexTestResult {
  isValid: boolean
  matches: RegexMatch[]
  error?: string
  flags: {
    global: boolean
    caseInsensitive: boolean
    multiline: boolean
    dotAll: boolean
  }
}

interface TestHistory {
  id: string
  pattern: string
  flags: string
  text: string
  result: RegexTestResult
  timestamp: Date
}

export default function RegexTester() {
  const [pattern, setPattern] = useState<string>('\\b\\w+\\b')
  const [testText, setTestText] = useState<string>('Hello world! This is a test string with multiple words.')
  const [flags, setFlags] = useState({
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false
  })
  const [result, setResult] = useState<RegexTestResult | null>(null)
  const [testHistory, setTestHistory] = useState<TestHistory[]>([])
  const [selectedMatch, setSelectedMatch] = useState<number>(-1)

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?://[\\w.-]+\\.[a-zA-Z]{2,}(?:/[\\w.-]*)*/?' },
    { name: 'Phone', pattern: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b' },
    { name: 'Date', pattern: '\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b' },
    { name: 'Time', pattern: '\\b([01]?[0-9]|2[0-3]):[0-5][0-9]\\b' },
    { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { name: 'HTML Tags', pattern: '<[^>]+>' },
    { name: 'Words', pattern: '\\b\\w+\\b' },
    { name: 'Numbers', pattern: '\\b\\d+\\b' },
    { name: 'Whitespace', pattern: '\\s+' }
  ]

  const testRegex = () => {
    if (!pattern.trim()) {
      setResult({
        isValid: false,
        matches: [],
        error: 'Please enter a regex pattern',
        flags
      })
      return
    }

    try {
      const flagString = 
        (flags.global ? 'g' : '') +
        (flags.caseInsensitive ? 'i' : '') +
        (flags.multiline ? 'm' : '') +
        (flags.dotAll ? 's' : '')

      const regex = new RegExp(pattern, flagString)
      const matches: RegexMatch[] = []

      if (flags.global) {
        let match
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      } else {
        const match = regex.exec(testText)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }

      setResult({
        isValid: true,
        matches,
        flags
      })

      // Add to history
      const historyItem: TestHistory = {
        id: Date.now().toString(),
        pattern,
        flags: flagString,
        text: testText,
        result: {
          isValid: true,
          matches,
          flags
        },
        timestamp: new Date()
      }
      
      setTestHistory(prev => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      setResult({
        isValid: false,
        matches: [],
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
        flags
      })

      // Add failed test to history
      const historyItem: TestHistory = {
        id: Date.now().toString(),
        pattern,
        flags: 
          (flags.global ? 'g' : '') +
          (flags.caseInsensitive ? 'i' : '') +
          (flags.multiline ? 'm' : '') +
          (flags.dotAll ? 's' : ''),
        text: testText,
        result: {
          isValid: false,
          matches: [],
          error: error instanceof Error ? error.message : 'Invalid regex pattern',
          flags
        },
        timestamp: new Date()
      }
      
      setTestHistory(prev => [historyItem, ...prev.slice(0, 9)])
    }
  }

  const loadCommonPattern = (patternName: string) => {
    const selected = commonPatterns.find(p => p.name === patternName)
    if (selected) {
      setPattern(selected.pattern)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setPattern('')
    setTestText('')
    setResult(null)
    setSelectedMatch(-1)
  }

  const loadSampleText = () => {
    const sampleTexts = [
      'Contact us at support@example.com or call 555-123-4567. Visit https://example.com for more info.',
      'Order #12345 was placed on 12/25/2023 at 14:30. Total: $123.45. IP: 192.168.1.1',
      'The quick brown fox jumps over the lazy dog. This sentence contains all letters of the alphabet.',
      'HTML: <div class="container"><p>Hello World!</p></div>. CSS: .container { width: 100%; }',
      'User IDs: user_001, user_002, admin_001. Dates: 2024-01-15, 15/01/2024, 01/15/24'
    ]
    
    const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    setTestText(randomSample)
  }

  const highlightMatches = (text: string, matches: RegexMatch[]) => {
    if (matches.length === 0) return text

    let result = text
    const sortedMatches = [...matches].sort((a, b) => b.index - a.index)

    sortedMatches.forEach((match, index) => {
      const start = match.index
      const end = start + match.match.length
      const before = result.substring(0, start)
      const matched = result.substring(start, end)
      const after = result.substring(end)

      const isSelected = index === selectedMatch
      const highlightClass = isSelected 
        ? 'bg-yellow-300 text-black px-1 rounded' 
        : 'bg-green-200 text-black px-1 rounded'

      result = before + 
               `<mark class="${highlightClass}" data-index="${index}">` + 
               matched + 
               `</mark>` + 
               after
    })

    return result
  }

  useEffect(() => {
    testRegex()
  }, [pattern, testText, flags])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'MARK') {
        const index = parseInt(target.getAttribute('data-index') || '-1')
        setSelectedMatch(index)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Regular Expression Tester</h1>
        <p className="text-muted-foreground">Test and debug regular expressions with real-time matching</p>
      </div>

      <Tabs defaultValue="tester" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tester">Tester</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="tester" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Regular Expression
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSampleText}>
                      Sample Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter your regex pattern and test text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern</Label>
                  <Input
                    id="pattern"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter regex pattern..."
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Flags</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={flags.global}
                        onChange={(e) => setFlags(prev => ({ ...prev, global: e.target.checked }))}
                      />
                      <span className="text-sm">Global (g)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={flags.caseInsensitive}
                        onChange={(e) => setFlags(prev => ({ ...prev, caseInsensitive: e.target.checked }))}
                      />
                      <span className="text-sm">Case-insensitive (i)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={flags.multiline}
                        onChange={(e) => setFlags(prev => ({ ...prev, multiline: e.target.checked }))}
                      />
                      <span className="text-sm">Multiline (m)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={flags.dotAll}
                        onChange={(e) => setFlags(prev => ({ ...prev, dotAll: e.target.checked }))}
                      />
                      <span className="text-sm">Dotall (s)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testText">Test Text</Label>
                  <Textarea
                    id="testText"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter text to test against..."
                    className="min-h-[150px]"
                  />
                </div>

                <Button onClick={testRegex} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Test Regex
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Results
                </CardTitle>
                <CardDescription>
                  Matching results and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result && (
                  <div className={`p-3 rounded-lg ${
                    result.isValid 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {result.isValid ? (
                      <div className="flex items-center gap-2 text-green-800">
                        <Code className="h-4 w-4" />
                        <span className="font-medium">
                          Valid Regex - {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''} found
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-800">
                          <Code className="h-4 w-4" />
                          <span className="font-medium">Invalid Regex</span>
                        </div>
                        <div className="text-sm text-red-700">
                          {result.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result && result.isValid && result.matches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Matches ({result.matches.length})</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          result.matches.map(m => m.match).join('\n')
                        )}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded p-2">
                      {result.matches.map((match, index) => (
                        <div
                          key={index}
                          className={`p-2 mb-2 rounded cursor-pointer transition-colors ${
                            selectedMatch === index ? 'bg-blue-100' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedMatch(index)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-mono text-sm bg-gray-100 p-1 rounded">
                                {match.match}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Position: {match.index}
                                {match.groups && match.groups.length > 0 && (
                                  <span className="ml-2">
                                    Groups: {match.groups.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result && result.isValid && (
                  <div className="space-y-2">
                    <Label>Highlighted Text</Label>
                    <div 
                      className="border rounded p-3 min-h-[100px] whitespace-pre-wrap text-sm"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatches(testText, result.matches)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Regex Patterns</CardTitle>
              <CardDescription>
                Quick access to frequently used regular expressions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {commonPatterns.map((pattern) => (
                  <button
                    key={pattern.name}
                    className="p-3 border rounded-lg text-left hover:bg-muted transition-colors"
                    onClick={() => loadCommonPattern(pattern.name)}
                  >
                    <div className="font-medium text-sm">{pattern.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {pattern.pattern}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regex Reference</CardTitle>
              <CardDescription>
                Quick reference for regular expression syntax
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Character Classes</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">.</code>
                      <span>Any character</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">\d</code>
                      <span>Digit</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">\w</code>
                      <span>Word character</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">\s</code>
                      <span>Whitespace</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">[abc]</code>
                      <span>Character set</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Quantifiers</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">*</code>
                      <span>0 or more</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">+</code>
                      <span>1 or more</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">?</code>
                      <span>0 or 1</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">{n}</code>
                      <span>Exactly n</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">{`{n,}`}</code>
                      <span>n or more</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Anchors</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">^</code>
                      <span>Start of string</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">$</code>
                      <span>End of string</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">\b</code>
                      <span>Word boundary</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">\B</code>
                      <span>Non-word boundary</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Groups</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">(abc)</code>
                      <span>Capturing group</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">(?:abc)</code>
                      <span>Non-capturing</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">a|b</code>
                      <span>Alternation</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Flags</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">g</code>
                      <span>Global search</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">i</code>
                      <span>Case-insensitive</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">m</code>
                      <span>Multiline</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="font-mono bg-gray-100 px-1 rounded">s</code>
                      <span>Dotall mode</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>
                Your recent regex tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No test history yet
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.pattern} {item.flags && `(${item.flags})`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.result.isValid ? 
                            `${item.result.matches.length} matches found` : 
                            'Invalid pattern'
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                        {!item.result.isValid && item.result.error && (
                          <div className="text-xs text-red-500 mt-1">
                            Error: {item.result.error}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={item.result.isValid ? 'default' : 'destructive'}>
                          {item.result.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}