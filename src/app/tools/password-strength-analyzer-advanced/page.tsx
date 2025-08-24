'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Shield, AlertTriangle, Check, X, RefreshCw } from 'lucide-react'

interface PasswordAnalysis {
  score: number
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
  length: number
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSymbols: boolean
  hasSpaces: boolean
  entropy: number
  crackTime: string
  suggestions: string[]
  commonPatterns: string[]
}

export default function PasswordStrengthAnalyzerAdvanced() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzePassword = (pwd: string) => {
    if (!pwd) {
      setAnalysis(null)
      return
    }

    setIsAnalyzing(true)

    // Simulate analysis delay
    setTimeout(() => {
      const length = pwd.length
      const hasUppercase = /[A-Z]/.test(pwd)
      const hasLowercase = /[a-z]/.test(pwd)
      const hasNumbers = /\d/.test(pwd)
      const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
      const hasSpaces = /\s/.test(pwd)

      // Calculate entropy
      const charsetSize = (hasUppercase ? 26 : 0) + (hasLowercase ? 26 : 0) + (hasNumbers ? 10 : 0) + (hasSymbols ? 32 : 0)
      const entropy = charsetSize > 0 ? length * Math.log2(charsetSize) : 0

      // Calculate score
      let score = 0
      score += Math.min(length * 4, 40) // Length contributes up to 40 points
      score += hasUppercase ? 10 : 0
      score += hasLowercase ? 10 : 0
      score += hasNumbers ? 10 : 0
      score += hasSymbols ? 15 : 0
      score += hasSpaces ? -5 : 0 // Spaces reduce security

      // Bonus for length
      if (length >= 12) score += 10
      if (length >= 16) score += 10
      if (length >= 20) score += 10

      // Penalty for common patterns
      const commonPatterns = []
      if (pwd.toLowerCase().includes('password')) commonPatterns.push('Contains "password"')
      if (pwd.toLowerCase().includes('123')) commonPatterns.push('Contains sequential numbers')
      if (pwd.toLowerCase().includes('qwerty')) commonPatterns.push('Contains keyboard pattern')
      if (/(\w)\1{2,}/.test(pwd)) commonPatterns.push('Contains repeated characters')
      if (/^[a-zA-Z]+$/.test(pwd)) commonPatterns.push('Only letters')
      if (/^[0-9]+$/.test(pwd)) commonPatterns.push('Only numbers')

      score -= commonPatterns.length * 10
      score = Math.max(0, Math.min(100, score))

      // Determine strength
      let strength: PasswordAnalysis['strength'] = 'Very Weak'
      if (score >= 80) strength = 'Very Strong'
      else if (score >= 60) strength = 'Strong'
      else if (score >= 40) strength = 'Good'
      else if (score >= 25) strength = 'Fair'
      else if (score >= 10) strength = 'Weak'

      // Estimate crack time
      let crackTime = 'Instant'
      if (entropy >= 100) crackTime = 'Centuries'
      else if (entropy >= 80) crackTime = 'Centuries'
      else if (entropy >= 60) crackTime = 'Years'
      else if (entropy >= 40) crackTime = 'Months'
      else if (entropy >= 30) crackTime = 'Weeks'
      else if (entropy >= 20) crackTime = 'Days'
      else if (entropy >= 10) crackTime = 'Hours'
      else if (entropy >= 5) crackTime = 'Minutes'

      // Generate suggestions
      const suggestions = []
      if (length < 12) suggestions.push('Use at least 12 characters')
      if (!hasUppercase) suggestions.push('Include uppercase letters')
      if (!hasLowercase) suggestions.push('Include lowercase letters')
      if (!hasNumbers) suggestions.push('Include numbers')
      if (!hasSymbols) suggestions.push('Include special characters')
      if (hasSpaces) suggestions.push('Avoid spaces in passwords')
      if (commonPatterns.length > 0) suggestions.push('Avoid common patterns and words')

      const result: PasswordAnalysis = {
        score,
        strength,
        length,
        hasUppercase,
        hasLowercase,
        hasNumbers,
        hasSymbols,
        hasSpaces,
        entropy,
        crackTime,
        suggestions,
        commonPatterns
      }

      setAnalysis(result)
      setIsAnalyzing(false)
    }, 500)
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Weak': return 'bg-red-500'
      case 'Weak': return 'bg-orange-500'
      case 'Fair': return 'bg-yellow-500'
      case 'Good': return 'bg-blue-500'
      case 'Strong': return 'bg-green-500'
      case 'Very Strong': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'Very Weak':
      case 'Weak':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'Fair':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'Good':
        return <Shield className="h-5 w-5 text-blue-500" />
      case 'Strong':
      case 'Very Strong':
        return <Shield className="h-5 w-5 text-green-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let newPassword = ''
    
    // Ensure at least one of each character type
    newPassword += lowercase[Math.floor(Math.random() * lowercase.length)]
    newPassword += uppercase[Math.floor(Math.random() * uppercase.length)]
    newPassword += numbers[Math.floor(Math.random() * numbers.length)]
    newPassword += symbols[Math.floor(Math.random() * symbols.length)]

    // Add random characters to reach 16 characters
    const allChars = lowercase + uppercase + numbers + symbols
    for (let i = 4; i < 16; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')
    
    setPassword(newPassword)
    analyzePassword(newPassword)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Password Strength Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze your password strength, get security recommendations, and generate strong passwords
        </p>
      </div>

      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer">Password Analyzer</TabsTrigger>
          <TabsTrigger value="generator">Password Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Analysis
              </CardTitle>
              <CardDescription>
                Enter a password to analyze its strength and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      analyzePassword(e.target.value)
                    }}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Analyzing password...</span>
                  </div>
                )}

                {analysis && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        {getStrengthIcon(analysis.strength)}
                        <span className="text-2xl font-bold">{analysis.strength}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Score: {analysis.score}/100</span>
                          <span>Entropy: {analysis.entropy.toFixed(1)} bits</span>
                        </div>
                        <Progress value={analysis.score} className="h-2" />
                        <div className={`h-2 rounded-full ${getStrengthColor(analysis.strength)}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{analysis.length}</div>
                        <div className="text-sm text-muted-foreground">Characters</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{analysis.crackTime}</div>
                        <div className="text-sm text-muted-foreground">Crack Time</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{analysis.entropy.toFixed(0)}</div>
                        <div className="text-sm text-muted-foreground">Entropy Bits</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{analysis.score}</div>
                        <div className="text-sm text-muted-foreground">Security Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Character Types</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Uppercase Letters</span>
                            {analysis.hasUppercase ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Lowercase Letters</span>
                            {analysis.hasLowercase ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Numbers</span>
                            {analysis.hasNumbers ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Special Characters</span>
                            {analysis.hasSymbols ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Spaces</span>
                            {analysis.hasSpaces ? <X className="h-4 w-4 text-red-500" /> : <Check className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Security Issues</h3>
                        <div className="space-y-2">
                          {analysis.commonPatterns.length > 0 ? (
                            analysis.commonPatterns.map((pattern, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{pattern}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <Check className="h-4 w-4" />
                              <span>No common patterns detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {analysis.suggestions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Recommendations</h3>
                        <div className="space-y-2">
                          {analysis.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                              <Shield className="h-4 w-4" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Password Generator
              </CardTitle>
              <CardDescription>
                Generate strong, secure passwords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Generated password will appear here"
                    value={password}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button onClick={generateStrongPassword}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Password Guidelines</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Use at least 12 characters</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include numbers and special characters</li>
                      <li>• Avoid common words and patterns</li>
                      <li>• Use unique passwords for each account</li>
                      <li>• Consider using a password manager</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Security Tips</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Never share your passwords</li>
                      <li>• Change passwords regularly</li>
                      <li>• Enable two-factor authentication</li>
                      <li>• Be careful with password recovery</li>
                      <li>• Avoid writing passwords down</li>
                      <li>• Use different passwords for different sites</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Why Strong Passwords Matter</h4>
                  <p className="text-sm text-blue-700">
                    Strong passwords protect your personal information, financial data, and online identity. 
                    Weak passwords can be easily cracked by hackers, leading to identity theft, financial loss, 
                    and unauthorized access to your accounts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}