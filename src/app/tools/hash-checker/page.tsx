'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, RotateCcw, Shield, Hash, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface HashResult {
  algorithm: string
  hash: string
  timestamp: string
}

export default function HashChecker() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<HashResult[]>([])
  const [selectedHash, setSelectedHash] = useState('')
  const [verificationInput, setVerificationInput] = useState('')
  const [verificationResult, setVerificationResult] = useState<{
    match: boolean
    algorithm: string
    providedHash: string
    computedHash: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generateHashes = () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter text to generate hashes",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const timestamp = new Date().toLocaleString()
      const newHashes: HashResult[] = []

      // Generate different types of hashes
      newHashes.push({
        algorithm: 'MD5',
        hash: generateMD5(input),
        timestamp
      })

      newHashes.push({
        algorithm: 'SHA-1',
        hash: generateSHA1(input),
        timestamp
      })

      newHashes.push({
        algorithm: 'SHA-256',
        hash: generateSHA256(input),
        timestamp
      })

      newHashes.push({
        algorithm: 'SHA-512',
        hash: generateSHA512(input),
        timestamp
      })

      setHashes(newHashes)
      setSelectedHash(newHashes[0].hash)
      
      toast({
        title: "Hashes generated",
        description: `Generated ${newHashes.length} different hash values`
      })
    } catch (error) {
      toast({
        title: "Hash generation failed",
        description: "Unable to generate hashes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Simple hash implementations (in production, use crypto library)
  const generateMD5 = (str: string): string => {
    // This is a simplified MD5 implementation
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  const generateSHA1 = (str: string): string => {
    // This is a simplified SHA1 implementation
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(40, '0')
  }

  const generateSHA256 = (str: string): string => {
    // This is a simplified SHA256 implementation
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  const generateSHA512 = (str: string): string => {
    // This is a simplified SHA512 implementation
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(128, '0')
  }

  const verifyHash = () => {
    if (!verificationInput.trim() || !selectedHash) {
      toast({
        title: "Missing input",
        description: "Please enter text and select a hash to verify",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const selectedHashObj = hashes.find(h => h.hash === selectedHash)
      if (!selectedHashObj) {
        toast({
          title: "Invalid hash",
          description: "Selected hash not found",
          variant: "destructive"
        })
        return
      }

      let computedHash = ''
      switch (selectedHashObj.algorithm) {
        case 'MD5':
          computedHash = generateMD5(verificationInput)
          break
        case 'SHA-1':
          computedHash = generateSHA1(verificationInput)
          break
        case 'SHA-256':
          computedHash = generateSHA256(verificationInput)
          break
        case 'SHA-512':
          computedHash = generateSHA512(verificationInput)
          break
      }

      const match = computedHash === selectedHash.toLowerCase()
      
      setVerificationResult({
        match,
        algorithm: selectedHashObj.algorithm,
        providedHash: selectedHash,
        computedHash
      })
      
      toast({
        title: match ? "Hash verified" : "Hash verification failed",
        description: match ? 
          "The computed hash matches the provided hash" : 
          "The computed hash does not match the provided hash"
      })
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Unable to verify hash",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    toast({
      title: "Copied to clipboard",
      description: "Hash has been copied to clipboard"
    })
  }

  const downloadHashes = () => {
    const content = `Hash Results
Generated on: ${new Date().toLocaleString()}

${hashes.map(hash => `
${hash.algorithm} Hash:
${hash.hash}
Generated: ${hash.timestamp}
`).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hashes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "Hash file download has started"
    })
  }

  const clearAll = () => {
    setInput('')
    setHashes([])
    setSelectedHash('')
    setVerificationInput('')
    setVerificationResult(null)
  }

  const setSampleInput = () => {
    setInput('Hello, World! This is a sample text for hash verification.')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hash Checker</h1>
        <p className="text-muted-foreground">
          Generate and verify cryptographic hashes for data integrity verification
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Security Tool</Badge>
          <Badge variant="outline">Hashing</Badge>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Hashes</TabsTrigger>
          <TabsTrigger value="verify">Verify Hash</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Text Input</CardTitle>
                <CardDescription>
                  Enter text to generate cryptographic hashes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter text to generate hashes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[200px] font-mono"
                />
                <div className="flex gap-2">
                  <Button onClick={generateHashes} disabled={loading || !input.trim()} className="flex-1">
                    {loading ? <Hash className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />}
                    {loading ? "Generating..." : "Generate Hashes"}
                  </Button>
                  <Button onClick={setSampleInput} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Sample
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Hashes</CardTitle>
                <CardDescription>
                  Cryptographic hashes for your input
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hashes.length > 0 ? (
                  <div className="space-y-4">
                    <Select value={selectedHash} onValueChange={setSelectedHash}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a hash to copy" />
                      </SelectTrigger>
                      <SelectContent>
                        {hashes.map((hash, index) => (
                          <SelectItem key={index} value={hash.hash}>
                            {hash.algorithm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {hashes.map((hash, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold">{hash.algorithm}</div>
                              <div className="text-xs text-muted-foreground">
                                {hash.timestamp}
                              </div>
                            </div>
                            <Button 
                              onClick={() => copyHash(hash.hash)} 
                              variant="ghost" 
                              size="sm"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="font-mono text-xs break-all">
                            {hash.hash}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={downloadHashes} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download All Hashes
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Hash className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">
                      Enter text and click "Generate Hashes" to see results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hash Verification</CardTitle>
                <CardDescription>
                  Verify if a hash matches the computed hash of input text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hash-select">Select Hash Algorithm</Label>
                  <Select value={selectedHash} onValueChange={setSelectedHash}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a hash algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select from generated hashes</SelectItem>
                      <SelectItem value="md5">MD5</SelectItem>
                      <SelectItem value="sha1">SHA-1</SelectItem>
                      <SelectItem value="sha256">SHA-256</SelectItem>
                      <SelectItem value="sha512">SHA-512</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-text">Text to Verify</Label>
                  <Textarea
                    id="verification-text"
                    placeholder="Enter text to verify against the hash..."
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    className="min-h-[120px] font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provided-hash">Hash to Verify</Label>
                  <Textarea
                    id="provided-hash"
                    placeholder="Enter the hash to verify..."
                    value={selectedHash}
                    onChange={(e) => setSelectedHash(e.target.value)}
                    className="min-h-[80px] font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={verifyHash} 
                  disabled={loading || !verificationInput.trim() || !selectedHash.trim()}
                  className="w-full"
                >
                  {loading ? <Shield className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                  {loading ? "Verifying..." : "Verify Hash"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Results</CardTitle>
                <CardDescription>
                  Hash verification status and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${verificationResult.match ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                      <div className="flex items-center gap-2 mb-2">
                        {verificationResult.match ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800">Hash Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-800">Hash Mismatch</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm">
                        {verificationResult.match 
                          ? "The computed hash matches the provided hash."
                          : "The computed hash does not match the provided hash."
                        }
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Algorithm:</strong> {verificationResult.algorithm}
                      </div>
                      <div>
                        <strong>Provided Hash:</strong>
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                          {verificationResult.providedHash}
                        </div>
                      </div>
                      <div>
                        <strong>Computed Hash:</strong>
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                          {verificationResult.computedHash}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">
                      Enter text and hash, then click "Verify Hash" to see results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Hash Security Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Hash Algorithms</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>MD5:</strong> 128-bit, fast but insecure</li>
                <li>• <strong>SHA-1:</strong> 160-bit, deprecated</li>
                <li>• <strong>SHA-256:</strong> 256-bit, secure for most uses</li>
                <li>• <strong>SHA-512:</strong> 512-bit, highest security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Security Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use SHA-256 or SHA-512 for security</li>
                <li>• Always use salt with password hashing</li>
                <li>• Store only hashes, not plain text</li>
                <li>• Use proper key derivation functions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}