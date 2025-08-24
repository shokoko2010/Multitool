'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, RefreshCw, Shield, Key } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PasswordGeneratorTool() {
  const [password, setPassword] = useState('')
  const [passwordLength, setPasswordLength] = useState([16])
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    requireEveryCharType: false
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordHistory, setPasswordHistory] = useState<string[]>([])
  const { toast } = useToast()

  const calculatePasswordStrength = (pwd: string): number => {
    if (!pwd) return 0
    
    let strength = 0
    const length = pwd.length
    
    // Length contributes up to 50% of strength
    strength += Math.min(length * 3, 50)
    
    // Character variety contributes up to 50% of strength
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasLowercase = /[a-z]/.test(pwd)
    const hasNumbers = /[0-9]/.test(pwd)
    const hasSymbols = /[^A-Za-z0-9]/.test(pwd)
    
    const varietyCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length
    strength += varietyCount * 12.5
    
    return Math.min(strength, 100)
  }

  const generatePassword = useCallback(() => {
    const length = passwordLength[0]
    let charset = ''
    let requiredChars = ''
    
    if (options.uppercase) {
      charset += 'ABCDEFGHJKMNPQRSTUVWXYZ'
      requiredChars += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 'ABCDEFGHJKMNPQRSTUVWXYZ'.length)]
    }
    
    if (options.lowercase) {
      charset += 'abcdefghjkmnpqrstuvwxyz'
      requiredChars += 'abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 'abcdefghjkmnpqrstuvwxyz'.length)]
    }
    
    if (options.numbers) {
      charset += '23456789'
      requiredChars += '23456789'[Math.floor(Math.random() * '23456789'.length)]
    }
    
    if (options.symbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      requiredChars += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * '!@#$%^&*()_+-=[]{}|;:,.<>?'.length)]
    }
    
    if (options.excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '')
    }
    
    if (options.excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()\/\\'"`~,;.<>]/g, '')
    }
    
    if (!charset) {
      toast({
        title: "No Character Types Selected",
        description: "Please select at least one character type",
        variant: "destructive"
      })
      return
    }
    
    let generatedPassword = ''
    
    // Generate password
    for (let i = 0; i < length; i++) {
      generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    // Ensure required characters are included if requested
    if (options.requireEveryCharType && requiredChars) {
      const positions = []
      while (positions.length < requiredChars.length) {
        const pos = Math.floor(Math.random() * length)
        if (!positions.includes(pos)) {
          positions.push(pos)
        }
      }
      
      const passwordArray = generatedPassword.split('')
      positions.forEach((pos, index) => {
        passwordArray[pos] = requiredChars[index]
      })
      generatedPassword = passwordArray.join('')
    }
    
    setPassword(generatedPassword)
    const strength = calculatePasswordStrength(generatedPassword)
    setPasswordStrength(strength)
    
    // Add to history
    setPasswordHistory(prev => [generatedPassword, ...prev.slice(0, 9)])
  }, [passwordLength, options, toast])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Password has been copied to clipboard",
    })
  }

  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'text-red-600'
    if (strength < 60) return 'text-yellow-600'
    if (strength < 80) return 'text-blue-600'
    return 'text-green-600'
  }

  const getStrengthLabel = (strength: number): string => {
    if (strength < 30) return 'Very Weak'
    if (strength < 60) return 'Weak'
    if (strength < 80) return 'Good'
    if (strength < 90) return 'Strong'
    return 'Very Strong'
  }

  const getStrengthTips = (strength: number): string[] => {
    const tips = []
    
    if (strength < 30) {
      tips.push('Use at least 12 characters')
      tips.push('Include uppercase letters')
      tips.push('Include numbers')
      tips.push('Include symbols')
    } else if (strength < 60) {
      tips.push('Increase password length')
      tips.push('Add more character types')
    } else if (strength < 80) {
      tips.push('Consider using a passphrase')
      tips.push('Avoid common patterns')
    }
    
    return tips
  }

  const handleOptionChange = (optionName: keyof typeof options, checked: boolean) => {
    setOptions(prev => ({ ...prev, [optionName]: checked }))
  }

  const generateMultiplePasswords = () => {
    const passwords = []
    for (let i = 0; i < 5; i++) {
      generatePassword()
      passwords.push(password)
    }
    return passwords
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
        <CardContent>
          <div className="space-y-6">
            {/* Generated Password */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Generated Password:</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStrengthColor(passwordStrength)}>
                        {getStrengthLabel(passwordStrength)}
                      </Badge>
                      <Badge variant="outline">
                        {passwordLength[0]} characters
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={password}
                      readOnly
                      className="font-mono text-lg"
                      placeholder="Click generate to create a password"
                    />
                    <Button onClick={() => copyToClipboard(password)} disabled={!password}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button onClick={generatePassword}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {passwordStrength > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Password Strength:</span>
                        <span className={getStrengthColor(passwordStrength)}>
                          {passwordStrength.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            passwordStrength < 30 ? 'bg-red-600' :
                            passwordStrength < 60 ? 'bg-yellow-600' :
                            passwordStrength < 80 ? 'bg-blue-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      
                      {getStrengthTips(passwordStrength).length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Tips to improve: </span>
                          {getStrengthTips(passwordStrength).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Password Length: {passwordLength[0]} characters</Label>
                  <Slider
                    value={passwordLength}
                    onValueChange={setPasswordLength}
                    max={128}
                    min={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Character Types:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="uppercase"
                        checked={options.uppercase}
                        onCheckedChange={(checked) => handleOptionChange('uppercase', checked as boolean)}
                      />
                      <Label htmlFor="uppercase" className="text-sm">
                        Uppercase Letters (A-Z)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lowercase"
                        checked={options.lowercase}
                        onCheckedChange={(checked) => handleOptionChange('lowercase', checked as boolean)}
                      />
                      <Label htmlFor="lowercase" className="text-sm">
                        Lowercase Letters (a-z)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="numbers"
                        checked={options.numbers}
                        onCheckedChange={(checked) => handleOptionChange('numbers', checked as boolean)}
                      />
                      <Label htmlFor="numbers" className="text-sm">
                        Numbers (0-9)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="symbols"
                        checked={options.symbols}
                        onCheckedChange={(checked) => handleOptionChange('symbols', checked as boolean)}
                      />
                      <Label htmlFor="symbols" className="text-sm">
                        Symbols (!@#$%^&*)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Advanced Options:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude-similar"
                        checked={options.excludeSimilar}
                        onCheckedChange={(checked) => handleOptionChange('excludeSimilar', checked as boolean)}
                      />
                      <Label htmlFor="exclude-similar" className="text-sm">
                        Exclude Similar (0, O, 1, l, I)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude-ambiguous"
                        checked={options.excludeAmbiguous}
                        onCheckedChange={(checked) => handleOptionChange('excludeAmbiguous', checked as boolean)}
                      />
                      <Label htmlFor="exclude-ambiguous" className="text-sm">
                        Exclude Ambiguous Characters
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require-every"
                        checked={options.requireEveryCharType}
                        onCheckedChange={(checked) => handleOptionChange('requireEveryCharType', checked as boolean)}
                      />
                      <Label htmlFor="require-every" className="text-sm">
                        Require All Selected Types
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={generatePassword} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Password
                  </Button>
                </div>
              </div>
            </div>

            {/* Password History */}
            {passwordHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Passwords</CardTitle>
                  <CardDescription className="text-sm">
                    Click any password to copy it to clipboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {passwordHistory.map((pwd, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => copyToClipboard(pwd)}
                      >
                        <span className="font-mono text-sm">{pwd}</span>
                        <Badge variant="outline">
                          {pwd.length} chars
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Password Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Password Security Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Best Practices:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use at least 12 characters</li>
                      <li>• Mix character types</li>
                      <li>• Avoid personal information</li>
                      <li>• Use unique passwords</li>
                      <li>• Change passwords regularly</li>
                      <li>• Use a password manager</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What to Avoid:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Common words or phrases</li>
                      <li>• Personal information</li>
                      <li>• Sequential numbers</li>
                      <li>• Repeated characters</li>
                      <li>• Dictionary words</li>
                      <li>• Same password everywhere</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">How to use:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Adjust the password length using the slider</li>
                <li>• Select which character types to include</li>
                <li>• Use advanced options for additional security</li>
                <li>• Click "Generate New Password" to create a password</li>
                <li>• Copy the password to clipboard for use</li>
                <li>• View recent passwords in the history section</li>
                <li>• Follow security tips for better password practices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}