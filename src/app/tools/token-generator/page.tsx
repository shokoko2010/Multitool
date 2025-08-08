'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Download, RotateCcw, Shield, Key, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TokenConfig {
  type: 'jwt' | 'api' | 'uuid' | 'random'
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  algorithm: string
  secret: string
  expiration: string
}

export default function TokenGenerator() {
  const [config, setConfig] = useState<TokenConfig>({
    type: 'random',
    length: 32,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    algorithm: 'HS256',
    secret: '',
    expiration: '1h'
  })
  
  const [generatedTokens, setGeneratedTokens] = useState<{
    type: string
    token: string
    timestamp: string
  }[]>([])
  
  const [selectedToken, setSelectedToken] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generateToken = () => {
    setLoading(true)
    try {
      const timestamp = new Date().toLocaleString()
      let newToken = ''

      switch (config.type) {
        case 'random':
          newToken = generateRandomToken()
          break
        case 'uuid':
          newToken = generateUUID()
          break
        case 'api':
          newToken = generateAPIToken()
          break
        case 'jwt':
          newToken = generateJWT()
          break
      }

      setGeneratedTokens(prev => [{
        type: config.type,
        token: newToken,
        timestamp
      }, ...prev])

      setSelectedToken(newToken)
      
      toast({
        title: "Token generated",
        description: `Generated ${config.type.toUpperCase()} token`
      })
    } catch (error) {
      toast({
        title: "Token generation failed",
        description: "Unable to generate token",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateRandomToken = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    let charset = ''
    if (config.includeUppercase) charset += uppercase
    if (config.includeLowercase) charset += lowercase
    if (config.includeNumbers) charset += numbers
    if (config.includeSymbols) charset += symbols

    if (!charset) {
      throw new Error('At least one character type must be selected')
    }

    let token = ''
    for (let i = 0; i < config.length; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return token
  }

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const generateAPIToken = (): string => {
    const prefix = 'sk_'
    const timestamp = Date.now().toString(36)
    const random = generateRandomToken()
    return prefix + timestamp + '_' + random.substring(0, 16)
  }

  const generateJWT = (): string => {
    // This is a simplified JWT generation
    const header = btoa(JSON.stringify({
      alg: config.algorithm,
      typ: 'JWT'
    }))
    
    const payload = btoa(JSON.stringify({
      sub: 'user123',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseExpiration(config.expiration)
    }))
    
    const signature = btoa(header + '.' + payload + config.secret)
    
    return header + '.' + payload + '.' + signature
  }

  const parseExpiration = (expiration: string): number => {
    const match = expiration.match(/(\d+)([smhd])/)
    if (!match) return 3600 // Default 1 hour
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 3600
      case 'd': return value * 86400
      default: return 3600
    }
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    toast({
      title: "Copied to clipboard",
      description: "Token has been copied to clipboard"
    })
  }

  const downloadTokens = () => {
    const content = `Generated Tokens
Generated on: ${new Date().toLocaleString()}

${generatedTokens.map(token => `
${token.type.toUpperCase()} Token:
${token.token}
Generated: ${token.timestamp}
`).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tokens.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "Tokens file download has started"
    })
  }

  const clearTokens = () => {
    setGeneratedTokens([])
    setSelectedToken('')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Token Generator</h1>
        <p className="text-muted-foreground">
          Generate various types of secure tokens including random strings, UUIDs, API keys, and JWTs
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Security Tool</Badge>
          <Badge variant="outline">Token Generation</Badge>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Tokens</TabsTrigger>
          <TabsTrigger value="history">Token History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Configuration</CardTitle>
                <CardDescription>
                  Configure token generation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Type</Label>
                  <Select value={config.type} onValueChange={(value: any) => setConfig(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random String</SelectItem>
                      <SelectItem value="uuid">UUID</SelectItem>
                      <SelectItem value="api">API Key</SelectItem>
                      <SelectItem value="jwt">JWT Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.type === 'random' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Length: {config.length}</Label>
                      <Slider
                        value={[config.length]}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, length: value[0] }))}
                        max={128}
                        min={8}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Character Types</Label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={config.includeUppercase}
                            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeUppercase: checked as boolean }))}
                          />
                          <span>Uppercase Letters (A-Z)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={config.includeLowercase}
                            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeLowercase: checked as boolean }))}
                          />
                          <span>Lowercase Letters (a-z)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={config.includeNumbers}
                            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeNumbers: checked as boolean }))}
                          />
                          <span>Numbers (0-9)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={config.includeSymbols}
                            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeSymbols: checked as boolean }))}
                          />
                          <span>Symbols (!@#$%^&*)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {config.type === 'jwt' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Algorithm</Label>
                      <Select value={config.algorithm} onValueChange={(value) => setConfig(prev => ({ ...prev, algorithm: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HS256">HS256 (HMAC using SHA-256)</SelectItem>
                          <SelectItem value="HS384">HS384 (HMAC using SHA-384)</SelectItem>
                          <SelectItem value="HS512">HS512 (HMAC using SHA-512)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secret">Secret Key</Label>
                      <input
                        id="secret"
                        type="password"
                        placeholder="Enter secret key for JWT signing"
                        value={config.secret}
                        onChange={(e) => setConfig(prev => ({ ...prev, secret: e.target.value }))}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiration</Label>
                      <Select value={config.expiration} onValueChange={(value) => setConfig(prev => ({ ...prev, expiration: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15m">15 minutes</SelectItem>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="30d">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={generateToken} 
                  disabled={loading || (config.type === 'jwt' && !config.secret.trim())}
                  className="w-full"
                >
                  {loading ? <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                  {loading ? "Generating..." : "Generate Token"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Token</CardTitle>
                <CardDescription>
                  Your generated token will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedToken ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-mono text-sm break-all">
                        {selectedToken}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => copyToken(selectedToken)} variant="outline" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Token
                      </Button>
                      <Button onClick={downloadTokens} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-800">Security Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Store tokens securely</li>
                        <li>• Use HTTPS for transmission</li>
                        <li>• Set appropriate expiration times</li>
                        <li>• Rotate tokens regularly</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Key className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">
                      Configure token settings and click "Generate Token" to see results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Tokens History</CardTitle>
              <CardDescription>
                View your previously generated tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedTokens.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {generatedTokens.length} token{generatedTokens.length !== 1 ? 's' : ''} generated
                    </span>
                    <Button onClick={clearTokens} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear History
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedTokens.map((token, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              <Badge variant="outline">{token.type.toUpperCase()}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {token.timestamp}
                              </span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => copyToken(token.token)} 
                            variant="ghost" 
                            size="sm"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="font-mono text-xs break-all">
                          {token.token}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Hash className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    No tokens generated yet. Go to the Generate tab to create your first token.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Token Security Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use sufficient token length (32+ characters)</li>
                <li>• Include character variety for randomness</li>
                <li>• Set appropriate expiration times</li>
                <li>• Store tokens securely (never in plain text)</li>
                <li>• Use HTTPS for all token communications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Token Types</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>Random:</strong> General purpose secure strings</li>
                <li>• <strong>UUID:</strong> Unique identifiers</li>
                <li>• <strong>API:</strong> Service authentication keys</li>
                <li>• <strong>JWT:</strong> JSON Web Tokens for authentication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}