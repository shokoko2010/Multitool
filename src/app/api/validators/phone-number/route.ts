import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: Request) {
  try {
    const { phoneNumber, country = 'US' } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    const systemPrompt = `You are a phone number validation expert. 
    Validate the phone number: "${phoneNumber}" for country: "${country}"
    
    Please analyze the phone number and provide validation details including:
    1. Format validation (valid/invalid)
    2. Country verification
    3. Phone type (mobile/landline)
    4. Operator detection if possible
    5. Geographic region if applicable
    6. Suggestions for improvement if invalid
    
    Return the response in JSON format with the following structure:
    {
      "isValid": boolean,
      "details": {
        "format": "valid" | "invalid",
        "country": "string",
        "countryCode": "string",
        "type": "mobile" | "landline" | "unknown",
        "operator": "string or null",
        "region": "string or null",
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
          content: `Phone Number: ${phoneNumber}, Country: ${country}`
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
      // Fallback: basic phone number validation
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      const isValid = cleanNumber.length >= 10 && cleanNumber.length <= 15
      
      const countryInfo: Record<string, { name: string; type: string }> = {
        'US': { name: 'United States', type: 'mobile' },
        'GB': { name: 'United Kingdom', type: 'mobile' },
        'DE': { name: 'Germany', type: 'mobile' },
        'FR': { name: 'France', type: 'mobile' },
        'IT': { name: 'Italy', type: 'mobile' },
        'ES': { name: 'Spain', type: 'mobile' },
        'CA': { name: 'Canada', type: 'mobile' },
        'AU': { name: 'Australia', type: 'mobile' }
      }
      
      const countryData = countryInfo[country] || { name: 'Unknown', type: 'unknown' }
      
      result = {
        isValid,
        details: {
          format: isValid ? 'valid' : 'invalid',
          country: countryData.name,
          countryCode: country,
          type: countryData.type,
          operator: null,
          region: null,
          suggestion: isValid ? null : 'Please enter a valid phone number'
        }
      }
    }

    return NextResponse.json({
      success: true,
      isValid: result.isValid,
      details: result.details,
      phoneNumber,
      country,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Phone Number Validation Error:', error)
    
    // Fallback validation
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    const isValid = cleanNumber.length >= 10 && cleanNumber.length <= 15
    
    return NextResponse.json({
      success: true,
      isValid,
      details: {
        format: isValid ? 'valid' : 'invalid',
        country: 'Unknown',
        countryCode: country,
        type: 'unknown',
        operator: null,
        region: null,
        suggestion: isValid ? null : 'Please enter a valid phone number'
      },
      phoneNumber,
      country,
      timestamp: new Date().toISOString()
    })
  }
}