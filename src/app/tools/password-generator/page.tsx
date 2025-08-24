'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Copy, 
  RefreshCw, 
  Shield, 
  Key, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
  customSymbols: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  feedback: string[]
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    customSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  })
  const [strength, setStrength] = useState<PasswordStrength | null>(null)
  const [copied, setCopied] = useState(false)
  const [passwordHistory, setPasswordHistory] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const similarChars = 'il1Lo0O'
  const ambiguousChars = '{}[]()/\\\'"`~,;.<>'

  const generatePassword = useCallback(() => {
    let charset = ''
    let password = ''

    if (options.lowercase) charset += lowercaseChars
    if (options.uppercase) charset += uppercaseChars
    if (options.numbers) charset += numberChars
    if (options.symbols) charset += options.customSymbols

    if (charset === '') {
      setError('Please select at least one character type')
      return
    }

    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('')
    }

    if (options.excludeAmbiguous) {
      charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('')
    }

    if (charset === '') {
      setError('No characters available after exclusions')
      return
    }

    // Ensure at least one character from each selected type
    const requiredChars: string[] = []
    if (options.lowercase) requiredChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)])
    if (options.uppercase) requiredChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)])
    if (options.numbers) requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)])
    if (options.symbols) requiredChars.push(options.customSymbols[Math.floor(Math.random() * options.customSymbols.length)])

    // Generate remaining characters
    for (let i = requiredChars.length; i < options.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    // Add required characters and shuffle
    password += requiredChars.join('')
    password = password.split('').sort(() => Math.random() - 0.5).join('')

    setPassword(password)
    setError(null)
    calculateStrength(password)
  }, [options])

  const calculateStrength = (pwd: string) => {
    let score = 0
    const feedback: string[] = []

    // Length scoring
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (pwd.length >= 16) score += 1
    if (pwd.length >= 20) score += 1

    // Character variety scoring
    if (/[a-z]/.test(pwd)) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1

    // Pattern detection
    if (/(.)\1{2,}/.test(pwd)) {
      score -= 1
      feedback.push('Avoid repeating characters')
    }

    if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(pwd)) {
      score -= 1
      feedback.push('Avoid sequential characters')
    }

    if (/qwerty|asdf|zxcv|password|admin|user|login/i.test(pwd)) {
      score -= 2
      feedback.push('Avoid common words and patterns')
    }

    // Feedback based on score
    if (score < 3) {
      feedback.push('Use a longer password')
      feedback.push('Include more character types')
    } else if (score < 6) {
      feedback.push('Consider adding more character variety')
    }

    const strengthLevels = [
      { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      { score: 3, label: 'Weak', color: 'bg-orange-500' },
      { score: 6, label: 'Fair', color: 'bg-yellow-500' },
      { score: 8, label: 'Good', color: 'bg-blue-500' },
      { score: 10, label: 'Strong', color: 'bg-green-500' }
    ]

    const strengthLevel = strengthLevels.reduce((prev, current) => 
      score >= current.score ? current : prev
    )

    setStrength({
      score,
      label: strengthLevel.label,
      color: strengthLevel.color,
      feedback
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const saveToHistory = () => {
    if (password && !passwordHistory.includes(password)) {
      setPasswordHistory(prev => [password, ...prev.slice(0, 9)])
    }
  }

  const handleGenerate = () => {
    generatePassword()
  }

  const handleCopy = () => {
    copyToClipboard()
    saveToHistory()
  }

  const updateOption = (key: keyof PasswordOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const getStrengthPercentage = () => {
    if (!strength) return 0
    return Math.min((strength.score / 12) * 100, 100)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            Password Generator
          </CardTitle>
          <CardDescription>
            Generate strong, secure passwords with customizable options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Generated Password</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    readOnly
                    placeholder="Click Generate to create a password"
                    className="font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="outline" onClick={handleCopy} disabled={!password}>
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button onClick={handleGenerate}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {strength && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password Strength</span>
                  <Badge variant="outline" className={`${strength.color.replace('bg-', 'text-')} border-${strength.color.replace('bg-', '')}`}>
                    {strength.label}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${getStrengthPercentage()}%` }}
                  />
                </div>
                {strength.feedback.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Info className="h-3 w-3" />
                      <span>Suggestions:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {strength.feedback.map((feedback, index) => (
                        <li key={index}>{feedback}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <Tabs defaultValue="options" className="w-full">
            <TabsList>
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="options" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Password Length: {options.length}</Label>
                  <Input
                    id="length"
                    type="range"
                    min="4"
                    max="128"
                    value={options.length}
                    onChange={(e) => updateOption('length', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Character Types</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.lowercase}
                        onChange={(e) => updateOption('lowercase', e.target.checked)}
                      />
                      <span className="text-sm">Lowercase (a-z)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.uppercase}
                        onChange={(e) => updateOption('uppercase', e.target.checked)}
                      />
                      <span className="text-sm">Uppercase (A-Z)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.numbers}
                        onChange={(e) => updateOption('numbers', e.target.checked)}
                      />
                      <span className="text-sm">Numbers (0-9)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.symbols}
                        onChange={(e) => updateOption('symbols', e.target.checked)}
                      />
                      <span className="text-sm">Symbols</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customSymbols">Custom Symbols</Label>
                  <Input
                    id="customSymbols"
                    value={options.customSymbols}
                    onChange={(e) => updateOption('customSymbols', e.target.value)}
                    placeholder="!@#$%^&*"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exclusions</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.excludeSimilar}
                        onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                      />
                      <span className="text-sm">Exclude similar (i, l, 1, L, o, 0, O)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.excludeAmbiguous}
                        onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                      />
                      <span className="text-sm">Exclude ambiguous ({ } [ ] ( ) / \\ ' " ` ~ , ; . &lt; &gt;)</span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  updateOption('length', 12)
                  updateOption('uppercase', true)
                  updateOption('lowercase', true)
                  updateOption('numbers', true)
                  updateOption('symbols', false)
                  updateOption('excludeSimilar', false)
                  updateOption('excludeAmbiguous', false)
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4" />
                      <span className="font-medium">PIN Code</span>
                    </div>
                    <p className="text-sm text-muted-foreground">4-6 digits, numbers only</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  updateOption('length', 16)
                  updateOption('uppercase', true)
                  updateOption('lowercase', true)
                  updateOption('numbers', true)
                  updateOption('symbols', true)
                  updateOption('excludeSimilar', true)
                  updateOption('excludeAmbiguous', false)
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Strong Password</span>
                    </div>
                    <p className="text-sm text-muted-foreground">16 chars, all types, no similar</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  updateOption('length', 32)
                  updateOption('uppercase', true)
                  updateOption('lowercase', true)
                  updateOption('numbers', true)
                  updateOption('symbols', true)
                  updateOption('excludeSimilar', true)
                  updateOption('excludeAmbiguous', true)
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Maximum Security</span>
                    </div>
                    <p className="text-sm text-muted-foreground">32 chars, all types, exclusions</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  updateOption('length', 8)
                  updateOption('uppercase', true)
                  updateOption('lowercase', true)
                  updateOption('numbers', true)
                  updateOption('symbols', false)
                  updateOption('excludeSimilar', false)
                  updateOption('excludeAmbiguous', false)
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Unlock className="h-4 w-4" />
                      <span className="font-medium">Basic Password</span>
                    </div>
                    <p className="text-sm text-muted-foreground">8 chars, letters and numbers</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  updateOption('length', 20)
                  updateOption('uppercase', false)
                  updateOption('lowercase', true)
                  updateOption('numbers', false)
                  updateOption('symbols', false)
                  updateOption('excludeSimilar', false)
                  updateOption('excludeAmbiguous', false)
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4" />
                      <span className="font-medium">Passphrase</span>
                    </div>
                    <p className="text-sm text-muted-foreground">20 chars, lowercase only</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  updateOption('length', 64)
                  updateOption('uppercase', true)
                  updateOption('lowercase', true)
                  updateOption('numbers', true)
                  updateOption('symbols', true)
                  updateOption('excludeSimilar', false)
                  updateOption('excludeAmbiguous', false)
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">API Key</span>
                    </div>
                    <p className="text-sm text-muted-foreground">64 chars, all character types</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Password History</h3>
                {passwordHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No passwords generated yet</p>
                    <p className="text-sm text-muted-foreground">Generated passwords will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {passwordHistory.map((pwd, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 font-mono text-sm">
                          {showPassword ? pwd : '•'.repeat(pwd.length)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(pwd)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPassword(pwd)
                              calculateStrength(pwd)
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{options.length}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {[options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length}
                </div>
                <div className="text-sm text-muted-foreground">Character Types</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{passwordHistory.length}</div>
                <div className="text-sm text-muted-foreground">In History</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}