'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Type, RotateCcw, Text } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

interface ConversionResult {
  originalText: string
  convertedText: string
  conversionType: string
  characterCount: number
  wordCount: number
  statistics: {
    uppercase: number
    lowercase: number
    numbers: number
    spaces: number
    special: number
  }
}

export default function TextToTitleCase() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { trackUsage } = useToolAccess('text-to-titlecase')

  const handleConvert = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to convert')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before converting
      await trackUsage()

      const response = await fetch('/api/text-tools/case-converter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          conversionType: 'titlecase'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert text')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResult = () => {
    if (result) {
      const content = `Text to Title Case Conversion

Original Text:
${result.originalText}

Converted Text:
${result.convertedText}

Statistics:
- Character Count: ${result.characterCount}
- Word Count: ${result.wordCount}
- Uppercase Letters: ${result.statistics.uppercase}
- Lowercase Letters: ${result.statistics.lowercase}
- Numbers: ${result.statistics.numbers}
- Spaces: ${result.statistics.spaces}
- Special Characters: ${result.statistics.special}`
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'titlecase-conversion.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInputText('')
    setResult(null)
    setError(null)
  }

  const loadSample = () => {
    setInputText('hello world! this is a SAMPLE text for testing the title case converter. it should look like a proper title.')
    setResult(null)
    setError(null)
  }

  return (
    <ToolLayout
      toolId="text-to-titlecase"
      toolName="Text to Title Case"
      toolDescription="Convert text to title case format (Capitalize Each Word)"
      toolCategory="Text Tools"
      toolIcon={<Text className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>
              Enter the text you want to convert to title case
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              rows={8}
              className="resize-none"
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={handleConvert}
                className="flex-1"
                disabled={loading || !inputText.trim()}
              >
                {loading ? 'Converting...' : (
                  <>
                    <Type className="w-4 h-4 mr-2" />
                    Convert to Title Case
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={loadSample}>
                Sample
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Title Case Result</CardTitle>
            <CardDescription>
              Your converted text will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Type className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Converting to title case...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Converted Text */}
                <div className="space-y-2">
                  <Label>Converted Text</Label>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-lg font-mono font-semibold text-purple-900 leading-relaxed">
                      {result.convertedText}
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{result.characterCount}</div>
                    <div className="text-sm text-blue-700">Characters</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{result.wordCount}</div>
                    <div className="text-sm text-green-700">Words</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">{result.statistics.uppercase}</div>
                    <div className="text-sm text-orange-700">Capitalized</div>
                  </div>
                </div>

                {/* Detailed Statistics */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Detailed Statistics</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lowercase Letters:</span>
                      <Badge variant="outline">{result.statistics.lowercase}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Numbers:</span>
                      <Badge variant="outline">{result.statistics.numbers}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Spaces:</span>
                      <Badge variant="outline">{result.statistics.spaces}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Special Characters:</span>
                      <Badge variant="outline">{result.statistics.special}</Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.convertedText)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Result
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResult}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Text className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to convert</h3>
                <p className="text-muted-foreground">
                  Enter text above and click "Convert to Title Case" to transform it
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Title Case Conversion Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 What This Tool Does</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Capitalizes the first letter of each word</li>
                <li>• Converts remaining letters to lowercase</li>
                <li>• Handles punctuation and special characters</li>
                <li>• Preserves numbers and symbols</li>
                <li>• Works with any text length</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Common Uses</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Creating book and article titles</li>
                <li>• Formatting headings and subheadings</li>
                <li>• Standardizing document titles</li>
                <li>• Preparing text for publication</li>
                <li>• Creating professional presentations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}