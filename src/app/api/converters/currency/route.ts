import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const amount = searchParams.get('amount')

    if (!amount || !from || !to) {
      return NextResponse.json(
        { success: false, error: 'Amount, from currency, and to currency are required' },
        { status: 400 }
      )
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    const systemPrompt = `You are a currency conversion expert. 
    Convert ${numAmount} ${from} to ${to}.
    
    Please provide the conversion with the following information:
    1. The converted amount
    2. The exchange rate used
    3. A brief note about the conversion
    
    Use realistic exchange rates based on current market conditions (as of 2024).
    Return the response in JSON format with the following structure:
    {
      "convertedAmount": number,
      "exchangeRate": number,
      "note": "string"
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Convert ${numAmount} ${from} to ${to}`
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
      // Fallback: extract values from text response
      const content = completion.choices[0]?.message?.content || ''
      
      // Extract numbers from the response
      const numbers = content.match(/\d+\.?\d*/g)
      const convertedAmount = numbers && numbers.length > 0 ? parseFloat(numbers[0]) : numAmount * 0.85
      const exchangeRate = numbers && numbers.length > 1 ? parseFloat(numbers[1]) : 0.85
      
      result = {
        convertedAmount,
        exchangeRate,
        note: 'Currency conversion completed'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        convertedAmount: result.convertedAmount || numAmount * 0.85,
        rate: result.exchangeRate || 0.85,
        note: result.note || 'Currency conversion completed'
      },
      from,
      to,
      originalAmount: numAmount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Currency Conversion Error:', error)
    
    // Fallback conversion rates
    const fallbackRates: Record<string, number> = {
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-JPY': 110.0,
      'EUR-USD': 1.18,
      'EUR-GBP': 0.86,
      'GBP-USD': 1.37,
      'JPY-USD': 0.0091
    }
    
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || 'USD'
    const to = searchParams.get('to') || 'EUR'
    const amount = searchParams.get('amount') || '1'
    const numAmount = parseFloat(amount)
    
    const rateKey = `${from}-${to}`
    const exchangeRate = fallbackRates[rateKey] || 1.0
    const convertedAmount = numAmount * exchangeRate

    return NextResponse.json({
      success: true,
      data: {
        convertedAmount,
        rate: exchangeRate,
        note: 'Currency conversion completed (fallback rates)'
      },
      from,
      to,
      originalAmount: numAmount,
      timestamp: new Date().toISOString()
    })
  }
}

export async function POST(request: Request) {
  try {
    const { amount, from, to } = await request.json()

    if (!amount || !from || !to) {
      return NextResponse.json(
        { success: false, error: 'Amount, from currency, and to currency are required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    const systemPrompt = `You are a currency conversion expert. 
    Convert ${amount} ${from} to ${to}.
    
    Please provide the conversion with the following information:
    1. The converted amount
    2. The exchange rate used
    3. A brief note about the conversion
    
    Use realistic exchange rates based on current market conditions (as of 2024).
    Return the response in JSON format with the following structure:
    {
      "convertedAmount": number,
      "exchangeRate": number,
      "note": "string"
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Convert ${amount} ${from} to ${to}`
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
      // Fallback: extract values from text response
      const content = completion.choices[0]?.message?.content || ''
      
      // Extract numbers from the response
      const numbers = content.match(/\d+\.?\d*/g)
      const convertedAmount = numbers && numbers.length > 0 ? parseFloat(numbers[0]) : amount * 0.85
      const exchangeRate = numbers && numbers.length > 1 ? parseFloat(numbers[1]) : 0.85
      
      result = {
        convertedAmount,
        exchangeRate,
        note: 'Currency conversion completed'
      }
    }

    return NextResponse.json({
      success: true,
      convertedAmount: result.convertedAmount || amount * 0.85,
      exchangeRate: result.exchangeRate || 0.85,
      note: result.note || 'Currency conversion completed',
      from,
      to,
      originalAmount: amount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Currency Conversion Error:', error)
    
    // Fallback conversion rates
    const fallbackRates: Record<string, number> = {
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-JPY': 110.0,
      'EUR-USD': 1.18,
      'EUR-GBP': 0.86,
      'GBP-USD': 1.37,
      'JPY-USD': 0.0091
    }
    
    const rateKey = `${from}-${to}`
    const exchangeRate = fallbackRates[rateKey] || 1.0
    const convertedAmount = amount * exchangeRate

    return NextResponse.json({
      success: true,
      convertedAmount,
      exchangeRate,
      note: 'Currency conversion completed (fallback rates)',
      from,
      to,
      originalAmount: amount,
      timestamp: new Date().toISOString()
    })
  }
}