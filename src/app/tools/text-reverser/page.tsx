'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Copy, RotateCcw, TextCursorInput } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function TextReverser() {
  const [inputText, setInputText] = useState('')
  const [reverseByWords, setReverseByWords] = useState(false)
  const [reverseByLines, setReverseByLines] = useState(false)
  const [result, setResult] = useState('')

  const reverseText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to reverse",
        variant: "destructive"
      })
      return
    }

    let reversedText = inputText

    if (reverseByLines) {
      // Reverse by lines first
      const lines = reversedText.split('\n')
      reversedText = lines.reverse().join('\n')
    }

    if (reverseByWords) {
      // Reverse by words
      const lines = reversedText.split('\n')
      const reversedLines = lines.map(line => {
        const words = line.split(' ')
        return words.reverse().join(' ')
      })
      reversedText = reversedLines.join('\n')
    } else {
      // Reverse by characters
      const lines = reversedText.split('\n')
      const reversedLines = lines.map(line => {
        return line.split('').reverse().join('')
      })
      reversedText = reversedLines.join('\n')
    }

    setResult(reversedText)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    toast({
      title: "Copied!",
      description: "Reversed text copied to clipboard"
    })
  }

  const swapText = () => {
    setInputText(result)
    setResult(inputText)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Reverser</h1>
        <p className="text-muted-foreground">Reverse text by characters, words, or lines</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TextCursorInput className="h-5 w-5" />
              Original Text
            </CardTitle>
            <CardDescription>Enter the text you want to reverse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Text to Reverse</Label>
              <Textarea
                id="input-text"
                placeholder="Enter text to reverse..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="reverse-words"
                  checked={reverseByWords}
                  onCheckedChange={setReverseByWords}
                />
                <Label htmlFor="reverse-words">Reverse by Words</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="reverse-lines"
                  checked={reverseByLines}
                  onCheckedChange={setReverseByLines}
                />
                <Label htmlFor="reverse-lines">Reverse by Lines</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={reverseText} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reverse Text
              </Button>
              {result && (
                <Button onClick={swapText} variant="outline">
                  Swap
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Reversed Text
            </CardTitle>
            <CardDescription>Reversed text output</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={result}
                readOnly
                className="min-h-[150px]"
                placeholder="Reversed text will appear here..."
              />
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {result && (
              <div className="text-sm text-muted-foreground">
                <p>Original Length: {inputText.length} characters</p>
                <p>Reversed Length: {result.length} characters</p>
                <p>Method: {reverseByLines ? 'Lines' : reverseByWords ? 'Words' : 'Characters'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reverse Options</CardTitle>
            <CardDescription>Different ways to reverse text</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2">Character Reverse</h4>
                <p className="text-muted-foreground mb-2">Reverses each character individually</p>
                <div className="bg-muted p-2 rounded font-mono text-xs">
                  "hello" → "olleh"
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2">Word Reverse</h4>
                <p className="text-muted-foreground mb-2">Reverses word order but keeps characters</p>
                <div className="bg-muted p-2 rounded font-mono text-xs">
                  "hello world" → "world hello"
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2">Line Reverse</h4>
                <p className="text-muted-foreground mb-2">Reverses line order</p>
                <div className="bg-muted p-2 rounded font-mono text-xs">
                  "line1\\nline2" → "line2\\nline1"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}