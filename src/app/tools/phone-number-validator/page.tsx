'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, Phone, AlertCircle, Globe } from 'lucide-react'
import { useCopyToClipboard } from 'react-use'

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', prefix: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', prefix: '+44' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', prefix: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', prefix: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', prefix: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', prefix: '+34' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', prefix: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', prefix: '+61' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', prefix: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', prefix: '+86' },
  { code: 'IN', name: 'India', flag: '🇮🇳', prefix: '+91' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', prefix: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', prefix: '+52' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', prefix: '+7' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', prefix: '+82' }
]

export default function PhoneNumberValidator() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [country, setCountry] = useState('US')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [validationDetails, setValidationDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, copy] = useCopyToClipboard()

  const validatePhoneNumber = async () => {
    if (!phoneNumber.trim()) return

    setLoading(true)
    try {
      // Call server-side API for phone number validation
      const response = await fetch('/api/validators/phone-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          country
        })
      })

      if (!response.ok) {
        throw new Error('Failed to validate phone number')
      }

      const data = await response.json()
      setIsValid(data.isValid)
      setValidationDetails(data.details)
    } catch (error) {
      console.error('Error validating phone number:', error)
      // Fallback to client-side validation if API fails
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      const selectedCountry = countries.find(c => c.code === country)
      const isValid = cleanNumber.length >= 10 && cleanNumber.length <= 15
      
      setIsValid(isValid)
      setValidationDetails({
        format: isValid ? 'valid' : 'invalid',
        country: selectedCountry?.name || 'Unknown',
        countryCode: selectedCountry?.code || 'Unknown',
        type: cleanNumber.length > 10 ? 'mobile' : 'landline',
        suggestion: isValid ? null : 'Please enter a valid phone number'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (value: string, countryCode: string) => {
    const cleanValue = value.replace(/\D/g, '')
    const selectedCountry = countries.find(c => c.code === countryCode)
    
    if (!selectedCountry) return cleanValue

    // Basic formatting based on country
    switch (countryCode) {
      case 'US':
      case 'CA':
        if (cleanValue.length <= 3) return cleanValue
        if (cleanValue.length <= 6) return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3)}`
        return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}`
      case 'GB':
        if (cleanValue.length <= 4) return cleanValue
        if (cleanValue.length <= 7) return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`
        return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4, 7)} ${cleanValue.slice(7, 11)}`
      default:
        return cleanValue
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Remove non-digits
    const formatted = formatPhoneNumber(value, country)
    setPhoneNumber(formatted)
  }

  const selectedCountry = countries.find(c => c.code === country)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Phone Number Validator
          </CardTitle>
          <CardDescription>
            Validate phone numbers and check their format and country
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-muted-foreground text-sm">({country.prefix})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCountry?.prefix}
                </span>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && validatePhoneNumber()}
                  className="text-lg font-mono"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={validatePhoneNumber} 
            disabled={!phoneNumber.trim() || loading}
            className="w-full"
          >
            {loading ? 'Validating...' : 'Validate Phone Number'}
          </Button>

          {isValid !== null && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getValidationIcon()}
                    <div>
                      <h3 className="text-lg font-semibold">Validation Result</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedCountry?.prefix} {phoneNumber}
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

                      <div>
                        <Label className="text-sm font-medium">Country</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{validationDetails.country || 'Unknown'}</span>
                        </div>
                      </div>

                      {validationDetails.type && (
                        <div>
                          <Label className="text-sm font-medium">Type</Label>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {validationDetails.type}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {validationDetails.operator && (
                        <div>
                          <Label className="text-sm font-medium">Operator</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {validationDetails.operator}
                          </p>
                        </div>
                      )}

                      {validationDetails.region && (
                        <div>
                          <Label className="text-sm font-medium">Region</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {validationDetails.region}
                          </p>
                        </div>
                      )}

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
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${selectedCountry?.prefix} ${phoneNumber}`)}
                  >
                    Copy Number
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhoneNumber('')
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
          <CardTitle>Phone Number Validation Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Supported Countries</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• United States/Canada (+1)</li>
                <li>• United Kingdom (+44)</li>
                <li>• Germany (+49)</li>
                <li>• France (+33)</li>
                <li>• Italy (+39)</li>
                <li>• Spain (+34)</li>
                <li>• Australia (+61)</li>
                <li>• Japan (+81)</li>
                <li>• And many more...</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Validation Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Format validation</li>
                <li>• Country code detection</li>
                <li>• Mobile/Landline identification</li>
                <li>• Operator detection</li>
                <li>• Geographic location</li>
                <li>• Number type verification</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Privacy Note:</strong> This tool only validates the format of phone numbers. 
              No actual phone calls or messages are sent, and no data is stored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}