'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Mic, MicOff, Square, Play, Pause, Download, RotateCcw, Volume2, Square as StopIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Recording {
  id: string
  name: string
  blob: Blob
  url: string
  duration: number
  size: number
  timestamp: Date
}

export default function AudioRecorder() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null)
  const [volume, setVolume] = useState([50])
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      setAudioStream(stream)
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(audioCtx)
      
      const options = { mimeType: 'audio/webm;codecs=opus' }
      const recorder = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        const duration = recordingTime
        
        const newRecording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${new Date().toLocaleTimeString()}`,
          blob: audioBlob,
          url: audioUrl,
          duration,
          size: audioBlob.size,
          timestamp: new Date()
        }
        
        setRecordings(prev => [newRecording, ...prev])
        setSelectedRecording(audioUrl)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        setAudioStream(null)
        
        toast({
          title: `Recording saved successfully (${formatDuration(duration)})`
        })
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast({
          title: "Recording started: Click the pause button to pause recording"
        })
        
      } catch (error) {
        toast({
          title: "Recording failed: Unable to access microphone. Please check permissions."
        })
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      toast({
          title: "Recording paused",
          description: "Click resume to continue recording"
        })
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Restart timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast({
          title: "Recording resumed",
          description: "Recording continues..."
        })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playRecording = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play()
    }
    setSelectedRecording(url)
  }

  const downloadRecording = (recording: Recording) => {
    const a = document.createElement('a')
    a.href = recording.url
    a.download = `${recording.name}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    toast({
          title: "Audio file download has started"
        })
  }

  const deleteRecording = (id: string, url: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id))
    URL.revokeObjectURL(url)
    if (selectedRecording === url) {
      setSelectedRecording(null)
    }
    
    toast({
          title: "Recording has been removed"
        })
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Cleanup on unmount
  useState(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
    }
  })

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Recorder</h1>
        <p className="text-muted-foreground">
          Record audio directly from your microphone with professional quality settings
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Audio Tool</Badge>
          <Badge variant="outline">Recording</Badge>
        </div>
      </div>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">Record Audio</TabsTrigger>
          <TabsTrigger value="recordings">My Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recording Controls</CardTitle>
                <CardDescription>
                  Start recording audio from your microphone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Status */}
                <div className="text-center space-y-4">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                  }`}>
                    {isRecording ? (
                      <MicOff className="w-12 h-12 text-red-600" />
                    ) : (
                      <Mic className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-mono">
                      {formatDuration(recordingTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to record'}
                    </div>
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="space-y-4">
                  {!isRecording ? (
                    <Button onClick={startRecording} className="w-full" size="lg">
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {!isPaused ? (
                        <Button onClick={pauseRecording} variant="outline" size="sm">
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button onClick={resumeRecording} variant="outline" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button onClick={stopRecording} variant="destructive" size="sm">
                        <Square className="w-4 h-4" />
                      </Button>
                      <Button onClick={stopRecording} variant="outline" size="sm">
                        <StopIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <Label htmlFor="volume">Input Volume: {volume[0]}%</Label>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adjust microphone input sensitivity
                  </p>
                </div>

                {/* Recording Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-800">Recording Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use a quiet environment for best quality</li>
                    <li>• Keep microphone 6-12 inches from source</li>
                    <li>• Speak clearly and at consistent volume</li>
                    <li>• Use headphones to avoid echo</li>
                    <li>• Pause if you need to take a break</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recording Features</CardTitle>
                <CardDescription>
                  Professional audio recording capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-800">High Quality</h4>
                    <p className="text-sm text-green-700">
                      Records in 44.1kHz sample rate with noise suppression and echo cancellation 
                      for professional audio quality.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-purple-800">Easy Controls</h4>
                    <p className="text-sm text-purple-700">
                      Simple pause/resume functionality with real-time recording timer and 
                      visual status indicators.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-orange-800">Auto Save</h4>
                    <p className="text-sm text-orange-700">
                      Recordings are automatically saved to your browser and can be downloaded 
                      as WebM files for easy sharing.
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-red-800">Privacy First</h4>
                    <p className="text-sm text-red-700">
                      All recordings stay in your browser. No audio is uploaded to any servers 
                      or external services.
                    </p>
                  </div>
                </div>

                {/* Audio preview (hidden) */}
                <audio ref={audioRef} className="hidden" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Recordings</CardTitle>
              <CardDescription>
                Manage and download your recorded audio files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordings.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {recordings.length} recording{recordings.length !== 1 ? 's' : ''} saved
                    </span>
                    <Button 
                      onClick={() => {
                        recordings.forEach(rec => URL.revokeObjectURL(rec.url))
                        setRecordings([])
                        setSelectedRecording(null)
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recordings.map((recording) => (
                      <div 
                        key={recording.id} 
                        className={`p-4 border rounded-lg ${
                          selectedRecording === recording.url ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Volume2 className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                              <div className="font-medium">{recording.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDuration(recording.duration)} • {formatFileSize(recording.size)} • 
                                {recording.timestamp.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              onClick={() => playRecording(recording.url)} 
                              variant="ghost" 
                              size="sm"
                            >
                              {selectedRecording === recording.url ? 
                                <Pause className="w-4 h-4" /> : 
                                <Play className="w-4 h-4" />
                              }
                            </Button>
                            <Button 
                              onClick={() => downloadRecording(recording)} 
                              variant="ghost" 
                              size="sm"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => deleteRecording(recording.id, recording.url)} 
                              variant="ghost" 
                              size="sm"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {selectedRecording === recording.url && (
                          <div className="mt-3">
                            <audio 
                              src={recording.url} 
                              controls 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recordings yet</h3>
                  <p className="text-muted-foreground">
                    Start recording to see your audio files appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function that doesn't use hooks
const Stop = () => <Square className="w-4 h-4" />