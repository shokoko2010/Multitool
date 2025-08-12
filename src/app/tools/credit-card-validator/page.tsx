'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, CreditCard, AlertCircle } from 'lucide-react'
import { useCopyToClipboard } from 'react-use'

export default function CreditCardValidator() {
  const [cardNumber, setCardNumber] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [validationDetails, setValidationDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, copy] = useCopyToClipboard()

  const validateCreditCard = async () => {
    if (!cardNumber.trim()) return

    setLoading(true)
    try {
      // Call server-side API for credit card validation
      const response = await fetch('/api/validators/credit-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, '')
        })
      })

      if (!response.ok) {
        throw new Error('Failed to validate credit card')
      }

      const data = await response.json()
      setIsValid(data.isValid)
      setValidationDetails(data.details)
    } catch (error) {
      console.error('Error validating credit card:', error)
      // Fallback to client-side validation if API fails
      const cleanNumber = cardNumber.replace(/\s/g, '')
      const isValid = luhnCheck(cleanNumber)
      const cardType = getCardType(cleanNumber)
      
      setIsValid(isValid)
      setValidationDetails({
        cardType,
        format: isValid ? 'valid' : 'invalid',
        length: cleanNumber.length,
        suggestion: isValid ? null : 'Invalid credit card number'
      })
    } finally {
      setLoading(false)
    }
  }

  const luhnCheck = (cardNumber: string): boolean => {
    let sum = 0
    let isEven = false
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  const getCardType = (cardNumber: string): string => {
    const firstDigit = cardNumber[0]
    const firstTwoDigits = cardNumber.substring(0, 2)
    
    if (firstDigit === '4') return 'Visa'
    if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'Mastercard'
    if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'American Express'
    if (firstTwoDigits === '65') return 'Discover'
    if (firstTwoDigits === '35') return 'JCB'
    if (firstTwoDigits === '30' || firstTwoDigits === '36' || firstTwoDigits === '38') return 'Diners Club'
    
    return 'Unknown'
  }

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s/g, '')
    const formattedValue = cleanValue.replace(/(.{4})/g, '$1 ').trim()
    return formattedValue
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
    const formatted = formatCardNumber(value)
    setCardNumber(formatted)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Credit Card Validator
          </CardTitle>
          <CardDescription>
            Validate credit card numbers and check their format and issuer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Credit Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && validateCreditCard()}
                className="text-lg font-mono"
                maxLength={19}
              />
            </div>

            <Button 
              onClick={validateCreditCard} 
              disabled={!cardNumber.trim() || loading}
              className="w-full"
            >
              {loading ? 'Validating...' : 'Validate Credit Card'}
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
                      <p className="text-sm text-muted-foreground font-mono">
                        {cardNumber}
                      </p>
                    </div>
                  </div>
                  {getValidationBadge()}
                </div>

                {validationDetails && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Card Type</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {validationDetails.cardType || 'Unknown'}
                          </Badge>
                        </div>
                      </div>

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

                      {validationDetails.length && (
                        <div>
                          <Label className="text-sm font-medium">Length</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {validationDetails.length} digits
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {validationDetails.issuer && (
                        <div>
                          <Label className="text-sm font-medium">Issuer</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {validationDetails.issuer}
                          </p>
                        </div>
                      )}

                      {validationDetails.country && (
                        <div>
                          <Label className="text-sm font-medium">Country</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {validationDetails.country}
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
                    onClick={() => copyToClipboard(cardNumber)}
                  >
                    Copy Number
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCardNumber('')
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
          <CardTitle>Credit Card Validation Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Supported Card Types</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Visa (starts with 4)</li>
                <li>• Mastercard (51-55)</li>
                <li>• American Express (34, 37)</li>
                <li>• Discover (65)</li>
                <li>• JCB (35)</li>
                <li>• Diners Club (30, 36, 38)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Validation Methods</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Luhn algorithm check</li>
                <li>• Card prefix validation</li>
                <li>• Length validation</li>
                <li>• Format validation</li>
                <li>• Issuer identification</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Security Note:</strong> This tool only validates the format of credit card numbers. 
              No actual card data is stored or transmitted to external services.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}