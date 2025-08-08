'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Copy, RefreshCw, Shield, Key } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PasswordGeneratorTool() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(12)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const { toast } = useToast()

  const getCharacterSets = () => {
    let chars = ''
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (excludeAmbiguous) {
      symbols = symbols.replace(/[Il1O0]/g, '')
    }

    if (includeUppercase) {
      let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (excludeSimilar) {
        uppercase = uppercase.replace(/[IO]/g, '')
      }
      if (excludeAmbiguous) {
        uppercase = uppercase.replace(/[S5]/g, '')
      }
      chars += uppercase
    }
    
    if (includeLowercase) {
      let lowercase = 'abcdefghijklmnopqrstuvwxyz'
      if (excludeSimilar) {
        lowercase = lowercase.replace(/[l1]/g, '')
      }
      if (excludeAmbiguous) {
        lowercase = lowercase.replace(/[s5]/g, '')
      }
      chars += lowercase
    }
    
    if (includeNumbers) {
      let numbers = '0123456789'
      if (excludeSimilar) {
        numbers = numbers.replace(/[01]/g, '')
      }
      chars += numbers
    }
    
    if (includeSymbols) {
      chars += symbols
    }
    
    return chars
  }

  const generatePassword = () => {
    const chars = getCharacterSets()
    
    if (chars.length === 0) {
      toast({
        title: "Invalid Configuration",
        description: "Please select at least one character type",
        variant: "destructive",
      })
      return
    }

    let result = ''
    const cryptoObj = window.crypto || (window as any).msCrypto
    const buffer = new Uint32Array(length)
    
    cryptoObj.getRandomValues(buffer)
    
    for (let i = 0; i < length; i++) {
      result += chars[buffer[i] % chars.length]
    }
    
    setPassword(result)
  }

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      })
    }
  }

  const getPasswordStrength = () => {
    if (!password) return 0
    
    let strength = 0
    
    // Length contribution
    strength += Math.min(password.length / 4, 8)
    
    // Character variety
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)
    
    const varietyCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length
    strength += varietyCount * 2
    
    // Entropy bonus
    if (password.length >= 16) strength += 2
    if (password.length >= 20) strength += 2
    
    return Math.min(strength, 10)
  }

  const getStrengthLabel = (strength: number) => {
    if (strength <= 2) return { label: 'Very Weak', color: 'text-red-500' }
    if (strength <= 4) return { label: 'Weak', color: 'text-orange-500' }
    if (strength <= 6) return { label: 'Medium', color: 'text-yellow-500' }
    if (strength <= 8) return { label: 'Strong', color: 'text-green-500' }
    return { label: 'Very Strong', color: 'text-green-600' }
  }

  const strength = getPasswordStrength()
  const strengthInfo = getStrengthLabel(strength)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Password Generator</h1>
        <p className="text-muted-foreground">
          Generate strong, secure passwords with customizable options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Generated Password
            </CardTitle>
            <CardDescription>
              Your secure password will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="relative">
                <Input
                  value={password}
                  readOnly
                  className="font-mono text-lg pr-12"
                  placeholder="Click 'Generate Password' to create a password"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={copyToClipboard}
                  disabled={!password}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Password Strength</Label>
                  <span className={`font-semibold ${strengthInfo.color}`}>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      strength <= 2 ? 'bg-red-500' :
                      strength <= 4 ? 'bg-orange-500' :
                      strength <= 6 ? 'bg-yellow-500' :
                      strength <= 8 ? 'bg-green-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${(strength / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={generatePassword} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Password
              </Button>
              <Button onClick={copyToClipboard} variant="outline" disabled={!password}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Customize your password requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Password Length: {length}</Label>
              <Slider
                value={[length]}
                onValueChange={(value) => setLength(value[0])}
                max={50}
                min={6}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6</span>
                <span>50</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Character Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
                  />
                  <label htmlFor="uppercase" className="text-sm">
                    Include Uppercase Letters (A-Z)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
                  />
                  <label htmlFor="lowercase" className="text-sm">
                    Include Lowercase Letters (a-z)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
                  />
                  <label htmlFor="numbers" className="text-sm">
                    Include Numbers (0-9)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
                  />
                  <label htmlFor="symbols" className="text-sm">
                    Include Symbols (!@#$%^&*)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Exclude Characters</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exclude-similar"
                    checked={excludeSimilar}
                    onCheckedChange={(checked) => setExcludeSimilar(checked as boolean)}
                  />
                  <label htmlFor="exclude-similar" className="text-sm">
                    Exclude Similar Characters (i, l, 1, L, o, 0, O)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exclude-ambiguous"
                    checked={excludeAmbiguous}
                    onCheckedChange={(checked) => setExcludeAmbiguous(checked as boolean)}
                  />
                  <label htmlFor="exclude-ambiguous" className="text-sm">
                    Exclude Ambiguous Characters ({`,`, `.`, `'`, `"`, `;`, `:`, `[`, `]`, `{`, `}`, `|`, `\\`, `/`, `<`, `>`, `?`, `=`, `+`, `-`, `_`, `(`, `)`})
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Password Security Tips</CardTitle>
          <CardDescription>
            Best practices for creating and managing strong passwords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Use Long Passwords', description: 'Aim for at least 12-16 characters for better security' },
              { title: 'Mix Character Types', description: 'Combine uppercase, lowercase, numbers, and symbols' },
              { title: 'Avoid Personal Information', description: 'Don\'t use names, birthdays, or other personal data' },
              { title: 'Unique Passwords', description: 'Use different passwords for each account' },
              { title: 'Password Manager', description: 'Consider using a password manager to generate and store passwords' },
              { title: 'Regular Updates', description: 'Change important passwords periodically' }
            ].map((tip, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <div className="font-semibold">{tip.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{tip.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}