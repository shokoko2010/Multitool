import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: Request) {
  try {
    const { cardNumber } = await request.json()

    if (!cardNumber) {
      return NextResponse.json(
        { error: 'Card number is required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    const systemPrompt = `You are a credit card validation expert. 
    Validate the credit card number: "${cardNumber}"
    
    Please analyze the card number and provide validation details including:
    1. Luhn algorithm validation (valid/invalid)
    2. Card type (Visa, Mastercard, American Express, etc.)
    3. Card issuer information
    4. Country of origin if applicable
    5. Length validation
    6. Suggestions for improvement if invalid
    
    Use only the Luhn algorithm for validation - do not make actual API calls to payment processors.
    Return the response in JSON format with the following structure:
    {
      "isValid": boolean,
      "details": {
        "cardType": "string",
        "issuer": "string",
        "country": "string",
        "format": "valid" | "invalid",
        "length": number,
        "suggestion": "string or null"
      }
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: cardNumber
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    })

    let result
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      result = JSON.parse(content)
    } catch (parseError) {
      // Fallback: basic credit card validation
      const isValid = luhnCheck(cardNumber)
      const cardType = getCardType(cardNumber)
      
      result = {
        isValid,
        details: {
          cardType,
          issuer: cardType,
          country: 'Unknown',
          format: isValid ? 'valid' : 'invalid',
          length: cardNumber.length,
          suggestion: isValid ? null : 'Invalid credit card number'
        }
      }
    }

    return NextResponse.json({
      success: true,
      isValid: result.isValid,
      details: result.details,
      cardNumber,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Credit Card Validation Error:', error)
    
    // Fallback validation
    const isValid = luhnCheck(cardNumber)
    const cardType = getCardType(cardNumber)
    
    return NextResponse.json({
      success: true,
      isValid,
      details: {
        cardType,
        issuer: cardType,
        country: 'Unknown',
        format: isValid ? 'valid' : 'invalid',
        length: cardNumber.length,
        suggestion: isValid ? null : 'Invalid credit card number'
      },
      cardNumber,
      timestamp: new Date().toISOString()
    })
  }
}

// Luhn algorithm implementation
function luhnCheck(cardNumber: string): boolean {
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

// Card type detection
function getCardType(cardNumber: string): string {
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