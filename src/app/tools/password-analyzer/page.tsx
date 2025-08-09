'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Copy, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Hash,
  Clock,
  Zap,
  Key
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface PasswordAnalysis {
  password: string
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  score: number
  length: number
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumbers: boolean
  hasSpecialChars: boolean
  hasCommonWords: boolean
  entropy: number
  crackTime: string
  recommendations: string[]
}

export default function PasswordAnalyzer() {
  const { theme } = useTheme()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzePassword = (pwd: string): PasswordAnalysis => {
    let score = 0
    const recommendations: string[] = []

    // Length analysis
    const length = pwd.length
    if (length >= 8) score += 20
    else recommendations.push('Use at least 8 characters')

    if (length >= 12) score += 10
    if (length >= 16) score += 10

    // Character variety
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasLowercase = /[a-z]/.test(pwd)
    const hasNumbers = /\d/.test(pwd)
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)

    if (hasUppercase) score += 15
    else recommendations.push('Include uppercase letters')

    if (hasLowercase) score += 15
    else recommendations.push('Include lowercase letters')

    if (hasNumbers) score += 15
    else recommendations.push('Include numbers')

    if (hasSpecialChars) score += 15
    else recommendations.push('Include special characters')

    // Common words and patterns
    const hasCommonWords = /password|123456|qwerty|letmein|admin|welcome/i.test(pwd)
    if (hasCommonWords) {
      score -= 30
      recommendations.push('Avoid common passwords and words')
    }

    // Sequential characters
    const hasSequential = /(.)\1{2,}|012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(pwd)
    if (hasSequential) {
      score -= 20
      recommendations.push('Avoid sequential characters')
    }

    // Calculate entropy
    const charsetSize = (hasUppercase ? 26 : 0) + 
                       (hasLowercase ? 26 : 0) + 
                       (hasNumbers ? 10 : 0) + 
                       (hasSpecialChars ? 32 : 0)
    const entropy = length * Math.log2(charsetSize)

    // Estimate crack time
    const crackTime = estimateCrackTime(entropy, charsetSize)

    // Determine strength
    let strength: PasswordAnalysis['strength'] = 'very-weak'
    if (score >= 80) strength = 'very-strong'
    else if (score >= 60) strength = 'strong'
    else if (score >= 40) strength = 'good'
    else if (score >= 20) strength = 'fair'
    else if (score >= 10) strength = 'weak'

    return {
      password: pwd,
      strength,
      score,
      length,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChars,
      hasCommonWords,
      entropy,
      crackTime,
      recommendations
    }
  }

  const estimateCrackTime = (entropy: number, charsetSize: number): string => {
    const combinations = Math.pow(charsetSize, Math.floor(entropy / Math.log2(charsetSize)))
    const attemptsPerSecond = 1000000 // 1 million attempts per second
    
    const secondsToCrack = combinations / (2 * attemptsPerSecond)
    
    if (secondsToCrack < 1) return 'Instantly'
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`
    return 'Millions of years'
  }

  const handleAnalyze = () => {
    if (!password) return

    setIsAnalyzing(true)
    setTimeout(() => {
      const result = analyzePassword(password)
      setAnalysis(result)
      setIsAnalyzing(false)
    }, 500)
  }

  const getStrengthColor = (strength: PasswordAnalysis['strength']) => {
    switch (strength) {
      case 'very-weak': return 'text-red-600 bg-red-100'
      case 'weak': return 'text-orange-600 bg-orange-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'strong': return 'text-green-600 bg-green-100'
      case 'very-strong': return 'text-emerald-600 bg-emerald-100'
    }
  }

  const getStrengthIcon = (strength: PasswordAnalysis['strength']) => {
    switch (strength) {
      case 'very-weak': return <XCircle className="h-4 w-4" />
      case 'weak': return <AlertTriangle className="h-4 w-4" />
      case 'fair': return <Clock className="h-4 w-4" />
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'strong': return <CheckCircle className="h-4 w-4" />
      case 'very-strong': return <Shield className="h-4 w-4" />
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Password Analyzer</h1>
        <p className="text-muted-foreground">
          Check password strength and security vulnerabilities
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Section */}
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
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password to analyze..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={!password || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Analyze Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Strength Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Password Strength</CardTitle>
                    <CardDescription>
                      Overall security assessment
                    </CardDescription>
                  </div>
                  <Badge className={getStrengthColor(analysis.strength)}>
                    {getStrengthIcon(analysis.strength)}
                    <span className="ml-1 capitalize">
                      {analysis.strength.replace('-', ' ')}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Strength Score</span>
                      <span>{analysis.score}/100</span>
                    </div>
                    <Progress value={analysis.score} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analysis.length}</div>
                      <div className="text-xs text-muted-foreground">Characters</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.entropy.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Entropy Bits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analysis.crackTime}
                      </div>
                      <div className="text-xs text-muted-foreground">To Crack</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(((analysis.entropy - 40) / 40) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Better than avg</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Character Requirements</CardTitle>
                <CardDescription>
                  Password complexity requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm">Uppercase Letters</span>
                    </div>
                    {analysis.hasUppercase ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm">Lowercase Letters</span>
                    </div>
                    {analysis.hasLowercase ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm">Numbers</span>
                    </div>
                    {analysis.hasNumbers ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm">Special Characters</span>
                    </div>
                    {analysis.hasSpecialChars ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Issues */}
            {(analysis.hasCommonWords || analysis.strength === 'very-weak') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Security Issues Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.hasCommonWords && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-sm">
                          This password contains common words that make it easy to guess
                        </p>
                      </div>
                    )}
                    {analysis.strength === 'very-weak' && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-sm">
                          This password is very weak and should be changed immediately
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>
                    Improve your password security with these tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm">{recommendation}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Password
              </Button>
              <Button variant="outline" onClick={() => setPassword('')}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}