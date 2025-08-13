import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      length = 12,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false,
      quantity = 1
    } = body;

    // Input validation
    if (length < 4 || length > 128) {
      return NextResponse.json(
        { error: 'Password length must be between 4 and 128 characters' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      return NextResponse.json(
        { error: 'At least one character type must be selected' },
        { status: 400 }
      );
    }

    // Define character sets
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Similar characters: 0,O,l,I,1
    const similarChars = '01IlO';
    
    // Ambiguous characters: {}[]()/\\'"`~,;.<>
    const ambiguousChars = '{}[]()/\\\'"`~,;.<>';

    // Build character pool
    let charPool = '';
    if (includeUppercase) charPool += uppercase;
    if (includeLowercase) charPool += lowercase;
    if (includeNumbers) charPool += numbers;
    if (includeSymbols) charPool += symbols;

    // Remove similar and ambiguous characters if requested
    if (excludeSimilar) {
      charPool = charPool.split('').filter(char => !similarChars.includes(char)).join('');
    }
    if (excludeAmbiguous) {
      charPool = charPool.split('').filter(char => !ambiguousChars.includes(char)).join('');
    }

    if (charPool.length === 0) {
      return NextResponse.json(
        { error: 'No characters available for password generation with current settings' },
        { status: 400 }
      );
    }

    // Generate passwords
    const passwords = [];
    for (let i = 0; i < quantity; i++) {
      let password = '';
      
      // Ensure at least one character from each selected type
      const requiredChars = [];
      if (includeUppercase) {
        const uppercasePool = excludeSimilar ? 
          uppercase.split('').filter(char => !similarChars.includes(char)).join('') : 
          uppercase;
        if (uppercasePool) {
          requiredChars.push(uppercasePool[crypto.randomInt(uppercasePool.length)]);
        }
      }
      if (includeLowercase) {
        const lowercasePool = excludeSimilar ? 
          lowercase.split('').filter(char => !similarChars.includes(char)).join('') : 
          lowercase;
        if (lowercasePool) {
          requiredChars.push(lowercasePool[crypto.randomInt(lowercasePool.length)]);
        }
      }
      if (includeNumbers) {
        const numbersPool = excludeSimilar ? 
          numbers.split('').filter(char => !similarChars.includes(char)).join('') : 
          numbers;
        if (numbersPool) {
          requiredChars.push(numbersPool[crypto.randomInt(numbersPool.length)]);
        }
      }
      if (includeSymbols) {
        const symbolsPool = excludeAmbiguous ? 
          symbols.split('').filter(char => !ambiguousChars.includes(char)).join('') : 
          symbols;
        if (symbolsPool) {
          requiredChars.push(symbolsPool[crypto.randomInt(symbolsPool.length)]);
        }
      }

      // Fill remaining length with random characters
      const remainingLength = length - requiredChars.length;
      for (let j = 0; j < remainingLength; j++) {
        password += charPool[crypto.randomInt(charPool.length)];
      }

      // Add required characters and shuffle
      password += requiredChars.join('');
      password = password.split('').sort(() => crypto.randomInt(2) - 1).join('');
      
      passwords.push(password);
    }

    // Calculate password strength
    const calculateStrength = (password: string) => {
      let score = 0;
      let feedback = [];

      // Length score
      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;
      if (password.length >= 16) score += 1;

      // Character variety score
      if (/[a-z]/.test(password)) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^a-zA-Z0-9]/.test(password)) score += 1;

      // Deductions for common patterns
      if (/(.)\1{2,}/.test(password)) {
        score -= 1;
        feedback.push('Avoid repeated characters');
      }
      if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
        score -= 1;
        feedback.push('Avoid sequential characters');
      }

      let strength = 'Weak';
      if (score >= 6) strength = 'Very Strong';
      else if (score >= 4) strength = 'Strong';
      else if (score >= 2) strength = 'Medium';

      return { strength, score, feedback };
    };

    const passwordAnalysis = passwords.map(calculateStrength);

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert. Analyze the password generation parameters and provide security recommendations.'
          },
          {
            role: 'user',
            content: `Generated ${quantity} passwords with length ${length}, including: uppercase=${includeUppercase}, lowercase=${includeLowercase}, numbers=${includeNumbers}, symbols=${includeSymbols}, excludeSimilar=${excludeSimilar}, excludeAmbiguous=${excludeAmbiguous}. Provide security analysis and recommendations.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    return NextResponse.json({
      success: true,
      passwords,
      analysis: passwordAnalysis,
      settings: {
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeSimilar,
        excludeAmbiguous,
        quantity
      },
      aiInsights
    });

  } catch (error) {
    console.error('Password generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate passwords' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Password Generator API',
    usage: 'POST /api/security-tools/password-generator',
    parameters: {
      length: 'Password length (4-128, default: 12) - optional',
      includeUppercase: 'Include uppercase letters (default: true) - optional',
      includeLowercase: 'Include lowercase letters (default: true) - optional',
      includeNumbers: 'Include numbers (default: true) - optional',
      includeSymbols: 'Include symbols (default: true) - optional',
      excludeSimilar: 'Exclude similar characters (0,O,l,I,1) (default: false) - optional',
      excludeAmbiguous: 'Exclude ambiguous characters ({})[]()/\\\'"`~,;.<>) (default: false) - optional',
      quantity: 'Number of passwords to generate (1-100, default: 1) - optional'
    },
    example: {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      quantity: 5
    }
  });
}