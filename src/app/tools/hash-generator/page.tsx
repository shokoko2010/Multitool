'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Copy, Hash } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function HashGenerator() {
  const [inputText, setInputText] = useState('')
  const [hashType, setHashType] = useState('md5')
  const [hashResult, setHashResult] = useState('')

  const hashFunctions = {
    md5: async (text: string) => {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('MD5', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    },
    sha1: async (text: string) => {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-1', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    },
    sha256: async (text: string) => {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    },
    sha384: async (text: string) => {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-384', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    },
    sha512: async (text: string) => {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-512', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
  }

  const generateHash = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to hash",
        variant: "destructive"
      })
      return
    }

    try {
      const hash = await hashFunctions[hashType as keyof typeof hashFunctions](inputText)
      setHashResult(hash)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate hash",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashResult)
    toast({
      title: "Copied!",
      description: "Hash copied to clipboard"
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hash Generator</h1>
        <p className="text-muted-foreground">Generate various hash types from your text input</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Input
            </CardTitle>
            <CardDescription>Enter the text you want to hash</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hash-type">Hash Type</Label>
              <Select value={hashType} onValueChange={setHashType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="md5">MD5</SelectItem>
                  <SelectItem value="sha1">SHA-1</SelectItem>
                  <SelectItem value="sha256">SHA-256</SelectItem>
                  <SelectItem value="sha384">SHA-384</SelectItem>
                  <SelectItem value="sha512">SHA-512</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="input-text">Text to Hash</Label>
              <Textarea
                id="input-text"
                placeholder="Enter text to hash..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <Button onClick={generateHash} className="w-full">
              Generate Hash
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Result
            </CardTitle>
            <CardDescription>Generated hash result</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hash-result">{hashType.toUpperCase()} Hash</Label>
              <div className="relative">
                <Textarea
                  id="hash-result"
                  value={hashResult}
                  readOnly
                  className="min-h-[150px] font-mono text-sm"
                  placeholder="Hash result will appear here..."
                />
                {hashResult && (
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
            </div>
            {hashResult && (
              <div className="text-sm text-muted-foreground">
                <p>Hash Type: {hashType.toUpperCase()}</p>
                <p>Input Length: {inputText.length} characters</p>
                <p>Hash Length: {hashResult.length} characters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}