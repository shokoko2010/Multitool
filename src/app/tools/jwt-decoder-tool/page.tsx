'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Shield, Key } from 'lucide-react'

interface JWTPayload {
  [key: string]: any
}

interface JWTDecoded {
  header: JWTPayload
  payload: JWTPayload
  signature: string
}

export default function JWTDecoderTool() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<JWTDecoded | null>(null)
  const [error, setError] = useState('')

  const decodeJWT = useCallback(() => {
    if (!input.trim()) {
      setDecoded(null)
      setError('')
      return
    }

    try {
      const parts = input.split('.')
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts.')
      }

      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))
      const signature = parts[2]

      setDecoded({
        header,
        payload,
        signature
      })
      setError('')
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Invalid JWT'}`)
      setDecoded(null)
    }
  }, [input])

  const handleCopy = async (content: any) => {
    await navigator.clipboard.writeText(JSON.stringify(content, null, 2))
  }

  const handleDownload = () => {
    if (decoded) {
      const content = JSON.stringify(decoded, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'jwt-decoded.json'
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
    setDecoded(null)
    setError('')
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const isExpired = (exp: number) => {
    return Date.now() / 1000 > exp
  }

  const renderJSON = (obj: any, title: string) => (
    <div className="space-y-2">
      <h4 className="font-medium">{title}</h4>
      <div className="bg-muted p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(obj, null, 2)}
        </pre>
      </div>
      <Button variant="outline" size="sm" onClick={() => handleCopy(obj)}>
        <Copy className="h-4 w-4 mr-2" />
        Copy {title}
      </Button>
    </div>
  )

  const getExamples = () => {
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            JWT Decoder
          </CardTitle>
          <CardDescription>
            Decode JSON Web Tokens (JWT) to view header, payload, and signature information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">JWT Token</label>
              <Textarea
                placeholder="Paste your JWT token here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                className="font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={decodeJWT} disabled={!input.trim()}>
                <Key className="h-4 w-4 mr-2" />
                Decode JWT
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

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {decoded && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Decoded JWT</h3>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                </div>

                <Tabs defaultValue="payload" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="header">Header</TabsTrigger>
                    <TabsTrigger value="payload">Payload</TabsTrigger>
                    <TabsTrigger value="signature">Signature</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="header" className="space-y-4">
                    {renderJSON(decoded.header, 'Header')}
                  </TabsContent>
                  
                  <TabsContent value="payload" className="space-y-4">
                    {renderJSON(decoded.payload, 'Payload')}
                    
                    {/* Additional payload information */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Token Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {decoded.payload.iat && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium">Issued At</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTimestamp(decoded.payload.iat)}
                            </div>
                          </div>
                        )}
                        {decoded.payload.exp && (
                          <div className={`p-3 rounded-lg ${isExpired(decoded.payload.exp) ? 'bg-destructive/10' : 'bg-muted'}`}>
                            <div className="text-sm font-medium">Expiration</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTimestamp(decoded.payload.exp)}
                            </div>
                            {isExpired(decoded.payload.exp) && (
                              <div className="text-sm text-destructive mt-1">
                                Token has expired
                              </div>
                            )}
                          </div>
                        )}
                        {decoded.payload.nbf && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium">Not Before</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTimestamp(decoded.payload.nbf)}
                            </div>
                          </div>
                        )}
                        {decoded.payload.iss && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium">Issuer</div>
                            <div className="text-sm text-muted-foreground break-all">
                              {decoded.payload.iss}
                            </div>
                          </div>
                        )}
                        {decoded.payload.aud && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium">Audience</div>
                            <div className="text-sm text-muted-foreground break-all">
                              {Array.isArray(decoded.payload.aud) 
                                ? decoded.payload.aud.join(', ') 
                                : decoded.payload.aud
                              }
                            </div>
                          </div>
                        )}
                        {decoded.payload.sub && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium">Subject</div>
                            <div className="text-sm text-muted-foreground break-all">
                              {decoded.payload.sub}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="signature" className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Signature</h4>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
                        {decoded.signature}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(decoded.signature)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Signature
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About JWT</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="example">Example</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What is JWT?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact 
                    and self-contained way for securely transmitting information between parties 
                    as a JSON object.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JWTs are commonly used for authentication and information exchange in web 
                    applications. They consist of three parts separated by dots: header, payload, 
                    and signature.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="structure" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">JWT Structure</h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      <strong>Header:</strong> Contains metadata about the token, such as the 
                      algorithm used for signing and the token type.
                    </div>
                    <div>
                      <strong>Payload:</strong> Contains the claims, which are statements about 
                      an entity and additional data. Common claims include iss (issuer), sub 
                      (subject), aud (audience), exp (expiration time), and iat (issued at).
                    </div>
                    <div>
                      <strong>Signature:</strong> Used to verify that the sender of the JWT is 
                      who it says it is and to ensure that the message wasn't changed along the way.
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="example" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Example JWT</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Try decoding this example JWT:</p>
                      <div className="bg-background p-3 rounded font-mono text-xs break-all">
                        {getExamples()}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setInput(getExamples())}
                    >
                      Load Example
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Security Notice</h4>
            <p className="text-sm text-muted-foreground">
              This tool only decodes the JWT payload. It does not verify the signature. 
              Always verify JWT signatures on the server-side to ensure the token hasn't 
              been tampered with. Never store sensitive information in JWT payloads.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}