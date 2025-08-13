import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ValidationResult {
  isValid: boolean;
  cardType: string;
  network: string;
  isTestCard: boolean;
  checksumValid: boolean;
  formattedNumber: string;
  lastFourDigits: string;
  bin: string;
  country?: string;
  bank?: string;
}

interface CardPattern {
  pattern: RegExp;
  type: string;
  network: string;
  lengths: number[];
}

const CARD_PATTERNS: CardPattern[] = [
  // Visa
  { pattern: /^4[0-9]{12}(?:[0-9]{3})?$/, type: 'Visa', network: 'Visa', lengths: [13, 16] },
  // MasterCard
  { pattern: /^5[1-5][0-9]{14}$/, type: 'MasterCard', network: 'MasterCard', lengths: [16] },
  { pattern: /^2[2-7][0-9]{14}$/, type: 'MasterCard', network: 'MasterCard', lengths: [16] },
  // American Express
  { pattern: /^3[47][0-9]{13}$/, type: 'American Express', network: 'American Express', lengths: [15] },
  // Discover
  { pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/, type: 'Discover', network: 'Discover', lengths: [16] },
  { pattern: /^64[4-9][0-9]{13}$/, type: 'Discover', network: 'Discover', lengths: [16] },
  { pattern: /^65[0-9]{14}$/, type: 'Discover', network: 'Discover', lengths: [16] },
  // JCB
  { pattern: /^35(?:2[89]|[3-8][0-9])[0-9]{12}$/, type: 'JCB', network: 'JCB', lengths: [16] },
  // Diners Club
  { pattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/, type: 'Diners Club', network: 'Diners Club', lengths: [14] },
  // China UnionPay
  { pattern: /^62[0-9]{14,17}$/, type: 'UnionPay', network: 'UnionPay', lengths: [16, 17, 18, 19] },
  // Maestro
  { pattern: /^(5018|5020|5038|5893|6304|6759|6761|6762|6763)[0-9]{8,15}$/, type: 'Maestro', network: 'Maestro', lengths: [12, 13, 14, 15, 16, 17, 18, 19] },
];

const TEST_CARDS = [
  '4111111111111111', // Visa
  '4242424242424242', // Visa
  '5555555555554444', // MasterCard
  '378282246310005',  // American Express
  '6011111111111117', // Discover
  '3530111333300000', // JCB
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardNumber } = body;

    if (!cardNumber || typeof cardNumber !== 'string') {
      return NextResponse.json(
        { error: 'Card number is required and must be a string' },
        { status: 400 }
      );
    }

    // Clean the card number
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    if (!/^\d+$/.test(cleanNumber)) {
      return NextResponse.json(
        { error: 'Card number must contain only digits' },
        { status: 400 }
      );
    }

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return NextResponse.json(
        { error: 'Card number must be between 13 and 19 digits' },
        { status: 400 }
      );
    }

    // Validate using Luhn algorithm
    const checksumValid = validateLuhn(cleanNumber);
    
    // Identify card type
    const cardInfo = identifyCardType(cleanNumber);
    
    // Check if it's a test card
    const isTestCard = TEST_CARDS.includes(cleanNumber);
    
    // Format the number
    const formattedNumber = formatCardNumber(cleanNumber);
    
    const result: ValidationResult = {
      isValid: checksumValid && cardInfo !== null,
      cardType: cardInfo?.type || 'Unknown',
      network: cardInfo?.network || 'Unknown',
      isTestCard,
      checksumValid,
      formattedNumber,
      lastFourDigits: cleanNumber.slice(-4),
      bin: cleanNumber.slice(0, 6),
    };

    // Try to get additional information using AI
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a credit card security expert. Provide brief insights about card validation and security best practices.'
          },
          {
            role: 'user',
            content: `Analyze this credit card validation result: ${JSON.stringify(result, null, 2)}. 
            Provide insights about:
            1. The validation process
            2. Security considerations
            3. Best practices for handling card numbers
            Keep it concise and informative.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      aiInsights = completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
      aiInsights = 'AI analysis unavailable';
    }

    return NextResponse.json({
      result,
      aiInsights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Credit card validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during card validation' },
      { status: 500 }
    );
  }
}

function validateLuhn(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function identifyCardType(cardNumber: string): CardPattern | null {
  for (const pattern of CARD_PATTERNS) {
    if (pattern.pattern.test(cardNumber) && pattern.lengths.includes(cardNumber.length)) {
      return pattern;
    }
  }
  return null;
}

function formatCardNumber(cardNumber: string): string {
  const groups = [];
  const length = cardNumber.length;
  
  // American Express format: 4-6-5
  if (length === 15) {
    groups.push(cardNumber.slice(0, 4));
    groups.push(cardNumber.slice(4, 10));
    groups.push(cardNumber.slice(10, 15));
  } 
  // Standard format: 4-4-4-4
  else {
    for (let i = 0; i < length; i += 4) {
      groups.push(cardNumber.slice(i, i + 4));
    }
  }
  
  return groups.join(' ');
}