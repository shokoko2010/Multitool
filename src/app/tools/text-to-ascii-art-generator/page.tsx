'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Type, RotateCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FontStyle {
  name: string
  chars: { [key: string]: string[] }
  height: number
}

const fontStyles: FontStyle[] = [
  {
    name: 'Standard',
    height: 7,
    chars: {
      'A': [
        '  █  ',
        ' █ █ ',
        '███ ',
        '█ █ ',
        '█   █'
      ],
      'B': [
        '███ ',
        '█  █',
        '███ ',
        '█  █',
        '███ '
      ],
      'C': [
        ' ███',
        '█   ',
        '█   ',
        '█   ',
        ' ███'
      ],
      'D': [
        '███ ',
        '█  █',
        '█  █',
        '█  █',
        '███ '
      ],
      'E': [
        '████',
        '█   ',
        '███ ',
        '█   ',
        '████'
      ],
      'F': [
        '████',
        '█   ',
        '███ ',
        '█   ',
        '█   '
      ],
      'G': [
        ' ███',
        '█   ',
        '█ ███',
        '█  ██',
        ' ████'
      ],
      'H': [
        '█  █',
        '█  █',
        '████',
        '█  █',
        '█  █'
      ],
      'I': [
        '████',
        '  █ ',
        '  █ ',
        '  █ ',
        '████'
      ],
      'J': [
        '  ██',
        '   █',
        '   █',
        '█  █',
        ' ██ '
      ],
      'K': [
        '█  █',
        '█ █ ',
        '██  ',
        '█ █ ',
        '█  █'
      ],
      'L': [
        '█   ',
        '█   ',
        '█   ',
        '█   ',
        '████'
      ],
      'M': [
        '█   █',
        '██ ██',
        '█ █ █',
        '█   █',
        '█   █'
      ],
      'N': [
        '█   █',
        '██  █',
        '█ █ █',
        '█  ██',
        '█   █'
      ],
      'O': [
        ' ███',
        '█   █',
        '█   █',
        '█   █',
        ' ███'
      ],
      'P': [
        '███ ',
        '█  █',
        '███ ',
        '█   ',
        '█   '
      ],
      'Q': [
        ' ███',
        '█   █',
        '█  ██',
        '█   █',
        '████'
      ],
      'R': [
        '███ ',
        '█  █',
        '███ ',
        '█ █ ',
        '█  █'
      ],
      'S': [
        ' ███',
        '█   ',
        ' ███',
        '   █',
        '███ '
      ],
      'T': [
        '████',
        '  █ ',
        '  █ ',
        '  █ ',
        '  █ '
      ],
      'U': [
        '█   █',
        '█   █',
        '█   █',
        '█   █',
        ' ███'
      ],
      'V': [
        '█   █',
        '█   █',
        '█   █',
        ' █ █ ',
        '  █  '
      ],
      'W': [
        '█   █',
        '█   █',
        '█ █ █',
        '██ ██',
        '█   █'
      ],
      'X': [
        '█   █',
        ' █ █ ',
        '  █  ',
        ' █ █ ',
        '█   █'
      ],
      'Y': [
        '█   █',
        ' █ █ ',
        '  █  ',
        '  █  ',
        '  █  '
      ],
      'Z': [
        '████',
        '   █',
        '  █ ',
        ' █  ',
        '████'
      ],
      ' ': [
        '     ',
        '     ',
        '     ',
        '     ',
        '     '
      ],
      '0': [
        ' ███',
        '█  ██',
        '█ █ █',
        '██  █',
        ' ███'
      ],
      '1': [
        '  █ ',
        ' ██ ',
        '  █ ',
        '  █ ',
        '████'
      ],
      '2': [
        ' ███',
        '█  ██',
        '   █',
        '  █ ',
        '████'
      ],
      '3': [
        '███ ',
        '   ██',
        ' ███',
        '   ██',
        '███ '
      ],
      '4': [
        '█   █',
        '█   █',
        '████',
        '    █',
        '    █'
      ],
      '5': [
        '████',
        '█   ',
        '███ ',
        '   █',
        '███ '
      ],
      '6': [
        ' ███',
        '█   ',
        '███ ',
        '█  █',
        ' ███'
      ],
      '7': [
        '████',
        '   █',
        '  █ ',
        ' █  ',
        '█   '
      ],
      '8': [
        ' ███',
        '█  █',
        ' ███',
        '█  █',
        ' ███'
      ],
      '9': [
        ' ███',
        '█  █',
        ' ████',
        '    █',
        '███ '
      ]
    }
  },
  {
    name: 'Block',
    height: 5,
    chars: {
      'A': [
        '█████',
        '█   █',
        '█████',
        '█   █',
        '█   █'
      ],
      'B': [
        '████ ',
        '█   █',
        '████ ',
        '█   █',
        '████ '
      ],
      'C': [
        ' ████',
        '█    ',
        '█    ',
        '█    ',
        ' ████'
      ],
      'D': [
        '████ ',
        '█   █',
        '█   █',
        '█   █',
        '████ '
      ],
      'E': [
        '█████',
        '█    ',
        '████ ',
        '█    ',
        '█████'
      ],
      'F': [
        '█████',
        '█    ',
        '████ ',
        '█    ',
        '█    '
      ],
      'G': [
        ' ████',
        '█    ',
        '█ ███',
        '█   █',
        ' ████'
      ],
      'H': [
        '█   █',
        '█   █',
        '█████',
        '█   █',
        '█   █'
      ],
      'I': [
        '█████',
        '  █  ',
        '  █  ',
        '  █  ',
        '█████'
      ],
      'J': [
        '█████',
        '    █',
        '    █',
        '█   █',
        ' ███ '
      ],
      'K': [
        '█   █',
        '█  █ ',
        '███  ',
        '█  █ ',
        '█   █'
      ],
      'L': [
        '█    ',
        '█    ',
        '█    ',
        '█    ',
        '█████'
      ],
      'M': [
        '█   █',
        '██ ██',
        '█ █ █',
        '█   █',
        '█   █'
      ],
      'N': [
        '█   █',
        '██  █',
        '█ █ █',
        '█  ██',
        '█   █'
      ],
      'O': [
        ' ███ ',
        '█   █',
        '█   █',
        '█   █',
        ' ███ '
      ],
      'P': [
        '████ ',
        '█   █',
        '████ ',
        '█    ',
        '█    '
      ],
      'Q': [
        ' ███ ',
        '█   █',
        '█   █',
        '█  ██',
        ' █████'
      ],
      'R': [
        '████ ',
        '█   █',
        '████ ',
        '█  █ ',
        '█   █'
      ],
      'S': [
        ' ███ ',
        '█    ',
        ' ███ ',
        '    █',
        '████ '
      ],
      'T': [
        '█████',
        '  █  ',
        '  █  ',
        '  █  ',
        '  █  '
      ],
      'U': [
        '█   █',
        '█   █',
        '█   █',
        '█   █',
        ' ███ '
      ],
      'V': [
        '█   █',
        '█   █',
        '█   █',
        ' █ █ ',
        '  █  '
      ],
      'W': [
        '█   █',
        '█   █',
        '█ █ █',
        '██ ██',
        '█   █'
      ],
      'X': [
        '█   █',
        ' █ █ ',
        '  █  ',
        ' █ █ ',
        '█   █'
      ],
      'Y': [
        '█   █',
        ' █ █ ',
        '  █  ',
        '  █  ',
        '  █  '
      ],
      'Z': [
        '█████',
        '   █ ',
        '  █  ',
        ' █   ',
        '█████'
      ],
      ' ': [
        '     ',
        '     ',
        '     ',
        '     ',
        '     '
      ],
      '0': [
        ' ███ ',
        '█   █',
        '█   █',
        '█   █',
        ' ███ '
      ],
      '1': [
        '  █  ',
        ' ██  ',
        '  █  ',
        '  █  ',
        '  █  '
      ],
      '2': [
        ' ███ ',
        '█   █',
        '   █ ',
        '  █  ',
        '█████'
      ],
      '3': [
        '████ ',
        '    █',
        ' ███ ',
        '    █',
        '████ '
      ],
      '4': [
        '█   █',
        '█   █',
        '█████',
        '    █',
        '    █'
      ],
      '5': [
        '█████',
        '█    ',
        '████ ',
        '    █',
        '████ '
      ],
      '6': [
        ' ███ ',
        '█    ',
        '████ ',
        '█   █',
        ' ███ '
      ],
      '7': [
        '█████',
        '    █',
        '   █ ',
        '  █  ',
        ' █   '
      ],
      '8': [
        ' ███ ',
        '█   █',
        ' ███ ',
        '█   █',
        ' ███ '
      ],
      '9': [
        ' ███ ',
        '█   █',
        ' ████',
        '    █',
        ' ███ '
      ]
    }
  }
]

export default function TextToAsciiArtGenerator() {
  const [inputText, setInputText] = useState('')
  const [selectedFont, setSelectedFont] = useState('Standard')
  const [asciiArt, setAsciiArt] = useState('')
  const [character, setCharacter] = useState('█')
  const [history, setHistory] = useState<string[]>([])
  const { toast } = useToast()

  const generateAsciiArt = () => {
    if (!inputText.trim()) return

    const font = fontStyles.find(f => f.name === selectedFont)
    if (!font) return

    const upperText = inputText.toUpperCase()
    const lines: string[] = Array(font.height).fill('')

    for (let charIndex = 0; charIndex < upperText.length; charIndex++) {
      const char = upperText[charIndex]
      const charData = font.chars[char] || font.chars[' ']

      if (charData) {
        for (let lineIndex = 0; lineIndex < font.height; lineIndex++) {
          lines[lineIndex] += charData[lineIndex] + ' '
        }
      }
    }

    const art = lines.join('\n')
    setAsciiArt(art)
    setHistory(prev => [art, ...prev.slice(0, 4)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "ASCII art has been copied to clipboard",
    })
  }

  const downloadAsciiArt = () => {
    if (!asciiArt) return

    const blob = new Blob([asciiArt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ascii-art-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInputText('')
    setAsciiArt('')
  }

  const loadExample = (example: string) => {
    setInputText(example)
  }

  const examples = [
    { name: 'Hello World', text: 'HELLO WORLD' },
    { name: 'ASCII', text: 'ASCII' },
    { name: '2024', text: '2024' },
    { name: 'Welcome', text: 'WELCOME' }
  ]

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-6 w-6" />
            Text to ASCII Art Generator
          </CardTitle>
          <CardDescription>
            Convert your text into ASCII art with different font styles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Enter Text:</Label>
                <Input
                  id="text-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.toUpperCase())}
                  placeholder="Enter your text..."
                  onKeyPress={(e) => e.key === 'Enter' && generateAsciiArt()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-style">Font Style:</Label>
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontStyles.map((font) => (
                      <SelectItem key={font.name} value={font.name}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="character">Character:</Label>
                <Input
                  id="character"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  placeholder="█"
                  maxLength={1}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={generateAsciiArt} disabled={!inputText.trim()}>
                Generate ASCII Art
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RotateCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              {asciiArt && (
                <>
                  <Button variant="outline" onClick={() => copyToClipboard(asciiArt)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={downloadAsciiArt}>
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Quick Examples */}
            <div className="space-y-2">
              <Label>Quick Examples:</Label>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample(example.text)}
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* ASCII Art Display */}
            {asciiArt && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated ASCII Art</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-black text-green-400 p-6 rounded-lg font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto">
                      {asciiArt}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Font: {selectedFont}</span>
                      <span>Character: "{character}"</span>
                      <span>Lines: {asciiArt.split('\n').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Generations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {history.map((art, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Generation {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(art)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-muted p-3 rounded font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto">
                          {art}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Font Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Fonts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fontStyles.map((font) => (
                    <div key={font.name} className="space-y-2">
                      <div className="font-medium">{font.name}</div>
                      <div className="bg-black text-green-400 p-3 rounded font-mono text-xs leading-relaxed whitespace-pre">
                        {(() => {
                          const sample = 'SAMPLE'
                          const lines: string[] = Array(font.height).fill('')
                          
                          for (let charIndex = 0; charIndex < sample.length; charIndex++) {
                            const char = sample[charIndex]
                            const charData = font.chars[char]
                            
                            if (charData) {
                              for (let lineIndex = 0; lineIndex < font.height; lineIndex++) {
                                lines[lineIndex] += charData[lineIndex] + ' '
                              }
                            }
                          }
                          
                          return lines.join('\n')
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enter your text in uppercase for best results</li>
                <li>• Choose from available font styles</li>
                <li>• Customize the character used for the art</li>
                <li>• Use quick examples for common phrases</li>
                <li>• Copy or download your ASCII art</li>
                <li>• View recent generations in the history section</li>
                <li>• ASCII art works best with monospace fonts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}