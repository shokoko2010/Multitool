'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Copy, RefreshCw } from 'lucide-react'

interface PasswordAnalysis {
  score: number
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  length: number
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSymbols: boolean
  hasCommonPatterns: boolean
  entropy: number
  estimatedCrackTime: string
  suggestions: string[]
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)
  const [checkHistory, setCheckHistory] = useState<Array<{
    id: string
    password: string
    strength: string
    score: number
    timestamp: Date
  }>>([])

  const commonPasswords = [
    'password', '123456', '12345678', '123456789', '12345',
    'qwerty', 'abc123', 'password1', 'admin', 'welcome',
    'monkey', 'sunshine', 'letmein', 'dragon', 'football'
  ]

  const commonPatterns = [
    /123/g, /abc/g, /qwe/g, /asd/g, /zxc/g,
    /password/g, /admin/g, /user/g, /love/g, /god/g
  ]

  const analyzePassword = (inputPassword: string) => {
    if (!inputPassword) {
      setAnalysis(null)
      return
    }

    const length = inputPassword.length
    const hasUppercase = /[A-Z]/.test(inputPassword)
    const hasLowercase = /[a-z]/.test(inputPassword)
    const hasNumbers = /\d/.test(inputPassword)
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(inputPassword)
    
    // Check for common patterns
    const hasCommonPatterns = commonPatterns.some(pattern => pattern.test(inputPassword.toLowerCase()))
    
    // Check if it's a common password
    const isCommonPassword = commonPasswords.includes(inputPassword.toLowerCase())

    // Calculate entropy
    const charsetSize = 
      (hasUppercase ? 26 : 0) +
      (hasLowercase ? 26 : 0) +
      (hasNumbers ? 10 : 0) +
      (hasSymbols ? 32 : 0)
    
    const entropy = charsetSize > 0 ? length * Math.log2(charsetSize) : 0

    // Calculate score (0-100)
    let score = 0
    
    // Length scoring
    if (length >= 8) score += 20
    if (length >= 12) score += 15
    if (length >= 16) score += 10
    
    // Character variety scoring
    if (hasUppercase) score += 15
    if (hasLowercase) score += 15
    if (hasNumbers) score += 15
    if (hasSymbols) score += 15
    
    // Deductions
    if (hasCommonPatterns) score -= 10
    if (isCommonPassword) score -= 30
    if (length < 8) score -= 20
    
    score = Math.max(0, Math.min(100, score))

    // Determine strength level
    let strength: PasswordAnalysis['strength'] = 'very-weak'
    if (score >= 80) strength = 'very-strong'
    else if (score >= 60) strength = 'strong'
    else if (score >= 40) strength = 'good'
    else if (score >= 25) strength = 'fair'
    else if (score >= 10) strength = 'weak'

    // Estimate crack time (very simplified)
    let estimatedCrackTime = 'Instant'
    if (entropy >= 100) estimatedCrackTime = 'Centuries'
    else if (entropy >= 80) estimatedCrackTime = 'Years'
    else if (entropy >= 60) estimatedCrackTime = 'Months'
    else if (entropy >= 40) estimatedCrackTime = 'Days'
    else if (entropy >= 20) estimatedCrackTime = 'Hours'
    else if (entropy >= 10) estimatedCrackTime = 'Minutes'

    // Generate suggestions
    const suggestions: string[] = []
    if (length < 12) suggestions.push('Use at least 12 characters')
    if (!hasUppercase) suggestions.push('Add uppercase letters')
    if (!hasLowercase) suggestions.push('Add lowercase letters')
    if (!hasNumbers) suggestions.push('Add numbers')
    if (!hasSymbols) suggestions.push('Add special characters')
    if (hasCommonPatterns) suggestions.push('Avoid common patterns')
    if (isCommonPassword) suggestions.push('Avoid common passwords')

    const result: PasswordAnalysis = {
      score,
      strength,
      length,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
      hasCommonPatterns,
      entropy,
      estimatedCrackTime,
      suggestions
    }

    setAnalysis(result)

    // Add to history (don't store actual password for security)
    const historyItem = {
      id: Date.now().toString(),
      password: '*'.repeat(Math.min(length, 8)),
      strength,
      score,
      timestamp: new Date()
    }
    
    setCheckHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = lowercase + uppercase + numbers + symbols
    let password = ''
    
    // Ensure at least one of each character type
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Add remaining characters
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    setPassword(password)
    analyzePassword(password)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  useEffect(() => {
    analyzePassword(password)
  }, [password])

  const getStrengthColor = (strength: string) => {
    const colors = {
      'very-weak': 'bg-red-500',
      'weak': 'bg-orange-500',
      'fair': 'bg-yellow-500',
      'good': 'bg-blue-500',
      'strong': 'bg-green-500',
      'very-strong': 'bg-emerald-500'
    }
    return colors[strength as keyof typeof colors] || 'bg-gray-500'
  }

  const getStrengthIcon = (strength: string) => {
    if (strength === 'very-strong' || strength === 'strong') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (strength === 'good' || strength === 'fair') {
      return <Shield className="h-5 w-5 text-blue-500" />
    } else {
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    }
  }

  const getStrengthLabel = (strength: string) => {
    const labels = {
      'very-weak': 'Very Weak',
      'weak': 'Weak',
      'fair': 'Fair',
      'good': 'Good',
      'strong': 'Strong',
      'very-strong': 'Very Strong'
    }
    return labels[strength as keyof typeof labels] || 'Unknown'
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Password Strength Checker</h1>
        <p className="text-muted-foreground">Analyze your password strength and get security recommendations</p>
      </div>

      <div className="space-y-6">
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to analyze"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                  className="absolute right-0 top-0 h-full px-3"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={generateStrongPassword} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Strong Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStrengthIcon(analysis.strength)}
                  Strength Analysis
                </CardTitle>
                <CardDescription>
                  Your password security assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Password Strength</span>
                    <Badge variant="outline" className={getStrengthColor(analysis.strength).replace('bg-', 'bg-').replace('500', '100')}>
                      {getStrengthLabel(analysis.strength)}
                    </Badge>
                  </div>
                  <Progress value={analysis.score} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    Score: {analysis.score}/100
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analysis.length}</div>
                    <div className="text-sm text-muted-foreground">Characters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analysis.entropy.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Entropy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analysis.estimatedCrackTime}</div>
                    <div className="text-sm text-muted-foreground">Crack Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analysis.suggestions.length}</div>
                    <div className="text-sm text-muted-foreground">Suggestions</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Character Types</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      {analysis.hasUppercase ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm">Uppercase Letters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.hasLowercase ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm">Lowercase Letters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.hasNumbers ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm">Numbers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.hasSymbols ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm">Special Characters</span>
                    </div>
                  </div>
                </div>

                {analysis.suggestions.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Recommendations</h4>
                      <div className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {analysis.hasCommonPatterns && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Common Pattern Detected</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      Your password contains common patterns that make it easier to guess.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Password Security Tips</CardTitle>
            <CardDescription>
              Best practices for creating strong passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Do's</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Use at least 12 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Mix character types (upper, lower, numbers, symbols)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Use unique passwords for each account
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Consider using a password manager
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Don'ts</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Use personal information (names, birthdays)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Use common words or phrases
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Use sequential patterns (123, abc)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Reuse passwords across multiple sites
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {checkHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>
                Recent password strength checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {checkHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.password}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStrengthColor(item.strength).replace('bg-', 'bg-').replace('500', '100')}>
                        {getStrengthLabel(item.strength)}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        Score: {item.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}