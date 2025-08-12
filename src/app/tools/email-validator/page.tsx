'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react'
import { useCopyToClipboard } from 'react-use'

export default function EmailValidator() {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [validationDetails, setValidationDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, copy] = useCopyToClipboard()

  const validateEmail = async () => {
    if (!email.trim()) return

    setLoading(true)
    try {
      // Call server-side API for email validation
      const response = await fetch('/api/validators/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to validate email')
      }

      const data = await response.json()
      setIsValid(data.isValid)
      setValidationDetails(data.details)
    } catch (error) {
      console.error('Error validating email:', error)
      // Fallback to client-side validation if API fails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const valid = emailRegex.test(email.trim())
      setIsValid(valid)
      setValidationDetails({
        format: valid ? 'valid' : 'invalid',
        domain: email.split('@')[1] || '',
        suggestion: valid ? null : 'Please enter a valid email address'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    copy(text)
  }

  const getValidationIcon = () => {
    if (isValid === null) return null
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getValidationBadge = () => {
    if (isValid === null) return null
    return isValid ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Valid
      </Badge>
    ) : (
      <Badge variant="destructive">
        Invalid
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Email Validator
          </CardTitle>
          <CardDescription>
            Validate email addresses and check their format and domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address to validate"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && validateEmail()}
                className="text-lg"
              />
            </div>

            <Button 
              onClick={validateEmail} 
              disabled={!email.trim() || loading}
              className="w-full"
            >
              {loading ? 'Validating...' : 'Validate Email'}
            </Button>
          </div>

          {isValid !== null && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getValidationIcon()}
                    <div>
                      <h3 className="text-lg font-semibold">Validation Result</h3>
                      <p className="text-sm text-muted-foreground">
                        {email}
                      </p>
                    </div>
                  </div>
                  {getValidationBadge()}
                </div>

                {validationDetails && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Format</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {validationDetails.format === 'valid' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm capitalize">{validationDetails.format}</span>
                        </div>
                      </div>

                      {validationDetails.domain && (
                        <div>
                          <Label className="text-sm font-medium">Domain</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {validationDetails.domain}
                          </p>
                        </div>
                      )}

                      {validationDetails.mxRecord && (
                        <div>
                          <Label className="text-sm font-medium">MX Record</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {validationDetails.mxRecord === 'found' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm capitalize">{validationDetails.mxRecord}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {validationDetails.suggestion && (
                        <div>
                          <Label className="text-sm font-medium">Suggestion</Label>
                          <div className="flex items-start gap-2 mt-1">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {validationDetails.suggestion}
                            </p>
                          </div>
                        </div>
                      )}

                      {validationDetails.disposable && (
                        <div>
                          <Label className="text-sm font-medium">Disposable Email</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {validationDetails.disposable === 'yes' ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm capitalize">{validationDetails.disposable}</span>
                          </div>
                        </div>
                      )}

                      {validationDetails.roleAccount && (
                        <div>
                          <Label className="text-sm font-medium">Role Account</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {validationDetails.roleAccount === 'yes' ? (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm capitalize">{validationDetails.roleAccount}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(email)}
                  >
                    Copy Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmail('')
                      setIsValid(null)
                      setValidationDetails(null)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email Validation Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Valid Email Format</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Must contain @ symbol</li>
                <li>• Local part before @</li>
                <li>• Domain name after @</li>
                <li>• Valid domain extension</li>
                <li>• No special characters except . _ % + -</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Common Issues</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Missing @ symbol</li>
                <li>• Invalid domain name</li>
                <li>• Spaces in email</li>
                <li>• Special characters</li>
                <li>• Missing domain extension</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}