'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle, XCircle, Key, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    strength: number
    strengthLabel: string
    strengthColor: string
    score: number
    checks: {
      length: boolean
      uppercase: boolean
      lowercase: boolean
      numbers: boolean
      specialChars: boolean
      noCommonWords: boolean
      noSequentialChars: boolean
      noRepeatingChars: boolean
    }
    suggestions: string[]
    estimatedTime: string
    entropy: number
  } | null>(null)

  const commonPasswords = [
    'password', '123456', '12345678', '1234', '12345', '123456789', 'qwerty',
    'abc123', 'letmein', 'monkey', 'password1', 'admin', 'welcome', 'login',
    'user', 'pass', 'default', 'root', 'password123', '123123', '111111'
  ]

  const analyzePassword = () => {
    if (!password) {
      setAnalysisResult(null)
      return
    }

    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      specialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonWords: !commonPasswords.includes(password.toLowerCase()),
      noSequentialChars: !hasSequentialChars(password),
      noRepeatingChars: !hasRepeatingChars(password),
    }

    // Calculate score based on checks
    Object.values(checks).forEach(check => {
      if (check) score++
    })

    // Additional points for length
    if (password.length >= 12) score += 2
    if (password.length >= 16) score += 1

    // Calculate entropy
    const entropy = calculateEntropy(password)

    // Determine strength
    let strengthLabel = ''
    let strengthColor = ''
    let estimatedTime = ''

    if (score <= 2) {
      strengthLabel = 'Very Weak'
      strengthColor = 'text-red-600'
      estimatedTime = 'Instant'
    } else if (score <= 4) {
      strengthLabel = 'Weak'
      strengthColor = 'text-orange-600'
      estimatedTime = 'Seconds to minutes'
    } else if (score <= 6) {
      strengthLabel = 'Fair'
      strengthColor = 'text-yellow-600'
      estimatedTime = 'Hours to days'
    } else if (score <= 7) {
      strengthLabel = 'Good'
      strengthColor = 'text-blue-600'
      estimatedTime = 'Months to years'
    } else if (score <= 8) {
      strengthLabel = 'Strong'
      strengthColor = 'text-green-600'
      estimatedTime = 'Centuries'
    } else {
      strengthLabel = 'Very Strong'
      strengthColor = 'text-green-700'
      estimatedTime = 'Millennia'
    }

    // Generate suggestions
    const suggestions = []
    if (!checks.length) suggestions.push('Use at least 8 characters')
    if (!checks.uppercase) suggestions.push('Include uppercase letters')
    if (!checks.lowercase) suggestions.push('Include lowercase letters')
    if (!checks.numbers) suggestions.push('Include numbers')
    if (!checks.specialChars) suggestions.push('Include special characters')
    if (!checks.noCommonWords) suggestions.push('Avoid common passwords')
    if (!checks.noSequentialChars) suggestions.push('Avoid sequential characters')
    if (!checks.noRepeatingChars) suggestions.push('Avoid repeating characters')

    setAnalysisResult({
      strength: (score / 10) * 100,
      strengthLabel,
      strengthColor,
      score,
      checks,
      suggestions,
      estimatedTime,
      entropy,
    })
  }

  const hasSequentialChars = (password: string): boolean => {
    // Check for sequential characters (abc, 123, etc.)
    const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789']
    
    for (const seq of sequences) {
      for (let i = 0; i <= seq.length - 3; i++) {
        const sequence = seq.substr(i, 3)
        if (password.toLowerCase().includes(sequence)) return true
        if (password.toLowerCase().includes(sequence.split('').reverse().join(''))) return true
      }
    }
    
    return false
  }

  const hasRepeatingChars = (password: string): boolean => {
    // Check for repeating characters (aaa, 111, etc.)
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true
      }
    }
    return false
  }

  const calculateEntropy = (password: string): number => {
    const charsetSize = new Set(password.split('')).size
    return Math.log2(Math.pow(charsetSize, password.length))
  }

  const generateStrongPassword = () => {
    const length = 16
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    let newPassword = ''
    
    // Ensure at least one of each character type
    newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    newPassword += '0123456789'[Math.floor(Math.random() * 10)]
    newPassword += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 26)]
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')
    
    setPassword(newPassword)
  }

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
        variant: "default",
      })
    }
  }

  const clearAll = () => {
    setPassword('')
    setShowPassword(false)
    setAnalysisResult(null)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Password Strength Checker</h1>
          <p className="text-muted-foreground">Analyze and improve the security of your passwords</p>
        </div>

        <Tabs defaultValue="checker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checker">Password Checker</TabsTrigger>
            <TabsTrigger value="generator">Password Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="checker" className="space-y-6">
            {/* Password Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password Analysis
                </CardTitle>
                <CardDescription>Enter a password to check its strength</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password..."
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        analyzePassword()
                      }}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateStrongPassword} variant="outline" size="sm">
                    Generate Strong Password
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear
                  </Button>
                  {password && (
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      Copy Password
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <>
                {/* Strength Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Password Strength
                    </CardTitle>
                    <CardDescription>Security assessment of your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${analysisResult.strengthColor}`}>
                          {analysisResult.strengthLabel}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score: {analysisResult.score}/10 | Entropy: {analysisResult.entropy.toFixed(2)} bits
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {analysisResult.estimatedTime}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Strength Score</span>
                        <span>{Math.round(analysisResult.strength)}%</span>
                      </div>
                      <Progress value={analysisResult.strength} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Security Checks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security Requirements</CardTitle>
                    <CardDescription>Password security criteria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(analysisResult.checks).map(([check, passed]) => {
                        const labels: Record<string, string> = {
                          length: 'At least 8 characters',
                          uppercase: 'Contains uppercase letters',
                          lowercase: 'Contains lowercase letters',
                          numbers: 'Contains numbers',
                          specialChars: 'Contains special characters',
                          noCommonWords: 'Not a common password',
                          noSequentialChars: 'No sequential characters',
                          noRepeatingChars: 'No repeating characters',
                        }
                        
                        return (
                          <div key={check} className="flex items-center space-x-3 p-3 rounded-lg border">
                            {passed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <div className={`font-medium ${passed ? 'text-green-900' : 'text-red-900'}`}>
                                {labels[check]}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {passed ? '✓ Met' : '✗ Not met'}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                {analysisResult.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Improvement Suggestions
                      </CardTitle>
                      <CardDescription>How to make your password stronger</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-900">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Password Security Tips</CardTitle>
                <CardDescription>Best practices for creating strong passwords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Do's</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Use at least 12-16 characters</li>
                        <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                        <li>• Use unique passwords for each account</li>
                        <li>• Consider using a password manager</li>
                        <li>• Enable two-factor authentication when available</li>
                        <li>• Change passwords regularly for important accounts</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Don'ts</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Don't use common words or patterns</li>
                        <li>• Don't use personal information (name, birthday)</li>
                        <li>• Don't reuse passwords across multiple sites</li>
                        <li>• Don't write passwords on sticky notes</li>
                        <li>• Don't share your passwords with others</li>
                        <li>• Don't use the same password for important accounts</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Password Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider using a reputable password manager to generate, store, and manage your passwords securely. 
                      This allows you to use unique, complex passwords for every account without having to remember them all.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password Generator
                </CardTitle>
                <CardDescription>Generate strong, secure passwords</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Password generator functionality coming soon!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This feature will allow you to generate custom passwords with specific requirements.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}