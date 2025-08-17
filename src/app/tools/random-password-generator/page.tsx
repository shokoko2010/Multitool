"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Copy, Download, FileText, Hash, Type, AlignLeft, RotateCcw, Zap, Shield, Eye, EyeOff, RefreshCw, Dice6 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from '@/lib/toast'

export default function RandomPasswordGenerator() {
  const [password, setPassword] = useState('')
  const [passwordLength, setPasswordLength] = useState([16])
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordHistory, setPasswordHistory] = useState<string[]>([])

  const characterSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  }

  const similarChars = 'il1Lo0O'
  const ambiguousChars = '{}[]()/\\\'"`~,;.<>'

  const generatePassword = () => {
    let charset = ''
    
    if (includeUppercase) charset += characterSets.uppercase
    if (includeLowercase) charset += characterSets.lowercase
    if (includeNumbers) charset += characterSets.numbers
    if (includeSymbols) charset += characterSets.symbols

    if (excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('')
    }

    if (excludeAmbiguous) {
      charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('')
    }

    if (charset === '') {
      toast.error('Please select at least one character type')
      return
    }

    let newPassword = ''
    
    // Ensure at least one character from each selected type
    if (includeUppercase) {
      newPassword += characterSets.uppercase[Math.floor(Math.random() * characterSets.uppercase.length)]
    }
    if (includeLowercase) {
      newPassword += characterSets.lowercase[Math.floor(Math.random() * characterSets.lowercase.length)]
    }
    if (includeNumbers) {
      newPassword += characterSets.numbers[Math.floor(Math.random() * characterSets.numbers.length)]
    }
    if (includeSymbols) {
      newPassword += characterSets.symbols[Math.floor(Math.random() * characterSets.symbols.length)]
    }

    // Fill the rest with random characters
    for (let i = newPassword.length; i < passwordLength[0]; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)]
    }

    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')

    setPassword(newPassword)
    
    // Add to history
    setPasswordHistory(prev => [newPassword, ...prev.slice(0, 9)])
    
    toast.success('Password generated successfully!')
  }

  const generateMultiplePasswords = () => {
    const passwords = []
    for (let i = 0; i < 5; i++) {
      let charset = ''
      
      if (includeUppercase) charset += characterSets.uppercase
      if (includeLowercase) charset += characterSets.lowercase
      if (includeNumbers) charset += characterSets.numbers
      if (includeSymbols) charset += characterSets.symbols

      if (excludeSimilar) {
        charset = charset.split('').filter(char => !similarChars.includes(char)).join('')
      }

      if (excludeAmbiguous) {
        charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('')
      }

      if (charset === '') continue

      let newPassword = ''
      
      // Ensure at least one character from each selected type
      if (includeUppercase) {
        newPassword += characterSets.uppercase[Math.floor(Math.random() * characterSets.uppercase.length)]
      }
      if (includeLowercase) {
        newPassword += characterSets.lowercase[Math.floor(Math.random() * characterSets.lowercase.length)]
      }
      if (includeNumbers) {
        newPassword += characterSets.numbers[Math.floor(Math.random() * characterSets.numbers.length)]
      }
      if (includeSymbols) {
        newPassword += characterSets.symbols[Math.floor(Math.random() * characterSets.symbols.length)]
      }

      // Fill the rest with random characters
      for (let j = newPassword.length; j < passwordLength[0]; j++) {
        newPassword += charset[Math.floor(Math.random() * charset.length)]
      }

      // Shuffle the password
      newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')
      passwords.push(newPassword)
    }

    setPassword(passwords[0])
    setPasswordHistory(prev => [...passwords, ...prev.slice(0, 4)])
    toast.success('5 passwords generated!')
  }

  const handleCopy = (pwd: string) => {
    navigator.clipboard.writeText(pwd)
    toast.success('Password copied to clipboard!')
  }

  const handleCopyAll = () => {
    if (passwordHistory.length === 0) return
    const allPasswords = passwordHistory.join('\n')
    navigator.clipboard.writeText(allPasswords)
    toast.success('All passwords copied!')
  }

  const handleDownload = () => {
    if (!password) return
    
    const content = `Generated Passwords:\n\nCurrent: ${password}\n\nHistory:\n${passwordHistory.join('\n')}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passwords.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleClear = () => {
    setPassword('')
    setPasswordHistory([])
    toast.success('Cleared!')
  }

  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0
    
    let score = 0
    const length = pwd.length
    
    // Length contributes up to 50 points
    score += Math.min(length * 3, 50)
    
    // Character variety
    if (/[A-Z]/.test(pwd)) score += 10
    if (/[a-z]/.test(pwd)) score += 10
    if (/[0-9]/.test(pwd)) score += 10
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15
    
    // Bonus for length
    if (length >= 16) score += 5
    if (length >= 20) score += 5
    
    return Math.min(score, 100)
  }

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return 'Very Strong'
    if (score >= 60) return 'Strong'
    if (score >= 40) return 'Medium'
    if (score >= 20) return 'Weak'
    return 'Very Weak'
  }

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    if (score >= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  const strength = calculateStrength(password)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Random Password Generator</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate strong, secure passwords with customizable options. Create multiple passwords and choose the best one.
            </p>
          </motion.div>
        </div>

        {/* Generator Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice6 className="h-5 w-5" />
              Generator Options
            </CardTitle>
            <CardDescription>
              Configure your password generation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Length */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Password Length: {passwordLength[0]} characters
              </Label>
              <Slider
                value={passwordLength}
                onValueChange={setPasswordLength}
                max={64}
                min={4}
                step={1}
                className="w-full"
              />
            </div>

            {/* Character Types */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Character Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={setIncludeUppercase}
                  />
                  <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={setIncludeLowercase}
                  />
                  <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                  />
                  <Label htmlFor="numbers">Numbers (0-9)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={setIncludeSymbols}
                  />
                  <Label htmlFor="symbols">Symbols (!@#$%)</Label>
                </div>
              </div>
            </div>

            {/* Exclusion Options */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Exclusion Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exclude-similar"
                    checked={excludeSimilar}
                    onCheckedChange={setExcludeSimilar}
                  />
                  <Label htmlFor="exclude-similar">Exclude similar (i, l, 1, L, o, 0, O)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exclude-ambiguous"
                    checked={excludeAmbiguous}
                    onCheckedChange={setExcludeAmbiguous}
                  />
                  <Label htmlFor="exclude-ambiguous">Exclude ambiguous ({'{', '[', '(', ')', ']', '}', '/', '\\', "'", '"', '`', '~', ',', ';', '.', '<', '>'})</Label>
                </div>
              </div>
            </div>

            {/* Generate Buttons */}
            <div className="flex gap-2">
              <Button onClick={generatePassword} size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Password
              </Button>
              <Button onClick={generateMultiplePasswords} variant="outline" size="lg">
                <Dice6 className="h-4 w-4 mr-2" />
                Generate 5 Passwords
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Password */}
        {password && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Generated Password
              </CardTitle>
              <CardDescription>
                Your secure password is ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  readOnly
                  className="pr-20 font-mono text-lg"
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(password)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <Badge variant="secondary">
                    <Hash className="h-3 w-3 mr-1" />
                    {password.length} chars
                  </Badge>
                  <Badge variant={strength >= 60 ? "default" : "destructive"}>
                    {getStrengthLabel(strength)}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleDownload} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password History */}
        {passwordHistory.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Password History
              </CardTitle>
              <CardDescription>
                Recently generated passwords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    {passwordHistory.length} password{passwordHistory.length !== 1 ? 's' : ''} generated
                  </span>
                  <Button onClick={handleCopyAll} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
                
                {passwordHistory.map((pwd, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono text-sm flex-1">
                      {showPassword ? pwd : '•'.repeat(pwd.length)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {pwd.length} chars
                      </Badge>
                      <Button 
                        onClick={() => handleCopy(pwd)} 
                        variant="ghost" 
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Password Security Tips
            </CardTitle>
            <CardDescription>
              Best practices for password security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Use Strong Passwords</h4>
                <p className="text-sm text-muted-foreground">
                  Generate passwords with at least 12 characters including uppercase, lowercase, numbers, and symbols.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Unique Passwords</h4>
                <p className="text-sm text-muted-foreground">
                  Use a different password for each account to prevent security breaches.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Password Managers</h4>
                <p className="text-sm text-muted-foreground">
                  Consider using a password manager to securely store and manage your passwords.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA wherever possible for an additional layer of security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}