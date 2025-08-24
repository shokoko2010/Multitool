'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Code, Play, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MatchResult {
  match: string
  index: number
  groups: string[]
}

export default function RegularExpressionTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState({
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false
  })
  const [testText, setTestText] = useState('')
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [error, setError] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [highlightedText, setHighlightedText] = useState('')
  const { toast } = useToast()

  const flagDescriptions = {
    global: 'Global (g) - Find all matches',
    caseInsensitive: 'Case Insensitive (i) - Ignore case',
    multiline: 'Multiline (m) - ^ and $ match start/end of lines',
    dotAll: 'Dot All (s) - . matches newline characters'
  }

  const testRegex = () => {
    if (!pattern.trim()) {
      setError('Please enter a regular expression pattern')
      return
    }

    setIsTesting(true)
    setError('')

    try {
      // Build flags string
      const flagString = Object.entries(flags)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          switch (key) {
            case 'global': return 'g'
            case 'caseInsensitive': return 'i'
            case 'multiline': return 'm'
            case 'dotAll': return 's'
            default: return ''
          }
        })
        .join('')

      const regex = new RegExp(pattern, flagString)
      const testMatches: MatchResult[] = []
      
      if (flags.global) {
        let match
        while ((match = regex.exec(testText)) !== null) {
          testMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          
          // Prevent infinite loops for zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(testText)
        if (match) {
          testMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }

      setMatches(testMatches)
      
      // Create highlighted text
      if (testMatches.length > 0) {
        let highlighted = testText
        let offset = 0
        
        testMatches.forEach(match => {
          const start = match.index + offset
          const end = start + match.match.length
          const before = highlighted.slice(0, start)
          const matchedText = highlighted.slice(start, end)
          const after = highlighted.slice(end)
          
          highlighted = before + `<mark class="bg-yellow-200 px-1 rounded">${matchedText}</mark>` + after
          offset += `<mark class="bg-yellow-200 px-1 rounded"></mark>`.length
        })
        
        setHighlightedText(highlighted)
      } else {
        setHighlightedText(testText)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regular expression')
      setMatches([])
      setHighlightedText(testText)
    } finally {
      setIsTesting(false)
    }
  }

  const handleFlagChange = (flagName: keyof typeof flags, checked: boolean) => {
    setFlags(prev => ({ ...prev, [flagName]: checked }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to clipboard",
    })
  }

  const downloadResults = () => {
    const content = `Regular Expression Test Results
=================================

Pattern: ${pattern}
Flags: ${Object.entries(flags)
  .filter(([_, value]) => value)
  .map(([key, _]) => {
    switch (key) {
      case 'global': return 'g'
      case 'caseInsensitive': return 'i'
      case 'multiline': return 'm'
      case 'dotAll': return 's'
      default: return ''
    }
  })
  .join('') || 'none'}

Test Text:
${testText}

Results:
${matches.length === 0 ? 'No matches found' : 
  matches.map((match, index) => 
    `Match ${index + 1}:
  Text: "${match.match}"
  Position: ${match.index}
  Groups: ${match.groups.length > 0 ? match.groups.map((g, i) => `Group ${i + 1}: "${g}"`).join(', ') : 'None'}`
  ).join('\n\n')
}

Generated on: ${new Date().toLocaleString()}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'regex-test-results.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadExample = (examplePattern: string, exampleText: string) => {
    setPattern(examplePattern)
    setTestText(exampleText)
    setMatches([])
    setHighlightedText(exampleText)
    setError('')
  }

  const clearAll = () => {
    setPattern('')
    setTestText('')
    setMatches([])
    setHighlightedText('')
    setError('')
    setFlags({
      global: true,
      caseInsensitive: false,
      multiline: false,
      dotAll: false
    })
  }

  const examples = [
    {
      name: 'Email Validation',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      text: 'Contact us at support@example.com or sales@company.org for more information.'
    },
    {
      name: 'Phone Numbers',
      pattern: '\\(\\d{3}\\)\\s\\d{3}-\\d{4}|\\d{3}-\\d{3}-\\d{4}',
      text: 'Call us at (555) 123-4567 or 555-987-6543 for assistance.'
    },
    {
      name: 'URL Extraction',
      pattern: 'https?://[^\\s]+',
      text: 'Visit https://www.example.com or http://test.site for more details.'
    },
    {
      name: 'HTML Tags',
      pattern: '<[^>]+>',
      text: '<div class="container"><p>Hello World</p></div>'
    }
  ]

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            Regular Expression Tester
          </CardTitle>
          <CardDescription>
            Test and debug regular expressions with real-time matching and highlighting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Pattern Input */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testRegex} disabled={isTesting || !pattern.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Test Pattern'}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                {matches.length > 0 && (
                  <Button variant="outline" onClick={downloadResults}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">Regular Expression Pattern:</Label>
                <Input
                  id="pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter your regex pattern..."
                  className="font-mono"
                />
              </div>

              {/* Flags */}
              <div className="space-y-2">
                <Label>Flags:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(flags).map(([flagName, isChecked]) => (
                    <div key={flagName} className="flex items-center space-x-2">
                      <Checkbox
                        id={flagName}
                        checked={isChecked}
                        onCheckedChange={(checked) => 
                          handleFlagChange(flagName as keyof typeof flags, checked as boolean)
                        }
                      />
                      <Label htmlFor={flagName} className="text-sm">
                        {flagDescriptions[flagName as keyof typeof flagDescriptions]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Text */}
              <div className="space-y-2">
                <Label htmlFor="test-text">Test Text:</Label>
                <Textarea
                  id="test-text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to test against the pattern..."
                  className="min-h-32 font-mono"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-red-600 font-medium">Error: {error}</div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {matches.length > 0 && (
              <Tabs defaultValue="matches" className="w-full">
                <TabsList>
                  <TabsTrigger value="matches">Matches ({matches.length})</TabsTrigger>
                  <TabsTrigger value="highlighted">Highlighted Text</TabsTrigger>
                </TabsList>

                <TabsContent value="matches" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Match Results</h3>
                      <Badge variant="outline">
                        {matches.length} match{matches.length !== 1 ? 'es' : ''} found
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {matches.map((match, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Match {index + 1}</CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  Position: {match.index}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(match.match)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Matched Text:</Label>
                                <div className="font-mono text-sm bg-muted p-2 rounded mt-1">
                                  {match.match}
                                </div>
                              </div>
                              
                              {match.groups.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Capture Groups:</Label>
                                  <div className="space-y-1 mt-1">
                                    {match.groups.map((group, groupIndex) => (
                                      <div key={groupIndex} className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          Group {groupIndex + 1}
                                        </Badge>
                                        <span className="font-mono text-sm">{group || '(empty)'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="highlighted" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Highlighted Text</h3>
                    <div className="text-sm text-muted-foreground">
                      Matches are highlighted in yellow
                    </div>
                    
                    <div 
                      className="border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap bg-white"
                      dangerouslySetInnerHTML={{ __html: highlightedText }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Examples</CardTitle>
                <CardDescription>
                  Click on any example to load it into the tester
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examples.map((example, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{example.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Pattern: </span>
                            <code className="bg-muted px-1 rounded">{example.pattern}</code>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {example.text}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadExample(example.pattern, example.text)}
                            className="w-full"
                          >
                            Load Example
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regex Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Character Classes</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code>.</code> - Any character</li>
                      <li><code>\d</code> - Digit (0-9)</li>
                      <li><code>\w</code> - Word character</li>
                      <li><code>\s</code> - Whitespace</li>
                      <li><code>[abc]</code> - Character set</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Quantifiers</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code>*</code> - 0 or more</li>
                      <li><code>+</code> - 1 or more</li>
                      <li><code>?</code> - 0 or 1</li>
                      <li><code>{`{n}`}</code> - Exactly n</li>
                      <li><code>{`{n,m}`}</code> - n to m</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Anchors & Groups</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li><code>^</code> - Start of string</li>
                      <li><code>$</code> - End of string</li>
                      <li><code>( )</code> - Capture group</li>
                      <li><code>|</code> - OR operator</li>
                      <li><code>\</code> - Escape character</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}