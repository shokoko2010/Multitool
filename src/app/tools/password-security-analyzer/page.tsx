'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  Zap
} from 'lucide-react'

interface PasswordAnalysis {
  score: number
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  entropy: number
  crackTime: string
  length: number
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSymbols: boolean
  hasCommonPatterns: boolean
  isCommonPassword: boolean
  suggestions: string[]
  warnings: string[]
}

interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  maxConsecutive: number
  preventPersonalInfo: boolean
}

export default function PasswordSecurityAnalyzer() {
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)
  const [policy, setPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxConsecutive: 3,
    preventPersonalInfo: true
  })

  const commonPasswords = [
    'password', '123456', '12345678', '123456789', '12345',
    'qwerty', 'abc123', 'password1', 'admin', 'welcome',
    'monkey', 'sunshine', 'letmein', 'dragon', 'football'
  ]

  const commonPatterns = [
    /123/g, /abc/g, /qwe/g, /asd/g, /zxc/g,
    /aaa/g, /bbb/g, /ccc/g, /111/g, /222/g, /333/g
  ]

  const analyzePassword = (pwd: string) => {
    if (!pwd) {
      setAnalysis(null)
      return
    }

    const length = pwd.length
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasLowercase = /[a-z]/.test(pwd)
    const hasNumbers = /\d/.test(pwd)
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    
    // Check for common patterns
    const hasCommonPatterns = commonPatterns.some(pattern => pattern.test(pwd))
    
    // Check if it's a common password
    const isCommonPassword = commonPasswords.includes(pwd.toLowerCase())

    // Calculate entropy
    let charsetSize = 0
    if (hasLowercase) charsetSize += 26
    if (hasUppercase) charsetSize += 26
    if (hasNumbers) charsetSize += 10
    if (hasSymbols) charsetSize += 32
    
    const entropy = length * Math.log2(charsetSize)

    // Calculate score (0-100)
    let score = 0
    
    // Length scoring
    if (length >= 8) score += 20
    if (length >= 12) score += 15
    if (length >= 16) score += 15
    
    // Character variety scoring
    if (hasLowercase) score += 10
    if (hasUppercase) score += 10
    if (hasNumbers) score += 10
    if (hasSymbols) score += 15
    
    // Deductions for weaknesses
    if (hasCommonPatterns) score -= 20
    if (isCommonPassword) score -= 30
    if (length < 8) score -= 25
    
    score = Math.max(0, Math.min(100, score))

    // Determine strength
    let strength: PasswordAnalysis['strength'] = 'very-weak'
    if (score >= 80) strength = 'very-strong'
    else if (score >= 60) strength = 'strong'
    else if (score >= 40) strength = 'good'
    else if (score >= 25) strength = 'fair'
    else if (score >= 10) strength = 'weak'

    // Calculate crack time (simplified estimation)
    let crackTime = 'instant'
    if (entropy >= 100) crackTime = 'centuries'
    else if (entropy >= 80) crackTime = 'years'
    else if (entropy >= 60) crackTime = 'months'
    else if (entropy >= 40) crackTime = 'weeks'
    else if (entropy >= 20) crackTime = 'days'
    else if (entropy >= 10) crackTime = 'hours'

    // Generate suggestions
    const suggestions: string[] = []
    if (length < 12) suggestions.push('Use at least 12 characters')
    if (!hasUppercase) suggestions.push('Include uppercase letters')
    if (!hasLowercase) suggestions.push('Include lowercase letters')
    if (!hasNumbers) suggestions.push('Include numbers')
    if (!hasSymbols) suggestions.push('Include special characters')
    if (hasCommonPatterns) suggestions.push('Avoid common patterns like "123" or "abc"')
    if (isCommonPassword) suggestions.push('Avoid common passwords')

    // Generate warnings
    const warnings: string[] = []
    if (isCommonPassword) warnings.push('This is a very common password')
    if (hasCommonPatterns) warnings.push('Contains predictable patterns')
    if (length < 8) warnings.push('Password is too short')
    if (entropy < 30) warnings.push('Very low entropy - easily guessable')

    setAnalysis({
      score,
      strength,
      entropy,
      crackTime,
      length,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
      hasCommonPatterns,
      isCommonPassword,
      suggestions,
      warnings
    })
  }

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    let newPassword = ''
    const allChars = lowercase + uppercase + numbers + symbols
    
    // Ensure at least one of each character type
    newPassword += lowercase[Math.floor(Math.random() * lowercase.length)]
    newPassword += uppercase[Math.floor(Math.random() * uppercase.length)]
    newPassword += numbers[Math.floor(Math.random() * numbers.length)]
    newPassword += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Add remaining characters
    for (let i = 4; i < 16; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')
    
    setPassword(newPassword)
    analyzePassword(newPassword)
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very-weak': return 'text-red-600'
      case 'weak': return 'text-orange-600'
      case 'fair': return 'text-yellow-600'
      case 'good': return 'text-blue-600'
      case 'strong': return 'text-green-600'
      case 'very-strong': return 'text-emerald-600'
      default: return 'text-gray-600'
    }
  }

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'very-weak':
      case 'weak':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'fair':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'good':
        return <Shield className="h-5 w-5 text-blue-500" />
      case 'strong':
      case 'very-strong':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'very-weak': return 'Very Weak'
      case 'weak': return 'Weak'
      case 'fair': return 'Fair'
      case 'good': return 'Good'
      case 'strong': return 'Strong'
      case 'very-strong': return 'Very Strong'
      default: return 'Unknown'
    }
  }

  const checkPolicyCompliance = () => {
    if (!analysis) return { compliant: false, issues: [] as string[] }

    const issues: string[] = []
    
    if (analysis.length < policy.minLength) {
      issues.push(`Password must be at least ${policy.minLength} characters`)
    }
    if (policy.requireUppercase && !analysis.hasUppercase) {
      issues.push('Password must contain uppercase letters')
    }
    if (policy.requireLowercase && !analysis.hasLowercase) {
      issues.push('Password must contain lowercase letters')
    }
    if (policy.requireNumbers && !analysis.hasNumbers) {
      issues.push('Password must contain numbers')
    }
    if (policy.requireSymbols && !analysis.hasSymbols) {
      issues.push('Password must contain special characters')
    }

    return {
      compliant: issues.length === 0,
      issues
    }
  }

  const policyCompliance = analysis ? checkPolicyCompliance() : null

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Password Security Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze password strength, check compliance, and generate secure passwords
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Analysis
            </CardTitle>
            <CardDescription>
              Enter a password to analyze its security strength
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    analyzePassword(e.target.value)
                  }}
                  placeholder="Enter password to analyze"
                  className="flex-1"
                />
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  variant="outline"
                  size="sm"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={generateStrongPassword} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Strong Password
            </Button>

            {analysis && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password Strength</span>
                  <div className="flex items-center gap-2">
                    {getStrengthIcon(analysis.strength)}
                    <span className={`font-semibold ${getStrengthColor(analysis.strength)}`}>
                      {getStrengthLabel(analysis.strength)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span>{analysis.score}/100</span>
                  </div>
                  <Progress value={analysis.score} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Length:</span>
                    <span className="ml-2 font-medium">{analysis.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entropy:</span>
                    <span className="ml-2 font-medium">{analysis.entropy.toFixed(1)} bits</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Crack Time:</span>
                    <span className="ml-2 font-medium">{analysis.crackTime}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Character Types</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      {analysis.hasLowercase ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Lowercase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.hasUppercase ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Uppercase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.hasNumbers ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Numbers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.hasSymbols ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Symbols</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Details</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <Tabs defaultValue="suggestions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="warnings">Warnings</TabsTrigger>
                  <TabsTrigger value="policy">Policy</TabsTrigger>
                </TabsList>

                <TabsContent value="suggestions" className="space-y-3">
                  {analysis.suggestions.length > 0 ? (
                    analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                        {suggestion}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No suggestions - your password meets all security criteria!
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="warnings" className="space-y-3">
                  {analysis.warnings.length > 0 ? (
                    analysis.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        {warning}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No security warnings detected.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="policy" className="space-y-3">
                  {policyCompliance ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        {policyCompliance.compliant ? 
                          <CheckCircle className="h-5 w-5 text-green-500" /> : 
                          <XCircle className="h-5 w-5 text-red-500" />
                        }
                        <span className="font-medium">
                          {policyCompliance.compliant ? 'Policy Compliant' : 'Policy Violations'}
                        </span>
                      </div>
                      
                      {policyCompliance.issues.length > 0 && (
                        <div className="space-y-2">
                          {policyCompliance.issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                              <XCircle className="h-4 w-4 mt-0.5" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-sm">Policy Requirements:</h4>
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <div>• Minimum length: {policy.minLength} characters</div>
                          <div>• Uppercase letters: {policy.requireUppercase ? 'Required' : 'Optional'}</div>
                          <div>• Lowercase letters: {policy.requireLowercase ? 'Required' : 'Optional'}</div>
                          <div>• Numbers: {policy.requireNumbers ? 'Required' : 'Optional'}</div>
                          <div>• Special characters: {policy.requireSymbols ? 'Required' : 'Optional'}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter a password to check policy compliance.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Enter a password to see detailed security analysis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Password Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Strong Password Characteristics</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• At least 12 characters long</li>
                <li>• Mix of uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
                <li>• No common words or patterns</li>
                <li>• High entropy (randomness)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Security Recommendations</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use unique passwords for each account</li>
                <li>• Enable two-factor authentication</li>
                <li>• Consider using a password manager</li>
                <li>• Change passwords periodically</li>
                <li>• Never share passwords with others</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}