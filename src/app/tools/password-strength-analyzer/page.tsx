"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, Shield, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function PasswordStrengthAnalyzer() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const analyzePassword = (pwd: string) => {
    if (!pwd) {
      setAnalysis(null)
      return
    }

    let score = 0
    const feedback = []
    const checks = {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      special: false,
      noCommon: true,
      noRepeating: true,
      noSequences: true
    }

    // Length check
    if (pwd.length >= 8) {
      score += 20
      checks.length = true
    } else {
      feedback.push('Password should be at least 8 characters long')
    }
    if (pwd.length >= 12) score += 10
    if (pwd.length >= 16) score += 10

    // Character variety checks
    if (/[A-Z]/.test(pwd)) {
      score += 10
      checks.uppercase = true
    } else {
      feedback.push('Add uppercase letters')
    }

    if (/[a-z]/.test(pwd)) {
      score += 10
      checks.lowercase = true
    } else {
      feedback.push('Add lowercase letters')
    }

    if (/[0-9]/.test(pwd)) {
      score += 10
      checks.numbers = true
    } else {
      feedback.push('Add numbers')
    }

    if (/[^A-Za-z0-9]/.test(pwd)) {
      score += 15
      checks.special = true
    } else {
      feedback.push('Add special characters')
    }

    // Common passwords check
    const commonPasswords = [
      'password', '123456', '12345678', '123456789', '12345',
      'qwerty', 'abc123', 'password1', 'admin', 'welcome',
      'letmein', 'monkey', 'dragon', 'baseball', 'football'
    ]
    
    if (commonPasswords.includes(pwd.toLowerCase())) {
      score -= 30
      checks.noCommon = false
      feedback.push('Password is too common')
    }

    // Repeating characters check
    if (/(.)\1{2,}/.test(pwd)) {
      score -= 10
      checks.noRepeating = false
      feedback.push('Avoid repeating characters')
    }

    // Sequences check
    const sequences = ['abc', '123', 'qwerty', 'asdf', 'zxcv']
    const lowerPwd = pwd.toLowerCase()
    if (sequences.some(seq => lowerPwd.includes(seq))) {
      score -= 10
      checks.noSequences = false
      feedback.push('Avoid common sequences')
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score)

    // Determine strength level
    let strength = 'Very Weak'
    let strengthColor = 'bg-red-500'
    let strengthIcon = XCircle

    if (score >= 80) {
      strength = 'Very Strong'
      strengthColor = 'bg-green-500'
      strengthIcon = CheckCircle
    } else if (score >= 60) {
      strength = 'Strong'
      strengthColor = 'bg-blue-500'
      strengthIcon = CheckCircle
    } else if (score >= 40) {
      strength = 'Medium'
      strengthColor = 'bg-yellow-500'
    } else if (score >= 20) {
      strength = 'Weak'
      strengthColor = 'bg-orange-500'
    }

    // Calculate time to crack (very rough estimate)
    const timeToCrack = calculateTimeToCrack(pwd)

    setAnalysis({
      score,
      strength,
      strengthColor,
      strengthIcon,
      feedback,
      checks,
      timeToCrack,
      entropy: calculateEntropy(pwd)
    })
  }

  const calculateEntropy = (pwd: string) => {
    let poolSize = 0
    if (/[a-z]/.test(pwd)) poolSize += 26
    if (/[A-Z]/.test(pwd)) poolSize += 26
    if (/[0-9]/.test(pwd)) poolSize += 10
    if (/[^A-Za-z0-9]/.test(pwd)) poolSize += 32
    
    return pwd.length > 0 ? Math.log2(poolSize) * pwd.length : 0
  }

  const calculateTimeToCrack = (pwd: string) => {
    const entropy = calculateEntropy(pwd)
    if (entropy === 0) return 'instant'
    
    // Rough estimate: 2^entropy combinations
    const combinations = Math.pow(2, entropy)
    const guessesPerSecond = 1000000000 // 1 billion guesses per second (high-end)
    const secondsToCrack = combinations / (2 * guessesPerSecond) // Average case
    
    if (secondsToCrack < 1) return 'instant'
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`
    return `${Math.round(secondsToCrack / 31536000)} years`
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    analyzePassword(newPassword)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
    toast.success('Password copied to clipboard!')
  }

  const handleClear = () => {
    setPassword('')
    setAnalysis(null)
    toast.success('Cleared!')
  }

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = lowercase + uppercase + numbers + special
    let newPassword = ''
    
    // Ensure at least one character from each category
    newPassword += lowercase[Math.floor(Math.random() * lowercase.length)]
    newPassword += uppercase[Math.floor(Math.random() * uppercase.length)]
    newPassword += numbers[Math.floor(Math.random() * numbers.length)]
    newPassword += special[Math.floor(Math.random() * special.length)]
    
    // Add remaining characters
    for (let i = 4; i < 16; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')
    
    setPassword(newPassword)
    analyzePassword(newPassword)
    toast.success('Strong password generated!')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Password Strength Analyzer</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyze your password strength and get actionable feedback to improve your security.
            </p>
          </motion.div>
        </div>

        {/* Password Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enter Password
            </CardTitle>
            <CardDescription>
              Type or paste your password to analyze its strength
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password..."
                className="pr-20"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {password && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateStrongPassword} size="lg">
                Generate Strong Password
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <analysis.strengthIcon className="h-5 w-5" />
                Password Analysis
              </CardTitle>
              <CardDescription>
                Your password strength: {analysis.strength}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strength Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Strength Score</span>
                  <span className="text-sm font-bold">{analysis.score}/100</span>
                </div>
                <Progress value={analysis.score} className="h-2" />
              </div>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.entropy.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Entropy (bits)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.timeToCrack}
                  </div>
                  <div className="text-sm text-muted-foreground">Time to Crack</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {password.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
              </div>

              {/* Security Checks */}
              <div>
                <h4 className="font-medium mb-3">Security Checks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(analysis.checks).map(([check, passed]) => (
                    <div key={check} className="flex items-center gap-2">
                      {passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">
                        {check.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {analysis.feedback.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Suggestions for Improvement</h4>
                  <div className="space-y-2">
                    {analysis.feedback.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Password Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Password Security Tips
            </CardTitle>
            <CardDescription>
              Best practices for creating strong passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Length Matters</h4>
                <p className="text-sm text-muted-foreground">
                  Use at least 12 characters. Longer passwords are exponentially more secure.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mix Character Types</h4>
                <p className="text-sm text-muted-foreground">
                  Combine uppercase, lowercase, numbers, and special characters.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Avoid Common Patterns</h4>
                <p className="text-sm text-muted-foreground">
                  Don't use dictionary words, personal information, or common sequences.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Use Unique Passwords</h4>
                <p className="text-sm text-muted-foreground">
                  Never reuse passwords across different accounts or services.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Consider Password Managers</h4>
                <p className="text-sm text-muted-foreground">
                  Use a password manager to generate and store complex passwords securely.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Enable Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security beyond just passwords.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}