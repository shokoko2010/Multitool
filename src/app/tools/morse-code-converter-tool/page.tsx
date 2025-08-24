'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, FileText, Radio, Play, Pause } from 'lucide-react'

export default function MorseCodeConverterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

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

  const reverseMorseMap: { [key: string]: string } = Object.entries(morseCodeMap).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
  }, {} as { [key: string]: string })

  const processMorseCode = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeToMorse(input.toUpperCase())
        setOutput(encoded)
      } else {
        const decoded = decodeFromMorse(input.trim())
        setOutput(decoded)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`)
    }
  }, [input, mode])

  const encodeToMorse = (text: string): string => {
    return text.split('').map(char => {
      if (char === ' ') return '/'
      return morseCodeMap[char] || char
    }).join(' ')
  }

  const decodeFromMorse = (morse: string): string => {
    return morse.split(' ').map(code => {
      if (code === '/') return ' '
      return reverseMorseMap[code] || code
    }).join('')
  }

  const playMorseCode = async () => {
    if (!output || isPlaying) return

    try {
      if (!audioContext) {
        const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(newAudioContext)
      }

      setIsPlaying(true)
      const dotDuration = 100 // milliseconds
      const dashDuration = dotDuration * 3
      const symbolGap = dotDuration
      const letterGap = dotDuration * 3
      const wordGap = dotDuration * 7

      const context = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      
      oscillator.frequency.value = 600
      gainNode.gain.value = 0.3

      let currentTime = context.currentTime

      for (const char of output) {
        switch (char) {
          case '.':
            oscillator.start(currentTime)
            oscillator.stop(currentTime + dotDuration / 1000)
            currentTime += dotDuration / 1000 + symbolGap / 1000
            break
          case '-':
            oscillator.start(currentTime)
            oscillator.stop(currentTime + dashDuration / 1000)
            currentTime += dashDuration / 1000 + symbolGap / 1000
            break
          case ' ':
            currentTime += letterGap / 1000
            break
          case '/':
            currentTime += wordGap / 1000
            break
        }
      }

      oscillator.start()
      oscillator.stop(currentTime)

      setTimeout(() => {
        setIsPlaying(false)
      }, currentTime * 1000)

    } catch (error) {
      console.error('Error playing morse code:', error)
      setIsPlaying(false)
    }
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
      a.download = `morse-code-${mode === 'encode' ? 'encoded' : 'decoded'}.txt`
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

  const getExamples = () => {
    return [
      { text: 'SOS', morse: '... --- ...' },
      { text: 'HELLO WORLD', morse: '.... . .-.. .-.. --- / .-- --- .-. .-.. -..' },
      { text: 'I LOVE YOU', morse: '.. / .-.. --- ...- . / -.-- --- ..-' },
      { text: 'HELP', morse: '.... . .-.. .--.' }
    ]
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Morse Code Converter
          </CardTitle>
          <CardDescription>
            Convert text to Morse code and vice versa, with audio playback capability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Text to Morse</TabsTrigger>
              <TabsTrigger value="decode">Morse to Text</TabsTrigger>
            </TabsList>

            <TabsContent value="encode" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Text</label>
                <Textarea
                  placeholder="Enter text to convert to Morse code..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="decode" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Morse Code</label>
                <Textarea
                  placeholder="Enter Morse code to decode (use . for dit, - for dah, / for space between words)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={processMorseCode} disabled={!input.trim()}>
              Convert
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

          {output && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Output</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {mode === 'encode' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={playMorseCode} 
                      disabled={isPlaying}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                rows={6}
                className="font-mono"
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About Morse Code</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="reference">Reference</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What is Morse Code?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Morse code is a method used in telecommunication to encode text characters as 
                    sequences of two different signal durations, called dots and dashes. It was 
                    developed in the 1830s and 1840s by Samuel Morse and Alfred Vail.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Morse code uses a standardized sequence of short and long elements to represent 
                    the letters, numerals, punctuation, and special characters of a given message. 
                    It was widely used for maritime communication and is still used today in 
                    aviation and amateur radio.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Examples</h4>
                  <div className="space-y-2">
                    {getExamples().map((example, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-background rounded">
                          <div className="font-medium text-muted-foreground">Text:</div>
                          <div className="font-mono">{example.text}</div>
                        </div>
                        <div className="p-2 bg-background rounded">
                          <div className="font-medium text-muted-foreground">Morse:</div>
                          <div className="font-mono">{example.morse}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reference" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Morse Code Reference</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(morseCodeMap).map(([char, code]) => (
                      <div key={char} className="flex justify-between p-1">
                        <span className="font-mono">{char}:</span>
                        <span className="font-mono">{code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">How to Use Morse Code</h4>
            <p className="text-sm text-muted-foreground">
              In Morse code, each character is represented by a unique sequence of dots (.) and dashes (-). 
              A dot is a short signal, while a dash is a signal three times as long. The space between 
              dots and dashes within a character is equal to the duration of a dot. The space between 
              characters is equal to three dots, and the space between words is equal to seven dots.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}