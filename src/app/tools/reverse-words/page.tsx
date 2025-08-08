'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, RefreshCw, RotateCcw, Type, AlignLeft, AlignRight, AlignCenter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ReverseText() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [reverseMode, setReverseMode] = useState('characters')
  const [preserveFormatting, setPreserveFormatting] = useState(false)
  const [alignment, setAlignment] = useState('left')
  const { toast } = useToast()

  const reverseText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to reverse",
        variant: "destructive",
      })
      return
    }

    let result = ''

    switch (reverseMode) {
      case 'characters':
        result = reverseCharacters(inputText, preserveFormatting)
        break
      case 'words':
        result = reverseWords(inputText)
        break
      case 'lines':
        result = reverseLines(inputText)
        break
      case 'sentences':
        result = reverseSentences(inputText)
        break
      default:
        result = inputText.split('').reverse().join('')
    }

    setOutputText(result)
  }

  const reverseCharacters = (text: string, preserve: boolean): string => {
    if (preserve) {
      // Preserve word boundaries while reversing characters within words
      return text.split(' ').map(word => word.split('').reverse().join('')).join(' ')
    }
    return text.split('').reverse().join('')
  }

  const reverseWords = (text: string): string => {
    return text.split(/\s+/).reverse().join(' ')
  }

  const reverseLines = (text: string): string => {
    return text.split('\n').reverse().join('\n')
  }

  const reverseSentences = (text: string): string => {
    // Split sentences by common sentence-ending punctuation
    const sentences = text.split(/(?<=[.!?])\s+/)
    return sentences.reverse().join(' ')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
      variant: "default",
    })
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
  }

  const swapText = () => {
    setInputText(outputText)
    setOutputText(inputText)
  }

  const insertSampleText = () => {
    const sampleText = "Hello World! This is a sample text for testing the reverse text functionality. You can reverse characters, words, lines, or entire sentences."
    setInputText(sampleText)
  }

  const getAlignmentIcon = () => {
    switch (alignment) {
      case 'left': return <AlignLeft className="h-4 w-4" />
      case 'center': return <AlignCenter className="h-4 w-4" />
      case 'right': return <AlignRight className="h-4 w-4" />
      default: return <AlignLeft className="h-4 w-4" />
    }
  }

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-left'
    }
  }

  const textStats = {
    input: {
      characters: inputText.length,
      words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
      lines: inputText ? inputText.split('\n').length : 0,
      sentences: inputText ? inputText.split(/(?<=[.!?])\s+/).length : 0,
    },
    output: {
      characters: outputText.length,
      words: outputText.trim() ? outputText.trim().split(/\s+/).length : 0,
      lines: outputText ? outputText.split('\n').length : 0,
      sentences: outputText ? outputText.split(/(?<=[.!?])\s+/).length : 0,
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reverse Text</h1>
          <p className="text-muted-foreground">Reverse text by characters, words, lines, or sentences with customizable options</p>
        </div>

        <div className="grid gap-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Reverse Settings</CardTitle>
              <CardDescription>Choose how you want to reverse the text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reverse-mode">Reverse Mode</Label>
                  <Select value={reverseMode} onValueChange={setReverseMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reverse mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="characters">Reverse Characters</SelectItem>
                      <SelectItem value="words">Reverse Words</SelectItem>
                      <SelectItem value="lines">Reverse Lines</SelectItem>
                      <SelectItem value="sentences">Reverse Sentences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alignment">Text Alignment</Label>
                  <Select value={alignment} onValueChange={setAlignment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="preserve-formatting"
                  type="checkbox"
                  checked={preserveFormatting}
                  onChange={(e) => setPreserveFormatting(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="preserve-formatting" className="text-sm">
                  Preserve word boundaries (Character mode only)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Input Text
              </CardTitle>
              <CardDescription>Enter the text you want to reverse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={insertSampleText} variant="outline" size="sm">
                  Insert Sample Text
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  Clear All
                </Button>
              </div>
              
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Chars: {textStats.input.characters}</span>
                  <span>Words: {textStats.input.words}</span>
                  <span>Lines: {textStats.input.lines}</span>
                  <span>Sentences: {textStats.input.sentences}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Reversed Text
              </CardTitle>
              <CardDescription>The result of your text reversal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={reverseText} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reverse Text
                </Button>
                <Button onClick={swapText} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Swap
                </Button>
                <Button 
                  onClick={() => copyToClipboard(outputText)} 
                  variant="outline" 
                  size="sm"
                  disabled={!outputText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <div className={`min-h-[150px] p-4 border rounded-lg bg-muted ${getAlignmentClass()}`}>
                {outputText || (
                  <div className="text-muted-foreground">
                    The reversed text will appear here...
                  </div>
                )}
              </div>
              
              {outputText && (
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Chars: {textStats.output.characters}</span>
                    <span>Words: {textStats.output.words}</span>
                    <span>Lines: {textStats.output.lines}</span>
                    <span>Sentences: {textStats.output.sentences}</span>
                  </div>
                  <Badge variant="secondary">
                    {reverseMode === 'characters' && (preserveFormatting ? 'Words Preserved' : 'Fully Reversed')}
                    {reverseMode === 'words' && 'Words Reversed'}
                    {reverseMode === 'lines' && 'Lines Reversed'}
                    {reverseMode === 'sentences' && 'Sentences Reversed'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Examples</CardTitle>
              <CardDescription>See how different reverse modes work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Original Text:</h4>
                    <div className="p-3 bg-muted rounded text-sm font-mono">
                      Hello World! This is a test.
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Character Reversed:</h4>
                    <div className="p-3 bg-muted rounded text-sm font-mono">
                      .tset a si sihT !dlroW olleH
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Word Reversed:</h4>
                    <div className="p-3 bg-muted rounded text-sm font-mono">
                      test a is This World! Hello
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Sentence Reversed:</h4>
                    <div className="p-3 bg-muted rounded text-sm font-mono">
                      This is a test. World! Hello
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>Best practices for text reversal</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Character reversal changes the order of individual letters</li>
                <li>• Word reversal maintains word order but changes letter order within words</li>
                <li>• Use preserve formatting to keep words intact while reversing characters</li>
                <li>• Sentence reversal is useful for reordering paragraphs or sections</li>
                <li>• The alignment option helps with visual presentation of the reversed text</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}