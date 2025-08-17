'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Copy, Download, Lock, RotateCcw, RefreshCw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function PasswordGenerator() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState([16])
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })
  const [strength, setStrength] = useState(0)
  const [strengthLabel, setStrengthLabel] = useState('')
  
  const { trackUsage } = useToolAccess('password-generator')

  const generatePassword = async () => {
    try {
      // Track usage before generating
      await trackUsage()

      const {
        uppercase,
        lowercase,
        numbers,
        symbols,
        excludeSimilar,
        excludeAmbiguous
      } = options

      // Build character set
      let charset = ''
      if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
      if (numbers) charset += '0123456789'
      if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

      // Remove similar characters if requested
      if (excludeSimilar) {
        charset = charset.replace(/[ilLI|`oO0]/g, '')
      }

      // Remove ambiguous characters if requested
      if (excludeAmbiguous) {
        charset = charset.replace(/[{}()[\]\\|;:'"<>,./?`~]/g, '')
      }

      if (charset.length === 0) {
        throw new Error('Please select at least one character type')
      }

      // Generate password
      let result = ''
      const array = new Uint32Array(length[0])
      crypto.getRandomValues(array)
      
      for (let i = 0; i < length[0]; i++) {
        result += charset[array[i] % charset.length]
      }

      setPassword(result)
      calculateStrength(result)
    } catch (err) {
      setPassword('')
      setStrength(0)
      setStrengthLabel('')
    }
  }

  const calculateStrength = (pwd: string) => {
    let score = 0
    
    // Length contributes to score
    score += Math.min(pwd.length * 4, 40)
    
    // Character variety
    if (/[a-z]/.test(pwd)) score += 10
    if (/[A-Z]/.test(pwd)) score += 10
    if (/[0-9]/.test(pwd)) score += 10
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15
    
    // Bonus for length
    if (pwd.length >= 12) score += 10
    if (pwd.length >= 16) score += 10
    
    // Cap at 100
    score = Math.min(score, 100)
    
    setStrength(score)
    
    if (score < 30) setStrengthLabel('Weak')
    else if (score < 60) setStrengthLabel('Fair')
    else if (score < 80) setStrengthLabel('Good')
    else setStrengthLabel('Strong')
  }

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password)
    }
  }

  const downloadResult = () => {
    if (password) {
      const blob = new Blob([password], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'generated-password.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setPassword('')
    setStrength(0)
    setStrengthLabel('')
  }

  const getStrengthColor = () => {
    if (strength < 30) return 'bg-red-500'
    if (strength < 60) return 'bg-yellow-500'
    if (strength < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <ToolLayout
      toolId="password-generator"
      toolName="Password Generator"
      toolDescription="Generate strong, secure passwords"
      toolCategory="Security Tools"
      toolIcon={<Lock className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Password Settings</CardTitle>
            <CardDescription>
              Configure your password requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Length Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Password Length</Label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {length[0]} characters
                </span>
              </div>
              <Slider
                value={length}
                onValueChange={setLength}
                max={64}
                min={4}
                step={1}
                className="w-full"
              />
            </div>

            {/* Character Options */}
            <div className="space-y-4">
              <Label>Character Types</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase" className="text-sm">Uppercase Letters (A-Z)</Label>
                  <Switch
                    id="uppercase"
                    checked={options.uppercase}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, uppercase: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowercase" className="text-sm">Lowercase Letters (a-z)</Label>
                  <Switch
                    id="lowercase"
                    checked={options.lowercase}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, lowercase: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
                  <Switch
                    id="numbers"
                    checked={options.numbers}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, numbers: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="symbols" className="text-sm">Symbols (!@#$%^&*)</Label>
                  <Switch
                    id="symbols"
                    checked={options.symbols}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, symbols: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <Label>Advanced Options</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="exclude-similar" className="text-sm">Exclude Similar (i, l, 1, L, o, 0, O)</Label>
                  <Switch
                    id="exclude-similar"
                    checked={options.excludeSimilar}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, excludeSimilar: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="exclude-ambiguous" className="text-sm">Exclude Ambiguous ([{(})]:;"'"\\)</Label>
                  <Switch
                    id="exclude-ambiguous"
                    checked={options.excludeAmbiguous}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, excludeAmbiguous: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Password */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Password</CardTitle>
            <CardDescription>
              Your secure password will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  value={password}
                  readOnly
                  placeholder="Click generate to create password..."
                  className="font-mono text-sm pr-20"
                />
                {password && (
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadResult}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Password Strength</Label>
                  <Badge 
                    variant="outline" 
                    className={
                      strength < 30 ? 'text-red-600 border-red-200' :
                      strength < 60 ? 'text-yellow-600 border-yellow-200' :
                      strength < 80 ? 'text-blue-600 border-blue-200' :
                      'text-green-600 border-green-200'
                    }
                  >
                    {strengthLabel}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={generatePassword}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Password
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Password Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🔒 Best Practices</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use at least 12 characters</li>
                <li>• Mix uppercase, lowercase, numbers, symbols</li>
                <li>• Avoid common words and patterns</li>
                <li>• Use unique passwords for each account</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🛡️ Security Notes</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Never share your passwords</li>
                <li>• Change passwords regularly</li>
                <li>• Use a password manager</li>
                <li>• Enable two-factor authentication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}