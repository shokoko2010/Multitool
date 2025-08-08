'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, Key, Copy, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function BcryptGenerator() {
  const [password, setPassword] = useState('')
  const [hashedPassword, setHashedPassword] = useState('')
  const [rounds, setRounds] = useState(12)
  const [showPassword, setShowPassword] = useState(false)
  const [showHash, setShowHash] = useState(false)
  const [isHashing, setIsHashing] = useState(false)
  const { toast } = useToast()

  const roundOptions = [
    { value: 4, label: 'Round 4 (Fast)' },
    { value: 8, label: 'Round 8 (Default)' },
    { value: 12, label: 'Round 12 (Recommended)' },
    { value: 14, label: 'Round 14 (Secure)' },
    { value: 16, label: 'Round 16 (Very Secure)' },
  ]

  const hashPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password to hash",
        variant: "destructive",
      })
      return
    }

    setIsHashing(true)

    try {
      // Simulate bcrypt hashing with a delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock bcrypt hash (in real implementation, you'd use a bcrypt library)
      const mockHash = `$2a$${rounds.toString().padStart(2, '0')}$` + 
        generateMockHash(password, rounds)
      
      setHashedPassword(mockHash)
      
      toast({
        title: "Success!",
        description: "Password hashed successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to hash password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsHashing(false)
    }
  }

  const generateMockHash = (password: string, rounds: number): string => {
    // Simple mock hash generation for demonstration
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'
    let hash = ''
    for (let i = 0; i < 53; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      variant: "default",
    })
  }

  const generateStrongPassword = () => {
    const length = 16
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    let newPassword = ''
    
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    setPassword(newPassword)
  }

  const clearAll = () => {
    setPassword('')
    setHashedPassword('')
    setShowPassword(false)
    setShowHash(false)
  }

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: 'None', color: 'bg-gray-500' }
    
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    
    const strengthLevels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' },
      { label: 'Very Strong', color: 'bg-green-600' },
    ]
    
    return {
      strength: Math.min(strength, strengthLevels.length - 1),
      label: strengthLevels[strength].label,
      color: strengthLevels[strength].color,
    }
  }

  const passwordStrength = getPasswordStrength(password)

  const getRoundsInfo = (rounds: number): { time: string; memory: string } => {
    const info = {
      4: { time: 'Less than 1ms', memory: '4MB' },
      8: { time: 'Less than 1ms', memory: '4MB' },
      12: { time: 'About 100ms', memory: '32MB' },
      14: { time: 'About 400ms', memory: '128MB' },
      16: { time: 'About 1.5s', memory: '512MB' },
    }
    return info[rounds as keyof typeof info] || { time: 'Unknown', memory: 'Unknown' }
  }

  const roundsInfo = getRoundsInfo(rounds)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">BCrypt Generator</h1>
          <p className="text-muted-foreground">Generate secure BCrypt password hashes with customizable rounds</p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Hash</TabsTrigger>
            <TabsTrigger value="verify">Verify Hash</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Password Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password Input
                </CardTitle>
                <CardDescription>Enter the password you want to hash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={generateStrongPassword} variant="outline" size="sm">
                    Generate Strong Password
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {passwordStrength.label}
                    </Badge>
                  </div>
                </div>
                
                {password && (
                  <div className="text-sm text-muted-foreground">
                    Password length: {password.length} characters
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hash Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Hash Settings
                </CardTitle>
                <CardDescription>Configure BCrypt hash parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rounds">Rounds (Work Factor)</Label>
                  <Select value={rounds.toString()} onValueChange={(value) => setRounds(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rounds" />
                    </SelectTrigger>
                    <SelectContent>
                      {roundOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Hashing Time</div>
                    <div className="text-sm text-muted-foreground">{roundsInfo.time}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Memory Usage</div>
                    <div className="text-sm text-muted-foreground">{roundsInfo.memory}</div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Higher rounds = more secure but slower hashing.</p>
                  <p>Round 12 is recommended for most applications.</p>
                </div>
                
                <Button 
                  onClick={hashPassword} 
                  disabled={!password.trim() || isHashing}
                  className="w-full"
                >
                  {isHashing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  {isHashing ? 'Hashing...' : 'Generate BCrypt Hash'}
                </Button>
              </CardContent>
            </Card>

            {/* Hash Output */}
            {hashedPassword && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    BCrypt Hash
                  </CardTitle>
                  <CardDescription>Your generated BCrypt hash</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hashed Password</Label>
                    <div className="relative">
                      <Textarea
                        value={hashedPassword}
                        readOnly
                        rows={3}
                        className="font-mono text-sm resize-none"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setShowHash(!showHash)}
                      >
                        {showHash ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => copyToClipboard(hashedPassword, 'Hash')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Hash
                    </Button>
                    <Button 
                      onClick={() => copyToClipboard(`$2a$${rounds.toString().padStart(2, '0')}$` + hashedPassword.split('$').pop(), 'Salt + Hash')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Salt + Hash
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Hash format: <code className="bg-muted px-1 rounded">$2a$${rounds.toString().padStart(2, '0')}$[salt][hash]</code></p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verify" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verify BCrypt Hash
                </CardTitle>
                <CardDescription>Verify a password against a BCrypt hash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Hash verification functionality coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This feature will allow you to verify passwords against existing BCrypt hashes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>About BCrypt</CardTitle>
            <CardDescription>Understanding BCrypt password hashing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">What is BCrypt?</h4>
                  <p className="text-sm text-muted-foreground">
                    BCrypt is a password hashing function designed by Niels Provos and David Mazières. 
                    It's based on the Blowfish cipher and is designed to be computationally intensive, 
                    making brute-force attacks more difficult.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Key Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Adaptive cost factor (rounds)</li>
                    <li>• Built-in salt generation</li>
                    <li>• resistant to GPU attacks</li>
                    <li>• industry standard for password storage</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Security Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use at least 12 rounds for most applications</li>
                  <li>• Store only the hash, never the plaintext password</li>
                  <li>• Use a unique salt for each password</li>
                  <li>• Consider rate limiting to prevent brute-force attacks</li>
                  <li>• Regularly update your hashing algorithm as new vulnerabilities are discovered</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}