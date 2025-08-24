'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Download,
  Settings,
  Mic,
  Languages,
  Clock,
  FileText
} from 'lucide-react'

interface VoiceOption {
  name: string
  language: string
  gender: 'male' | 'female'
  accent?: string
  rate: number
  pitch: number
}

interface SpeechSettings {
  voice: string
  rate: number
  pitch: number
  volume: number
  language: string
}

interface AudioHistory {
  id: string
  text: string
  voice: string
  duration: number
  timestamp: Date
  audioUrl?: string
}

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [settings, setSettings] = useState<SpeechSettings>({
    voice: '',
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'en-US'
  })
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([])
  const [audioHistory, setAudioHistory] = useState<AudioHistory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeTab, setActiveTab] = useState('converter')
  
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
      loadVoices()
      
      // Handle voice loading
      synthRef.current.onvoiceschanged = loadVoices
    }
  }, [])

  const loadVoices = () => {
    if (!synthRef.current) return

    const voices = synthRef.current.getVoices()
    const voiceOptions: VoiceOption[] = voices.map(voice => ({
      name: voice.name,
      language: voice.lang,
      gender: voice.name.includes('Female') || voice.name.includes('woman') ? 'female' : 'male',
      rate: 1,
      pitch: 1
    }))

    setAvailableVoices(voiceOptions)
    
    // Set default voice
    if (voiceOptions.length > 0 && !settings.voice) {
      const defaultVoice = voiceOptions.find(v => v.language.startsWith('en')) || voiceOptions[0]
      setSettings(prev => ({ ...prev, voice: defaultVoice.name, language: defaultVoice.language }))
    }
  }

  const speakText = () => {
    if (!text.trim()) {
      setError('Please enter text to speak')
      return
    }

    if (!synthRef.current) {
      setError('Speech synthesis not supported in this browser')
      return
    }

    try {
      // Stop any current speech
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Apply settings
      utterance.rate = settings.rate
      utterance.pitch = settings.pitch
      utterance.volume = settings.volume

      // Find and set voice
      const voice = availableVoices.find(v => v.name === settings.voice)
      if (voice) {
        const synthVoice = synthRef.current.getVoices().find(v => v.name === voice.name)
        if (synthVoice) {
          utterance.voice = synthVoice
        }
      }

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
        setProgress(0)
        setError(null)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setProgress(100)
        addToHistory(text, settings.voice)
      }

      utterance.onerror = (event) => {
        setError(`Speech synthesis error: ${event.error}`)
        setIsPlaying(false)
        setIsPaused(false)
      }

      // Simulate progress (since Web Speech API doesn't provide progress)
      const startTime = Date.now()
      const estimatedDuration = text.length * 50 // Rough estimate
      setDuration(estimatedDuration)

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100)
        setProgress(newProgress)

        if (newProgress >= 100) {
          clearInterval(progressInterval)
        }
      }, 100)

      synthRef.current.speak(utterance)
    } catch (error) {
      setError('Failed to speak text. Please try again.')
    }
  }

  const pauseSpeech = () => {
    if (synthRef.current && isPlaying) {
      if (isPaused) {
        synthRef.current.resume()
        setIsPaused(false)
      } else {
        synthRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(0)
    }
  }

  const downloadAudio = () => {
    if (!text.trim()) {
      setError('Please enter text to convert')
      return
    }

    // In a real implementation, this would use a text-to-speech API
    // For demo purposes, we'll create a placeholder
    const audioBlob = new Blob([''], { type: 'audio/wav' })
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `speech_${new Date().toISOString().split('T')[0]}.wav`
    a.click()
    URL.revokeObjectURL(url)
  }

  const addToHistory = (text: string, voice: string) => {
    const newHistory: AudioHistory = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      voice,
      duration: Math.round(text.length * 50 / 1000),
      timestamp: new Date()
    }

    setAudioHistory(prev => [newHistory, ...prev.slice(0, 9)])
  }

  const updateSetting = (key: keyof SpeechSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const getVoiceByLanguage = (language: string) => {
    return availableVoices.filter(voice => voice.language.startsWith(language))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const popularLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ]

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-6 w-6" />
            Text to Speech
          </CardTitle>
          <CardDescription>
            Convert text to natural-sounding speech with multiple voice options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="converter">Converter</TabsTrigger>
              <TabsTrigger value="voices">Voices</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="converter" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text">Text to Convert</Label>
                    <Textarea
                      id="text"
                      placeholder="Enter text here to convert to speech..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{text.length} characters</span>
                      <span>~{Math.round(text.length * 50 / 1000)}s</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Progress</Label>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{isPlaying ? (isPaused ? 'Paused' : 'Playing...') : 'Ready'}</span>
                      <span>{formatDuration(Math.round(duration * progress / 100))} / {formatDuration(duration)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={speakText} 
                      disabled={isPlaying && !isPaused || !text.trim()}
                      className="flex-1"
                    >
                      {isPlaying && !isPaused ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          {isPaused ? 'Resume' : 'Speak'}
                        </>
                      )}
                    </Button>
                    
                    {isPlaying && (
                      <Button variant="outline" onClick={pauseSpeech}>
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                    )}
                    
                    {isPlaying && (
                      <Button variant="outline" onClick={stopSpeech}>
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button variant="outline" onClick={downloadAudio} disabled={!text.trim()}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setText('Hello, this is a sample text to demonstrate the text to speech functionality.')}
                        disabled={isPlaying}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Sample Text
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setText('The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.')}
                        disabled={isPlaying}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Pangram
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Voice</Label>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{settings.voice || 'Default'}</div>
                            <div className="text-sm text-muted-foreground">
                              {settings.language} • Rate: {settings.rate}x • Pitch: {settings.pitch}
                            </div>
                          </div>
                          <Volume2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label>Popular Languages</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {popularLanguages.slice(0, 6).map(lang => (
                        <Button
                          key={lang.code}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const voices = getVoiceByLanguage(lang.code)
                            if (voices.length > 0) {
                              updateSetting('voice', voices[0].name)
                              updateSetting('language', voices[0].language)
                            }
                          }}
                          disabled={isPlaying}
                        >
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tips</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Use punctuation for natural pauses</p>
                      <p>• Numbers are spoken individually by default</p>
                      <p>• Adjust rate and pitch for different effects</p>
                      <p>• Try different voices for various content types</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voices" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Voices</h3>
                {availableVoices.length === 0 ? (
                  <div className="text-center py-8">
                    <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading voices...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableVoices.map((voice, index) => (
                      <Card 
                        key={index} 
                        className={`cursor-pointer transition-all ${
                          settings.voice === voice.name ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                        }`}
                        onClick={() => {
                          updateSetting('voice', voice.name)
                          updateSetting('language', voice.language)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{voice.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {voice.gender}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {voice.language}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              setText('This is a sample of the ' + voice.name + ' voice.')
                              updateSetting('voice', voice.name)
                              updateSetting('language', voice.language)
                            }}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Test
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Speech History</h3>
                {audioHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No speech history yet</p>
                    <p className="text-sm text-muted-foreground">Your converted text will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {audioHistory.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-medium mb-1">{item.text}</div>
                              <div className="text-sm text-muted-foreground">
                                Voice: {item.voice} • Duration: {formatDuration(item.duration)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.timestamp.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setText(item.text)
                                  setActiveTab('converter')
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voiceSelect">Voice</Label>
                    <select
                      id="voiceSelect"
                      value={settings.voice}
                      onChange={(e) => updateSetting('voice', e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      {availableVoices.map((voice, index) => (
                        <option key={index} value={voice.name}>
                          {voice.name} ({voice.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Speech Rate: {settings.rate}x</Label>
                    <input
                      id="rate"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.rate}
                      onChange={(e) => updateSetting('rate', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>2x</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pitch">Pitch: {settings.pitch}</Label>
                    <input
                      id="pitch"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.pitch}
                      onChange={(e) => updateSetting('pitch', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Normal</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume: {Math.round(settings.volume * 100)}%</Label>
                    <input
                      id="volume"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      {Array.from(new Set(availableVoices.map(v => v.language))).map(lang => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Test Settings</Label>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setText('Testing current voice settings with this sample text.')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Current Settings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}