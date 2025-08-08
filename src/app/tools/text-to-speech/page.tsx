'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Download, Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const { toast } = useToast()

  const voices = [
    { id: 'default', name: 'Default Voice' },
    { id: 'male', name: 'Male Voice' },
    { id: 'female', name: 'Female Voice' },
    { id: 'child', name: 'Child Voice' },
  ]

  const speak = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      })
      return
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set voice
      const selectedVoice = voices.find(v => v.id === voice)
      if (selectedVoice) {
        utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes(selectedVoice.name)) || null
      }
      
      // Set parameters
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = isMuted ? 0 : volume
      
      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
      }
      
      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
      }
      
      utterance.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        })
        setIsPlaying(false)
        setIsPaused(false)
      }
      
      speechSynthesis.speak(utterance)
    } else {
      toast({
        title: "Error",
        description: "Speech synthesis is not supported in your browser",
        variant: "destructive",
      })
    }
  }

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (speechSynthesis.speaking && speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const downloadAudio = () => {
    toast({
      title: "Feature",
      description: "Audio download feature coming soon!",
      variant: "default",
    })
  }

  const clearText = () => {
    setText('')
    stop()
  }

  const insertSampleText = () => {
    setText("Hello! This is a text-to-speech demonstration. You can adjust the voice settings and parameters to customize the speech output. This tool is useful for creating audio content, accessibility features, and language learning applications.")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Text to Speech</h1>
          <p className="text-muted-foreground">Convert text to natural-sounding speech with customizable voice settings</p>
        </div>

        <div className="grid gap-6">
          {/* Text Input */}
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>Enter the text you want to convert to speech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={insertSampleText} variant="outline" size="sm">
                  Insert Sample Text
                </Button>
                <Button onClick={clearText} variant="outline" size="sm">
                  Clear Text
                </Button>
              </div>
              <Textarea
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="text-sm text-muted-foreground">
                Characters: {text.length} | Words: {text.trim() ? text.trim().split(/\s+/).length : 0}
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Customize the voice and speech parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voice">Voice</Label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voiceOption) => (
                        <SelectItem key={voiceOption.id} value={voiceOption.id}>
                          {voiceOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Speed: {rate.toFixed(1)}x</Label>
                  <Input
                    id="rate"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pitch">Pitch: {pitch.toFixed(1)}</Label>
                  <Input
                    id="pitch"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Volume: {Math.round(volume * 100)}%</Label>
                  <Input
                    id="volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mute</span>
                    <span>Normal</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Play, pause, or stop the speech</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={isPaused ? resume : speak}
                  disabled={!text.trim() || isPlaying && !isPaused}
                  size="sm"
                >
                  {isPaused ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPaused ? 'Resume' : 'Play'}
                </Button>
                
                <Button
                  onClick={pause}
                  disabled={!isPlaying || isPaused}
                  variant="outline"
                  size="sm"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                
                <Button
                  onClick={stop}
                  disabled={!isPlaying}
                  variant="outline"
                  size="sm"
                >
                  Stop
                </Button>
                
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="sm"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                
                <Button
                  onClick={downloadAudio}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>Best practices for text-to-speech conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use clear and properly formatted text for best results</li>
                <li>• Adjust the speed to make the speech more natural</li>
                <li>• Experiment with different voices for variety</li>
                <li>• Use punctuation to improve speech rhythm</li>
                <li>• This tool works best in modern browsers like Chrome, Firefox, and Safari</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}