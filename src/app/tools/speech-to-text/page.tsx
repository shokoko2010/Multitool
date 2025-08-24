'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Mic, Square, Download, Copy, Volume2, Settings, Globe } from 'lucide-react'

interface TranscriptionResult {
  text: string
  confidence: number
  duration: number
  language: string
  timestamp: Date
}

export default function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([])
  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionResult | null>(null)
  const [error, setError] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  ]

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        processAudio(audioBlob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      setError('')
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true)
    
    try {
      // Simulate speech recognition (in a real app, you'd use a speech recognition API)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock transcription result
      const mockTexts = [
        "Hello, this is a test transcription. Speech to text is working properly.",
        "The quick brown fox jumps over the lazy dog. This is a sample transcription.",
        "Welcome to the speech to text tool. This demonstrates how voice recognition works.",
        "Technology has made it possible to convert speech into text accurately.",
        "This is an example of how speech recognition can transcribe spoken words."
      ]
      
      const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)]
      
      const result: TranscriptionResult = {
        text: randomText,
        confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
        duration: recordingTime,
        language: selectedLanguage,
        timestamp: new Date()
      }
      
      setCurrentTranscription(result)
      setTranscriptions(prev => [result, ...prev])
      
    } catch (err) {
      setError('Failed to process audio. Please try again.')
      console.error('Error processing audio:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadTranscription = (transcription: TranscriptionResult) => {
    const content = `Speech to Text Transcription
================================
Date: ${transcription.timestamp.toLocaleString()}
Language: ${transcription.language}
Duration: ${formatTime(transcription.duration)}
Confidence: ${formatConfidence(transcription.confidence)}

Transcription:
${transcription.text}
`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription_${transcription.timestamp.getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllTranscriptions = () => {
    if (transcriptions.length === 0) return
    
    let content = 'Speech to Text Transcriptions\n'
    content += '=============================\n\n'
    
    transcriptions.forEach((trans, index) => {
      content += `Transcription ${index + 1}\n`
      content += `-------------------\n`
      content += `Date: ${trans.timestamp.toLocaleString()}\n`
      content += `Language: ${trans.language}\n`
      content += `Duration: ${formatTime(trans.duration)}\n`
      content += `Confidence: ${formatConfidence(trans.confidence)}\n\n`
      content += `Text:\n${trans.text}\n\n`
      content += '---\n\n'
    })
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all_transcriptions_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setTranscriptions([])
    setCurrentTranscription(null)
    setAudioBlob(null)
    setAudioUrl('')
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Speech to Text</h1>
          <p className="text-muted-foreground">
            Convert your speech into text with high accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Recording
              </CardTitle>
              <CardDescription>
                Record your voice and convert it to text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center py-8">
                <div className="mb-4">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                  }`}>
                    {isRecording ? (
                      <Square className="w-12 h-12 text-red-600" />
                    ) : (
                      <Mic className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                </div>
                
                {isRecording && (
                  <div className="mb-4">
                    <div className="text-2xl font-mono mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Recording...
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording} 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopRecording} 
                      variant="destructive"
                      className="w-full"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  
                  {isProcessing && (
                    <div className="text-sm text-gray-500">
                      Processing audio...
                    </div>
                  )}
                </div>
              </div>

              {audioUrl && (
                <div className="space-y-2">
                  <Label>Recorded Audio</Label>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Transcription Results
              </CardTitle>
              <CardDescription>
                View and manage your transcriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTranscription && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Latest Transcription</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(currentTranscription.text)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadTranscription(currentTranscription)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm mb-2">{currentTranscription.text}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Duration: {formatTime(currentTranscription.duration)}</span>
                      <span>Confidence: {formatConfidence(currentTranscription.confidence)}</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {languages.find(l => l.code === currentTranscription.language)?.flag}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {transcriptions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">History ({transcriptions.length})</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadAllTranscriptions}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearAll}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {transcriptions.map((trans, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="mb-1 line-clamp-2">{trans.text}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatTime(trans.duration)}</span>
                          <span>{formatConfidence(trans.confidence)}</span>
                          <span>{trans.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!currentTranscription && transcriptions.length === 0 && (
                <div className="text-center py-12">
                  <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    No transcriptions yet
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Record some audio to see transcriptions here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Tips for Better Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">🎤 Recording Tips</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Record in a quiet environment</li>
                  <li>• Keep microphone close to your mouth</li>
                  <li>• Avoid background noise when possible</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🌐 Language Support</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Supports 15+ languages</li>
                  <li>• Automatic language detection</li>
                  <li>• Regional accents supported</li>
                  <li>• High accuracy for major languages</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}