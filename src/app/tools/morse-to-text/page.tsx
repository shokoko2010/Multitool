'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Radio, Copy, Download, FileText, RotateCcw, Info, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

// Reverse Morse code mapping
const reverseMorseCodeMap: { [key: string]: string } = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
  '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
  '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
  '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
  '-.--': 'Y', '--..': 'Z',
  '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
  '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': "'", '-.-.--': '!',
  '-..-.': '/', '-.--.': '(', '-.--.-': ')', '.-...': '&', '---...': ':',
  '-.-.-.': ';', '-...-': '=', '.-.-.': '+', '-....-': '-', '..--.-': '_',
  '.-..-.': '"', '...-..-': '$', '.--.-.': '@', '/': ' '
}

export default function MorseToText() {
  const [inputMorse, setInputMorse] = useState('')
  const [outputText, setOutputText] = useState('')
  const [symbolCount, setSymbolCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const convertToText = () => {
    if (!inputMorse.trim()) {
      toast.error('Please enter some Morse code to convert')
      return
    }

    try {
      // Split Morse code into symbols, handling multiple spaces
      const morseSymbols = inputMorse.trim().split(/\s+/)
      const textChars = morseSymbols.map(symbol => {
        const char = reverseMorseCodeMap[symbol]
        if (!char) {
          // Return the original symbol if not found (for error handling)
          return `[${symbol}]`
        }
        return char
      })
      
      const converted = textChars.join('')
      setOutputText(converted)
      
      // Update statistics
      setSymbolCount(morseSymbols.length)
      setWordCount(converted.trim() ? converted.trim().split(/\s+/).length : 0)
      
      toast.success('Morse code converted to text successfully!')
    } catch (error) {
      toast.error('Failed to convert Morse code. Please check the format.')
    }
  }

  const copyToClipboard = () => {
    if (!outputText) {
      toast.error('No text to copy')
      return
    }
    
    navigator.clipboard.writeText(outputText)
    toast.success('Text copied to clipboard!')
  }

  const downloadText = () => {
    if (!outputText) {
      toast.error('No text to download')
      return
    }

    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'decoded-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Text downloaded successfully!')
  }

  const clearAll = () => {
    setInputMorse('')
    setOutputText('')
    setSymbolCount(0)
    setWordCount(0)
    toast.success('All text cleared!')
  }

  const swapText = () => {
    setInputMorse(outputText)
    setOutputText(inputMorse)
    toast.success('Text swapped!')
  }

  const playMorseCode = async () => {
    if (!inputMorse) {
      toast.error('No Morse code to play')
      return
    }

    setIsPlaying(true)
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const morseSymbols = inputMorse.trim().split(/\s+/)
      
      for (const symbol of morseSymbols) {
        for (const char of symbol) {
          if (char === '.') {
            await playTone(audioContext, 600, 100) // Short beep
          } else if (char === '-') {
            await playTone(audioContext, 600, 300) // Long beep
          }
          
          await new Promise(resolve => setTimeout(resolve, 50)) // Symbol pause
        }
        
        await new Promise(resolve => setTimeout(resolve, 200)) // Letter pause
      }
      
      audioContext.close()
      toast.success('Morse code played successfully!')
    } catch (error) {
      toast.error('Failed to play Morse code')
    } finally {
      setIsPlaying(false)
    }
  }

  const playTone = (audioContext: AudioContext, frequency: number, duration: number) => {
    return new Promise((resolve) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
      
      oscillator.onended = () => resolve(null)
    })
  }

  const validateMorseCode = (morse: string): boolean => {
    const validChars = /^[.\-\s\/]+$/
    return validChars.test(morse)
  }

  const getMorseChart = () => {
    return Object.entries(reverseMorseCodeMap)
      .filter(([morse]) => morse !== '/')
      .sort(([a], [b]) => a.localeCompare(b))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Morse Code to Text</h1>
        <p className="text-muted-foreground">
          Decode Morse code back to text with audio playback and validation
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Morse Code Decoding
            </CardTitle>
            <CardDescription>
              Enter Morse code below and convert it back to readable text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Morse Code Input</label>
                <Textarea
                  placeholder="Enter Morse code here (use . for dots, - for dashes, spaces between letters)"
                  value={inputMorse}
                  onChange={(e) => setInputMorse(e.target.value)}
                  className="min-h-[200px] resize-y font-mono text-sm"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Symbols: {inputMorse.trim() ? inputMorse.trim().split(/\s+/).length : 0}</span>
                  <span>Valid: {validateMorseCode(inputMorse) ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Output</label>
                <Textarea
                  value={outputText}
                  readOnly
                  className="min-h-[200px] resize-y bg-muted/50"
                  placeholder="Decoded text will appear here..."
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Characters: {symbolCount}</span>
                  <span>Words: {wordCount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={convertToText} 
                disabled={!inputMorse.trim()}
                className="flex items-center gap-2"
              >
                <Radio className="h-4 w-4" />
                Decode Morse Code
              </Button>
              <Button 
                variant="outline" 
                onClick={playMorseCode}
                disabled={!inputMorse || isPlaying}
                className="flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </Button>
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                disabled={!outputText}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadText}
                disabled={!outputText}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline" 
                onClick={swapText}
                disabled={!outputText}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Swap
              </Button>
              <Button 
                variant="outline" 
                onClick={clearAll}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {outputText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Decoding Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{symbolCount}</div>
                  <div className="text-sm text-muted-foreground">Morse Symbols</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{wordCount}</div>
                  <div className="text-sm text-muted-foreground">Decoded Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {outputText.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Text Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(symbolCount / outputText.length * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Compression Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Morse Code Reference Chart</CardTitle>
            <CardDescription>
              Complete Morse code chart for decoding reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Letters A-Z</h4>
                <div className="grid gap-1 text-sm">
                  {getMorseChart()
                    .filter(([morse, char]) => /[A-Z]/.test(char))
                    .map(([morse, char]) => (
                      <div key={morse} className="flex justify-between p-1 border-b">
                        <Badge variant="outline" className="font-mono">{morse}</Badge>
                        <span className="font-medium">{char}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Numbers 0-9</h4>
                <div className="grid gap-1 text-sm">
                  {getMorseChart()
                    .filter(([morse, char]) => /[0-9]/.test(char))
                    .map(([morse, char]) => (
                      <div key={morse} className="flex justify-between p-1 border-b">
                        <Badge variant="outline" className="font-mono">{morse}</Badge>
                        <span className="font-medium">{char}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Punctuation</h4>
                <div className="grid gap-1 text-sm">
                  {getMorseChart()
                    .filter(([morse, char]) => /[^A-Z0-9]/.test(char) && char !== ' ')
                    .map(([morse, char]) => (
                      <div key={morse} className="flex justify-between p-1 border-b">
                        <Badge variant="outline" className="font-mono">{morse}</Badge>
                        <span className="font-medium">{char}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Morse Code to Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">How to Use</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <p>
                  The Morse Code to Text tool decodes Morse code sequences back into readable text. 
                  It supports the complete Morse code alphabet including letters, numbers, and 
                  punctuation marks, with audio playback to verify the input.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Complete Morse code alphabet support</li>
                      <li>• Input validation and error handling</li>
                      <li>• Audio playback for verification</li>
                      <li>• Copy to clipboard functionality</li>
                      <li>• Download decoded text as file</li>
                      <li>• Comprehensive reference chart</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Common Use Cases:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Decoding received Morse messages</li>
                      <li>• Learning Morse code recognition</li>
                      <li>• Verifying Morse code translations</li>
                      <li>• Historical document analysis</li>
                      <li>• Emergency message decoding</li>
                      <li>• Amateur radio practice</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="usage" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Step-by-Step Guide:</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>Enter Morse code in the input area (use . for dots, - for dashes)</li>
                      <li>Use spaces to separate letters, multiple spaces for words</li>
                      <li>Click "Decode Morse Code" to convert to text</li>
                      <li>View the decoded text in the output area</li>
                      <li>Use "Play Audio" to verify the Morse code input</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Input Format:</h4>
                    <ul className="space-y-1 text-sm">
                      <li><span className="font-medium">Dots:</span> Use period (.)</li>
                      <li><span className="font-medium">Dashes:</span> Use hyphen (-)</li>
                      <li><span className="font-medium">Letter separation:</span> Single space</li>
                      <li><span className="font-medium">Word separation:</span> Multiple spaces or forward slash (/)</li>
                      <li><span className="font-medium">Invalid characters:</span> Will be shown in brackets [ ]</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="examples" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Before and After Examples:</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Input:</div>
                        <div className="font-mono text-sm">.... . .-.. .-.. --- / .-- --- .-. .-.. -..</div>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/50">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Output:</div>
                        <div className="font-mono text-sm">HELLO WORLD</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">More Examples:</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 border rounded">
                        <span className="font-mono">... --- ...</span>
                        <Badge variant="outline">SOS</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span className="font-mono">.. / .-.. --- ...- . / -.-- --- ..-</span>
                        <Badge variant="outline">I LOVE YOU</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span className="font-mono">.---- ..--- ...-- / .- -... -.-.</span>
                        <Badge variant="outline">123 ABC</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span className="font-mono">--..-- / .-.-.- / ..--..</span>
                        <Badge variant="outline">, . ?</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tips" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Decoding Tips:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Listen to the audio playback to verify your input</li>
                      <li>• Use the reference chart to look up unfamiliar codes</li>
                      <li>• Check for proper spacing between letters and words</li>
                      <li>• Invalid Morse sequences will be shown in brackets</li>
                      <li>• Common mistake: confusing dots and dashes</li>
                      <li>• Remember that spaces are important for proper decoding</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Common Morse Code Patterns:</h4>
                    <ul className="space-y-1 text-sm">
                      <li><span className="font-medium">E:</span> Single dot (.) - most common letter</li>
                      <li><span className="font-medium">T:</span> Single dash (-) - second most common</li>
                      <li><span className="font-medium">Vowels:</span> Usually shorter sequences</li>
                      <li><span className="font-medium">Consonants:</span> Often longer sequences</li>
                      <li><span className="font-medium">Numbers:</span> All 5 symbols long, pattern-based</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}