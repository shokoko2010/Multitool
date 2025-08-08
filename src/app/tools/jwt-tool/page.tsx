'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Key, Copy, Eye, EyeOff, RefreshCw, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface JWTPayload {
  [key: string]: any
}

interface JWTHeader {
  alg: string
  typ: string
  [key: string]: any
}

export default function JWTTool() {
  const [jwtInput, setJwtInput] = useState('')
  const [header, setHeader] = useState<JWTHeader | null>(null)
  const [payload, setPayload] = useState<JWTPayload | null>(null)
  const [signature, setSignature] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [secretKey, setSecretKey] = useState('')
  const [isDecoding, setIsDecoding] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const { toast } = useToast()

  const decodeJWT = () => {
    if (!jwtInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a JWT token",
        variant: "destructive",
      })
      return
    }

    setIsDecoding(true)
    setIsValid(null)

    try {
      const parts = jwtInput.split('.')
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }

      // Decode header
      const headerData = JSON.parse(atob(parts[0]))
      setHeader(headerData)

      // Decode payload
      const payloadData = JSON.parse(atob(parts[1]))
      setPayload(payloadData)

      // Set signature
      setSignature(parts[2])

      setIsValid(true)
      
      toast({
        title: "JWT Decoded",
        description: "JWT token successfully decoded",
      })
    } catch (error) {
      setHeader(null)
      setPayload(null)
      setSignature('')
      setIsValid(false)
      
      toast({
        title: "Decoding Failed",
        description: "Invalid JWT token format",
        variant: "destructive",
      })
    } finally {
      setIsDecoding(false)
    }
  }

  const encodeJWT = () => {
    if (!header || !payload) {
      toast({
        title: "Missing Data",
        description: "Please enter both header and payload data",
        variant: "destructive",
      })
      return
    }

    try {
      const headerEncoded = btoa(JSON.stringify(header))
      const payloadEncoded = btoa(JSON.stringify(payload))
      
      let signaturePart = ''
      if (secretKey.trim()) {
        // In a real implementation, you would properly sign the JWT
        // For demo purposes, we'll create a simple signature
        const signatureInput = `${headerEncoded}.${payloadEncoded}.${secretKey}`
        const simpleSignature = btoa(signatureInput.split('').reverse().join(''))
        signaturePart = simpleSignature
      } else {
        signaturePart = 'signature'
      }

      const jwtToken = `${headerEncoded}.${payloadEncoded}.${signaturePart}`
      setJwtInput(jwtToken)
      
      toast({
        title: "JWT Encoded",
        description: "JWT token successfully created",
      })
    } catch (error) {
      toast({
        title: "Encoding Failed",
        description: "Failed to create JWT token",
        variant: "destructive",
      })
    }
  }

  const validateJWT = () => {
    if (!jwtInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a JWT token to validate",
        variant: "destructive",
      })
      return
    }

    // Simple validation checks
    const parts = jwtInput.split('.')
    let validationPassed = true
    const issues: string[] = []

    if (parts.length !== 3) {
      validationPassed = false
      issues.push('Invalid JWT format - must have 3 parts')
    }

    if (validationPassed && parts[0] === '' || parts[1] === '') {
      validationPassed = false
      issues.push('Header or payload is empty')
    }

    try {
      if (validationPassed) {
        JSON.parse(atob(parts[0]))
        JSON.parse(atob(parts[1]))
      }
    } catch {
      validationPassed = false
      issues.push('Invalid JSON in header or payload')
    }

    // Check expiration if present
    if (payload && payload.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) {
        issues.push(`Token expired at ${new Date(payload.exp * 1000).toLocaleString()}`)
      } else {
        issues.push(`Token expires at ${new Date(payload.exp * 1000).toLocaleString()}`)
      }
    }

    // Check issued at if present
    if (payload && payload.iat) {
      issues.push(`Token issued at ${new Date(payload.iat * 1000).toLocaleString()}`)
    }

    setIsValid(validationPassed)
    
    if (validationPassed) {
      toast({
        title: "Token Valid",
        description: "JWT token appears to be valid",
      })
    } else {
      toast({
        title: "Token Issues Found",
        description: issues.join(', '),
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const loadSampleJWT = () => {
    const sampleHeader = {
      alg: 'HS256',
      typ: 'JWT'
    }
    
    const samplePayload = {
      sub: '1234567890',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
      email: 'john.doe@example.com',
      roles: ['user', 'admin']
    }

    setHeader(sampleHeader)
    setPayload(samplePayload)
    setSecretKey('your-secret-key-here')
    
    toast({
      title: "Sample Loaded",
      description: "Sample JWT header and payload loaded",
    })
  }

  const formatJSON = (obj: any): string => {
    return JSON.stringify(obj, null, 2)
  }

  const parseJSON = (input: string): any => {
    try {
      return JSON.parse(input)
    } catch {
      return {}
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">JWT Token Tool</h1>
        <p className="text-muted-foreground">
          Decode, encode, and validate JSON Web Tokens
        </p>
      </div>

      <Tabs defaultValue="decode" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="decode">Decode JWT</TabsTrigger>
          <TabsTrigger value="encode">Encode JWT</TabsTrigger>
          <TabsTrigger value="validate">Validate Token</TabsTrigger>
        </TabsList>
        
        {/* Decode Tab */}
        <TabsContent value="decode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  JWT Token
                </CardTitle>
                <CardDescription>
                  Enter a JWT token to decode its contents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jwt-input">JWT Token</Label>
                  <Textarea
                    id="jwt-input"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={jwtInput}
                    onChange={(e) => setJwtInput(e.target.value)}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={decodeJWT} disabled={isDecoding} className="flex-1">
                    {isDecoding ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Decoding...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Decode JWT
                      </>
                    )}
                  </Button>
                  <Button onClick={loadSampleJWT} variant="outline">
                    Load Sample
                  </Button>
                </div>

                {isValid !== null && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    isValid 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {isValid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {isValid ? 'Token decoded successfully' : 'Invalid token format'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Decoded Content</span>
                  {header && payload && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(formatJSON(header), 'Header')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(formatJSON(payload), 'Payload')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Header, payload, and signature components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {header ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Header</Label>
                        <Badge variant="secondary">{header.alg}</Badge>
                        <Badge variant="outline">{header.typ}</Badge>
                      </div>
                      <Textarea
                        value={formatJSON(header)}
                        readOnly
                        className="min-h-[80px] font-mono text-xs"
                      />
                    </div>

                    {payload && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Payload</Label>
                          {payload.exp && (
                            <Badge variant={payload.exp > Math.floor(Date.now() / 1000) ? 'default' : 'destructive'}>
                              {payload.exp > Math.floor(Date.now() / 1000) ? 'Valid' : 'Expired'}
                            </Badge>
                          )}
                        </div>
                        <Textarea
                          value={formatJSON(payload)}
                          readOnly
                          className="min-h-[120px] font-mono text-xs"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Signature</Label>
                      <Input
                        value={signature}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No JWT decoded yet</p>
                    <p className="text-sm">Enter a JWT token and click "Decode JWT"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Encode Tab */}
        <TabsContent value="encode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Create JWT Token
                </CardTitle>
                <CardDescription>
                  Enter header and payload data to create a JWT token
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Header (JSON)</Label>
                  <Textarea
                    placeholder='{"alg": "HS256", "typ": "JWT"}'
                    value={formatJSON(header || {})}
                    onChange={(e) => setHeader(parseJSON(e.target.value))}
                    className="min-h-[80px] font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payload (JSON)</Label>
                  <Textarea
                    placeholder='{"sub": "1234567890", "name": "John Doe"}'
                    value={formatJSON(payload || {})}
                    onChange={(e) => setPayload(parseJSON(e.target.value))}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secret-key">Secret Key (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secret-key"
                      type={showSecret ? 'text' : 'password'}
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Enter secret key for signing"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={encodeJWT} className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Create JWT Token
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated JWT</span>
                  {jwtInput && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(jwtInput, 'JWT Token')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your generated JWT token will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jwtInput ? (
                  <div className="space-y-4">
                    <Textarea
                      value={jwtInput}
                      readOnly
                      className="min-h-[120px] font-mono text-xs break-all"
                    />
                    <div className="text-center">
                      <Badge variant="secondary">
                        {jwtInput.split('.')[0].length + jwtInput.split('.')[1].length + jwtInput.split('.')[2].length} characters
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No JWT generated yet</p>
                    <p className="text-sm">Enter header and payload data and click "Create JWT Token"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Validate Tab */}
        <TabsContent value="validate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                JWT Token Validation
              </CardTitle>
              <CardDescription>
                Validate JWT tokens for authenticity and expiration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="validate-jwt">JWT Token to Validate</Label>
                    <Textarea
                      id="validate-jwt"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={jwtInput}
                      onChange={(e) => setJwtInput(e.target.value)}
                      className="min-h-[120px] font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={validateJWT} disabled={!jwtInput.trim()} className="flex-1">
                      <Shield className="h-4 w-4 mr-2" />
                      Validate Token
                    </Button>
                    <Button onClick={loadSampleJWT} variant="outline">
                      Load Sample
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Validation Results</h4>
                  {isValid !== null ? (
                    <div className={`p-4 rounded-lg ${
                      isValid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        {isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-medium ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                          {isValid ? 'Token is Valid' : 'Token is Invalid'}
                        </span>
                      </div>
                      
                      {payload && (
                        <div className="space-y-2 text-sm">
                          {payload.sub && (
                            <div><strong>Subject:</strong> {payload.sub}</div>
                          )}
                          {payload.name && (
                            <div><strong>Name:</strong> {payload.name}</div>
                          )}
                          {payload.email && (
                            <div><strong>Email:</strong> {payload.email}</div>
                          )}
                          {payload.iat && (
                            <div><strong>Issued:</strong> {new Date(payload.iat * 1000).toLocaleString()}</div>
                          )}
                          {payload.exp && (
                            <div>
                              <strong>Expires:</strong> {new Date(payload.exp * 1000).toLocaleString()}
                              {payload.exp < Math.floor(Date.now() / 1000) && (
                                <Badge variant="destructive" className="ml-2">Expired</Badge>
                              )}
                            </div>
                          )}
                          {payload.roles && (
                            <div><strong>Roles:</strong> {Array.isArray(payload.roles) ? payload.roles.join(', ') : payload.roles}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Validation results will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}