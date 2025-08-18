'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Type, RotateCcw, Divide } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'
import { Label } from '@/components/ui/label'

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

export default function TextToKebabCase() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { trackUsage } = useToolAccess('text-to-kebabcase')

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
          conversionType: 'kebabcase'
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
      const content = `Text to Kebab Case Conversion

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
      a.download = 'kebabcase-conversion.txt'
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
    setInputText('Hello World! This is a SAMPLE text for testing the kebab case converter.')
    setResult(null)
    setError(null)
  }

  return (
    <ToolLayout
      toolId="text-to-kebabcase"
      toolName="Text to Kebab Case"
      toolDescription="Convert text to kebab-case format for URLs and CSS"
      toolCategory="Text Tools"
      toolIcon={<Divide className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>
              Enter the text you want to convert to kebab-case
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
                    Convert to kebab-case
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
            <CardTitle>kebab-case Result</CardTitle>
            <CardDescription>
              Your converted text will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Type className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Converting to kebab-case...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Converted Text */}
                <div className="space-y-2">
                  <Label>Converted Text</Label>
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <p className="text-lg font-mono font-semibold text-teal-900 leading-relaxed">
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
                  <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{result.wordCount}</div>
                    <div className="text-sm text-purple-700">Words</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">{result.statistics.uppercase}</div>
                    <div className="text-sm text-orange-700">Uppercase</div>
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
                <Divide className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to convert</h3>
                <p className="text-muted-foreground">
                  Enter text above and click "Convert to kebab-case" to transform it
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Kebab Case Conversion Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 What This Tool Does</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Converts text to kebab-case format</li>
                <li>• Replaces spaces with hyphens</li>
                <li>• Converts all letters to lowercase</li>
                <li>• Removes special characters</li>
                <li>• Perfect for URLs and CSS classes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Common Uses</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• URL slugs and paths</li>
                <li>• CSS class names</li>
                <li>• HTML id attributes</li>
                <li>• File names for web</li>
                <li>• SEO-friendly URLs</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <h4 className="font-medium mb-2 text-teal-900">💡 Example</h4>
            <div className="text-sm text-teal-800 space-y-1">
              <p><strong>Input:</strong> "Hello World! This is a test"</p>
              <p><strong>Output:</strong> "hello-world-this-is-a-test"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}