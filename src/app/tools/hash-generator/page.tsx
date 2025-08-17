'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, Fingerprint, RotateCcw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hashType, setHashType] = useState('md5')
  
  const { trackUsage } = useToolAccess('hash-generator')

  const generateHash = async () => {
    if (!input.trim()) {
      setError('Please enter text to hash')
      return
    }

    try {
      // Track usage before generating hash
      await trackUsage()

      let hash = ''
      const encoder = new TextEncoder()
      const data = encoder.encode(input)

      switch (hashType) {
        case 'md5':
          hash = await generateMD5(data)
          break
        case 'sha1':
          hash = await generateSHA1(data)
          break
        case 'sha256':
          hash = await generateSHA256(data)
          break
        case 'sha512':
          hash = await generateSHA512(data)
          break
        default:
          throw new Error('Unsupported hash type')
      }

      setOutput(hash)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hash generation failed')
      setOutput('')
    }
  }

  const generateMD5 = async (data: Uint8Array): Promise<string> => {
    // Simple MD5 implementation for demonstration
    // In production, you'd use a proper crypto library
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateSHA1 = async (data: Uint8Array): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateSHA256 = async (data: Uint8Array): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateSHA512 = async (data: Uint8Array): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-512', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadResult = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${hashType}-hash.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const loadSample = () => {
    setInput('Hello, World!')
    setError(null)
  }

  return (
    <ToolLayout
      toolId="hash-generator"
      toolName="Hash Generator"
      toolDescription="Generate cryptographic hashes from text"
      toolCategory="Security Tools"
      toolIcon={<Fingerprint className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              Enter text to generate hash
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text to Hash</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to generate hash..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hash Type</label>
              <Select value={hashType} onValueChange={setHashType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="md5">MD5</SelectItem>
                  <SelectItem value="sha1">SHA-1</SelectItem>
                  <SelectItem value="sha256">SHA-256</SelectItem>
                  <SelectItem value="sha512">SHA-512</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              {hashType.toUpperCase()} hash result
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Hash Result</label>
                {output && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder={`${hashType.toUpperCase()} hash will appear here...`}
                rows={8}
                className="font-mono text-sm bg-muted/50 break-all"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateHash}
                disabled={!input.trim()}
                className="flex-1"
              >
                Generate {hashType.toUpperCase()} Hash
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">About Cryptographic Hashes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🔐 What are Hashes?</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• One-way cryptographic functions</li>
                <li>• Fixed-size output from variable input</li>
                <li>• Deterministic (same input = same output)</li>
                <li>• Small input change = completely different output</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🛡️ Security Notes</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• MD5/SHA-1 are considered weak for security</li>
                <li>• Use SHA-256 or SHA-512 for better security</li>
                <li>• Hashes are not encryption (cannot be reversed)</li>
                <li>• Use for password hashing, data integrity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}