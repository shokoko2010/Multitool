'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Search, Replace, Copy, Download, History } from 'lucide-react'

interface ReplacementRule {
  find: string
  replace: string
  caseSensitive: boolean
  wholeWord: boolean
  useRegex: boolean
}

interface ReplacementHistory {
  id: string
  input: string
  output: string
  rules: ReplacementRule[]
  timestamp: Date
}

export default function TextReplacerTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [rules, setRules] = useState<ReplacementRule[]>([
    { find: '', replace: '', caseSensitive: false, wholeWord: false, useRegex: false }
  ])
  const [history, setHistory] = useState<ReplacementHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const performReplacement = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    let result = input

    rules.forEach(rule => {
      if (!rule.find) return

      try {
        let flags = rule.caseSensitive ? 'g' : 'gi'
        let pattern: RegExp

        if (rule.useRegex) {
          pattern = new RegExp(rule.find, flags)
        } else {
          let escapedFind = rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          
          if (rule.wholeWord) {
            pattern = new RegExp(`\\b${escapedFind}\\b`, flags)
          } else {
            pattern = new RegExp(escapedFind, flags)
          }
        }

        result = result.replace(pattern, rule.replace)
      } catch (error) {
        console.error('Regex error:', error)
      }
    })

    setOutput(result)

    // Add to history
    const newHistory: ReplacementHistory = {
      id: Date.now().toString(),
      input,
      output: result,
      rules: rules.filter(r => r.find),
      timestamp: new Date()
    }

    setHistory(prev => [newHistory, ...prev].slice(0, 10)) // Keep last 10 items
  }, [input, rules])

  const addRule = () => {
    setRules(prev => [...prev, { find: '', replace: '', caseSensitive: false, wholeWord: false, useRegex: false }])
  }

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index))
  }

  const updateRule = (index: number, field: keyof ReplacementRule, value: any) => {
    setRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    ))
  }

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
    }
  }

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'replaced-text.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  const loadFromHistory = (historyItem: ReplacementHistory) => {
    setInput(historyItem.input)
    setRules(historyItem.rules)
    setOutput(historyItem.output)
  }

  const getReplacementsCount = () => {
    if (!input || !output) return 0
    
    const inputLines = input.split('\n')
    const outputLines = output.split('\n')
    let differences = 0
    
    for (let i = 0; i < Math.max(inputLines.length, outputLines.length); i++) {
      if (inputLines[i] !== outputLines[i]) {
        differences++
      }
    }
    
    return differences
  }

  const getExamples = () => {
    return [
      { description: 'Replace multiple spaces with single space', find: ' +', replace: ' ', useRegex: true },
      { description: 'Replace line breaks with spaces', find: '\n', replace: ' ', useRegex: false },
      { description: 'Remove special characters', find: '[^a-zA-Z0-9\s]', replace: '', useRegex: true },
      { description: 'Replace tabs with spaces', find: '\t', replace: '    ', useRegex: false }
    ]
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Replace className="h-5 w-5" />
            Text Replacer
          </CardTitle>
          <CardDescription>
            Find and replace text patterns with multiple rules and advanced options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Input Text</Label>
                <Textarea
                  placeholder="Enter text to process..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Replacement Rules</Label>
                  <Button variant="outline" size="sm" onClick={addRule}>
                    Add Rule
                  </Button>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {rules.map((rule, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rule {index + 1}</span>
                        {rules.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(index)}
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Find</Label>
                          <Input
                            value={rule.find}
                            onChange={(e) => updateRule(index, 'find', e.target.value)}
                            placeholder="Text to find..."
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Replace with</Label>
                          <Input
                            value={rule.replace}
                            onChange={(e) => updateRule(index, 'replace', e.target.value)}
                            placeholder="Replacement text..."
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`case-${index}`}
                            checked={rule.caseSensitive}
                            onCheckedChange={(checked) => updateRule(index, 'caseSensitive', checked)}
                          />
                          <Label htmlFor={`case-${index}`} className="text-xs">Case sensitive</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`whole-${index}`}
                            checked={rule.wholeWord}
                            onCheckedChange={(checked) => updateRule(index, 'wholeWord', checked)}
                          />
                          <Label htmlFor={`whole-${index}`} className="text-xs">Whole word</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`regex-${index}`}
                            checked={rule.useRegex}
                            onCheckedChange={(checked) => updateRule(index, 'useRegex', checked)}
                          />
                          <Label htmlFor={`regex-${index}`} className="text-xs">Use regex</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={performReplacement} disabled={!input.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                  <div className="flex-1" />
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Output Text</Label>
                <Textarea
                  value={output}
                  readOnly
                  rows={8}
                  className="font-mono"
                />
              </div>

              {output && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <div className="flex-1" />
                  <div className="text-sm text-muted-foreground">
                    {getReplacementsCount()} lines changed
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full justify-start"
                >
                  <History className="h-4 w-4 mr-2" />
                  {showHistory ? 'Hide' : 'Show'} History
                </Button>

                {showHistory && history.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border-b hover:bg-muted cursor-pointer"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="text-sm font-medium">
                          {item.rules.length} rule{item.rules.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.input.length} → {item.output.length} characters
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="examples" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="examples">Common Examples</TabsTrigger>
                <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Common Replacement Patterns</h4>
                  <div className="space-y-2">
                    {getExamples().map((example, index) => (
                      <div key={index} className="p-2 bg-background rounded text-sm">
                        <div className="font-medium">{example.description}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          Find: "{example.find}" → Replace: "{example.replace}"
                          {example.useRegex && ' (Regex)'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tips" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Tips & Tricks</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use multiple rules to perform complex replacements in sequence</li>
                    <li>• Enable "Whole word" to avoid replacing parts of words</li>
                    <li>• Use regex patterns for advanced matching (e.g., \d+ for numbers)</li>
                    <li>• Test your rules on small text samples first</li>
                    <li>• Use the history feature to quickly reapply previous replacements</li>
                    <li>• For case-insensitive replacement, keep "Case sensitive" unchecked</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}