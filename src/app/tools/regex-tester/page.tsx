'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Code, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Search, Plus } from 'lucide-react'

interface MatchResult {
  match: string
  index: number
  groups?: string[]
  captures?: { [key: string]: string }
}

interface TestResult {
  totalMatches: number
  matches: MatchResult[]
  error?: string
  processingTime: number
}

interface PatternSuggestion {
  name: string
  pattern: string
  description: string
  category: string
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false
  })
  const [testText, setTestText] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [savedPatterns, setSavedPatterns] = useState<{name: string, pattern: string}[]>([])

  const patternSuggestions: PatternSuggestion[] = [
    {
      name: 'Email',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      description: 'Match email addresses',
      category: 'Contact'
    },
    {
      name: 'Phone',
      pattern: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
      description: 'Match phone numbers',
      category: 'Contact'
    },
    {
      name: 'URL',
      pattern: 'https?://[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*',
      description: 'Match URLs',
      category: 'Web'
    },
    {
      name: 'IP Address',
      pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      description: 'Match IP addresses',
      category: 'Network'
    },
    {
      name: 'Date',
      pattern: '\\b\\d{1,4}[/-]\\d{1,2}[/-]\\d{1,4}\\b',
      description: 'Match dates',
      category: 'Date'
    },
    {
      name: 'Credit Card',
      pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
      description: 'Match credit card numbers',
      category: 'Finance'
    },
    {
      name: 'Hex Color',
      pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
      description: 'Match hex color codes',
      category: 'Design'
    },
    {
      name: 'Username',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,15}$',
      description: 'Match usernames',
      category: 'User'
    }
  ]

  const flagOptions = [
    { key: 'g', label: 'g - Global', description: 'Find all matches' },
    { key: 'i', label: 'i - Case-insensitive', description: 'Ignore case' },
    { key: 'm', label: 'm - Multiline', description: '^ and $ match start/end of line' },
    { key: 's', label: 's - Dotall', description: '. matches newline' },
    { key: 'u', label: 'u - Unicode', description: 'Unicode support' },
    { key: 'y', label: 'y - Sticky', description: 'Match at current position only' }
  ]

  const testRegex = async () => {
    if (!pattern) {
      setError('Please enter a regular expression pattern')
      return
    }

    if (!testText) {
      setError('Please enter text to test against')
      return
    }

    setIsTesting(true)
    setError(null)
    setSuccess(false)
    setTestResult(null)
    setSelectedMatch(null)

    try {
      const startTime = performance.now()
      
      // Build regex string with flags
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => flag)
        .join('')
      
      const regex = new RegExp(pattern, flagString)
      
      const matches = []
      let match
      let lastIndex = 0
      
      while ((match = regex.exec(testText)) !== null) {
        const result: MatchResult = {
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        }
        
        // Add named capture groups if available
        if (match.groups && typeof match.groups === 'object') {
          result.captures = {}
          Object.keys(match.groups).forEach((key, index) => {
            if (key !== 'index' && key !== 'input' && key !== 'groups') {
              result.captures![key] = match.groups![index]
            }
          })
        }
        
        matches.push(result)
        
        // Prevent infinite loops with global flag
        if (!flags.g && matches.length > 0) break
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
      }

      const processingTime = performance.now() - startTime

      const result: TestResult = {
        totalMatches: matches.length,
        matches,
        processingTime
      }

      setTestResult(result)
      setSuccess(true)

    } catch (err) {
      setError(`Invalid regular expression: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  const applySuggestion = (suggestion: PatternSuggestion) => {
    setPattern(suggestion.pattern)
  }

  const savePattern = () => {
    if (!pattern) return
    
    const name = prompt('Enter a name for this pattern:')
    if (name) {
      setSavedPatterns(prev => [...prev, { name, pattern }])
    }
  }

  const loadSavedPattern = (savedPattern: {name: string, pattern: string}) => {
    setPattern(savedPattern.pattern)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadResults = () => {
    if (!testResult) return

    const content = JSON.stringify({
      pattern,
      flags: Object.entries(flags).filter(([_, enabled]) => enabled).map(([flag, _]) => flag),
      testText,
      results: testResult,
      timestamp: new Date().toISOString()
    }, null, 2)

    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'regex_test_results.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateTestText = () => {
    const sampleText = `Sample Data for Testing:

Emails:
john.doe@example.com
jane.smith@company.co.uk
support@website.org

Phone Numbers:
+1-555-0123
(555) 123-4567
555.123.4567

URLs:
https://www.example.com
http://google.com/search
https://github.com/user/repo

IP Addresses:
192.168.1.1
10.0.0.1
172.16.254.1

Dates:
2024-01-15
15/01/2024
01-15-2024

Credit Cards:
4111-1111-1111-1111
5424-1801-2000-9999
3714-496353-98431

Hex Colors:
#FF5733
#00FF00
#4169E1

Usernames:
johndoe
jane_smith
user123`
    
    setTestText(sampleText)
  }

  const getFlagString = () => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => flag)
      .join('') || '(none)'
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Regex Tester
            </CardTitle>
            <CardDescription>
              Test regular expressions with real-time feedback and detailed match analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pattern" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pattern">Pattern</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="pattern" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pattern">Regular Expression Pattern</Label>
                    <Input
                      id="pattern"
                      placeholder="Enter your regex pattern..."
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Flags: {getFlagString()}
                      </span>
                      <Button variant="outline" size="sm" onClick={savePattern}>
                        <Plus className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Flags</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {flagOptions.map((flag) => (
                        <div key={flag.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`flag-${flag.key}`}
                            checked={flags[flag.key as keyof typeof flags]}
                            onCheckedChange={(checked) => 
                              setFlags(prev => ({ ...prev, [flag.key]: checked as boolean }))
                            }
                          />
                          <Label htmlFor={`flag-${flag.key}`} className="text-sm">
                            {flag.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Suggested Patterns</Label>
                    <Button variant="outline" size="sm" onClick={generateTestText}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sample Text
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {patternSuggestions.map((suggestion, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{suggestion.name}</h4>
                            <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                          <code className="text-xs bg-gray-100 p-1 rounded block mb-2">
                            {suggestion.pattern}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            Use Pattern
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {savedPatterns.length > 0 && (
                  <div>
                    <Label>Saved Patterns</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {savedPatterns.map((saved, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-gray-200"
                          onClick={() => loadSavedPattern(saved)}
                        >
                          {saved.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <div>
                  <Label htmlFor="test-text">Test Text</Label>
                  <Textarea
                    id="test-text"
                    placeholder="Enter text to test your regex against..."
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    rows={8}
                  />
                </div>

                <Button
                  onClick={testRegex}
                  disabled={isTesting || !pattern || !testText}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Test Regex
                    </>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {success && testResult && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700 text-sm">
                      Found {testResult.totalMatches} matches in {testResult.processingTime.toFixed(2)}ms
                    </span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                {testResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{testResult.totalMatches}</div>
                          <div className="text-sm text-muted-foreground">Matches</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{testResult.processingTime.toFixed(2)}ms</div>
                          <div className="text-sm text-muted-foreground">Processing Time</div>
                        </div>
                      </div>
                      <Button variant="outline" onClick={downloadResults}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Pattern: /{pattern}/{getFlagString()}</h4>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium border-b">Match</th>
                              <th className="px-4 py-2 text-left text-sm font-medium border-b">Position</th>
                              <th className="px-4 py-2 text-left text-sm font-medium border-b">Groups</th>
                              <th className="px-4 py-2 text-left text-sm font-medium border-b">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testResult.matches.map((match, index) => (
                              <tr 
                                key={index} 
                                className={`hover:bg-gray-50 ${selectedMatch === match ? 'bg-blue-50' : ''}`}
                                onClick={() => setSelectedMatch(match)}
                              >
                                <td className="px-4 py-2 text-sm border-b">
                                  <code className="bg-blue-100 px-1 rounded">{match.match}</code>
                                </td>
                                <td className="px-4 py-2 text-sm border-b">{match.index}</td>
                                <td className="px-4 py-2 text-sm border-b">
                                  {match.groups && match.groups.length > 0 ? match.groups.join(', ') : '-'}
                                </td>
                                <td className="px-4 py-2 text-sm border-b">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyToClipboard(match.match)
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {selectedMatch && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Selected Match Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="font-medium">Full Match:</span>
                            <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{selectedMatch.match}</code>
                          </div>
                          <div>
                            <span className="font-medium">Position:</span>
                            <span className="ml-2">{selectedMatch.index}</span>
                          </div>
                          {selectedMatch.groups && selectedMatch.groups.length > 0 && (
                            <div>
                              <span className="font-medium">Capture Groups:</span>
                              <div className="mt-1 space-y-1">
                                {selectedMatch.groups.map((group, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-mono">Group {index + 1}:</span>
                                    <code className="ml-2 bg-gray-100 px-1 rounded">{group || '(empty)'}</code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedMatch.captures && Object.keys(selectedMatch.captures).length > 0 && (
                            <div>
                              <span className="font-medium">Named Captures:</span>
                              <div className="mt-1 space-y-1">
                                {Object.entries(selectedMatch.captures).map(([name, value]) => (
                                  <div key={name} className="text-sm">
                                    <span className="font-mono">{name}:</span>
                                    <code className="ml-2 bg-gray-100 px-1 rounded">{value}</code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No test results yet. Go to the Test tab to run your regex.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Pattern Testing:</strong> Test regex patterns with sample text
            </div>
            <div>
              <strong>Flag Support:</strong> Global, case-insensitive, multiline, dotall, unicode, sticky
            </div>
            <div>
              <strong>Pattern Library:</strong> Pre-built patterns for common use cases
            </div>
            <div>
              <strong>Match Analysis:</strong> Detailed view of matches with capture groups
            </div>
            <div>
              <strong>Pattern Saving:</strong> Save and reuse your favorite patterns
            </div>
            <div>
              <strong>Export Results:</strong> Download test results as JSON
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}