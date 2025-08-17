'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Radio, Copy, Download, FileText, RotateCcw, Info, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

// Morse code mapping
const morseCodeMap: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
}

export default function TextToMorse() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const convertToMorse = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to convert')
      return
    }

    const morse = inputText
      .toUpperCase()
      .split('')
      .map(char => morseCodeMap[char] || char)
      .join(' ')
    
    setOutputText(morse)
    
    // Update statistics
    setCharacterCount(inputText.length)
    setWordCount(inputText.trim() ? inputText.trim().split(/\s+/).length : 0)
    
    toast.success('Text converted to Morse code successfully!')
  }

  const copyToClipboard = () => {
    if (!outputText) {
      toast.error('No Morse code to copy')
      return
    }
    
    navigator.clipboard.writeText(outputText)
    toast.success('Morse code copied to clipboard!')
  }

  const downloadText = () => {
    if (!outputText) {
      toast.error('No Morse code to download')
      return
    }

    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'morse-code.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Morse code downloaded successfully!')
  }

  const clearAll = () => {
    setInputText('')
    setOutputText('')
    setCharacterCount(0)
    setWordCount(0)
    toast.success('All text cleared!')
  }

  const swapText = () => {
    setInputText(outputText.replace(/\//g, ' '))
    setOutputText(inputText)
    toast.success('Text swapped!')
  }

  const playMorseCode = async () => {
    if (!outputText) {
      toast.error('No Morse code to play')
      return
    }

    setIsPlaying(true)
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      for (const symbol of outputText) {
        if (symbol === '.') {
          await playTone(audioContext, 600, 100) // Short beep
        } else if (symbol === '-') {
          await playTone(audioContext, 600, 300) // Long beep
        } else if (symbol === ' ') {
          await new Promise(resolve => setTimeout(resolve, 200)) // Short pause
        } else if (symbol === '/') {
          await new Promise(resolve => setTimeout(resolve, 500)) // Word pause
        }
        
        await new Promise(resolve => setTimeout(resolve, 50)) // Symbol pause
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

  const getMorseChart = () => {
    return Object.entries(morseCodeMap)
      .filter(([char]) => char !== ' ')
      .sort(([a], [b]) => a.localeCompare(b))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text to Morse Code</h1>
        <p className="text-muted-foreground">
          Convert text to Morse code with audio playback and comprehensive reference
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Text Conversion
            </CardTitle>
            <CardDescription>
              Enter your text below and convert it to Morse code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Text</label>
                <Textarea
                  placeholder="Enter your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-y"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Characters: {inputText.length}</span>
                  <span>Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Morse Code Output</label>
                <Textarea
                  value={outputText}
                  readOnly
                  className="min-h-[200px] resize-y bg-muted/50 font-mono text-sm"
                  placeholder="Morse code will appear here..."
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Characters: {characterCount}</span>
                  <span>Words: {wordCount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={convertToMorse} 
                disabled={!inputText.trim()}
                className="flex items-center gap-2"
              >
                <Radio className="h-4 w-4" />
                Convert to Morse
              </Button>
              <Button 
                variant="outline" 
                onClick={playMorseCode}
                disabled={!outputText || isPlaying}
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
                Conversion Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{characterCount}</div>
                  <div className="text-sm text-muted-foreground">Input Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{wordCount}</div>
                  <div className="text-sm text-muted-foreground">Input Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {outputText.split(' ').filter(s => s.length > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Morse Symbols</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(outputText.length / characterCount * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Expansion Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Morse Code Reference Chart</CardTitle>
            <CardDescription>
              Complete Morse code chart for letters, numbers, and punctuation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Letters A-Z</h4>
                <div className="grid gap-1 text-sm">
                  {getMorseChart()
                    .filter(([char]) => /[A-Z]/.test(char))
                    .map(([char, morse]) => (
                      <div key={char} className="flex justify-between p-1 border-b">
                        <span className="font-medium">{char}</span>
                        <Badge variant="outline" className="font-mono">{morse}</Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Numbers 0-9</h4>
                <div className="grid gap-1 text-sm">
                  {getMorseChart()
                    .filter(([char]) => /[0-9]/.test(char))
                    .map(([char, morse]) => (
                      <div key={char} className="flex justify-between p-1 border-b">
                        <span className="font-medium">{char}</span>
                        <Badge variant="outline" className="font-mono">{morse}</Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Punctuation</h4>
                <div className="grid gap-1 text-sm">
                  {getMorseChart()
                    .filter(([char]) => /[^A-Z0-9]/.test(char) && char !== ' ')
                    .map(([char, morse]) => (
                      <div key={char} className="flex justify-between p-1 border-b">
                        <span className="font-medium">{char}</span>
                        <Badge variant="outline" className="font-mono">{morse}</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Text to Morse Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">How to Use</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <p>
                  The Text to Morse Code tool converts your text into Morse code, a method used in 
                  telecommunication that encodes text characters as sequences of dots (.) and dashes (-). 
                  This tool includes audio playback so you can hear how the Morse code would sound.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Complete alphabet and number support</li>
                      <li>• Punctuation and special characters</li>
                      <li>• Audio playback with realistic timing</li>
                      <li>• Copy to clipboard functionality</li>
                      <li>• Download Morse code as text file</li>
                      <li>• Comprehensive reference chart</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Common Use Cases:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Learning Morse code</li>
                      <li>• Emergency communication</li>
                      <li>• Amateur radio practice</li>
                      <li>• Educational purposes</li>
                      <li>• Secret messaging</li>
                      <li>• Historical communication</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="usage" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Step-by-Step Guide:</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>Enter your text in the "Input Text" textarea</li>
                      <li>Click "Convert to Morse" to transform the text</li>
                      <li>View the Morse code in the output area</li>
                      <li>Click "Play Audio" to hear the Morse code</li>
                      <li>Use the action buttons to copy, download, or swap text</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Morse Code Rules:</h4>
                    <ul className="space-y-1 text-sm">
                      <li><span className="font-medium">Dot (.):</span> Short signal, one unit length</li>
                      <li><span className="font-medium">Dash (-):</span> Long signal, three units length</li>
                      <li><span className="font-medium">Space between symbols:</span> One unit pause</li>
                      <li><span className="font-medium">Space between letters:</span> Three units pause</li>
                      <li><span className="font-medium">Space between words:</span> Seven units pause</li>
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
                        <div className="font-mono text-sm">HELLO WORLD</div>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/50">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Output:</div>
                        <div className="font-mono text-sm">.... . .-.. .-.. --- / .-- --- .-. .-.. -..</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">More Examples:</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 border rounded">
                        <span>SOS</span>
                        <Badge variant="outline">... --- ...</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>I LOVE YOU</span>
                        <Badge variant="outline">.. / .-.. --- ...- . / -.-- --- ..-</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>HELP ME</span>
                        <Badge variant="outline">.... . .-.. .--. / -- .</Badge>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>123 ABC</span>
                        <Badge variant="outline">.---- ..--- ...-- / .- -... -.-.</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Historical Background:</h4>
                    <p className="text-sm">
                      Morse code was invented by Samuel Morse and Alfred Vail in the 1830s for use with 
                      their electrical telegraph system. It became the standard for international 
                      maritime communication until 1999 and is still used by amateur radio operators 
                      and in emergency situations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Interesting Facts:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• The most famous Morse code message is "SOS" (... --- ...)</li>
                      <li>• Morse code was used in aviation until the 1990s</li>
                      <li>• The Titanic used Morse code to send distress signals</li>
                      <li>• Morse code can be transmitted via light, sound, or touch</li>
                      <li>• It's one of the most versatile communication methods ever created</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Modern Applications:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Amateur radio communication</li>
                      <li>• Aviation navigation aids</li>
                      <li>• Military communication backup</li>
                      <li>• Assistive technology for disabled individuals</li>
                      <li>• Emergency signaling methods</li>
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