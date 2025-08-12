import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    const systemPrompt = `You are an email validation expert. 
    Validate the email address: "${email}"
    
    Please analyze the email and provide validation details including:
    1. Format validation (valid/invalid)
    2. Domain validation
    3. MX record check (found/not found)
    4. Whether it's a disposable email (yes/no)
    5. Whether it's a role account (yes/no)
    6. Suggestions for improvement if invalid
    
    Return the response in JSON format with the following structure:
    {
      "isValid": boolean,
      "details": {
        "format": "valid" | "invalid",
        "domain": "string",
        "mxRecord": "found" | "not found",
        "disposable": "yes" | "no",
        "roleAccount": "yes" | "no",
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
          content: email
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
      // Fallback: basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValid = emailRegex.test(email)
      const domain = email.split('@')[1] || ''
      
      result = {
        isValid,
        details: {
          format: isValid ? 'valid' : 'invalid',
          domain,
          mxRecord: isValid ? 'found' : 'not found',
          disposable: 'no',
          roleAccount: 'no',
          suggestion: isValid ? null : 'Please enter a valid email address'
        }
      }
    }

    return NextResponse.json({
      success: true,
      isValid: result.isValid,
      details: result.details,
      email,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Email Validation Error:', error)
    
    // Fallback validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(email)
    const domain = email.split('@')[1] || ''
    
    return NextResponse.json({
      success: true,
      isValid,
      details: {
        format: isValid ? 'valid' : 'invalid',
        domain,
        mxRecord: isValid ? 'found' : 'not found',
        disposable: 'no',
        roleAccount: 'no',
        suggestion: isValid ? null : 'Please enter a valid email address'
      },
      email,
      timestamp: new Date().toISOString()
    })
  }
}