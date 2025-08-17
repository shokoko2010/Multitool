"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, Scissors, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function TextTrimmer() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [trimType, setTrimType] = useState<'all' | 'start' | 'end' | 'both'>('both')
  const [trimCharacters, setTrimCharacters] = useState(' ')
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false)
  const [removeDuplicateLines, setRemoveDuplicateLines] = useState(false)
  const [customTrim, setCustomTrim] = useState(false)

  const trimText = (text: string) => {
    let result = text
    
    // Handle whitespace trimming
    if (!customTrim) {
      switch (trimType) {
        case 'all':
          result = result.replace(/\s+/g, ' ').trim()
          break
        case 'start':
          result = result.replace(/^\s+/, '')
          break
        case 'end':
          result = result.replace(/\s+$/, '')
          break
        case 'both':
          result = result.trim()
          break
      }
    } else {
      // Custom character trimming
      const charsToTrim = trimCharacters.split('').map(char => 
        char === ' ' ? '\\s' : char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      ).join('')
      
      const regex = new RegExp(`^[${charsToTrim}]+|[${charsToTrim}]+$`, 'g')
      result = result.replace(regex, '')
    }
    
    // Remove empty lines
    if (removeEmptyLines) {
      result = result.replace(/^\s*\n/gm, '').replace(/\n\s*$/gm, '')
    }
    
    // Remove duplicate lines
    if (removeDuplicateLines) {
      const lines = result.split('\n')
      const uniqueLines = [...new Set(lines)]
      result = uniqueLines.join('\n')
    }
    
    return result
  }

  const handleTrim = () => {
    const trimmed = trimText(inputText)
    setOutputText(trimmed)
    toast.success('Text trimmed successfully!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trimmed-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    toast.success('Cleared!')
  }

  const getTextStats = (text: string) => {
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split('\n').length,
      emptyLines: text.split('\n').filter(line => line.trim() === '').length
    }
  }

  const inputStats = getTextStats(inputText)
  const outputStats = getTextStats(outputText)

  const getTrimmedStats = () => {
    if (!inputText || !outputText) return null
    
    return {
      charactersRemoved: inputStats.characters - outputStats.characters,
      spacesRemoved: (inputStats.characters - inputStats.charactersNoSpaces) - (outputStats.characters - outputStats.charactersNoSpaces),
      linesRemoved: inputStats.lines - outputStats.lines,
      emptyLinesRemoved: inputStats.emptyLines - outputStats.emptyLines
    }
  }

  const trimmedStats = getTrimmedStats()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Text Trimmer</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Remove whitespace, empty lines, and duplicate content from your text. Clean up your text with precision.
            </p>
          </motion.div>
        </div>

        {/* Trim Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Trim Options
            </CardTitle>
            <CardDescription>
              Configure how you want to trim your text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom Trim Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="custom-trim"
                checked={customTrim}
                onCheckedChange={setCustomTrim}
              />
              <Label htmlFor="custom-trim">Use custom characters to trim</Label>
            </div>

            {!customTrim ? (
              <div>
                <Label className="text-sm font-medium mb-3 block">Trim Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'both', label: 'Both Ends', description: 'Trim from start and end' },
                    { id: 'start', label: 'Start Only', description: 'Trim from start only' },
                    { id: 'end', label: 'End Only', description: 'Trim from end only' },
                    { id: 'all', label: 'All Whitespace', description: 'Remove all extra spaces' }
                  ].map((option) => (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={trimType === option.id ? "default" : "outline"}
                        className="w-full h-auto p-3 flex flex-col items-center gap-1"
                        onClick={() => setTrimType(option.id as any)}
                      >
                        <Scissors className="h-5 w-5" />
                        <span className="font-medium text-sm">{option.label}</span>
                        <span className="text-xs text-muted-foreground text-center">{option.description}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="trim-characters" className="text-sm font-medium mb-2 block">
                  Characters to Trim
                </Label>
                <input
                  id="trim-characters"
                  type="text"
                  value={trimCharacters}
                  onChange={(e) => setTrimCharacters(e.target.value)}
                  placeholder="Enter characters to trim (e.g., ,.;:)"
                  className="w-full p-2 border rounded-md font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter characters you want to remove from start and end of text
                </p>
              </div>
            )}

            {/* Additional Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-empty-lines"
                  checked={removeEmptyLines}
                  onCheckedChange={setRemoveEmptyLines}
                />
                <Label htmlFor="remove-empty-lines">Remove empty lines</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-duplicate-lines"
                  checked={removeDuplicateLines}
                  onCheckedChange={setRemoveDuplicateLines}
                />
                <Label htmlFor="remove-duplicate-lines">Remove duplicate lines</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Input Text
              </CardTitle>
              <CardDescription>
                Enter or paste your text here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {inputStats.characters} chars
                </Badge>
                <Badge variant="secondary">
                  <Type className="h-3 w-3 mr-1" />
                  {inputStats.words} words
                </Badge>
                <Badge variant="secondary">
                  <AlignLeft className="h-3 w-3 mr-1" />
                  {inputStats.lines} lines
                </Badge>
                {inputStats.emptyLines > 0 && (
                  <Badge variant="outline">
                    {inputStats.emptyLines} empty lines
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Output Text
              </CardTitle>
              <CardDescription>
                Trimmed text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[200px] font-mono text-sm"
                placeholder="Trimmed text will appear here..."
              />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {outputStats.characters} chars
                </Badge>
                <Badge variant="secondary">
                  <Type className="h-3 w-3 mr-1" />
                  {outputStats.words} words
                </Badge>
                <Badge variant="secondary">
                  <AlignLeft className="h-3 w-3 mr-1" />
                  {outputStats.lines} lines
                </Badge>
                {outputStats.emptyLines > 0 && (
                  <Badge variant="outline">
                    {outputStats.emptyLines} empty lines
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCopy} disabled={!outputText} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownload} disabled={!outputText} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trim Statistics */}
        {trimmedStats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Trim Statistics
              </CardTitle>
              <CardDescription>
                See what was removed from your text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {trimmedStats.charactersRemoved}
                  </div>
                  <div className="text-sm text-muted-foreground">Characters Removed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {trimmedStats.spacesRemoved}
                  </div>
                  <div className="text-sm text-muted-foreground">Spaces Removed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {trimmedStats.linesRemoved}
                  </div>
                  <div className="text-sm text-muted-foreground">Lines Removed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {trimmedStats.emptyLinesRemoved}
                  </div>
                  <div className="text-sm text-muted-foreground">Empty Lines Removed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={handleTrim} disabled={!inputText} size="lg">
            <Scissors className="h-4 w-4 mr-2" />
            Trim Text
          </Button>
          <Button onClick={handleClear} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Use Cases */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Use Cases
            </CardTitle>
            <CardDescription>
              Common uses for text trimming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Data Cleaning</h4>
                <p className="text-sm text-muted-foreground">
                  Clean up messy data and remove extra whitespace
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Code Formatting</h4>
                <p className="text-sm text-muted-foreground">
                  Remove trailing spaces and clean up code
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Text Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Prepare text for analysis or processing
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">CSV Cleaning</h4>
                <p className="text-sm text-muted-foreground">
                  Clean up CSV data and remove empty lines
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Editing</h4>
                <p className="text-sm text-muted-foreground">
                  Remove duplicate content and clean text
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Log Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Clean up log files and remove empty entries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}