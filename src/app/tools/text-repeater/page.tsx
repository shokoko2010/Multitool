'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Repeat } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function TextRepeater() {
  const [inputText, setInputText] = useState('')
  const [repeatCount, setRepeatCount] = useState(3)
  const [separator, setSeparator] = useState('newline')
  const [customSeparator, setCustomSeparator] = useState('')
  const [result, setResult] = useState('')

  const repeatText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to repeat",
        variant: "destructive"
      })
      return
    }

    if (repeatCount < 1 || repeatCount > 1000) {
      toast({
        title: "Error",
        description: "Repeat count must be between 1 and 1000",
        variant: "destructive"
      })
      return
    }

    let separatorText = ''
    switch (separator) {
      case 'newline':
        separatorText = '\n'
        break
      case 'space':
        separatorText = ' '
        break
      case 'comma':
        separatorText = ', '
        break
      case 'semicolon':
        separatorText = '; '
        break
      case 'custom':
        separatorText = customSeparator
        break
      case 'none':
        separatorText = ''
        break
    }

    const repeatedText = Array(repeatCount).fill(inputText).join(separatorText)
    setResult(repeatedText)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    toast({
      title: "Copied!",
      description: "Repeated text copied to clipboard"
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Repeater</h1>
        <p className="text-muted-foreground">Repeat text multiple times with custom separators</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Input Settings
            </CardTitle>
            <CardDescription>Configure text repetition settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Text to Repeat</Label>
              <Textarea
                id="input-text"
                placeholder="Enter text to repeat..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="repeat-count">Repeat Count</Label>
              <Input
                id="repeat-count"
                type="number"
                min="1"
                max="1000"
                value={repeatCount}
                onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="separator">Separator</Label>
              <Select value={separator} onValueChange={setSeparator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newline">New Line</SelectItem>
                  <SelectItem value="space">Space</SelectItem>
                  <SelectItem value="comma">Comma</SelectItem>
                  <SelectItem value="semicolon">Semicolon</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {separator === 'custom' && (
              <div>
                <Label htmlFor="custom-separator">Custom Separator</Label>
                <Input
                  id="custom-separator"
                  placeholder="Enter custom separator..."
                  value={customSeparator}
                  onChange={(e) => setCustomSeparator(e.target.value)}
                />
              </div>
            )}

            <Button onClick={repeatText} className="w-full">
              <Repeat className="h-4 w-4 mr-2" />
              Repeat Text
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Result
            </CardTitle>
            <CardDescription>Repeated text output</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={result}
                readOnly
                className="min-h-[200px]"
                placeholder="Repeated text will appear here..."
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
                <p>Repeated: {repeatCount} times</p>
                <p>Total Length: {result.length} characters</p>
                <p>Lines: {result.split('\n').length}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}